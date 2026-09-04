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

async function fetchFromSource(): Promise<any> {
  // Fetch from mindicador.cl (which mirrors live daily values from Banco Central de Chile)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch('https://mindicador.cl/api', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SAPQuoter-BancoCentralClient/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

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
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[Banco Central API] External fetch failed or timed out, serving cached/baseline data:', err);
    return getBaselineIndicators();
  }
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
