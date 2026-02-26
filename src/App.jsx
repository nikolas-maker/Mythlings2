import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// STRIPE PAYMENT LINKS
// ═══════════════════════════════════════════════════════════════
const STRIPE = {
  single: "https://buy.stripe.com/test_aFa28qbg8c6Z3Lva9kfrW00",
  club: "https://buy.stripe.com/test_9B6aEW0Bu3At0zj6X8frW01",
  print: "https://buy.stripe.com/test_28EfZg3NG1sl4PzbdofrW02",
};

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════
const ADVENTURES = [
  { id: "dragon", emoji: "🐉", title: "Dragon Rescue", desc: "Save a baby dragon from a storm", color: "#e8453c", scene: "a magical kingdom with castles perched on misty mountains" },
  { id: "space", emoji: "🚀", title: "Space Explorer", desc: "Discover a new planet far away", color: "#4a5abf", scene: "outer space among swirling nebulas, glittering stars, and strange new planets" },
  { id: "ocean", emoji: "🧜", title: "Ocean Kingdom", desc: "Befriend mermaids under the sea", color: "#1a8a82", scene: "a hidden underwater kingdom of coral castles and luminous sea creatures" },
  { id: "forest", emoji: "🦊", title: "Enchanted Forest", desc: "Help woodland creatures find home", color: "#c47d1c", scene: "a magical enchanted forest where the trees whisper and animals talk" },
  { id: "pirate", emoji: "🏴‍☠️", title: "Pirate Treasure", desc: "Sail the seas for hidden gold", color: "#7c4daf", scene: "the sparkling high seas with creaking pirate ships and mysterious treasure islands" },
  { id: "dino", emoji: "🦕", title: "Dino World", desc: "Travel back to the age of dinosaurs", color: "#3a8a3a", scene: "a lush prehistoric world teeming with friendly, towering dinosaurs" },
];

const TRAITS = ["Brave", "Kind", "Funny", "Smart", "Creative", "Strong", "Curious", "Gentle"];

const PALETTES = {
  dragon: { bgs: ["linear-gradient(160deg,#ffecd2 0%,#fcb69f 50%,#d4956a 100%)","linear-gradient(160deg,#c9a0dc 0%,#f6ceec 50%,#f9e4c8 100%)","linear-gradient(160deg,#f9d29d 0%,#ee8572 50%,#c96b8b 100%)","linear-gradient(160deg,#fbc7a4 0%,#f0836d 50%,#d35d6e 100%)","linear-gradient(160deg,#f7d794 0%,#f19066 50%,#e55d4a 100%)"], emojis: ["🏰","🐉","⚔️","🌋","👑"], textDark: true },
  space: { bgs: ["linear-gradient(160deg,#0b0d2e 0%,#1b1d52 50%,#2e1a6b 100%)","linear-gradient(160deg,#0e1428 0%,#1e3650 50%,#0b0d2e 100%)","linear-gradient(160deg,#100a2a 0%,#2c2660 50%,#22213e 100%)","linear-gradient(160deg,#1a0530 0%,#381c6e 50%,#c76878 100%)","linear-gradient(160deg,#0b0d2e 0%,#1c3a6e 50%,#284e92 100%)"], emojis: ["🌍","🚀","⭐","🪐","🌌"], textDark: false },
  ocean: { bgs: ["linear-gradient(160deg,#88f2f8 0%,#5ea0f8 50%,#2a6a9a 100%)","linear-gradient(160deg,#44c0ea 0%,#6a82d0 50%,#324a84 100%)","linear-gradient(160deg,#a2e8e4 0%,#f8d0dd 50%,#88f2f8 100%)","linear-gradient(160deg,#3ee578 0%,#34f4d0 50%,#5ea0f8 100%)","linear-gradient(160deg,#88f2f8 0%,#44c0ea 50%,#1c3a6e 100%)"], emojis: ["🐠","🧜","🐚","🦑","🏝️"], textDark: true },
  forest: { bgs: ["linear-gradient(160deg,#d0f67a 0%,#90e09a 50%,#36783e 100%)","linear-gradient(160deg,#f8eacc 0%,#d0f67a 50%,#90e09a 100%)","linear-gradient(160deg,#f0a818 0%,#ec2412 20%,#d0f67a 100%)","linear-gradient(160deg,#90e09a 0%,#36783e 50%,#183e2e 100%)","linear-gradient(160deg,#f8eacc 0%,#f0a818 50%,#d0f67a 100%)"], emojis: ["🦊","🌳","🦉","🍄","🦋"], textDark: true },
  pirate: { bgs: ["linear-gradient(160deg,#f8eacc 0%,#84cbea 50%,#2a6a9a 100%)","linear-gradient(160deg,#f89698 0%,#f4cabe 50%,#f8eacc 100%)","linear-gradient(160deg,#9c88cc 0%,#84cbea 50%,#f8eacc 100%)","linear-gradient(160deg,#2a6a9a 0%,#1c3a6e 50%,#0b0d2e 100%)","linear-gradient(160deg,#f0a818 0%,#f8eacc 50%,#84cbea 100%)"], emojis: ["🏴‍☠️","⛵","🗺️","💎","🦜"], textDark: true },
  dino: { bgs: ["linear-gradient(160deg,#d0f67a 0%,#90e09a 50%,#f8eacc 100%)","linear-gradient(160deg,#f0a818 0%,#d0f67a 50%,#90e09a 100%)","linear-gradient(160deg,#f8eacc 0%,#f6b098 50%,#d0f67a 100%)","linear-gradient(160deg,#90e09a 0%,#d0f67a 50%,#f0a818 100%)","linear-gradient(160deg,#d0f67a 0%,#f8eacc 50%,#f89698 100%)"], emojis: ["🦕","🌿","🦖","🥚","🌋"], textDark: true },
};

