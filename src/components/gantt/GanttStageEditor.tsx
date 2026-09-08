import React, { useState } from 'react';
import {
  ProjectPlan,
  Stage,
  ComputedStage,
  DurationUnit,
  StartType,
  MilestoneIconType,
  CountryCode,
  MilestoneItem,
} from '../../types';
import { GANTT_COLOR_THEMES, GANTT_TEMPLATES } from '../../data/ganttTemplates';
import { COUNTRIES } from '../../utils/ganttHolidayUtils';
import { formatPresentationDate } from '../../utils/ganttDateUtils';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Flag,
  Rocket,
  CheckCircle2,
  Target,
  Sparkles,
  Calendar,
  Layers,
  Palette,
  Coffee,
  Copy,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GanttStageEditorProps {
  plan: ProjectPlan;
  computedStages: ComputedStage[];
  onUpdatePlan: (updated: ProjectPlan) => void;
  selectedStageId?: string | null;
  onSelectStage?: (id: string | null) => void;
  onSyncMilestonesWithQuote?: (milestones: MilestoneItem[]) => void;
}

export const GanttStageEditor: React.FC<GanttStageEditorProps> = ({
  plan,
  computedStages,
  onUpdatePlan,
  selectedStageId,
  onSelectStage,
  onSyncMilestonesWithQuote,
}) => {
  const [showCalendarConfig, setShowCalendarConfig] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [syncSuccessNotice, setSyncSuccessNotice] = useState(false);

  const handleUpdateStage = (stageId: string, updates: Partial<Stage>) => {
    const newStages = plan.stages.map((s) =>
      s.id === stageId ? { ...s, ...updates } : s
    );
    onUpdatePlan({
      ...plan,
      stages: newStages,
    });
  };

  const handleAddStage = () => {
    const newId = `stg-${Date.now()}`;
    const newStage: Stage = {
      id: newId,
      name: `Nueva Fase ${plan.stages.length + 1}`,
      duration: 2,
      durationUnit: 'weeks',
      startType: 'sequential',
      isMilestone: false,
      responsible: 'Equipo Consultor SAP',
      notes: '',
    };
    onUpdatePlan({
      ...plan,
      stages: [...plan.stages, newStage],
    });
    if (onSelectStage) onSelectStage(newId);
  };

  const handleDeleteStage = (stageId: string) => {
    if (plan.stages.length <= 1) return;
    const newStages = plan.stages.filter((s) => s.id !== stageId);
    onUpdatePlan({
      ...plan,
      stages: newStages,
    });
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= plan.stages.length) return;

    const updated = [...plan.stages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    onUpdatePlan({
      ...plan,
      stages: updated,
    });
  };

  const handleDuplicateStage = (stage: Stage) => {
    const newStage: Stage = {
      ...stage,
      id: `stg-${Date.now()}`,
      name: `${stage.name} (Copia)`,
    };
    const index = plan.stages.findIndex((s) => s.id === stage.id);
    const updated = [...plan.stages];
    updated.splice(index + 1, 0, newStage);
    onUpdatePlan({
      ...plan,
      stages: updated,
    });
  };

  const handleLoadTemplate = (templateId: string) => {
    const tmpl = GANTT_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    onUpdatePlan({
      settings: {
        ...plan.settings,
        title: plan.settings.title || tmpl.plan.settings.title,
        subtitle: tmpl.plan.settings.subtitle,
        companyOrArea: tmpl.plan.settings.companyOrArea,
      },
      stages: JSON.parse(JSON.stringify(tmpl.plan.stages)),
    });
    setShowTemplatesModal(false);
  };

  // Convert Gantt stages to Quotation payment milestones
  const handleSyncToQuoteMilestones = () => {
    if (!onSyncMilestonesWithQuote) return;

    const stagesCount = plan.stages.length;
    if (stagesCount === 0) return;

    // Distribute 100% across stages (or give standard milestone distribution)
    const basePct = Math.floor(100 / stagesCount);
    const remainder = 100 - basePct * stagesCount;

    const newMilestones: MilestoneItem[] = computedStages.map((cs, idx) => {
      const pct = idx === stagesCount - 1 ? basePct + remainder : basePct;
      const weekLabel = `Sem. ${Math.round(cs.startDayOffset / 7) + 1} - ${
        Math.round((cs.startDayOffset + cs.durationDays) / 7) + 1
      }`;

      return {
        id: `milestone-${Date.now()}-${idx}`,
        title: cs.name,
        description: cs.notes || `Fase: ${cs.name} (${cs.duration} ${cs.durationUnit === 'weeks' ? 'semanas' : 'días'})`,
        deliverables: cs.isMilestone
          ? 'Salida en Productivo (Go-Live) y Entrega Final'
          : `Acta de Aprobación de Fase y Entregables Asociados`,
        estimatedWeek: weekLabel,
        paymentPercentage: pct,
      };
    });

    onSyncMilestonesWithQuote(newMilestones);
    setSyncSuccessNotice(true);
    setTimeout(() => setSyncSuccessNotice(false), 4000);
  };

  // Summary Metrics
  const totalWeeks = computedStages.reduce(
    (acc, s) => acc + (s.durationUnit === 'weeks' ? s.duration : s.duration / 5),
    0
  );
  const finalStage = computedStages[computedStages.length - 1];
  const targetGoLiveDate = finalStage
    ? formatPresentationDate(finalStage.computedEndDate, true)
    : '-';

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Load SAP Template Button */}
          <button
            type="button"
            onClick={() => setShowTemplatesModal(true)}
            className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Cargar Plantilla SAP</span>
          </button>

          {/* Calendar & Holidays Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowCalendarConfig(!showCalendarConfig)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showCalendarConfig
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Calendario & Festivos</span>
            {showCalendarConfig ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs">
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={plan.settings.themeId}
              onChange={(e) =>
                onUpdatePlan({
                  ...plan,
                  settings: {
                    ...plan.settings,
                    themeId: e.target.value,
                  },
                })
              }
              className="font-medium bg-transparent border-0 text-slate-700 focus:ring-0 cursor-pointer pr-1 py-0 text-xs"
            >
              {GANTT_COLOR_THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sync Milestones with Quotation */}
        {onSyncMilestonesWithQuote && (
          <div className="flex items-center gap-2">
            {syncSuccessNotice && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> ¡Hitos de pago sincronizados!
              </span>
            )}
            <button
              type="button"
              onClick={handleSyncToQuoteMilestones}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Genera o actualiza los hitos de pago comerciales de la cotización según estas fases Gantt"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sincronizar con Hitos de Pago</span>
            </button>
          </div>
        )}
      </div>

      {/* Calendar & Holiday Config Dropdown Panel */}
      {showCalendarConfig && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700" />
              Parámetros de Calendario Laboral y Feriados
            </h4>
            <span className="text-[11px] text-amber-800">
              Las fechas se calculan sumando exclusivamente días hábiles reales.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Country Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                País del Proyecto (Festivos Oficiales):
              </label>
              <select
                value={plan.settings.calendar.country}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    settings: {
                      ...plan.settings,
                      calendar: {
                        ...plan.settings.calendar,
                        country: e.target.value as CountryCode,
                      },
                    },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Working Days Per Week */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Jornada Laboral Semanal:
              </label>
              <select
                value={plan.settings.calendar.workingDaysPerWeek}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    settings: {
                      ...plan.settings,
                      calendar: {
                        ...plan.settings.calendar,
                        workingDaysPerWeek: Number(e.target.value) as 5 | 6 | 7,
                      },
                    },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
              >
                <option value={5}>5 días (Lunes a Viernes - Estándar)</option>
                <option value={6}>6 días (Lunes a Sábado)</option>
                <option value={7}>7 días (Corrido sin fines de semana)</option>
              </select>
            </div>

            {/* Holiday Toggle */}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={plan.settings.calendar.includeHolidays}
                  onChange={(e) =>
                    onUpdatePlan({
                      ...plan,
                      settings: {
                        ...plan.settings,
                        calendar: {
                          ...plan.settings.calendar,
                          includeHolidays: e.target.checked,
                        },
                      },
                    })
                  }
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Excluir festivos oficiales del calendario
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Duración Total</div>
            <div className="font-bold text-slate-900 text-sm">
              ~{totalWeeks.toFixed(1)} sem <span className="text-[11px] text-slate-500 font-normal">({(totalWeeks / 4.3).toFixed(1)} meses)</span>
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Go-Live Estimado</div>
            <div className="font-bold text-slate-900 text-sm truncate" title={targetGoLiveDate}>
              {targetGoLiveDate}
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Fases</div>
            <div className="font-bold text-slate-900 text-sm">
              {plan.stages.length} etapas
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Calendario</div>
            <div className="font-bold text-slate-900 text-sm truncate">
              {COUNTRIES.find((c) => c.code === plan.settings.calendar.country)?.flag}{' '}
              {COUNTRIES.find((c) => c.code === plan.settings.calendar.country)?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Stages Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Secuencia de Fases y Entregables del Proyecto ({plan.stages.length})
            </h4>
          </div>
          <button
            type="button"
            onClick={handleAddStage}
            className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Fase</span>
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {plan.stages.map((stage, idx) => {
            const computed = computedStages.find((cs) => cs.id === stage.id);
            const isSelected = selectedStageId === stage.id;

            return (
              <div
                key={stage.id}
                onClick={() => onSelectStage && onSelectStage(stage.id)}
                className={`p-3.5 transition-colors ${
                  isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  {/* Left: Reorder & Number & Name */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveStage(idx, 'up');
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === plan.stages.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveStage(idx, 'down');
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-bold text-slate-400 text-xs w-5 text-center">
                      #{idx + 1}
                    </span>

                    {/* Milestone Star Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStage(stage.id, {
                          isMilestone: !stage.isMilestone,
                          milestoneIcon: !stage.isMilestone ? 'star' : undefined,
                        });
                      }}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        stage.isMilestone
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={
                        stage.isMilestone
                          ? 'Fase marcada como Hito Crítico / Go-Live'
                          : 'Marcar como Hito Crítico'
                      }
                    >
                      <Star
                        className={`w-4 h-4 ${
                          stage.isMilestone ? 'fill-amber-400 text-amber-600' : ''
                        }`}
                      />
                    </button>

                    {/* Stage Name Input */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) =>
                          handleUpdateStage(stage.id, { name: e.target.value })
                        }
                        placeholder="Nombre de la fase o hito..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Middle: Duration & Unit & Dates */}
                  <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto justify-end">
                    {/* Duration input */}
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={stage.duration}
                        onChange={(e) =>
                          handleUpdateStage(stage.id, {
                            duration: Math.max(0.5, Number(e.target.value) || 1),
                          })
                        }
                        className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center font-bold text-xs"
                      />
                      <select
                        value={stage.durationUnit}
                        onChange={(e) =>
                          handleUpdateStage(stage.id, {
                            durationUnit: e.target.value as DurationUnit,
                          })
                        }
                        className="bg-transparent border-0 font-semibold text-slate-700 text-xs focus:ring-0 p-0 cursor-pointer"
                      >
                        <option value="weeks">semanas</option>
                        <option value="days">días hábiles</option>
                      </select>
                    </div>

                    {/* Start type selector */}
                    <select
                      value={stage.startType}
                      onChange={(e) =>
                        handleUpdateStage(stage.id, {
                          startType: e.target.value as StartType,
                        })
                      }
                      className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium"
                    >
                      <option value="sequential">Consecutivo (Auto)</option>
                      <option value="custom_date">Fecha Fija</option>
                      <option value="offset">Desfase (Offset)</option>
                    </select>

                    {/* Calculated Dates Badge */}
                    {computed && (
                      <div className="hidden lg:flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <span>{formatPresentationDate(computed.computedStartDate)}</span>
                        <span>→</span>
                        <span className="font-bold text-blue-700">
                          {formatPresentationDate(computed.computedEndDate)}
                        </span>
                      </div>
                    )}

                    {/* Duplicate & Delete Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateStage(stage);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                        title="Duplicar etapa"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={plan.stages.length <= 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStage(stage.id);
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
                        title="Eliminar etapa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Fixed Date Inputs if startType === 'custom_date' */}
                {stage.startType === 'custom_date' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs bg-slate-50/70 p-2 rounded-lg">
                    <span className="font-bold text-slate-600">Rango de Fechas Fijas:</span>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] text-slate-500">Desde:</label>
                      <input
                        type="date"
                        value={stage.customStartDate || ''}
                        onChange={(e) =>
                          handleUpdateStage(stage.id, {
                            customStartDate: e.target.value,
                          })
                        }
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] text-slate-500">Hasta:</label>
                      <input
                        type="date"
                        value={stage.customEndDate || ''}
                        onChange={(e) =>
                          handleUpdateStage(stage.id, {
                            customEndDate: e.target.value,
                          })
                        }
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Responsible & Notes */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={stage.responsible || ''}
                    onChange={(e) =>
                      handleUpdateStage(stage.id, { responsible: e.target.value })
                    }
                    placeholder="Responsable (ej. Project Manager, Líder Funcional MM)..."
                    className="w-full px-2 py-1 bg-slate-50/60 border border-slate-200 rounded text-slate-700 text-[11px]"
                  />
                  <input
                    type="text"
                    value={stage.notes || ''}
                    onChange={(e) =>
                      handleUpdateStage(stage.id, { notes: e.target.value })
                    }
                    placeholder="Notas o entregable clave de la fase..."
                    className="w-full px-2 py-1 bg-slate-50/60 border border-slate-200 rounded text-slate-700 text-[11px]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Plantillas de Proyectos SAP
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecciona una estructura estándar preconfigurada según las mejores prácticas SAP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {GANTT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleLoadTemplate(tmpl.id)}
                  className="p-4 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                      {tmpl.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{tmpl.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>{tmpl.plan.stages.length} etapas consecutivas</span>
                    <span>•</span>
                    <span>Hito de Go-Live incluido</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
