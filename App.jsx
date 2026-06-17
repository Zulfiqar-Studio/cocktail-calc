        <div className="flex gap-2">
          <input value={saveName} onChange={e => setSaveName(e.target.value)}
            placeholder="輸入酒譜名稱"
            className="flex-1 h-10 px-3 rounded-lg bg-zinc-950 border border-amber-500/30 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40" />
          <button onClick={saveRecipe}
            disabled={!saveName.trim()}
            className="h-10 px-4 rounded-lg bg-amber-500 text-black text-sm font-bold active:bg-amber-600 disabled:opacity-35 disabled:cursor-not-allowed whitespace-nowrap">
            {editingId ? "更新" : "儲存"}
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

function TabMine({ onLoad, onEdit, onCreate }) {
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
    <div className="text-center py-16 px-4 text-zinc-600 text-sm leading-relaxed">
      <div className="mb-4">
        還沒有儲存的酒譜<br />先建立第一杯，再回來編輯。
      </div>
      <button onClick={onCreate}
        className="h-10 px-5 rounded-lg bg-amber-500 text-black text-sm font-bold active:bg-amber-600">
        + 新增酒譜
      </button>
    </div>
  );
  return <>{recipes.map(r => <RecipeCard key={r.id} recipe={r} onLoad={onLoad} onEdit={onEdit} onDelete={deleteRecipe} />)}</>;
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

  const handleEdit = useCallback(recipe => {
    setActiveTab("calc");
    setTimeout(() => { if (loadFn.current) loadFn.current(recipe, "edit"); }, 80);
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
          {activeTab === "mine"    && <TabMine    onLoad={handleLoad} onEdit={handleEdit} onCreate={() => setActiveTab("calc")} />}
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