const REVIEWS = [
  { name: "Jessica M.", text: "My daughter SOBBED with joy seeing herself as the dragon hero. We've ordered 4 more as birthday gifts.", stars: 5, kid: "Emma, 5" },
  { name: "Marcus T.", text: "My son brings his book to school every day. His teacher asked where we got it — now half the class has one.", stars: 5, kid: "Jayden, 7" },
  { name: "Sarah K.", text: "Ordered one for my niece's birthday. Her mom texted me crying. Best gift I've ever given anyone.", stars: 5, kid: "Lily, 4" },
  { name: "David R.", text: "We do a new story every month. It's our Sunday tradition now. My kids fight over who picks the adventure.", stars: 5, kid: "Noah & Ava, 6 & 4" },
];

// ═══════════════════════════════════════════════════════════════
// AI STORY GENERATION — calls secure server-side API
// ═══════════════════════════════════════════════════════════════
async function generateStoryAI(name, adventure, trait) {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, adventure: { title: adventure.title, scene: adventure.scene }, trait }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function fallbackStory(name, adventure, trait) {
  const t = trait.toLowerCase();
  return {
    title: adventure.title,
    pages: [
      `Once upon a time, in ${adventure.scene}, there lived the most ${t} child anyone had ever known. Their name was ${name}, and when ${name} smiled, even the clouds seemed to part.`,
      `One extraordinary morning, ${name} discovered something that made their heart leap — a shimmering path that hadn't been there before, leading straight into ${adventure.scene}. "Only someone truly ${t} may enter," whispered a voice like wind chimes. ${name} took a deep breath and stepped forward.`,
      `Deeper into the adventure ${name} went, meeting the most wondrous creatures along the way. Each one could sense the ${t} spirit inside ${name}, and soon a whole band of loyal friends had joined the quest. Together they laughed, they explored, and they discovered wonders beyond imagining.`,
      `Then came the greatest challenge of all — one that made everyone tremble and look away. But not ${name}. With ${t} determination shining like a golden light, ${name} stepped forward. In a flash of brilliant magic, the challenge was overcome, and cheers erupted from every corner of the land!`,
      `From that day on, songs were sung about ${name} the ${trait} — the young hero who proved that the greatest power in all the world lives inside a ${t} heart. And every night before bed, ${name} would look at the stars and smile, knowing the next adventure was just a dream away. The End. ✨`,
    ],
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function Mythlings() {
  const [view, setView] = useState("home");
  const [scrollY, setScrollY] = useState(0);
  const [story, setStory] = useState(null);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const nav = useCallback((v, data) => {
    if (data) setStory(data);
    setView(v);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{CSS}</style>
      <TopNav scrollY={scrollY} view={view} nav={nav} />
      {view === "home" && <Home nav={nav} />}
      {view === "create" && <Create nav={nav} />}
      {view === "read" && story && <Read nav={nav} story={story} />}
      {view === "pricing" && <Pricing nav={nav} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════
function TopNav({ scrollY, view, nav }) {
  const solid = scrollY > 50;
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{ ...S.nav, background: solid ? "rgba(253,248,240,.96)" : "transparent", backdropFilter: solid ? "blur(14px)" : "none", boxShadow: solid ? "0 1px 18px rgba(0,0,0,.05)" : "none" }}>
      <div style={S.navInner}>
        <div onClick={() => nav("home")} style={S.logo}>
          <span style={{ fontSize: "1.3rem" }}>✨</span>
          <span style={S.logoText}>Mythlings</span>
        </div>
        {/* Desktop nav */}
        <div style={S.navLinks} className="desktop-nav">
          {[["Home","home"],["Pricing","pricing"]].map(([l,v]) => (
            <span key={v} onClick={() => nav(v)} style={{ ...S.navLink, color: view===v ? "#6b3fa0" : "#8b7d6b" }}>{l}</span>
          ))}
          <button onClick={() => nav("create")} style={S.navCta}>Make a Book ✨</button>
        </div>
        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ display: "none", background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", padding: "4px" }}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-dropdown" style={{ display: "none", padding: "12px 20px", background: "rgba(253,248,240,.98)", borderTop: "1px solid #e8e0d4" }}>
          {[["Home","home"],["Pricing","pricing"],["Make a Book","create"]].map(([l,v]) => (
            <div key={v} onClick={() => { nav(v); setMenuOpen(false); }} style={{ padding: "10px 0", fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: ".9rem", color: "#6b3fa0", cursor: "pointer" }}>{l}</div>
          ))}
        </div>
      )}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════════
function Home({ nav }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVis(true)); }, []);

  return (<>
    {/* HERO */}
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 0 50px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 28% 18%,rgba(255,195,110,.11) 0%,transparent 55%),radial-gradient(ellipse at 78% 78%,rgba(160,110,255,.06) 0%,transparent 50%)", pointerEvents: "none" }} />
      {Array.from({length:10},(_,i)=>i).map(i => (
        <div key={i} style={{ position:"absolute", left:`${5+Math.random()*90}%`, top:`${5+Math.random()*90}%`, width:4+Math.random()*7, height:4+Math.random()*7, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,200,60,.65),transparent)", animation:`twinkle ${2+Math.random()*3}s ease-in-out ${Math.random()*3}s infinite`, pointerEvents:"none" }} />
      ))}
      <div className="hero-grid" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 44, alignItems: "center" }}>
        <div style={{ opacity:vis?1:0, transform:vis?"none":"translateY(26px)", transition:"all .85s cubic-bezier(.16,1,.3,1)" }}>
          <Pill>🌟 Over 50,000 stories created</Pill>
          <h1 style={S.heroH1}>Turn your child into the <span style={{ color:"#6b3fa0", fontStyle:"italic" }}>hero</span> of their own storybook</h1>
          <p style={S.heroP}>Enter their name, pick an adventure, and AI writes a beautiful personalized story in seconds. The gift kids never forget.</p>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <Btn onClick={()=>nav("create")} primary big>Create a Free Story ✨</Btn>
            <Btn onClick={()=>nav("pricing")} big>See Pricing</Btn>
          </div>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:".78rem", color:"#b5a898", marginTop:11 }}>First story free · No account needed · 30 seconds</p>
        </div>
        <div className="hero-mockup" style={{ opacity:vis?1:0, transform:vis?"none":"translateY(34px)", transition:"all .85s cubic-bezier(.16,1,.3,1) .12s", display:"flex", justifyContent:"center" }}>
          <BookMockup />
        </div>
      </div>
    </section>

    {/* HOW IT WORKS */}
    <Section bg="linear-gradient(180deg,#fdf8f0,#f5efe4)">
      <Tag>How It Works</Tag>
      <SectionH2>Three steps to <I>magic</I></SectionH2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:18, marginTop:36 }}>
        {[
          {i:"📝",t:"Enter Their Name",d:"Type your child's name and choose a character trait. That's all we need."},
          {i:"🗺️",t:"Pick an Adventure",d:"Dragon rescue? Space mission? Choose from 6+ magical storylines."},
          {i:"📖",t:"Read & Share",d:"Your personalized story is ready in seconds. Read, download, or order a printed hardcover."},
        ].map((s,i)=>(
          <Card key={i} style={{textAlign:"center",padding:"28px 22px"}}>
            <div style={{fontSize:"1.8rem",marginBottom:12}}>{s.i}</div>
            <h3 style={S.cardTitle}>{s.t}</h3>
            <p style={S.cardDesc}>{s.d}</p>
          </Card>
        ))}
      </div>
    </Section>

    {/* ADVENTURES */}
    <Section>
      <Tag>Adventures</Tag>
      <SectionH2>Choose from magical worlds</SectionH2>
      <p style={{...S.cardDesc, marginBottom:36, textAlign:"center"}}>New adventures added monthly. Each is a unique 5-page illustrated story.</p>
      <div className="adventures-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))", gap:12 }}>
        {ADVENTURES.map(a=>(
          <Card key={a.id} hoverable onClick={()=>nav("create")} style={{textAlign:"center",padding:"22px 14px",cursor:"pointer"}}>
            <div style={{fontSize:"1.9rem",marginBottom:6}}>{a.emoji}</div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontSize:".9rem",fontWeight:700,color:a.color}}>{a.title}</h3>
            <p style={{fontFamily:"'Nunito',sans-serif",fontSize:".74rem",color:"#8b7d6b",marginTop:4}}>{a.desc}</p>
          </Card>
        ))}
      </div>
    </Section>

    {/* REVIEWS */}
    <Section bg="#f5efe4">
      <Tag>Parents Love It</Tag>
      <SectionH2>The gift that makes <span style={{color:"#e8453c",fontStyle:"italic"}}>everyone</span> cry</SectionH2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14, marginTop:36 }}>
        {REVIEWS.map((r,i)=>(
          <Card key={i} style={{textAlign:"left",padding:"22px"}}>
            <div style={{color:"#f0c13b",fontSize:".82rem",marginBottom:6}}>{"★★★★★"}</div>
            <p style={{fontFamily:"'Nunito',sans-serif",fontSize:".86rem",color:"#4a3f32",lineHeight:1.6,marginBottom:10}}>"{r.text}"</p>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:".8rem"}}>{r.name}</span>
              <span style={{fontFamily:"'Nunito',sans-serif",fontSize:".74rem",color:"#6b3fa0"}}>{r.kid}</span>
            </div>
          </Card>
        ))}
      </div>
    </Section>

    {/* PRICING */}
    <Section>
      <Tag>Pricing</Tag>
      <SectionH2>Less than a trip to the bookstore</SectionH2>
      <p style={{...S.cardDesc,textAlign:"center",marginBottom:36}}>First story is completely free.</p>
      <PricingCards />
    </Section>

    {/* FINAL CTA */}
    <section style={{padding:"72px 0",textAlign:"center",position:"relative"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,rgba(107,63,160,.04),transparent 65%)",pointerEvents:"none"}} />
      <div style={{maxWidth:520,margin:"0 auto",padding:"0 20px",position:"relative"}}>
        <div style={{fontSize:"2.4rem",marginBottom:12}}>📖✨</div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:"clamp(1.6rem,3.6vw,2.5rem)",fontWeight:800,marginBottom:10}}>Every child deserves to be the hero</h2>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:"1.02rem",color:"#7a6e5d",marginBottom:26}}>Create their first story in 30 seconds. It's free.</p>
        <Btn onClick={()=>nav("create")} primary big>Create a Free Story →</Btn>
      </div>
    </section>

    <footer style={{padding:"26px 0",borderTop:"1px solid #e8e0d4",textAlign:"center",fontFamily:"'Nunito',sans-serif",fontSize:".78rem",color:"#b5a898"}}>© 2026 Mythlings · <a href="https://mythlings.co" style={{color:"#b5a898",textDecoration:"none"}}>mythlings.co</a> · Privacy · Terms</footer>
  </>);
}

