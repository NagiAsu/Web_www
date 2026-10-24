// 全站共用的小功能，不靠任何框架：手機選單、捲動陰影、首頁複製 IP、內頁側欄與本頁目錄、圖片放大、搜尋
const $ = (s) => document.querySelector(s);

// 手機選單（網站選單）與內頁的側欄
$('#mobile-menu-btn')?.addEventListener('click', () => $('#mobile-menu').classList.toggle('hidden'));
document.querySelectorAll('#mobile-menu a').forEach((a) => a.addEventListener('click', () => $('#mobile-menu').classList.add('hidden')));
$('#side-btn')?.addEventListener('click', () => $('#sidebar').classList.toggle('hidden'));
$('#sidebar a.bg-sky-100')?.scrollIntoView({ block: 'center' });

addEventListener('scroll', () => $('#navbar').classList.toggle('shadow-md', scrollY > 50), { passive: true });

// 首頁：點 IP 複製、按鈕捲到區塊
function copyIP() {
  navigator.clipboard.writeText('NagiAsu.xyz').then(() => {
    const toast = $('#copy-toast');
    toast.classList.remove('opacity-0');
    toast.style.transform = 'translate(-50%, 0px)';
    setTimeout(() => { toast.classList.add('opacity-0'); toast.style.transform = 'translate(-50%, 10px)'; }, 2000);
  });
}
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// 內頁：本頁目錄（h2、h3），捲動時標出目前的段落
const heads = [...document.querySelectorAll('.doc h2[id], .doc h3[id]')];
const toc = $('#toc');
if (toc) {
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  toc.innerHTML = heads.map((h) => `<a class="${h.tagName.toLowerCase()}" href="#${encodeURIComponent(h.id)}">${esc(h.textContent)}</a>`).join('');
  const links = [...toc.querySelectorAll('a')];
  const mark = () => {
    const i = heads.findLastIndex((h) => h.getBoundingClientRect().top < 120);
    links.forEach((a, k) => a.classList.toggle('on', k === i));
  };
  addEventListener('scroll', mark, { passive: true });
  mark();
}

// 內文圖片點擊放大
document.querySelectorAll('.doc img').forEach((img) => img.addEventListener('click', () => {
  const z = document.createElement('div');
  z.className = 'zoom';
  z.innerHTML = `<img src="${img.src}" alt="">`;
  z.onclick = () => z.remove();
  document.body.append(z);
}));

// 搜尋：第一次打開時才載入 Pagefind（索引在建置時產生）
let ui;
async function openSearch() {
  $('#search-panel').classList.remove('hidden');
  if (!ui) {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = '/pagefind/pagefind-ui.css';
    document.head.append(css);
    await new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = '/pagefind/pagefind-ui.js'; s.onload = ok; s.onerror = fail;
      document.head.append(s);
    });
    ui = new PagefindUI({
      element: '#search', showSubResults: true, showImages: false,
      translations: { placeholder: '搜尋', zero_results: '找不到「[SEARCH_TERM]」', clear_search: '清除', load_more: '更多結果' },
    });
  }
  setTimeout(() => $('#search input')?.focus(), 50);
}
$('#search-btn').addEventListener('click', openSearch);
$('#search-panel').addEventListener('click', (e) => { if (e.target.id === 'search-panel') e.target.classList.add('hidden'); });
addEventListener('keydown', (e) => {
  const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
  if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape') $('#search-panel').classList.add('hidden');
});
