import { useState, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ML2OZ = 0.033814;

const PRESETS = [
  { id: "negroni", category: "IBA Classic", name: "Negroni", ingredients: [{ name: "Gin", abv: 40, amount: 30 }, { name: "Campari", abv: 25, amount: 30 }, { name: "Sweet Vermouth", abv: 16, amount: 30 }] },
  { id: "margarita", category: "IBA Classic", name: "Margarita", ingredients: [{ name: "Tequila", abv: 40, amount: 50 }, { name: "Triple Sec", abv: 40, amount: 20 }, { name: "Lime Juice", abv: 0, amount: 15 }] },
  { id: "daiquiri", category: "IBA Classic", name: "Daiquiri", ingredients: [{ name: "White Rum", abv: 40, amount: 45 }, { name: "Simple Syrup", abv: 0, amount: 15 }, { name: "Lime Juice", abv: 0, amount: 25 }] },
  { id: "old-fashioned", category: "IBA Classic", name: "Old Fashioned", ingredients: [{ name: "Bourbon", abv: 45, amount: 60 }, { name: "Simple Syrup", abv: 0, amount: 5 }, { name: "Angostura Bitters", abv: 45, amount: 2 }] },
  { id: "cosmopolitan", category: "IBA Classic", name: "Cosmopolitan", ingredients: [{ name: "Vodka", abv: 40, amount: 40 }, { name: "Triple Sec", abv: 40, amount: 15 }, { name: "Cranberry Juice", abv: 0, amount: 30 }, { name: "Lime Juice", abv: 0, amount: 15 }] },
  { id: "nitro-martini", category: "分子調酒", name: "Nitro Martini", ingredients: [{ name: "Vodka", abv: 40, amount: 60 }, { name: "Dry Vermouth", abv: 18, amount: 15 }] },
  { id: "gin-sphere", category: "分子調酒", name: "Gin Sphere Fizz", ingredients: [{ name: "Gin", abv: 40, amount: 45 }, { name: "Elderflower Tonic", abv: 0, amount: 90 }, { name: "Lemon Juice", abv: 0, amount: 15 }] },
  { id: "virgin-mojito", category: "Mocktail", name: "Virgin Mojito", ingredients: [{ name: "Lime Juice", abv: 0, amount: 25 }, { name: "Simple Syrup", abv: 0, amount: 20 }, { name: "Soda Water", abv: 0, amount: 120 }, { name: "Mint Leaves", abv: 0, amount: 10 }] },
  { id: "shirley-temple", category: "Mocktail", name: "Shirley Temple", ingredients: [{ name: "Ginger Ale", abv: 0, amount: 120 }, { name: "Grenadine", abv: 0, amount: 15 }, { name: "Orange Juice", abv: 0, amount: 30 }] },
];

// calcType: 'pct' | 'lemon' | 'acid_yellow' | 'acid_green'
const TECHS = [
  // 一、澄清技術
  { cat: "澄清技術", name: "瓊脂熱澄清 Agar", material: "瓊脂粉 (Agar-Agar)", ratio: "0.04%–0.1%", lo: 0.04, hi: 0.1, unit: "g", calcType: "pct", note: "1/3液體與瓊脂加熱至85°C以上激活，再混回剩餘常溫液體靜置凝固。" },
  { cat: "澄清技術", name: "明膠冷凍澄清", material: "吉利丁粉 / 吉利丁片", ratio: "0.5%–1.0%", lo: 0.5, hi: 1.0, unit: "g", calcType: "pct", note: "溶於液體後冷凍庫結凍>24h，再移至冷藏庫(4°C)用濾紙慢速融化滴漏。" },
  { cat: "澄清技術", name: "自發性酵素澄清", material: "果膠酶 (Pectinex Ultra SPL)", ratio: "0.1%–0.2%", lo: 0.1, hi: 0.2, unit: "g", calcType: "pct", note: "常用於高果膠果汁（鳳梨、蘋果），常溫25~35°C靜置1-2小時。" },
  { cat: "澄清技術", name: "酵素加速沉澱", material: "膨潤土 (Bentonite)", ratio: "0.1%–0.3%", lo: 0.1, hi: 0.3, unit: "g", calcType: "pct", note: "需先用熱水調成漿狀，與果膠酶搭配使用，利用電荷吸引原理加速雜質沉澱。" },
  // 二、洗酒技術
  { cat: "洗酒技術", name: "牛奶洗 Milk Wash", material: "全脂鮮乳", ratio: "20%–25%", lo: 20, hi: 25, unit: "ml", calcType: "pct", note: "體積比（酒:奶 = 3:1~4:1）。必須「酒入奶」，酒液pH需<4.5使酪蛋白結塊，前段混濁需回濾。" },
  { cat: "洗酒技術", name: "風味油洗（動物脂）", material: "動物油脂（培根油／奶油）", ratio: "13%–16%", lo: 13, hi: 16, unit: "g", calcType: "pct", note: "每750ml烈酒加100g~120g。融化後與烈酒常溫浸泡數小時，移入冷凍庫至油脂固化後濾除。" },
  { cat: "洗酒技術", name: "風味油洗（植物油）", material: "植物油脂（椰子／芝麻油）", ratio: "8%–12%", lo: 8, hi: 12, unit: "g", calcType: "pct", note: "每750ml烈酒加60g~90g。植物油風味通常較飽和，用量可稍減。" },
  // 三、泡沫質地
  { cat: "泡沫質地", name: "槍發結構慕斯泡", material: "吉利丁 (Gelatin)", ratio: "0.5%–1.5%", lo: 0.5, hi: 1.5, unit: "g", calcType: "pct", note: "填入氣水槍使用，口感入口即化，但室溫過高時泡沫容易塌陷。" },
  { cat: "泡沫質地", name: "懸浮／增稠膠體", material: "三仙膠 (Xanthan Gum)", ratio: "0.1%–0.2%", lo: 0.1, hi: 0.2, unit: "g", calcType: "pct", note: "具強懸浮力與黏彈性。過量（>0.3%）會產生不適的鼻涕狀黏稠感。" },
  { cat: "泡沫質地", name: "輕盈空氣感泡泡", material: "大豆卵磷脂 (Lecithin)", ratio: "0.3%–0.6%", lo: 0.3, hi: 0.6, unit: "g", calcType: "pct", note: "不需氣水槍，直接用手持攪拌棒在液面攪打，撈取表面輕盈空氣泡。" },
  { cat: "泡沫質地", name: "無糖風味增稠", material: "羧甲基纖維素 (CMC)", ratio: "0.1%–0.3%", lo: 0.1, hi: 0.3, unit: "g", calcType: "pct", note: "在不增加甜度的前提下，修復並模擬澄清調酒流失的厚實酒體口感。" },
  // 四、晶球化
  { cat: "晶球化", name: "反向晶球（主體液）", material: "乳酸鈣 / 乳酸葡萄糖酸鈣", ratio: "1.0%–2.0%", lo: 1.0, hi: 2.0, unit: "g", calcType: "pct", note: "混入你想爆漿的酒液主體中（若酒液本身含高鈣如牛奶，則不需添加）。" },
  { cat: "晶球化", name: "反向晶球（固定浴）", material: "褐藻膠 / 藻膠酸鈉", ratio: "0.5%", lo: 0.5, hi: 0.5, unit: "g", calcType: "pct", note: "溶於純水中作為固定浴。極難溶解，打散後必須靜置12-24小時消泡，晶球表面才不會破洞。" },
  // 五、標準化
  { cat: "標準化", name: "超級檸檬汁", material: "檸檬酸 / 蘋果酸 / 水", ratio: "自訂公式", lo: 0, hi: 0, unit: "g", calcType: "lemon", note: "以果皮重為基準：檸檬酸 = 皮重×50%；蘋果酸 = 皮重×5%；純水 = 皮重×16.6倍。" },
  { cat: "標準化", name: "無色黃檸檬酸液", material: "綜合有機酸粉", ratio: "6.0% 總濃度", lo: 6.0, hi: 6.0, unit: "g", calcType: "acid_yellow", note: "5.4% 檸檬酸 + 0.6% 蘋果酸，溶解於94%純水中，模擬新鮮黃檸檬汁酸度。" },
  { cat: "標準化", name: "無色青檸檬酸液", material: "綜合有機酸粉", ratio: "6.0% 總濃度", lo: 6.0, hi: 6.0, unit: "g", calcType: "acid_green", note: "4.0% 檸檬酸 + 1.8% 蘋果酸 + 0.2% 琥珀酸，溶於94%水。琥珀酸為賦予青檸微苦鮮味的關鍵。" },
  { cat: "標準化", name: "風味尾韻鎖香劑", material: "β-環狀糊精", ratio: "0.5%–2.0%", lo: 0.5, hi: 2.0, unit: "g", calcType: "pct", note: "微型中空結構包裹揮發性香氣分子，接觸口腔唾液後才釋放，能拉長調酒尾韻。" },
  // 六、浸漬萃取
  { cat: "浸漬萃取", name: "茶葉常溫浸漬（烈酒）", material: "中式/西式乾燥茶葉", ratio: "1.0%–1.5%", lo: 1.0, hi: 1.5, unit: "g", calcType: "pct", note: "每750ml烈酒加7.5g~11g茶葉。常溫靜置12~24小時，定時搖晃，達風味交叉點即濾除。" },
  { cat: "浸漬萃取", name: "咖啡豆常溫浸漬", material: "烘焙咖啡豆（原豆）", ratio: "10%–12%", lo: 10, hi: 12, unit: "g", calcType: "pct", note: "每750ml烈酒加75g~90g原豆（不研磨）。常溫靜置24~48小時，萃取純淨咖啡香氣與油脂。" },
  { cat: "浸漬萃取", name: "舒肥低溫恆溫萃取", material: "新鮮草本 / 水果 / 香料", ratio: "10%–30%", lo: 10, hi: 30, unit: "g", calcType: "pct", note: "依食材風味強度調整（羅勒10%、鳳梨30%）。真空密封後以50~60°C舒肥機加熱1~2小時。" },
  { cat: "浸漬萃取", name: "氮氣急速壓力萃取", material: "新鮮多孔性植物（如薄荷）", ratio: "5%–10%", lo: 5, hi: 10, unit: "g", calcType: "pct", note: "放入奶油槍，導入1~2支N2O氣彈搖晃，靜置2-5分鐘後急速排氣。色澤極翠綠。" },
  { cat: "浸漬萃取", name: "超音波急速震盪", material: "堅果 / 木質香料 / 可可碎", ratio: "5%–15%", lo: 5, hi: 15, unit: "g", calcType: "pct", note: "與酒放入超音波清洗機震盪20~40分鐘。利用空化效應急速破壞細胞壁，高效萃取不加熱。" },
  { cat: "浸漬萃取", name: "香料烈酒萃取 Tincture", material: "乾燥強烈香料（丁香/肉桂）", ratio: "5%–10%", lo: 5, hi: 10, unit: "g", calcType: "pct", note: "使用高酒精濃度烈酒（96%酒精或高張力伏特加）浸泡1~2週，轉化為高濃度苦精滴劑。" },
];

const TECH_CATS = ["全部", ...Array.from(new Set(TECHS.map((t) => t.cat)))];
const PRESET_CATS = ["All", ...Array.from(new Set(PRESETS.map((r) => r.category)))];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mlToOz = (ml) => (ml * ML2OZ).toFixed(2);

const calcABV = (ings) => {
  const tv = ings.reduce((s, i) => s + i.amount, 0);
  if (!tv) return 0;
  const av = ings.reduce((s, i) => s + i.amount * (i.abv / 100), 0);
  return +((av / tv) * 100).toFixed(1);
};

const abvColor = (abv) =>
  abv < 10 ? "#4ade80" : abv < 20 ? "#facc15" : abv < 35 ? "#fb923c" : "#f87171";

let _nextId = 10;
const newId = () => ++_nextId;

// ─── Styles (JS objects) ──────────────────────────────────────────────────────

const S = {
  app: { display: "flex", flexDirection: "column", minHeight: "100svh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", maxWidth: 480, margin: "0 auto", position: "relative" },
  topbar: { background: "var(--surface)", borderBottom: "0.5px solid var(--border)", padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, flexShrink: 0 },
  logoText: { fontSize: 17, fontWeight: 600, color: "var(--text)", lineHeight: 1.1 },
  logoSub: { fontSize: 10, color: "var(--text-3)", letterSpacing: "1.5px" },
  scroll: { flex: 1, overflowY: "auto", padding: "14px 14px 90px" },
  bottomnav: { position: "sticky", bottom: 0, background: "var(--surface)", borderTop: "0.5px solid var(--border)", display: "flex", zIndex: 10 },
  navbtn: (active) => ({ flex: 1, padding: "10px 0 8px", border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? "var(--accent)" : "var(--text-3)", fontSize: 10, transition: "color .15s", fontFamily: "var(--font-body)" }),
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 },
  metricCard: { background: "var(--surface2)", borderRadius: "var(--r-md)", padding: "12px 14px" },
  metricLabel: { fontSize: 11, color: "var(--text-3)", marginBottom: 4 },
  metricVal: { fontSize: 22, fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-mono)" },
  metricSub: { fontSize: 11, color: "var(--text-3)", marginTop: 2 },
  abvBg: { height: 6, borderRadius: 99, background: "var(--surface2)", overflow: "hidden", margin: "8px 0 4px" },
  card: { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14, marginTop: 10 },
  scaleModeTabs: { display: "flex", marginBottom: 14, border: "0.5px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" },
  scaleModeTab: (active) => ({ flex: 1, padding: "8px 6px", border: "none", background: active ? "var(--accent)" : "none", color: active ? "#fff" : "var(--text-2)", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: "var(--font-body)", transition: "all .15s" }),
  scaleBigInput: { flex: 1, padding: "12px 14px", fontSize: 24, fontWeight: 600, fontFamily: "var(--font-mono)", border: "0.5px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface)", color: "var(--accent)", textAlign: "center", width: "100%", MozAppearance: "textfield" },
  scaleInputRow: { display: "flex", alignItems: "center", gap: 10 },
  scaleBtn: { width: 44, height: 52, border: "0.5px solid var(--border)", borderRadius: "var(--r-md)", background: "none", color: "var(--text)", fontSize: 22, cursor: "pointer", flexShrink: 0 },
  scaleHint: { fontSize: 11, color: "var(--text-3)", marginTop: 6, textAlign: "center" },
  scaleResult: { background: "var(--surface2)", borderRadius: "var(--r-md)", padding: "8px 12px", marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" },
  ingTable: { width: "100%", borderCollapse: "collapse", marginTop: 8 },
  ingTh: { fontSize: 10, color: "var(--text-3)", fontWeight: 400, padding: "0 3px 8px", textAlign: "left" },
  ingInput: (num) => ({ width: "100%", padding: "9px 8px", border: "0.5px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface)", color: "var(--text)", fontSize: 14, fontFamily: num ? "var(--font-mono)" : "var(--font-body)", textAlign: num ? "center" : "left", MozAppearance: num ? "textfield" : undefined }),
  scaledRow: { display: "flex", alignItems: "center", gap: 5, marginTop: 5, justifyContent: "center" },
  scaledMl: { fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)", color: "#1d4ed8", background: "#dbeafe", borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap" },
  scaledOz: { fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)", color: "#6d28d9", background: "#ede9fe", borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap" },
  scaledSep: { fontSize: 11, color: "var(--text-3)" },
  rmvBtn: { width: 36, height: 36, border: "0.5px solid var(--border)", borderRadius: "var(--r-md)", background: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  addBtn: { width: "100%", padding: 11, border: "1px dashed var(--border)", borderRadius: "var(--r-md)", background: "none", color: "var(--text-2)", fontSize: 13, cursor: "pointer", marginTop: 2 },
  saveWrap: { display: "flex", gap: 8, marginTop: 10 },
  saveInput: { flex: 1, padding: "10px 12px", border: "0.5px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface)", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-body)" },
  saveBtn: { padding: "10px 16px", borderRadius: "var(--r-md)", border: "none", background: "var(--accent)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, whiteSpace: "nowrap" },
  chipBar: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 },
  chip: (active) => ({ padding: "6px 14px", borderRadius: 99, border: "0.5px solid var(--border)", background: active ? "var(--accent)" : "var(--surface)", color: active ? "#fff" : "var(--text-2)", fontSize: 12, cursor: "pointer", transition: "all .15s" }),
  catScroll: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14, scrollbarWidth: "none" },
  catBtn: (active) => ({ padding: "7px 14px", borderRadius: 99, border: "0.5px solid var(--border)", background: active ? "var(--accent)" : "var(--surface)", color: active ? "#fff" : "var(--text-2)", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s", flexShrink: 0 }),
  recipeCard: { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14, marginBottom: 10 },
  recipeHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  recipeCat: { fontSize: 11, color: "var(--text-3)", marginBottom: 2 },
  recipeName: { fontSize: 16, fontWeight: 600, color: "var(--text)" },
  recipeAbv: { fontSize: 20, fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-mono)" },
  recipeTotal: { fontSize: 11, color: "var(--text-3)" },
  recipeIngs: { fontSize: 12, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 10 },
  loadBtn: { width: "100%", padding: 10, borderRadius: "var(--r-md)", border: "0.5px solid var(--border)", background: "none", color: "var(--text)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  rowBtns: { display: "flex", gap: 8, marginTop: 8 },
  iconBtn: (danger) => ({ padding: "10px 12px", borderRadius: "var(--r-md)", border: "0.5px solid var(--border)", background: "none", color: danger ? "#e24b4a" : "var(--text-2)", cursor: "pointer", fontSize: 13 }),
  techCard: { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14, marginBottom: 10 },
  techCardHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 },
  techName: { fontSize: 15, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 },
  techMaterial: { fontSize: 12, color: "var(--text-2)", marginTop: 2 },
  techRatioBadge: { background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "var(--font-mono)" },
  techNote: { fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, background: "var(--surface2)", borderRadius: "var(--r-md)", padding: "9px 11px", marginBottom: 10 },
  techCalcLabel: { fontSize: 11, color: "var(--text-3)", marginBottom: 6 },
  techCalcRow: { display: "flex", alignItems: "center", gap: 8 },
  techCalcInput: { flex: 1, padding: "9px 12px", border: "0.5px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface)", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-mono)", MozAppearance: "textfield" },
  techCalcUnit: { fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" },
  techResultRow: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" },
  techResultBox: { flex: 1, minWidth: 70, background: "var(--surface2)", borderRadius: "var(--r-md)", padding: "8px 10px", textAlign: "center" },
  techResultLbl: { fontSize: 10, color: "var(--text-3)", marginBottom: 3 },
  techResultVal: { fontSize: 15, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)" },
  emptyMsg: { textAlign: "center", padding: "48px 0", color: "var(--text-3)", fontSize: 14, lineHeight: 1.8 },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ABVBar({ abv }) {
  const pct = Math.min(abv, 60);
  return (
    <div style={S.abvBg}>
      <div style={{ height: "100%", width: `${(pct / 60) * 100}%`, background: abvColor(abv), borderRadius: 99, transition: "width .4s, background .4s" }} />
    </div>
  );
}

function RecipeCard({ recipe, onLoad, onDelete, onEdit }) {
  const abv = calcABV(recipe.ingredients);
  const total = recipe.ingredients.reduce((s, i) => s + i.amount, 0);
  return (
    <div style={S.recipeCard}>
      <div style={S.recipeHead}>
        <div>
          <div style={S.recipeCat}>{recipe.category}</div>
          <div style={S.recipeName}>{recipe.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={S.recipeAbv}>{abv}%</div>
          <div style={S.recipeTotal}>{total} ml / {mlToOz(total)} oz</div>
        </div>
      </div>
      <ABVBar abv={abv} />
      <div style={S.recipeIngs}>{recipe.ingredients.map((i) => `${i.name} ${i.amount}ml`).join(" · ")}</div>
      <button style={S.loadBtn} onClick={() => onLoad(recipe)}>載入計算 →</button>
      {(onEdit || onDelete) && (
        <div style={S.rowBtns}>
          {onEdit && <button style={S.iconBtn(false)} onClick={() => onEdit(recipe)}>✏️ 編輯</button>}
          {onDelete && <button style={S.iconBtn(true)} onClick={() => onDelete(recipe.id)}>🗑️ 刪除</button>}
        </div>
      )}
    </div>
  );
}

function TechCard({ tech }) {
  const [val, setVal] = useState(100);
  const v = parseFloat(val) || 0;

  let calcSection = null;
  if (tech.calcType === "pct") {
    const lo = (v * tech.lo / 100).toFixed(2);
    const hi = tech.lo !== tech.hi ? (v * tech.hi / 100).toFixed(2) : null;
    calcSection = (
      <>
        <div style={S.techCalcLabel}>液體量 Liquid</div>
        <div style={S.techCalcRow}>
          <input style={S.techCalcInput} type="number" min="0" step="1" value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" />
          <span style={S.techCalcUnit}>ml（g）</span>
        </div>
        <div style={S.techResultRow}>
          <div style={S.techResultBox}><div style={S.techResultLbl}>最低用量 Min</div><div style={S.techResultVal}>{lo} {tech.unit}</div></div>
          {hi && <div style={S.techResultBox}><div style={S.techResultLbl}>最高用量 Max</div><div style={S.techResultVal}>{hi} {tech.unit}</div></div>}
        </div>
      </>
    );
  } else if (tech.calcType === "lemon") {
    calcSection = (
      <>
        <div style={S.techCalcLabel}>果皮重 Peel weight</div>
        <div style={S.techCalcRow}>
          <input style={S.techCalcInput} type="number" min="0" step="1" value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" />
          <span style={S.techCalcUnit}>g</span>
        </div>
        <div style={S.techResultRow}>
          <div style={S.techResultBox}><div style={S.techResultLbl}>檸檬酸</div><div style={S.techResultVal}>{(v * 0.5).toFixed(1)} g</div></div>
          <div style={S.techResultBox}><div style={S.techResultLbl}>蘋果酸</div><div style={S.techResultVal}>{(v * 0.05).toFixed(1)} g</div></div>
          <div style={S.techResultBox}><div style={S.techResultLbl}>純水</div><div style={S.techResultVal}>{(v * 16.6).toFixed(0)} ml</div></div>
        </div>
      </>
    );
  } else if (tech.calcType === "acid_yellow") {
    calcSection = (
      <>
        <div style={S.techCalcLabel}>總量 Total</div>
        <div style={S.techCalcRow}>
          <input style={S.techCalcInput} type="number" min="0" step="1" value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" />
          <span style={S.techCalcUnit}>ml</span>
        </div>
        <div style={S.techResultRow}>
          <div style={S.techResultBox}><div style={S.techResultLbl}>檸檬酸 5.4%</div><div style={S.techResultVal}>{(v * 0.054).toFixed(2)} g</div></div>
          <div style={S.techResultBox}><div style={S.techResultLbl}>蘋果酸 0.6%</div><div style={S.techResultVal}>{(v * 0.006).toFixed(2)} g</div></div>
          <div style={S.techResultBox}><div style={S.techResultLbl}>純水 94%</div><div style={S.techResultVal}>{(v * 0.94).toFixed(0)} ml</div></div>
        </div>
      </>
    );
  } else if (tech.calcType === "acid_green") {
    calcSection = (
      <>
        <div style={S.techCalcLabel}>總量 Total</div>
        <div style={S.techCalcRow}>
          <input style={S.techCalcInput} type="number" min="0" step="1" value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" />
          <span style={S.techCalcUnit}>ml</span>
        </div>
        <div style={S.techResultRow}>
          <div style={S.techResultBox}><div style={S.techResultLbl}>檸檬酸 4.0%</div><div style={S.techResultVal}>{(v * 0.04).toFixed(2)} g</div></div>
          <div style={S.techResultBox}><div style={S.techResultLbl}>蘋果酸 1.8%</div><div style={S.techResultVal}>{(v * 0.018).toFixed(2)} g</div></div>
          <div style={S.techResultBox}><div style={S.techResultLbl}>琥珀酸 0.2%</div><div style={S.techResultVal}>{(v * 0.002).toFixed(2)} g</div></div>
          <div style={S.techResultBox}><div style={S.techResultLbl}>純水 94%</div><div style={S.techResultVal}>{(v * 0.94).toFixed(0)} ml</div></div>
        </div>
      </>
    );
  }

  return (
    <div style={S.techCard}>
      <div style={S.techCardHead}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>{tech.cat}</div>
          <div style={S.techName}>{tech.name}</div>
          <div style={S.techMaterial}>{tech.material}</div>
        </div>
        <div style={S.techRatioBadge}>{tech.ratio}</div>
      </div>
      <div style={S.techNote}>{tech.note}</div>
      {calcSection}
    </div>
  );
}

// ─── Tab: Calculator ──────────────────────────────────────────────────────────

function TabCalc({ onLoadRecipe }) {
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Gin", abv: 40, amount: 30 },
    { id: 2, name: "Campari", abv: 25, amount: 30 },
    { id: 3, name: "Sweet Vermouth", abv: 16, amount: 30 },
  ]);
  const [scaleMode, setScaleMode] = useState("cups"); // 'cups' | 'ml'
  const [cups, setCups] = useState(1);
  const [mlTarget, setMlTarget] = useState("");
  const [saveName, setSaveName] = useState("");
  const [editingId, setEditingId] = useState(null);

  // expose load from outside
  useEffect(() => {
    onLoadRecipe.current = (recipe) => {
      setIngredients(recipe.ingredients.map((i, idx) => ({ ...i, id: idx + 1 })));
      _nextId = recipe.ingredients.length + 1;
      setCups(1);
      setMlTarget("");
      setScaleMode("cups");
      setSaveName("");
      setEditingId(null);
    };
  }, []);

  const baseTotal = ingredients.reduce((s, i) => s + i.amount, 0);
  const scaleFactor = scaleMode === "cups"
    ? (parseFloat(cups) || 1)
    : (parseFloat(mlTarget) && baseTotal ? parseFloat(mlTarget) / baseTotal : 1);

  const scaledIngs = ingredients.map((i) => ({ ...i, amount: +(i.amount * scaleFactor).toFixed(2) }));
  const abv = calcABV(scaledIngs);
  const total = +scaledIngs.reduce((s, i) => s + i.amount, 0).toFixed(1);

  const updateIng = (id, field, val) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: val } : i)));
  const removeIng = (id) => setIngredients((prev) => prev.filter((i) => i.id !== id));
  const addIng = () => setIngredients((prev) => [...prev, { id: newId(), name: "", abv: 0, amount: 30 }]);

  const saveRecipe = () => {
    if (!saveName.trim()) return;
    const recipe = { id: editingId || Date.now(), name: saveName.trim(), category: "自訂", ingredients };
    const stored = JSON.parse(localStorage.getItem("cc_myrecipes") || "[]");
    const updated = editingId
      ? stored.map((r) => (r.id === editingId ? recipe : r))
      : [...stored, recipe];
    localStorage.setItem("cc_myrecipes", JSON.stringify(updated));
    setSaveName("");
    setEditingId(null);
    window.dispatchEvent(new Event("cc_recipes_updated"));
  };

  return (
    <>
      {/* Metrics */}
      <div style={S.row2}>
        <div style={S.metricCard}>
          <div style={S.metricLabel}>ABV 酒精濃度</div>
          <div style={S.metricVal}>{abv}%</div>
          <div style={S.metricSub}>alcohol by volume</div>
        </div>
        <div style={S.metricCard}>
          <div style={S.metricLabel}>Total 總量</div>
          <div style={S.metricVal}>{total} ml</div>
          <div style={S.metricSub}>{mlToOz(total)} oz</div>
        </div>
      </div>
      <ABVBar abv={abv} />

      {/* Scale */}
      <div style={S.card}>
        <div style={S.scaleModeTabs}>
          <button style={S.scaleModeTab(scaleMode === "cups")} onClick={() => setScaleMode("cups")}>杯數 Servings</button>
          <button style={S.scaleModeTab(scaleMode === "ml")} onClick={() => setScaleMode("ml")}>目標總量 ml</button>
        </div>
        {scaleMode === "cups" ? (
          <>
            <div style={S.scaleInputRow}>
              <button style={S.scaleBtn} onClick={() => setCups((c) => Math.max(0.5, +(parseFloat(c) - 0.5).toFixed(1)))}>−</button>
              <input style={S.scaleBigInput} type="number" value={cups} min="0.5" step="0.5" onChange={(e) => setCups(e.target.value)} inputMode="decimal" />
              <button style={S.scaleBtn} onClick={() => setCups((c) => +(parseFloat(c || 1) + 0.5).toFixed(1))}>+</button>
            </div>
            <div style={S.scaleHint}>杯 serving(s)</div>
            <div style={S.scaleResult}>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>實際倍率 Scale factor</span>
              <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text)" }}>×{(parseFloat(cups) || 1).toFixed(1)}</span>
            </div>
          </>
        ) : (
          <>
            <div style={S.scaleInputRow}>
              <input style={S.scaleBigInput} type="number" value={mlTarget} placeholder="—" min="1" step="10" onChange={(e) => setMlTarget(e.target.value)} inputMode="decimal" />
              <span style={S.techCalcUnit}>ml</span>
            </div>
            <div style={S.scaleHint}>輸入目標總量，自動換算各食材比例</div>
            <div style={S.scaleResult}>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>實際倍率 Scale factor</span>
              <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                {parseFloat(mlTarget) && baseTotal ? `×${(parseFloat(mlTarget) / baseTotal).toFixed(2)}` : "—"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Ingredients */}
      <div style={S.card}>
        <table style={S.ingTable}>
          <thead>
            <tr>
              <th style={S.ingTh}>食材 Ingredient</th>
              <th style={{ ...S.ingTh, textAlign: "center" }}>ABV %</th>
              <th style={{ ...S.ingTh, textAlign: "center" }}>ml／份　→　實際量</th>
              <th style={{ ...S.ingTh, width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => {
              const scaledAmt = +(ing.amount * scaleFactor).toFixed(2);
              return (
                <tr key={ing.id}>
                  <td style={{ padding: "0 3px 10px", verticalAlign: "top" }}>
                    <input style={S.ingInput(false)} type="text" value={ing.name} placeholder="食材名" onChange={(e) => updateIng(ing.id, "name", e.target.value)} />
                  </td>
                  <td style={{ padding: "0 3px 10px", verticalAlign: "top" }}>
                    <input style={S.ingInput(true)} type="number" value={ing.abv} min="0" max="100" step="0.1" onChange={(e) => updateIng(ing.id, "abv", parseFloat(e.target.value) || 0)} inputMode="decimal" />
                  </td>
                  <td style={{ padding: "0 3px 10px", verticalAlign: "top" }}>
                    <input style={S.ingInput(true)} type="number" value={ing.amount} min="0" step="any" onChange={(e) => updateIng(ing.id, "amount", parseFloat(e.target.value) || 0)} inputMode="decimal" />
                    <div style={S.scaledRow}>
                      <span style={S.scaledMl}>{scaledAmt} ml</span>
                      <span style={S.scaledSep}>/</span>
                      <span style={S.scaledOz}>{mlToOz(scaledAmt)} oz</span>
                    </div>
                  </td>
                  <td style={{ padding: "0 0 10px", width: 36, verticalAlign: "top" }}>
                    <button style={S.rmvBtn} onClick={() => removeIng(ing.id)}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button style={S.addBtn} onClick={addIng}>+ 加食材 Add ingredient</button>
      </div>

      {/* Save */}
      <div style={S.saveWrap}>
        <input style={S.saveInput} value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="酒譜名稱 Recipe name…" />
        <button style={S.saveBtn} onClick={saveRecipe}>💾 儲存</button>
      </div>
    </>
  );
}

// ─── Tab: Library ─────────────────────────────────────────────────────────────

function TabLib({ onLoad }) {
  const [filterCat, setFilterCat] = useState("All");
  const filtered = PRESETS.filter((r) => filterCat === "All" || r.category === filterCat);
  return (
    <>
      <div style={S.chipBar}>
        {PRESET_CATS.map((c) => (
          <button key={c} style={S.chip(c === filterCat)} onClick={() => setFilterCat(c)}>{c}</button>
        ))}
      </div>
      {filtered.map((r) => <RecipeCard key={r.id} recipe={r} onLoad={onLoad} />)}
    </>
  );
}

// ─── Tab: Special Techniques ──────────────────────────────────────────────────

function TabSpecial() {
  const [filterCat, setFilterCat] = useState("全部");
  const filtered = TECHS.filter((t) => filterCat === "全部" || t.cat === filterCat);
  return (
    <>
      <div style={S.catScroll}>
        {TECH_CATS.map((c) => (
          <button key={c} style={S.catBtn(c === filterCat)} onClick={() => setFilterCat(c)}>{c}</button>
        ))}
      </div>
      {filtered.map((tech, i) => <TechCard key={i} tech={tech} />)}
    </>
  );
}

// ─── Tab: My Recipes ──────────────────────────────────────────────────────────

function TabMine({ onLoad }) {
  const [recipes, setRecipes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cc_myrecipes") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    const handler = () => {
      try { setRecipes(JSON.parse(localStorage.getItem("cc_myrecipes") || "[]")); } catch { setRecipes([]); }
    };
    window.addEventListener("cc_recipes_updated", handler);
    return () => window.removeEventListener("cc_recipes_updated", handler);
  }, []);

  const deleteRecipe = (id) => {
    const updated = recipes.filter((r) => r.id !== id);
    setRecipes(updated);
    localStorage.setItem("cc_myrecipes", JSON.stringify(updated));
  };

  if (!recipes.length) return <div style={S.emptyMsg}>還沒有儲存的酒譜<br />在計算機頁面儲存你的創作！</div>;

  return (
    <>
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} onLoad={onLoad} onDelete={deleteRecipe} />
      ))}
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "calc", label: "計算機", icon: "⚗️" },
  { id: "lib", label: "食譜庫", icon: "📖" },
  { id: "special", label: "特殊技術", icon: "🔬" },
  { id: "mine", label: "我的酒譜", icon: "💾" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("calc");
  const loadRecipeRef = useCallback(() => {}, []);
  const loadRecipeFn = { current: null };

  const handleLoad = useCallback((recipe) => {
    setActiveTab("calc");
    setTimeout(() => {
      if (loadRecipeFn.current) loadRecipeFn.current(recipe);
    }, 50);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        :root {
          --font-body: 'DM Sans', sans-serif;
          --font-mono: 'DM Mono', monospace;
          --accent: #e8643c;
          --r-md: 8px;
          --r-lg: 14px;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #111110;
            --surface: #1c1b1a;
            --surface2: #242322;
            --border: #2e2d2b;
            --text: #f0ede8;
            --text-2: #a09890;
            --text-3: #6a6460;
          }
        }
        @media (prefers-color-scheme: light) {
          :root {
            --bg: #f5f2ee;
            --surface: #ffffff;
            --surface2: #edeae5;
            --border: #dedad3;
            --text: #1a1917;
            --text-2: #5a5450;
            --text-3: #9a9490;
          }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
        button:active { opacity: 0.8; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
      `}</style>

      <div style={S.app}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={S.logoIcon}>🍹</div>
          <div>
            <div style={S.logoText}>CocktailCalc</div>
            <div style={S.logoSub}>BARTENDER'S TOOLKIT</div>
          </div>
        </div>

        {/* Main content */}
        <div style={S.scroll}>
          {activeTab === "calc" && <TabCalc onLoadRecipe={loadRecipeFn} />}
          {activeTab === "lib" && <TabLib onLoad={handleLoad} />}
          {activeTab === "special" && <TabSpecial />}
          {activeTab === "mine" && <TabMine onLoad={handleLoad} />}
        </div>

        {/* Bottom nav */}
        <nav style={S.bottomnav}>
          {TABS.map((t) => (
            <button key={t.id} style={S.navbtn(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