function BookMockup() {
  return (
    <div style={{width:290,maxWidth:"100%",background:"#fff",borderRadius:16,padding:18,boxShadow:"0 18px 45px rgba(107,63,160,.11)",transform:"rotate(-2deg)",animation:"float 6s ease-in-out infinite"}}>
      <div style={{width:"100%",aspectRatio:"4/3",borderRadius:11,background:"linear-gradient(135deg,#ffecd2,#fcb69f 50%,#a18cd1)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",marginBottom:12}}>
        <span style={{fontSize:"3.2rem",filter:"drop-shadow(0 4px 8px rgba(0,0,0,.1))"}}>🐉</span>
        <span style={{position:"absolute",bottom:9,left:12,fontFamily:"'Fraunces',serif",fontSize:".76rem",fontWeight:700,color:"#fff",textShadow:"0 2px 6px rgba(0,0,0,.3)"}}>Chapter 1: The Discovery</span>
      </div>
      <p style={{fontFamily:"'Fraunces',serif",fontSize:".84rem",lineHeight:1.6,color:"#3d3425",fontStyle:"italic"}}>"Once upon a time, there lived a brave little girl named <strong style={{color:"#6b3fa0"}}>Emma</strong> who found a baby dragon hiding in a hollow oak tree..."</p>
      <div style={{marginTop:8,display:"flex",justifyContent:"space-between"}}>
        <span style={{fontFamily:"'Nunito',sans-serif",fontSize:".68rem",color:"#b5a898"}}>Page 1 of 5</span>
        <span style={{fontFamily:"'Nunito',sans-serif",fontSize:".68rem",color:"#6b3fa0",fontWeight:700}}>📖 Mythlings</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CREATE STORY
// ═══════════════════════════════════════════════════════════════
function Create({ nav }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [adv, setAdv] = useState(null);
  const [trait, setTrait] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pct, setPct] = useState(0);

  const go = async () => {
    setLoading(true);
    setPct(0);
    const iv = setInterval(() => setPct(p => Math.min(p + Math.random() * 12, 92)), 350);
    const result = await generateStoryAI(name, adv, trait);
    clearInterval(iv);
    setPct(100);
    const final = result && result.pages?.length === 5 ? result : fallbackStory(name, adv, trait);
    setTimeout(() => {
      nav("read", { name, adventure: adv, trait, title: final.title || adv.title, pages: final.pages });
    }, 600);
  };

  if (loading) {
    return (
      <PageWrap>
        <div style={{ textAlign: "center", padding: "70px 0", animation: "fadeUp .5s ease" }}>
          <div style={{ fontSize: "3rem", marginBottom: 14, animation: "float 2s ease-in-out infinite" }}>✨📖✨</div>
          <h2 style={{ ...S.cardTitle, fontSize: "1.4rem", marginBottom: 6 }}>Writing {name}'s story...</h2>
          <p style={S.cardDesc}>{pct < 25 ? "Dreaming up the perfect opening..." : pct < 50 ? "Our AI author is choosing every word..." : pct < 75 ? "Painting the scenes with magic..." : pct < 95 ? "Adding the finishing sparkles..." : "Almost ready!"}</p>
          <div style={{ width: 220, height: 5, background: "#e0d8cc", borderRadius: 3, margin: "22px auto 0", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#6b3fa0,#e8453c)", borderRadius: 3, transition: "width .3s" }} />
          </div>
        </div>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <button onClick={() => step === 1 ? nav("home") : setStep(step - 1)} style={S.backBtn}>← Back</button>
      <div style={{ display: "flex", gap: 5, marginBottom: 28 }}>
        {[1,2,3].map(s => <div key={s} style={{ flex:1, height:4, borderRadius:2, background: step >= s ? "linear-gradient(90deg,#6b3fa0,#e8453c)" : "#e0d8cc", transition:"all .4s" }} />)}
      </div>

      {step === 1 && (
        <div style={{ animation: "fadeUp .35s ease" }}>
          <Tag>Step 1 of 3</Tag>
          <h2 style={{ ...S.cardTitle, fontSize: "1.6rem", marginBottom: 4 }}>Who's the hero?</h2>
          <p style={{ ...S.cardDesc, marginBottom: 22 }}>Enter the child's name — they'll star on every page</p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter child's name..." onKeyDown={e => e.key === "Enter" && name.trim() && setStep(2)} style={S.input} autoFocus />
          <Btn onClick={() => name.trim() && setStep(2)} primary disabled={!name.trim()} style={{ marginTop: 18 }}>Next → Pick Adventure</Btn>
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: "fadeUp .35s ease" }}>
          <Tag>Step 2 of 3</Tag>
          <h2 style={{ ...S.cardTitle, fontSize: "1.6rem", marginBottom: 4 }}>Pick {name}'s adventure</h2>
          <p style={{ ...S.cardDesc, marginBottom: 22 }}>What kind of world will they explore?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 9 }}>
            {ADVENTURES.map(a => (
              <div key={a.id} onClick={() => setAdv(a)} style={{ padding: "18px 12px", background: adv?.id === a.id ? `${a.color}10` : "#fff", border: `2px solid ${adv?.id === a.id ? a.color : "#e8e0d4"}`, borderRadius: 13, textAlign: "center", cursor: "pointer", transition: "all .2s" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{a.emoji}</div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: ".82rem", fontWeight: 700, color: adv?.id === a.id ? a.color : "#4a3f32" }}>{a.title}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
            <Btn onClick={() => setStep(1)}>← Back</Btn>
            <Btn onClick={() => adv && setStep(3)} primary disabled={!adv}>Next → Pick Trait</Btn>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ animation: "fadeUp .35s ease" }}>
          <Tag>Step 3 of 3</Tag>
          <h2 style={{ ...S.cardTitle, fontSize: "1.6rem", marginBottom: 4 }}>What makes {name} special?</h2>
          <p style={{ ...S.cardDesc, marginBottom: 22 }}>This trait shapes the entire story</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {TRAITS.map(t => (
              <button key={t} onClick={() => setTrait(t)} style={{ padding: "8px 18px", borderRadius: 100, border: `2px solid ${trait===t?"#6b3fa0":"#e0d8cc"}`, background: trait===t?"rgba(107,63,160,.07)":"#fff", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:".86rem", color:trait===t?"#6b3fa0":"#5a4f40", cursor:"pointer", transition:"all .2s" }}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 9, marginTop: 22 }}>
            <Btn onClick={() => setStep(2)}>← Back</Btn>
            <Btn onClick={go} primary big disabled={!trait}>✨ Create {name}'s Story</Btn>
          </div>
        </div>
      )}
    </PageWrap>
  );
}

// ═══════════════════════════════════════════════════════════════
// READ STORY
// ═══════════════════════════════════════════════════════════════
function Read({ nav, story }) {
  const [pg, setPg] = useState(0);
  const { name, adventure, trait, title, pages } = story;
  const pal = PALETTES[adventure?.id] || PALETTES.dragon;
  const total = pages.length;
  const txtCol = pal.textDark ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.45)";

  const share = () => {
    const msg = `I just made a personalized storybook for ${name} with Mythlings! ✨📖 Check it out at mythlings.co`;
    if (navigator.share) {
      navigator.share({ title: `${name}'s Story — Mythlings`, text: msg, url: "https://mythlings.co" }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(msg);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div style={{ paddingTop: 68, minHeight: "100vh", background: "#f5efe4" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "26px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <button onClick={() => nav("create")} style={S.backBtn}>← New story</button>
          <Pill>✨ AI-generated</Pill>
        </div>

        <div key={pg} style={{ background: "#fff", borderRadius: 20, boxShadow: "0 10px 40px rgba(107,63,160,.09)", overflow: "hidden", animation: "pageIn .35s ease" }}>
          <div style={{ aspectRatio: "16/7.5", background: pal.bgs[pg % pal.bgs.length], display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, opacity: .1, background: "radial-gradient(circle at 20% 75%,white,transparent 40%),radial-gradient(circle at 80% 25%,white,transparent 30%)" }} />
            <span style={{ fontSize: "4.5rem", filter: "drop-shadow(0 6px 18px rgba(0,0,0,.12))", animation: "float 4s ease-in-out infinite", zIndex: 2, position: "relative" }}>{pal.emojis[pg % pal.emojis.length]}</span>
            {[...Array(3)].map((_, i) => (
              <span key={i} style={{ position: "absolute", fontSize: "1rem", left: `${18+i*28}%`, top: `${22+(i%2)*48}%`, opacity: .4, color: txtCol, animation: `float ${3+i}s ease-in-out ${i*.4}s infinite` }}>{"✦·✧"[i]}</span>
            ))}
            <span style={{ position: "absolute", top: 14, left: 18, fontFamily: "'Fraunces',serif", fontSize: ".74rem", fontWeight: 700, color: txtCol }}>
              {pg === 0 ? `${name} and the ${title}` : `Chapter ${pg + 1}`}
            </span>
            <span style={{ position: "absolute", bottom: 12, right: 18, fontFamily: "'Nunito',sans-serif", fontSize: ".7rem", fontWeight: 700, color: txtCol, background: pal.textDark ? "rgba(255,255,255,.4)" : "rgba(0,0,0,.18)", padding: "2px 10px", borderRadius: 100 }}>
              {pg + 1} / {total}
            </span>
          </div>

          <div style={{ padding: "28px 32px 22px" }}>
            <p style={{ fontFamily: "'Fraunces',serif", fontSize: "1.08rem", lineHeight: 1.78, color: "#3d3425" }}>{pages[pg]}</p>
          </div>

          <div style={{ padding: "0 32px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setPg(Math.max(0, pg-1))} disabled={pg===0} style={{ ...S.pageBtn, opacity: pg===0?.4:1, cursor: pg===0?"default":"pointer" }}>← Prev</button>
            <div style={{ display: "flex", gap: 5 }}>
              {pages.map((_, i) => (
                <button key={i} onClick={() => setPg(i)} style={{ width: 7, height: 7, borderRadius: "50%", border: "none", background: i===pg ? "#6b3fa0" : "#d4ccc0", cursor: "pointer", padding: 0 }} />
              ))}
            </div>
            <button onClick={() => setPg(Math.min(total-1, pg+1))} disabled={pg===total-1} style={{ ...S.pageBtn2, opacity: pg===total-1?.4:1, cursor: pg===total-1?"default":"pointer" }}>Next →</button>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={STRIPE.single} target="_blank" rel="noopener noreferrer" style={S.actionPrimary}>Download Full PDF — $9.99 📥</a>
          <a href={STRIPE.print} target="_blank" rel="noopener noreferrer" style={S.actionSecondary}>Order Printed Book — $29.99 📖</a>
        </div>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button onClick={share} style={{ background: "none", border: "none", fontFamily: "'Nunito',sans-serif", color: "#e8453c", fontWeight: 700, cursor: "pointer", fontSize: ".9rem" }}>Share this story 💝</button>
        </div>

        <Card style={{ marginTop: 32, textAlign: "center", padding: "26px" }}>
          <h3 style={{ ...S.cardTitle, fontSize: "1.05rem", marginBottom: 4 }}>Want unlimited stories?</h3>
          <p style={{ ...S.cardDesc, marginBottom: 14 }}>Story Club: unlimited stories + 2 free printed books/year — $14.99/mo</p>
          <a href={STRIPE.club} target="_blank" rel="noopener noreferrer" style={{ ...S.actionPrimary, display: "inline-block", background: "linear-gradient(135deg,#6b3fa0,#e8453c)", fontSize: ".86rem", padding: "10px 26px" }}>Start Free Trial ✨</a>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════
function Pricing({ nav }) {
  return (
    <div style={{ paddingTop: 78, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "46px 20px" }}>
        <button onClick={() => nav("home")} style={S.backBtn}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: 36, marginTop: 8 }}>
          <Tag>Pricing</Tag>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(1.7rem,3.4vw,2.5rem)", fontWeight: 800, marginBottom: 8 }}>Stories that cost less than a toy</h2>
          <p style={S.cardDesc}>First story free. No credit card required.</p>
        </div>
        <PricingCards />
        <Card style={{ textAlign: "center", maxWidth: 430, margin: "36px auto 0", padding: "28px" }}>
          <div style={{ fontSize: "1.7rem", marginBottom: 8 }}>🎁</div>
          <h3 style={{ ...S.cardTitle, marginBottom: 4 }}>Give the Gift of a Story</h3>
          <p style={{ ...S.cardDesc, marginBottom: 12 }}>Send a personalized storybook as a magical surprise.</p>
          <a href={STRIPE.single} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", padding: "10px 24px", background: "linear-gradient(135deg,#e8453c,#d4382e)", color: "#fff", border: "none", borderRadius: 100, fontFamily: "'Nunito',sans-serif", fontWeight: 800, cursor: "pointer", fontSize: ".86rem", textDecoration: "none" }}>Send a Gift 💝</a>
        </Card>
      </div>
    </div>
  );
}

function PricingCards() {
  const plans = [
    { name:"Single Story", price:"$9.99", per:"one-time", desc:"Perfect for a birthday gift", feats:["1 personalized 5-page story","Digital PDF download","Read-aloud audio","Shareable link"], link:STRIPE.single, cta:"Buy a Story", pop:false },
    { name:"Story Club", price:"$14.99", per:"/month", desc:"New adventures every month", feats:["Unlimited digital stories","2 free printed books/year","New adventures first","Family sharing (3 kids)","Cancel anytime"], link:STRIPE.club, cta:"Start Free Trial", pop:true },
    { name:"Printed Book", price:"$29.99", per:"per book", desc:"A hardcover keepsake", feats:["Premium hardcover","32 full-color pages","Gift-ready packaging","Ships in 5-7 days","Personalized dedication"], link:STRIPE.print, cta:"Order a Print", pop:false },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16, maxWidth:860, margin:"0 auto" }}>
      {plans.map((p,i) => (
        <div key={i} style={{ padding:"28px 22px", background: p.pop ? "linear-gradient(180deg,rgba(107,63,160,.03),#fff)" : "#fff", border: p.pop ? "2px solid #6b3fa0" : "1px solid #e8e0d4", borderRadius:16, textAlign:"left", position:"relative", boxShadow: p.pop ? "0 5px 22px rgba(107,63,160,.09)" : "0 2px 10px rgba(0,0,0,.03)" }}>
          {p.pop && <div style={{ position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",padding:"3px 12px",background:"linear-gradient(135deg,#6b3fa0,#9b59b6)",color:"#fff",fontFamily:"'Nunito',sans-serif",fontSize:".68rem",fontWeight:800,borderRadius:100,textTransform:"uppercase" }}>Most Popular</div>}
          <div style={{ fontFamily:"'Nunito',sans-serif",fontSize:".82rem",fontWeight:700,color:"#6b3fa0",marginBottom:3 }}>{p.name}</div>
          <div style={{ fontFamily:"'Fraunces',serif",fontSize:"2.1rem",fontWeight:800 }}>{p.price}<span style={{fontSize:".78rem",color:"#8b7d6b",fontFamily:"'Nunito',sans-serif",fontWeight:500}}> {p.per}</span></div>
          <p style={{ fontFamily:"'Nunito',sans-serif",fontSize:".8rem",color:"#8b7d6b",margin:"5px 0 18px" }}>{p.desc}</p>
          <ul style={{ listStyle:"none",padding:0,marginBottom:20 }}>
            {p.feats.map((f,j) => <li key={j} style={{ fontFamily:"'Nunito',sans-serif",fontSize:".83rem",color:"#5a4f40",padding:"4px 0",display:"flex",gap:7 }}><span style={{color:"#6b3fa0",fontWeight:800}}>✓</span>{f}</li>)}
          </ul>
          <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ display:"block",width:"100%",padding:"11px",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontSize:".9rem",fontWeight:800,textAlign:"center",textDecoration:"none",cursor:"pointer", background:p.pop?"linear-gradient(135deg,#6b3fa0,#9b59b6)":"transparent", color:p.pop?"#fff":"#6b3fa0", border:p.pop?"none":"2px solid rgba(107,63,160,.18)" }}>{p.cta}</a>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
function Section({ children, bg }) {
  return <section style={{ padding: "66px 0", background: bg || "transparent" }}><div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>{children}</div></section>;
}
function Tag({ children }) {
  return <div style={{ fontFamily:"'Nunito',sans-serif",fontSize:".73rem",textTransform:"uppercase",letterSpacing:".13em",fontWeight:800,color:"#6b3fa0",marginBottom:8 }}>{children}</div>;
}
function SectionH2({ children }) {
  return <h2 style={{ fontFamily:"'Fraunces',serif",fontSize:"clamp(1.6rem,3vw,2.3rem)",fontWeight:800 }}>{children}</h2>;
}
function I({ children }) {
  return <span style={{ color: "#6b3fa0", fontStyle: "italic" }}>{children}</span>;
}
function Pill({ children }) {
  return <div style={{ display:"inline-block",padding:"4px 14px",background:"rgba(107,63,160,.06)",border:"1px solid rgba(107,63,160,.1)",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontSize:".76rem",fontWeight:700,color:"#6b3fa0",marginBottom:18 }}>{children}</div>;
}
function Card({ children, style, hoverable, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => hoverable && setHov(true)} onMouseLeave={() => hoverable && setHov(false)}
      style={{ background:"#fff",borderRadius:15,boxShadow:"0 2px 10px rgba(0,0,0,.03)",border:"1px solid #ede6da",transition:"all .22s",transform:hov?"translateY(-3px)":"none", ...style }}>
      {children}
    </div>
  );
}
function Btn({ children, onClick, primary, big, disabled, style }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      padding: big ? "13px 32px" : "10px 22px",
      background: primary ? (disabled ? "#d4ccc0" : "linear-gradient(135deg,#6b3fa0,#9b59b6)") : "#fff",
      color: primary ? "#fff" : "#8b7d6b",
      border: primary ? "none" : "1px solid #e0d8cc",
      borderRadius: 100, fontFamily: "'Nunito',sans-serif", fontWeight: primary ? 800 : 700,
      fontSize: big ? ".98rem" : ".88rem", cursor: disabled ? "default" : "pointer",
      boxShadow: primary && !disabled ? "0 4px 16px rgba(107,63,160,.22)" : "none", ...style,
    }}>{children}</button>
  );
}
function PageWrap({ children }) {
  return <div style={{ paddingTop: 78, minHeight: "100vh", background: "linear-gradient(180deg,#fdf8f0,#f0e8da)" }}><div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px" }}>{children}</div></div>;
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const S = {
  root: { fontFamily:"'Georgia',serif",background:"#fdf8f0",color:"#2d2418",minHeight:"100vh",overflowX:"hidden" },
  nav: { position:"fixed",top:0,left:0,right:0,zIndex:1000,padding:"11px 0",transition:"all .3s" },
  navInner: { maxWidth:1080,margin:"0 auto",padding:"0 20px",display:"flex",justifyContent:"space-between",alignItems:"center" },
  logo: { cursor:"pointer",display:"flex",alignItems:"center",gap:7 },
  logoText: { fontFamily:"'Fraunces',serif",fontSize:"1.25rem",fontWeight:800,color:"#6b3fa0" },
  navLinks: { display:"flex",alignItems:"center",gap:22 },
  navLink: { cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:".83rem",fontWeight:700,transition:"color .2s" },
  navCta: { padding:"8px 20px",background:"linear-gradient(135deg,#6b3fa0,#e8453c)",color:"#fff",border:"none",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:".83rem",cursor:"pointer",boxShadow:"0 3px 10px rgba(107,63,160,.22)" },
  heroH1: { fontFamily:"'Fraunces',serif",fontSize:"clamp(2rem,4.5vw,3.2rem)",lineHeight:1.1,fontWeight:800,marginBottom:16 },
  heroP: { fontFamily:"'Nunito',sans-serif",fontSize:"1.05rem",color:"#7a6e5d",lineHeight:1.62,maxWidth:440,marginBottom:26 },
  cardTitle: { fontFamily:"'Fraunces',serif",fontSize:"1.02rem",fontWeight:700 },
  cardDesc: { fontFamily:"'Nunito',sans-serif",fontSize:".86rem",color:"#7a6e5d",lineHeight:1.58 },
  backBtn: { background:"none",border:"none",fontFamily:"'Nunito',sans-serif",color:"#8b7d6b",cursor:"pointer",fontSize:".86rem",marginBottom:18,padding:0 },
  input: { width:"100%",padding:"14px 18px",fontSize:"1.05rem",fontFamily:"'Nunito',sans-serif",border:"2px solid #e0d8cc",borderRadius:12,background:"#fff",color:"#2d2418",outline:"none" },
  pageBtn: { padding:"9px 18px",background:"#fff",color:"#6b3fa0",border:"1px solid rgba(107,63,160,.15)",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:".84rem" },
  pageBtn2: { padding:"9px 18px",background:"linear-gradient(135deg,#6b3fa0,#9b59b6)",color:"#fff",border:"none",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:".84rem" },
  actionPrimary: { padding:"12px 26px",background:"linear-gradient(135deg,#6b3fa0,#9b59b6)",color:"#fff",border:"none",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:800,cursor:"pointer",textDecoration:"none",fontSize:".9rem",boxShadow:"0 3px 12px rgba(107,63,160,.18)" },
  actionSecondary: { padding:"12px 26px",background:"#fff",color:"#6b3fa0",border:"2px solid rgba(107,63,160,.15)",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:700,cursor:"pointer",textDecoration:"none",fontSize:".9rem" },
};

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#fdf8f0!important}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pageIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
input:focus{outline:none;border-color:#6b3fa0!important}
button{transition:transform .15s,box-shadow .15s}
button:active{transform:scale(.98)!important}
::selection{background:rgba(107,63,160,.12)}
a{transition:transform .15s}
@media(max-width:768px){
  .hero-grid{grid-template-columns:1fr!important;text-align:center}
  .hero-mockup{order:-1}
  .desktop-nav{display:none!important}
  .mobile-menu-btn{display:block!important}
  .mobile-dropdown{display:block!important}
  .adventures-grid{grid-template-columns:repeat(2,1fr)!important}
}
`;
