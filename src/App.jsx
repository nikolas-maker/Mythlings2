import { useState, useEffect, useCallback, useRef } from "react";
import * as Tone from "tone";

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const STRIPE = {
  single: "https://buy.stripe.com/test_aFa28qbg8c6Z3Lva9kfrW00",
  club: "https://buy.stripe.com/test_9B6aEW0Bu3At0zj6X8frW01",
  print: "https://buy.stripe.com/test_28EfZg3NG1sl4PzbdofrW02",
};

const ADVENTURES = [
  { id: "dragon", emoji: "🐉", title: "Dragon Rescue", desc: "Save a baby dragon from a storm", color: "#e8453c", scene: "a magical kingdom with castles perched on misty mountains", mood: "warm" },
  { id: "space", emoji: "🚀", title: "Space Explorer", desc: "Discover a new planet far away", color: "#4a5abf", scene: "outer space among swirling nebulas, glittering stars, and strange new planets", mood: "cosmic" },
  { id: "ocean", emoji: "🧜", title: "Ocean Kingdom", desc: "Befriend mermaids under the sea", color: "#1a8a82", scene: "a hidden underwater kingdom of coral castles and luminous sea creatures", mood: "deep" },
  { id: "forest", emoji: "🦊", title: "Enchanted Forest", desc: "Help woodland creatures find home", color: "#c47d1c", scene: "a magical enchanted forest where the trees whisper and animals talk", mood: "earthy" },
  { id: "pirate", emoji: "🏴‍☠️", title: "Pirate Treasure", desc: "Sail the seas for hidden gold", color: "#7c4daf", scene: "the sparkling high seas with creaking pirate ships and mysterious treasure islands", mood: "adventure" },
  { id: "dino", emoji: "🦕", title: "Dino World", desc: "Travel back to the age of dinosaurs", color: "#3a8a3a", scene: "a lush prehistoric world teeming with friendly, towering dinosaurs", mood: "primal" },
];

const TRAITS = ["Brave", "Kind", "Funny", "Smart", "Creative", "Strong", "Curious", "Gentle"];

// Scene prompts for each adventure page
const SCENE_PROMPTS = {
  dragon: [
    "a breathtaking magical kingdom at sunset, golden castles on misty mountain peaks, warm orange sky, children's storybook illustration style, whimsical, detailed, beautiful lighting",
    "inside a glowing crystal cave, a tiny baby dragon with big eyes sitting by a campfire, magical purple crystals, cozy warm light, children's book watercolor style",
    "a grand stone bridge over a sparkling river in a fantasy valley, mountains in background, golden hour light, lush green landscape, storybook illustration",
    "a magnificent friendly dragon breathing colorful sparkles in a grand throne room, treasure and gems scattered around, warm golden light, children's book style",
    "a grand celebration in a magical kingdom, fireworks in the sky, a castle with banners, joyful crowd, golden sunset, confetti, children's storybook style",
  ],
  space: [
    "a child's bedroom window looking out at a magnificent starry cosmos, a glowing planet in the distance, magical space scene, children's illustration style",
    "inside a colorful cartoon spaceship cockpit with blinking buttons and stars visible through windows, vibrant colors, children's book illustration",
    "a stunning alien planet surface with glowing crystal formations, two moons in the sky, friendly glowing creatures, children's storybook watercolor",
    "an epic but friendly space scene with a glowing protective shield around a spaceship, colorful nebula, stars, children's book illustration style",
    "a beautiful view of Earth from space with a returning spaceship, sunrise over the planet, warm glow, triumphant feeling, children's storybook style",
  ],
  ocean: [
    "a beautiful tropical beach with crystal clear turquoise water, a wooden boat on shore, sunset sky, magical golden light, children's storybook illustration",
    "a stunning underwater coral kingdom with glowing coral castles, colorful fish, a beautiful mermaid with a crown, magical blue light, children's book style",
    "a magnificent underwater throne room made of pearls and coral, bioluminescent jellyfish floating, sea treasure, children's storybook watercolor style",
    "an exciting underwater whirlpool scene with friendly seahorses, glowing currents, dramatic but safe feeling, children's book illustration",
    "breaking the ocean surface into golden sunlight, rainbow arching over the sea, dolphins jumping, magical celebration, children's storybook style",
  ],
  forest: [
    "a magical enchanted forest path with towering ancient trees, golden sunlight filtering through leaves, glowing mushrooms, fireflies, children's book illustration",
    "a cozy circle of magical mushrooms in a moonlit forest clearing, a cute fox with big eyes, fireflies everywhere, children's storybook watercolor style",
    "inside a magnificent hollow tree home with tiny doors and windows, a wise owl on a branch, warm candlelight, children's book illustration",
    "a dark enchanted forest with the hero holding a glowing lantern, mysterious but safe, friendly eyes in the darkness, children's storybook style",
    "a sunlit forest clearing celebration with all woodland animals gathered, flowers blooming, golden light, butterflies, children's storybook illustration",
  ],
  pirate: [
    "a bustling pirate dock at golden hour with a magnificent wooden ship, seagulls, warm sunset, adventure feeling, children's storybook illustration",
    "a pirate ship sailing on sparkling turquoise seas, dolphins jumping alongside, puffy clouds, vibrant colors, children's book watercolor style",
    "a tropical island with palm trees and a mysterious cave entrance, treasure map floating, golden sand beach, children's storybook illustration",
    "inside a magical pirate cave with an overflowing treasure chest, golden light spilling out, gems and coins, children's book illustration style",
    "a pirate ship celebration at sunset with colorful flags and banners, the crew cheering, orange and purple sky, children's storybook style",
  ],
  dino: [
    "a lush prehistoric landscape with giant ferns and a smoking volcano in the distance, warm light, dinosaur eggs in a nest, children's storybook illustration",
    "a friendly long-neck brontosaurus in a jungle river surrounded by tropical plants, butterflies, warm golden light, children's book watercolor style",
    "a cute baby t-rex playing with other baby dinosaurs in a cozy nest, protective mother dinosaur nearby, warm sunset, children's storybook illustration",
    "an erupting volcano in the background with dinosaurs running through a lush valley, dramatic sky, exciting but safe feeling, children's book style",
    "a peaceful prehistoric valley at golden hour with all types of friendly dinosaurs gathered together, paradise feeling, children's storybook illustration",
  ],
};

