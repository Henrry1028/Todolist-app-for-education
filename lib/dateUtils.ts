/**
 * 날짜 및 주간/월간 캘린더 계산 유틸리티 (네이버 달력 휴일정보 연동)
 */
import { getHoliday } from './holidays';

const DAYS_OF_WEEK_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const DAYS_OF_WEEK_SHORT_KO = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * Date 객체를 'YYYY-MM-DD' 형식 문자열로 변환
 */
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 특정 Date 객체의 상세 정보 반환 (공휴일 정보 포함)
 */
export function getDateInfo(d: Date = new Date()) {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayOfWeekStr = DAYS_OF_WEEK_KO[d.getDay()];
  const dayOfWeekShort = DAYS_OF_WEEK_SHORT_KO[d.getDay()];
  const dateStr = toDateString(d);

  const todayStr = toDateString(new Date());
  const isToday = dateStr === todayStr;

  // 네이버 달력 기준 공휴일 조회
  const holiday = getHoliday(dateStr);
  const isHoliday = !!holiday;
  const holidayName = holiday?.name;

  // 오늘 기준 일수 차이 계산
  const todayDateOnly = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const targetDateOnly = new Date(year, month - 1, day);
  const diffTime = targetDateOnly.getTime() - todayDateOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let relativeLabel = '오늘';
  if (diffDays === -1) relativeLabel = '어제';
  else if (diffDays === -2) relativeLabel = '그저께';
  else if (diffDays < 0) relativeLabel = `${Math.abs(diffDays)}일 전`;
  else if (diffDays === 1) relativeLabel = '내일';
  else if (diffDays === 2) relativeLabel = '모레';
  else if (diffDays > 0) relativeLabel = `${diffDays}일 후`;

  return {
    year,
    month,
    day,
    dayOfWeekStr,
    dayOfWeekShort,
    dateStr,
    isToday,
    isHoliday,
    holidayName,
    diffDays,
    relativeLabel,
    formattedFull: `${year}년 ${month}월 ${day}일 (${dayOfWeekStr})`,
    formattedMedium: `${year}. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')} (${dayOfWeekShort})`,
    formattedShort: `${month}월 ${day}일 (${dayOfWeekShort})`,
  };
}

/**
 * 오늘 날짜 상세 정보 반환
 */
export function getTodayInfo() {
  return getDateInfo(new Date());
}

/**
 * 기준 날짜가 속한 주(월요일 ~ 일요일)의 7일 날짜 정보 배열 반환
 */
export function getWeekDates(baseDate: Date = new Date()) {
  const todayStr = toDateString(new Date());
  const current = new Date(baseDate);
  
  // 월요일을 주의 시작으로 설정 (0: 일요일 -> -6, 1: 월요일 -> 0 ...)
  const dayOfWeek = current.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = toDateString(d);
    const holiday = getHoliday(dateStr);
    
    weekDays.push({
      date: d,
      dateStr,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      dayNumber: d.getDate(),
      dayName: DAYS_OF_WEEK_SHORT_KO[d.getDay()],
      isToday: dateStr === todayStr,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isHoliday: !!holiday,
      holidayName: holiday?.name,
    });
  }

  return weekDays;
}

/**
 * 특정 연/월의 달력 그리드에 표시할 일자 배열 (이전 달 여백 + 해당 월 + 다음 달 여백, 공휴일 연동)
 */
export function getMonthCalendarDays(year: number, month: number) {
  const todayStr = toDateString(new Date());
  
  // month는 1-based (1: 1월, 12: 12월)
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)
  const totalDays = lastDayOfMonth.getDate();

  const days = [];

  // 1. 이전 달 날짜 채우기
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 2, prevMonthLastDay - i);
    const dateStr = toDateString(prevDate);
    const holiday = getHoliday(dateStr);
    days.push({
      date: prevDate,
      dateStr,
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isHoliday: !!holiday,
      holidayName: holiday?.name,
    });
  }

  // 2. 이번 달 날짜
  for (let d = 1; d <= totalDays; d++) {
    const currDate = new Date(year, month - 1, d);
    const dateStr = toDateString(currDate);
    const holiday = getHoliday(dateStr);
    days.push({
      date: currDate,
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isHoliday: !!holiday,
      holidayName: holiday?.name,
    });
  }

  // 3. 다음 달 날짜 채우기 (총 35일 또는 42일로 맞춤)
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let d = 1; d <= remainingDays; d++) {
      const nextDate = new Date(year, month, d);
      const dateStr = toDateString(nextDate);
      const holiday = getHoliday(dateStr);
      days.push({
        date: nextDate,
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isHoliday: !!holiday,
        holidayName: holiday?.name,
      });
    }
  }

  return days;
}
