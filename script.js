// ============================================================
// 分類篩選按鈕：依 data.js 的 CATEGORY_ORDER 自動產生（「全部」按鈕
// 固定寫在 index.html，這裡只補上其餘分類），所以要調整分類順序，
// 只需要改 data.js，不用動這裡或 index.html。
// ============================================================
const filterNav=document.getElementById("filterNav");
CATEGORY_ORDER.forEach(cat=>{
  const btn=document.createElement("button");
  btn.className="filter";
  btn.dataset.filter=cat;
  btn.textContent=categoryNames[cat];
  filterNav.appendChild(btn);
});

const grid=document.getElementById("worksGrid");const filters=[...document.querySelectorAll(".filter")];const resultLabel=document.getElementById("resultLabel");const resultCount=document.getElementById("resultCount");

// ============================================================
// 排版邏輯（Desktop / Mobile 各自獨立）
// ------------------------------------------------------------
// Desktop：多欄自適應排版（CSS 原生 columns，不是固定格線）。
//   - 每件作品的磚塊高度完全由「圖片自己的實際比例」決定，不用手動
//     指定直式/橫式/方形，也不會裁切圖片內容——這是瀏覽器原生的多欄
//     流動排版，作品由上到下依序排進最左邊還沒排滿的那一欄，欄與欄
//     之間高度本來就會自然交錯，不會出現需要色塊填補的矩形空洞。
//   - 主打作品（importance:"featured"）會整排滿版全寬呈現，做成
//     「精選作品」的醒目效果，且「不會」被隨機打亂順序：在「全部」
//     分類下照 CATEGORY_ORDER 的分類順序排，在單一分類下維持 data.js
//     裡的原始順序。一般作品（"normal"）則會用固定 seed 洗牌，讓排列
//     有變化又不會每次重整就跳動——seed 是用「目前這批作品的 id」算
//     出來的固定數字，只有 data.js 內容改變，順序才會跟著重新洗牌。
// ============================================================
function hashSeed(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(seed){let a=seed;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function seededShuffle(arr,rand){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function orderWorks(list){
  const seed=hashSeed(list.map(w=>w.id+w.importance).join("|"));
  const rand=mulberry32(seed);
  const featuredList=list.filter(w=>w.importance==="featured")
    .sort((a,b)=>CATEGORY_ORDER.indexOf(a.category)-CATEGORY_ORDER.indexOf(b.category));
  const normalList=seededShuffle(list.filter(w=>w.importance!=="featured"),rand);
  return [...featuredList,...normalList];
}

// ============================================================
// 圖片備援機制
// ------------------------------------------------------------
// images 陣列裡放的是「正式圖片」路徑（images/...）。在你把
// 對應檔名的圖片放進資料夾之前，瀏覽器會抓不到檔案並觸發 error，這時
// 會自動改顯示暫用色塊（用 data.js 的 placeholder() 產生），不會整塊
// 空白。等你放入正式圖片、檔名對上，會自動改顯示正式圖片，不需要改
// 任何程式碼。
// ============================================================
const PALETTE_LETTERS=["a","b","c","d","e","f"];
function getWorkFallback(w){
  const letter=PALETTE_LETTERS[hashSeed(w.id)%PALETTE_LETTERS.length];
  return placeholder(w.title,categoryNames[w.category],letter);
}
document.addEventListener("error",e=>{
  const img=e.target;
  if(img&&img.tagName==="IMG"&&img.dataset&&img.dataset.fallback&&img.src!==img.dataset.fallback){
    img.src=img.dataset.fallback;
  }
},true);

// 縮圖路徑自動轉換：規則是「原圖檔名 + t，統一放在 images/thumbs/ 資料夾」，
// 例如 images/ecommerce/e02-01.jpg → images/thumbs/e02-01t.jpg。只要縮圖
// 照這個規則命名，這裡就會自動算出對應路徑，不用在 data.js 每件作品手動填
// 縮圖欄位。主打作品（importance:"featured"）維持使用原圖，不套用這個規則
// ——因為主打作品是整排滿版全寬呈現，尺寸比一般磚塊大很多，縮圖畫質會不夠。
function thumbSrc(path,w){
  if(w.importance==="featured")return path;
  const slash=path.lastIndexOf("/");
  const folder=path.slice(0,slash+1);
  const filename=path.slice(slash+1);
  const dot=filename.lastIndexOf(".");
  const thumbName=dot===-1?filename+"t":filename.slice(0,dot)+"t"+filename.slice(dot);
  return "images/thumbs/"+thumbName;
}

// isFirst：true 代表這是目前畫面上第一張要顯示的圖片，也就是瀏覽器會判定
// 的「LCP 主視覺圖」。這張圖片改成優先載入（拿掉 lazy、加上
// fetchpriority="high"），讓瀏覽器一開始就用最高優先權去下載這一張；其餘
// 圖片維持原本的 loading="lazy" 延遲載入，避免整批圖片一開始就搶著下載。
// w.width / w.height（data.js 裡如果有填這件作品第一張圖片的實際像素寬高）
// 會輸出成 <img> 的 width / height 屬性，讓瀏覽器在圖片還沒下載完成前就能
// 先算出正確的顯示高度、預留版面空間，減少下面作品被突然往下推的畫面跳動
// 感（CLS）。沒有填 width/height 的作品，行為跟以前完全一樣，不會出錯。
// 首頁封面圖改用 thumbSrc() 抓縮圖（主打作品除外，見上方 thumbSrc 說明），
// 縮圖檔案不存在或抓不到時，一樣會自動改顯示暫用色塊，不會破圖。
function tileMarkup(w,isFirst){
  const fb=getWorkFallback(w);
  const featuredClass=w.importance==="featured"?" featured":"";
  const multi=w.images.length>1?`<span class="image-count-badge"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>${w.images.length}</span>`:"";
  const sizeAttr=(w.width&&w.height)?` width="${w.width}" height="${w.height}"`:"";
  const loadAttr=isFirst?` loading="eager" fetchpriority="high"`:` loading="lazy"`;
  return `<article class="work-tile${featuredClass}" data-id="${w.id}"><img src="${thumbSrc(w.images[0],w)}" data-fallback="${fb}" alt="${w.title}"${sizeAttr}${loadAttr}>${multi}<div class="work-overlay"><div><h3>${w.title}</h3><p>${w.year}</p></div><span class="tile-category">${categoryNames[w.category]}</span></div></article>`;
}
function bindTileClicks(){grid.querySelectorAll(".work-tile[data-id]").forEach(t=>t.addEventListener("click",()=>openLightbox(works.find(w=>w.id===t.dataset.id))))}
// 分類篩選按鈕維持中文（避免中英合併太長），但空間比較大的地方
// （目前分類標籤、燈箱分類欄）改成中英並列。
function bilingualCategory(cat){
  const en=categoryNamesEN&&categoryNamesEN[cat];
  return en?`${categoryNames[cat]} / ${en}`:categoryNames[cat];
}

// 記住目前選的分類，重新整理(F5)不會跳回「全部」——用網址後面的 #分類代號
// 記錄狀態，例如篩到包裝編排時網址會變成 ...index.html#packaging，重新整理
// 或直接分享這個網址，都會直接停在同一個分類。
function filterFromHash(){
  const h=decodeURIComponent(location.hash.replace("#",""));
  return CATEGORY_ORDER.includes(h)?h:"all";
}
function setHashForFilter(filter){
  const target=filter==="all"?location.pathname+location.search:`#${filter}`;
  history.replaceState(null,"",target);
}

// 手機版排序：主打作品一樣依 CATEGORY_ORDER 排在最前面（跟桌機版邏輯一致，
// 「全部」分類下才不會出現主打作品被穿插在其他作品中間的情況），其餘作品
// 依年份新到舊排列，方便照時間瀏覽。
function orderWorksMobile(list){
  const featuredList=list.filter(w=>w.importance==="featured")
    .sort((a,b)=>CATEGORY_ORDER.indexOf(a.category)-CATEGORY_ORDER.indexOf(b.category));
  const normalList=list.filter(w=>w.importance!=="featured")
    .sort((a,b)=>Number(b.year)-Number(a.year));
  return [...featuredList,...normalList];
}

const MOBILE_QUERY=window.matchMedia("(max-width:900px)");
let currentFilter=filterFromHash();
function render(filter){
  currentFilter=filter;
  const filtered=filter==="all"?works:works.filter(w=>w.category===filter);
  resultLabel.textContent=filter==="all"?categoryNames.all:bilingualCategory(filter);
  resultCount.textContent=`${filtered.length} 件作品`;
  if(!filtered.length){grid.innerHTML='<div class="empty-state">目前尚無作品。</div>';return}
  if(MOBILE_QUERY.matches){
    // Mobile：單欄「圖在上、文字在下」直式清單
    // (w,i)=>tileMarkup(w,i===0)：只有排在最前面（畫面第一個）的作品會被標成
    // isFirst＝優先載入，其餘作品維持原本的 lazy 延遲載入。
    grid.innerHTML=orderWorksMobile(filtered).map((w,i)=>tileMarkup(w,i===0)).join("");
  }else{
    // Desktop：多欄自適應排版，主打作品滿版、其餘照 seed 排序流入多欄
    grid.innerHTML=orderWorks(filtered).map((w,i)=>tileMarkup(w,i===0)).join("");
  }
  bindTileClicks();
}
MOBILE_QUERY.addEventListener("change",()=>render(currentFilter));
filters.forEach(btn=>{
  if(btn.dataset.filter===currentFilter) btn.classList.add("active"); else btn.classList.remove("active");
  btn.addEventListener("click",()=>{
    filters.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    setHashForFilter(btn.dataset.filter);
    render(btn.dataset.filter);
  });
});

const lb=document.getElementById("lightbox"),lbImage=document.getElementById("lightboxImage"),lbTitle=document.getElementById("lightboxTitle"),lbCategory=document.getElementById("lightboxCategory"),lbYear=document.getElementById("lightboxYear"),lbDescription=document.getElementById("lightboxDescription"),lbCounter=document.getElementById("lightboxCounter"),lbThumbs=document.getElementById("lightboxThumbs");let currentWork=null,currentIndex=0;
function openLightbox(work){currentWork=work;currentIndex=0;lb.classList.add("open");lb.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";renderLightbox()}
function closeLightbox(){lb.classList.remove("open");lb.setAttribute("aria-hidden","true");document.body.style.overflow=""}
function renderLightbox(){
  const multi=currentWork.images.length>1;
  const fb=getWorkFallback(currentWork);
  const fullSrc=currentWork.images[currentIndex];
  const previewSrc=thumbSrc(fullSrc,currentWork);
  const targetWork=currentWork,targetIndex=currentIndex;
  lbImage.dataset.fallback=fb;lbImage.alt=currentWork.title;
  // 先秒開縮圖（首頁磚牆已經載過，多半瀏覽器手上已經有現成的），
  // 讓使用者馬上看到東西、不是空白等待；縮圖跟原圖不同（也就是非
  // 主打作品）時，背景才另外去下載真正的原圖，下載完成後才無縫換
  // 上——中途如果使用者已經切到別張圖或關掉燈箱，就不會換錯圖。
  // 主打作品因為 thumbSrc 回傳的就是原圖本身，這段background 預載
  // 邏輯會直接略過，維持原本「一次到位」的行為，不會多一次下載。
  lbImage.src=previewSrc;
  lbImage.classList.toggle("lb-loading",previewSrc!==fullSrc);
  if(previewSrc!==fullSrc){
    const preload=new Image();
    preload.onload=()=>{
      if(currentWork===targetWork&&currentIndex===targetIndex){
        lbImage.src=fullSrc;
        lbImage.classList.remove("lb-loading");
      }
    };
    preload.onerror=()=>{
      if(currentWork===targetWork&&currentIndex===targetIndex){
        lbImage.classList.remove("lb-loading");
      }
    };
    preload.src=fullSrc;
  }
  lbTitle.textContent=currentWork.title;lbCategory.textContent=bilingualCategory(currentWork.category);lbYear.textContent=currentWork.year;
  // 每張圖片可以個別指定說明文字（見 data.js 的 imageDescriptions 欄位），
  // 沒有特別指定的圖片（或整件作品都沒設定這個欄位）就自動使用共用的
  // description，兩種混用也沒問題。
  const perImageDesc=currentWork.imageDescriptions&&currentWork.imageDescriptions[currentIndex];
  lbDescription.textContent=perImageDesc||currentWork.description;
  lbCounter.textContent=multi?`${currentIndex+1} / ${currentWork.images.length}`:"SINGLE IMAGE";
  document.getElementById("prevImage").style.display=multi?"block":"none";
  document.getElementById("nextImage").style.display=multi?"block":"none";
  lbThumbs.innerHTML="";lbThumbs.style.display=multi?"flex":"none";
  currentWork.images.forEach((src,i)=>{
    const b=document.createElement("button");
    b.className="thumb "+(i===currentIndex?"active":"");
    b.innerHTML=`<img src="${thumbSrc(src,currentWork)}" data-fallback="${fb}" alt="${currentWork.title} ${i+1}">`;
    b.onclick=()=>{currentIndex=i;renderLightbox()};
    lbThumbs.appendChild(b);
  });
}
function moveImage(direction){if(!currentWork||currentWork.images.length<2)return;currentIndex=(currentIndex+direction+currentWork.images.length)%currentWork.images.length;renderLightbox()}
const closeLightboxButton=document.getElementById("closeLightbox");const prevImageButton=document.getElementById("prevImage");const nextImageButton=document.getElementById("nextImage");
closeLightboxButton.addEventListener("click",closeLightbox);prevImageButton.addEventListener("click",()=>moveImage(-1));nextImageButton.addEventListener("click",()=>moveImage(1));
document.addEventListener("keydown",e=>{if(!lb.classList.contains("open"))return;if(e.key==="Escape")closeLightbox();if(e.key==="ArrowLeft")moveImage(-1);if(e.key==="ArrowRight")moveImage(1)});
let startX=0;
document.querySelector(".lightbox-main").addEventListener("touchstart",e=>startX=e.changedTouches[0].screenX,{passive:true});
document.querySelector(".lightbox-main").addEventListener("touchend",e=>{const diff=e.changedTouches[0].screenX-startX;if(Math.abs(diff)>45)moveImage(diff>0?-1:1)},{passive:true});
document.getElementById("currentYear").textContent=new Date().getFullYear();
render(currentFilter);

const backToTop=document.getElementById("backToTop");window.addEventListener("scroll",()=>backToTop.classList.toggle("visible",window.scrollY>500),{passive:true});backToTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
