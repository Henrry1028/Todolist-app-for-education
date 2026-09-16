'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  HelpCircle,
  X,
  Keyboard,
  Sun,
  Moon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Smartphone,
  Monitor,
  CheckCircle2,
  Download,
  Info,
} from 'lucide-react';
import { getStoredTheme, toggleTheme, ThemeMode } from '@/lib/theme';
import { getDateInfo, toDateString, getMonthCalendarDays } from '@/lib/dateUtils';

interface HeaderProps {
  currentStreak?: number;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  isMobileSimulator?: boolean;
  onToggleMobileSimulator?: () => void;
}

export function Header({
  currentStreak = 0,
  selectedDate = new Date(),
  onSelectDate,
  isMobileSimulator = false,
  onToggleMobileSimulator,
}: HeaderProps) {
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAppVersionModal, setShowAppVersionModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('dark');
  const [isMounted, setIsMounted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);

  // 미니 달력 팝오버용 월/연도 탐색 상태
  const [pickerYear, setPickerYear] = useState<number>(selectedDate.getFullYear());
  const [pickerMonth, setPickerMonth] = useState<number>(selectedDate.getMonth() + 1);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateInfo = getDateInfo(selectedDate);

  // 실시간 뷰포트 반응형 감지
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const isDesktop = viewportWidth >= 1024;
  const isEffectiveMobile = isMobileSimulator || isMobile;

  // 외부 클릭 시 날짜 팝오버 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  // 선택 날짜 변경 시 팝오버의 연/월도 동기화
  useEffect(() => {
    setPickerYear(selectedDate.getFullYear());
    setPickerMonth(selectedDate.getMonth() + 1);
  }, [selectedDate]);

  useEffect(() => {
    setIsMounted(true);
    setCurrentTheme(getStoredTheme());

    const handleThemeChange = (e: CustomEvent<ThemeMode>) => {
      setCurrentTheme(e.detail);
    };

    window.addEventListener(
      'flowdo_theme_change',
      handleThemeChange as EventListener
    );
    return () =>
      window.removeEventListener(
        'flowdo_theme_change',
        handleThemeChange as EventListener
      );
  }, []);

  const handleToggleMode = () => {
    const nextTheme = toggleTheme();
    setCurrentTheme(nextTheme);
  };

  // 하루 전으로 이동
  const handlePrevDay = () => {
    if (!onSelectDate) return;
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onSelectDate(prev);
  };

  // 하루 뒤로 이동
  const handleNextDay = () => {
    if (!onSelectDate) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onSelectDate(next);
  };

  // 오늘로 리셋
  const handleResetToday = () => {
    if (!onSelectDate) return;
    onSelectDate(new Date());
    setShowDatePicker(false);
  };

  // 팝오버 내 특정 일자 클릭 시
  const handlePickDate = (d: Date) => {
    if (!onSelectDate) return;
    onSelectDate(d);
    setShowDatePicker(false);
  };

  // 팝오버 내 월 이동
  const handlePrevMonth = () => {
    if (pickerMonth === 1) {
      setPickerYear((y) => y - 1);
      setPickerMonth(12);
    } else {
      setPickerMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (pickerMonth === 12) {
      setPickerYear((y) => y + 1);
      setPickerMonth(1);
    } else {
      setPickerMonth((m) => m + 1);
    }
  };

  const calendarDays = getMonthCalendarDays(pickerYear, pickerMonth);

  return (
    <>
      <header
        id="app-header"
        className={`sticky top-0 z-40 w-full h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md ${
          isMobileSimulator ? 'px-3' : 'px-3 md:px-8'
        } flex items-center justify-between transition-colors duration-200 select-none`}
      >
        {/* 좌측: 로고("FlowDo") & (데스크톱일 때만 단축키 안내 및 시뮬레이터 토글 버튼) */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
            </div>
            <span className="font-black tracking-tight text-base md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400">
              FlowDo
            </span>
          </div>

          {!isMobileSimulator && (
            <>
              {/* 단축키 안내 툴팁 토글 버튼 */}
              <div className="relative">
                <button
                  onClick={() => setShowShortcutHelp(!showShortcutHelp)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition flex items-center justify-center"
                  title="단축키 및 자연어 안내"
                  aria-label="단축키 안내"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {/* 앱 / 웹 버전 확인 및 모바일 사이즈 화면 전환 버튼 */}
              <button
                type="button"
                onClick={() => {
                  if (onToggleMobileSimulator) {
                    onToggleMobileSimulator();
                  } else {
                    setShowAppVersionModal(true);
                  }
                }}
                className="flex items-center gap-1.5 px-2 py-1 md:px-2.5 md:py-1 rounded-xl border text-[11px] md:text-xs font-semibold transition active:scale-95 shadow-2xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                title="클릭 시 실제 휴대폰 사이즈 화면(390px) 및 터치 스크롤 모드로 전환"
                aria-label="앱 및 웹 버전 확인 및 모바일 화면 전환"
              >
                {isMounted && isMobile ? (
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                ) : (
                  <Monitor className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
                <span className="hidden sm:inline font-mono">
                  {isMounted && isMobile ? 'App v1.2' : 'Web/App v1.2'}
                </span>
                <span className="sm:hidden font-mono text-[10px]">v1.2</span>
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500 animate-pulse" />
              </button>
            </>
          )}
        </div>

        {/* =========================================================================
            중앙: 날짜 선택기 & 과거나 미래 시점 자유 이동 배지
            ========================================================================= */}
        <div className="relative" ref={datePickerRef}>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 shadow-sm">
            {/* 하루 전 이동 */}
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
              title="하루 전"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* 날짜 클릭 시 달력 팝오버 열림 */}
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-white dark:hover:bg-slate-800/80 transition"
              title="클릭하여 과거나 미래 날짜 선택"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className={isEffectiveMobile ? 'hidden' : 'hidden sm:inline font-bold'}>
                {dateInfo.formattedFull}
              </span>
              <span className={isEffectiveMobile ? 'inline font-bold text-[11px]' : 'sm:hidden font-bold'}>
                {dateInfo.formattedMedium}
              </span>

              {/* 공휴일 배지 (네이버 달력 연동) */}
              {dateInfo.isHoliday && (
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40 animate-pulse">
                  🔴 {dateInfo.holidayName}
                </span>
              )}

              {/* 오늘 여부 배지 */}
              {dateInfo.isToday ? (
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  오늘
                </span>
              ) : (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold border ${
                    dateInfo.diffDays < 0
                      ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                  }`}
                >
                  {dateInfo.relativeLabel}
                </span>
              )}
            </button>

            {/* 하루 뒤 이동 */}
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
              title="하루 뒤"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* 오늘이 아닐 때 나타나는 '오늘로 복귀' 버튼 */}
            {!isEffectiveMobile && !dateInfo.isToday && (
              <button
                type="button"
                onClick={handleResetToday}
                className="hidden md:flex items-center gap-1 ml-1 px-2 py-0.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] font-bold transition shadow-xs"
                title="오늘 날짜로 돌아가기"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>오늘로 복귀</span>
              </button>
            )}
          </div>

          {/* 클릭 시 열리는 미니 달력 팝오버 (과거/미래 날짜 워프) */}
          {showDatePicker && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              {/* 팝오버 헤더: 월 이동 & 오늘로 이동 */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                  {pickerYear}년 {pickerMonth}월
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                <span className="text-rose-500">일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span className="text-blue-500">토</span>
              </div>

              {/* 달력 날짜 셀 그리드 */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((c) => {
                  const isSelected = toDateString(c.date) === toDateString(selectedDate);
                  return (
                    <button
                      key={c.dateStr}
                      type="button"
                      onClick={() => handlePickDate(c.date)}
                      title={c.holidayName || undefined}
                      className={`h-7 rounded-lg text-xs font-mono font-medium flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-black shadow-sm'
                          : c.isToday
                          ? 'border border-indigo-400/80 text-indigo-600 dark:text-indigo-400 font-bold'
                          : c.isHoliday
                          ? 'text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          : c.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'text-slate-300 dark:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {c.dayNumber}
                    </button>
                  );
                })}
              </div>

              {/* 하단 오늘 바로가기 & 네이버 연동 상태 */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResetToday}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>오늘({toDateString(new Date())})로 이동</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    닫기
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>네이버 달력 공휴일 기준 연동됨</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 우측: 다크/라이트 모드 토글 + 스트릭 배지 + 로컬 스토리지 동기화 인디케이터 */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* 다크/일반 모드 선택 버튼 */}
          <button
            type="button"
            onClick={handleToggleMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition active:scale-95 flex items-center justify-center shadow-sm"
            title={
              currentTheme === 'dark'
                ? '일반(라이트) 모드로 전환'
                : '다크 모드로 전환'
            }
            aria-label="테마 전환"
          >
            {isMounted && currentTheme === 'light' ? (
              <Moon className="w-4 h-4 text-indigo-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* 로컬 스토리지 동기화 인디케이터 (모바일에서는 숨김, 768px 이상 표시) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Local Ready</span>
          </div>
        </div>
      </header>

      {/* 단축키 및 자연어 사용법 가이드 팝업 모달 */}
      {showShortcutHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  FlowDo 키보드 & NLP 치트시트
                </h3>
              </div>
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-[11px]">
                  글로벌 단축키
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-700 dark:text-slate-300">
                      퀵 캡처 입력창 포커스
                    </span>
                    <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-indigo-600 dark:text-indigo-300">
                      ⌘ + K / Ctrl + K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <span className="text-slate-700 dark:text-slate-300">
                      할 일 등록 (Optimistic UI)
                    </span>
                    <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-indigo-600 dark:text-indigo-300">
                      Enter
                    </kbd>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-[11px]">
                  자연어 실시간 파싱 & 카테고리 자동 분류
                </h4>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      카테고리:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      내용을 분석하여 🏢 업무 / 👤 개인 / 📚 공부 자동 분류
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      마감일:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      "오늘", "내일", "모레"
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      시간:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      "오후 3시", "오전 9시 30분" (타임블록 자동생성)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      우선순위:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">
                      !p1, !p2, !p3, !p4
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      태그:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">
                      #업무, #개인, #공부, #프로젝트
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                💬 <strong>예시:</strong> "내일 오후 2시 주간 회의 #업무 !p1"
                을 입력하고 Enter를 치면 모든 정보와 카테고리가 자동 정제되어 추가됩니다.
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 앱/웹 버전 및 반응형 모바일 디바이스 상태 안내 모달 */}
      {showAppVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-200">
            {/* 상단 타이틀 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {isMobile ? (
                    <Smartphone className="w-5 h-5" />
                  ) : (
                    <Monitor className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    FlowDo 앱 / 웹 버전 정보
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      v1.2.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    모바일 스마트폰 & 데스크톱 완벽 대응 반응형 웹앱
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAppVersionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 디바이스 환경 카드 */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  현재 접속 디바이스 환경
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">모드:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {isMobile ? '📱 스마트폰 (모바일)' : isTablet ? '📱 태블릿 모드' : '💻 PC 데스크톱 (웹)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">화면 너비:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                      {viewportWidth}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">반응형 최적화:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% 대응
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">스토리지:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 로컬 퍼스트
                    </span>
                  </div>
                </div>
              </div>

              {/* 휴대폰에서 앱처럼 사용하는 방법 (PWA 가이드) */}
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>스마트폰 홈 화면에 앱(PWA)으로 설치하는 방법</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed list-disc list-inside">
                  <li>
                    <strong>아이폰 (iOS Safari)</strong>: 하단 <strong>공유(↑)</strong> 버튼 ➔ <strong>'홈 화면에 추가'</strong> 클릭 시 앱스토어 앱처럼 전체화면으로 실행됩니다.
                  </li>
                  <li>
                    <strong>안드로이드 (Galaxy / Chrome)</strong>: 우측 상단 <strong>메뉴(⋮)</strong> ➔ <strong>'앱 설치'</strong> 또는 <strong>'홈 화면에 추가'</strong> 클릭.
                  </li>
                  <li>
                    오프라인 상태에서도 0초 지연 로컬 저장소로 모든 일정을 안전하게 보존합니다.
                  </li>
                </ul>
              </div>

              {/* 모바일 전용 반응형 지원 기능 */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  모바일 스마트폰 최적화 탑재 기능
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span>하단 고정 스마트 탭바</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span>터치 기반 시간 지정 모달</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span>네이버 달력 공휴일 라벨</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✔</span>
                    <span>상단 리스트/일/주/월 퀵전환</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAppVersionModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
