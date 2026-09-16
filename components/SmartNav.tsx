'use client';

import React from 'react';
import {
  Inbox,
  Calendar,
  CalendarDays,
  AlertCircle,
  CheckSquare,
  ListTodo,
  Clock,
  Sparkles,
  Hash,
} from 'lucide-react';
import { SmartFilterType, ViewModeType, CategoryFilter } from '@/types/todo';

interface SmartNavProps {
  activeFilter: SmartFilterType;
  onSelectFilter: (filter: SmartFilterType) => void;
  selectedCategory?: CategoryFilter;
  onSelectCategory?: (cat: CategoryFilter) => void;
  categoryCounts?: {
    all: number;
    work: number;
    personal: number;
    study: number;
  };
  viewMode: ViewModeType;
  onChangeViewMode: (mode: ViewModeType) => void;
  counts: {
    inbox: number;
    today: number;
    upcoming: number;
    p1: number;
    completed: number;
  };
  isMobileSimulator?: boolean;
}

export function SmartNav({
  activeFilter,
  onSelectFilter,
  selectedCategory = 'all',
  onSelectCategory,
  categoryCounts,
  viewMode,
  onChangeViewMode,
  counts,
  isMobileSimulator = false,
}: SmartNavProps) {
  const navItems: Array<{
    key: SmartFilterType;
    label: string;
    icon: React.ElementType;
    badgeCount: number;
    badgeColor?: string;
  }> = [
    {
      key: 'today',
      label: '오늘 할 일',
      icon: Calendar,
      badgeCount: counts.today,
      badgeColor:
        'text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20',
    },
    {
      key: 'inbox',
      label: '전체 인박스',
      icon: Inbox,
      badgeCount: counts.inbox,
    },
    {
      key: 'upcoming',
      label: '예정 (Upcoming)',
      icon: CalendarDays,
      badgeCount: counts.upcoming,
    },
    {
      key: 'p1',
      label: '중요 (P1 긴급)',
      icon: AlertCircle,
      badgeCount: counts.p1,
      badgeColor:
        'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/15 dark:border-red-500/30',
    },
    {
      key: 'completed',
      label: '완료됨',
      icon: CheckSquare,
      badgeCount: counts.completed,
      badgeColor:
        'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
    },
  ];

  return (
    <>
      {/* =========================================================================
          데스크톱 좌측 패널 (768px 이상 고정 사이드바)
          ========================================================================= */}
      <nav
        id="smart-navigation"
        className={`${
          isMobileSimulator ? 'hidden' : 'hidden md:flex'
        } flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/40 p-4 shrink-0 select-none transition-colors duration-200`}
      >
        {/* 1. 뷰 모드 토글 스위치 ([리스트] / [일간] / [주간] / [월간]) */}
        <div className="mb-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-2">
            일정 뷰 모드
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs">
            <button
              onClick={() => onChangeViewMode('list')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>리스트</span>
            </button>
            <button
              onClick={() => onChangeViewMode('timeline')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'timeline'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>일간</span>
            </button>
            <button
              onClick={() => onChangeViewMode('weekly')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>주간</span>
            </button>
            <button
              onClick={() => onChangeViewMode('monthly')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition ${
                viewMode === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>월간</span>
            </button>
          </div>
        </div>

        {/* 2. 스마트 필터 탭 목록 */}
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-2">
          스마트 필터
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectFilter(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : item.key === 'p1'
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {/* 개수 카운트 배지 */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
                    item.badgeColor ||
                    'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {item.badgeCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2.5 카테고리 필터 목록 */}
        <div className="mt-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-2">
            카테고리 필터
          </div>
          <div className="space-y-1">
            {[
              { key: 'all' as CategoryFilter, label: '전체', count: categoryCounts?.all },
              { key: 'work' as CategoryFilter, label: '🏢 업무', count: categoryCounts?.work },
              { key: 'personal' as CategoryFilter, label: '👤 개인', count: categoryCounts?.personal },
              { key: 'study' as CategoryFilter, label: '📚 공부', count: categoryCounts?.study },
            ].map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory(cat.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <span>{cat.label}</span>
                  {typeof cat.count === 'number' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 태그 바로가기 */}
        <div className="mt-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-2 flex items-center justify-between">
            <span>태그 필터</span>
            <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['온보딩', '집중', '타임블록', '습관', '업무'].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/70 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer transition"
              >
                <Hash className="w-3 h-3 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 4. 하단 상태 인포 카드 */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-900">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              로컬 퍼스트 상태
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              오프라인에서도 모든 데이터가 브라우저에 실시간 저장됩니다.
            </p>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          모바일 하단 고정 탭바 (768px 미만 Bottom Navigation Bar)
          ========================================================================= */}
      <div
        id="smart-navigation-mobile"
        className={`${
          isMobileSimulator ? 'absolute bottom-0 left-0 right-0 z-40' : 'md:hidden fixed bottom-0 left-0 right-0 z-40'
        } bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/90 flex items-center justify-around py-2 px-2 shadow-2xl transition-colors duration-200`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectFilter(item.key)}
              className={`relative flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center bg-indigo-600 text-white shadow">
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">
                {item.key === 'inbox' && '인박스'}
                {item.key === 'today' && '오늘'}
                {item.key === 'upcoming' && '예정'}
                {item.key === 'p1' && '중요'}
                {item.key === 'completed' && '완료'}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default SmartNav;
