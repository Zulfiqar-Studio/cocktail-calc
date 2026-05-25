import { useState, useEffect, useCallback } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

const PRESET_RECIPES = [
  // IBA Classics
  {
    id: "negroni", category: "IBA Classic", name: "Negroni",
    ingredients: [
      { name: "Gin", abv: 40, amount: 30 },
      { name: "Campari", abv: 25, amount: 30 },
      { name: "Sweet Vermouth", abv: 16, amount: 30 },
    ],
  },
  {
    id: "margarita", category: "IBA Classic", name: "Margarita",
    ingredients: [
      { name: "Tequila", abv: 40, amount: 50 },
      { name: "Triple Sec", abv: 40, amount: 20 },
      { name: "Lime Juice", abv: 0, amount: 15 },
    ],
  },
  {
    id: "daiquiri", category: "IBA Classic", name: "Daiquiri",
    ingredients: [
      { name: "White Rum", abv: 40, amount: 45 },
      { name: "Simple Syrup", abv: 0, amount: 15 },
      { name: "Lime Juice", abv: 0, amount: 25 },
    ],
  },
  {
    id: "old-fashioned", category: "IBA Classic", name: "Old Fashioned",
    ingredients: [
      { name: "Bourbon", abv: 45, amount: 60 },
      { name: "Simple Syrup", abv: 0, amount: 5 },
      { name: "Angostura Bitters", abv: 45, amount: 2 },
    ],
  },
  // Molecular
  {
    id: "nitro-martini", category: "分子調酒", name: "Nitro Martini",
    ingredients: [
      { name: "Vodka", abv: 40, amount: 60 },
      { name: "Dry Vermouth", abv: 18, amount: 15 },
    ],
  },
  {
    id: "gin-caviar", category: "分子調酒", name: "Gin Caviar Fizz",
    ingredients: [
      { name: "Gin", abv: 40, amount: 45 },
      { name: "Elderflower Tonic", abv: 0, amount: 90 },
      { name: "Lemon Juice", abv: 0, amount: 15 },
    ],
  },
  // Mocktail
  {
    id: "virgin-mojito", category: "Mocktail", name: "Virgin Mojito",
    ingredients: [
      { name: "Lime Juice", abv: 0, amount: 25 },
      { name: "Simple Syrup", abv: 0, amount: 20 },
      { name: "Soda Water", abv: 0, amount: 120 },
      { name: "Mint Leaves", abv: 0, amount: 10 },
    ],
  },
  {
    id: "shirley-temple", category: "Mocktail", name: "Shirley Temple",
    ingredients: [
      { name: "Ginger Ale", abv: 0, amount: 120 },
      { name: "Grenadine", abv: 0, amount: 15 },
      { name: "Orange Juice", abv: 0, amount: 30 },
    ],
  },
];

const ML_TO_OZ = 0.033814;

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcABV(ingredients) {
  const totalVol = ingredients.reduce((s, i) => s + i.amount, 0);
  if (totalVol === 0) return 0;
  const alcoholVol = ingredients.reduce((s, i) => s + i.amount * (i.abv / 100), 0);
  return ((alcoholVol / totalVol) * 100).toFixed(1);
}

function mlToOz(ml) { return (ml * ML_TO_OZ).toFixed(2); }

// ─── Sub-components ─────────────────────────────────────────────────────────

