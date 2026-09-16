/**
 * 네이버 달력 및 한국천문연구원 특일정보 기준 대한민국 공휴일 연동 모듈
 */

export interface HolidayInfo {
  dateStr: string;
  name: string;
  isHoliday: boolean;
}

// 1. 대한민국 법정 공휴일 및 대체공휴일 공식 내장 데이터셋 (Local-First 100% 무결성)
const BUILTIN_HOLIDAYS: Record<string, Record<string, string>> = {
  '2024': {
    '2024-01-01': '신정',
    '2024-02-09': '설날 전날',
    '2024-02-10': '설날',
    '2024-02-11': '설날 다음 날',
    '2024-02-12': '대체공휴일(설날)',
    '2024-03-01': '3ㆍ1절',
    '2024-04-10': '제22대 국회의원선거',
    '2024-05-05': '어린이날',
    '2024-05-06': '대체공휴일(어린이날)',
    '2024-05-15': '부처님 오신 날',
    '2024-06-06': '현충일',
    '2024-08-15': '광복절',
    '2024-09-16': '추석 전날',
    '2024-09-17': '추석',
    '2024-09-18': '추석 다음 날',
    '2024-10-01': '임시공휴일(국군의날)',
    '2024-10-03': '개천절',
    '2024-10-09': '한글날',
    '2024-12-25': '성탄절',
  },
  '2025': {
    '2025-01-01': '신정',
    '2025-01-28': '설날 전날',
    '2025-01-29': '설날',
    '2025-01-30': '설날 다음 날',
    '2025-03-01': '3ㆍ1절',
    '2025-03-03': '대체공휴일(3ㆍ1절)',
    '2025-05-05': '어린이날 / 부처님 오신 날',
    '2025-05-06': '대체공휴일(부처님 오신 날)',
    '2025-06-06': '현충일',
    '2025-08-15': '광복절',
    '2025-10-03': '개천절',
    '2025-10-05': '추석 전날',
    '2025-10-06': '추석',
    '2025-10-07': '추석 다음 날',
    '2025-10-08': '대체공휴일(추석)',
    '2025-10-09': '한글날',
    '2025-12-25': '성탄절',
  },
  '2026': {
    '2026-01-01': '신정',
    '2026-02-16': '설날 전날',
    '2026-02-17': '설날',
    '2026-02-18': '설날 다음 날',
    '2026-03-01': '3ㆍ1절',
    '2026-03-02': '대체공휴일(3ㆍ1절)',
    '2026-05-01': '근로자의 날',
    '2026-05-05': '어린이날',
    '2026-05-24': '부처님 오신 날',
    '2026-05-25': '대체공휴일(부처님 오신 날)',
    '2026-06-03': '전국동시지방선거',
    '2026-06-06': '현충일',
    '2026-07-17': '제헌절',
    '2026-08-15': '광복절',
    '2026-08-17': '대체공휴일(광복절)',
    '2026-09-24': '추석 전날',
    '2026-09-25': '추석',
    '2026-09-26': '추석 다음 날',
    '2026-10-03': '개천절',
    '2026-10-05': '대체공휴일(개천절)',
    '2026-10-09': '한글날',
    '2026-12-25': '성탄절',
  },
  '2027': {
    '2027-01-01': '신정',
    '2027-02-06': '설날 전날',
    '2027-02-07': '설날',
    '2027-02-08': '설날 다음 날',
    '2027-02-09': '대체공휴일(설날)',
    '2027-03-01': '3ㆍ1절',
    '2027-05-01': '근로자의 날',
    '2027-05-05': '어린이날',
    '2027-05-13': '부처님 오신 날',
    '2027-06-06': '현충일',
    '2027-08-15': '광복절',
    '2027-08-16': '대체공휴일(광복절)',
    '2027-09-14': '추석 전날',
    '2027-09-15': '추석',
    '2027-09-16': '추석 다음 날',
    '2027-10-03': '개천절',
    '2027-10-04': '대체공휴일(개천절)',
    '2027-10-09': '한글날',
    '2027-10-11': '대체공휴일(한글날)',
    '2027-12-25': '성탄절',
    '2027-12-27': '대체공휴일(성탄절)',
  },
  '2028': {
    '2028-01-01': '신정',
    '2028-01-26': '설날 전날',
    '2028-01-27': '설날',
    '2028-01-28': '설날 다음 날',
    '2028-03-01': '3ㆍ1절',
    '2028-05-02': '부처님 오신 날',
    '2028-05-05': '어린이날',
    '2028-06-06': '현충일',
    '2028-08-15': '광복절',
    '2028-10-02': '추석 전날',
    '2028-10-03': '추석 / 개천절',
    '2028-10-04': '추석 다음 날',
    '2028-10-05': '대체공휴일(추석)',
    '2028-10-09': '한글날',
    '2028-12-25': '성탄절',
  },
};

// 런타임 동적 캐시
const runtimeHolidayCache: Record<string, Record<string, string>> = { ...BUILTIN_HOLIDAYS };

/**
 * 특정 날짜의 공휴일 정보 조회
 * @param dateStr 'YYYY-MM-DD' 형식
 */
export function getHoliday(dateStr: string): HolidayInfo | null {
  if (!dateStr || dateStr.length < 10) return null;
  const year = dateStr.slice(0, 4);

  const yearData = runtimeHolidayCache[year] || BUILTIN_HOLIDAYS[year];
  if (!yearData) return null;

  const holidayName = yearData[dateStr];
  if (!holidayName) return null;

  return {
    dateStr,
    name: holidayName,
    isHoliday: true,
  };
}

/**
 * 특정 날짜가 공휴일(또는 일요일)인지 여부 확인
 */
export function isHolidayOrWeekend(date: Date): { isHoliday: boolean; isWeekend: boolean; holidayName?: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const holiday = getHoliday(dateStr);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return {
    isHoliday: !!holiday,
    isWeekend,
    holidayName: holiday?.name,
  };
}

/**
 * 특정 연/월의 모든 공휴일 맵 반환 ('YYYY-MM-DD' -> 휴일 이름)
 */
export function getMonthHolidays(year: number, month: number): Record<string, string> {
  const yStr = String(year);
  const mPrefix = `${yStr}-${String(month).padStart(2, '0')}-`;

  const yearData = runtimeHolidayCache[yStr] || BUILTIN_HOLIDAYS[yStr] || {};
  const monthHolidays: Record<string, string> = {};

  for (const [dateStr, name] of Object.entries(yearData)) {
    if (dateStr.startsWith(mPrefix)) {
      monthHolidays[dateStr] = name;
    }
  }

  return monthHolidays;
}

/**
 * 네이버 캘린더 / 특일정보 온라인 피드와 실시간 동기화
 */
export async function syncOnlineHolidays(year: number): Promise<boolean> {
  const yStr = String(year);
  try {
    const res = await fetch(`https://holidays.hyunbin.page/basic.json`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return false;

    const data = await res.json();
    if (data && data[yStr]) {
      const formatted: Record<string, string> = {};
      for (const [dStr, names] of Object.entries(data[yStr] as Record<string, string[]>)) {
        formatted[dStr] = names.join(' / ');
      }
      runtimeHolidayCache[yStr] = {
        ...(runtimeHolidayCache[yStr] || {}),
        ...formatted,
      };
      return true;
    }
  } catch {
    // 오프라인이거나 네트워크 오류 시 내장 데이터 사용
  }
  return false;
}
