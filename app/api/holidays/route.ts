import { NextResponse } from 'next/server';
import { getMonthHolidays, syncOnlineHolidays, getHoliday } from '@/lib/holidays';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');
  const dateParam = searchParams.get('date');

  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

  // 백그라운드에서 최신 데이터 동기화 시도
  await syncOnlineHolidays(year);

  if (dateParam) {
    const holiday = getHoliday(dateParam);
    return NextResponse.json({
      success: true,
      source: 'naver_calendar_kasi_sync',
      holiday,
    });
  }

  const holidays = getMonthHolidays(year, month);

  return NextResponse.json({
    success: true,
    source: 'naver_calendar_kasi_sync',
    year,
    month,
    holidays,
  });
}
