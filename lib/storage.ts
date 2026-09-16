import { Task, UserStats, Priority, Category } from '@/types/todo';

const STORAGE_KEYS = {
  TASKS: 'flowdo_tasks_v1',
  STATS: 'flowdo_user_stats_v1',
} as const;

const getSampleHistory = (): Record<string, number> => {
  const history: Record<string, number> = {};
  const now = new Date();
  for (let i = 21; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const k = d.toISOString().split('T')[0];
    if (i <= 3) {
      history[k] = i === 1 ? 4 : i === 2 ? 3 : 5;
    } else if (i % 3 !== 0) {
      history[k] = (i % 4) + 1;
    }
  }
  const todayKey = now.toISOString().split('T')[0];
  history[todayKey] = 1;
  return history;
};

export const INITIAL_STATS: UserStats = {
  currentStreak: 3,
  longestStreak: 7,
  lastCompletedDate: new Date().toISOString().split('T')[0],
  totalCompleted: 12,
  completionHistory: getSampleHistory(),
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-welcome-1',
    title: 'FlowDo에 오신 것을 환영합니다! 🚀',
    description: '초저지연 반응형 스마트 Todo 앱으로 하루의 생산성을 극대화하세요.',
    isCompleted: false,
    priority: 'P1',
    category: 'work',
    dueDate: new Date().toISOString().split('T')[0],
    timeBlock: { startTime: '09:00', endTime: '10:00' },
    recurrence: 'none',
    subtasks: [
      { id: 'sub-1', title: '스마트 네비게이션 둘러보기', isCompleted: true },
      { id: 'sub-2', title: '첫 번째 할 일 등록해보기', isCompleted: false },
    ],
    tags: ['온보딩', '시작하기'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-welcome-2',
    title: '타임 블록 플래너로 오늘 일정 확인하기 ⏱️',
    description: '할 일에 시간 블록을 설정하고 일정을 시각적으로 관리해보세요.',
    isCompleted: false,
    priority: 'P2',
    category: 'work',
    dueDate: new Date().toISOString().split('T')[0],
    timeBlock: { startTime: '14:00', endTime: '15:30' },
    recurrence: 'daily',
    subtasks: [],
    tags: ['집중', '타임블록'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-welcome-3',
    title: '오늘의 스트릭 목표 달성하기 🔥',
    description: '매일 할 일을 완료하여 연속 달성 스트릭을 이어나가세요.',
    isCompleted: true,
    priority: 'P3',
    category: 'personal',
    dueDate: new Date().toISOString().split('T')[0],
    recurrence: 'daily',
    subtasks: [],
    tags: ['습관'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * SSR Hydration 안전 검사 헬퍼
 */
export const isBrowser = (): boolean => typeof window !== 'undefined';

/**
 * 로컬 스토리지 변경 이벤트 디스패처 (초저지연 탭/컴포넌트 간 반응형 동기화 지원)
 */
function notifyStorageChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent('flowdo_storage_change'));
}

/**
 * 전체 태스크 목록 조회
 */
export function getTasks(): Task[] {
  if (!isBrowser()) return INITIAL_TASKS;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      // 초기 실행 시 샘플 데이터 세팅
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw) as Task[];

    // 기존 데이터 내 비정상 중복 태스크(동일 ID 또는 3초 이내 동일 속성으로 복제된 태스크) 자동 정리
    let cleaned = false;
    const uniqueTasks: Task[] = [];
    for (const task of parsed) {
      const isDuplicate = uniqueTasks.some((u) => {
        // 1. 완전 동일한 ID
        if (u.id === task.id) return true;
        // 2. 동일한 제목, 마감일, 시간블록이면서 생성 시간이 3초 이내인 비정상 중복 복제본
        const sameTitle = u.title.trim() === task.title.trim();
        const sameDueDate = u.dueDate === task.dueDate;
        const sameStartTime = u.timeBlock?.startTime === task.timeBlock?.startTime;
        const sameEndTime = u.timeBlock?.endTime === task.timeBlock?.endTime;
        const sameTime = (!u.timeBlock && !task.timeBlock) || (sameStartTime && sameEndTime);

        const timeDiff = Math.abs(
          new Date(u.createdAt).getTime() - new Date(task.createdAt).getTime()
        );

        if (sameTitle && sameDueDate && sameTime && timeDiff < 3000) {
          return true;
        }

        return false;
      });

      if (isDuplicate) {
        cleaned = true;
      } else {
        uniqueTasks.push(task);
      }
    }

    if (cleaned) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(uniqueTasks));
    }

    return uniqueTasks;
  } catch (error) {
    console.error('[FlowDo Storage] Failed to load tasks:', error);
    return INITIAL_TASKS;
  }
}

