import { useState, useEffect, useRef, useCallback } from "react";
   
// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const ML2OZ = 0.033814;

const PRESETS = [
  { id: "negroni",        category: "IBA Classic", name: "Negroni",        ingredients: [{ name: "Gin", abv: 40, amount: 30 }, { name: "Campari", abv: 25, amount: 30 }, { name: "Sweet Vermouth", abv: 16, amount: 30 }] },
  { id: "margarita",      category: "IBA Classic", name: "Margarita",      ingredients: [{ name: "Tequila", abv: 40, amount: 50 }, { name: "Triple Sec", abv: 40, amount: 20 }, { name: "Lime Juice", abv: 0, amount: 15 }] },
  { id: "daiquiri",       category: "IBA Classic", name: "Daiquiri",       ingredients: [{ name: "White Rum", abv: 40, amount: 45 }, { name: "Simple Syrup", abv: 0, amount: 15 }, { name: "Lime Juice", abv: 0, amount: 25 }] },
  { id: "old-fashioned",  category: "IBA Classic", name: "Old Fashioned",  ingredients: [{ name: "Bourbon", abv: 45, amount: 60 }, { name: "Simple Syrup", abv: 0, amount: 5 }, { name: "Angostura Bitters", abv: 45, amount: 2 }] },
  { id: "cosmopolitan",   category: "IBA Classic", name: "Cosmopolitan",   ingredients: [{ name: "Vodka", abv: 40, amount: 40 }, { name: "Triple Sec", abv: 40, amount: 15 }, { name: "Cranberry Juice", abv: 0, amount: 30 }, { name: "Lime Juice", abv: 0, amount: 15 }] },
  { id: "nitro-martini",  category: "分子調酒",    name: "Nitro Martini",  ingredients: [{ name: "Vodka", abv: 40, amount: 60 }, { name: "Dry Vermouth", abv: 18, amount: 15 }] },
  { id: "gin-sphere",     category: "分子調酒",    name: "Gin Sphere Fizz",ingredients: [{ name: "Gin", abv: 40, amount: 45 }, { name: "Elderflower Tonic", abv: 0, amount: 90 }, { name: "Lemon Juice", abv: 0, amount: 15 }] },
  { id: "virgin-mojito",  category: "Mocktail",    name: "Virgin Mojito",  ingredients: [{ name: "Lime Juice", abv: 0, amount: 25 }, { name: "Simple Syrup", abv: 0, amount: 20 }, { name: "Soda Water", abv: 0, amount: 120 }, { name: "Mint Leaves", abv: 0, amount: 10 }] },
  { id: "shirley-temple", category: "Mocktail",    name: "Shirley Temple", ingredients: [{ name: "Ginger Ale", abv: 0, amount: 120 }, { name: "Grenadine", abv: 0, amount: 15 }, { name: "Orange Juice", abv: 0, amount: 30 }] },
];

