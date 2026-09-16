'use client';

import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Layers,
  Plus,
  X,
  CheckCircle2,
  Circle,
  GripVertical,
  Flag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Task, Priority } from '@/types/todo';
import { getDateInfo, toDateString } from '@/lib/dateUtils';

interface TimeSlot {
  hourStr: string;
  startH: string;
  endH: string;
  label: string;
}

interface TimeBlockPlannerProps {
  tasks: Task[];
  onAssignTimeBlock: (
    taskId: string,
    timeBlock: { startTime: string; endTime: string }
  ) => void;
  onRemoveTimeBlock: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

const priorityBorderClass: Record<Priority, string> = {
  P1: 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-500/30',
  P2: 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-500/30',
  P3: 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-500/30',
  P4: 'border-l-4 border-l-slate-400 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700',
};

const priorityDotClass: Record<Priority, string> = {
  P1: 'bg-red-500',
  P2: 'bg-orange-500',
  P3: 'bg-blue-500',
  P4: 'bg-slate-400',
};

export function TimeBlockPlanner({
  tasks,
  onAssignTimeBlock,
  onRemoveTimeBlock,
  onToggleComplete,
  selectedDate = new Date(),
  onSelectDate,
}: TimeBlockPlannerProps) {
  const dateInfo = getDateInfo(selectedDate);
  const selectedDateStr = dateInfo.dateStr;

  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6;
    const startH = String(hour).padStart(2, '0');
    const endH = String((hour + 1) % 24).padStart(2, '0');
    return {
      hourStr: `${startH}:00`,
      startH,
      endH,
      label: `${startH}:00 - ${endH}:00`,
    };
  });

  const targetDateTasks = tasks.filter(
    (t) => !t.dueDate || t.dueDate === selectedDateStr
  );
  const unscheduledTasks = targetDateTasks.filter((t) => !t.timeBlock && !t.isCompleted);

  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [modalStartTime, setModalStartTime] = useState('09:00');
  const [modalEndTime, setModalEndTime] = useState('10:00');
  const [dragOverHour, setDragOverHour] = useState<string | null>(null);

  const handlePrevDay = () => {
    if (!onSelectDate) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(d);
  };

  const handleNextDay = () => {
    if (!onSelectDate) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(d);
  };

  const handleResetToday = () => {
    if (!onSelectDate) return;
    onSelectDate(new Date());
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, hourStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverHour !== hourStr) {
      setDragOverHour(hourStr);
    }
  };

  const handleDragLeave = () => {
    setDragOverHour(null);
  };

  const handleDrop = (e: React.DragEvent, slot: TimeSlot) => {
    e.preventDefault();
    setDragOverHour(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    onAssignTimeBlock(taskId, {
      startTime: slot.hourStr,
      endTime: `${slot.endH}:00`,
    });
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForModal) return;

    onAssignTimeBlock(selectedTaskForModal.id, {
      startTime: modalStartTime,
      endTime: modalEndTime,
    });
    setSelectedTaskForModal(null);
  };

  return (
    <section id="time-block-planner" className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <span className={`text-sm font-bold ${dateInfo.isHoliday ? 'text-rose-500 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {dateInfo.formattedFull}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                  dateInfo.isToday
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {dateInfo.relativeLabel}
              </span>
              {dateInfo.isHoliday && dateInfo.holidayName && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full border bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/60">
                  🔴 {dateInfo.holidayName}
                </span>
              )}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                네이버 달력 연동
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="이전 날"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!dateInfo.isToday && (
            <button
              type="button"
              onClick={handleResetToday}
              className="px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-100 transition flex items-center gap-1"
              title="오늘로 이동"
            >
              <RotateCcw className="w-3 h-3" />
              <span>오늘</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleNextDay}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="다음 날"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              미배치 할 일 (Unscheduled)
            </h3>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {unscheduledTasks.length}건
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            슬롯으로 드래그하여 시간 지정
          </span>
        </div>

        {unscheduledTasks.length === 0 ? (
          <div className="py-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            이 날짜의 모든 할 일에 시간이 할당되었습니다! 👏
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {unscheduledTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => {
                  setSelectedTaskForModal(task);
                  setModalStartTime('09:00');
                  setModalEndTime('10:00');
                }}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 text-xs text-slate-800 dark:text-slate-200 cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-900 transition shadow-sm select-none"
              >
                <GripVertical className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 shrink-0" />
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDotClass[task.priority]}`}
                />
                <span className="font-medium truncate max-w-[140px]">{task.title}</span>
                {task.subtasks.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    +{task.subtasks.length}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2 transition-colors duration-200 shadow-sm">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              타임 블록 타임라인 (06:00 ~ 24:00)
            </h3>
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
            시간 할당 슬롯
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/50 pt-1">
          {timeSlots.map((slot) => {
            const slotHourInt = parseInt(slot.startH, 10);
            const matchedTasks = targetDateTasks.filter((t) => {
              if (!t.timeBlock) return false;
              const taskStartHour = parseInt(t.timeBlock.startTime.split(':')[0], 10);
              return taskStartHour === slotHourInt;
            });

            const isOver = dragOverHour === slot.hourStr;

            return (
              <div
                key={slot.hourStr}
                onDragOver={(e) => handleDragOver(e, slot.hourStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot)}
                className={`group min-h-[54px] py-1.5 px-2.5 flex items-start gap-3 transition rounded-xl ${
                  isOver
                    ? 'bg-indigo-50 dark:bg-indigo-600/15 ring-2 ring-indigo-500/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                }`}
              >
                <div className="w-12 shrink-0 text-right pt-1 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {slot.hourStr}
                </div>

                <div className="flex-1 space-y-1.5">
                  {matchedTasks.length > 0 ? (
                    matchedTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border shadow-sm transition ${
                          priorityBorderClass[t.priority]
                        } ${t.isCompleted ? 'opacity-50 line-through' : ''}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() => onToggleComplete(t.id)}
                            className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
                          >
                            {t.isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <Circle className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {t.title}
                            </p>
                            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                              {t.timeBlock?.startTime} - {t.timeBlock?.endTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                            {t.priority}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveTimeBlock(t.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition"
                            title="시간 블록 해제"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-6 flex items-center text-[11px] text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition">
                      + 드래그하여 이 시간에 배치
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTaskForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                시간 블록 할당
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTaskForModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {selectedTaskForModal.title}
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">시작 시간</label>
                  <input
                    type="time"
                    value={modalStartTime}
                    onChange={(e) => setModalStartTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">종료 시간</label>
                  <input
                    type="time"
                    value={modalEndTime}
                    onChange={(e) => setModalEndTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForModal(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  시간 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default TimeBlockPlanner;