/**
 * 전체 태스크 저장
 */
export function saveTasks(tasks: Task[]): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    notifyStorageChange();
  } catch (error) {
    console.error('[FlowDo Storage] Failed to save tasks:', error);
  }
}

/**
 * 단일 태스크 추가 (중복 방지 가드 탑재)
 */
export function addTask(newTaskData: Partial<Task> & { title: string }): Task {
  const tasks = getTasks();
  const now = new Date().toISOString();
  const trimmedTitle = newTaskData.title.trim();

  // 중복 태스크 생성 방지 가드:
  // 최근 2.5초 이내에 동일한 제목, dueDate, timeBlock으로 등록된 미완료 태스크가 있다면
  // 더블 클릭/더블 엔터로 인한 중복 생성을 원천 방어하고 기존 태스크 반환
  const existingRecent = tasks.find((t) => {
    if (t.isCompleted) return false;
    if (t.title.trim() !== trimmedTitle) return false;
    if (t.dueDate !== newTaskData.dueDate) return false;
    const sameTime =
      (!t.timeBlock && !newTaskData.timeBlock) ||
      (t.timeBlock?.startTime === newTaskData.timeBlock?.startTime &&
        t.timeBlock?.endTime === newTaskData.timeBlock?.endTime);
    if (!sameTime) return false;

    const timeDiff = Math.abs(new Date(now).getTime() - new Date(t.createdAt).getTime());
    return timeDiff < 2500;
  });

  if (existingRecent) {
    console.warn('[FlowDo Storage] Prevented duplicate task creation:', trimmedTitle);
    return existingRecent;
  }

  const task: Task = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: trimmedTitle,
    description: newTaskData.description || '',
    isCompleted: false,
    priority: newTaskData.priority || 'P3',
    category: newTaskData.category || 'personal',
    dueDate: newTaskData.dueDate,
    timeBlock: newTaskData.timeBlock,
    recurrence: newTaskData.recurrence || 'none',
    subtasks: newTaskData.subtasks || [],
    tags: newTaskData.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  const updatedTasks = [task, ...tasks];
  saveTasks(updatedTasks);
  return task;
}

/**
 * 태스크 수정
 */
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getTasks();
  let updatedTask: Task | null = null;

  const updatedTasks = tasks.map((t) => {
    if (t.id === id) {
      updatedTask = {
        ...t,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedTask;
    }
    return t;
  });

  if (updatedTask) {
    saveTasks(updatedTasks);
  }
  return updatedTask;
}

/**
 * 태스크 완료 토글 및 스트릭 통계 연동
 */
export function toggleTaskCompletion(id: string): Task | null {
  const tasks = getTasks();
  let targetTask: Task | null = null;

  const updatedTasks = tasks.map((t) => {
    if (t.id === id) {
      const nextCompleted = !t.isCompleted;
      targetTask = {
        ...t,
        isCompleted: nextCompleted,
        updatedAt: new Date().toISOString(),
      };
      return targetTask;
    }
    return t;
  });

  if (targetTask) {
    saveTasks(updatedTasks);
    // 완료 상태로 변경되었을 때 스트릭 및 통계 갱신
    recordTaskCompletion((targetTask as Task).isCompleted);
  }

  return targetTask;
}

/**
 * 태스크 삭제
 */
export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);

  if (filtered.length !== tasks.length) {
    saveTasks(filtered);
    return true;
  }
  return false;
}

/**
 * 유저 통계 및 스트릭 조회
 */
export function getUserStats(): UserStats {
  if (!isBrowser()) return INITIAL_STATS;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_STATS));
      return INITIAL_STATS;
    }
    return JSON.parse(raw) as UserStats;
  } catch (error) {
    console.error('[FlowDo Storage] Failed to load user stats:', error);
    return INITIAL_STATS;
  }
}

/**
 * 유저 통계 갱신
 */