const TECHS = [
  { cat: "澄清技術", name: "瓊脂熱澄清 Agar",        material: "瓊脂粉 (Agar-Agar)",              ratio: "0.04%–0.1%", lo: 0.04, hi: 0.1,  unit: "g",  calcType: "pct",        note: "1/3液體與瓊脂加熱至85°C以上激活，再混回剩餘常溫液體靜置凝固。" },
  { cat: "澄清技術", name: "明膠冷凍澄清",            material: "吉利丁粉 / 吉利丁片",              ratio: "0.5%–1.0%",  lo: 0.5,  hi: 1.0,  unit: "g",  calcType: "pct",        note: "溶於液體後冷凍庫結凍>24h，再移至冷藏庫(4°C)用濾紙慢速融化滴漏。" },
  { cat: "澄清技術", name: "自發性酵素澄清",          material: "果膠酶 (Pectinex Ultra SPL)",      ratio: "0.1%–0.2%",  lo: 0.1,  hi: 0.2,  unit: "g",  calcType: "pct",        note: "常用於高果膠果汁（鳳梨、蘋果），常溫25~35°C靜置1-2小時。" },
  { cat: "澄清技術", name: "酵素加速沉澱",            material: "膨潤土 (Bentonite)",               ratio: "0.1%–0.3%",  lo: 0.1,  hi: 0.3,  unit: "g",  calcType: "pct",        note: "需先用熱水調成漿狀，與果膠酶搭配使用，利用電荷吸引原理加速雜質沉澱。" },
  { cat: "洗酒技術", name: "牛奶洗 Milk Wash",        material: "全脂鮮乳",                         ratio: "20%–25%",    lo: 20,   hi: 25,   unit: "ml", calcType: "pct",        note: "體積比（酒:奶 = 3:1~4:1）。必須「酒入奶」，酒液pH需<4.5使酪蛋白結塊，前段混濁需回濾。" },
  { cat: "洗酒技術", name: "風味油洗（動物脂）",      material: "動物油脂（培根油／奶油）",          ratio: "13%–16%",    lo: 13,   hi: 16,   unit: "g",  calcType: "pct",        note: "每750ml烈酒加100g~120g。融化後與烈酒常溫浸泡數小時，移入冷凍庫至油脂固化後濾除。" },
  { cat: "洗酒技術", name: "風味油洗（植物油）",      material: "植物油脂（椰子／芝麻油）",          ratio: "8%–12%",     lo: 8,    hi: 12,   unit: "g",  calcType: "pct",        note: "每750ml烈酒加60g~90g。植物油風味通常較飽和，用量可稍減。" },
  { cat: "泡沫質地", name: "槍發結構慕斯泡",          material: "吉利丁 (Gelatin)",                 ratio: "0.5%–1.5%",  lo: 0.5,  hi: 1.5,  unit: "g",  calcType: "pct",        note: "填入氣水槍使用，口感入口即化，但室溫過高時泡沫容易塌陷。" },
  { cat: "泡沫質地", name: "懸浮／增稠膠體",          material: "三仙膠 (Xanthan Gum)",             ratio: "0.1%–0.2%",  lo: 0.1,  hi: 0.2,  unit: "g",  calcType: "pct",        note: "具強懸浮力與黏彈性。過量（>0.3%）會產生不適的鼻涕狀黏稠感。" },
  { cat: "泡沫質地", name: "輕盈空氣感泡泡",          material: "大豆卵磷脂 (Lecithin)",            ratio: "0.3%–0.6%",  lo: 0.3,  hi: 0.6,  unit: "g",  calcType: "pct",        note: "不需氣水槍，直接用手持攪拌棒在液面攪打，撈取表面輕盈空氣泡。" },
  { cat: "泡沫質地", name: "無糖風味增稠",            material: "羧甲基纖維素 (CMC)",               ratio: "0.1%–0.3%",  lo: 0.1,  hi: 0.3,  unit: "g",  calcType: "pct",        note: "在不增加甜度的前提下，修復並模擬澄清調酒流失的厚實酒體口感。" },
  { cat: "晶球化",   name: "反向晶球（主體液）",      material: "乳酸鈣 / 乳酸葡萄糖酸鈣",          ratio: "1.0%–2.0%",  lo: 1.0,  hi: 2.0,  unit: "g",  calcType: "pct",        note: "混入你想爆漿的酒液主體中（若酒液本身含高鈣如牛奶，則不需添加）。" },
  { cat: "晶球化",   name: "反向晶球（固定浴）",      material: "褐藻膠 / 藻膠酸鈉",                ratio: "0.5%",        lo: 0.5,  hi: 0.5,  unit: "g",  calcType: "pct",        note: "溶於純水中作為固定浴。極難溶解，打散後必須靜置12-24小時消泡，晶球表面才不會破洞。" },
  { cat: "標準化",   name: "超級檸檬汁",              material: "檸檬酸 / 蘋果酸 / 水",             ratio: "自訂公式",    lo: 0,    hi: 0,    unit: "g",  calcType: "lemon",      note: "以果皮重為基準：檸檬酸 = 皮重×50%；蘋果酸 = 皮重×5%；純水 = 皮重×16.6倍。" },
  { cat: "標準化",   name: "無色黃檸檬酸液",          material: "綜合有機酸粉",                     ratio: "6.0% 總濃度", lo: 6.0,  hi: 6.0,  unit: "g",  calcType: "acid_yellow",note: "5.4% 檸檬酸 + 0.6% 蘋果酸，溶解於94%純水中，模擬新鮮黃檸檬汁酸度。" },
  { cat: "標準化",   name: "無色青檸檬酸液",          material: "綜合有機酸粉",                     ratio: "6.0% 總濃度", lo: 6.0,  hi: 6.0,  unit: "g",  calcType: "acid_green", note: "4.0% 檸檬酸 + 1.8% 蘋果酸 + 0.2% 琥珀酸，溶於94%水。琥珀酸為賦予青檸微苦鮮味的關鍵。" },
  { cat: "標準化",   name: "風味尾韻鎖香劑",          material: "β-環狀糊精",                       ratio: "0.5%–2.0%",  lo: 0.5,  hi: 2.0,  unit: "g",  calcType: "pct",        note: "微型中空結構包裹揮發性香氣分子，接觸口腔唾液後才釋放，能拉長調酒尾韻。" },
  { cat: "浸漬萃取", name: "茶葉常溫浸漬（烈酒）",    material: "中式/西式乾燥茶葉",                ratio: "1.0%–1.5%",  lo: 1.0,  hi: 1.5,  unit: "g",  calcType: "pct",        note: "每750ml烈酒加7.5g~11g茶葉。常溫靜置12~24小時，定時搖晃，達風味交叉點即濾除。" },
  { cat: "浸漬萃取", name: "咖啡豆常溫浸漬",          material: "烘焙咖啡豆（原豆）",                ratio: "10%–12%",    lo: 10,   hi: 12,   unit: "g",  calcType: "pct",        note: "每750ml烈酒加75g~90g原豆（不研磨）。常溫靜置24~48小時，萃取純淨咖啡香氣與油脂。" },
  { cat: "浸漬萃取", name: "舒肥低溫恆溫萃取",        material: "新鮮草本 / 水果 / 香料",            ratio: "10%–30%",    lo: 10,   hi: 30,   unit: "g",  calcType: "pct",        note: "依食材風味強度調整（羅勒10%、鳳梨30%）。真空密封後以50~60°C舒肥機加熱1~2小時。" },
  { cat: "浸漬萃取", name: "氮氣急速壓力萃取",        material: "新鮮多孔性植物（如薄荷）",          ratio: "5%–10%",     lo: 5,    hi: 10,   unit: "g",  calcType: "pct",        note: "放入奶油槍，導入1~2支N2O氣彈搖晃，靜置2-5分鐘後急速排氣。色澤極翠綠。" },
  { cat: "浸漬萃取", name: "超音波急速震盪",          material: "堅果 / 木質香料 / 可可碎",          ratio: "5%–15%",     lo: 5,    hi: 15,   unit: "g",  calcType: "pct",        note: "與酒放入超音波清洗機震盪20~40分鐘。利用空化效應急速破壞細胞壁，高效萃取不加熱。" },
  { cat: "浸漬萃取", name: "香料烈酒萃取 Tincture",   material: "乾燥強烈香料（丁香/肉桂）",         ratio: "5%–10%",     lo: 5,    hi: 10,   unit: "g",  calcType: "pct",        note: "使用高酒精濃度烈酒（96%酒精或高張力伏特加）浸泡1~2週，轉化為高濃度苦精滴劑。" },
];

