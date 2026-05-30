export interface Track {
  number: number
  title: string
  duration: string
}

export interface Album {
  id: number
  title: string
  titleEn: string
  year: string
  type: 'LP' | 'EP' | 'Single'
  color: string        // matches machine body color
  description: string
  tracks: Track[]
}

// Wes Anderson pastel palette (must stay in sync with WashingMachine.tsx BODY_COLORS)
const COLORS = [
  '#E8B4B8', // Dusty Rose
  '#B8D4E8', // Powder Blue
  '#C8D8B8', // Sage Green
  '#F0E8C0', // Butter Yellow
  '#D8C8E8', // Lavender
]

const ALBUMS: Album[] = [
  // ── Bottom row (floor level) ── z-index 0–4
  {
    id: 0,
    title: '봄날의 세탁소',
    titleEn: 'Laundromat on a Spring Day',
    year: '2012',
    type: 'LP',
    color: COLORS[0],
    description: '인디씬에 조용히 등장을 알린 데뷔 앨범. 세탁소 한 켠에서 시작된 이야기들.',
    tracks: [
      { number: 1,  title: '오프닝 (세탁소의 아침)',  duration: '1:48' },
      { number: 2,  title: '첫 세탁',                duration: '3:21' },
      { number: 3,  title: '거품',                  duration: '3:54' },
      { number: 4,  title: '빨랫감',                duration: '4:12' },
      { number: 5,  title: '목요일의 손님',           duration: '3:37' },
      { number: 6,  title: '세제 향기',              duration: '2:59' },
      { number: 7,  title: '유리 너머',              duration: '4:44' },
      { number: 8,  title: '혼자 기다리기',           duration: '3:15' },
      { number: 9,  title: '하얀 셔츠',              duration: '5:02' },
      { number: 10, title: '클로징 (세탁소의 밤)',    duration: '2:23' },
    ],
  },
  {
    id: 1,
    title: '헹굼',
    titleEn: 'Rinse',
    year: '2013',
    type: 'LP',
    color: COLORS[1],
    description: '두 번째 앨범. 씻겨내고 싶은 것들에 대한 9개의 노래.',
    tracks: [
      { number: 1, title: '다시 씻어',          duration: '3:08' },
      { number: 2, title: '맑은 물',            duration: '4:20' },
      { number: 3, title: '냉수 마찰',          duration: '3:45' },
      { number: 4, title: '헹굼',              duration: '5:11' },
      { number: 5, title: '비눗기',            duration: '3:33' },
      { number: 6, title: '잘 지워지지 않는 것', duration: '4:56' },
      { number: 7, title: '투명',              duration: '3:22' },
      { number: 8, title: '마지막 헹굼',        duration: '4:08' },
      { number: 9, title: '깨끗한 척',          duration: '6:14' },
    ],
  },
  {
    id: 2,
    title: '탈수',
    titleEn: 'Spin Dry',
    year: '2015',
    type: 'LP',
    color: COLORS[2],
    description: '중반기 대표작. 빠르게 돌아가는 일상 속 감정들을 담은 앨범.',
    tracks: [
      { number: 1,  title: '회전 시작',        duration: '2:44' },
      { number: 2,  title: '1200rpm',          duration: '3:58' },
      { number: 3,  title: '어지러워',          duration: '4:31' },
      { number: 4,  title: '원심력',            duration: '3:17' },
      { number: 5,  title: '탈수',             duration: '5:22' },
      { number: 6,  title: '빠져나가는 것들',   duration: '4:03' },
      { number: 7,  title: '멈출 수 없어',      duration: '3:49' },
      { number: 8,  title: '다 짜낸 뒤에',      duration: '4:18' },
      { number: 9,  title: '정지 버튼',         duration: '3:06' },
      { number: 10, title: '조용한 오후',        duration: '2:52' },
      { number: 11, title: '다시 처음으로',      duration: '5:44' },
    ],
  },
  {
    id: 3,
    title: '건조',
    titleEn: 'Dry',
    year: '2017',
    type: 'LP',
    color: COLORS[3],
    description: '가장 서정적인 앨범. 따뜻한 바람과 비어있는 마음.',
    tracks: [
      { number: 1, title: '온기',              duration: '4:02' },
      { number: 2, title: '바람',              duration: '3:39' },
      { number: 3, title: '자연 건조',          duration: '5:17' },
      { number: 4, title: '옥상의 오후',        duration: '3:55' },
      { number: 5, title: '건조',              duration: '4:44' },
      { number: 6, title: '빳빳해질 때까지',    duration: '3:28' },
      { number: 7, title: '냄새',              duration: '4:11' },
      { number: 8, title: '개어진 옷들',        duration: '6:03' },
    ],
  },
  {
    id: 4,
    title: '다림질',
    titleEn: 'Ironing',
    year: '2019',
    type: 'LP',
    color: COLORS[4],
    description: '10주년 기념 앨범. 주름진 것들을 천천히 펴나가는 이야기.',
    tracks: [
      { number: 1,  title: '다림판 위에서',     duration: '3:14' },
      { number: 2,  title: '뜨거운 증기',        duration: '4:27' },
      { number: 3,  title: '주름',              duration: '3:51' },
      { number: 4,  title: '다림질',            duration: '5:38' },
      { number: 5,  title: '칼선',              duration: '3:03' },
      { number: 6,  title: '매끄러운 표면',      duration: '4:55' },
      { number: 7,  title: '오래된 셔츠',        duration: '3:42' },
      { number: 8,  title: '식어가는 다리미',    duration: '4:19' },
      { number: 9,  title: '완성',              duration: '2:48' },
      { number: 10, title: '10년 후',           duration: '7:01' },
    ],
  },

  // ── Top row (stacked) ── z-index 0–4, ids 5–9
  {
    id: 5,
    title: '새 옷',
    titleEn: 'New Clothes',
    year: '2014',
    type: 'EP',
    color: COLORS[2],
    description: '봄과 헹굼 사이, 잠깐의 쉼표. 5곡짜리 미니 앨범.',
    tracks: [
      { number: 1, title: '새 옷',              duration: '3:33' },
      { number: 2, title: '처음 입는 날',        duration: '4:07' },
      { number: 3, title: '세탁 금지',           duration: '2:58' },
      { number: 4, title: '드라이클리닝',        duration: '3:44' },
      { number: 5, title: '낡아가는 것의 아름다움', duration: '5:21' },
    ],
  },
  {
    id: 6,
    title: '겨울 세탁소',
    titleEn: 'Winter Laundromat',
    year: '2016',
    type: 'EP',
    color: COLORS[1],
    description: '탈수와 건조 사이의 겨울. 차갑고 조용한 6개의 노래.',
    tracks: [
      { number: 1, title: '동파 주의',           duration: '3:19' },
      { number: 2, title: '눈이 오는 날의 세탁소', duration: '4:52' },
      { number: 3, title: '냉수',               duration: '3:07' },
      { number: 4, title: '겨울 세탁소',         duration: '5:34' },
      { number: 5, title: '따뜻한 물',           duration: '3:48' },
      { number: 6, title: '봄이 오면',           duration: '6:22' },
    ],
  },
  {
    id: 7,
    title: '빨래',
    titleEn: 'Laundry',
    year: '2018',
    type: 'Single',
    color: COLORS[4],
    description: '싱글 발매. 가장 평범한 날의 가장 특별한 감정.',
    tracks: [
      { number: 1, title: '빨래',               duration: '4:15' },
      { number: 2, title: '빨래 (Instrumental)', duration: '4:15' },
      { number: 3, title: '빨래 (Demo)',         duration: '3:58' },
    ],
  },
  {
    id: 8,
    title: '깨끗한 날',
    titleEn: 'A Clean Day',
    year: '2020',
    type: 'LP',
    color: COLORS[0],
    description: '팬데믹 속에서 만들어진 앨범. 가장 작은 일상이 얼마나 소중한지.',
    tracks: [
      { number: 1, title: '깨끗한 날',           duration: '3:44' },
      { number: 2, title: '창문 너머의 하늘',     duration: '4:28' },
      { number: 3, title: '혼자 하는 세탁',       duration: '3:11' },
      { number: 4, title: '오래 걸려도 괜찮아',   duration: '5:03' },
      { number: 5, title: '빨래방 친구',          duration: '3:37' },
      { number: 6, title: '잘 마른 이불',         duration: '4:59' },
      { number: 7, title: '먼지',                duration: '3:22' },
      { number: 8, title: '반복',                duration: '4:41' },
      { number: 9, title: '또 깨끗한 날',         duration: '6:17' },
    ],
  },
  {
    id: 9,
    title: '스웨덴에서 온 편지',
    titleEn: 'A Letter from Sweden',
    year: '2022',
    type: 'LP',
    color: COLORS[3],
    description: '스웨덴 투어 후 귀국해 완성한 앨범. 낯선 도시의 빨래방에서 쓴 일기.',
    tracks: [
      { number: 1,  title: '도착',               duration: '2:31' },
      { number: 2,  title: '스톡홀름의 세탁소',   duration: '4:17' },
      { number: 3,  title: '코인',               duration: '3:52' },
      { number: 4,  title: '이방인의 빨래',        duration: '4:39' },
      { number: 5,  title: '스웨덴에서 온 편지',  duration: '5:55' },
      { number: 6,  title: '노르딕 라이트',        duration: '3:28' },
      { number: 7,  title: '귀국',               duration: '4:04' },
      { number: 8,  title: '그 세탁소는 아직',     duration: '3:47' },
      { number: 9,  title: '한국 세탁소',          duration: '4:33' },
      { number: 10, title: '반가운 냄새',          duration: '3:19' },
      { number: 11, title: '집',                  duration: '6:48' },
    ],
  },
]

export default ALBUMS