export function updateUserStats(updater: (prev: UserStats) => UserStats): UserStats {
  const current = getUserStats();
  const next = updater(current);

  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(next));
      notifyStorageChange();
    } catch (error) {
      console.error('[FlowDo Storage] Failed to update user stats:', error);
    }
  }

  return next;
}

/**
 * 태스크 완료에 따른 스트릭 자동 계산 로직
 */
export function recordTaskCompletion(completed: boolean): UserStats {
  return updateUserStats((prev) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const prevHistory = prev.completionHistory || {};
    const todayCount = prevHistory[todayStr] || 0;

    if (!completed) {
      // 완료 취소 시 총 완료 수 및 오늘 히스토리 감소
      return {
        ...prev,
        totalCompleted: Math.max(0, prev.totalCompleted - 1),
        completionHistory: {
          ...prevHistory,
          [todayStr]: Math.max(0, todayCount - 1),
        },
      };
    }

    const isSameDay = prev.lastCompletedDate === todayStr;

    let newStreak = prev.currentStreak;
    if (!isSameDay) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (prev.lastCompletedDate === yesterdayStr) {
        newStreak += 1;
      } else if (!prev.lastCompletedDate) {
        newStreak = 1;
      } else {
        newStreak = 1; // 연속일 깨짐 후 재시작
      }
    }

    return {
      currentStreak: newStreak,
      longestStreak: Math.max(prev.longestStreak, newStreak),
      lastCompletedDate: todayStr,
      totalCompleted: prev.totalCompleted + 1,
      completionHistory: {
        ...prevHistory,
        [todayStr]: todayCount + 1,
      },
    };
  });
}

/**
 * 서브태스크 추가
 */
export function addSubTask(taskId: string, title: string): Task | null {
  const trimmed = title.trim();
  if (!trimmed) return null;

  const tasks = getTasks();
  let updatedTask: Task | null = null;

  const updatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      const newSub: { id: string; title: string; isCompleted: boolean } = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: trimmed,
        isCompleted: false,
      };
      updatedTask = {
        ...t,
        subtasks: [...t.subtasks, newSub],
        updatedAt: new Date().toISOString(),
      };
      return updatedTask;
    }
    return t;
  });

  if (updatedTask) {
    saveTasks(updatedTasks);
  }
  return updatedTask;
}

/**
 * 서브태스크 완료 토글
 */
export function toggleSubTask(taskId: string, subTaskId: string): Task | null {
  const tasks = getTasks();
  let updatedTask: Task | null = null;

  const updatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      const updatedSubtasks = t.subtasks.map((st) =>
        st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
      );
      updatedTask = {
        ...t,
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString(),
      };
      return updatedTask;
    }
    return t;
  });

  if (updatedTask) {
    saveTasks(updatedTasks);
  }
  return updatedTask;
}

/**
 * 서브태스크 삭제
 */
export function deleteSubTask(taskId: string, subTaskId: string): Task | null {
  const tasks = getTasks();
  let updatedTask: Task | null = null;

  const updatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      updatedTask = {
        ...t,
        subtasks: t.subtasks.filter((st) => st.id !== subTaskId),
        updatedAt: new Date().toISOString(),
      };
      return updatedTask;
    }
    return t;
  });

  if (updatedTask) {
    saveTasks(updatedTasks);
  }
  return updatedTask;
}

/**
 * 태스크 우선순위 변경
 */
export function updateTaskPriority(taskId: string, priority: Priority): Task | null {
  return updateTask(taskId, { priority });
}

/**
 * 태스크 카테고리 변경 (업무 / 개인 / 공부)
 */
export function updateTaskCategory(taskId: string, category: Category): Task | null {
  return updateTask(taskId, { category });
}

/**
 * 태스크에 시간 블록 할당
 */
export function assignTimeBlock(
  taskId: string,
  timeBlock: { startTime: string; endTime: string }
): Task | null {
  return updateTask(taskId, { timeBlock });
}

/**
 * 태스크의 시간 블록 제거 (미배치 상태로 변경)
 */
export function removeTimeBlock(taskId: string): Task | null {
  const tasks = getTasks();
  let updatedTask: Task | null = null;

  const updatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      const copy = { ...t, updatedAt: new Date().toISOString() };
      delete copy.timeBlock;
      updatedTask = copy;
      return copy;
    }
    return t;
  });

  if (updatedTask) {
    saveTasks(updatedTasks);
  }
  return updatedTask;
}