const TECH_CATS   = ["全部", ...Array.from(new Set(TECHS.map(t => t.cat)))];
const PRESET_CATS = ["All",  ...Array.from(new Set(PRESETS.map(r => r.category)))];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const mlToOz  = ml  => (ml * ML2OZ).toFixed(2);
const calcABV = ings => {
  const tv = ings.reduce((s, i) => s + i.amount, 0);
  if (!tv) return 0;
  return +((ings.reduce((s, i) => s + i.amount * (i.abv / 100), 0) / tv) * 100).toFixed(1);
};
const abvColor = abv => abv < 10 ? "#4ade80" : abv < 20 ? "#facc15" : abv < 35 ? "#fb923c" : "#f87171";

let _nextId = 20;
const newId = () => ++_nextId;

const loadStored = () => {
  try { return JSON.parse(localStorage.getItem("cc_myrecipes") || "[]"); } catch { return []; }
};

// ═══════════════════════════════════════════════════════════════
// ABV BAR
// ═══════════════════════════════════════════════════════════════

function ABVBar({ abv }) {
  const pct = Math.min(abv, 60);
  return (
    <div className="h-1 rounded-full bg-white/10 overflow-hidden my-1.5">
      <div className="h-full rounded-full transition-all duration-500"
           style={{ width: `${(pct / 60) * 100}%`, background: abvColor(abv) }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RECIPE CARD
// ═══════════════════════════════════════════════════════════════

function RecipeCard({ recipe, onLoad, onDelete, onEdit }) {
  const abv   = calcABV(recipe.ingredients);
  const total = recipe.ingredients.reduce((s, i) => s + i.amount, 0);
  return (
    <div className="bg-zinc-800/60 border border-white/8 rounded-2xl p-3.5 mb-2.5">
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <div className="text-[10px] text-zinc-500 mb-0.5">{recipe.category}</div>
          <div className="text-sm font-semibold text-white">{recipe.name}</div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="text-lg font-bold text-amber-400 font-mono leading-none">{abv}%</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">{total}ml / {mlToOz(total)}oz</div>
        </div>
      </div>
      <ABVBar abv={abv} />
      <div className="text-[11px] text-zinc-500 leading-relaxed mb-2.5 mt-1">
        {recipe.ingredients.map(i => `${i.name} ${i.amount}ml`).join("  ·  ")}
      </div>
      <button onClick={() => onLoad(recipe)}
        className="w-full py-2 rounded-xl border border-white/10 text-xs text-white bg-white/5 active:bg-white/15 transition-colors">
        載入計算 →
      </button>
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-1.5">
          {onEdit   && <button onClick={() => onEdit(recipe)}
            className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-zinc-300 bg-white/5 active:bg-white/10">編輯</button>}
          {onDelete && <button onClick={() => onDelete(recipe.id)}
            className="flex-1 py-2 rounded-xl border border-red-500/30 text-xs text-red-400 bg-red-500/5 active:bg-red-500/10">刪除</button>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TECH CARD
// ═══════════════════════════════════════════════════════════════

function TechCard({ tech }) {
  const [val, setVal] = useState("100");
  const v = parseFloat(val) || 0;

  const ResultBox = ({ label, value }) => (
    <div className="flex-1 min-w-14 bg-zinc-900/60 rounded-xl p-2 text-center">
      <div className="text-[9px] text-zinc-500 mb-0.5">{label}</div>
      <div className="text-sm font-bold font-mono text-amber-400">{value}</div>
    </div>
  );

  const inputCls = "flex-1 h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm text-center focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40";

  let calcSection;
  if (tech.calcType === "pct") {
    const lo = (v * tech.lo / 100).toFixed(2);
    const hi = tech.lo !== tech.hi ? (v * tech.hi / 100).toFixed(2) : null;
    calcSection = (
      <>
        <div className="flex items-center gap-2 mb-2">
          <input type="number" inputMode="decimal" min="0" step="1" value={val}
            onChange={e => setVal(e.target.value)} className={inputCls} />
          <span className="text-xs text-zinc-500 whitespace-nowrap">ml / g</span>
        </div>
        <div className="flex gap-1.5">
          <ResultBox label="最低用量" value={`${lo} ${tech.unit}`} />
          {hi && <ResultBox label="最高用量" value={`${hi} ${tech.unit}`} />}
        </div>
      </>
    );
  } else if (tech.calcType === "lemon") {
    calcSection = (
      <>
        <div className="flex items-center gap-2 mb-2">
          <input type="number" inputMode="decimal" min="0" step="1" value={val}
            onChange={e => setVal(e.target.value)} className={inputCls} />
          <span className="text-xs text-zinc-500">g 果皮重</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <ResultBox label="檸檬酸" value={`${(v*0.5).toFixed(1)}g`} />
          <ResultBox label="蘋果酸" value={`${(v*0.05).toFixed(1)}g`} />
          <ResultBox label="純水"   value={`${(v*16.6).toFixed(0)}ml`} />
        </div>
      </>
    );
  } else if (tech.calcType === "acid_yellow") {
    calcSection = (
      <>
        <div className="flex items-center gap-2 mb-2">
          <input type="number" inputMode="decimal" min="0" step="1" value={val}
            onChange={e => setVal(e.target.value)} className={inputCls} />
          <span className="text-xs text-zinc-500">ml 總量</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <ResultBox label="檸檬酸 5.4%" value={`${(v*0.054).toFixed(2)}g`} />
          <ResultBox label="蘋果酸 0.6%" value={`${(v*0.006).toFixed(2)}g`} />
          <ResultBox label="純水 94%"    value={`${(v*0.94).toFixed(0)}ml`} />
        </div>
      </>
    );
  } else if (tech.calcType === "acid_green") {
    calcSection = (
      <>
        <div className="flex items-center gap-2 mb-2">
          <input type="number" inputMode="decimal" min="0" step="1" value={val}
            onChange={e => setVal(e.target.value)} className={inputCls} />
          <span className="text-xs text-zinc-500">ml 總量</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <ResultBox label="檸檬酸 4.0%"  value={`${(v*0.04).toFixed(2)}g`} />
          <ResultBox label="蘋果酸 1.8%"  value={`${(v*0.018).toFixed(2)}g`} />
          <ResultBox label="琥珀酸 0.2%"  value={`${(v*0.002).toFixed(2)}g`} />
          <ResultBox label="純水 94%"     value={`${(v*0.94).toFixed(0)}ml`} />
        </div>
      </>
    );
  }

  return (
    <div className="bg-zinc-800/60 border border-white/8 rounded-2xl p-3.5 mb-2.5">
      <div className="flex justify-between items-start gap-2 mb-2">
        <div>
          <div className="text-[9px] text-zinc-500 mb-0.5">{tech.cat}</div>
          <div className="text-sm font-semibold text-white leading-snug">{tech.name}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">{tech.material}</div>
        </div>
        <div className="shrink-0 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-bold font-mono px-2 py-1 rounded-lg whitespace-nowrap">
          {tech.ratio}
        </div>
      </div>
      <div className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-900/40 rounded-xl px-2.5 py-2 mb-2">
        {tech.note}
      </div>
      {calcSection}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: CALCULATOR
// ═══════════════════════════════════════════════════════════════

function TabCalc({ loadFn }) {
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Gin",            abv: 40, amount: 30 },
    { id: 2, name: "Campari",        abv: 25, amount: 30 },
    { id: 3, name: "Sweet Vermouth", abv: 16, amount: 30 },
  ]);
  const [scaleMode,  setScaleMode]  = useState(() => localStorage.getItem("cc_scaleMode") || "cups");
  const [cups,       setCups]       = useState("1");
  const [mlTarget,   setMlTarget]   = useState("");
  const [saveName,   setSaveName]   = useState("");
  const [editingId,  setEditingId]  = useState(null);
  const [waterPct,   setWaterPct]   = useState(null);  // null = collapsed
  const [scaleOpen,  setScaleOpen]  = useState(false); // collapsed by default

  // Persist scale mode
  useEffect(() => { localStorage.setItem("cc_scaleMode", scaleMode); }, [scaleMode]);

  // Expose load handler — fixed ref pattern
  useEffect(() => {
    loadFn.current = recipe => {
      setIngredients(recipe.ingredients.map((i, idx) => ({ ...i, id: idx + 1 })));
      _nextId = recipe.ingredients.length + 10;
      setCups("1");
      setMlTarget("");
      setSaveName("");
      setEditingId(null);
      setWaterPct(null);
      setScaleOpen(false);
    };
  });

  const baseTotal   = ingredients.reduce((s, i) => s + i.amount, 0);
  const scaleFactor = scaleMode === "cups"
    ? (parseFloat(cups) || 1)
    : (parseFloat(mlTarget) && baseTotal ? parseFloat(mlTarget) / baseTotal : 1);

  const scaledIngs = ingredients.map(i => ({ ...i, amount: +(i.amount * scaleFactor).toFixed(2) }));
  const abv        = calcABV(scaledIngs);
  const total      = +scaledIngs.reduce((s, i) => s + i.amount, 0).toFixed(1);

  // Water suggestion
  const waterSuggestion = waterPct !== null ? {
    lo: +(total * 0.10).toFixed(1),
    hi: +(total * 0.15).toFixed(1),
    chosen: +(total * (waterPct / 100)).toFixed(1),
  } : null;

  const updateIng = (id, field, val) =>
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  const removeIng = id =>
    setIngredients(prev => prev.filter(i => i.id !== id));
  const addIng = () =>
    setIngredients(prev => [...prev, { id: newId(), name: "", abv: 0, amount: 30 }]);

  const saveRecipe = () => {
    if (!saveName.trim()) return;
    const recipe  = { id: editingId || Date.now(), name: saveName.trim(), category: "自訂", ingredients };
    const stored  = loadStored();
    const updated = editingId ? stored.map(r => r.id === editingId ? recipe : r) : [...stored, recipe];
    localStorage.setItem("cc_myrecipes", JSON.stringify(updated));
    setSaveName(""); setEditingId(null);
    window.dispatchEvent(new Event("cc_recipes_updated"));
  };

  const ingInputCls = "w-full h-10 px-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-sm text-center focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all";
  const ingNameCls  = "w-full h-10 px-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all";

  return (
    <div className="flex flex-col gap-2 pb-2">

      {/* ── Metrics row (compact, pure display) ── */}
      <div className="flex gap-2">
        <div className="flex-1 bg-zinc-800/80 rounded-xl px-3 py-2 flex items-baseline gap-1.5">
          <span className="text-[10px] text-zinc-500">ABV</span>
          <span className="text-3xl font-bold text-white font-mono leading-none">{abv}</span>
          <span className="text-base text-zinc-400">%</span>
        </div>
        <div className="flex-1 bg-zinc-800/80 rounded-xl px-3 py-2 flex items-baseline gap-1.5">
          <span className="text-[10px] text-zinc-500">Total</span>
          <span className="text-3xl font-bold text-white font-mono leading-none">{total}</span>
          <span className="text-base text-zinc-400">ml</span>
          <span className="text-xs text-zinc-500 ml-0.5">{mlToOz(total)}oz</span>
        </div>
      </div>
      <ABVBar abv={abv} />

      {/* ── Scale mode (collapsible, same pattern as water) ── */}
      <div className="bg-zinc-800/60 border border-white/8 rounded-xl px-3 py-2">
        {/* Header row — always visible */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">放大縮小</span>
            {/* Summary when collapsed */}
            {!scaleOpen && (
              <span className="text-xs font-mono text-amber-400">
                {scaleMode === "cups"
                  ? `×${(parseFloat(cups)||1).toFixed(1)}  ·  ${(parseFloat(cups)||1)} 杯`
                  : parseFloat(mlTarget) && baseTotal
                    ? `×${(parseFloat(mlTarget)/baseTotal).toFixed(2)}  ·  ${mlTarget} ml`
                    : "×1.0"}
              </span>
            )}
          </div>
          <button
            onClick={() => setScaleOpen(o => !o)}
            className="text-xs text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg active:bg-amber-500/10 min-w-[48px] text-center">
            {scaleOpen ? "收起" : "調整"}
          </button>
        </div>

        {/* Expandable body */}
        {scaleOpen && (
          <div className="mt-2.5">
            {/* Mode toggle */}
            <div className="flex rounded-lg overflow-hidden border border-zinc-700 mb-2.5">
              <button onClick={() => setScaleMode("cups")}
                className={`flex-1 py-1.5 text-xs font-medium transition-all ${scaleMode === "cups" ? "bg-amber-500 text-black" : "text-zinc-400 active:bg-white/5"}`}>
                杯數
              </button>
              <button onClick={() => setScaleMode("ml")}
                className={`flex-1 py-1.5 text-xs font-medium transition-all ${scaleMode === "ml" ? "bg-amber-500 text-black" : "text-zinc-400 active:bg-white/5"}`}>
                目標 ml
              </button>
            </div>

            {/* Cups */}
            <div className={`flex items-center gap-2 ${scaleMode !== "cups" ? "opacity-35 pointer-events-none" : ""}`}>
              <button disabled={scaleMode !== "cups"}
                onClick={() => setCups(c => String(Math.max(0.5, +(parseFloat(c) - 0.5).toFixed(1))))}
                className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-lg active:bg-zinc-700 disabled:cursor-not-allowed shrink-0">−</button>
              <input disabled={scaleMode !== "cups"}
                type="number" inputMode="decimal" min="0.5" step="0.5" value={cups}
                onChange={e => setCups(e.target.value)}
                className="flex-1 h-10 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400 font-mono text-xl font-bold text-center focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 disabled:cursor-not-allowed" />
              <button disabled={scaleMode !== "cups"}
                onClick={() => setCups(c => String(+(parseFloat(c || 1) + 0.5).toFixed(1)))}
                className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-lg active:bg-zinc-700 disabled:cursor-not-allowed shrink-0">+</button>
              <span className="text-xs text-zinc-500 whitespace-nowrap">杯</span>
            </div>

            {/* ml target */}
            <div className={`flex items-center gap-2 mt-2 ${scaleMode !== "ml" ? "opacity-35 pointer-events-none" : ""}`}>
              <input disabled={scaleMode !== "ml"}
                type="number" inputMode="decimal" min="1" step="10" value={mlTarget} placeholder="—"
                onChange={e => setMlTarget(e.target.value)}
                className="flex-1 h-10 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400 font-mono text-xl font-bold text-center placeholder-zinc-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 disabled:cursor-not-allowed" />
              <span className="text-xs text-zinc-500 whitespace-nowrap">ml</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Water suggestion ── */}
      <div className="bg-zinc-800/60 border border-white/8 rounded-xl px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">稀釋水建議（10–15%）</span>
          {waterPct === null ? (
            <button onClick={() => setWaterPct(12)}
              className="text-xs text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg active:bg-amber-500/10">
              計算
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              {[10, 12, 15].map(p => (
                <button key={p} onClick={() => setWaterPct(p)}
                  className={`text-xs px-2 py-1 rounded-lg border transition-all ${waterPct === p ? "bg-amber-500 border-amber-500 text-black font-bold" : "border-zinc-700 text-zinc-400 active:bg-white/5"}`}>
                  {p}%
                </button>
              ))}
              <button onClick={() => setWaterPct(null)} className="text-zinc-600 text-xs ml-1">✕</button>
            </div>
          )}
        </div>
        {waterSuggestion && (
          <div className="flex gap-2 mt-2">
            <div className="flex-1 bg-zinc-900/60 rounded-lg p-2 text-center">
              <div className="text-[9px] text-zinc-500 mb-0.5">建議範圍</div>
              <div className="text-sm font-bold font-mono text-blue-400">{waterSuggestion.lo}–{waterSuggestion.hi} ml</div>
            </div>
            <div className="flex-1 bg-zinc-900/60 rounded-lg p-2 text-center">
              <div className="text-[9px] text-zinc-500 mb-0.5">選擇 {waterPct}%</div>
              <div className="text-sm font-bold font-mono text-amber-400">{waterSuggestion.chosen} ml</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Ingredients ── */}
      <div className="bg-zinc-800/60 border border-white/8 rounded-xl px-3 pt-2.5 pb-2">
        {/* Headers */}
        <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: "1fr 54px 88px 32px" }}>
          <div className="text-[9px] text-zinc-600">食材</div>
          <div className="text-[9px] text-zinc-600 text-center">ABV %</div>
          <div className="text-[9px] text-zinc-600 text-center">ml → 實際</div>
          <div />
        </div>

        {/* Rows */}
        {ingredients.map(ing => {
          const scaledAmt = +(ing.amount * scaleFactor).toFixed(2);
          return (
            <div key={ing.id} className="grid gap-1.5 mb-1.5 items-start" style={{ gridTemplateColumns: "1fr 54px 88px 32px" }}>
              <input type="text" value={ing.name} placeholder="食材名"
                onChange={e => updateIng(ing.id, "name", e.target.value)}
                className={ingNameCls} />
              <input type="number" inputMode="decimal" min="0" max="100" step="0.1"
                value={ing.abv}
                onChange={e => updateIng(ing.id, "abv", parseFloat(e.target.value) || 0)}
                className={ingInputCls} />
              <div>
                <input type="number" inputMode="decimal" min="0" step="any"
                  value={ing.amount}
                  onChange={e => updateIng(ing.id, "amount", parseFloat(e.target.value) || 0)}
                  className={ingInputCls} />
                {/* Pure display: scaled result */}
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-[10px] font-bold font-mono text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded">{scaledAmt}</span>
                  <span className="text-[9px] text-zinc-600">/</span>
                  <span className="text-[10px] font-bold font-mono text-violet-400 bg-violet-500/15 px-1.5 py-0.5 rounded">{mlToOz(scaledAmt)}</span>
                </div>
              </div>
              <button onClick={() => removeIng(ing.id)}
                className="w-8 h-10 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-500 text-xs active:bg-zinc-700 flex items-center justify-center">✕</button>
            </div>
          );
        })}

        {/* Add + Save on same row */}
        <div className="flex gap-2 mt-2">
          <button onClick={addIng}
            className="flex-1 h-9 rounded-lg border border-dashed border-zinc-600 text-zinc-500 text-xs active:bg-white/5">
            + 新增食材
          </button>
          <input value={saveName} onChange={e => setSaveName(e.target.value)}
            placeholder="酒譜名稱…"
            className="flex-1 h-9 px-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40" />
          <button onClick={saveRecipe}
            className="h-9 px-3 rounded-lg bg-amber-500 text-black text-xs font-bold active:bg-amber-600 whitespace-nowrap">
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: LIBRARY
// ═══════════════════════════════════════════════════════════════

function TabLib({ onLoad }) {
  const [filterCat, setFilterCat] = useState("All");
  const filtered = PRESETS.filter(r => filterCat === "All" || r.category === filterCat);
  return (
    <>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {PRESET_CATS.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-full border text-xs transition-all ${c === filterCat ? "bg-amber-500 border-amber-500 text-black font-semibold" : "border-zinc-700 text-zinc-400 active:bg-white/5"}`}>
            {c === "All" ? "全部" : c}
          </button>
        ))}
      </div>
      {filtered.map(r => <RecipeCard key={r.id} recipe={r} onLoad={onLoad} />)}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: TECHNIQUES
// ═══════════════════════════════════════════════════════════════

function TabSpecial() {
  const [filterCat, setFilterCat] = useState("全部");
  const filtered = TECHS.filter(t => filterCat === "全部" || t.cat === filterCat);
  return (
    <>
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: "none" }}>
        {TECH_CATS.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-full border text-xs whitespace-nowrap shrink-0 transition-all ${c === filterCat ? "bg-amber-500 border-amber-500 text-black font-semibold" : "border-zinc-700 text-zinc-400 active:bg-white/5"}`}>
            {c}
          </button>
        ))}
      </div>
      {filtered.map((tech, i) => <TechCard key={i} tech={tech} />)}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: MY RECIPES
// ═══════════════════════════════════════════════════════════════

function TabMine({ onLoad }) {
  const [recipes, setRecipes] = useState(loadStored);

  useEffect(() => {
    const handler = () => setRecipes(loadStored());
    window.addEventListener("cc_recipes_updated", handler);
    return () => window.removeEventListener("cc_recipes_updated", handler);
  }, []);

  const deleteRecipe = id => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    localStorage.setItem("cc_myrecipes", JSON.stringify(updated));
  };

  if (!recipes.length) return (
    <div className="text-center py-16 text-zinc-600 text-sm leading-relaxed">
      還沒有儲存的酒譜<br />在計算機頁面儲存你的創作！
    </div>
  );
  return <>{recipes.map(r => <RecipeCard key={r.id} recipe={r} onLoad={onLoad} onDelete={deleteRecipe} />)}</>;
}

// ═══════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════

const NAV = [
  { id: "calc",    icon: "⚗️",  label: "計算機" },
  { id: "lib",     icon: "📖",  label: "食譜庫" },
  { id: "special", icon: "🔬",  label: "特殊技術" },
  { id: "mine",    icon: "💾",  label: "我的酒譜" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("calc");
  const loadFn = useRef(null);

  const handleLoad = useCallback(recipe => {
    setActiveTab("calc");
    // Wait for TabCalc to mount, then load
    setTimeout(() => { if (loadFn.current) loadFn.current(recipe); }, 80);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; background: #0d0d0c; }
        body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="flex flex-col bg-[#0d0d0c] text-white overflow-hidden"
           style={{ height: "100svh", maxWidth: 480, margin: "0 auto" }}>

        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/8 bg-zinc-900/80 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-base shrink-0">🍹</div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">CocktailCalc</div>
            <div className="text-[9px] text-zinc-600 tracking-widest">BARTENDER'S TOOLKIT</div>
          </div>
        </header>

        {/* Content — all tabs scroll naturally */}
        <main className="flex-1 overflow-y-auto px-3 pt-3 pb-4"
              style={{ scrollbarWidth: "none" }}>
          {activeTab === "calc"    && <TabCalc    loadFn={loadFn} />}
          {activeTab === "lib"     && <TabLib     onLoad={handleLoad} />}
          {activeTab === "special" && <TabSpecial />}
          {activeTab === "mine"    && <TabMine    onLoad={handleLoad} />}
        </main>

        {/* Bottom nav */}
        <nav className="flex border-t border-white/8 bg-zinc-900/90 shrink-0">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors ${activeTab === item.id ? "text-amber-400" : "text-zinc-600 active:text-zinc-400"}`}>
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
