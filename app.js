// ============================================================
// Art Friend — Gallery script (Google Sheets CSV 연동)
// ============================================================

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRIsCafYJeB2Aw9S4wfwBWNIVMGgOi8oVRNWX-0we-0O4GFvYpgieihGMWx5D4EkAXN461Pw30T0x2F/pub?gid=0&single=true&output=csv";

const FIXED_TAGS = ["Kids", "Junior", "Drawing", "Craft", "Special", "Exhibition"];

let ARTWORKS = [];
let activeTags = new Set();
let searchQuery = "";
let viewList = [];
let currentIndex = 0;

const galleryEl = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const tagRow = document.getElementById('tagRow');

// ---------- 데이터 로드 ----------
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadData(){
  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      ARTWORKS = results.data
        .filter(row => row.title && row.img) // 빈 행 제외
        .map(row => ({
          id: row.id,
          title: (row.title || '').trim(),
          age: (row.artist || '').trim(),
          material: (row.material || '').trim(),
          date: (row.date || '').trim(),
          description: (row.desc || '').trim(),
          tags: (row.tags || '').split(',').map(t => t.trim()).filter(Boolean),
          keywords: (row.keywords || '').split(',').map(t => t.trim()).filter(Boolean),
          image: (row.img || '').trim()
        }));
      shuffle(ARTWORKS);
      render();
    },
    error: () => {
      galleryEl.innerHTML = `
        <div class="empty-state">
          <div class="e-title">작품을 불러오지 못했습니다</div>
          <div>잠시 후 새로고침 해주세요.</div>
        </div>`;
    }
  });
}

// ---------- 태그 버튼 생성 (고정) ----------
function buildTags(){
  FIXED_TAGS.forEach(tag => {
    const pill = document.createElement('button');
    pill.className = 'tag-pill';
    pill.textContent = tag;
    pill.dataset.tag = tag;
    pill.addEventListener('click', () => toggleTag(tag));
    tagRow.appendChild(pill);
  });
}

function toggleTag(tag){
  if (activeTags.has(tag)) activeTags.delete(tag);
  else activeTags.add(tag);
  document.querySelectorAll('#tagRow .tag-pill').forEach(p => {
    p.classList.toggle('active', activeTags.has(p.dataset.tag));
  });
  render();
}

// ---------- 필터링 ----------
function getFiltered(){
  const q = searchQuery.trim().toLowerCase();
  return ARTWORKS.filter(a => {
    if (q){
      const hay = [a.title, ...a.keywords].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (activeTags.size > 0){
      for (const t of activeTags){
        if (!a.tags.includes(t)) return false;
      }
    }
    return true;
  });
}

// ---------- 그리드 렌더 ----------
function render(){
  viewList = getFiltered();
  galleryEl.innerHTML = '';

  if (viewList.length === 0){
    galleryEl.innerHTML = `
      <div class="empty-state">
        <div class="e-title">표시할 작품이 없습니다</div>
        <div>검색어나 태그를 바꿔 보세요.</div>
      </div>`;
    return;
  }

  viewList.forEach((art, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = Math.min(idx * 0.045, 0.45) + 's';
    card.innerHTML = `
      <img src="${art.image}" alt="${art.title}" loading="lazy">
      <div class="card-overlay">
        <div class="c-name">${art.title}</div>
        <div class="c-meta">${[formatAge(art.age), art.material].filter(Boolean).join(' · ')}</div>
      </div>`;
    card.addEventListener('click', () => openModal(idx));
    galleryEl.appendChild(card);
  });
}

// ---------- 검색 ----------
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  render();
});

// ============================================================
// Lightbox (스와이프 탐색 + 탭하여 닫기)
// ============================================================
const lightbox = document.getElementById('lightbox');
const stage = document.getElementById('lbStage');
const track = document.getElementById('lbTrack');
const hint = document.getElementById('lbHint');

function slideMarkup(art){
  const tags = art.tags.filter(t => FIXED_TAGS.includes(t)).map(t =>
    `<button class="tag-pill" data-tag="${t}">${t}</button>`).join('');
  return `
    <div class="lb-slide">
      <div class="lb-media" data-close="1">
        <img src="${art.image}" alt="${art.title}" draggable="false">
      </div>
      <div class="lb-meta">
        <div class="m-title">${art.title}</div>
        <div class="m-author">${formatAge(art.age)}</div>
        <div class="m-row"><div class="m-key">Material</div><div class="m-val">${art.material}</div></div>
        <div class="m-row"><div class="m-key">Date</div><div class="m-val">${formatDate(art.date)}</div></div>
        <div class="m-row"><div class="m-key">About</div><div class="m-val">${art.description}</div></div>
        <div class="m-tags">${tags}</div>
      </div>
    </div>`;
}

function bindSlideTags(){
  track.querySelectorAll('.tag-pill[data-tag]').forEach(p => {
    p.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = p.dataset.tag;
      closeModal();
      activeTags = new Set([tag]);
      searchQuery = ''; searchInput.value = '';
      document.querySelectorAll('#tagRow .tag-pill').forEach(b =>
        b.classList.toggle('active', activeTags.has(b.dataset.tag)));
      render();
    });
  });
}

function renderSlide(){
  const art = viewList[currentIndex];
  track.style.transition = 'none';
  track.style.transform = 'translateX(0)';
  track.innerHTML = slideMarkup(art);
  track.classList.remove('lb-fade');
  void track.offsetWidth; // reflow to restart animation
  track.classList.add('lb-fade');
  bindSlideTags();
}

function stageWidth(){ return stage.clientWidth; }

function openModal(idx){
  currentIndex = idx;
  renderSlide();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  hint.style.opacity = '1';
  clearTimeout(hint._t);
  hint._t = setTimeout(() => { hint.style.opacity = '0'; }, 2200);
}

function closeModal(){
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function formatAge(age){
  const a = (age || '').trim();
  if (!a) return '';
  if (/^\d+$/.test(a)) return `${a}세`;
  return a; // "art friends" 같은 특별활동 표기는 그대로
}

function formatDate(str){
  return (str || '').trim();
}

function go(dir){
  if (viewList.length < 2) return;
  const n = viewList.length;
  currentIndex = (currentIndex + dir + n) % n;
  renderSlide();
}

// 배경(딤) 클릭 시 닫기
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lb-shell')) closeModal();
  if (e.target.closest('[data-close]')) closeModal();
});

// 버튼 + 키보드
document.getElementById('lbClose').addEventListener('click', closeModal);
document.getElementById('lbPrev').addEventListener('click', () => go(-1));
document.getElementById('lbNext').addEventListener('click', () => go(1));
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft') go(-1);
  if (e.key === 'ArrowRight') go(1);
});

// 리사이즈 시 트랙 위치 보정
window.addEventListener('resize', () => {
  if (lightbox.classList.contains('open') && !animating && !dragging){
    setTrack(-stageWidth(), false);
  }
});

// ---------- init ----------
buildTags();
loadData();
