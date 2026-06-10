// ============================================================
// Art Friend — Gallery script
// ============================================================

let activeTag = "";
let searchQuery = "";
let viewList = [];          // 현재 화면에 보이는 작품 목록
let currentIndex = 0;       // 모달에서 보고 있는 작품의 viewList 내 인덱스

const galleryEl = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const tagRow = document.getElementById('tagRow');

// ---------- 태그 버튼 생성 ----------
function buildTags(){
  const tags = [...new Set(ARTWORKS.flatMap(a => a.tags))].sort();
  tags.forEach(tag => {
    const pill = document.createElement('button');
    pill.className = 'tag-pill';
    pill.textContent = tag;
    pill.dataset.tag = tag;
    pill.addEventListener('click', () => toggleTag(tag));
    tagRow.appendChild(pill);
  });
}

function toggleTag(tag){
  activeTag = (activeTag === tag) ? "" : tag;
  document.querySelectorAll('#tagRow .tag-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.tag === activeTag);
  });
  render();
}

// ---------- 필터링 ----------
function getFiltered(){
  const q = searchQuery.trim().toLowerCase();
  return ARTWORKS.filter(a => {
    if (q && !a.author.toLowerCase().includes(q)) return false;
    if (activeTag && !a.tags.includes(activeTag)) return false;
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
        <div class="c-meta">${art.author} · ${art.material}</div>
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
  const tags = art.tags.map(t =>
    `<button class="tag-pill" data-tag="${t}">${t}</button>`).join('');
  return `
    <div class="lb-slide">
      <div class="lb-media" data-close="1">
        <img src="${art.image}" alt="${art.title}" draggable="false">
      </div>
      <div class="lb-meta">
        <div class="m-title">${art.title}</div>
        <div class="m-author">${art.author} 작가</div>
        <div class="m-row"><div class="m-key">Material</div><div class="m-val">${art.material}</div></div>
        <div class="m-row"><div class="m-key">Date</div><div class="m-val">${formatDate(art.date)}</div></div>
        <div class="m-row"><div class="m-key">About</div><div class="m-val">${art.description}</div></div>
        <div class="m-tags">${tags}</div>
      </div>
    </div>`;
}

// 현재 인덱스 기준으로 [이전, 현재, 다음] 3개 슬라이드를 그린다 (순환)
function buildSlides(){
  const n = viewList.length;
  const prev = viewList[(currentIndex - 1 + n) % n];
  const cur  = viewList[currentIndex];
  const next = viewList[(currentIndex + 1) % n];
  track.innerHTML = slideMarkup(prev) + slideMarkup(cur) + slideMarkup(next);
  setTrack(-stageWidth(), false);
  bindSlideTags();
}

function bindSlideTags(){
  track.querySelectorAll('.tag-pill[data-tag]').forEach(p => {
    p.addEventListener('click', (e) => {
      e.stopPropagation();
      if (didDrag) return;            // 드래그였으면 무시
      const tag = p.dataset.tag;
      closeModal();
      // 태그 활성화 + 상단 태그버튼 동기화
      activeTag = tag;
      searchQuery = ''; searchInput.value = '';
      document.querySelectorAll('#tagRow .tag-pill').forEach(b =>
        b.classList.toggle('active', b.dataset.tag === tag));
      render();
    });
  });
}

function stageWidth(){ return stage.clientWidth; }

function setTrack(x, animate){
  track.style.transition = animate
    ? 'transform .42s cubic-bezier(.22,.61,.36,1)' : 'none';
  track.style.transform = `translateX(${x}px)`;
}

function openModal(idx){
  currentIndex = idx;
  buildSlides();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  hint.style.opacity = '1';
  clearTimeout(hint._t);
  hint._t = setTimeout(() => { hint.style.opacity = '0'; }, 2600);
}

function closeModal(){
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function formatDate(str){
  const d = new Date(str);
  return `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.`;
}

// ---- 다음/이전 (애니메이션 후 슬라이드 재구성) ----
let animating = false;
function go(dir){            // dir: +1 next, -1 prev
  if (animating || viewList.length < 2) return;
  animating = true;
  const W = stageWidth();
  setTrack(dir > 0 ? -2*W : 0, true);
  const onEnd = () => {
    track.removeEventListener('transitionend', onEnd);
    const n = viewList.length;
    currentIndex = (currentIndex + dir + n) % n;
    buildSlides();          // 가운데로 리셋
    animating = false;
  };
  track.addEventListener('transitionend', onEnd);
}

// ---- 포인터 드래그 / 스와이프 / 탭 ----
let startX = 0, startY = 0, startT = 0, dragging = false, didDrag = false, baseX = 0;

stage.addEventListener('pointerdown', (e) => {
  if (animating) return;
  dragging = true; didDrag = false;
  startX = e.clientX; startY = e.clientY; startT = Date.now();
  baseX = -stageWidth();
  setTrack(baseX, false);
  stage.setPointerCapture(e.pointerId);
});

stage.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (!didDrag && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) didDrag = true;
  if (didDrag){
    e.preventDefault();
    setTrack(baseX + dx, false);
  }
});

stage.addEventListener('pointerup', (e) => {
  if (!dragging) return;
  dragging = false;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const dt = Date.now() - startT;
  const W = stageWidth();
  const threshold = Math.min(W * 0.18, 90);

  // 탭 판정: 움직임이 거의 없고 짧게 누름 → 이미지면 닫기
  if (!didDrag && Math.abs(dx) < 8 && Math.abs(dy) < 8 && dt < 300){
    if (e.target.closest('[data-close]')) closeModal();
    return;
  }

  if (dx <= -threshold)      go(1);
  else if (dx >= threshold)  go(-1);
  else                       setTrack(baseX, true);  // 스냅백
});

stage.addEventListener('pointercancel', () => {
  if (!dragging) return;
  dragging = false;
  setTrack(-stageWidth(), true);
});

// 배경(딤) 클릭 시 닫기
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lb-shell')) closeModal();
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
render();
