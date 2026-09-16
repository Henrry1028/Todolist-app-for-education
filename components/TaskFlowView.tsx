'use client';

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  Inbox,
  Calendar,
  AlertCircle,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Task, Priority, Category, CategoryFilter, SmartFilterType } from '@/types/todo';
import { TaskCard } from './TaskCard';

interface TaskFlowViewProps {
  tasks: Task[];
  allTasks?: Task[];
  activeFilter: SmartFilterType;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  categoryCounts?: {
    all: number;
    work: number;
    personal: number;
    study: number;
  };
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onUpdateCategory?: (id: string, category: Category) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskFlowView({
  tasks,
  allTasks,
  activeFilter,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  onToggleComplete,
  onDelete,
  onUpdatePriority,
  onUpdateCategory,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskFlowViewProps) {
  const [sortOrder, setSortOrder] = useState<'default' | 'priority'>('default');

  const filterMeta: Record<
    SmartFilterType,
    { title: string; emptyTitle: string; emptyDesc: string; icon: React.ElementType }
  > = {
    today: {
      title: '오늘의 플로우',
      emptyTitle: '오늘의 할 일을 모두 완료했습니다! 🎉',
      emptyDesc: '멋진 생산성입니다. 새로운 작업을 추가하거나 달콤한 휴식을 즐기세요.',
      icon: Calendar,
    },
    inbox: {
      title: '전체 인박스',
      emptyTitle: '인박스가 깔끔하게 비어있습니다 ✨',
      emptyDesc: '상단의 스마트 퀵 캡처(Cmd+K)로 떠오르는 작업을 편하게 남겨보세요.',
      icon: Inbox,
    },
    upcoming: {
      title: '예정된 태스크',
      emptyTitle: '예정된 일정이 없습니다 ☕',
      emptyDesc: '앞으로 다가올 프로젝트나 목표를 미리 계획해보세요.',
      icon: Clock,
    },
    p1: {
      title: '긴급 및 최우선 (P1)',
      emptyTitle: '긴급한 P1 작업이 없습니다 🛡️',
      emptyDesc: '현재 위기 상황 없이 차분하게 플로우를 이어가고 있습니다.',
      icon: AlertCircle,
    },
    completed: {
      title: '완료된 기록',
      emptyTitle: '아직 완료된 할 일이 없습니다 🚀',
      emptyDesc: '체크박스를 클릭해 첫 번째 할 일을 완료하고 스트릭을 쌓아보세요!',
      icon: CheckCircle2,
    },
  };

  const priorityWeight: Record<Priority, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };

  // 정렬 적용
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortOrder === 'priority') {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    // default: 미완료 우선, 그 다음 최신순
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const currentMeta = filterMeta[activeFilter] || filterMeta.today;
  const EmptyIcon = currentMeta.icon;

  // 오늘 날짜 및 달성율 계산
  const todayStr = new Date().toISOString().split('T')[0];
  const sourcePool = allTasks && allTasks.length > 0 ? allTasks : tasks;

  // '오늘의 플로우' 또는 현재 탭의 대상 태스크
  const targetTasks = sourcePool.filter((t) => {
    if (activeFilter === 'today') {
      return !t.dueDate || t.dueDate <= todayStr;
    }
    if (activeFilter === 'inbox') return true;
    if (activeFilter === 'upcoming') return t.dueDate && t.dueDate > todayStr;
    if (activeFilter === 'p1') return t.priority === 'P1';
    if (activeFilter === 'completed') return t.isCompleted;
    return true;
  });

  const totalCount = targetTasks.length;
  const completedCount = targetTasks.filter((t) => t.isCompleted).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // 카테고리별 통계
  const getCatStat = (cat: Category) => {
    const catTasks = targetTasks.filter((t) => (t.category || 'personal') === cat);
    const catTotal = catTasks.length;
    const catComp = catTasks.filter((t) => t.isCompleted).length;
    return { completed: catComp, total: catTotal };
  };

  const workStat = getCatStat('work');
  const personalStat = getCatStat('personal');
  const studyStat = getCatStat('study');

  // 오늘 새로 추가된 태스크
  const addedTodayCount = sourcePool.filter((t) => {
    return t.createdAt && t.createdAt.startsWith(todayStr);
  }).length;

  return (
    <section id="task-flow-view" className="space-y-4">
      {/* =========================================================================
          [달성율 시각화 카드 위젯] 첨부 이미지와 완벽 일치하는 진행률 & 통계 화면
          ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/90 shadow-sm p-4 md:p-5 transition-colors">
        {/* 1. 달성율 헤더: "1/2 completed (50%)" */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
            {completedCount}/{totalCount} completed ({progressPercent}%)
          </h3>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {activeFilter === 'today' ? '오늘의 달성률' : `${currentMeta.title} 진행도`}
          </span>
        </div>

        {/* 2. 가로 프로그레스 바 (인디고 바) */}
        <div className="w-full h-2.5 md:h-3 rounded-full bg-slate-100 dark:bg-slate-800/90 overflow-hidden my-2.5">
          <div
            className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 3. 카테고리별 진행 상태 칩 (2열 그리드: Work, Personal, Study) */}
        <div className="grid grid-cols-2 gap-2 my-2.5 text-xs font-semibold">
          {/* Work: 0/1 */}
          <button
            type="button"
            onClick={() => onSelectCategory('work')}
            className={`p-2.5 rounded-xl border transition flex items-center justify-between text-left ${
              selectedCategory === 'work'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/60 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-slate-500 dark:text-slate-400">Work:</span>
            <span className="font-mono font-black text-slate-900 dark:text-slate-100">
              {workStat.completed}/{workStat.total}
            </span>
          </button>

          {/* Personal: 0/0 */}
          <button
            type="button"
            onClick={() => onSelectCategory('personal')}
            className={`p-2.5 rounded-xl border transition flex items-center justify-between text-left ${
              selectedCategory === 'personal'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-slate-500 dark:text-slate-400">Personal:</span>
            <span className="font-mono font-black text-slate-900 dark:text-slate-100">
              {personalStat.completed}/{personalStat.total}
            </span>
          </button>

          {/* Study: 0/0 */}
          <button
            type="button"
            onClick={() => onSelectCategory('study')}
            className={`p-2.5 rounded-xl border transition flex items-center justify-between text-left ${
              selectedCategory === 'study'
                ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700/60 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/30'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-slate-500 dark:text-slate-400">Study:</span>
            <span className="font-mono font-black text-slate-900 dark:text-slate-100">
              {studyStat.completed}/{studyStat.total}
            </span>
          </button>
        </div>

        {/* 4. Added Today: 1 (오늘 추가된 할 일 바) */}
        <div className="w-full py-2.5 px-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-center text-xs md:text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono shadow-2xs">
          Added Today: <span className="font-black underline underline-offset-2">{addedTodayCount}</span>
        </div>
      </div>

      {/* =========================================================================
          5. 카테고리 알약 필터 버튼들 (첨부 이미지 하단 [All] [Work] [Personal] [Study])
          ========================================================================= */}
      <div className="flex items-center justify-center gap-2 py-1 overflow-x-auto text-xs md:text-sm font-semibold">
        {[
          { key: 'all' as CategoryFilter, label: 'All' },
          { key: 'work' as CategoryFilter, label: 'Work' },
          { key: 'personal' as CategoryFilter, label: 'Personal' },
          { key: 'study' as CategoryFilter, label: 'Study' },
        ].map((pill) => {
          const isActive = selectedCategory === pill.key;
          return (
            <button
              key={pill.key}
              type="button"
              onClick={() => onSelectCategory(pill.key)}
              className={`px-4 py-1.5 rounded-full transition shadow-xs ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* 6. 리스트 상단 헤더 & 정렬 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3 pt-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{currentMeta.title}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-500/20 font-mono">
              {tasks.length}건
            </span>
          </h2>
        </div>

        {/* 정렬 토글 버튼 */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSortOrder(sortOrder === 'priority' ? 'default' : 'priority')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
              sortOrder === 'priority'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{sortOrder === 'priority' ? '우선순위순 정렬됨' : '최신순 정렬'}</span>
          </button>
        </div>
      </div>

      {/* 7. 태스크 카드 리스트 (TaskCard 목록) */}
      {sortedTasks.length === 0 ? (
        /* 태스크가 하나도 없을 때의 Empty State UI */
        <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
            <EmptyIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {currentMeta.emptyTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {currentMeta.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onUpdatePriority={onUpdatePriority}
              onUpdateCategory={onUpdateCategory}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              onDeleteSubtask={onDeleteSubtask}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TaskFlowView;
