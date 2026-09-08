import React, { useState, useMemo, useRef } from 'react';
import { ProjectPlan, MilestoneItem } from '../../types';
import { GanttTimelineView } from './GanttTimelineView';
import { GanttStageEditor } from './GanttStageEditor';
import { computeGanttStages, buildTimelineBounds } from '../../utils/ganttDateUtils';
import {
  Calendar,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Sparkles,
  Download,
} from 'lucide-react';
import { toJpeg } from 'html-to-image';

interface GanttModuleProps {
  plan: ProjectPlan;
  onChangePlan: (updated: ProjectPlan) => void;
  onSyncMilestones?: (milestones: MilestoneItem[]) => void;
  readOnly?: boolean;
}

export const GanttModule: React.FC<GanttModuleProps> = ({
  plan,
  onChangePlan,
  onSyncMilestones,
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'editor' | 'split'>('timeline');
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle');

  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Compute stages and visual bounds
  const computed = useMemo(() => {
    const res = computeGanttStages(
      plan.stages,
      plan.settings.startDate,
      plan.settings.calendar,
      plan.settings.presentationWindow
    );
    const bounds = buildTimelineBounds(res.minDate, res.maxDate, res.totalDays);
    return {
      computedStages: res.computedStages,
      bounds,
      minDate: res.minDate,
      maxDate: res.maxDate,
      totalDays: res.totalDays,
    };
  }, [plan]);

  // Export / Copy to Clipboard
  const handleCopyImage = async () => {
    if (!timelineRef.current) return;
    setCopyStatus('copying');
    try {
      const dataUrl = await toJpeg(timelineRef.current, {
        quality: 0.95,
        backgroundColor: '#FFFFFF',
      });

      // Fetch blob and copy to clipboard if supported
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
        setCopyStatus('copied');
      } else {
        // Fallback: download the image
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `Gantt_${plan.settings.title.replace(/\s+/g, '_')}.jpg`;
        a.click();
        setCopyStatus('copied');
      }
    } catch (e) {
      console.error('Error copying Gantt image:', e);
      setCopyStatus('idle');
    } finally {
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const handleDownloadImage = async () => {
    if (!timelineRef.current) return;
    try {
      const dataUrl = await toJpeg(timelineRef.current, {
        quality: 0.96,
        backgroundColor: '#FFFFFF',
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Gantt_${plan.settings.title.replace(/\s+/g, '_')}.jpg`;
      a.click();
    } catch (e) {
      console.error('Error downloading image:', e);
    }
  };

  return (
    <div
      className={`space-y-4 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-900/90 p-4 sm:p-8 flex flex-col overflow-y-auto backdrop-blur-xs'
          : ''
      }`}
    >
      {/* Module Header & View Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Planificación Ejecutiva Gantt SAP</span>
              <span className="text-[10px] font-normal px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Submódulo Cotizador
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Cronograma a alto nivel con eventos clave, cálculo de días hábiles y festivos legales.
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!readOnly && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Vista Gantt
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Editar Fases ({plan.stages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`hidden md:inline-flex px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'split'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-1" />
                Ambas Vistas
              </button>
            </div>
          )}

          {/* Quick Copy / Download */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyImage}
              disabled={copyStatus === 'copying'}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Copiar imagen de la carta Gantt al portapapeles para pegar en PowerPoint o diapositivas"
            >
              {copyStatus === 'copied' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>Copiar Imagen</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Descargar imagen JPG de la carta Gantt"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Modo Presentación Pantalla Completa'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area based on activeTab */}
      <div className={isFullscreen ? 'flex-1 overflow-y-auto space-y-4' : 'space-y-4'}>
        {/* Split View */}
        {activeTab === 'split' && !readOnly && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Editor de Fases y Parámetros
              </h5>
              <GanttStageEditor
                plan={plan}
                computedStages={computed.computedStages}
                onUpdatePlan={onChangePlan}
                selectedStageId={selectedStageId}
                onSelectStage={setSelectedStageId}
                onSyncMilestonesWithQuote={onSyncMilestones}
              />
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Previsualización Ejecutiva en Vivo
              </h5>
              <GanttTimelineView
                plan={plan}
                computedStages={computed.computedStages}
                bounds={computed.bounds}
                timelineContainerRef={timelineRef}
                selectedStageId={selectedStageId}
                onSelectStage={setSelectedStageId}
                onUpdatePlan={onChangePlan}
              />
            </div>
          </div>
        )}

        {/* Timeline View */}
        {(activeTab === 'timeline' || readOnly) && (
          <div className="space-y-3">
            <GanttTimelineView
              plan={plan}
              computedStages={computed.computedStages}
              bounds={computed.bounds}
              timelineContainerRef={timelineRef}
              selectedStageId={selectedStageId}
              onSelectStage={setSelectedStageId}
              onUpdatePlan={readOnly ? undefined : onChangePlan}
            />

            {!readOnly && (
              <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Para modificar las fases, duraciones, fechas fijas o hitos, usa la pestaña <strong>Editar Fases</strong>. Esta planificación se incluirá en el PDF del cliente.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Abrir Editor
                </button>
              </div>
            )}
          </div>
        )}

        {/* Editor View */}
        {activeTab === 'editor' && !readOnly && (
          <GanttStageEditor
            plan={plan}
            computedStages={computed.computedStages}
            onUpdatePlan={onChangePlan}
            selectedStageId={selectedStageId}
            onSelectStage={setSelectedStageId}
            onSyncMilestonesWithQuote={onSyncMilestones}
          />
        )}
      </div>
    </div>
  );
};
