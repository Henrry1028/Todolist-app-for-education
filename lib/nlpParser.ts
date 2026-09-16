import { Priority, Category } from '@/types/todo';

export interface ParsedTaskInput {
  raw: string;
  cleanTitle: string;
  dueDate?: string;
  dueDateLabel?: string;
  timeBlock?: {
    startTime: string;
    endTime: string;
  };
  timeBlockLabel?: string;
  priority: Priority;
  category: Category;
  categoryLabel: string;
  isAutoClassified?: boolean;
  matchedKeyword?: string;
  tags: string[];
}

/**
 * 키워드 및 태그 기반 카테고리 자동 판별 사전
 */
const CATEGORY_KEYWORDS: Record<Category, { label: string; keywords: string[]; tagMatch: string[] }> = {
  work: {
    label: '🏢 업무',
    tagMatch: ['업무', '회사', '일', 'work', '미팅', '프로젝트', '직장', '비즈니스'],
    keywords: [
      '회의', '미팅', '보고', '보고서', '기획', '기획서', '결재', '메일', '이메일',
      '제안서', '고객', '클라이언트', '협력사', '프로젝트', '발표', 'PT', 'sprint',
      'meeting', 'sync', 'dev', '개발', '배포', 'QA', 'qa', 'PR', 'pr', '이슈',
      '버그', '피드백', '면담', '인터뷰', '업무', '출장', '마케팅', '매출', '실적',
      '주간보고', '업무일지', '거래처', '파트장', '팀장', '부장', '임원', '작성', '작업',
      '문서', '정산', '품의', '영수증', '세미나', '컨퍼런스', '워크샵', '야근', '출근', '퇴근',
      '비즈니스', '제안', '계약', '입찰', '납품', '검수', '테스트', '배포작업',
    ],
  },
  study: {
    label: '📚 공부',
    tagMatch: ['공부', 'study', '스터디', '독서', '강의', '시험', '학습', '교육'],
    keywords: [
      '공부', '스터디', '인강', '강의', '수업', '과제', '숙제', '시험', '자격증',
      '문제집', '문제', '독서', '책', '리포트', '논문', '복습', '예습', '단어',
      '영단어', '알고리즘', 'cs', '튜토리얼', '실습', '코테', '토익', '수강',
      '레포트', '학원', '토플', '오픽', '모의고사', '읽기', '암기', '정리',
      '수험', '필기', '중간고사', '기말고사', '교재', '노트', '학습', '수학', '영어',
      '프로그래밍공부', '강좌', '인터넷강의', '외우기',
    ],
  },
  personal: {
    label: '👤 개인',
    tagMatch: ['개인', '일상', 'personal', '운동', '집', '가족', '약속', '취미'],
    keywords: [
      '운동', '헬스', '러닝', '조깅', '산책', '병원', '진료', '치과', '안과',
      '내과', '약국', '약', '청소', '빨래', '장보기', '마트', '쇼핑', '요리',
      '식사', '저녁', '점심', '약속', '모임', '친구', '가족', '부모님', '여행',
      '영화', '취미', '은행', '송금', '세차', '휴식', '예약', '빨래방', '카페',
      '데이트', '미용실', '헤어', '수영', '등산', '구매', '결제',
      // 식사/외식/모임 키워드 대폭 확장
      '외식', '가족외식', '식당', '맛집', '밥', '회식', '술자리', '맥주', '치킨', '치맥',
      '저녁식사', '점심식사', '아침식사', '브런치', '디저트', '베이커리', '커피',
      // 가족/친지/기념일 키워드
      '엄마', '아빠', '부모', '형', '누나', '동생', '남편', '아내', '아이', '자녀',
      '아들', '딸', '조카', '생일', '생신', '생파', '선물', '기념일', '결혼식', '청첩장',
      '돌잔치', '환갑', '칠순', '장례식', '조문', '추도',
      // 개인 일정/휴가 키워드
      '휴가', '연차', '반차', '월차', '외출', '동창회', '동호회', '번개', '모임약속',
      '반려견', '반려묘', '강아지', '고양이', '병원예약', '건강검진', '네일', '피부과',
    ],
  },
};

/**
 * 텍스트와 태그로부터 카테고리 자동 추론 함수
 */
