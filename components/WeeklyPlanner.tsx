'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Task, Priority } from '@/types/todo';
import { getWeekDates, toDateString, getDateInfo } from '@/lib/dateUtils';

interface WeeklyPlannerProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickAddTaskForDate?: (dateStr: string, title: string) => void;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

export function WeeklyPlanner({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onQuickAddTaskForDate,
  selectedDate = new Date(),
  onSelectDate,
}: WeeklyPlannerProps) {
  const [currentBaseDate, setCurrentBaseDate] = useState<Date>(selectedDate);
  const [quickInputDate, setQuickInputDate] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    setCurrentBaseDate(selectedDate);
  }, [selectedDate]);

  const weekDays = getWeekDates(currentBaseDate);
  const selectedDateInfo = getDateInfo(selectedDate);

  // 주간 이동 핸들러
  const handlePrevWeek = () => {
    const next = new Date(currentBaseDate);
    next.setDate(next.getDate() - 7);
    setCurrentBaseDate(next);
    if (onSelectDate) onSelectDate(next);
  };

  const handleNextWeek = () => {
    const next = new Date(currentBaseDate);
    next.setDate(next.getDate() + 7);
    setCurrentBaseDate(next);
    if (onSelectDate) onSelectDate(next);
  };

  const handleResetToCurrentWeek = () => {
    const today = new Date();
    setCurrentBaseDate(today);
    if (onSelectDate) onSelectDate(today);
  };

  // 주간 타이틀 (예: 2026년 9월 14일 ~ 9월 20일)
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
  const weekRangeTitle = `${firstDay.year}년 ${firstDay.month}월 ${firstDay.dayNumber}일 ~ ${lastDay.month}월 ${lastDay.dayNumber}일`;

  const handleQuickSubmit = (e: React.FormEvent, dateStr: string) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    const title = quickTitle.trim();
    if (!title || !onQuickAddTaskForDate) return;

    isSubmittingRef.current = true;
    setQuickTitle('');
    setQuickInputDate(null);

    try {
      onQuickAddTaskForDate(dateStr, title);
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 300);
    }
  };

  const priorityBadge: Record<Priority, string> = {
    P1: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400',
    P2: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400',
    P3: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400',
    P4: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. 상단 컨트롤러: 주간 네비게이션 & 오늘 바로가기 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-slate-100">
                주간 일정 플래너
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                {weekRangeTitle}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                네이버 달력 휴일 연동
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              선택된 날짜: {selectedDateInfo.formattedFull}{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                ({selectedDateInfo.relativeLabel})
              </span>
              {selectedDateInfo.isHoliday && selectedDateInfo.holidayName && (
                <span className="ml-1.5 inline-flex items-center text-xs font-bold text-rose-500 dark:text-rose-400">
                  🔴 {selectedDateInfo.holidayName}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 이전 주 / 오늘 / 다음 주 컨트롤 */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            title="지난주"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetToCurrentWeek}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition"
          >
            이번 주 (오늘)
          </button>
          <button
            type="button"
            onClick={handleNextWeek}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            title="다음주"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 7일(월~일) 주간 캘린더 그리드 (어떤 날짜든 클릭하면 과거나 미래 선택됨) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayTasks = tasks.filter((t) => t.dueDate === day.dateStr);
          const isSelected = toDateString(day.date) === toDateString(selectedDate);

          return (
            <div
              key={day.dateStr}
              onClick={() => onSelectDate && onSelectDate(day.date)}
              className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[360px] cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 shadow-md ring-2 ring-indigo-500/40'
                  : day.isToday
                  ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-300 dark:border-indigo-600/40'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {/* 요일 및 날짜 헤더 */}
              <div
                className={`p-3 border-b flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-200 dark:border-indigo-500/40 bg-indigo-100/60 dark:bg-indigo-900/40'
                    : day.isToday
                    ? 'border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-900/20'
                    : 'border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-bold block ${
                        day.isHoliday || day.isWeekend
                          ? 'text-rose-500 dark:text-rose-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {day.dayName}요일
                    </span>
                    {day.isHoliday && day.holidayName && (
                      <span
                        title={day.holidayName}
                        className="text-[9px] font-bold px-1 py-0.2 rounded bg-rose-100/80 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 truncate max-w-[50px]"
                      >
                        {day.holidayName}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-base font-black font-mono leading-none ${
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                        : day.isHoliday || day.isWeekend
                        ? 'text-rose-500 dark:text-rose-400'
                        : day.isToday
                        ? 'text-indigo-500 dark:text-indigo-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {day.isToday && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-600 text-white shadow-xs">
                      오늘
                    </span>
                  )}
                  {isSelected && !day.isToday && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                      선택됨
                    </span>
                  )}
                </div>
              </div>

              {/* 해당 요일의 태스크 카드 목록 */}
              <div className="flex-1 p-2.5 space-y-2 overflow-y-auto max-h-[420px]">
                {dayTasks.length > 0 ? (
                  dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => e.stopPropagation()}
                      className={`group p-2.5 rounded-xl border text-xs transition shadow-sm ${
                        task.isCompleted
                          ? 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 opacity-60'
                          : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-indigo-400/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleComplete(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold leading-tight truncate ${
                              task.isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </p>

                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                            {task.timeBlock && (
                              <span className="font-mono text-indigo-600 dark:text-indigo-300">
                                {task.timeBlock.startTime}
                              </span>
                            )}
                            <span
                              className={`px-1 py-0.2 rounded font-bold uppercase border text-[9px] ${
                                priorityBadge[task.priority]
                              }`}
                            >
                              {task.priority}
                            </span>
                            {task.category && (
                              <span className="text-[9px] text-slate-500 dark:text-slate-400">
                                {task.category === 'work' ? '🏢' : task.category === 'study' ? '📚' : '👤'}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition p-0.5"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full min-h-[80px] flex items-center justify-center text-center text-[11px] text-slate-400 italic">
                    일정 없음
                  </div>
                )}
              </div>

              {/* 하단 해당 날짜 빠른 추가 폼 */}
              <div
                className="p-2 border-t border-slate-100 dark:border-slate-800/60 mt-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {quickInputDate === day.dateStr ? (
                  <form
                    onSubmit={(e) => handleQuickSubmit(e, day.dateStr)}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      placeholder="할 일 입력"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!quickTitle.trim()}
                      className="p-1 rounded-lg bg-indigo-600 text-white disabled:opacity-40 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickInputDate(day.dateStr);
                      setQuickTitle('');
                    }}
                    className="w-full py-1 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>추가</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyPlanner;
