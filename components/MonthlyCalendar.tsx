'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
} from 'lucide-react';
import { Task, Priority } from '@/types/todo';
import { getMonthCalendarDays, toDateString, getDateInfo } from '@/lib/dateUtils';

interface MonthlyCalendarProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickAddTaskForDate?: (dateStr: string, title: string) => void;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

export function MonthlyCalendar({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onQuickAddTaskForDate,
  selectedDate = new Date(),
  onSelectDate,
}: MonthlyCalendarProps) {
  const [currentYear, setCurrentYear] = useState<number>(selectedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(selectedDate.getMonth() + 1); // 1-based
  const [quickTitle, setQuickTitle] = useState('');
  const isSubmittingRef = useRef(false);

  // selectedDate가 바뀌면 연/월도 자동 동기화
  useEffect(() => {
    setCurrentYear(selectedDate.getFullYear());
    setCurrentMonth(selectedDate.getMonth() + 1);
  }, [selectedDate]);

  const selectedDateStr = toDateString(selectedDate);
  const selectedDateInfo = getDateInfo(selectedDate);
  const calendarDays = getMonthCalendarDays(currentYear, currentMonth);

  // 월 이동
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    if (onSelectDate) onSelectDate(now);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    const title = quickTitle.trim();
    if (!selectedDateStr || !title || !onQuickAddTaskForDate) return;

    isSubmittingRef.current = true;
    setQuickTitle('');

    try {
      onQuickAddTaskForDate(selectedDateStr, title);
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 300);
    }
  };

  const priorityBadge: Record<Priority, { dot: string; text: string }> = {
    P1: { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
    P2: { dot: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
    P3: { dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    P4: { dot: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400' },
  };

  // 선택된 날짜의 태스크들
  const selectedDateTasks = tasks.filter((t) => t.dueDate === selectedDateStr);

  const weekHeaders = [
    { name: '일', color: 'text-rose-500 dark:text-rose-400' },
    { name: '월', color: 'text-slate-600 dark:text-slate-300' },
    { name: '화', color: 'text-slate-600 dark:text-slate-300' },
    { name: '수', color: 'text-slate-600 dark:text-slate-300' },
    { name: '목', color: 'text-slate-600 dark:text-slate-300' },
    { name: '금', color: 'text-slate-600 dark:text-slate-300' },
    { name: '토', color: 'text-blue-500 dark:text-blue-400' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. 상단 월 네비게이션 컨트롤 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100">
                {currentYear}년 {currentMonth}월
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                월간 일정
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

        {/* 이전 달 / 이번 달 / 다음 달 컨트롤 */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            title="이전 달"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetToCurrentMonth}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition"
          >
            오늘이 속한 달
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            title="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 메인 캘린더 그리드 및 선택 날짜 상세 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 월간 달력 그리드 (어떤 날짜든 클릭하면 과거나 미래 선택됨) */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm p-4 overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold py-2 border-b border-slate-100 dark:border-slate-800/80">
            {weekHeaders.map((w, idx) => (
              <div key={idx} className={w.color}>
                {w.name}
              </div>
            ))}
          </div>

          {/* 일자 그리드 */}
          <div className="grid grid-cols-7 gap-1 md:gap-1.5 auto-rows-fr">
            {calendarDays.map((cell) => {
              const dayTasks = tasks.filter((t) => t.dueDate === cell.dateStr);
              const isSelected = selectedDateStr === cell.dateStr;
              const dayOfWeek = cell.date.getDay();
              const isSunday = dayOfWeek === 0;
              const isSaturday = dayOfWeek === 6;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => onSelectDate && onSelectDate(cell.date)}
                  className={`min-h-[85px] md:min-h-[105px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                      : cell.isToday
                      ? 'border-indigo-400/80 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : cell.isCurrentMonth
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                      : 'bg-slate-100/30 dark:bg-slate-950/30 border-slate-100 dark:border-slate-900/40 opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* 상단: 일자 번호 & 배지 & 네이버 달력 공휴일 라벨 */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className={`text-xs md:text-sm font-bold font-mono inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
                          cell.isToday
                            ? 'bg-indigo-600 text-white font-black shadow-sm'
                            : isSelected
                            ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-extrabold'
                            : cell.isHoliday || isSunday
                            ? 'text-rose-500 dark:text-rose-400 font-bold'
                            : isSaturday
                            ? 'text-blue-500 dark:text-blue-400 font-semibold'
                            : cell.isCurrentMonth
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {cell.isHoliday && cell.holidayName && (
                        <span
                          title={cell.holidayName}
                          className="text-[10px] font-bold text-rose-500 dark:text-rose-400 truncate max-w-[55px] md:max-w-[70px]"
                        >
                          {cell.holidayName}
                        </span>
                      )}
                    </div>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono shrink-0">
                        {dayTasks.filter((t) => t.isCompleted).length}/{dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* 중단: 태스크 미리보기 칩 (최대 2개 노출) */}
                  <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`text-[10px] leading-tight px-1.5 py-0.5 rounded border truncate flex items-center gap-1 ${
                          task.isCompleted
                            ? 'line-through text-slate-400 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                            : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700/60 shadow-2xs'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            priorityBadge[task.priority].dot
                          }`}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 font-medium px-1">
                        +{dayTasks.length - 2}개 더보기
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 선택 날짜 상세 패널 */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col h-[520px]">
          {/* 날짜 헤더 */}
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center flex-wrap gap-1 font-mono">
                <span>{selectedDateStr} ({selectedDateInfo.dayOfWeekShort})</span>
                {selectedDateInfo.isHoliday && selectedDateInfo.holidayName && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                    🔴 {selectedDateInfo.holidayName}
                  </span>
                )}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                선택한 날짜 일정
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              총 {selectedDateTasks.length}건
            </span>
          </div>

          {/* 할 일 빠른 추가 */}
          <form onSubmit={handleQuickSubmit} className="mt-3 flex gap-1.5">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="이 날짜에 할 일 추가..."
              className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition shrink-0"
              title="추가"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* 해당 일자 할 일 목록 */}
          <div className="flex-1 mt-3 space-y-2 overflow-y-auto pr-1">
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className={`group p-2.5 rounded-xl border text-xs transition ${
                    task.isCompleted
                      ? 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 opacity-60'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-indigo-400/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold leading-tight ${
                          task.isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        {task.timeBlock && (
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">
                            {task.timeBlock.startTime} ~ {task.timeBlock.endTime}
                          </span>
                        )}
                        <span
                          className={`px-1 py-0.2 rounded font-bold uppercase border text-[9px] ${
                            task.priority === 'P1'
                              ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                              : task.priority === 'P2'
                              ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                              : task.priority === 'P3'
                              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                        {task.category && (
                          <span className="text-[9px] text-slate-500">
                            {task.category === 'work' ? '🏢 업무' : task.category === 'study' ? '📚 공부' : '👤 개인'}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition p-1"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Calendar className="w-8 h-8 mb-2 opacity-40 text-indigo-500" />
                <p className="text-xs font-semibold">이 날짜에 등록된 일정이 없습니다.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  상단 입력창에서 바로 새 일정을 추가해보세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyCalendar;