// ═══════════════════════════════════════════════════════════════
// API CALLS
// ═══════════════════════════════════════════════════════════════
async function generateStoryText(name, adventure, trait) {
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

async function generateImage(prompt) {
  try {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "illustration", prompt }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

async function generateCartoon(photoDataUrl) {
  try {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cartoon", photo: photoDataUrl }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
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
      `One extraordinary morning, ${name} discovered something that made their heart leap — a shimmering path that hadn't been there before. "Only someone truly ${t} may enter," whispered a voice like wind chimes. ${name} took a deep breath and stepped forward.`,
      `Deeper into the adventure ${name} went, meeting the most wondrous creatures along the way. Each one could sense the ${t} spirit inside ${name}, and soon a whole band of loyal friends had joined the quest.`,
      `Then came the greatest challenge of all — one that made everyone tremble. But not ${name}. With ${t} determination shining like golden light, ${name} stepped forward. In a flash of magic, the challenge was overcome!`,
      `From that day on, songs were sung about ${name} the ${trait} — the young hero who proved that the greatest power lives inside a ${t} heart. The End. ✦`,
    ],
  };
}

// ═══════════════════════════════════════════════════════════════
// AMBIENT SOUND
// ═══════════════════════════════════════════════════════════════
function useSound() {
  const on = useRef(false);
  const start = useCallback(async () => { if (!on.current) { try { await Tone.start(); on.current = true; } catch {} } }, []);
  const pageTurn = useCallback(() => { if (!on.current) return; try { const s = new Tone.Synth({ oscillator:{type:"sine"}, envelope:{attack:0.01,decay:0.2,sustain:0,release:0.3}, volume:-20 }).toDestination(); s.triggerAttackRelease("C5","16n"); setTimeout(()=>s.triggerAttackRelease("E5","16n"),80); } catch {} }, []);
  const magic = useCallback(() => { if (!on.current) return; try { const s = new Tone.PolySynth(Tone.Synth,{volume:-18,oscillator:{type:"triangle"},envelope:{attack:0.05,decay:0.4,sustain:0.2,release:0.8}}).toDestination(); ["C4","E4","G4","C5","E5"].forEach((n,i)=>setTimeout(()=>s.triggerAttackRelease(n,"8n"),i*120)); } catch {} }, []);
  return { start, pageTurn, magic };
}

// ═══════════════════════════════════════════════════════════════
// TYPEWRITER
// ═══════════════════════════════════════════════════════════════
function Typewriter({ text, speed = 22, onDone }) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const i = useRef(0);
  useEffect(() => {
    setShown(""); i.current = 0; setDone(false);
    const iv = setInterval(() => {
      if (i.current < text.length) { setShown(text.slice(0, ++i.current)); }
      else { setDone(true); clearInterval(iv); onDone?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{shown}{!done && <span style={{ animation: "blink .8s step-end infinite" }}>|</span>}</span>;
}

// ═══════════════════════════════════════════════════════════════
// ANIMATED SCENE IMAGE
// ═══════════════════════════════════════════════════════════════
function AnimatedScene({ imageUrl, fallbackGradient, children }) {
  const [loaded, setLoaded] = useState(false);
  const kenBurns = `kenBurns${Math.floor(Math.random()*3)}`;

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", borderRadius: "16px 16px 0 0", background: fallbackGradient || "#1a1a2e" }}>
      {imageUrl && (
        <img src={imageUrl} alt="" onLoad={() => setLoaded(true)}
          style={{
            position: "absolute", inset: -20, width: "calc(100% + 40px)", height: "calc(100% + 40px)", objectFit: "cover",
            opacity: loaded ? 1 : 0, transition: "opacity 1s ease",
            animation: `${kenBurns} 20s ease-in-out infinite alternate`,
          }} />
      )}
      {/* Vignette overlay */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
      {/* Bottom gradient for text readability */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(transparent, rgba(0,0,0,0.5))", pointerEvents: "none" }} />
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
          width: 2+Math.random()*3, height: 2+Math.random()*3, borderRadius: "50%",
          background: "rgba(255,255,200,0.5)",
          animation: `particleFloat ${3+Math.random()*4}s ease-in-out ${Math.random()*3}s infinite`,
          pointerEvents: "none",
        }} />
      ))}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CARTOON AVATAR (floating above text)
// ═══════════════════════════════════════════════════════════════
function FloatingAvatar({ cartoonUrl, photoUrl }) {
  const url = cartoonUrl || photoUrl;
  if (!url) return null;
  return (
    <div style={{
      position: "absolute", top: -35, right: 24, width: 70, height: 70,
      borderRadius: "50%", border: "3px solid rgba(201,165,78,0.5)",
      overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(201,165,78,0.15)",
      animation: "avatarFloat 4s ease-in-out infinite",
      zIndex: 10,
    }}>
      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function Mythlings() {
  const [view, setView] = useState("home");
  const [scrollY, setScrollY] = useState(0);
  const [story, setStory] = useState(null);
  const snd = useSound();

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const nav = useCallback((v, data) => {
    if (data) setStory(data);
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div style={S.root} onClick={snd.start}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{CSS}</style>
      <Nav scrollY={scrollY} view={view} nav={nav} />
      {view === "home" && <Home nav={nav} snd={snd} />}
      {view === "create" && <Create nav={nav} snd={snd} />}
      {view === "read" && story && <Read nav={nav} story={story} snd={snd} />}
      {view === "pricing" && <Pricing nav={nav} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════════
function Nav({ scrollY, view, nav }) {
  const s = scrollY > 50;
  return (
    <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:1000,padding:"12px 0", background:s?"rgba(12,10,20,0.92)":"transparent", backdropFilter:s?"blur(20px)":"none", borderBottom:s?"1px solid rgba(255,255,255,0.05)":"none", transition:"all .4s" }}>
      <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div onClick={()=>nav("home")} style={{ cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
          <span style={{fontSize:"1.2rem"}}>✨</span>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.4rem",fontWeight:700,color:"#f0e8da"}}>Mythlings</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:24}}>
          {[["Home","home"],["Pricing","pricing"]].map(([l,v])=>(
            <span key={v} onClick={()=>nav(v)} style={{cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontSize:".82rem",fontWeight:600,color:view===v?"#f0e8da":"rgba(240,232,218,0.4)"}}>{l}</span>
          ))}
          <button onClick={()=>nav("create")} style={{padding:"8px 22px",background:"linear-gradient(135deg,#c9a54e,#e8c96a)",color:"#1a1510",border:"none",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:".82rem",cursor:"pointer"}}>Create a Story</button>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════════
function Home({ nav, snd }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVis(true)); }, []);

  return (<>
    <section style={{ minHeight:"100vh",display:"flex",alignItems:"center",padding:"80px 0 40px",position:"relative",overflow:"hidden" }}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 40%,rgba(201,165,78,0.06) 0%,transparent 50%),radial-gradient(ellipse at 70% 70%,rgba(107,63,160,0.04) 0%,transparent 50%)"}} />
      {[...Array(40)].map((_,i)=>(<div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:1+Math.random()*2,height:1+Math.random()*2,borderRadius:"50%",background:"#fff",opacity:0.1+Math.random()*0.3,animation:`twinkle ${2+Math.random()*4}s ease-in-out ${Math.random()*4}s infinite`}} />))}

      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",textAlign:"center",position:"relative"}}>
        <div style={{opacity:vis?1:0,transform:vis?"none":"translateY(30px)",transition:"all 1.2s cubic-bezier(.16,1,.3,1)"}}>
          <div style={{display:"inline-block",padding:"6px 20px",border:"1px solid rgba(201,165,78,0.2)",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontSize:".72rem",fontWeight:700,color:"#c9a54e",letterSpacing:".1em",textTransform:"uppercase",marginBottom:28}}>✦ AI-Illustrated Storybooks</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(2.6rem,6vw,4.5rem)",lineHeight:1.08,fontWeight:700,color:"#f0e8da",maxWidth:700,margin:"0 auto 20px"}}>
            Your child becomes the <em style={{color:"#c9a54e"}}>legend</em>
          </h1>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:"1.1rem",color:"rgba(240,232,218,0.55)",lineHeight:1.65,maxWidth:520,margin:"0 auto 36px"}}>
            Upload their photo. Pick an adventure. AI writes a unique story and paints every scene with your child as the hero.
          </p>
          <button onClick={()=>{snd.magic();nav("create")}} style={{padding:"16px 40px",background:"linear-gradient(135deg,#c9a54e,#e8c96a)",color:"#1a1510",border:"none",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontSize:"1.05rem",fontWeight:800,cursor:"pointer",boxShadow:"0 4px 24px rgba(201,165,78,0.3)"}}>Create a Free Story ✦</button>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:".75rem",color:"rgba(240,232,218,0.3)",marginTop:14}}>First story free · No account needed</p>
        </div>

        {/* Preview strip of AI-style images */}
        <div style={{marginTop:60,opacity:vis?1:0,transform:vis?"none":"translateY(50px)",transition:"all 1.2s cubic-bezier(.16,1,.3,1) .3s",display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          {["🐉","🚀","🧜","🦊","🏴‍☠️","🦕"].map((e,i) => (
            <div key={i} onClick={()=>nav("create")} style={{width:140,height:90,borderRadius:12,background:`linear-gradient(135deg, ${["#ff9a56,#c44569","#1b1d52,#4a2a6e","#43b4e8,#0a3a5a","#96e6a1,#3a7d44","#84cbea,#2a6a9a","#d4fc79,#3a8a3a"][i]})`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .3s",border:"1px solid rgba(255,255,255,0.05)",overflow:"hidden",position:"relative"}}>
              <span style={{fontSize:"2rem",zIndex:2,filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.3))"}}>{e}</span>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 50%,rgba(0,0,0,0.3))"}} />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section style={{padding:"80px 0",borderTop:"1px solid rgba(255,255,255,0.03)"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",textAlign:"center"}}>
        <SLabel>How It Works</SLabel>
        <h2 style={{...F.h2,marginBottom:48}}>Three steps to <em style={{color:"#c9a54e"}}>wonder</em></h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
          {[
            {n:"01",t:"Upload & Name",d:"Upload your child's photo and enter their name. Our AI creates a cartoon version of them."},
            {n:"02",t:"Choose a World",d:"Pick from 6 magical realms. Each creates completely different AI-illustrated scenes."},
            {n:"03",t:"Watch the Magic",d:"Every page comes alive with unique AI art, animated scenes, and your child as the star."},
          ].map((s,i)=>(
            <div key={i} style={{padding:"32px 28px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:16,textAlign:"left"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.5rem",fontWeight:700,color:"rgba(201,165,78,0.15)",marginBottom:8}}>{s.n}</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",fontWeight:700,color:"#f0e8da",marginBottom:8}}>{s.t}</h3>
              <p style={{...F.body,color:"rgba(240,232,218,0.45)"}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Adventures */}
    <section style={{padding:"80px 0",borderTop:"1px solid rgba(255,255,255,0.03)"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",textAlign:"center"}}>
        <SLabel>Worlds</SLabel>
        <h2 style={{...F.h2,marginBottom:48}}>Every world is uniquely illustrated</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14}}>
          {ADVENTURES.map(a=>(
            <div key={a.id} onClick={()=>nav("create")} style={{padding:"28px 18px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:16,textAlign:"center",cursor:"pointer",transition:"all .3s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color+"50";e.currentTarget.style.background=a.color+"08"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.05)";e.currentTarget.style.background="rgba(255,255,255,0.02)"}}>
              <div style={{fontSize:"2.2rem",marginBottom:8}}>{a.emoji}</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",fontWeight:700,color:"#f0e8da"}}>{a.title}</h3>
              <p style={{fontFamily:"'Nunito',sans-serif",fontSize:".72rem",color:"rgba(240,232,218,0.35)",marginTop:4}}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Reviews */}
    <section style={{padding:"80px 0",borderTop:"1px solid rgba(255,255,255,0.03)"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",textAlign:"center"}}>
        <SLabel>Parents</SLabel>
        <h2 style={{...F.h2,marginBottom:48}}>The gift that makes <em style={{color:"#c9a54e"}}>everyone</em> cry</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16}}>
          {[
            {name:"Jessica M.",text:"My daughter SOBBED with joy seeing the cartoon version of herself as the dragon hero.",kid:"Emma, 5"},
            {name:"Marcus T.",text:"The AI illustrations are incredible. My son thinks he's actually IN the book. Half his class has one now.",kid:"Jayden, 7"},
            {name:"Sarah K.",text:"Ordered for my niece's birthday. Her mom texted me crying. The personalized cartoon looked just like her.",kid:"Lily, 4"},
            {name:"David R.",text:"We do a new story every month. The kids watch the scenes animate and beg for 'one more page.'",kid:"Noah & Ava, 6 & 4"},
          ].map((r,i)=>(
            <div key={i} style={{padding:"24px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:14,textAlign:"left"}}>
              <div style={{color:"#c9a54e",fontSize:".8rem",marginBottom:8}}>★★★★★</div>
              <p style={{...F.body,color:"rgba(240,232,218,0.6)",marginBottom:12,fontStyle:"italic"}}>"{r.text}"</p>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{...F.body,fontWeight:700,fontSize:".8rem",color:"#f0e8da"}}>{r.name}</span>
                <span style={{...F.body,fontSize:".72rem",color:"#c9a54e"}}>{r.kid}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section style={{padding:"80px 0",borderTop:"1px solid rgba(255,255,255,0.03)"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",textAlign:"center"}}>
        <SLabel>Pricing</SLabel>
        <h2 style={{...F.h2,marginBottom:48}}>Less than a trip to the bookstore</h2>
        <PCards />
      </div>
    </section>

    {/* CTA */}
    <section style={{padding:"100px 0",textAlign:"center"}}>
      <div style={{maxWidth:500,margin:"0 auto",padding:"0 24px"}}>
        <div style={{fontSize:"2rem",marginBottom:16,opacity:.6}}>✦</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.8rem,4vw,2.8rem)",fontWeight:700,color:"#f0e8da",marginBottom:16}}>Every child deserves to be the hero</h2>
        <button onClick={()=>nav("create")} style={{padding:"16px 40px",background:"linear-gradient(135deg,#c9a54e,#e8c96a)",color:"#1a1510",border:"none",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontSize:"1.05rem",fontWeight:800,cursor:"pointer",boxShadow:"0 4px 24px rgba(201,165,78,0.3)"}}>Create a Free Story ✦</button>
      </div>
    </section>

    <footer style={{padding:"24px 0",borderTop:"1px solid rgba(255,255,255,0.03)",textAlign:"center",fontFamily:"'Nunito',sans-serif",fontSize:".72rem",color:"rgba(240,232,218,0.2)"}}>© 2026 Mythlings · mythlings.co</footer>
  </>);
}

// ═══════════════════════════════════════════════════════════════
// CREATE STORY
// ═══════════════════════════════════════════════════════════════
function Create({ nav, snd }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [adv, setAdv] = useState(null);
  const [trait, setTrait] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [pct, setPct] = useState(0);
  const fileRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const go = async () => {
    setLoading(true);
    setPhase(0);
    setPct(0);
    snd.magic();

    const pctIv = setInterval(() => setPct(p => Math.min(p + Math.random() * 5, 95)), 400);

    // Phase 0: Generate cartoon avatar (if photo provided)
    let cartoonUrl = null;
    if (photo) {
      setPhase(0);
      cartoonUrl = await generateCartoon(photo);
    }

    // Phase 1: Generate story text
    setPhase(1);
    const storyResult = await generateStoryText(name, adv, trait);
    const story = storyResult?.pages?.length === 5 ? storyResult : fallbackStory(name, adv, trait);

    // Phase 2: Generate illustrations (parallel)
    setPhase(2);
    const prompts = SCENE_PROMPTS[adv.id] || SCENE_PROMPTS.dragon;
    const imagePromises = prompts.map((prompt, i) =>
      generateImage(`${prompt}, the hero is a ${trait.toLowerCase()} child named ${name}`)
    );

    const images = await Promise.all(imagePromises);

    // Done
    clearInterval(pctIv);
    setPct(100);
    setPhase(3);
    snd.magic();

    setTimeout(() => {
      nav("read", {
        name, adventure: adv, trait, photo,
        cartoonUrl,
        title: story.title || adv.title,
        pages: story.pages,
        images: images,
      });
    }, 1000);
  };

  const phases = [
    { emoji: "🎨", title: "Creating your character...", sub: `Turning ${name}'s photo into a cartoon hero` },
    { emoji: "📝", title: "Writing the legend...", sub: `Crafting ${name}'s unique adventure` },
    { emoji: "🖌️", title: "Painting the scenes...", sub: "AI is illustrating every page" },
    { emoji: "✨", title: `${name}'s story is ready!`, sub: "Prepare to be amazed" },
  ];

  if (loading) {
    const p = phases[phase] || phases[0];
    return (
      <div style={{paddingTop:80,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center",padding:"0 24px",maxWidth:400}}>
          <div key={phase} style={{animation:"fadeUp .5s ease"}}>
            <div style={{fontSize:"3.5rem",marginBottom:20,animation:"float 2s ease-in-out infinite"}}>{p.emoji}</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.5rem",fontWeight:700,color:"#f0e8da",marginBottom:8}}>{p.title}</h2>
            <p style={{...F.body,color:"rgba(240,232,218,0.4)",marginBottom:24}}>{p.sub}</p>
          </div>
          <div style={{width:240,height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,margin:"0 auto",overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#c9a54e,#e8c96a)",borderRadius:2,transition:"width .4s"}} />
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20}}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{width:8,height:8,borderRadius:"50%",background:phase>=i?"#c9a54e":"rgba(255,255,255,0.08)",transition:"all .3s"}} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{paddingTop:80,minHeight:"100vh"}}>
      <div style={{maxWidth:560,margin:"0 auto",padding:"40px 24px"}}>
        <button onClick={()=>step===1?nav("home"):setStep(step-1)} style={{...F.body,background:"none",border:"none",color:"rgba(240,232,218,0.4)",cursor:"pointer",fontSize:".85rem",marginBottom:24,padding:0}}>← Back</button>
        <div style={{display:"flex",gap:4,marginBottom:36}}>
          {[1,2,3].map(s=><div key={s} style={{flex:1,height:2,borderRadius:1,background:step>=s?"linear-gradient(90deg,#c9a54e,#e8c96a)":"rgba(255,255,255,0.05)",transition:"all .5s"}} />)}
        </div>

        {step===1 && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <SLabel>Step 1 of 3</SLabel>
            <h2 style={{...F.h2,fontSize:"1.8rem",marginBottom:6}}>Who is the hero?</h2>
            <p style={{...F.body,color:"rgba(240,232,218,0.4)",marginBottom:28}}>Their name and face will appear throughout the story</p>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter child's name..." onKeyDown={e=>e.key==="Enter"&&name.trim()&&setStep(2)}
              style={{width:"100%",padding:"16px 20px",fontSize:"1.1rem",fontFamily:"'Cormorant Garamond',serif",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,background:"rgba(255,255,255,0.03)",color:"#f0e8da",outline:"none"}} autoFocus />

            {/* Photo upload */}
            <div style={{marginTop:20}}>
              <p style={{...F.body,color:"rgba(240,232,218,0.4)",fontSize:".82rem",marginBottom:10}}>📸 Upload a photo to create their cartoon character</p>
              <div onClick={()=>fileRef.current?.click()} style={{
                width:100,height:100,borderRadius:16,
                border:photo?"2px solid rgba(201,165,78,0.4)":"2px dashed rgba(255,255,255,0.1)",
                background:photo?`url(${photo}) center/cover`:"rgba(255,255,255,0.02)",
                display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",transition:"all .2s"
              }}>
                {!photo && <span style={{fontSize:"1.8rem",opacity:.3}}>📷</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}} />
              {photo && <button onClick={()=>setPhoto(null)} style={{...F.body,fontSize:".75rem",color:"rgba(240,232,218,0.3)",background:"none",border:"none",cursor:"pointer",marginTop:6}}>Remove photo</button>}
            </div>

            <GBtn onClick={()=>name.trim()&&setStep(2)} disabled={!name.trim()} style={{marginTop:24}}>Next → Choose World</GBtn>
          </div>
        )}

        {step===2 && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <SLabel>Step 2 of 3</SLabel>
            <h2 style={{...F.h2,fontSize:"1.8rem",marginBottom:6}}>Choose {name}'s world</h2>
            <p style={{...F.body,color:"rgba(240,232,218,0.4)",marginBottom:28}}>Each world creates unique AI illustrations</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10}}>
              {ADVENTURES.map(a=>(
                <div key={a.id} onClick={()=>setAdv(a)} style={{padding:"20px 14px",background:adv?.id===a.id?a.color+"15":"rgba(255,255,255,0.02)",border:`1px solid ${adv?.id===a.id?a.color+"60":"rgba(255,255,255,0.05)"}`,borderRadius:14,textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:4}}>{a.emoji}</div>
                  <div style={{fontFamily:"'Nunito',sans-serif",fontSize:".82rem",fontWeight:700,color:adv?.id===a.id?a.color:"rgba(240,232,218,0.6)"}}>{a.title}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:24}}>
              <button onClick={()=>setStep(1)} style={{...F.body,padding:"10px 22px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:100,color:"rgba(240,232,218,0.5)",cursor:"pointer"}}>← Back</button>
              <GBtn onClick={()=>adv&&setStep(3)} disabled={!adv}>Next → Choose Trait</GBtn>
            </div>
          </div>
        )}

        {step===3 && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <SLabel>Step 3 of 3</SLabel>
            <h2 style={{...F.h2,fontSize:"1.8rem",marginBottom:6}}>What makes {name} legendary?</h2>
            <p style={{...F.body,color:"rgba(240,232,218,0.4)",marginBottom:28}}>This trait weaves through the entire story</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {TRAITS.map(t=>(
                <button key={t} onClick={()=>setTrait(t)} style={{padding:"9px 20px",borderRadius:100,border:`1px solid ${trait===t?"#c9a54e":"rgba(255,255,255,0.08)"}`,background:trait===t?"rgba(201,165,78,0.1)":"transparent",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:".85rem",color:trait===t?"#c9a54e":"rgba(240,232,218,0.5)",cursor:"pointer"}}>{t}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:28}}>
              <button onClick={()=>setStep(2)} style={{...F.body,padding:"10px 22px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:100,color:"rgba(240,232,218,0.5)",cursor:"pointer"}}>← Back</button>
              <GBtn onClick={go} disabled={!trait} big>✦ Create {name}'s Legend</GBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// READ STORY — Immersive with AI illustrations
// ═══════════════════════════════════════════════════════════════
function Read({ nav, story, snd }) {
  const [pg, setPg] = useState(0);
  const [entered, setEntered] = useState(false);
  const { name, adventure, trait, photo, cartoonUrl, title, pages, images } = story;
  const total = pages.length;
  const locked = pg >= 2;

  useEffect(() => { setTimeout(()=>setEntered(true),100); }, []);

  const goPage = (n) => {
    if(n<0||n>=total) return;
    snd.pageTurn();
    setPg(n);
  };

  const share = () => {
    const msg = `I just created an AI-illustrated storybook starring ${name} with Mythlings! Every page is uniquely illustrated. Try it at mythlings.co ✦`;
    if(navigator.share) navigator.share({title:`${name}'s Legend`,text:msg,url:"https://mythlings.co"}).catch(()=>{});
    else{navigator.clipboard?.writeText(msg);alert("Copied!");}
  };

  const gradients = [
    "linear-gradient(135deg,#ff9a56,#c44569)","linear-gradient(135deg,#a18cd1,#fbc2eb)",
    "linear-gradient(135deg,#ffecd2,#fcb69f)","linear-gradient(135deg,#f093fb,#f5576c)",
    "linear-gradient(135deg,#ffecd2,#e55d4a)",
  ];

  return (
    <div style={{paddingTop:70,minHeight:"100vh",opacity:entered?1:0,transition:"all .8s cubic-bezier(.16,1,.3,1)"}}>
      <div style={{maxWidth:700,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <button onClick={()=>nav("create")} style={{...F.body,background:"none",border:"none",color:"rgba(240,232,218,0.4)",cursor:"pointer",fontSize:".85rem",padding:0}}>← New story</button>
          <span style={{fontFamily:"'Nunito',sans-serif",fontSize:".7rem",color:"#c9a54e",fontWeight:700}}>✦ {name}'s Legend</span>
        </div>

        {/* BOOK */}
        <div key={pg} style={{borderRadius:20,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.04)",animation:"pageIn .5s cubic-bezier(.16,1,.3,1)"}}>

          <AnimatedScene imageUrl={images?.[pg]} fallbackGradient={gradients[pg%gradients.length]}>
            <div style={{position:"absolute",top:16,left:20}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:".72rem",fontWeight:600,color:"rgba(255,255,255,0.5)"}}>
                {pg===0?`${name} and the ${title}`:`Chapter ${pg+1}`}
              </span>
            </div>
            <span style={{position:"absolute",bottom:14,right:20,fontFamily:"'Nunito',sans-serif",fontSize:".68rem",fontWeight:700,color:"rgba(255,255,255,0.4)",background:"rgba(0,0,0,0.3)",padding:"2px 10px",borderRadius:100}}>{pg+1}/{total}</span>
          </AnimatedScene>

          {/* Text area with floating avatar */}
          <div style={{padding:"28px 32px 24px",background:"rgba(20,16,28,0.95)",position:"relative"}}>
            <FloatingAvatar cartoonUrl={cartoonUrl} photoUrl={photo} />

            {locked ? (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(201,165,78,0.1)",border:"1px solid rgba(201,165,78,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:"1.4rem"}}>🔒</div>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.2rem",fontWeight:700,color:"#f0e8da",marginBottom:6}}>The adventure continues...</h3>
                <p style={{...F.body,color:"rgba(240,232,218,0.4)",marginBottom:18}}>Unlock all 5 illustrated pages</p>
                <a href={STRIPE.single} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"12px 28px",background:"linear-gradient(135deg,#c9a54e,#e8c96a)",color:"#1a1510",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:".9rem",textDecoration:"none"}}>Unlock Full Story — $9.99 ✦</a>
              </div>
            ) : (
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.15rem",lineHeight:1.8,color:"#d4c8b0"}}>
                <Typewriter text={pages[pg]} speed={20} />
              </p>
            )}
          </div>

          {/* Navigation */}
          <div style={{padding:"0 32px 20px",background:"rgba(20,16,28,0.95)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={()=>goPage(pg-1)} disabled={pg===0} style={{padding:"8px 16px",background:"rgba(255,255,255,0.03)",color:pg===0?"rgba(240,232,218,0.15)":"rgba(240,232,218,0.5)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:".82rem",cursor:pg===0?"default":"pointer"}}>← Prev</button>
            <div style={{display:"flex",gap:5}}>
              {pages.map((_,i)=>(
                <button key={i} onClick={()=>goPage(i)} style={{width:6,height:6,borderRadius:"50%",border:"none",background:i===pg?"#c9a54e":i>=2?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.12)",cursor:"pointer",padding:0}} />
              ))}
            </div>
            <button onClick={()=>goPage(pg+1)} disabled={pg>=total-1} style={{padding:"8px 16px",background:pg>=total-1?"rgba(255,255,255,0.03)":"linear-gradient(135deg,#c9a54e,#e8c96a)",color:pg>=total-1?"rgba(240,232,218,0.15)":"#1a1510",border:"none",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:".82rem",cursor:pg>=total-1?"default":"pointer"}}>Next →</button>
          </div>
        </div>

        {/* Actions */}
        <div style={{marginTop:24,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <a href={STRIPE.single} target="_blank" rel="noopener noreferrer" style={{padding:"11px 24px",background:"linear-gradient(135deg,#c9a54e,#e8c96a)",color:"#1a1510",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:".85rem",textDecoration:"none"}}>Download PDF — $9.99</a>
          <a href={STRIPE.print} target="_blank" rel="noopener noreferrer" style={{padding:"11px 24px",background:"rgba(255,255,255,0.03)",color:"rgba(240,232,218,0.6)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:".85rem",textDecoration:"none"}}>Printed Book — $29.99</a>
        </div>
        <div style={{textAlign:"center",marginTop:12}}>
          <button onClick={share} style={{background:"none",border:"none",fontFamily:"'Nunito',sans-serif",color:"#c9a54e",fontWeight:700,cursor:"pointer",fontSize:".85rem"}}>Share this story ✦</button>
        </div>

        {/* Upsell */}
        <div style={{marginTop:32,padding:"26px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:16,textAlign:"center"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.1rem",fontWeight:700,color:"#f0e8da",marginBottom:6}}>Want unlimited stories?</h3>
          <p style={{...F.body,color:"rgba(240,232,218,0.4)",marginBottom:14}}>Story Club: unlimited AI-illustrated stories — $14.99/mo</p>
          <a href={STRIPE.club} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"10px 26px",background:"linear-gradient(135deg,#c9a54e,#e8c96a)",color:"#1a1510",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:".86rem",textDecoration:"none"}}>Start Free Trial ✦</a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════
function Pricing({ nav }) {
  return (
    <div style={{paddingTop:80,minHeight:"100vh"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"50px 24px"}}>
        <button onClick={()=>nav("home")} style={{...F.body,background:"none",border:"none",color:"rgba(240,232,218,0.4)",cursor:"pointer",fontSize:".85rem",marginBottom:28,padding:0}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:48}}>
          <SLabel>Pricing</SLabel>
          <h2 style={{...F.h2,marginBottom:10}}>Stories that cost less than a toy</h2>
          <p style={{...F.body,color:"rgba(240,232,218,0.4)"}}>First story free. No credit card required.</p>
        </div>
        <PCards />
      </div>
    </div>
  );
}

function PCards() {
  const plans = [
    {name:"Single Story",price:"$9.99",per:"one-time",desc:"Perfect birthday gift",feats:["Full 5-page AI-illustrated story","PDF download","Cartoon avatar of your child","Shareable link"],link:STRIPE.single,cta:"Buy a Story",pop:false},
    {name:"Story Club",price:"$14.99",per:"/month",desc:"New adventures monthly",feats:["Unlimited AI-illustrated stories","2 free prints/year","New worlds first","Family sharing","Cancel anytime"],link:STRIPE.club,cta:"Start Free Trial",pop:true},
    {name:"Printed Book",price:"$29.99",per:"per book",desc:"Hardcover keepsake",feats:["Premium hardcover","32 AI-illustrated pages","Gift packaging","5-7 day shipping"],link:STRIPE.print,cta:"Order Print",pop:false},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,maxWidth:860,margin:"0 auto"}}>
      {plans.map((p,i)=>(
        <div key={i} style={{padding:"30px 24px",background:p.pop?"rgba(201,165,78,0.04)":"rgba(255,255,255,0.02)",border:p.pop?"1px solid rgba(201,165,78,0.2)":"1px solid rgba(255,255,255,0.05)",borderRadius:16,textAlign:"left",position:"relative"}}>
          {p.pop&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",padding:"3px 14px",background:"linear-gradient(135deg,#c9a54e,#e8c96a)",color:"#1a1510",fontFamily:"'Nunito',sans-serif",fontSize:".66rem",fontWeight:800,borderRadius:100,textTransform:"uppercase"}}>Most Popular</div>}
          <div style={{fontFamily:"'Nunito',sans-serif",fontSize:".78rem",fontWeight:700,color:"#c9a54e",marginBottom:4}}>{p.name}</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.2rem",fontWeight:700,color:"#f0e8da"}}>{p.price}<span style={{fontSize:".8rem",color:"rgba(240,232,218,0.35)",fontFamily:"'Nunito',sans-serif"}}> {p.per}</span></div>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:".78rem",color:"rgba(240,232,218,0.35)",margin:"4px 0 18px"}}>{p.desc}</p>
          <ul style={{listStyle:"none",padding:0,marginBottom:22}}>
            {p.feats.map((f,j)=><li key={j} style={{fontFamily:"'Nunito',sans-serif",fontSize:".82rem",color:"rgba(240,232,218,0.5)",padding:"4px 0",display:"flex",gap:8}}><span style={{color:"#c9a54e"}}>✦</span>{f}</li>)}
          </ul>
          <a href={p.link} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"11px",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontSize:".88rem",fontWeight:800,textAlign:"center",textDecoration:"none",background:p.pop?"linear-gradient(135deg,#c9a54e,#e8c96a)":"transparent",color:p.pop?"#1a1510":"#c9a54e",border:p.pop?"none":"1px solid rgba(201,165,78,0.2)"}}>{p.cta}</a>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════════════════════════
function SLabel({children}){return <div style={{fontFamily:"'Nunito',sans-serif",fontSize:".68rem",textTransform:"uppercase",letterSpacing:".16em",fontWeight:700,color:"#c9a54e",marginBottom:12}}>✦ {children}</div>}

function GBtn({children,onClick,disabled,big,style}){
  return <button onClick={disabled?undefined:onClick} style={{padding:big?"14px 36px":"12px 28px",background:disabled?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#c9a54e,#e8c96a)",color:disabled?"rgba(240,232,218,0.2)":"#1a1510",border:"none",borderRadius:100,fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:big?".98rem":".88rem",cursor:disabled?"default":"pointer",boxShadow:disabled?"none":"0 3px 16px rgba(201,165,78,0.2)",...style}}>{children}</button>;
}

const F = {
  h2:{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.7rem,3.2vw,2.4rem)",fontWeight:700,color:"#f0e8da"},
  body:{fontFamily:"'Nunito',sans-serif",fontSize:".88rem",lineHeight:1.6},
};

const S = {
  root:{fontFamily:"'Georgia',serif",background:"#0c0a14",color:"#f0e8da",minHeight:"100vh",overflowX:"hidden"},
};

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0c0a14!important;color:#f0e8da}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes twinkle{0%,100%{opacity:.15}50%{opacity:.8}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pageIn{from{opacity:0;transform:scale(.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes avatarFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-6px) rotate(2deg)}}
@keyframes kenBurns0{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.08) translate(-10px,-5px)}}
@keyframes kenBurns1{0%{transform:scale(1.05) translate(-5px,0)}100%{transform:scale(1) translate(5px,-3px)}}
@keyframes kenBurns2{0%{transform:scale(1) translate(5px,3px)}100%{transform:scale(1.1) translate(-5px,-5px)}}
@keyframes particleFloat{0%{opacity:0;transform:translate(0,0)}25%{opacity:.6;transform:translate(8px,-12px)}50%{opacity:.8;transform:translate(-4px,-25px)}75%{opacity:.4;transform:translate(12px,-12px)}100%{opacity:0;transform:translate(0,0)}}
input:focus{border-color:rgba(201,165,78,0.3)!important;outline:none}
button{transition:all .2s}
button:active{transform:scale(.97)!important}
::selection{background:rgba(201,165,78,0.2)}
@media(max-width:640px){.hero-grid{grid-template-columns:1fr!important}}
`;
