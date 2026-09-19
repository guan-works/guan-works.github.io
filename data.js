// ============================================================
// 作品資料管理區 — 新增/修改作品主要都在改這個檔案
// ============================================================
// 每件作品的欄位：
//   id            作品的唯一代號，全站不能重複，建議跟圖片檔名前綴一致
//   title         作品標題（會顯示在磚塊 hover 與燈箱）
//   category      分類，只能是 print（平面廣告）/ packaging（包裝編排）/ ecommerce（電商圖文）
//   year          年份文字，磚塊與燈箱都會顯示
//   importance    這件作品重不重要，只能是 "featured"（主打）或 "normal"（一般）
//   description   作品簡介，顯示在燈箱右側
//   images        圖片路徑陣列，見下方「圖片資料夾規則」
//
// 桌機版面會照每張圖片「自己的實際比例」自動排版——直式、橫式、方形
// 都不用手動指定，直接放圖就會照真實比例顯示，不會被裁切。你只需要
// 決定 importance：
//   - "featured"：整排滿版全寬呈現，做成「精選作品」的醒目效果，
//     建議每個分類抓 1 件就好（目前 3 個分類、剛好 3 件主打，也會是
//     「全部」分類最前面依序出現的 3 個精選區塊，順序照 CATEGORY_ORDER 排）
//   - "normal"：跟其他一般作品一起排在下面的多欄版面裡
//
// 圖片資料夾規則：
//   正式圖片依「分類」分開放在 images/ 底下的三個子資料夾，
//   方便你自己管理：
//     images/print/       平面廣告
//     images/packaging/   包裝編排
//     images/ecommerce/   電商圖文
//   檔名請用「作品id-流水號.jpg」，例如 e01 這件作品若有 3 張圖：
//     images/ecommerce/e01-01.jpg
//     images/ecommerce/e01-02.jpg
//     images/ecommerce/e01-03.jpg
//   下面每件作品的 images 已經照這個規則先把路徑打好了，你只需要把
//   對應檔名的圖片放進對應分類的資料夾即可，不需要改路徑文字。
//   在你放入正式圖片之前，網站會自動顯示暫用色塊（不會空白），
//   細節見「教學指南.md」的「圖片備援機制」說明。
// ============================================================
const categoryNames={all:"全部作品",print:"平面廣告",packaging:"包裝編排",ecommerce:"電商圖文"};

// 分類的英文名稱 —— 只會顯示在「目前分類」標籤跟燈箱裡（比較大、比較
// 有空間的地方），分類篩選按鈕維持中文即可，避免按鈕因為中英合併而
// 變太長。想增減分類時，這裡也要跟著補上對應的英文。
const categoryNamesEN={print:"PRINT",packaging:"PACKAGING",ecommerce:"E-COMMERCE"};

// 分類的顯示／排列順序 —— 這一份清單同時控制兩件事：
//   1. 分類篩選按鈕由左到右的順序
//   2.「全部」分類下，最前面幾個精選作品的排列順序
// 想調整分類順序，只要改這裡的排列，不用去改 index.html 或 script.js。
// 想新增分類：三個地方各補一行就好——這裡加分類代號、上面 categoryNames
// 加中文名稱、categoryNamesEN 加英文名稱，之後新增作品時 category 欄位
// 填這個新代號即可，不需要改任何排版邏輯。
const CATEGORY_ORDER=["print","packaging","ecommerce"];

// 暫用色塊產生器：只在正式圖片還沒放入、或路徑打錯抓不到檔案時，
// 自動被 script.js 呼叫顯示，不需要手動修改這個函式。
function placeholder(title,subtitle,palette="a"){const palettes={a:["#c9c1b6","#33312f"],b:["#b8b0a6","#1d1d1b"],c:["#d8d1c8","#49443f"],d:["#aaa39b","#f5f2ec"],e:["#d0c4b6","#272522"],f:["#bfc5c0","#26302b"]};const [bg,fg]=palettes[palette];const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900"><rect width="100%" height="100%" fill="${bg}"/><rect x="7%" y="9%" width="86%" height="82%" fill="none" stroke="${fg}" stroke-opacity=".22" stroke-width="3"/><circle cx="74%" cy="37%" r="165" fill="${fg}" fill-opacity=".08"/><text x="9%" y="69%" fill="${fg}" font-family="Arial" font-size="88" font-weight="700">${title}</text><text x="9%" y="78%" fill="${fg}" fill-opacity=".7" font-family="Arial" font-size="27">${subtitle}</text></svg>`;return"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg)}