function ABVBar({ abv }) {
  const pct = Math.min(parseFloat(abv), 60);
  const color = pct < 10 ? "#4ade80" : pct < 20 ? "#facc15" : pct < 35 ? "#fb923c" : "#f87171";
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, opacity: 0.7 }}>
        <span>ABV</span><span>{abv}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(pct / 60) * 100}%`, background: color, borderRadius: 99, transition: "width .4s ease" }} />
      </div>
    </div>
  );
}

function IngredientRow({ ing, onChange, onRemove, scaleFactor }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 32px", gap: 6, alignItems: "center", marginBottom: 6 }}>
      <input
        value={ing.name}
        onChange={e => onChange({ ...ing, name: e.target.value })}
        placeholder="Ingredient"
        style={{ ...inputStyle, fontSize: 13 }}
      />
      <div style={{ position: "relative" }}>
        <input
          type="number" min="0" max="100" step="0.1"
          value={ing.abv}
          onChange={e => onChange({ ...ing, abv: parseFloat(e.target.value) || 0 })}
          style={{ ...inputStyle, fontSize: 13, paddingRight: 20 }}
        />
        <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, opacity: 0.5 }}>%</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <input
          type="number" min="0" step="0.5"
          value={ing.amount}
          onChange={e => onChange({ ...ing, amount: parseFloat(e.target.value) || 0 })}
          style={{ ...inputStyle, fontSize: 13, width: "100%" }}
        />
        <div style={{ fontSize: 10, opacity: 0.45, marginTop: 2 }}>{mlToOz(ing.amount * scaleFactor)} oz</div>
      </div>
      <button onClick={onRemove} style={{ ...iconBtn, color: "var(--danger)" }}>✕</button>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = ["🍸 計算機", "📖 食譜庫", "✨ 特殊技術", "💾 我的酒譜"];

// ─── Special Techniques ──────────────────────────────────────────────────────

function BubbleCalc() {
  const [liquid, setLiquid] = useState(100);
  const [agent, setAgent] = useState("gelatin");
  const AGENTS = {
    gelatin: { name: "吉利丁 Gelatin", bubble: 1.5, foam: 0.5, unit: "g", note: "冷卻凝固，需冷藏。泡泡：1.5% / 慕斯：0.5–1%" },
    methyl: { name: "三仙膠 Xanthan Gum", bubble: 0.3, foam: 0.2, unit: "g", note: "熱穩定，無需冷藏。泡泡：0.2–0.4%" },
    agar: { name: "洋菜膠 Agar Agar", bubble: 0.8, foam: 0.5, unit: "g", note: "素食，熱凝固。泡泡：0.5–1%" },
  };
  const a = AGENTS[agent];
  return (
    <div>
      <h3 style={sectionTitle}>🫧 泡泡計算 Bubble Calculator</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(AGENTS).map(([k, v]) => (
          <button key={k} onClick={() => setAgent(k)}
            style={{ ...chip, background: agent === k ? "var(--accent)" : "var(--surface2)", color: agent === k ? "#fff" : "var(--text)" }}>
            {v.name}
          </button>
        ))}
      </div>
      <label style={labelStyle}>液體總量 Liquid Volume (ml)</label>
      <input type="number" value={liquid} onChange={e => setLiquid(parseFloat(e.target.value) || 0)}
        style={{ ...inputStyle, marginBottom: 16 }} />
      <div style={resultGrid}>
        <ResultCard label="泡泡用量 Bubble" value={`${(liquid * a.bubble / 100).toFixed(2)} ${a.unit}`} sub={`${a.bubble}% ratio`} />
        <ResultCard label="泡沫用量 Foam" value={`${(liquid * a.foam / 100).toFixed(2)} ${a.unit}`} sub={`${a.foam}% ratio`} />
      </div>
      <p style={noteStyle}>💡 {a.note}</p>
    </div>
  );
}

function MilkWashCalc() {
  const [spirit, setSpirit] = useState(200);
  const [milkRatio, setMilkRatio] = useState(30);
  const milk = (spirit * milkRatio / 100).toFixed(0);
  const acid = ((spirit + parseFloat(milk)) * 0.015).toFixed(1);
  return (
    <div>
      <h3 style={sectionTitle}>🥛 奶洗計算 Milk Wash</h3>
      <label style={labelStyle}>烈酒量 Spirit (ml)</label>
      <input type="number" value={spirit} onChange={e => setSpirit(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, marginBottom: 12 }} />
      <label style={labelStyle}>牛奶比例 Milk Ratio (%)</label>
      <input type="number" value={milkRatio} min={10} max={60} onChange={e => setMilkRatio(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, marginBottom: 16 }} />
      <div style={resultGrid}>
        <ResultCard label="牛奶用量 Milk" value={`${milk} ml`} sub={`${mlToOz(milk)} oz`} />
        <ResultCard label="酸液建議 Acid*" value={`${acid} ml`} sub="Citric / Lemon" />
        <ResultCard label="總量 Total" value={`${(parseFloat(spirit) + parseFloat(milk)).toFixed(0)} ml`} sub="靜置過濾" />
      </div>
      <p style={noteStyle}>💡 *加入酸液使牛奶蛋白質凝固，冷藏 24h 後過濾，得清澈液體。</p>
    </div>
  );
}

function AgarCalc() {
  const [liquid, setLiquid] = useState(100);
  const [use, setUse] = useState("gel");
  const USES = { gel: { label: "凝膠 Gel", pct: 1.0 }, noodle: { label: "麵條 Noodle", pct: 1.5 }, clarify: { label: "澄清 Clarification", pct: 0.2 } };
  const u = USES[use];
  return (
    <div>
      <h3 style={sectionTitle}>🔬 Agar Agar 換算</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(USES).map(([k, v]) => (
          <button key={k} onClick={() => setUse(k)}
            style={{ ...chip, background: use === k ? "var(--accent)" : "var(--surface2)", color: use === k ? "#fff" : "var(--text)" }}>
            {v.label}
          </button>
        ))}
      </div>
      <label style={labelStyle}>液體量 Liquid (ml)</label>
      <input type="number" value={liquid} onChange={e => setLiquid(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, marginBottom: 16 }} />
      <div style={resultGrid}>
        <ResultCard label="Agar 用量" value={`${(liquid * u.pct / 100).toFixed(2)} g`} sub={`${u.pct}% for ${u.label}`} />
        <ResultCard label="建議加熱" value="85–90°C" sub="充分溶解後倒模" />
      </div>
      <p style={noteStyle}>💡 Agar 凝固點約 35°C，融化點 85°C，可反覆加熱，素食可用。</p>
    </div>
  );
}

function ResultCard({ label, value, sub }) {
  return (
    <div style={{ background: "var(--surface2)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

const EMPTY_ING = () => ({ id: Date.now(), name: "", abv: 0, amount: 30 });

export default function App() {
  const [tab, setTab] = useState(0);
  const [techTab, setTechTab] = useState(0);
  const [scale, setScale] = useState(1);
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "Gin", abv: 40, amount: 30 },
    { id: 2, name: "Campari", abv: 25, amount: 30 },
    { id: 3, name: "Sweet Vermouth", abv: 16, amount: 30 },
  ]);
  const [myRecipes, setMyRecipes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("myRecipes") || "[]"); } catch { return []; }
  });
  const [saveName, setSaveName] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("myRecipes", JSON.stringify(myRecipes));
  }, [myRecipes]);

  const abv = calcABV(ingredients.map(i => ({ ...i, amount: i.amount * scale })));
  const totalMl = ingredients.reduce((s, i) => s + i.amount * scale, 0);

  const loadRecipe = useCallback((recipe) => {
    setIngredients(recipe.ingredients.map((i, idx) => ({ ...i, id: idx + 1 })));
    setScale(1);
    setTab(0);
  }, []);

  const saveRecipe = () => {
    if (!saveName.trim()) return;
    const recipe = { id: Date.now(), name: saveName.trim(), category: "自訂", ingredients };
    if (editingId) {
      setMyRecipes(rs => rs.map(r => r.id === editingId ? { ...recipe, id: editingId } : r));
      setEditingId(null);
    } else {
      setMyRecipes(rs => [...rs, recipe]);
    }
    setSaveName("");
  };

  const cats = ["All", ...Array.from(new Set(PRESET_RECIPES.map(r => r.category)))];

  return (
    <div style={appShell}>
      {/* Header */}
      <header style={header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🍹</span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>CocktailCalc</div>
            <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: 2 }}>BARTENDER'S TOOLKIT</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav style={tabNav}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ ...tabBtn, ...(tab === i ? tabActive : {}) }}>{t}</button>
        ))}
      </nav>

      <main style={main}>

        {/* ── Tab 0: Calculator ── */}
        {tab === 0 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              <ResultCard label="ABV" value={`${abv}%`} sub="酒精濃度" />
              <ResultCard label="Total ml" value={`${totalMl.toFixed(0)}`} sub={`${mlToOz(totalMl)} oz`} />
              <ResultCard label="Scale" value={`×${scale}`} sub="倍率" />
            </div>

            <ABVBar abv={abv} />

            {/* Scale slider */}
            <div style={{ margin: "16px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
                <span>放大縮小 Scale</span><span>×{scale}</span>
              </div>
              <input type="range" min="0.5" max="10" step="0.5" value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.4 }}>
                <span>×0.5</span><span>×10</span>
              </div>
            </div>

            {/* Ingredient header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 32px", gap: 6, marginBottom: 4 }}>
              {["食材 Ingredient", "ABV %", "ml", ""].map((h, i) => (
                <div key={i} style={{ fontSize: 10, opacity: 0.5, textAlign: i === 2 ? "center" : "left" }}>{h}</div>
              ))}
            </div>

            {ingredients.map(ing => (
              <IngredientRow key={ing.id} ing={ing} scaleFactor={scale}
                onChange={updated => setIngredients(ings => ings.map(i => i.id === ing.id ? updated : i))}
                onRemove={() => setIngredients(ings => ings.filter(i => i.id !== ing.id))}
              />
            ))}

            <button onClick={() => setIngredients(ings => [...ings, EMPTY_ING()])} style={addBtn}>
              + 加食材 Add Ingredient
            </button>

            {/* Save */}
            <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
              <input value={saveName} onChange={e => setSaveName(e.target.value)}
                placeholder="酒譜名稱 Recipe name…"
                style={{ ...inputStyle, flex: 1 }} />
              <button onClick={saveRecipe} style={accentBtn}>💾 儲存</button>
            </div>
          </div>
        )}

        {/* ── Tab 1: Recipe Library ── */}
        {tab === 1 && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {cats.map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  style={{ ...chip, background: filterCat === c ? "var(--accent)" : "var(--surface2)", color: filterCat === c ? "#fff" : "var(--text)" }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PRESET_RECIPES.filter(r => filterCat === "All" || r.category === filterCat).map(r => (
                <RecipeCard key={r.id} recipe={r} onLoad={() => loadRecipe(r)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: Special Techniques ── */}
        {tab === 2 && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {["🫧 泡泡", "🥛 奶洗", "🔬 Agar"].map((t, i) => (
                <button key={i} onClick={() => setTechTab(i)}
                  style={{ ...chip, background: techTab === i ? "var(--accent)" : "var(--surface2)", color: techTab === i ? "#fff" : "var(--text)" }}>
                  {t}
                </button>
              ))}
            </div>
            {techTab === 0 && <BubbleCalc />}
            {techTab === 1 && <MilkWashCalc />}
            {techTab === 2 && <AgarCalc />}
          </div>
        )}

        {/* ── Tab 3: My Recipes ── */}
        {tab === 3 && (
          <div>
            {myRecipes.length === 0
              ? <div style={{ textAlign: "center", opacity: 0.4, padding: "40px 0", fontSize: 14 }}>
                  還沒有儲存的酒譜<br />在計算機頁面儲存你的創作！
                </div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {myRecipes.map(r => (
                    <RecipeCard key={r.id} recipe={r} onLoad={() => loadRecipe(r)}
                      onDelete={() => setMyRecipes(rs => rs.filter(x => x.id !== r.id))}
                      onEdit={() => { loadRecipe(r); setSaveName(r.name); setEditingId(r.id); }}
                    />
                  ))}
                </div>
            }
          </div>
        )}

      </main>
    </div>
  );
}

function RecipeCard({ recipe, onLoad, onDelete, onEdit }) {
  const abv = calcABV(recipe.ingredients);
  const total = recipe.ingredients.reduce((s, i) => s + i.amount, 0);
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>{recipe.category}</div>
          <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "var(--font-display)" }}>{recipe.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{abv}%</div>
          <div style={{ fontSize: 10, opacity: 0.5 }}>{total} ml / {mlToOz(total)} oz</div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, lineHeight: 1.8 }}>
        {recipe.ingredients.map((i, idx) => (
          <span key={idx}>{i.name} {i.amount}ml{idx < recipe.ingredients.length - 1 ? " · " : ""}</span>
        ))}
      </div>
      <ABVBar abv={abv} />
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={onLoad} style={{ ...accentBtn, flex: 1, fontSize: 13 }}>載入計算</button>
        {onEdit && <button onClick={onEdit} style={{ ...ghostBtn, fontSize: 13 }}>✏️</button>}
        {onDelete && <button onClick={onDelete} style={{ ...ghostBtn, fontSize: 13, color: "var(--danger)" }}>🗑️</button>}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const appShell = {
  minHeight: "100vh",
  background: "var(--bg)",
  color: "var(--text)",
  fontFamily: "var(--font-body)",
  maxWidth: 480,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const header = {
  padding: "20px 20px 12px",
  borderBottom: "1px solid var(--border)",
};

const tabNav = {
  display: "flex",
  borderBottom: "1px solid var(--border)",
  overflowX: "auto",
  padding: "0 8px",
};

const tabBtn = {
  padding: "10px 12px",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 12,
  whiteSpace: "nowrap",
  color: "var(--text)",
  opacity: 0.5,
  borderBottom: "2px solid transparent",
  transition: "all .2s",
};

const tabActive = {
  opacity: 1,
  borderBottomColor: "var(--accent)",
  color: "var(--accent)",
};

const main = {
  padding: "20px 16px 40px",
  flex: 1,
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--surface2)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const iconBtn = {
  width: 32, height: 32,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--surface2)",
  cursor: "pointer",
  fontSize: 12,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const addBtn = {
  width: "100%",
  padding: "10px",
  borderRadius: 8,
  border: "1px dashed var(--border)",
  background: "none",
  color: "var(--text)",
  opacity: 0.6,
  cursor: "pointer",
  fontSize: 13,
  marginTop: 4,
};

const accentBtn = {
  padding: "9px 16px",
  borderRadius: 8,
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

const ghostBtn = {
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "none",
  color: "var(--text)",
  cursor: "pointer",
  fontSize: 14,
};

const chip = {
  padding: "5px 12px",
  borderRadius: 99,
  border: "none",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  transition: "all .15s",
};

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "14px 16px",
};

const resultGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
  gap: 8,
  marginBottom: 12,
};

const sectionTitle = {
  fontFamily: "var(--font-display)",
  fontSize: 16,
  fontWeight: 800,
  marginBottom: 14,
  marginTop: 0,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  opacity: 0.6,
  marginBottom: 6,
};

const noteStyle = {
  fontSize: 12,
  opacity: 0.6,
  lineHeight: 1.6,
  background: "var(--surface2)",
  borderRadius: 8,
  padding: "10px 12px",
  marginTop: 12,
};

// ─── CSS Variables injection ──────────────────────────────────────────────────
// Injected via index.html or a style tag; here we append to document head.
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

    :root {
      --font-display: 'Playfair Display', Georgia, serif;
      --font-body: 'DM Sans', sans-serif;
      --font-mono: 'DM Mono', monospace;
      --accent: #e8643c;
      --danger: #f87171;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #111110;
        --surface: #1c1b1a;
        --surface2: #242322;
        --border: #2e2d2b;
        --text: #f0ede8;
      }
    }

    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f8f5f0;
        --surface: #ffffff;
        --surface2: #f0ede8;
        --border: #e0dbd3;
        --text: #1a1917;
      }
    }

    * { box-sizing: border-box; }
    body { margin: 0; }

    input[type=range] { cursor: pointer; }
    input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
    button:active { transform: scale(0.97); }

    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
  `;
  document.head.appendChild(style);
}
