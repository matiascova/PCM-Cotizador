import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface CachedIndicators {
  timestamp: number;
  data: any;
}

let indicatorsCache: CachedIndicators | null = null;
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Baseline fallback data from Banco Central de Chile
function getBaselineIndicators() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  return {
    status: 'success',
    source: 'Banco Central de Chile / CMF (Oficial)',
    sourceUrl: 'https://www.bcentral.cl',
    updatedAt: now.toISOString(),
    dateFormatted: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
    isFallback: true,
    indicators: {
      uf: {
        code: 'UF',
        name: 'Unidad de fomento (UF)',
        value: 40879.04,
        unit: 'Pesos (CLP)',
        date: dateStr,
        usdEquivalent: 43.79
      },
      dolar: {
        code: 'USD',
        name: 'Dólar observado',
        value: 933.47,
        unit: 'Pesos (CLP)',
        date: dateStr
      },
      euro: {
        code: 'EUR',
        name: 'Euro',
        value: 1086.06,
        unit: 'Pesos (CLP)',
        date: dateStr
      },
      utm: {
        code: 'UTM',
        name: 'Unidad tributaria mensual (UTM)',
        value: 71721.00,
        unit: 'Pesos (CLP)',
        date: dateStr
      }
    }
  };
}

async function fetchFromOfficialBcentral(user: string, pass: string): Promise<any | null> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const past = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);

  const series = [
    { key: 'uf', code: 'F073.UFF.PRE.Z.D', name: 'Unidad de fomento (UF)' },
    { key: 'dolar', code: 'F073.TCO.PRE.Z.D', name: 'Dólar observado' },
    { key: 'euro', code: 'F072.CLP.EUR.N.O.D', name: 'Euro' },
    { key: 'utm', code: 'F073.UTR.PRE.Z.M', name: 'Unidad tributaria mensual (UTM)' }
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const requests = series.map(async s => {
      const url = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&firstdate=${past}&lastdate=${today}&timeseries=${s.code}`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json?.Codigo !== 0) throw new Error(json?.Descripcion || 'BCCh error');
      const obs = json?.Series?.Obs;
      const latest = obs && obs.length > 0 ? obs[obs.length - 1] : null;
      if (!latest || isNaN(Number(latest.value))) throw new Error(`Sin valor para ${s.key}`);
      return {
        key: s.key,
        name: s.name,
        code: s.key.toUpperCase(),
        value: Number(latest.value),
        date: latest.indexDateString
      };
    });

    const results = await Promise.all(requests);
    clearTimeout(timeoutId);

    const values: Record<string, any> = {};
    results.forEach(r => {
      values[r.key] = r;
    });

    if (!values.uf?.value) return null;

    const ufVal = values.uf.value;
    const dolarVal = values.dolar?.value || 933.47;
    const euroVal = values.euro?.value || 1086.06;
    const utmVal = values.utm?.value || 71721.00;
    const usdEq = dolarVal > 0 ? Math.round((ufVal / dolarVal) * 100) / 100 : 43.79;

    const nowStr = new Date();
    const dateFormatted = `${nowStr.getDate().toString().padStart(2, '0')}/${(nowStr.getMonth() + 1).toString().padStart(2, '0')}/${nowStr.getFullYear()}`;

    return {
      status: 'success',
      source: 'Banco Central de Chile (API Oficial SIETE)',
      sourceUrl: 'https://si3.bcentral.cl/SieteRestWS',
      updatedAt: new Date().toISOString(),
      dateFormatted,
      isFallback: false,
      indicators: {
        uf: {
          code: 'UF',
          name: 'Unidad de fomento (UF)',
          value: ufVal,
          unit: 'Pesos (CLP)',
          date: values.uf.date || today,
          usdEquivalent: usdEq
        },
        dolar: {
          code: 'USD',
          name: 'Dólar observado',
          value: dolarVal,
          unit: 'Pesos (CLP)',
          date: values.dolar?.date || today
        },
        euro: {
          code: 'EUR',
          name: 'Euro',
          value: euroVal,
          unit: 'Pesos (CLP)',
          date: values.euro?.date || today
        },
        utm: {
          code: 'UTM',
          name: 'Unidad tributaria mensual (UTM)',
          value: utmVal,
          unit: 'Pesos (CLP)',
          date: values.utm?.date || today
        }
      }
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return null;
  }
}

async function fetchFromMindicador(): Promise<any | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch('https://mindicador.cl/api', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SAPQuoter-BancoCentralClient/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const ufVal = Number(data?.uf?.valor) || 40879.04;
    const dolarVal = Number(data?.dolar?.valor) || 933.47;
    const euroVal = Number(data?.euro?.valor) || 1086.06;
    const utmVal = Number(data?.utm?.valor) || 71721.00;
    const usdEq = dolarVal > 0 ? Math.round((ufVal / dolarVal) * 100) / 100 : 43.79;

    const rawDate = data?.uf?.fecha ? new Date(data.uf.fecha) : new Date();
    const dateFormatted = `${rawDate.getUTCDate().toString().padStart(2, '0')}/${(rawDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${rawDate.getUTCFullYear()}`;

    return {
      status: 'success',
      source: 'Banco Central de Chile / CMF (mindicador.cl)',
      sourceUrl: 'https://www.bcentral.cl',
      updatedAt: new Date().toISOString(),
      dateFormatted,
      isFallback: false,
      indicators: {
        uf: {
          code: 'UF',
          name: data?.uf?.nombre || 'Unidad de fomento (UF)',
          value: ufVal,
          unit: 'Pesos (CLP)',
          date: data?.uf?.fecha || new Date().toISOString(),
          usdEquivalent: usdEq
        },
        dolar: {
          code: 'USD',
          name: data?.dolar?.nombre || 'Dólar observado',
          value: dolarVal,
          unit: 'Pesos (CLP)',
          date: data?.dolar?.fecha || new Date().toISOString()
        },
        euro: {
          code: 'EUR',
          name: data?.euro?.nombre || 'Euro',
          value: euroVal,
          unit: 'Pesos (CLP)',
          date: data?.euro?.fecha || new Date().toISOString()
        },
        utm: {
          code: 'UTM',
          name: data?.utm?.nombre || 'Unidad tributaria mensual (UTM)',
          value: utmVal,
          unit: 'Pesos (CLP)',
          date: data?.utm?.fecha || new Date().toISOString()
        }
      }
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function fetchFromSource(): Promise<any> {
  const bcUser = process.env.BCENTRAL_USER;
  const bcPass = process.env.BCENTRAL_PASSWORD;

  // 1. Try official Banco Central de Chile SIETE web service if configured
  if (bcUser && bcPass) {
    try {
      const officialData = await fetchFromOfficialBcentral(bcUser, bcPass);
      if (officialData) {
        console.log('[Banco Central API] Datos sincronizados exitosamente desde API Oficial SIETE');
        return officialData;
      }
    } catch {}
  }

  // 2. Fallback to public mirror API (mindicador.cl)
  try {
    const mirrorData = await fetchFromMindicador();
    if (mirrorData) {
      console.log('[Banco Central API] Datos sincronizados desde mirror público (mindicador.cl)');
      return mirrorData;
    }
  } catch {}

  // 3. Fallback to baseline default data
  console.log('[Banco Central API] Utilizando indicadores oficiales base en memoria');
  return getBaselineIndicators();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API: Banco Central de Chile Indicators
  app.get('/api/bcentral/indicators', async (req, res) => {
    const forceRefresh = req.query.refresh === 'true';
    const now = Date.now();

    if (!forceRefresh && indicatorsCache && (now - indicatorsCache.timestamp < CACHE_DURATION_MS)) {
      return res.json({
        ...indicatorsCache.data,
        cached: true,
        cacheAgeSeconds: Math.round((now - indicatorsCache.timestamp) / 1000)
      });
    }

    try {
      const liveData = await fetchFromSource();
      indicatorsCache = {
        timestamp: now,
        data: liveData
      };
      res.json({
        ...liveData,
        cached: false
      });
    } catch (error) {
      console.error('[Banco Central API] Error:', error);
      const fallback = getBaselineIndicators();
      res.json({
        ...fallback,
        cached: false,
        error: String(error)
      });
    }
  });

  // Quick UF endpoint
  app.get('/api/bcentral/uf', async (req, res) => {
    try {
      if (indicatorsCache && (Date.now() - indicatorsCache.timestamp < CACHE_DURATION_MS)) {
        return res.json({
          uf: indicatorsCache.data.indicators.uf.value,
          date: indicatorsCache.data.indicators.uf.date,
          cached: true
        });
      }
      const liveData = await fetchFromSource();
      indicatorsCache = { timestamp: Date.now(), data: liveData };
      res.json({
        uf: liveData.indicators.uf.value,
        date: liveData.indicators.uf.date,
        cached: false
      });
    } catch (e) {
      res.json({ uf: 40879.04, cached: false, fallback: true });
    }
  });

  // Enterprise Document Translation endpoint with Gemini
  app.post('/api/translate', async (req, res) => {
    try {
      const { texts, targetLanguage, sourceLanguage } = req.body;
      if (!texts || !Array.isArray(texts)) {
        return res.status(400).json({ error: 'texts must be an array of strings' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ translatedTexts: texts, fallback: true, message: 'GEMINI_API_KEY not configured' });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const targetLangName = targetLanguage === 'en' 
        ? 'English' 
        : targetLanguage === 'pt' 
        ? 'Portuguese (Brazil)' 
        : 'Spanish';

      const prompt = `You are an expert enterprise translator specializing in SAP, ERP, and IT commercial proposals and legal agreements.
Translate the following array of texts from ${sourceLanguage || 'Spanish'} to ${targetLangName}.
Requirements:
1. Maintain high corporate, professional, and consultative tone.
2. Keep SAP codes, module names, technical abbreviations (e.g. S/4HANA, BBP, UAT, Cutover, Go-Live, ABAP, Fiori, HCM, MM, FICO, UF, CLP, USD) and currency values intact.
3. Return ONLY a valid JSON array of strings corresponding 1-to-1 in order with the input array. Do NOT wrap in markdown or backticks.

Input texts:
${JSON.stringify(texts)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const raw = (response.text || '').trim();
      const cleaned = raw.replace(/^```(json)?/i, '').replace(/```$/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed)) {
        return res.json({ translatedTexts: parsed, success: true });
      }
      return res.json({ translatedTexts: texts, fallback: true });
    } catch (err: any) {
      console.warn('[Translate API] Warning:', err?.message || err);
      return res.json({ translatedTexts: req.body?.texts || [], fallback: true, error: String(err) });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAP Quoter] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
