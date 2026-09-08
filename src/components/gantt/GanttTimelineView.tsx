import React, { useMemo } from 'react';
import {
  ProjectPlan,
  ComputedStage,
  TimelineBounds,
  MilestoneIconType,
} from '../../types';
import { GANTT_COLOR_THEMES } from '../../data/ganttTemplates';
import {
  formatPresentationDate,
  computeGanttStages,
  buildTimelineBounds,
} from '../../utils/ganttDateUtils';
import { COUNTRIES } from '../../utils/ganttHolidayUtils';
import {
  Star,
  Flag,
  Rocket,
  CheckCircle2,
  Target,
  Diamond,
  Calendar,
  Layers,
  ChevronDown,
  Globe2,
  Coffee,
} from 'lucide-react';

interface GanttTimelineViewProps {
  plan: ProjectPlan;
  computedStages?: ComputedStage[];
  bounds?: TimelineBounds;
  isPresentationMode?: boolean;
  isCompactForPdf?: boolean;
  timelineContainerRef?: React.RefObject<HTMLDivElement | null>;
  onSelectStage?: (stageId: string) => void;
  selectedStageId?: string | null;
  onUpdatePlan?: (updated: ProjectPlan) => void;
}

export const GanttTimelineView: React.FC<GanttTimelineViewProps> = ({
  plan,
  computedStages: propComputedStages,
  bounds: propBounds,
  isPresentationMode = false,
  isCompactForPdf = false,
  timelineContainerRef,
  onSelectStage,
  selectedStageId,
  onUpdatePlan,
}) => {
  // If computed stages/bounds are not provided, calculate them on the fly
  const calculated = useMemo(() => {
    if (propComputedStages && propBounds) {
      return {
        stages: propComputedStages,
        bounds: propBounds,
      };
    }
    const computed = computeGanttStages(
      plan.stages,
      plan.settings.startDate,
      plan.settings.calendar,
      plan.settings.presentationWindow
    );
    const bounds = buildTimelineBounds(
      computed.minDate,
      computed.maxDate,
      computed.totalDays
    );
    return {
      stages: computed.computedStages,
      bounds,
    };
  }, [plan, propComputedStages, propBounds]);

  const computedStages = calculated.stages;
  const bounds = calculated.bounds;

  const currentTheme =
    GANTT_COLOR_THEMES.find((t) => t.id === plan.settings.themeId) ||
    GANTT_COLOR_THEMES[0];

  const countryInfo =
    COUNTRIES.find((c) => c.code === plan.settings.calendar?.country) ||
    COUNTRIES[0];

  const renderMilestoneIcon = (
    icon?: MilestoneIconType,
    className: string = 'w-5 h-5'
  ) => {
    switch (icon) {
      case 'flag':
        return <Flag className={className} />;
      case 'rocket':
        return <Rocket className={className} />;
      case 'check':
        return <CheckCircle2 className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'diamond':
        return <Diamond className={className} />;
      case 'star':
      default:
        return <Star className={`${className} fill-amber-400 text-amber-600`} />;
    }
  };

  const isDarkMode =
    plan.settings.backgroundStyle === 'navy-dark' ||
    plan.settings.themeId === 'sap-horizon-dark';

  const currentWindow = plan.settings.presentationWindow || 'auto';

  return (
    <div
      id="gantt-presentation-canvas"
      ref={timelineContainerRef}
      className={`relative w-full rounded-2xl shadow-xs border ${
        isDarkMode
          ? 'border-slate-800 bg-[#0B1521] text-slate-100'
          : 'border-slate-200/90 bg-white text-slate-800'
      } overflow-hidden transition-all duration-300`}
      style={{
        minHeight: isPresentationMode ? '620px' : isCompactForPdf ? 'auto' : 'auto',
      }}
    >
      {/* Slide Header Banner */}
      <div
        id="gantt-top-header"
        className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode
            ? 'border-slate-800/80 bg-[#102030]'
            : 'border-slate-200/80 bg-white/95 backdrop-blur-xs'
        }`}
      >
        {/* Left: Project Icon & Project Name */}
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs font-bold text-sm flex-shrink-0"
            style={{
              backgroundColor: currentTheme.accentColor + '15',
              color: currentTheme.accentColor,
              border: `1px solid ${currentTheme.accentColor}30`,
            }}
          >
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {onUpdatePlan && !isCompactForPdf ? (
                <input
                  type="text"
                  value={plan.settings.companyOrArea || ''}
                  placeholder="Módulo o Área (ej. SAP S/4HANA)"
                  onChange={(e) =>
                    onUpdatePlan({
                      ...plan,
                      settings: {
                        ...plan.settings,
                        companyOrArea: e.target.value,
                      },
                    })
                  }
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-700 bg-transparent focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0070F2] ${
                    isDarkMode ? 'text-slate-300' : 'text-[#0070F2]'
                  }`}
                />
              ) : (
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-[#EBF3FC] text-[#0070F2]'
                  }`}
                >
                  {plan.settings.companyOrArea || 'Planificación Ejecutiva SAP'}
                </span>
              )}
              <span
                className={`text-[11px] ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                • {computedStages.length} Etapas consecutivas
              </span>
            </div>

            {/* Project Name */}
            {onUpdatePlan && !isCompactForPdf ? (
              <div className="mt-0.5">
                <input
                  type="text"
                  value={plan.settings.title}
                  placeholder="Nombre del Proyecto SAP"
                  onChange={(e) =>
                    onUpdatePlan({
                      ...plan,
                      settings: {
                        ...plan.settings,
                        title: e.target.value,
                      },
                    })
                  }
                  className={`w-full text-base sm:text-lg font-bold tracking-tight bg-transparent hover:bg-black/5 dark:hover:bg-white/5 focus:bg-white dark:focus:bg-slate-900 px-1 py-0.5 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#0070F2] focus:outline-none ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                />
              </div>
            ) : (
              <h4
                className={`text-base font-bold tracking-tight truncate ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {plan.settings.title || 'Plan de Proyecto SAP'}
              </h4>
            )}
          </div>
        </div>

        {/* Right Info: Project Start Date Picker & Settings Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-900/80 border-slate-700 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#0070F2] flex-shrink-0" />
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[10px]">
                Inicio:
              </span>
              {onUpdatePlan && !isCompactForPdf ? (
                <input
                  type="date"
                  value={plan.settings.startDate}
                  onChange={(e) =>
                    onUpdatePlan({
                      ...plan,
                      settings: {
                        ...plan.settings,
                        startDate: e.target.value,
                      },
                    })
                  }
                  className="font-mono font-bold text-xs bg-transparent border-0 text-[#0070F2] focus:ring-0 p-0 cursor-pointer"
                />
              ) : (
                <span className="font-mono font-bold text-xs text-[#0070F2]">
                  {plan.settings.startDate}
                </span>
              )}
            </div>
          </div>

          {!isCompactForPdf && onUpdatePlan && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-700'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
              title="Ventana de presentación: cantidad de meses"
            >
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[10px]">
                Ventana:
              </span>
              <select
                id="presentation-window-select"
                value={currentWindow}
                onChange={(e) =>
                  onUpdatePlan({
                    ...plan,
                    settings: {
                      ...plan.settings,
                      presentationWindow: e.target.value as any,
                    },
                  })
                }
                className="text-xs font-bold bg-transparent border-0 text-[#0070F2] focus:ring-0 cursor-pointer pr-1 py-0"
              >
                <option value="auto">Auto (Completo)</option>
                <option value="1_month">1 Mes</option>
                <option value="2_months">2 Meses</option>
                <option value="3_months">3 Meses</option>
                <option value="4_months">4 Meses</option>
                <option value="6_months">6 Meses</option>
              </select>
            </div>
          )}

          {/* Country Calendar Badge */}
          {plan.settings.calendar && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-700 text-slate-300'
                  : 'bg-[#F0F6FD] border-[#D0E2FF] text-[#004B99]'
              }`}
              title="Calendario con feriados legales del país"
            >
              <span className="text-xs leading-none">{countryInfo.flag}</span>
              <span className="font-medium text-[11px]">{countryInfo.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Roadmap Area */}
      <div className="w-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
        {/* LEFT COLUMN: Stages List */}
        <div className={`w-full ${isCompactForPdf ? 'md:w-[250px]' : 'md:w-[290px] lg:w-[310px]'} flex-shrink-0 flex flex-col`}>
          {/* Header Row */}
          <div
            className={`h-12 px-4 flex items-center gap-2 border-b font-medium text-xs ${
              isDarkMode
                ? 'bg-[#102030] border-slate-800 text-slate-200'
                : 'bg-slate-50/90 border-slate-200 text-slate-800'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold truncate text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              Fases / Entregables SAP
            </span>
          </div>

          {/* Stages List Items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {computedStages.map((stage) => {
              const isSelected = selectedStageId === stage.id;
              return (
                <div
                  key={stage.id}
                  id={`stage-row-left-${stage.id}`}
                  onClick={() => onSelectStage && onSelectStage(stage.id)}
                  className={`h-11 px-4 flex items-center justify-between gap-2 text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-blue-950/50 font-semibold'
                        : 'bg-blue-50 font-semibold'
                      : isDarkMode
                      ? 'hover:bg-slate-900/60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {stage.isMilestone ? (
                      <div
                        className="w-4.5 h-4.5 rounded flex items-center justify-center flex-shrink-0"
                        title="Hito Crítico / Go-Live"
                      >
                        {renderMilestoneIcon(stage.milestoneIcon, 'w-3.5 h-3.5 stroke-[2.2]')}
                      </div>
                    ) : (
                      <div
                        className="w-2.5 h-2.5 rounded-xs flex-shrink-0 bg-[#0070F2] shadow-2xs"
                        style={{
                          backgroundColor: stage.customColor || undefined,
                        }}
                      />
                    )}
                    <span
                      className={`truncate ${
                        stage.isMilestone
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-medium text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>

                  {/* Right duration badge */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {stage.holidaysEncountered && stage.holidaysEncountered.length > 0 && (
                      <span
                        className="text-[9px] text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-1 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 flex items-center gap-0.5"
                        title={`Festivos: ${stage.holidaysEncountered.map((h) => `${h.date} (${h.name})`).join(', ')}`}
                      >
                        <Coffee className="w-2.5 h-2.5" />
                        {stage.holidaysEncountered.length}
                      </span>
                    )}
                    {plan.settings.showDurationOnBars && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isDarkMode
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-100 text-slate-700 font-semibold'
                        }`}
                      >
                        {stage.duration} {stage.durationUnit === 'weeks' ? 'sem' : 'd'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Calendar Gantt Timeline */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="min-w-[550px] flex flex-col">
            {/* Timeline Header (Months & Weeks) */}
            <div
              className={`h-12 border-b flex relative select-none ${
                isDarkMode
                  ? 'bg-[#102030] border-slate-800 text-slate-300'
                  : 'bg-slate-50/90 border-slate-200 text-slate-700'
              }`}
            >
              {bounds.months.map((month, idx) => (
                <div
                  key={`${month.year}-${month.name}-${idx}`}
                  style={{ width: `${month.widthPercent}%` }}
                  className={`h-full flex flex-col justify-center items-center border-r relative px-1.5 ${
                    isDarkMode ? 'border-slate-800' : 'border-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold tracking-wide capitalize text-slate-800 dark:text-slate-200">
                    {month.name} {bounds.months.length > 3 ? `'${String(month.year).slice(-2)}` : ''}
                  </span>
                  {plan.settings.showWeekNumbers && (
                    <div className="w-full flex justify-between text-[9px] text-slate-500 dark:text-slate-400 px-0.5 pt-0.5 border-t border-slate-200/50 dark:border-slate-800">
                      {month.weeks.map((w, wIdx) => (
                        <span key={wIdx} className="font-mono">
                          {w.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Timeline Stage Rows */}
            <div className="relative divide-y divide-slate-100 dark:divide-slate-800/70">
              {/* Background Grid Vertical Lines */}
              {plan.settings.showGridLines && (
                <div className="absolute inset-0 pointer-events-none flex z-0">
                  {bounds.months.map((month, idx) => (
                    <div
                      key={`grid-${idx}`}
                      style={{ width: `${month.widthPercent}%` }}
                      className={`h-full border-r ${
                        isDarkMode
                          ? 'border-slate-800/80 border-dashed'
                          : 'border-slate-200/80 border-dashed'
                      } flex`}
                    >
                      {plan.settings.showWeekNumbers &&
                        month.weeks.map((_, wIdx) => (
                          <div
                            key={`wgrid-${wIdx}`}
                            className={`flex-1 h-full border-r ${
                              isDarkMode
                                ? 'border-slate-900/60 border-dotted'
                                : 'border-slate-100 border-dotted'
                            } last:border-r-0`}
                          />
                        ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Rows */}
              {computedStages.map((stage) => {
                const isSelected = selectedStageId === stage.id;

                return (
                  <div
                    key={stage.id}
                    id={`stage-row-right-${stage.id}`}
                    onClick={() => onSelectStage && onSelectStage(stage.id)}
                    className={`h-11 relative flex items-center cursor-pointer transition-colors z-10 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-blue-950/30'
                          : 'bg-blue-50/40'
                        : isDarkMode
                        ? 'hover:bg-slate-900/40'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* The Stage Timeline Bar */}
                    <div
                      className="absolute h-[26px] flex items-center transition-all duration-200 group"
                      style={{
                        left: `${stage.leftPercent}%`,
                        width: `${stage.widthPercent}%`,
                        minWidth: stage.isMilestone ? '36px' : '8px',
                      }}
                    >
                      {/* Bar Container */}
                      <div
                        className={`w-full h-full flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02] ${
                          stage.isMilestone
                            ? `${currentTheme.milestoneColor} rounded-xl shadow-xs px-2`
                            : `${currentTheme.barColor} ${
                                plan.settings.barStyle === 'pills'
                                  ? 'rounded-full'
                                  : plan.settings.barStyle === 'minimal'
                                  ? 'rounded-xs'
                                  : 'rounded-md'
                              } shadow-2xs px-1.5`
                        }`}
                        style={{
                          backgroundColor: stage.customColor || undefined,
                        }}
                      >
                        {/* Milestone Inner Content */}
                        {stage.isMilestone ? (
                          <div className="flex items-center gap-1 font-bold">
                            {renderMilestoneIcon(
                              stage.milestoneIcon,
                              'w-4 h-4 stroke-[2.2]'
                            )}
                            {plan.settings.labelPosition === 'inside' && (
                              <span className="text-[11px] truncate font-bold text-amber-900">
                                {stage.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          // Standard Phase Bar Content
                          <div className="w-full flex items-center justify-between overflow-hidden">
                            {plan.settings.labelPosition === 'inside' && (
                              <span className="text-[11px] font-semibold truncate px-1 text-slate-900">
                                {stage.name}
                              </span>
                            )}
                            {plan.settings.showProgress &&
                              stage.progress !== undefined &&
                              stage.progress > 0 && (
                                <span className="text-[9px] font-bold opacity-85 px-1 bg-black/10 rounded">
                                  {stage.progress}%
                                </span>
                              )}
                          </div>
                        )}
                      </div>

                      {/* Beside Label */}
                      {plan.settings.labelPosition !== 'inside' && (() => {
                        const isNearRightEdge =
                          stage.leftPercent + stage.widthPercent > 68 &&
                          stage.leftPercent > 18;
                        return (
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap flex items-center gap-1.5 select-none pointer-events-none z-20 ${
                              isNearRightEdge
                                ? 'right-[calc(100%+8px)] justify-end text-right'
                                : 'left-[calc(100%+8px)] justify-start text-left'
                            }`}
                          >
                            <span
                              className={`text-xs ${
                                stage.isMilestone
                                  ? 'font-bold text-slate-900 dark:text-white'
                                  : 'font-semibold text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {stage.name}
                            </span>
                            {plan.settings.showDateBadges && (
                              <span
                                className={`text-[10px] font-normal font-mono ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}
                              >
                                ({formatPresentationDate(stage.computedStartDate)} -{' '}
                                {formatPresentationDate(stage.computedEndDate)})
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Slide Footer */}
      <div
        id="gantt-bottom-footer"
        className={`px-5 py-2.5 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
          isDarkMode
            ? 'border-slate-800/80 bg-[#102030]/60 text-slate-400'
            : 'border-slate-200/80 bg-slate-50/80 text-slate-600'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-[#C7E0F8] border border-[#85B8E8]" />
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              Fases Consecutivas (SAP)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              Hito Crítico / Go-Live
            </span>
          </div>
          {plan.settings.calendar?.includeHolidays && (
            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <Globe2 className="w-3 h-3 text-blue-500" />
              <span>Festivos de {countryInfo.name} contemplados (semana {plan.settings.calendar.workingDaysPerWeek} días)</span>
            </div>
          )}
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          {plan.settings.subtitle || 'Cronograma Ejecutivo SAP S/4HANA'}
        </div>
      </div>
    </div>
  );
};