export function detectCategory(
  text: string,
  tags: string[] = []
): {
  category: Category;
  label: string;
  isAutoClassified: boolean;
  matchedKeyword?: string;
} {
  const lowerText = text.toLowerCase();
  const lowerTags = tags.map((t) => t.toLowerCase());

  // 1. 명시적 해시태그 우선 확인
  for (const cat of ['work', 'study', 'personal'] as Category[]) {
    const meta = CATEGORY_KEYWORDS[cat];
    const hasTagMatch = lowerTags.some((t) => meta.tagMatch.includes(t));
    if (hasTagMatch) {
      return {
        category: cat,
        label: meta.label,
        isAutoClassified: true,
        matchedKeyword: `#${cat}`,
      };
    }
  }

  // 2. 텍스트 내 키워드 출현 빈도 및 길이 가중치 스코어링
  const scores: Record<Category, number> = {
    work: 0,
    study: 0,
    personal: 0,
  };
  const matchedList: Record<Category, string[]> = {
    work: [],
    study: [],
    personal: [],
  };

  for (const cat of ['work', 'study', 'personal'] as Category[]) {
    const meta = CATEGORY_KEYWORDS[cat];
    for (const kw of meta.keywords) {
      const lowerKw = kw.toLowerCase();
      if (lowerText.includes(lowerKw)) {
        const weight = lowerKw.length >= 4 ? 2 : 1;
        scores[cat] += weight;
        matchedList[cat].push(kw);
      }
    }
  }

  // 가장 높은 스코어를 가진 카테고리 선정
  let bestCategory: Category = 'personal';
  let maxScore = 0;

  for (const cat of ['work', 'study', 'personal'] as Category[]) {
    if (scores[cat] > maxScore) {
      maxScore = scores[cat];
      bestCategory = cat;
    }
  }

  const isClassified = maxScore > 0;
  const bestKeyword = matchedList[bestCategory]?.[0];

  return {
    category: bestCategory,
    label: CATEGORY_KEYWORDS[bestCategory].label,
    isAutoClassified: isClassified,
    matchedKeyword: bestKeyword,
  };
}

/**
 * 자연어 파싱 유틸리티 (NLP Quick Parser)
 * "오늘", "내일", "오전/오후 X시", "!p1~p4", "#태그", 카테고리 자동 판별
 */