const works=[
{id:"p01",title:"保健品原料三折DM",category:"print",year:"2022 (涉及原公司機密做馬賽克處理)",importance:"featured",description:"以護肝訴求為核心。將PM提供的原始文字與數據重新歸納，拉出主次重點轉化為醒目標題；同時重繪專業機制圖與統計圖表，獨立完成整份文宣封面與內頁的視覺設計，將生硬資料轉化為直覺易讀的文宣。\n※註：由於涉及原公司機密，僅作視覺呈現及部分展示。",images:["images/print/p01-01.jpg"]},
{id:"p02",title:"食品雜誌跨頁廣告設計(已出版)",category:"print",year:"2022",importance:"normal",description:"為保健原料公司之2022年6/7雙月刊 TAIWAN Food News食品雜誌跨頁廣告設計，主要為介紹公司新原料，以其能提神效果為訴求，將人物與背景使用Photoshop合成如活力充沛的狀態，且在不涉及療效的情況下發想主標文案，右頁下方則為公司其他次要主打原料之曝光。",images:["images/print/p02-01.jpg"]},
{id:"p03",title:"多款A4行銷文宣品設計",category:"print",year:"2020",importance:"normal",description:"多款餐廚用品的廣告傳單設計，用以推廣給行銷團購業主。",images:["images/print/p03-01.jpg"]},
{id:"p04",title:"品牌特賣會與團購網活動系列設計",category:"print",year:"2023",importance:"normal",description:"– 旗幟力求資訊清晰，重點文字置於中央；特賣款選用通用向量圖示呈現商品類別，避免受限於單一品項，讓宣傳用途更廣泛。\n– 團購款則以清新綠色為基調，結合生鮮食材、飛濺水花與綠葉元素，營造豐富飽滿的視覺層次，直觀凸顯商品的新鮮品質。\n\n材質與尺寸：雙透布桃太郎旗，60x150cm",images:["images/print/p04-01.jpg","images/print/p04-02.jpg","images/print/p04-03.jpg"],imageDescriptions:["","特賣活動宣傳單，主題與日期採用光芒聚焦設計吸引目光，並將主打商品、活動贈品、付款方式及地圖資訊妥善分區規劃，讓促銷內容一目了然。\n材質與尺寸：100g銅版紙A4雙面印刷。 ","廠內乳膠墨帆布360X90cm"]},
{id:"p05",title:"汽車美容名片與VIP會員卡設計",category:"print",year:"2016",importance:"normal",description:"",imageDescriptions:["名片正面使用車體特寫，讓人能直覺辨識產業類型；下方整合主要服務項目，背面則以汽車內裝為背景，在保有視覺情境的同時，確保地圖與聯絡資訊清晰易讀。\n使用頂級卡雙面霧膜+局部上光","會員卡做為消費紀錄用，全採內裝背景為輔且不上模，以便後續書寫或蓋章，流水號則選用燙金作為凸顯。\n使用頂級象牙卡，正面流水號燙金"],images:["images/print/p05-01.jpg","images/print/p05-02.jpg"]},
{id:"p06",title:"烘焙書籍插頁廣告",category:"print",year:"2021",importance:"normal",description:"配合知名烘焙師書籍之插頁廣告，搭配食譜內容挑選合適商品，以色塊標示規格重點與俐落文案，降低生硬廣告感，使版面自然融入書籍整體風格。",imageDescriptions:[""],images:["images/print/p06-01.jpg"]},
{id:"p07",title:"過濾器說明書(五折彈簧、A4改版款)",category:"print",year:"2020、2026",importance:"normal",description:"",imageDescriptions:["受限於產品包裝尺寸，但必要安裝資訊較多，所以說明書選用彈簧五折方式，將各種內容歸納並分別放置於雙面。","因應包裝改款，說明書重新規劃為 A4 十字對折形式。重組原本零散且重複性高的資訊，將「安裝前確認」獨立條列於首頁右上，並利用色彩規劃於背面重點強化濾心拆封等安全提醒，大幅提升操作指引的直覺性與易讀性。"],images:["images/print/p07-01.jpg","images/print/p07-02.jpg"]},
{id:"p08",title:"台北美容保養．生技保健大展系列廣告及燈箱",category:"print",year:"2022",importance:"normal",description:"",imageDescriptions:["以公司主要產品劑型與主力原料作為視覺主軸，將粉劑、膠囊、苦瓜與蔬果酵素等素材透過Photoshop重新合成。封面以上半部影像、下半部留白的方式安排版面，將年份與目錄資訊集中於下方，讓豐富的素材與文字資訊維持清楚的層次與視覺平衡。","上下翻轉素材檔案，先消除公司未有之精油物品，增加主力苦瓜原料與缽內粉劑，再合成蔬果食材，最終再增加膠囊劑型，讓目錄封面的元素更貼合公司各種劑型與原料。","- 左上：產品展示背板：延續該年度公司總目錄的視覺風格，依據實際展示空間重新調整物品配置，使背景圖像與展示商品之間保有適當的視覺區隔，同時維持整體識別與畫面一致性。\n- 右上：兩張燈箱設計：展場所有燈箱為三個設計合作，除沿用舊設計做些微變動外，此兩款燈箱為此次展覽新設計，皆依據原料特性(保肝、心血管)做不同的效果展示。"],images:["images/print/p08-01.jpg","images/print/p08-02.gif","images/print/p08-03.jpg"]},
{id:"p09",title:"食譜書插頁廣告設計",category:"print",year:"2022",importance:"normal",description:"針對商品特性發想核心標題，並以專業主廚形象作為視覺焦點，傳遞工欲善其事，必先利其器，營造出使用這些工具也能像主廚般專業的信賴感。",images:["images/print/p09-01.jpg"]},


{id:"k01",title:"保健沖泡飲品包裝編排與鋁袋設計",category:"packaging",year:"2022",importance:"normal",description:"以產品主原料納豆紅麴之功效，針對可維持血液流動順暢，支持心血管與循環健康為發想概念，呈現紅血球與沖泡飲流動的視覺意象作為包裝呈現。\n※註：此為廠商產品包合成示意圖，雖非最終成品圖，但已為選用設計，切勿擅自轉載、竊取盜用或抄襲。",images:["images/packaging/k01-01.jpg","images/packaging/k01-02.jpg","images/packaging/k01-03.jpg"]},
{id:"k02",title:"品牌不織布提袋圖案設計",category:"packaging",year:"2017",importance:"normal",description:"此為品牌LOGO強化概念，作為百貨櫃位與展覽使用。\n※註：模擬圖為AI生成再經人工合成修正。",images:["images/packaging/k02-01.jpg","images/packaging/k02-02.jpg"]},
{id:"k03",title:"過濾器飛機盒編排設計",category:"packaging",year:"2020",importance:"featured",description:"主要依據盒形刀模作內容編排設計，以簡約水波紋搭配產品正面及特點ICON，呈現乾淨清徹的意象。\n材質與後加工：300g灰銅卡裱白F浪，單面霧膜，產品局部上光，LOGO打凸設計。",images:["images/packaging/k03-01.jpg","images/packaging/k03-02.jpg"]},
{id:"k04",title:"平底鍋吊卡資訊視覺設計",category:"packaging",year:"2017",importance:"normal",description:"針對百貨櫃位掛架與參展平放陳列情境，採圓形裁切與鍋型呼應，半包覆式吊卡結構完整保留把手握感與鍋底展示，搭配豐富配色料理情境圖來吸引消費者，兼具資訊傳達與商品展示的功能。",images:["images/packaging/k04-01.jpg","images/packaging/k04-02.jpg"]},
{id:"k05",title:"炒鍋瓦楞提盒視覺編排設計",category:"packaging",year:"2020",importance:"normal",description:"兼具百貨櫃位陳列或網購出貨，採用彩色瓦楞提盒設計，依據印刷廠客製刀模做視覺編排呈現。\n正反面以商品白圖搭配產品特點，讓商品外觀與重要資訊清楚呈現，側邊輔以細節圖片與商品規格。",images:["images/packaging/k05-01.jpg","images/packaging/k05-02.jpg"]},

{id:"e01",title:"購物平台濾油壺圖文設計",category:"ecommerce",year:"2023",importance:"featured",description:"此為購物平台電腦與手機介面圖文介紹編排設計，依據產品色系搭配清晰產品特色說明。",images:["images/ecommerce/e01-01.jpg"]},
{id:"e02",title:"購物平台過濾器圖文設計",category:"ecommerce",year:"2021",importance:"normal",description:"透過細部標示說明產品各部位規格與材質，並結合過濾原理圖解，規劃符合電腦與手機介面的圖文排版。",images:["images/ecommerce/e02-01.jpg","images/ecommerce/e02-02.jpg","images/ecommerce/e02-03.jpg"]},
{id:"e03",title:"官方LINE@廣告宣傳",category:"ecommerce",year:"2021~2023",importance:"normal",description:"品牌官方社群廣告設計。",images:["images/ecommerce/e03-01.jpg","images/ecommerce/e03-02.jpg","images/ecommerce/e03-03.jpg","images/ecommerce/e03-04.jpg"]},
{id:"e04",title:"Facebook產品限時動態廣告",category:"ecommerce",year:"2023",importance:"normal",description:"母親節活動產品限時動態廣告設計。",images:["images/ecommerce/e04-01.jpg","images/ecommerce/e04-02.jpg","images/ecommerce/e04-03.jpg"]},
{id:"e05",title:"品牌官網首頁廣告Banner",category:"ecommerce",year:"2020~2022",importance:"normal",description:"多款活動宣傳廣告Banner設計。",images:["images/ecommerce/e05-01.jpg","images/ecommerce/e05-02.jpg","images/ecommerce/e05-03.jpg","images/ecommerce/e05-04.jpg"]},
{id:"e06",title:"購物平台抗菌噴劑圖文設計",category:"ecommerce",year:"2021",importance:"normal",description:"此為購物平台手機介面展示，除獨立編排設計圖文介紹外，亦負責繪製載體技術圖。",images:["images/ecommerce/e06-01.jpg"]}
];
