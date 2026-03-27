import { useState, useEffect } from "react";

// ─── Daily limit for AI tools (5 uses/day) ───
const DAILY_LIMIT = 5;
function getUsage() {
  try {
    const raw = window.localStorage.getItem("tf_usage");
    if (!raw) return { date: "", count: 0 };
    return JSON.parse(raw);
  } catch { return { date: "", count: 0 }; }
}
function addUsage() {
  const today = new Date().toDateString();
  const u = getUsage();
  const count = u.date === today ? u.count + 1 : 1;
  try { window.localStorage.setItem("tf_usage", JSON.stringify({ date: today, count })); } catch {}
  return count;
}
function canUseAI() {
  const today = new Date().toDateString();
  const u = getUsage();
  if (u.date !== today) return true;
  return u.count < DAILY_LIMIT;
}
function remainingUses() {
  const today = new Date().toDateString();
  const u = getUsage();
  if (u.date !== today) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - u.count);
}

// ─── API call ───
async function askAI(prompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

// ─── Shared ───
const TA = { width: "100%", minHeight: 170, padding: 16, fontSize: 15, border: "1.5px solid #e0e0dc", borderRadius: 10, resize: "vertical", fontFamily: "Georgia, serif", lineHeight: 1.7, outline: "none", background: "#fff", boxSizing: "border-box" };
function Err({ m }) { return m ? <div style={{ marginTop: 12, padding: 12, background: "#FFF5F3", border: "1px solid #f5c6c6", borderRadius: 10, fontSize: 14, color: "#c0392b" }}>{m}</div> : null; }
function LimitBadge() {
  const r = remainingUses();
  return <div style={{ fontSize: 12, color: r > 2 ? "#27AE60" : r > 0 ? "#F39C12" : "#E8593C", marginBottom: 12, fontWeight: 600 }}>{r > 0 ? r + " free AI uses remaining today" : "Daily limit reached - resets tomorrow"}</div>;
}
function Stat({ label, value, accent }) {
  return <div style={{ background: "#fafaf8", borderRadius: 10, padding: "12px 14px" }}>
    <div style={{ fontSize: 20, fontWeight: 700, color: accent || "#1a1a1a" }}>{value}</div>
    <div style={{ fontSize: 10, color: "#888", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
  </div>;
}

// ═══════════════════════════════════════
// FREE TOOL: Word Counter & Readability
// ═══════════════════════════════════════
function countSyl(w) { w = w.toLowerCase().replace(/[^a-z]/g, ""); if (w.length <= 3) return 1; w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, ""); const m = w.match(/[aeiouy]{1,2}/g); return m ? m.length : 1; }
function WordCounterTool() {
  const [text, setText] = useState("");
  const t = text.trim();
  const words = t ? t.split(/\s+/).filter(w => w.length > 0) : [];
  const sents = t ? text.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
  const paras = t ? text.split(/\n\n+/).filter(p => p.trim().length > 0) : [];
  const wc = words.length, sc = sents.length || 1;
  const syl = words.reduce((s, w) => s + countSyl(w), 0);
  const flesch = wc > 0 ? Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * (wc / sc) - 84.6 * (syl / wc)))) : 0;
  const fk = wc > 0 ? Math.max(0, 0.39 * (wc / sc) + 11.8 * (syl / wc) - 15.59) : 0;
  let rd = "Very Easy"; if (flesch < 30) rd = "Very Difficult"; else if (flesch < 50) rd = "Difficult"; else if (flesch < 60) rd = "Fairly Difficult"; else if (flesch < 70) rd = "Standard"; else if (flesch < 80) rd = "Fairly Easy"; else if (flesch < 90) rd = "Easy";
  return <div>
    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste or type your text here..." style={TA} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, marginTop: 14 }}>
      <Stat label="Words" value={wc} accent="#4A90D9" /><Stat label="Characters" value={text.length} /><Stat label="No spaces" value={text.replace(/\s/g, "").length} /><Stat label="Sentences" value={sents.length} /><Stat label="Paragraphs" value={paras.length} /><Stat label="Reading time" value={Math.max(1, Math.ceil(wc / 230)) + " min"} accent="#27AE60" />
    </div>
    <div style={{ marginTop: 16, background: "#fafaf8", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div><div style={{ fontSize: 12, color: "#888" }}>Readability</div><div style={{ fontSize: 18, fontWeight: 700 }}>{wc > 0 ? rd : "-"}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "#888" }}>Flesch score</div><div style={{ fontSize: 18, fontWeight: 700 }}>{flesch}/100</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "#888" }}>Grade level</div><div style={{ fontSize: 18, fontWeight: 700 }}>{wc > 0 ? (fk < 1 ? "K" : "Grade " + Math.round(fk)) : "-"}</div></div>
      </div>
      <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 4, overflow: "hidden", marginTop: 10 }}>
        <div style={{ width: flesch + "%", height: "100%", background: "hsl(" + ((flesch / 100) * 120) + ", 65%, 50%)", borderRadius: 4, transition: "width 0.3s" }} />
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════
// FREE TOOL: Case Converter
// ═══════════════════════════════════════
function CaseConverterTool() {
  const [text, setText] = useState("");
  const convert = (fn) => setText(fn(text));
  const toTitle = (s) => s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
  const toSentence = (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
  const toAlternate = (s) => s.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("");
  return <div>
    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste text to convert..." style={TA} />
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
      {[["UPPERCASE", () => text.toUpperCase()], ["lowercase", () => text.toLowerCase()], ["Title Case", () => toTitle(text)], ["Sentence case", () => toSentence(text)], ["aLtErNaTe", () => toAlternate(text)]].map(([label, fn]) =>
        <button key={label} onClick={() => convert(fn)} style={{ padding: "8px 16px", background: "#f5f5f3", border: "1.5px solid #e0e0dc", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{label}</button>
      )}
    </div>
    {text && <button onClick={() => navigator.clipboard.writeText(text)} style={{ marginTop: 10, padding: "6px 14px", background: "#E8593C", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Copy result</button>}
  </div>;
}

// ═══════════════════════════════════════
// FREE TOOL: Password Generator
// ═══════════════════════════════════════
function PasswordGenTool() {
  const [len, setLen] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(true);
  const [pw, setPw] = useState("");
  const generate = () => {
    let chars = "";
    if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (nums) chars += "0123456789";
    if (syms) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    setPw(Array.from(arr, v => chars[v % chars.length]).join(""));
  };
  useEffect(() => { generate(); }, [len, upper, lower, nums, syms]);
  const strength = len >= 20 && syms ? "Very Strong" : len >= 14 ? "Strong" : len >= 10 ? "Medium" : "Weak";
  const sColor = strength === "Very Strong" ? "#27AE60" : strength === "Strong" ? "#4A90D9" : strength === "Medium" ? "#F39C12" : "#E8593C";
  return <div>
    <div style={{ background: "#fafaf8", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 18, wordBreak: "break-all", letterSpacing: "1px", marginBottom: 14, minHeight: 56, display: "flex", alignItems: "center" }}>{pw}</div>
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      <button onClick={generate} style={{ padding: "10px 20px", background: "#E8593C", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", flex: 1 }}>Generate new</button>
      <button onClick={() => navigator.clipboard.writeText(pw)} style={{ padding: "10px 20px", background: "#f5f5f3", border: "1.5px solid #e0e0dc", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Copy</button>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span style={{ fontSize: 13, color: "#888", minWidth: 60 }}>Length: {len}</span>
      <input type="range" min="6" max="64" value={len} onChange={e => setLen(+e.target.value)} style={{ flex: 1 }} />
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
      {[[upper, setUpper, "ABC"], [lower, setLower, "abc"], [nums, setNums, "123"], [syms, setSyms, "#$%"]].map(([v, set, lbl]) =>
        <label key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={v} onChange={e => set(e.target.checked)} /> {lbl}
        </label>
      )}
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, color: sColor }}>Strength: {strength}</div>
  </div>;
}

// ═══════════════════════════════════════
// FREE TOOL: Lorem Ipsum Generator
// ═══════════════════════════════════════
function LoremTool() {
  const words = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState("paragraphs");
  const gen = () => {
    if (unit === "words") return Array.from({ length: count }, (_, i) => words[i % words.length]).join(" ");
    if (unit === "sentences") return Array.from({ length: count }, () => { const l = 8 + Math.floor(Math.random() * 12); return Array.from({ length: l }, () => words[Math.floor(Math.random() * words.length)]).join(" ").replace(/^./, c => c.toUpperCase()) + "."; }).join(" ");
    return Array.from({ length: count }, () => { const s = 3 + Math.floor(Math.random() * 4); return Array.from({ length: s }, () => { const l = 8 + Math.floor(Math.random() * 12); return Array.from({ length: l }, () => words[Math.floor(Math.random() * words.length)]).join(" ").replace(/^./, c => c.toUpperCase()) + "."; }).join(" "); }).join("\n\n");
  };
  const [out, setOut] = useState("");
  useEffect(() => { setOut(gen()); }, [count, unit]);
  return <div>
    <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#888" }}>Generate</span>
      <input type="number" min="1" max="50" value={count} onChange={e => setCount(Math.max(1, +e.target.value))} style={{ width: 60, padding: "6px 10px", border: "1.5px solid #e0e0dc", borderRadius: 6, fontSize: 14 }} />
      {["paragraphs", "sentences", "words"].map(u => <button key={u} onClick={() => setUnit(u)} style={{ padding: "6px 14px", borderRadius: 20, border: unit === u ? "2px solid #E8593C" : "1.5px solid #e0e0dc", background: unit === u ? "#FFF5F3" : "#fff", color: unit === u ? "#E8593C" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{u}</button>)}
    </div>
    <div style={{ background: "#fafaf8", borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 1.7, maxHeight: 300, overflowY: "auto", whiteSpace: "pre-wrap" }}>{out}</div>
    <button onClick={() => navigator.clipboard.writeText(out)} style={{ marginTop: 10, padding: "8px 16px", background: "#E8593C", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Copy text</button>
  </div>;
}

// ═══════════════════════════════════════
// FREE TOOL: JSON Formatter
// ═══════════════════════════════════════
function JsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");
  const format = () => { try { setOutput(JSON.stringify(JSON.parse(input), null, 2)); setErr(""); } catch (e) { setErr("Invalid JSON: " + e.message); setOutput(""); } };
  const minify = () => { try { setOutput(JSON.stringify(JSON.parse(input))); setErr(""); } catch (e) { setErr("Invalid JSON: " + e.message); setOutput(""); } };
  return <div>
    <textarea value={input} onChange={e => setInput(e.target.value)} placeholder='Paste JSON here... e.g. {"name":"John","age":30}' style={{ ...TA, fontFamily: "monospace", fontSize: 13 }} />
    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
      <button onClick={format} style={{ padding: "10px 20px", background: "#4A90D9", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", flex: 1 }}>Beautify</button>
      <button onClick={minify} style={{ padding: "10px 20px", background: "#f5f5f3", border: "1.5px solid #e0e0dc", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", flex: 1 }}>Minify</button>
    </div>
    <Err m={err} />
    {output && <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Output</span>
        <button onClick={() => navigator.clipboard.writeText(output)} style={{ padding: "4px 12px", background: "#f0f0ec", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Copy</button>
      </div>
      <pre style={{ background: "#fafaf8", borderRadius: 10, padding: 16, fontSize: 13, overflow: "auto", maxHeight: 300, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{output}</pre>
    </div>}
  </div>;
}

// ═══════════════════════════════════════
// FREE TOOL: Slug Generator
// ═══════════════════════════════════════
function SlugTool() {
  const [text, setText] = useState("");
  const slug = text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
  return <div>
    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type your title or text to convert to URL slug..." style={{ ...TA, minHeight: 80 }} />
    {slug && <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>URL Slug</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ background: "#fafaf8", borderRadius: 10, padding: "12px 16px", fontFamily: "monospace", fontSize: 15, flex: 1, wordBreak: "break-all" }}>{slug}</div>
        <button onClick={() => navigator.clipboard.writeText(slug)} style={{ padding: "8px 14px", background: "#E8593C", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>Copy</button>
      </div>
    </div>}
  </div>;
}

// ═══════════════════════════════════════
// AI TOOL: Text Humanizer (limited)
// ═══════════════════════════════════════
function HumanizerTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tone, setTone] = useState("natural");
  const humanize = async () => {
    if (!input.trim() || loading) return;
    if (!canUseAI()) { setError("Daily limit reached (5 free uses). Come back tomorrow!"); return; }
    setLoading(true); setOutput(""); setError("");
    try {
      const rules = [
        "You are a text humanizer. Rewrite the text below so it sounds like a real human wrote it.",
        "", "Tone: " + tone, "",
        "Rules:", "- Vary sentence length naturally", "- Use contractions where natural",
        "- Remove AI words like Furthermore, Moreover, Additionally, In conclusion",
        "- Replace generic phrasing with concrete language", "- Add personality",
        "- Keep the same meaning", "- Output ONLY the rewritten text"
      ];
      const result = await askAI(rules.join("\n") + "\n\nText to humanize:\n" + input);
      addUsage();
      setOutput(result);
    } catch (e) { setError("Error: " + e.message); }
    setLoading(false);
  };
  return <div>
    <LimitBadge />
    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
      {["natural", "casual", "professional", "academic"].map(t => <button key={t} onClick={() => setTone(t)} style={{ padding: "6px 14px", borderRadius: 20, border: tone === t ? "2px solid #E8593C" : "1.5px solid #e0e0dc", background: tone === t ? "#FFF5F3" : "#fff", color: tone === t ? "#E8593C" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>)}
    </div>
    <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste your AI-generated text here..." style={TA} />
    <button onClick={humanize} disabled={loading || !input.trim() || !canUseAI()} style={{ marginTop: 10, width: "100%", padding: 14, background: loading || !canUseAI() ? "#ccc" : "#E8593C", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer" }}>{loading ? "Humanizing..." : "Humanize Text"}</button>
    <Err m={error} />
    {output && <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Humanized output</span>
        <button onClick={() => navigator.clipboard.writeText(output)} style={{ padding: "4px 12px", background: "#f0f0ec", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Copy</button>
      </div>
      <div style={{ background: "#f8faf6", border: "1.5px solid #d4e8d0", borderRadius: 10, padding: 16, fontSize: 15, lineHeight: 1.7, fontFamily: "Georgia, serif", whiteSpace: "pre-wrap" }}>{output}</div>
    </div>}
  </div>;
}

// ═══════════════════════════════════════
// AI TOOL: Content Detector (limited)
// ═══════════════════════════════════════
function DetectorTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const detect = async () => {
    if (!input.trim() || loading) return;
    if (!canUseAI()) { setError("Daily limit reached (5 free uses). Come back tomorrow!"); return; }
    setLoading(true); setResult(null); setError("");
    try {
      const prompt = [
        "You are an AI content detection expert. Analyze the text below.",
        "", "Respond with ONLY a JSON object, no other text, no markdown backticks:",
        '{"score": 75, "verdict": "Likely AI", "signals": ["signal one", "signal two", "signal three"], "explanation": "Analysis here."}',
        "", "Score: 0-20 Human Written, 21-40 Likely Human, 41-60 Mixed, 61-80 Likely AI, 81-100 AI Generated.",
        "", "Text to analyze:", input
      ].join("\n");
      const raw = await askAI(prompt);
      addUsage();
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Invalid response");
      setResult(JSON.parse(m[0]));
    } catch (e) { setError("Error: " + e.message); }
    setLoading(false);
  };
  const sc = result ? (result.score < 30 ? "#27AE60" : result.score < 60 ? "#F39C12" : "#E8593C") : "#ccc";
  return <div>
    <LimitBadge />
    <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste text to check if it was written by AI..." style={TA} />
    <button onClick={detect} disabled={loading || !input.trim() || !canUseAI()} style={{ marginTop: 10, width: "100%", padding: 14, background: loading || !canUseAI() ? "#ccc" : "#4A90D9", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer" }}>{loading ? "Analyzing..." : "Detect AI Content"}</button>
    <Err m={error} />
    {result && <div style={{ marginTop: 16, background: "#fafaf8", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 14 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", border: "4px solid " + sc, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: sc }}>{result.score}%</span>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: sc }}>{result.verdict}</div>
          <div style={{ fontSize: 12, color: "#888" }}>probability of AI content</div>
        </div>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: "#444", marginBottom: 12 }}>{result.explanation}</div>
      {result.signals && result.signals.length > 0 && <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Signals detected</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {result.signals.map((s, i) => <span key={i} style={{ padding: "4px 10px", background: sc + "18", color: sc, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>)}
        </div>
      </div>}
    </div>}
  </div>;
}

// ═══════════════════════════════════════
// TOOL REGISTRY
// ═══════════════════════════════════════
const TOOLS = [
  { id: "humanizer", name: "AI Text Humanizer", desc: "Make AI text sound naturally human", color: "#E8593C", tag: "AI", ai: true },
  { id: "detector", name: "AI Content Detector", desc: "Check if text was AI-generated", color: "#4A90D9", tag: "AI", ai: true },
  { id: "wordcount", name: "Word Counter", desc: "Words, characters, readability score", color: "#27AE60", tag: "FREE" },
  { id: "caseconv", name: "Case Converter", desc: "UPPER, lower, Title, Sentence case", color: "#8E44AD", tag: "FREE" },
  { id: "password", name: "Password Generator", desc: "Secure passwords with strength meter", color: "#E67E22", tag: "FREE" },
  { id: "lorem", name: "Lorem Ipsum Generator", desc: "Placeholder text for any project", color: "#16A085", tag: "FREE" },
  { id: "json", name: "JSON Formatter", desc: "Beautify or minify JSON instantly", color: "#2C3E50", tag: "FREE" },
  { id: "slug", name: "URL Slug Generator", desc: "Convert text to clean URL slugs", color: "#C0392B", tag: "FREE" },
];

const COMING = [
  { name: "AI Email Writer", desc: "Professional emails in seconds" },
  { name: "AI Prompt Generator", desc: "Optimized prompts for any AI" },
  { name: "Invoice Generator", desc: "Free PDF invoices, no signup" },
  { name: "Markdown Previewer", desc: "Write and preview markdown live" },
  { name: "Color Picker", desc: "Pick colors and get HEX/RGB codes" },
  { name: "Regex Tester", desc: "Test regular expressions live" },
];

const TC = { humanizer: HumanizerTool, detector: DetectorTool, wordcount: WordCounterTool, caseconv: CaseConverterTool, password: PasswordGenTool, lorem: LoremTool, json: JsonTool, slug: SlugTool };

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [active, setActive] = useState(null);

  if (active) {
    const tool = TOOLS.find(t => t.id === active);
    const Comp = TC[active];
    return <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setActive(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 0, color: "#888" }}>{"\u2190"}</button>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: tool.color, textTransform: "uppercase", letterSpacing: "1px" }}>{tool.ai ? "AI Tool" : "Free Tool"}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a" }}>{tool.name}</div>
        </div>
      </div>
      <Comp />
      <div style={{ marginTop: 36, padding: "16px 0", borderTop: "1px solid #eee", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#bbb", marginBottom: 10 }}>ToolsForge</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {TOOLS.filter(t => t.id !== active).slice(0, 4).map(t => <button key={t.id} onClick={() => setActive(t.id)} style={{ padding: "5px 12px", background: "#f5f5f3", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600, color: "#555" }}>{t.name} {"\u2192"}</button>)}
        </div>
      </div>
    </div>;
  }

  return <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
    <div style={{ textAlign: "center", marginBottom: 36 }}>
      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>
        <span style={{ color: "#1a1a1a" }}>Tools</span><span style={{ color: "#E8593C" }}>Forge</span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1a1a1a", lineHeight: 1.2, margin: "0 0 8px" }}>Free AI-Powered Tools</h1>
      <p style={{ fontSize: 15, color: "#888", margin: 0 }}>No signup. No BS. Just tools that work.</p>
    </div>

    <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>AI-Powered Tools</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
      {TOOLS.filter(t => t.ai).map(tool => <button key={tool.id} onClick={() => setActive(tool.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "#fff", border: "1.5px solid #e8e8e4", borderRadius: 12, cursor: "pointer", textAlign: "left" }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: tool.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: tool.color, fontWeight: 700 }}>{tool.ai ? "AI" : tool.id[0].toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{tool.name}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>{tool.desc}</div>
        </div>
        <span style={{ padding: "3px 8px", background: tool.color + "14", color: tool.color, borderRadius: 20, fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{tool.tag}</span>
      </button>)}
    </div>

    <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Free Tools (unlimited)</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 36 }}>
      {TOOLS.filter(t => !t.ai).map(tool => <button key={tool.id} onClick={() => setActive(tool.id)} style={{ padding: "16px", background: "#fff", border: "1.5px solid #e8e8e4", borderRadius: 12, cursor: "pointer", textAlign: "left" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{tool.name}</div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{tool.desc}</div>
        <span style={{ display: "inline-block", marginTop: 8, padding: "2px 8px", background: "#E8F5E9", borderRadius: 10, fontSize: 10, fontWeight: 700, color: "#27AE60" }}>FREE</span>
      </button>)}
    </div>

    <div style={{ marginBottom: 36 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Coming soon</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
        {COMING.map((t, i) => <div key={i} style={{ padding: 14, background: "#fafaf8", borderRadius: 10, border: "1px dashed #ddd", opacity: 0.7 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{t.name}</div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{t.desc}</div>
        </div>)}
      </div>
    </div>

    <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid #eee" }}>
      <div style={{ fontSize: 11, color: "#ccc" }}>ToolsForge {"\u2014"} Free AI tools for writers, students and professionals. No signup required.</div>
    </div>
  </div>;
}