export function parseQuickInput(text: string): ParsedTaskInput {
  const trimmed = text.trim();
  let remaining = text;

  let dueDate: string | undefined = undefined;
  let dueDateLabel: string | undefined = undefined;
  let timeBlock: { startTime: string; endTime: string } | undefined = undefined;
  let timeBlockLabel: string | undefined = undefined;
  let priority: Priority = 'P3'; // 기본 우선순위
  const tags: string[] = [];

  if (!trimmed) {
    return {
      raw: text,
      cleanTitle: '',
      priority: 'P3',
      category: 'personal',
      categoryLabel: CATEGORY_KEYWORDS.personal.label,
      tags: [],
    };
  }

  // 1. 우선순위 파싱: !p1, !p2, !p3, !p4 (대소문자 무관)
  const priorityMatch = remaining.match(/!(p[1-4]|P[1-4])\b/i);
  if (priorityMatch) {
    const pValue = priorityMatch[1].toUpperCase() as Priority;
    priority = pValue;
    remaining = remaining.replace(priorityMatch[0], ' ');
  }

  // 2. 태그 파싱: #태그명 (한글, 영문, 숫자, 언더바)
  const tagMatches = remaining.match(/#([\w가-힣_-]+)/g);
  if (tagMatches) {
    tagMatches.forEach((t) => {
      const tagContent = t.slice(1).trim();
      if (tagContent && !tags.includes(tagContent)) {
        tags.push(tagContent);
      }
    });
    remaining = remaining.replace(/#([\w가-힣_-]+)/g, ' ');
  }

  // 3. 날짜 파싱: "오늘", "내일", "모레"
  const now = new Date();
  if (/(^|\s)오늘(\s|$)/.test(remaining)) {
    const today = new Date(now);
    dueDate = today.toISOString().split('T')[0];
    dueDateLabel = `오늘 (${today.getMonth() + 1}/${today.getDate()})`;
    remaining = remaining.replace(/(^|\s)오늘(\s|$)/, ' ');
  } else if (/(^|\s)내일(\s|$)/.test(remaining)) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dueDate = tomorrow.toISOString().split('T')[0];
    dueDateLabel = `내일 (${tomorrow.getMonth() + 1}/${tomorrow.getDate()})`;
    remaining = remaining.replace(/(^|\s)내일(\s|$)/, ' ');
  } else if (/(^|\s)모레(\s|$)/.test(remaining)) {
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    dueDate = dayAfter.toISOString().split('T')[0];
    dueDateLabel = `모레 (${dayAfter.getMonth() + 1}/${dayAfter.getDate()})`;
    remaining = remaining.replace(/(^|\s)모레(\s|$)/, ' ');
  }

  // 4. 시간 파싱:
  // (A) 수식어 포함: (오전|오후|저녁|아침|밤|새벽|낮)\s*([0-1]?[0-9]|2[0-3])시(?:\s*([0-5]?[0-9])분)?
  // (B) 24시간 형식: ([0-2]?[0-9]):([0-5][0-9])
  // (C) 단독 시간: (X시 Y분 | X시)
  const modifiedTimeRegex = /(오전|오후|저녁|아침|밤|새벽|낮)\s*([0-1]?[0-9]|2[0-3])시(?:\s*([0-5]?[0-9])분)?/;
  const colonTimeRegex = /(?:^|\s)([0-2]?[0-9]):([0-5][0-9])(?:\s|$)/;
  const standaloneTimeRegex = /(?:^|\s)([0-1]?[0-9]|2[0-3])시(?:\s*([0-5]?[0-9])분)?(?:\s|$)/;

  const modMatch = remaining.match(modifiedTimeRegex);
  const colonMatch = !modMatch ? remaining.match(colonTimeRegex) : null;
  const standaloneMatch = !modMatch && !colonMatch ? remaining.match(standaloneTimeRegex) : null;

  if (modMatch) {
    const modifier = modMatch[1];
    let hours = parseInt(modMatch[2], 10);
    const minutes = modMatch[3] ? parseInt(modMatch[3], 10) : 0;

    if (['오후', '저녁'].includes(modifier) && hours < 12) {
      hours += 12;
    } else if (modifier === '밤') {
      if (hours < 12 && hours >= 5) hours += 12; // 밤 9시 -> 21시
    } else if (['오전', '새벽'].includes(modifier) && hours === 12) {
      hours = 0;
    } else if (modifier === '낮' && hours === 1) {
      hours = 13;
    }

    const startH = String(hours).padStart(2, '0');
    const startM = String(minutes).padStart(2, '0');
    const endH = String((hours + 1) % 24).padStart(2, '0');
    const endM = startM;

    timeBlock = {
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`,
    };
    timeBlockLabel = `${modMatch[0].trim()} (${startH}:${startM} ~ ${endH}:${endM})`;
    remaining = remaining.replace(modMatch[0], ' ');

    if (!dueDate) {
      const today = new Date(now);
      dueDate = today.toISOString().split('T')[0];
      dueDateLabel = `오늘 (${today.getMonth() + 1}/${today.getDate()})`;
    }
  } else if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10);
    const minutes = parseInt(colonMatch[2], 10);
    const startH = String(hours).padStart(2, '0');
    const startM = String(minutes).padStart(2, '0');
    const endH = String((hours + 1) % 24).padStart(2, '0');
    const endM = startM;

    timeBlock = {
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`,
    };
    timeBlockLabel = `${startH}:${startM} ~ ${endH}:${endM}`;
    remaining = remaining.replace(colonMatch[0], ' ');

    if (!dueDate) {
      const today = new Date(now);
      dueDate = today.toISOString().split('T')[0];
      dueDateLabel = `오늘 (${today.getMonth() + 1}/${today.getDate()})`;
    }
  } else if (standaloneMatch) {
    let hours = parseInt(standaloneMatch[1], 10);
    const minutes = standaloneMatch[2] ? parseInt(standaloneMatch[2], 10) : 0;

    // 일상적인 한국어 맥락:
    // 1시~6시는 보통 오후(13:00~18:00) 의미. 외식, 저녁, 퇴근, 약속, 식사 등 저녁 키워드가 있으면 확실한 오후/저녁
    const eveningKeywords = ['외식', '저녁', '퇴근', '회식', '술', '맥주', '약속', '식사', '밥', '모임', '야식', '영화'];
    const isEveningContext = eveningKeywords.some((kw) => remaining.includes(kw));

    if (hours >= 1 && hours <= 6) {
      hours += 12; // 1시~6시 -> 13:00~18:00 (6시 외식 -> 18:00)
    } else if (hours >= 7 && hours <= 11 && isEveningContext) {
      hours += 12; // "7시 저녁" -> 19:00
    }

    const startH = String(hours).padStart(2, '0');
    const startM = String(minutes).padStart(2, '0');
    const endH = String((hours + 1) % 24).padStart(2, '0');
    const endM = startM;

    timeBlock = {
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`,
    };
    timeBlockLabel = `${standaloneMatch[0].trim()} (${startH}:${startM} ~ ${endH}:${endM})`;
    remaining = remaining.replace(standaloneMatch[0], ' ');

    if (!dueDate) {
      const today = new Date(now);
      dueDate = today.toISOString().split('T')[0];
      dueDateLabel = `오늘 (${today.getMonth() + 1}/${today.getDate()})`;
    }
  }

  // 정제된 제목 추출 (연속 공백 정리)
  const cleanTitle = remaining.replace(/\s+/g, ' ').trim();

  // 5. 카테고리 자동 판별
  const { category, label: categoryLabel, isAutoClassified, matchedKeyword } = detectCategory(cleanTitle || text, tags);

  return {
    raw: text,
    cleanTitle: cleanTitle || text.trim(),
    dueDate,
    dueDateLabel,
    timeBlock,
    timeBlockLabel,
    priority,
    category,
    categoryLabel,
    isAutoClassified,
    matchedKeyword,
    tags,
  };
}
