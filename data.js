// ============================================================
// 작품 데이터
// 사진(image)은 구글 드라이브 공유 링크를 아래 형식으로 변환해서 넣으면 됩니다.
//   원본: https://drive.google.com/file/d/【FILE_ID】/view?usp=sharing
//   변환: https://lh3.googleusercontent.com/d/【FILE_ID】
// (선생님들이 작품 사진을 드라이브 폴더에 올리고, 이 파일에 한 줄씩 추가하는 방식)
// ============================================================

const ARTWORKS = [
  {
    id: 1,
    title: "여름밤의 불꽃놀이",
    author: "김민준",
    material: "수채화",
    date: "2026-05-12",
    description: "여름밤 밤하늘에 퍼지는 불꽃의 색감을 수채화 번짐 기법으로 표현한 작품입니다.",
    tags: ["풍경", "수채화", "여름"],
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "나의 강아지, 콩이",
    author: "이서연",
    material: "색연필",
    date: "2026-05-08",
    description: "집에서 키우는 반려견 콩이를 관찰하여 그린 동물 인물화입니다.",
    tags: ["동물", "색연필", "인물"],
    image: "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "바다 위의 배",
    author: "박지호",
    material: "아크릴",
    date: "2026-04-29",
    description: "거제도 앞바다를 항해하는 배의 모습을 아크릴 물감으로 표현했습니다.",
    tags: ["풍경", "아크릴", "바다"],
    image: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "추상 도형 놀이",
    author: "최하은",
    material: "포스터물감",
    date: "2026-04-20",
    description: "원, 삼각형, 사각형을 활용한 색채 구성 연습 작품입니다.",
    tags: ["추상", "포스터물감", "색채구성"],
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "봄날의 정원",
    author: "김민준",
    material: "오일파스텔",
    date: "2026-03-15",
    description: "꽃이 만개한 봄 정원을 오일파스텔의 부드러운 질감으로 표현했습니다.",
    tags: ["풍경", "오일파스텔", "봄"],
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "고흐 따라그리기 — 별이 빛나는 밤",
    author: "이서연",
    material: "아크릴",
    date: "2026-03-02",
    description: "고흐 전시 관람 후, 별이 빛나는 밤의 붓터치를 모작하며 연습한 작품입니다.",
    tags: ["모작", "아크릴", "밤"],
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: 7,
    title: "나만의 캐릭터",
    author: "정유진",
    material: "마카",
    date: "2026-02-18",
    description: "상상 속 캐릭터를 디자인하고 마카로 채색한 작품입니다.",
    tags: ["캐릭터", "마카", "상상화"],
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: 8,
    title: "가을 숲길",
    author: "박지호",
    material: "수채화",
    date: "2026-02-05",
    description: "단풍이 물든 숲길의 풍경을 수채화로 담았습니다.",
    tags: ["풍경", "수채화", "가을"],
    image: "https://images.unsplash.com/photo-1507371341162-763b5e419408?q=80&w=1200&auto=format&fit=crop"
  }
];
