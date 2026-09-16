'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Flag,
  Repeat,
  X,
} from 'lucide-react';
import { Task, Priority, Category, SubTask } from '@/types/todo';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onUpdateCategory?: (id: string, category: Category) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskCard({
  task,
  onToggleComplete,
  onDelete,
  onUpdatePriority,
  onUpdateCategory,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const completedSubtasksCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasksCount = task.subtasks.length;

  const handleSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    onAddSubtask(task.id, subtaskInput.trim());
    setSubtaskInput('');
  };

  const priorityMeta: Record<
    Priority,
    { label: string; badgeClass: string; dotClass: string }
  > = {
    P1: {
      label: 'P1 긴급',
      badgeClass:
        'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
      dotClass: 'bg-red-500',
    },
    P2: {
      label: 'P2 중요',
      badgeClass:
        'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
      dotClass: 'bg-orange-500',
    },
    P3: {
      label: 'P3 보통',
      badgeClass:
        'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
      dotClass: 'bg-blue-500',
    },
    P4: {
      label: 'P4 낮음',
      badgeClass:
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-700',
      dotClass: 'bg-slate-400',
    },
  };

  const categoryMeta: Record<
    Category,
    { label: string; badgeClass: string; icon: string }
  > = {
    work: {
      label: '🏢 업무',
      badgeClass:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
      icon: '🏢',
    },
    study: {
      label: '📚 공부',
      badgeClass:
        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
      icon: '📚',
    },
    personal: {
      label: '👤 개인',
      badgeClass:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
      icon: '👤',
    },
  };

  const recurrenceLabel: Record<string, string> = {
    daily: '매일 반복',
    weekly: '매주 반복',
    weekdays: '주중 반복',
    monthly: '매월 반복',
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        task.isCompleted
          ? 'bg-slate-100/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 opacity-65'
          : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-xl dark:hover:shadow-black/20'
      }`}
    >
      <div className="p-4 md:p-4.5">
        <div className="flex items-start gap-3.5">
          {/* 1. 체크박스 (완료 토글 및 애니메이션) */}
          <button
            type="button"
            onClick={() => onToggleComplete(task.id)}
            className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-transform active:scale-90 shrink-0"
            aria-label={task.isCompleted ? '완료 취소' : '할 일 완료'}
          >
            {task.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/20 transition-all duration-200" />
            ) : (
              <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200" />
            )}
          </button>

          {/* 2. 태스크 본문 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {/* 우선순위 플래그 & 드롭다운 변경 트리거 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPriorityMenuOpen(!isPriorityMenuOpen)}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border transition hover:opacity-80 ${
                    priorityMeta[task.priority].badgeClass
                  }`}
                  title="우선순위 변경"
                >
                  <Flag className="w-2.5 h-2.5" />
                  <span>{task.priority}</span>
                </button>

                {/* 우선순위 변경 드롭다운 메뉴 */}
                {isPriorityMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-30 w-28 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {(['P1', 'P2', 'P3', 'P4'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          onUpdatePriority(task.id, p);
                          setIsPriorityMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition ${
                          task.priority === p
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${priorityMeta[p].dotClass}`} />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 카테고리 뱃지 & 드롭다운 변경 트리거 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition hover:opacity-80 ${
                    categoryMeta[task.category || 'personal'].badgeClass
                  }`}
                  title="카테고리 변경"
                >
                  <span>{categoryMeta[task.category || 'personal'].label}</span>
                </button>

                {/* 카테고리 변경 드롭다운 메뉴 */}
                {isCategoryMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-30 w-28 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {(['work', 'personal', 'study'] as Category[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (onUpdateCategory) onUpdateCategory(task.id, c);
                          setIsCategoryMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition ${
                          task.category === c
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span>{categoryMeta[c].label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 태스크 제목 */}
              <h3
                className={`text-sm md:text-[15px] leading-relaxed transition-all duration-200 ${
                  task.isCompleted
                    ? 'line-through text-slate-400 italic'
                    : 'text-slate-900 dark:text-slate-100 font-semibold'
                }`}
              >
                {task.title}
              </h3>
            </div>

            {/* 설명 (존재할 경우) */}
            {task.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* 메타데이터 (시간 블록, 마감일, 반복 규칙, 태그, 하위 작업 카운터) */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {/* 타임 블록 */}
              {task.timeBlock && (
                <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-900/60 font-mono">
                  <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  {task.timeBlock.startTime} - {task.timeBlock.endTime}
                </span>
              )}

              {/* 마감일 */}
              {task.dueDate && (
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                  <Calendar className="w-3 h-3" />
                  {task.dueDate}
                </span>
              )}

              {/* 반복 규칙 */}
              {task.recurrence && task.recurrence !== 'none' && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/20 font-medium">
                  <Repeat className="w-3 h-3" />
                  {recurrenceLabel[task.recurrence] || task.recurrence}
                </span>
              )}

              {/* 서브태스크 펼침/접기 버튼 토글 */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border transition ${
                  totalSubtasksCount > 0
                    ? 'bg-slate-100 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-dashed border-slate-300 dark:border-slate-800'
                }`}
              >
                <Layers className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span>
                  서브태스크 {totalSubtasksCount > 0 ? `(${completedSubtasksCount}/${totalSubtasksCount})` : '+'}
                </span>
                {totalSubtasksCount > 0 &&
                  (isExpanded ? (
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  ) : (
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  ))}
              </button>

              {/* 태그 목록 */}
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-950/70 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-slate-800/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 3. 우측 태스크 액션 (삭제 버튼) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition opacity-80 md:opacity-0 group-hover:opacity-100"
              title="태스크 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. 서브태스크(Checklist) 섹션 */}
        {isExpanded && (
          <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/70 pl-8 space-y-2 animate-in fade-in duration-150">
            {/* 서브태스크 리스트 */}
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between gap-2 text-xs py-1 group/sub"
              >
                <button
                  type="button"
                  onClick={() => onToggleSubtask(task.id, st.id)}
                  className="flex items-center gap-2 text-left flex-1 min-w-0"
                >
                  {st.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0" />
                  )}
                  <span
                    className={`truncate ${
                      st.isCompleted
                        ? 'line-through text-slate-400'
                        : 'text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {st.title}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteSubtask(task.id, st.id)}
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition p-0.5"
                  title="하위 작업 삭제"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* 인라인 서브태스크 추가 인풋 */}
            <form onSubmit={handleSubtaskSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="하위 작업 추가 (Enter)"
                className="flex-1 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!subtaskInput.trim()}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
