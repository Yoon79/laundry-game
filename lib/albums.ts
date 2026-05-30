export interface Track {
  number: number
  title: string
  duration?: string
}

export interface Album {
  id: number
  title: string
  year: string
  type: '정규' | 'EP' | '싱글'
  color: string
  tracks: Track[]
}

// Pastel palette (synced with WashingMachine.tsx BODY_COLORS)
const C = ['#E8B4B8','#B8D4E8','#C8D8B8','#F0E8C0','#D8C8E8']
const col = (id: number) => C[id % 5]

// 46 albums — newest (id=0) → oldest (id=45)
// Ordered front-to-back in the laundry room
const ALBUMS: Album[] = [
  // ── id 0–5 · front column ──────────────────────────────────────────
  {
    id: 0, title: '파도와 파랑', year: '2026', type: '싱글', color: col(0),
    tracks: [
      { number: 1, title: '파랑', duration: '2:54' },
      { number: 2, title: '파도', duration: '2:52' },
    ],
  },
  {
    id: 1, title: '사랑을 낭비하면서', year: '2026', type: '싱글', color: col(1),
    tracks: [
      { number: 1, title: '사랑을 낭비하면서', duration: '3:02' },
    ],
  },
  {
    id: 2, title: '영영', year: '2026', type: '싱글', color: col(2),
    tracks: [
      { number: 1, title: '영영', duration: '2:38' },
      { number: 2, title: '아침에 봐', duration: '2:50' },
    ],
  },
  {
    id: 3, title: '시선', year: '2025', type: '싱글', color: col(3),
    tracks: [
      { number: 1, title: '시선', duration: '2:53' },
    ],
  },
  {
    id: 4, title: 'RE: 나도!', year: '2025', type: '싱글', color: col(4),
    tracks: [
      { number: 1, title: '그래 열대야 때문이겠지 뭐', duration: '3:18' },
    ],
  },
  {
    id: 5, title: '그래 열대야 때문이겠지 뭐', year: '2025', type: '싱글', color: col(5),
    tracks: [
      { number: 1, title: '그래 열대야 때문이겠지 뭐', duration: '3:09' },
    ],
  },

  // ── id 6–11 ────────────────────────────────────────────────────────
  {
    id: 6, title: '오렌지빛을 쥐고', year: '2024', type: 'EP', color: col(6),
    tracks: [
      { number: 1, title: '새벽 왈츠 졸린', duration: '3:45' },
      { number: 2, title: '꾹꾹', duration: '4:20' },
      { number: 3, title: '해로운 희망을 껴안고 너와 휘청일 수 있다면', duration: '4:15' },
      { number: 4, title: '내 유일한 슬픔으로', duration: '4:30' },
      { number: 5, title: '찬란', duration: '3:50' },
      { number: 6, title: '나비', duration: '4:00' },
    ],
  },
  {
    id: 7, title: 'Samsara', year: '2024', type: '싱글', color: col(7),
    tracks: [
      { number: 1, title: 'Samsara' },
    ],
  },
  {
    id: 8, title: '유일', year: '2024', type: '싱글', color: col(8),
    tracks: [
      { number: 1, title: '유일' },
    ],
  },
  {
    id: 9, title: '푸른동경', year: '2024', type: 'EP', color: col(9),
    tracks: [
      { number: 1, title: '푸른동경' },
      { number: 2, title: '일렁이는 말들' },
      { number: 3, title: '얼굴' },
      { number: 4, title: '어떻게 하나요' },
      { number: 5, title: '밤' },
    ],
  },
  {
    id: 10, title: '미안해 (feat. 범진)', year: '2023', type: '싱글', color: col(10),
    tracks: [
      { number: 1, title: '미안해 (feat. 범진)' },
    ],
  },
  {
    id: 11, title: '이토록 아름다운 오월에', year: '2023', type: '싱글', color: col(11),
    tracks: [
      { number: 1, title: '눈맞춤' },
      { number: 2, title: 'May' },
      { number: 3, title: '문득' },
    ],
  },

  // ── id 12–17 ───────────────────────────────────────────────────────
  {
    id: 12, title: '꿈결', year: '2022', type: 'EP', color: col(12),
    tracks: [
      { number: 1, title: 'just say it' },
      { number: 2, title: 'my butterfly' },
      { number: 3, title: '전화' },
      { number: 4, title: '비스듬히' },
      { number: 5, title: '매직카펫' },
    ],
  },
  {
    id: 13, title: '우리는 우리를', year: '2022', type: '싱글', color: col(13),
    tracks: [
      { number: 1, title: '모래성' },
      { number: 2, title: '척' },
    ],
  },
  {
    id: 14, title: '사랑의 모양', year: '2021', type: 'EP', color: col(14),
    tracks: [
      { number: 1, title: '안부' },
      { number: 2, title: 'flower rain' },
      { number: 3, title: 'moonbow' },
      { number: 4, title: '춤추자' },
      { number: 5, title: '사랑' },
    ],
  },
  {
    id: 15, title: '우리가 핀 2 - 조각', year: '2021', type: 'EP', color: col(15),
    tracks: [
      { number: 1, title: '선잠' },
      { number: 2, title: '다 사랑 같아 (Vocal 짙은)' },
      { number: 3, title: '좋아하고만 싶어 (Vocal 위수)' },
      { number: 4, title: '왜 우리가 (Vocal 이아람)' },
      { number: 5, title: '바다' },
    ],
  },
  {
    id: 16, title: '우리가 핀 1 - 잔상(殘像)', year: '2020', type: 'EP', color: col(16),
    tracks: [
      { number: 1, title: '끝나지 않는 계절의 기억에 머물러줘 (With 예빛)' },
      { number: 2, title: 'stay with me (With 최유리)' },
      { number: 3, title: '권태 (With 보라미유)' },
      { number: 4, title: 'lullaby, cat (With 루싸이트 토끼)' },
      { number: 5, title: '시인' },
      { number: 6, title: 'sunset (With 이강승)' },
    ],
  },
  {
    id: 17, title: '사월', year: '2020', type: '싱글', color: col(17),
    tracks: [
      { number: 1, title: '사월' },
    ],
  },

  // ── id 18–23 ───────────────────────────────────────────────────────
  {
    id: 18, title: '미지', year: '2019', type: '싱글', color: col(18),
    tracks: [
      { number: 1, title: '우리는 너무 많은 것을 (WE)' },
      { number: 2, title: '미지 (Q)' },
      { number: 3, title: '밤산책 (Walkin\' in the moonlight)' },
    ],
  },
  {
    id: 19, title: '내가 사랑하는 시간', year: '2019', type: 'EP', color: col(19),
    tracks: [
      { number: 1, title: '그만할게' },
      { number: 2, title: '긴 긴 인사 (Feat.이민혁)' },
      { number: 3, title: '시무룩' },
      { number: 4, title: '너, 나' },
      { number: 5, title: '내가 사랑하는 시간' },
    ],
  },
  {
    id: 20, title: 'Rain', year: '2019', type: '싱글', color: col(20),
    tracks: [
      { number: 1, title: 'Rain' },
      { number: 2, title: 'Rainbow' },
    ],
  },
  {
    id: 21, title: 'Be Your Christmas', year: '2018', type: 'EP', color: col(21),
    tracks: [
      { number: 1, title: 'Snowball (Feat. 바닐라 어쿠스틱)' },
      { number: 2, title: 'Be Your Christmas (Feat. 볼빨간사춘기)' },
      { number: 3, title: '그 겨울 (Feat. 스무살 & 레터플로우)' },
      { number: 4, title: 'Like Christmas (2018 Remastered)' },
      { number: 5, title: 'Just Christmas (2018 Remastered)' },
    ],
  },
  {
    id: 22, title: '그 여름', year: '2018', type: '싱글', color: col(22),
    tracks: [
      { number: 1, title: '그 여름' },
    ],
  },
  {
    id: 23, title: '우리집', year: '2018', type: 'EP', color: col(23),
    tracks: [
      { number: 1, title: '우리집에 놀러와요' },
      { number: 2, title: '바람 (Wish)' },
      { number: 3, title: '안아줄까 (Feat. 주성근 of 1415)' },
      { number: 4, title: '졸려요 (Zzz)' },
      { number: 5, title: '여행 (Dear)' },
      { number: 6, title: '장면 (Scene)' },
    ],
  },

  // ── id 24–29 ───────────────────────────────────────────────────────
  {
    id: 24, title: '바람 (Wish)', year: '2017', type: '싱글', color: col(24),
    tracks: [
      { number: 1, title: '바람 (Wish)' },
    ],
  },
  {
    id: 25, title: '여름밤', year: '2017', type: '싱글', color: col(25),
    tracks: [
      { number: 1, title: '여름밤' },
    ],
  },
  {
    id: 26, title: 'Like Christmas', year: '2016', type: '싱글', color: col(26),
    tracks: [
      { number: 1, title: 'Like Christmas' },
    ],
  },
  {
    id: 27, title: '마음', year: '2016', type: '정규', color: col(27),
    tracks: [
      { number:  1, title: '어려운 말' },
      { number:  2, title: 'foggy' },
      { number:  3, title: '처음이라서 (With 이루마)' },
      { number:  4, title: 'your color' },
      { number:  5, title: '월화수목금토일' },
      { number:  6, title: '두 손 너에게 (With 최백호)' },
      { number:  7, title: '시절' },
      { number:  8, title: '싱숭생숭해' },
      { number:  9, title: '보고싶어 (With 레터플로우)' },
      { number: 10, title: '별' },
      { number: 11, title: '기념일' },
      { number: 12, title: '고마워' },
    ],
  },
  {
    id: 28, title: '시절', year: '2016', type: '싱글', color: col(28),
    tracks: [
      { number: 1, title: '시절' },
    ],
  },
  {
    id: 29, title: '두 손, 너에게 (Feat. 최백호)', year: '2015', type: '싱글', color: col(29),
    tracks: [
      { number: 1, title: '두 손, 너에게 (Feat. 최백호)' },
    ],
  },

  // ── id 30–35 ───────────────────────────────────────────────────────
  {
    id: 30, title: '기념일', year: '2015', type: '싱글', color: col(30),
    tracks: [
      { number: 1, title: '기념일' },
    ],
  },
  {
    id: 31, title: '고요', year: '2015', type: '싱글', color: col(31),
    tracks: [
      { number: 1, title: '이슬' },
      { number: 2, title: '숲' },
      { number: 3, title: '꽃' },
    ],
  },
  {
    id: 32, title: '순간', year: '2014', type: 'EP', color: col(32),
    tracks: [
      { number: 1, title: 'The moment' },
      { number: 2, title: 'Magical' },
      { number: 3, title: '미안해 (feat. 레터플로우)' },
      { number: 4, title: 'Why are you so cute?' },
      { number: 5, title: 'Night' },
      { number: 6, title: '꿈에 입장' },
      { number: 7, title: '안돼' },
    ],
  },
  {
    id: 33, title: '흩어진다', year: '2014', type: '싱글', color: col(33),
    tracks: [
      { number: 1, title: '흩어진다' },
    ],
  },
  {
    id: 34, title: 'Night', year: '2014', type: '싱글', color: col(34),
    tracks: [
      { number: 1, title: 'Night' },
    ],
  },
  {
    id: 35, title: '안돼', year: '2014', type: '싱글', color: col(35),
    tracks: [
      { number: 1, title: '안돼' },
    ],
  },

  // ── id 36–41 ───────────────────────────────────────────────────────
  {
    id: 36, title: '잠들 때까지', year: '2013', type: '정규', color: col(36),
    tracks: [
      { number:  1, title: '답답한 새벽' },
      { number:  2, title: '쓰여지지 않은 삶' },
      { number:  3, title: '목소리 (with 정기고)' },
      { number:  4, title: '그래도 나 사랑하지' },
      { number:  5, title: '화해쏭' },
      { number:  6, title: '버려진 것들' },
      { number:  7, title: '그 곳의 우린 (with 피콕)' },
      { number:  8, title: '다시, 봄' },
      { number:  9, title: '달 달 무슨 달 (with 남보라)' },
      { number: 10, title: '단 한 번도 넌' },
      { number: 11, title: '내 친구 기타' },
      { number: 12, title: 'Good night baby' },
    ],
  },
  {
    id: 37, title: '목소리', year: '2013', type: '싱글', color: col(37),
    tracks: [
      { number: 1, title: '목소리 (with 정기고)' },
    ],
  },
  {
    id: 38, title: '버려진 것들', year: '2013', type: '싱글', color: col(38),
    tracks: [
      { number: 1, title: '버려진 것들' },
    ],
  },
  {
    id: 39, title: '다시, 봄', year: '2013', type: '싱글', color: col(39),
    tracks: [
      { number: 1, title: '다시, 봄' },
    ],
  },
  {
    id: 40, title: '단 한 번도 넌', year: '2013', type: '싱글', color: col(40),
    tracks: [
      { number: 1, title: '단 한 번도 넌' },
      { number: 2, title: '쓰여지지 않은 삶' },
    ],
  },
  {
    id: 41, title: '달 달 무슨 달', year: '2013', type: '싱글', color: col(41),
    tracks: [
      { number: 1, title: '달 달 무슨 달' },
    ],
  },

  // ── id 42–45 · rear column ─────────────────────────────────────────
  {
    id: 42, title: 'Just Christmas', year: '2012', type: '싱글', color: col(42),
    tracks: [
      { number: 1, title: 'Just Christmas' },
    ],
  },
  {
    id: 43, title: 'From. Paris', year: '2012', type: 'EP', color: col(43),
    tracks: [
      { number: 1, title: '입맛이 없어요' },
      { number: 2, title: 'From. Paris' },
      { number: 3, title: 'As For Me' },
      { number: 4, title: 'Paradise' },
      { number: 5, title: '동행' },
      { number: 6, title: 'Happy Birthday Waltz' },
      { number: 7, title: '우리가 있던 시간' },
    ],
  },
  {
    id: 44, title: '우리가 있던 시간', year: '2012', type: '싱글', color: col(44),
    tracks: [
      { number: 1, title: '우리가 있던 시간' },
      { number: 2, title: 'As for me' },
    ],
  },
  {
    id: 45, title: 'Happy Birthday Waltz', year: '2012', type: '싱글', color: col(45),
    tracks: [
      { number: 1, title: 'Happy Birthday Waltz' },
      { number: 2, title: 'Paradise' },
    ],
  },
]

export default ALBUMS
