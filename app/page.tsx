'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Task,
  UserStats,
  Priority,
  Category,
  CategoryFilter,
  SmartFilterType,
  ViewModeType,
} from '@/types/todo';
import {
  getTasks,
  getUserStats,
  addTask,
  toggleTaskCompletion,
  deleteTask,
  updateTaskPriority,
  updateTaskCategory,
  addSubTask,
  toggleSubTask,
  deleteSubTask,
  assignTimeBlock,
  removeTimeBlock,
  INITIAL_STATS,
} from '@/lib/storage';
import { Header } from '@/components/Header';
import { SmartNav } from '@/components/SmartNav';
import { QuickCapture } from '@/components/QuickCapture';
import { TaskFlowView } from '@/components/TaskFlowView';
import { TimeBlockPlanner } from '@/components/TimeBlockPlanner';
import { WeeklyPlanner } from '@/components/WeeklyPlanner';
import { MonthlyCalendar } from '@/components/MonthlyCalendar';
import { syncOnlineHolidays } from '@/lib/holidays';
import { Smartphone, Monitor, ExternalLink, Hand } from 'lucide-react';

export default function FlowDoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [isClientReady, setIsClientReady] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SmartFilterType>('today');
  const [viewMode, setViewMode] = useState<ViewModeType>('list');

  // 실제 휴대폰 화면 사이즈 시뮬레이터 모드 (390px 폭)
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);

  // 날짜 선택 상태 (과거, 오늘, 미래 날짜 모두 자유롭게 선택 가능)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 카테고리 필터 상태 ('all' | 'work' | 'personal' | 'study')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  // 모바일 시뮬레이터 터치 스와이프 & 마우스 드래그 제스처 스크롤 핸들러
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isMobileSimulator || !mainScrollRef.current) return;
      const target = e.target as HTMLElement;
      // 버튼, 인풋, 체크박스, 라벨 등 대화형 요소 클릭 시에는 제스처 스크롤 가로채기 방지
      if (target.closest('button, input, textarea, select, a, [role="button"], label')) {
        return;
      }
      isDraggingRef.current = true;
      hasMovedRef.current = false;
      startYRef.current = e.clientY;
      startScrollTopRef.current = mainScrollRef.current.scrollTop;
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    },
    [isMobileSimulator]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || !mainScrollRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    if (Math.abs(deltaY) > 3) {
      hasMovedRef.current = true;
    }
    mainScrollRef.current.scrollTop = startScrollTopRef.current - deltaY;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  }, []);

  // 390px 독립 팝업창 열기 (브라우저 모바일 개발자 도구 및 고유 터치 스크롤 완벽 지원)
  const handleOpenMobilePopup = () => {
    const width = 390;
    const height = 844;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    window.open(
      window.location.href,
      'FlowDoMobileSimulator',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  // SSR Hydration 에러 방지 및 로컬 스토리지 안전 로드
  useEffect(() => {
    setIsClientReady(true);
    setTasks(getTasks());
    setStats(getUserStats());

    // 네이버 달력 및 한국천문연구원 최신 공휴일 피드 백그라운드 동기화
    syncOnlineHolidays(new Date().getFullYear());

    const handleStorageUpdate = () => {
      const latest = getTasks();
      const unique = latest.filter(
        (task, index, self) => index === self.findIndex((t) => t.id === task.id)
      );
      setTasks(unique);
      setStats(getUserStats());
    };

    window.addEventListener('flowdo_storage_change', handleStorageUpdate);
    return () => window.removeEventListener('flowdo_storage_change', handleStorageUpdate);
  }, []);

  // 태스크 추가 시 낙관적 UI 업데이트 (중복 ID 멱등성 보장)
  const handleTaskAdded = (newTask: Task) => {
    setTasks((prev) => {
      if (prev.some((t) => t.id === newTask.id)) return prev;
      return [newTask, ...prev];
    });
  };

  // 태스크 완료 상태 토글
  const handleToggleTask = (id: string) => {
    toggleTaskCompletion(id);
  };

  // 태스크 삭제
  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  // 태스크 우선순위 변경
  const handleUpdatePriority = (id: string, priority: Priority) => {
    updateTaskPriority(id, priority);
  };

  // 태스크 카테고리 변경 (업무 / 개인 / 공부)
  const handleUpdateCategory = (id: string, category: Category) => {
    updateTaskCategory(id, category);
  };

  // 서브태스크 추가
  const handleAddSubtask = (taskId: string, title: string) => {
    addSubTask(taskId, title);
  };

  // 서브태스크 토글
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    toggleSubTask(taskId, subtaskId);
  };

  // 서브태스크 삭제
  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    deleteSubTask(taskId, subtaskId);
  };

  // 시간 블록 할당
  const handleAssignTimeBlock = (
    taskId: string,
    timeBlock: { startTime: string; endTime: string }
  ) => {
    assignTimeBlock(taskId, timeBlock);
  };

  // 시간 블록 해제
  const handleRemoveTimeBlock = (taskId: string) => {
    removeTimeBlock(taskId);
  };

  // 특정 날짜 빠른 할 일 추가 (주간 / 월간 플래너용 - 중복 방어)
  const handleQuickAddTaskForDate = (dateStr: string, title: string) => {
    const newTask = addTask({
      title,
      dueDate: dateStr,
      priority: 'P3',
      category: 'personal',
    });
    setTasks((prev) => {
      if (prev.some((t) => t.id === newTask.id)) return prev;
      return [newTask, ...prev];
    });
  };

  // 탭별 카운트 계산
  const todayStr = new Date().toISOString().split('T')[0];

  const counts = {
    today: tasks.filter((t) => !t.isCompleted && (!t.dueDate || t.dueDate <= todayStr)).length,
    inbox: tasks.filter((t) => !t.isCompleted).length,
    upcoming: tasks.filter((t) => !t.isCompleted && t.dueDate && t.dueDate > todayStr).length,
    p1: tasks.filter((t) => !t.isCompleted && t.priority === 'P1').length,
    completed: tasks.filter((t) => t.isCompleted).length,
  };

  // 카테고리별 미완료 카운트 계산
  const categoryCounts = {
    all: tasks.filter((t) => !t.isCompleted).length,
    work: tasks.filter((t) => !t.isCompleted && t.category === 'work').length,
    personal: tasks.filter((t) => !t.isCompleted && (t.category === 'personal' || !t.category)).length,
    study: tasks.filter((t) => !t.isCompleted && t.category === 'study').length,
  };

  // 스마트 필터 + 카테고리 필터 동시 적용 목록
  const currentFilteredTasks = tasks.filter((task) => {
    // 1. 카테고리 필터링
    if (selectedCategory !== 'all') {
      const taskCat = task.category || 'personal';
      if (taskCat !== selectedCategory) return false;
    }

    // 2. 스마트 필터링
    if (activeFilter === 'completed') return task.isCompleted;
    if (activeFilter === 'p1') return !task.isCompleted && task.priority === 'P1';
    if (activeFilter === 'today') {
      return !task.isCompleted && (!task.dueDate || task.dueDate <= todayStr);
    }
    if (activeFilter === 'upcoming') {
      return !task.isCompleted && task.dueDate && task.dueDate > todayStr;
    }
    // inbox
    return !task.isCompleted;
  });

  // 기본 앱 레이아웃 렌더링
  const renderAppContent = () => (
    <div
      className={`flex-1 flex flex-col ${
        isMobileSimulator
          ? 'h-full overflow-hidden'
          : 'min-h-screen pb-24 md:pb-0'
      } bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200`}
    >
      {/* =========================================================================
          1. <header id="app-header">: 상단 고정 헤더 (날짜 선택 및 과거/미래 이동 지원)
          ========================================================================= */}
      <Header
        currentStreak={isClientReady ? stats.currentStreak : 0}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        isMobileSimulator={isMobileSimulator}
        onToggleMobileSimulator={() => setIsMobileSimulator(!isMobileSimulator)}
      />

      {/* 메인 전체 레이아웃 (스마트 네비게이션 + 메인 본문 + 사이드 패널) */}
      <div className="flex-1 flex flex-row overflow-hidden max-w-[1920px] w-full mx-auto relative">
        {/* =========================================================================
            2. <nav id="smart-navigation">: 반응형 네비게이션 (데스크톱 사이드바 & 모바일 하단 탭)
            ========================================================================= */}
        <SmartNav
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          counts={counts}
          isMobileSimulator={isMobileSimulator}
        />

        {/* =========================================================================
            메인 본문 컨테이너 (뷰 모드에 따라 렌더링)
            - list: 리스트 + 타임블록 2-Column 와이드 뷰
            - timeline: 24시간 타임라인 단독 뷰
            - weekly: 월~일 7일 주간 플래너 뷰
            - monthly: 월간 캘린더 그리드 및 일자별 상세 뷰
            ========================================================================= */}
        <main
          ref={mainScrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`flex-1 flex flex-col overflow-y-auto ${
            isMobileSimulator
              ? 'cursor-grab active:cursor-grabbing pb-28 select-none'
              : 'pb-24 md:pb-8'
          }`}
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* 모바일 화면(768px 미만 또는 모바일 시뮬레이터) 전용 뷰 모드 세그먼트 전환 바 */}
          <div
            className={`${
              isMobileSimulator ? 'block' : 'md:hidden'
            } px-3 pt-2.5 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs shrink-0`}
          >
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                리스트
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                일간
              </button>
              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  viewMode === 'weekly'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                주간
              </button>
              <button
                type="button"
                onClick={() => setViewMode('monthly')}
                className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  viewMode === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                월간
              </button>
            </div>
          </div>

          {viewMode === 'list' && (
            <div className={`flex-1 flex flex-col ${isMobileSimulator ? '' : 'lg:flex-row'}`}>
              {/* 좌측 중앙 메인: 퀵 캡처 + 스마트 할 일 플로우 리스트 */}
              <div className="flex-1 p-4 md:p-8 space-y-6 w-full max-w-3xl xl:max-w-4xl mx-auto lg:mx-0">
                <QuickCapture onTaskAdded={handleTaskAdded} />

                <TaskFlowView
                  tasks={currentFilteredTasks}
                  allTasks={tasks}
                  activeFilter={activeFilter}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  categoryCounts={categoryCounts}
                  onToggleComplete={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onUpdatePriority={handleUpdatePriority}
                  onUpdateCategory={handleUpdateCategory}
                  onAddSubtask={handleAddSubtask}
                  onToggleSubtask={handleToggleSubtask}
                  onDeleteSubtask={handleDeleteSubtask}
                />
              </div>

              {/* 우측 전용 패널: 24시간 타임 블록 플래너 (선택된 날짜 연동 - 데스크톱 리스트 뷰에서만 노출, 모바일 시뮬레이터에서는 상단 '일간' 탭으로 분리) */}
              {!isMobileSimulator && (
                <div className="hidden lg:block w-[420px] xl:w-[480px] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-950/40 p-4 md:p-6 shrink-0 transition-colors duration-200">
                  <TimeBlockPlanner
                    tasks={tasks}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onAssignTimeBlock={handleAssignTimeBlock}
                    onRemoveTimeBlock={handleRemoveTimeBlock}
                    onToggleComplete={handleToggleTask}
                  />
                </div>
              )}
            </div>
          )}

          {viewMode === 'timeline' && (
            <div className="flex-1 p-4 md:p-8 space-y-6 w-full max-w-5xl mx-auto">
              <QuickCapture onTaskAdded={handleTaskAdded} />

              <TimeBlockPlanner
                tasks={tasks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onAssignTimeBlock={handleAssignTimeBlock}
                onRemoveTimeBlock={handleRemoveTimeBlock}
                onToggleComplete={handleToggleTask}
              />
            </div>
          )}

          {viewMode === 'weekly' && (
            <div className="flex-1 p-4 md:p-8 space-y-6 w-full max-w-7xl mx-auto">
              <QuickCapture onTaskAdded={handleTaskAdded} />

              <WeeklyPlanner
                tasks={tasks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onToggleComplete={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onQuickAddTaskForDate={handleQuickAddTaskForDate}
              />
            </div>
          )}

          {viewMode === 'monthly' && (
            <div className="flex-1 p-4 md:p-8 space-y-6 w-full max-w-7xl mx-auto">
              <QuickCapture onTaskAdded={handleTaskAdded} />

              <MonthlyCalendar
                tasks={tasks}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onToggleComplete={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onQuickAddTaskForDate={handleQuickAddTaskForDate}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );

  // 모바일 시뮬레이터 모드 활성화 시 실제 휴대폰 사이즈(390px) 스마트폰 목업 프레임 렌더링
  if (isMobileSimulator) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none">
        {/* 시뮬레이터 상단 알림 바 */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-800/50 px-4 py-2.5 flex items-center justify-between shadow-xl shrink-0 z-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-xs md:text-sm truncate">
              📱 실제 스마트폰 화면 시뮬레이터 (390 × 844px)
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              iPhone / Galaxy 표준
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Hand className="w-3.5 h-3.5 text-indigo-400" />
              마우스 드래그 & 터치 제스처 스크롤 지원
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenMobilePopup}
              title="별도 390px 팝업창으로 열어 브라우저 모바일 개발자 도구 및 터치 제스처를 사용합니다"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">↗️ 390px 독립 팝업창으로 열기</span>
              <span className="sm:hidden">팝업창</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMobileSimulator(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition shadow-md active:scale-95"
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-600" />
              <span>💻 데스크톱 뷰로 복귀</span>
            </button>
          </div>
        </div>

        {/* 스마트폰 중앙 목업 프레임 */}
        <div className="flex-1 flex items-center justify-center p-2 md:p-6 overflow-y-auto bg-slate-950/90 backdrop-blur-md">
          <div className="w-[390px] h-[844px] max-h-[92vh] rounded-[48px] border-[10px] border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-2xl shadow-black/90 overflow-hidden relative flex flex-col ring-4 ring-slate-800/70 shrink-0">
            {/* 상단 다이나믹 아일랜드 & 노치 */}
            <div className="h-10 bg-white dark:bg-slate-950 px-6 flex items-center justify-between shrink-0 select-none text-[11px] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-900 z-50">
              <span>09:41</span>
              <div className="w-24 h-4.5 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* 실제 앱 내용 (390px 스마트폰 사이즈로 작동 - min-h-0 및 overflow-hidden으로 내부 단일 스크롤 보장) */}
            <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
              {renderAppContent()}
            </div>

            {/* 하단 홈 인디케이터 바 */}
            <div className="h-5 bg-white dark:bg-slate-950 shrink-0 flex items-center justify-center border-t border-slate-100 dark:border-slate-900 z-50">
              <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return renderAppContent();
}
