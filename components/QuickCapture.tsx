'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Tag as TagIcon,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { parseQuickInput, ParsedTaskInput } from '@/lib/nlpParser';
import { addTask } from '@/lib/storage';
import { Task, Priority } from '@/types/todo';

interface QuickCaptureProps {
  onTaskAdded?: (task: Task) => void;
}

export function QuickCapture({ onTaskAdded }: QuickCaptureProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // 1. 페이지 진입 시 인풋 자동 포커스 (Auto-focus)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 2. 전역 단축키 감지: 어디서든 Cmd+K / Ctrl+K 누르면 퀵 캡처 인풋으로 즉시 이동
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 3. 실시간 자연어 파싱 (NLP Parsing)
  const parsed: ParsedTaskInput = useMemo(() => {
    return parseQuickInput(input);
  }, [input]);

  // 4. 태스크 등록 처리 (Enter 입력 시 Optimistic UI 실행 및 중복 제출 원천 차단)
  const handleCommitTask = () => {
    if (isSubmittingRef.current) return;
    const trimmed = input.trim();
    if (!trimmed) return;

    // 즉시 중복 방지 락 활성화 및 입력창 초기화
    isSubmittingRef.current = true;
    setInput('');

    try {
      const taskTitle = parsed.cleanTitle || trimmed;

      // 로컬 스토리지에 즉시 추가 (Optimistic UI)
      const newTask = addTask({
        title: taskTitle,
        priority: parsed.priority,
        category: parsed.category,
        dueDate: parsed.dueDate,
        timeBlock: parsed.timeBlock,
        tags: parsed.tags,
        recurrence: 'none',
        subtasks: [],
      });

      if (onTaskAdded) {
        onTaskAdded(newTask);
      }
    } finally {
      // 300ms 디바운스 락으로 키보드 연타/더블 엔터 완전 차단
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중(isComposing 또는 keyCode 229) Enter 중복 이벤트 방어
    if (e.nativeEvent.isComposing || e.keyCode === 229 || isComposingRef.current) {
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitTask();
    }
  };

  const getPriorityBadgeClass = (p: Priority) => {
    switch (p) {
      case 'P1':
        return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40';
      case 'P2':
        return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/40';
      case 'P3':
        return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40';
      case 'P4':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/40 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <section
      id="quick-capture"
      className={`relative p-4 md:p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900/60 border transition-all duration-200 shadow-lg dark:shadow-xl dark:shadow-black/25 ${
        isFocused
          ? 'border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-indigo-500/5'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* 인풋 헤더 라벨 & 단축키 안내 */}
      <div className="flex items-center justify-between mb-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>초저지연 퀵 캡처</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
          <span className="hidden sm:inline">단축키</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
          <span className="text-slate-400">•</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Enter
          </kbd>
          <span className="hidden sm:inline">등록</span>
        </div>
      </div>

      {/* 입력창 본체 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="오늘 오후 3시 기획서 작성 #업무 !p1 (자연어로 입력하세요)"
          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-3.5 pr-24 text-sm md:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition"
        />

        {/* 우측 등록 액션 버튼 */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            onClick={handleCommitTask}
            disabled={!input.trim()}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              input.trim()
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>등록</span>
          </button>
        </div>
      </div>

      {/* 3. 실시간 자연어 파싱 미리보기 칩 (NLP Preview Chips) */}
      {input.trim() ? (
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-2 text-xs animate-in fade-in duration-150">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            감지된 태스크:
          </span>

          {/* 제목 미리보기 */}
          <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950/60 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 truncate max-w-xs">
            {parsed.cleanTitle || '(제목 없음)'}
          </span>

          {/* 마감일 칩 */}
          {parsed.dueDateLabel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
              <Calendar className="w-3 h-3" />
              {parsed.dueDateLabel}
            </span>
          )}

          {/* 타임 블록 시간 칩 */}
          {parsed.timeBlockLabel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30">
              <Clock className="w-3 h-3" />
              {parsed.timeBlockLabel}
            </span>
          )}

          {/* 카테고리 자동 분류 칩 */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all ${
              parsed.category === 'work'
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30'
                : parsed.category === 'study'
                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
            }`}
          >
            <span>{parsed.categoryLabel}</span>
            {parsed.isAutoClassified && (
              <span className="text-[10px] font-medium opacity-85 px-1.5 py-0.2 rounded bg-white/60 dark:bg-black/20 border border-current/20">
                {parsed.matchedKeyword?.startsWith('#')
                  ? '태그 지정'
                  : `자동 분류: ${parsed.matchedKeyword}`}
              </span>
            )}
          </span>

          {/* 우선순위 칩 */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border ${getPriorityBadgeClass(
              parsed.priority
            )}`}
          >
            우선순위: {parsed.priority}
          </span>

          {/* 태그 칩 */}
          {parsed.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30"
            >
              <TagIcon className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              #{tag}
            </span>
          ))}
        </div>
      ) : (
        /* 빈 입력 상태일 때의 안내 힌트 */
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline">
            💡 팁: '내일', '오후 2시', '!p1', '#태그' 키워드를 포함하여 자연스럽게 작성해보세요.
          </span>
          <span className="sm:hidden">💡 '내일', '!p1', '#태그' 자동 파싱 지원</span>
          <span className="font-mono text-slate-400">Zero-Latency</span>
        </div>
      )}
    </section>
  );
}

export default QuickCapture;
