import { useState, useEffect, useRef } from "react";

// ── BRAND TOKENS ─────────────────────────────────────────────────────────────
const BRAND = {
  indigoDark:   "#1f1b71",
  indigoMid:    "#4e30a1",
  gold:         "#d1b059",
  goldLight:    "#ecd595",
  magenta:      "#c43acb",
  lavender:     "#d4c5fd",
  lavenderMid:  "#ede7fe",
  lavenderPale: "#eceaf5",
  blush:        "#f9ebf9",
  white:        "#ffffff",
};

// ── PULSE BANDS — each level gets its own distinct color ─────────────────────
const BANDS = {
  strong:   { key: "strong",   label: "Strong Pulse",  color: "#4e30a1", bg: "#ede7fe", amp: 1.0,  textOnColor: "#fff" },
  steady:   { key: "steady",   label: "Steady Pulse",  color: "#c43acb", bg: "#fdeeff", amp: 0.62, textOnColor: "#fff" },
  weak:     { key: "weak",     label: "Weak Pulse",    color: "#ecd595", bg: "#fdf8e6", amp: 0.34, textOnColor: "#3a2e00" },
  flatline: { key: "flatline", label: "Flatline",      color: "#f9ebf9", bg: "#fdf5fd", amp: 0.0,  textOnColor: "#6b2d6e" },
};

function bandFor(score) {
  if (score >= 10) return BANDS.strong;
  if (score >= 7)  return BANDS.steady;
  if (score >= 4)  return BANDS.weak;
  return BANDS.flatline;
}

// Road / highway SVG icon for Specialized Lane
const RoadIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 3 L8 25 H12 L14 17 L16 25 H20 L14 3Z" fill="currentColor" opacity="0.9"/>
    <rect x="13" y="7" width="2" height="3" rx="1" fill="white" opacity="0.7"/>
    <rect x="13" y="12" width="2" height="3" rx="1" fill="white" opacity="0.7"/>
    <line x1="6" y1="25" x2="22" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const VITALS = [
  {
    id: "passion", num: 1, name: "Passion Alignment",
    icon: "🔥",
    useCustomIcon: false,
    tagline: "Do you light up when you talk about it, or are you selling what you think you should sell?",
    questions: [
      { q: "When you imagine doing this work with a client, how does it feel in your body?", options: [
        { t: "I feel capable but not particularly lit up by it", v: 2 },
        { t: "I feel energized and completely in my element, this is the work I was made for", v: 4 },
        { t: "I feel a low grade dread or heaviness I keep trying to push past", v: 1 },
        { t: "I feel mostly excited with some nerves about whether I can deliver well", v: 3 },
      ]},
      { q: "When you think about selling this offer, how do you feel?", options: [
        { t: "Like I have to convince myself before I can convince anyone else", v: 1 },
        { t: "Genuinely excited, I believe in it and I want people to have it", v: 4 },
        { t: "Anxious, I find myself avoiding it more than I'd like to admit", v: 2 },
        { t: "Hopeful but a little uncertain about whether people will see the value", v: 3 },
      ]},
      { q: "What best describes why you created this offer?", options: [
        { t: "It's a combination of what I love and what I saw people asking for", v: 3 },
        { t: "I modeled it after something I saw working for someone else in my space", v: 1 },
        { t: "It's the natural expression of my deepest expertise and the problem I was born to solve", v: 4 },
        { t: "I built it because I needed something to sell and this felt like the right fit", v: 2 },
      ]},
    ],
    means: {
      strong: "You are deeply committed to the transformation this offer creates and that conviction is magnetic. Buyers feel it before you ever make an offer.",
      steady: "There is real interest here but the fire may not yet be rooted in a deep personal connection to the transformation. This is worth exploring before you scale.",
      weak: "You may be selling something that feels right strategically but does not yet have the emotional fuel to sustain it. Buyers can sense the difference between conviction and effort.",
      flatline: "This offer may be built on what you thought you should sell rather than what you are truly called to deliver. Without passion alignment at the foundation nothing else will compensate for its absence.",
    },
    strongLooks: "When passion alignment is strong, you are not just interested in this work. You are called to it. There is a fire underneath this offer that comes from somewhere real. Maybe you have lived the transformation yourself and know the pain of being on the other side of it. Maybe a life experience or a moment of clarity made it impossible to do anything else. Whatever the origin, you are so committed to the transformation you create that giving up on this offer would feel like giving up on the people who need it most. That commitment is felt by your buyers before you ever say a word about price or process. It shows up in how you talk about your work, how you show up to sell it, and how you refuse to walk away from it even when it gets hard. Passion alignment is not about enthusiasm. It is about being so rooted in why this offer exists that nothing about selling it feels like a performance.",
  },
  {
    id: "brilliance", num: 2, name: "Natural Brilliance",
    icon: "✨",
    useCustomIcon: false,
    tagline: "Is it built around what you do with effortless excellence, or are you working against your grain?",
    questions: [
      { q: "How naturally does the core work inside this offer come to you?", options: [
        { t: "It flows out of me naturally, I rarely have to force it and I lose track of time doing it", v: 4 },
        { t: "It comes fairly naturally but I have to work at it sometimes, and I genuinely love the work", v: 3 },
        { t: "I have some natural characteristics that make this a good fit for me but I am still building the real world experience to back it up", v: 2 },
        { t: "It takes real effort and I sometimes wonder if this is truly my strongest lane", v: 1 },
      ]},
      { q: "How long has this area of expertise been a natural part of who you are?", options: [
        { t: "I'm honestly still figuring out if this is my true area of genius", v: 1 },
        { t: "People have been coming to me for this my whole life, long before it became my business", v: 4 },
        { t: "I discovered it relatively recently through my entrepreneurial journey", v: 2 },
        { t: "It started emerging through my career and the roles I kept naturally gravitating toward", v: 3 },
      ]},
      { q: "Where did the expertise behind this offer come from?", options: [
        { t: "It's a combination of lived experience, natural ability, and years of deliberate practice", v: 4 },
        { t: "I learned it from a mentor or program and I'm still developing my own point of view", v: 1 },
        { t: "It comes mostly from lived experience and I'm still building the frameworks around it", v: 3 },
        { t: "I studied it and got certified but haven't yet built deep lived experience with it", v: 2 },
      ]},
    ],
    means: {
      strong: "This offer is built on your innate genius and the way you are uniquely wired to deliver this specific transformation. The work feels natural, your results are distinctive, and clients seek you out for the specific way you do what you do.",
      steady: "There is real strength here and you are doing good work. You may still be uncovering the full depth of your genius or learning to trust it enough to let it lead completely.",
      weak: "This offer may be built on learned expertise rather than innate genius. You can deliver it but it costs you more than it should. It feels like climbing a hill with obstacles rather than naturally scaling it.",
      flatline: "This work does not feel like your best and somewhere inside you already know it. The offer may be functional but it is not coming from your most natural and powerful place and that gap will show up in your energy, your results, and your ability to charge what you are truly worth.",
    },
    strongLooks: "When natural brilliance is strong, the work inside your offer feels almost effortless. Not because it requires no skill, but because the way you see, think, and solve problems is so uniquely yours that it could not belong to anyone else. Two experts can have identical training, identical credentials, and identical experience and still deliver completely different results because of who they are at their core. Natural brilliance is about that core. It is the way your brain is wired, the way your personality shapes your approach, the specific lens you bring to a problem that makes your solution distinctly and recognizably yours. When you are operating from your natural brilliance, you scale the hill. You may work hard but it does not feel like a grind. It feels like the most natural expression of who you are and what you were built to do. Your clients feel that too. There is a quality to the work that cannot be faked or replicated because it is coming from somewhere genuinely innate in you.",
  },
  {
    id: "pain", num: 3, name: "Real Buyer Pain",
    icon: "🎯",
    useCustomIcon: false,
    tagline: "Is it solving something specific enough that people are already spending money trying to fix it?",
    questions: [
      { q: "How specifically can you describe the problem your offer solves in the exact words your buyer would use?", options: [
        { t: "I can describe it generally but the specifics are still fuzzy for me", v: 2 },
        { t: "I can describe it precisely and my buyers consistently respond with 'you just described exactly what I'm going through'", v: 4 },
        { t: "I'm still figuring out exactly what problem my offer solves at its core", v: 1 },
        { t: "I know the problem well but I'm still refining how to articulate it in my buyer's own language", v: 3 },
      ]},
      { q: "What evidence do you have that people are actively spending money to solve this problem?", options: [
        { t: "My own sales and buyer conversations confirm people invest consistently and willingly in solving this", v: 4 },
        { t: "I'm not sure yet whether people see this as worth investing in", v: 1 },
        { t: "I've seen clear market evidence of people spending money on this, competitors, courses, programs all exist and are selling", v: 3 },
        { t: "I believe people would pay to solve this but I haven't yet validated it with real buyers or market research", v: 2 },
      ]},
      { q: "Where does the pain your offer addresses sit in your buyer's life right now?", options: [
        { t: "It's something they know they should address but it sits more in the 'someday' category", v: 2 },
        { t: "It's keeping them up at night, they are actively looking for a solution and feel the cost of not solving it every day", v: 4 },
        { t: "It's more of a nice to have, life is fine without solving it, it would just be better if they did", v: 1 },
        { t: "It's a real problem they think about regularly but haven't yet made it a priority to solve", v: 3 },
      ]},
    ],
    means: {
      strong: "You know your buyer's pain so specifically and so intimately that they feel seen the moment they encounter your offer. The problem you solve is urgent, real, and something they are already willing to invest in solving.",
      steady: "You have identified a real pain but you may still be speaking about it in language that is slightly too general to create that 'you are inside my head' moment. Getting more specific here will significantly strengthen your offer's magnetic pull.",
      weak: "The pain your offer addresses may be real but it is not yet specific or urgent enough to compel action. Your buyers might be interested but interest does not convert. Urgency does.",
      flatline: "This offer may be solving a nice to have problem rather than a must solve right now problem. Until the buyer pain is specific, urgent, and something people are already spending money trying to fix, this offer will struggle to gain real traction regardless of how good the solution is.",
    },
    strongLooks: "When real buyer pain is strong, you know your buyer so intimately that you can describe what they are feeling right now in their own words. The exact language they use when no one is listening, the emotions they carry, and what staying stuck is costing them every single day. That knowledge does not come from one place. It comes from years of paying attention in communities, listening to what people talk about when they think no one has the answer, doing real market research, and often from your own lived experience of that exact pain. When you have identified a real buyer pain, your audience stops mid-scroll and thinks 'how is she inside my head?' That recognition is not an accident. It is the result of getting so specific about the problem that the right person feels seen in a way they rarely do. And critically, the pain your offer addresses is not a someday problem. It is not a nice to have. It is something that is costing your buyer something real and urgent right now. Sleep, money, confidence, opportunity. And they are already looking for a solution. That urgency is what makes an offer magnetic rather than merely interesting.",
  },
  {
    id: "transformation", num: 4, name: "Clear Transformation",
    icon: "🦋",
    useCustomIcon: false,
    tagline: "Can you see and feel where the client starts and where they end up?",
    questions: [
      { q: "How vividly can you describe where your buyer starts and where they end up after working with you?", options: [
        { t: "I can describe the general direction of the transformation but the specific details are still a little blurry", v: 3 },
        { t: "I'm still figuring out what transformation my offer actually creates", v: 1 },
        { t: "I can describe both the before and after in vivid, specific detail that makes my ideal client immediately say 'that's exactly where I am and where I want to go'", v: 4 },
        { t: "I know the transformation exists but I struggle to put it into clear, concrete language", v: 2 },
      ]},
      { q: "How many distinct transformations is your offer promising?", options: [
        { t: "Several transformations, I want buyers to see how much value they are getting", v: 1 },
        { t: "One clear, specific transformation that my buyer can see and feel before they even purchase", v: 4 },
        { t: "Two or three transformations that I believe are all important and don't want to leave out", v: 2 },
        { t: "Primarily one transformation with a few natural and related outcomes that support it", v: 3 },
      ]},
      { q: "When you describe the outcome your offer creates, which best describes your experience?", options: [
        { t: "It takes several exchanges before people fully understand what the outcome means for them", v: 2 },
        { t: "People immediately respond with 'I need that', the outcome lands every time I describe it", v: 4 },
        { t: "I notice people seem unclear or underwhelmed when I describe where the offer takes them", v: 1 },
        { t: "I feel completely clear on the outcome even if I'm still gathering early buyer feedback", v: 3 },
      ]},
    ],
    means: {
      strong: "The transformation your offer creates is vivid, specific, and immediately understood. Your buyer can see exactly where they are starting and where they will end up and that clarity is what makes saying yes feel easy and obvious.",
      steady: "The transformation is real but the language around it may still be slightly general or trying to serve too many outcomes at once. Sharpening your before and after into one specific and vivid promise will significantly strengthen your offer's pull.",
      weak: "Your offer may be describing what it does rather than what it changes. Buyers are left trying to imagine the outcome for themselves which creates hesitation and makes it harder for them to say yes with confidence.",
      flatline: "Right now your offer is not painting a clear enough picture of what is going to be different when the work is done. Without a specific and vivid transformation at its core buyers cannot see what they are buying and that uncertainty is quietly costing you sales.",
    },
    strongLooks: "When clear transformation is strong, the path your client will go on is completely visible before they ever say yes. There is no confusion about what is going to change, no list of features trying to justify the price, and no vague promises like 'grow your business' or 'design your ideal life' that sound appealing but mean something different to every person who reads them. A strong transformation paints a vivid and specific picture of the before and the after. Where your client is right now and exactly what will be different in their life or business when the work is done. That clarity does not come from describing what is inside the offer or how many sessions they will get or what tools you will use. It comes from knowing the core promise of your offer so well that you can say in plain, specific language what is going to change and why that change matters. When transformation is this clear, buyers do not need to think twice. They can see themselves in the before, they want the after, and saying yes feels like the most obvious decision they have made in a long time.",
  },
  {
    id: "lane", num: 5, name: "Specialized Lane",
    icon: null,
    useCustomIcon: true,
    tagline: "Is there a distinct, ownable corner of the market this lives in, or is it in the generic middle?",
    questions: [
      { q: "How distinct is the territory your offer occupies compared to others who serve a similar audience?", options: [
        { t: "My offer sounds similar to others in my space and I know I need to differentiate but haven't cracked it yet", v: 2 },
        { t: "My offer occupies a specific, ownable territory, the right person finds me and immediately knows I am speaking directly to them", v: 4 },
        { t: "My offer is broad enough to appeal to many different types of people and I haven't narrowed it down deliberately yet", v: 1 },
        { t: "My offer has some distinct elements but I could still be described in similar terms to a few others in my space", v: 3 },
      ]},
      { q: "What makes the way you solve this problem distinctly yours rather than interchangeable with others in your space?", options: [
        { t: "I have a genuinely distinct approach that is recognizably mine, whether or not it has a formal name yet, and clients seek me out specifically for how I do this work", v: 4 },
        { t: "I have a distinct approach and philosophy but I haven't yet fully articulated or packaged what makes it uniquely mine", v: 3 },
        { t: "My approach is similar to others in my space but I bring my own personality and experience to it", v: 2 },
        { t: "I am still developing a point of view on how to solve this problem in a way that is distinctly mine", v: 1 },
      ]},
      { q: "Do you have a clear and specific point of view on your topic that naturally attracts some people and repels others?", options: [
        { t: "I have a strong, clear point of view that I share openly and it consistently attracts my ideal clients", v: 4 },
        { t: "I'm still developing the confidence to share my point of view openly and consistently", v: 1 },
        { t: "I have opinions about my topic but I tend to soften them to avoid alienating potential clients", v: 2 },
        { t: "I have a developing point of view and I'm starting to share it but it's not yet fully formed", v: 3 },
      ]},
    ],
    means: {
      strong: "Your lane is specific, ownable, and immediately understood. People know exactly what you do, who you serve, and how you are different. You are easy to refer, easy to remember, and impossible to confuse with anyone else in your space.",
      steady: "You have a sense of your lane but the edges may still be a little soft. You might still be trying to appeal to a slightly broader audience than your most magnetic work actually serves. Sharpening your lane will make everything from content to sales conversations significantly easier.",
      weak: "Your offer may be sitting in the generic middle where it sounds similar enough to others in your space that buyers have to work too hard to understand why you specifically are the right choice. That extra effort is costing you sales.",
      flatline: "Right now your offer could belong to almost anyone in your space. Without a distinct and specific lane your offer will continue to blend into the noise regardless of how good your work actually is. This is the vital sign that affects every other part of your marketing and sales experience and it needs immediate attention.",
    },
    strongLooks: "When your specialized lane is strong, there is no confusion about what you do, who you do it for, or how you do it differently. Your positioning is so crystal clear and specific that someone can understand it in thirty seconds, remember it a week later, and refer you to exactly the right person without having to think twice. Think about what it means to be known for one specific thing the way some of the most magnetic experts in any space are. Their lane is so distinct and so ownable that it becomes impossible to confuse them with anyone else. That specificity is not limiting. It is liberating. When you have claimed a real lane, creating content becomes easier because you always know what you stand for. Standing out becomes natural because you are not competing in the generic middle where everyone sounds the same. Your elevator pitch becomes simple, memorable, and immediately compelling. And perhaps most importantly, you stop getting lost in the noise. A specialized lane gives you a real edge in the marketplace not because you are louder than everyone else but because you are the only one occupying exactly that corner of the market. That is what makes an offer truly magnetic rather than merely available.",
  },
];

function buildEcg(width, height, amp, beats) {
  const b = height / 2;
  if (amp <= 0.001) {
    return `M0,${b} L${(width*0.42).toFixed(1)},${b} L${(width*0.45).toFixed(1)},${(b-2).toFixed(1)} L${(width*0.48).toFixed(1)},${b} L${width},${b}`;
  }
  const seg = width / beats;
  const A = (height / 2 - 4) * amp;
  const shape = [[0.30,0],[0.36,0.18],[0.42,0],[0.48,1.0],[0.53,-0.45],[0.60,0],[0.70,0.22],[0.80,0],[1.0,0]];
  let d = `M0,${b.toFixed(1)}`;
  for (let i = 0; i < beats; i++) {
    const x0 = i * seg;
    shape.forEach(([fx, fy]) => {
      d += ` L${(x0 + fx*seg).toFixed(1)},${(b - fy*A).toFixed(1)}`;
    });
  }
  return d;
}

function EcgLine({ amp, color, width = 220, height = 48, beats = 3, animate = false }) {
  const ref = useRef(null);
  const d = buildEcg(width, height, amp, beats);
  useEffect(() => {
    if (!animate || !ref.current) return;
    const path = ref.current, len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    const start = Date.now(), dur = 1600;
    let raf;
    const go = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      path.style.strokeDashoffset = len * (1 - p);
      if (p < 1) raf = requestAnimationFrame(go);
    };
    raf = requestAnimationFrame(go);
    return () => cancelAnimationFrame(raf);
  }, [animate, d]);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path ref={ref} d={d} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Confetti({ active }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const cvs = ref.current;
    const ctx = cvs.getContext("2d");
    const W = document.documentElement.clientWidth || 600;
    const H = document.documentElement.clientHeight || 900;
    cvs.width = W;
    cvs.height = H;
    const cols = [BRAND.magenta, BRAND.gold, BRAND.goldLight, BRAND.white, BRAND.lavender, BRAND.indigoMid, "#c43acb", "#d1b059"];
    const ps = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: -20 - Math.random() * 200,
      w: 5 + Math.random() * 8, h: 3 + Math.random() * 5,
      c: cols[Math.floor(Math.random() * cols.length)],
      vy: 1.5 + Math.random() * 3.5, vx: -1.5 + Math.random() * 3,
      r: Math.random() * 360, vr: -4 + Math.random() * 8, o: 1,
    }));
    let frame = 0, raf;
    const go = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      ps.forEach(p => {
        if (p.o <= 0) return; alive = true;
        p.y += p.vy; p.x += p.vx; p.r += p.vr; p.vy += 0.035;
        if (p.y > H * 0.75) p.o -= 0.012;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.o); ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      frame++;
      if (alive && frame < 400) raf = requestAnimationFrame(go);
    };
    go();
    return () => cancelAnimationFrame(raf);
  }, [active]);
  if (!active) return null;
  return <canvas ref={ref} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999 }} />;
}

// Renders either the emoji icon or the road SVG for Specialized Lane
function VitalIcon({ vital, size = 24, color = BRAND.indigoMid }) {
  if (vital.useCustomIcon) {
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
        {/* Road perspective shape */}
        <path d="M10 24 L13 4 L15 4 L18 24 Z" fill={color} opacity="0.85"/>
        {/* Dashed center line */}
        <rect x="13.2" y="7" width="1.6" height="2.5" rx="0.8" fill="white" opacity="0.85"/>
        <rect x="13.2" y="11.5" width="1.6" height="2.5" rx="0.8" fill="white" opacity="0.85"/>
        <rect x="13.2" y="16" width="1.6" height="2.5" rx="0.8" fill="white" opacity="0.85"/>
        {/* Road base line */}
        <line x1="7" y1="24" x2="21" y2="24" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    );
  }
  return <span style={{ fontSize: size }}>{vital.icon}</span>;
}

function StrongLooks({ text, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16, borderTop: `1px solid ${BRAND.lavenderMid}`, paddingTop: 16 }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
        <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 1.2, fontWeight: 700, color, textTransform: "uppercase" }}>What a Strong Pulse Looks Like</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#7a6895", transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)", display: "inline-block" }}>▼</span>
      </button>
      {open && <p style={{ fontSize: 15, lineHeight: 1.9, color: "#3a2e5a", margin: "14px 0 0", fontFamily: "'Lato',sans-serif" }}>{text}</p>}
    </div>
  );
}

export default function OfferPulseCheck() {
  const [phase, setPhase]       = useState("welcome");
  const [vIdx, setVIdx]         = useState(0);
  const [qIdx, setQIdx]         = useState(0);
  const [answers, setAnswers]   = useState({});
  const [sliding, setSliding]   = useState(false);
  const [slideDir, setSlideDir] = useState("right");
  const [confetti, setConfetti] = useState(false);

  const flat = VITALS.flatMap((v, vi) => v.questions.map((q, qi) => ({ ...q, vi, qi, vital: v })));
  const TOTAL = flat.length;
  const globalIdx = flat.findIndex(f => f.vi === vIdx && f.qi === qIdx);
  const answered = Object.keys(answers).length;
  const curQ = flat[globalIdx];
  const curAns = answers[globalIdx];

  const vitalScore = (vid) => {
    let sum = 0;
    flat.forEach((f, gi) => { if (f.vital.id === vid && answers[gi] !== undefined) sum += answers[gi]; });
    return sum;
  };
  const lowestVital = () => [...VITALS].sort((a, b) => vitalScore(a.id) - vitalScore(b.id))[0];

  const doTrans = (dir, cb) => {
    setSlideDir(dir); setSliding(true);
    setTimeout(() => { cb(); setTimeout(() => setSliding(false), 50); }, 240);
  };

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [globalIdx]: val });
    setTimeout(() => {
      if (qIdx < VITALS[vIdx].questions.length - 1) doTrans("right", () => setQIdx(qIdx + 1));
      else if (vIdx < VITALS.length - 1) doTrans("right", () => { setVIdx(vIdx + 1); setQIdx(0); });
      else { setPhase("results"); setTimeout(() => setConfetti(true), 350); }
    }, 280);
  };

  const goPrev = () => {
    if (globalIdx === 0) return;
    if (qIdx > 0) doTrans("left", () => setQIdx(qIdx - 1));
    else doTrans("left", () => { setVIdx(vIdx - 1); setQIdx(VITALS[vIdx - 1].questions.length - 1); });
  };

  const restart = () => { setPhase("welcome"); setVIdx(0); setQIdx(0); setAnswers({}); setConfetti(false); };

  // ── SHARED COMPONENTS ────────────────────────────────────────────────────
  const FontStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700;1,800&family=Lato:wght@300;400;700;900&family=Allura&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-size: 16px; }
    `}</style>
  );

  const GradBg = ({ children }) => (
    <div style={{
      background: `linear-gradient(135deg, ${BRAND.indigoDark} 0%, ${BRAND.indigoMid} 35%, #7b2d8b 62%, #3d1a7a 80%, ${BRAND.indigoDark} 100%)`,
      position: "relative", overflow: "hidden"
    }}>
      {/* Magenta bloom bottom left */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          radial-gradient(ellipse 55% 40% at 0% 100%, rgba(196,58,203,0.35) 0%, transparent 70%),
          radial-gradient(ellipse 45% 35% at 100% 0%, rgba(209,176,89,0.22) 0%, transparent 65%),
          radial-gradient(ellipse 30% 30% at 75% 85%, rgba(212,197,253,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 25% 25% at 20% 20%, rgba(236,213,149,0.12) 0%, transparent 55%)
        `,
      }} />
      {/* Gold star sprinkles */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.28, pointerEvents: "none",
        backgroundImage: `
          radial-gradient(circle 1.5px at 12% 25%, ${BRAND.gold} 100%, transparent 100%),
          radial-gradient(circle 1px at 72% 18%, ${BRAND.gold} 100%, transparent 100%),
          radial-gradient(circle 2px at 48% 60%, ${BRAND.goldLight} 100%, transparent 100%),
          radial-gradient(circle 1px at 83% 72%, ${BRAND.gold} 100%, transparent 100%),
          radial-gradient(circle 1.5px at 8% 65%, ${BRAND.goldLight} 100%, transparent 100%),
          radial-gradient(circle 1px at 91% 42%, ${BRAND.gold} 100%, transparent 100%),
          radial-gradient(circle 1px at 58% 12%, ${BRAND.gold} 100%, transparent 100%),
          radial-gradient(circle 1.5px at 33% 88%, ${BRAND.goldLight} 100%, transparent 100%),
          radial-gradient(circle 1px at 65% 45%, ${BRAND.gold} 100%, transparent 100%)
        `,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );

  const Masthead = () => (
    <div style={{ background: "rgba(0,0,0,0.22)", borderBottom: `1px solid rgba(255,255,255,0.1)`, padding: "13px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#fff", fontWeight: 700 }}>ON A MISSION BRANDS</span>
        <span style={{ fontFamily: "'Allura',cursive", fontSize: 18, color: BRAND.gold, letterSpacing: 1 }}>Offer Diagnostic</span>
      </div>
    </div>
  );

  const Footer = () => (
    <div style={{ background: BRAND.indigoDark, padding: "40px 24px", textAlign: "center", borderTop: `1px solid rgba(255,255,255,0.12)` }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Allura',cursive", fontSize: 30, color: BRAND.gold, marginBottom: 8 }}>On a Mission Brands</div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 18, lineHeight: 1.7, fontFamily: "'Lato',sans-serif" }}>
          Aligned, sellable offer ecosystems · onamissionbrands.com
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 18 }}>
          {[
            { label: "Privacy Policy", href: "https://www.onamissionbrands.com/privacy-policy" },
            { label: "Terms & Conditions", href: "https://www.onamissionbrands.com/terms-and-conditions" },
            { label: "Contact", href: "https://www.onamissionbrands.com" },
          ].map(l => (
            <a key={l.label} href={l.href} style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: 700 }}>{l.label}</a>
          ))}
        </div>
        <div style={{ width: 32, height: "1px", background: `rgba(255,255,255,0.15)`, margin: "0 auto 14px" }} />
        <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>THE OFFER PULSE CHECK</div>
      </div>
    </div>
  );

  // ── WELCOME ──────────────────────────────────────────────────────────────
  if (phase === "welcome") return (
    <div style={{ fontFamily: "'Lato',sans-serif", background: BRAND.lavenderPale, minHeight: "100vh" }}>
      <FontStyle />
      <GradBg>
        <Masthead />
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "52px 24px 12px", textAlign: "center" }}>
          <div style={{ width: 48, height: 2, background: BRAND.gold, margin: "0 auto 22px", borderRadius: 2 }} />
          <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, letterSpacing: 4, textTransform: "uppercase", color: BRAND.gold, marginBottom: 18, fontWeight: 700 }}>FREE OFFER DIAGNOSTIC</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: "clamp(34px,5.5vw,54px)", color: "#fff", lineHeight: 1.05, marginBottom: 6 }}>The Offer</div>
          <div style={{ fontFamily: "'Allura',cursive", fontSize: "clamp(38px,6vw,62px)", color: BRAND.gold, lineHeight: 1.1, marginBottom: 20 }}>Pulse Check</div>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 18, color: "#fff", lineHeight: 1.7, maxWidth: 430, margin: "0 auto 12px" }}>
            Is your offer magnetic or is it muted by the noise?
          </p>
        </div>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "6px 24px 18px", opacity: 0.9 }}>
          <EcgLine amp={1} color={BRAND.magenta} width={520} height={56} beats={4} animate />
        </div>
        <div style={{ textAlign: "center", paddingBottom: 46 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: BRAND.goldLight, border: `1px solid ${BRAND.gold}`, borderRadius: 4, padding: "9px 20px" }}>
            <span style={{ fontSize: 14, color: BRAND.indigoDark }}>♥</span>
            <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, letterSpacing: 2, color: BRAND.indigoDark, fontWeight: 700 }}>15 QUESTIONS · UNDER 10 MINUTES</span>
          </div>
        </div>
      </GradBg>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ background: BRAND.white, border: `1px solid rgba(78,48,161,0.1)`, borderRadius: 14, padding: "34px 30px", marginTop: 28, marginBottom: 18, boxShadow: "0 6px 32px rgba(31,27,113,0.09)" }}>
          <p style={{ fontSize: 16, lineHeight: 1.9, color: "#3a2e5a", marginBottom: 26, textAlign: "center", fontFamily: "'Lato',sans-serif" }}>
            A magnetic offer has a strong pulse in every vital sign. This check reads all five — because your offer can be thriving in one area and struggling in another. You walk away knowing exactly where the energy is strong and where it needs attention.
          </p>

          {/* Vital signs grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 7, marginBottom: 26 }}>
            {VITALS.map((v, i) => (
              <div key={i} style={{ background: BRAND.lavenderPale, border: `1px solid rgba(78,48,161,0.1)`, borderRadius: 10, padding: "13px 5px", textAlign: "center" }}>
                <div style={{ marginBottom: 8, display: "flex", justifyContent: "center", alignItems: "center", height: 26 }}>
                  <VitalIcon vital={v} size={22} color={BRAND.indigoMid} />
                </div>
                <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 8, letterSpacing: 0.8, textTransform: "uppercase", color: "#5a4a7a", lineHeight: 1.4, fontWeight: 700 }}>{v.name}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 26 }}>
            {[{ value: "15", label: "Questions" }, { value: "5", label: "Vital Signs" }, { value: "<10", label: "Minutes" }].map((s, i) => (
              <div key={i} style={{ background: BRAND.lavenderMid, borderRadius: 8, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 28, color: BRAND.indigoMid, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#6a5a8a", marginTop: 6, fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{ background: BRAND.lavenderMid, border: `1px solid rgba(78,48,161,0.12)`, borderRadius: 8, padding: "14px 18px", marginBottom: 26, display: "flex", gap: 14 }}>
            <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 1.2, fontWeight: 700, color: BRAND.indigoMid, textTransform: "uppercase", whiteSpace: "nowrap", paddingTop: 2 }}>HOW IT WORKS</span>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#3a2e5a", margin: 0, fontFamily: "'Lato',sans-serif" }}>Answer fifteen questions by choosing the response that fits you best. Answer honestly based on where your offer is right now, not where you want it to be. Your full pulse reading — vital sign by vital sign — appears at the end.</p>
          </div>

          <button onClick={() => setPhase("quiz")}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", background: `linear-gradient(135deg, ${BRAND.indigoDark}, ${BRAND.indigoMid})`, color: "#fff", fontFamily: "'Lato',sans-serif", fontSize: 13, letterSpacing: 2.5, textTransform: "uppercase", padding: "19px 24px", borderRadius: 4, border: "none", cursor: "pointer", fontWeight: 700 }}>
            CHECK MY PULSE →
          </button>
        </div>

        {/* What you receive */}
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 2.5, fontWeight: 700, color: "#5a4a7a", textTransform: "uppercase", marginBottom: 14, paddingLeft: 4 }}>WHAT YOU WILL RECEIVE</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { color: BRAND.magenta,   text: "A pulse reading for each of your five vital signs" },
              { color: BRAND.indigoMid, text: "What each reading means for your specific offer" },
              { color: BRAND.gold,      text: "A picture of what a strong pulse looks like in every area" },
              { color: BRAND.lavender,  text: "A gentle nudge toward the vital sign to strengthen first" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: BRAND.white, border: `1px solid rgba(78,48,161,0.08)`, borderRadius: 10, padding: "15px 15px" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill={item.color} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M10 17.5S2 12.5 2 7a4 4 0 0 1 8-1h0a4 4 0 0 1 8 1c0 5.5-8 10.5-8 10.5Z"/>
                </svg>
                <p style={{ fontSize: 14, color: "#3a2e5a", lineHeight: 1.65, margin: 0, fontFamily: "'Lato',sans-serif" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  // ── QUIZ ─────────────────────────────────────────────────────────────────
  if (phase === "quiz") {
    const pct = (answered / TOTAL) * 100;
    const isFirst = globalIdx === 0;
    const v = VITALS[vIdx];
    return (
      <div style={{ fontFamily: "'Lato',sans-serif", background: BRAND.lavenderPale, minHeight: "100vh" }}>
        <FontStyle />
        <GradBg>
          <Masthead />
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "18px 24px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <VitalIcon vital={v} size={18} color="#fff" />
                <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, letterSpacing: 1.5, color: "#fff", textTransform: "uppercase", fontWeight: 700 }}>Vital Sign {v.num} · {v.name}</span>
              </span>
              <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 13, fontWeight: 900, color: BRAND.gold }}>{answered}/{TOTAL}</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 5, background: "rgba(255,255,255,0.14)", borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${BRAND.indigoMid}, ${BRAND.magenta})`, borderRadius: 3, transition: "width .4s cubic-bezier(.34,1.56,.64,1)" }} />
            </div>
            {/* Dot progress */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
              {VITALS.map((vv, i) => (
                <div key={i} style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  {vv.questions.map((_, qi) => {
                    const gi = flat.findIndex(f => f.vi === i && f.qi === qi);
                    const isCur = gi === globalIdx, isDone = answers[gi] !== undefined;
                    return <div key={qi} style={{ width: isCur ? 20 : 7, height: 7, borderRadius: 3, background: isCur ? BRAND.gold : isDone ? BRAND.magenta : "rgba(255,255,255,0.2)", transition: "all .3s" }} />;
                  })}
                  {i < VITALS.length - 1 && <div style={{ width: 4 }} />}
                </div>
              ))}
            </div>
          </div>
        </GradBg>

        <div style={{ maxWidth: 600, margin: "0 auto", padding: "26px 24px 60px" }}>
          <div style={{ opacity: sliding ? 0 : 1, transform: sliding ? `translateX(${slideDir === "right" ? 32 : -32}px)` : "translateX(0)", transition: "all .24s ease" }}>

            {/* Vital sign header card */}
            {qIdx === 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, background: BRAND.white, border: `1px solid rgba(78,48,161,0.1)`, borderRadius: 10, padding: "18px 22px", marginBottom: 18, borderLeft: `4px solid ${BRAND.gold}` }}>
                <div style={{ width: 50, height: 50, background: BRAND.lavenderMid, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <VitalIcon vital={v} size={24} color={BRAND.indigoMid} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a7aaa", marginBottom: 4, fontWeight: 700 }}>Vital Sign {v.num}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20, color: BRAND.indigoDark }}>{v.name}</div>
                </div>
              </div>
            )}

            {/* Question card */}
            <div style={{ background: BRAND.white, border: `1px solid rgba(78,48,161,0.1)`, borderRadius: 10, padding: "26px 26px", marginBottom: 16, boxShadow: "0 2px 16px rgba(31,27,113,0.07)" }}>
              <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8a7aaa", marginBottom: 14, fontWeight: 700 }}>QUESTION {qIdx + 1} OF {v.questions.length}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "clamp(17px,3vw,21px)", color: BRAND.indigoDark, lineHeight: 1.5 }}>{curQ.q}</div>
            </div>

            {/* Answer options */}
            <div style={{ marginBottom: 22 }}>
              {curQ.options.map((opt, i) => {
                const sel = curAns === opt.v;
                return (
                  <button key={i} onClick={() => handleAnswer(opt.v)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14, width: "100%", padding: "16px 18px", borderRadius: 8, border: `1px solid ${sel ? "rgba(78,48,161,0.4)" : "rgba(78,48,161,0.1)"}`, background: sel ? BRAND.lavenderMid : BRAND.white, cursor: "pointer", transition: "all .18s", textAlign: "left", marginBottom: 10, boxShadow: sel ? `0 2px 12px rgba(78,48,161,0.14)` : "none" }}
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = BRAND.lavenderPale; e.currentTarget.style.borderColor = "rgba(78,48,161,0.25)"; } }}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = BRAND.white; e.currentTarget.style.borderColor = "rgba(78,48,161,0.1)"; } }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1, border: `2px solid ${sel ? BRAND.indigoMid : "#c5bade"}`, background: sel ? BRAND.indigoMid : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .18s" }}>
                      {sel && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 15, lineHeight: 1.65, fontWeight: sel ? 700 : 400, color: sel ? BRAND.indigoDark : "#3a2e5a", transition: "all .18s", fontFamily: "'Lato',sans-serif" }}>{opt.t}</span>
                  </button>
                );
              })}
            </div>

            {/* Back / status row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 18, borderTop: `1px solid ${BRAND.lavenderMid}` }}>
              <button onClick={goPrev} disabled={isFirst}
                style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 1.5, color: isFirst ? "#c8c0de" : BRAND.indigoMid, background: "none", border: "none", cursor: isFirst ? "default" : "pointer", padding: "10px 0", textTransform: "uppercase", fontWeight: 700 }}>
                ← BACK
              </button>
              <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, letterSpacing: 0.5, color: "#6a5a8a", fontWeight: 400 }}>
                {curAns === undefined ? "Choose your answer" : "Answer recorded ✓"}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────
  if (phase === "results") {
    const low = lowestVital();
    return (
      <div style={{ fontFamily: "'Lato',sans-serif", background: BRAND.lavenderPale, minHeight: "100vh" }}>
        <FontStyle />
        <Confetti active={confetti} />

        <GradBg>
          <Masthead />
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "50px 24px 22px", textAlign: "center" }}>
            <div style={{ width: 48, height: 2, background: BRAND.gold, margin: "0 auto 22px", borderRadius: 2 }} />
            <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: BRAND.gold, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700 }}>
              <span>♥</span> PULSE CHECK COMPLETE
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: "clamp(28px,4.5vw,44px)", color: "#fff", lineHeight: 1.08, marginBottom: 4 }}>Your Offer's</div>
            <div style={{ fontFamily: "'Allura',cursive", fontSize: "clamp(34px,5.5vw,54px)", color: BRAND.gold, lineHeight: 1.15, marginBottom: 20 }}>Pulse Reading</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 17, color: "#fff", lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>Here is the pulse of your offer across all five vital signs</p>
          </div>

          {/* Overview strip */}
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "10px 24px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {VITALS.map((v, i) => {
                const sc = vitalScore(v.id), b = bandFor(sc);
                const ecgColor = b.key === "strong" ? BRAND.gold : b.key === "steady" ? BRAND.magenta : b.key === "weak" ? BRAND.goldLight : "#f9ebf9";
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "13px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <VitalIcon vital={v} size={16} color="#fff" />
                      <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 0.5, color: "#fff", textTransform: "uppercase", fontWeight: 700 }}>{v.name}</span>
                    </div>
                    <div style={{ height: 24, marginBottom: 8 }}>
                      <EcgLine amp={b.amp} color={ecgColor} width={200} height={24} beats={2} />
                    </div>
                    <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: b.textOnColor, background: b.color, padding: "3px 10px", borderRadius: 3 }}>{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </GradBg>

        <div style={{ maxWidth: 600, margin: "0 auto", padding: "30px 24px 60px" }}>

          {/* Per vital sign detail cards */}
          {VITALS.map((v, i) => {
            const sc = vitalScore(v.id), b = bandFor(sc);
            const accent = b.color;
            return (
              <div key={i} style={{ background: BRAND.white, border: `1px solid rgba(78,48,161,0.08)`, borderLeft: `5px solid ${accent}`, borderRadius: "0 12px 12px 0", padding: "26px 26px", marginBottom: 16, boxShadow: "0 2px 16px rgba(31,27,113,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 50, height: 50, background: b.bg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <VitalIcon vital={v} size={24} color={accent === BRAND.goldLight || accent === "#ecd595" || accent === "#f9ebf9" ? BRAND.indigoMid : accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a7aaa", marginBottom: 3, fontWeight: 700 }}>Vital Sign {v.num}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 21, color: BRAND.indigoDark, lineHeight: 1.15 }}>{v.name}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ flex: 1, height: 32 }}>
                    <EcgLine amp={b.amp} color={accent} width={300} height={32} beats={3} />
                  </div>
                  <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: b.textOnColor, background: accent, padding: "6px 14px", borderRadius: 4, whiteSpace: "nowrap" }}>{b.label}</span>
                </div>

                <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 1.5, fontWeight: 700, color: accent === "#ecd595" || accent === "#f9ebf9" ? BRAND.indigoMid : accent, textTransform: "uppercase", marginBottom: 10 }}>What Your Score Means</div>
                <p style={{ fontSize: 15, lineHeight: 1.9, color: "#3a2e5a", margin: 0, fontFamily: "'Lato',sans-serif" }}>{v.means[b.key]}</p>

                <StrongLooks text={v.strongLooks} color={accent === "#ecd595" || accent === "#f9ebf9" ? BRAND.indigoMid : accent} />
              </div>
            );
          })}

          {/* Gentle nudge */}
          <div style={{ background: BRAND.white, border: `1px solid rgba(78,48,161,0.1)`, borderRadius: 10, padding: "26px 26px", marginBottom: 22, boxShadow: "0 2px 16px rgba(31,27,113,0.05)" }}>
            <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 2, fontWeight: 700, color: "#8a7aaa", textTransform: "uppercase", marginBottom: 10 }}>A GENTLE STARTING POINT</div>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: "#3a2e5a", margin: 0, fontFamily: "'Lato',sans-serif" }}>
              Your offer does not need a strong pulse everywhere at once. If you want one place to begin, look first at <span style={{ fontWeight: 700, color: BRAND.indigoMid, fontStyle: "italic", fontFamily: "'Playfair Display',serif" }}>{low.name}</span>. Strengthening the vital sign with the faintest pulse tends to lift everything around it — and it is often the difference between an offer that is merely available and one that is truly magnetic.
            </p>
          </div>

          {/* CTA */}
          <div style={{ background: `linear-gradient(150deg, ${BRAND.indigoDark} 0%, ${BRAND.indigoMid} 65%, #2d1a6e 100%)`, borderRadius: 12, padding: "44px 30px", textAlign: "center", position: "relative", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 20% 80%, rgba(212,197,253,0.16) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(196,58,203,0.14) 0%, transparent 50%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 36, height: 2, background: BRAND.gold, margin: "0 auto 22px", borderRadius: 2 }} />
              <div style={{ marginBottom: 20, opacity: 0.85 }}>
                <EcgLine amp={1} color={BRAND.magenta} width={300} height={38} beats={3} animate />
              </div>
              <div style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: BRAND.gold, marginBottom: 14, fontWeight: 700 }}>READY TO GO DEEPER?</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: "clamp(22px,4vw,30px)", color: "#fff", marginBottom: 6, lineHeight: 1.15 }}>Find out what it takes to make your offer</div>
              <div style={{ fontFamily: "'Allura',cursive", fontSize: "clamp(28px,5vw,42px)", color: BRAND.gold, marginBottom: 22, lineHeight: 1.2 }}>truly magnetic and sellable</div>
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 15, color: "#fff", lineHeight: 1.85, maxWidth: 440, margin: "0 auto 28px" }}>
                The Offer X-Ray goes deeper. It walks your offer through the six layers of the offer lifecycle: positioning, structure, ecosystem, messaging, visibility, and sales. Find out what's working, where the fractures are, and the clearest path to making your offer wildly buyable. You will receive a highly personalized PDF report customized to your specific offer.
              </p>
              <a href="https://www.onamissionbrands.com/offer-x-ray"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, background: BRAND.gold, color: BRAND.indigoDark, fontFamily: "'Lato',sans-serif", fontSize: 12, letterSpacing: 2, fontWeight: 900, padding: "17px 34px", borderRadius: 4, textDecoration: "none" }}>
                TAKE THE OFFER X-RAY →
              </a>
            </div>
          </div>

          <button onClick={restart}
            style={{ display: "block", width: "100%", background: "none", border: `1px solid rgba(78,48,161,0.18)`, color: "#6a5a8a", fontFamily: "'Lato',sans-serif", fontSize: 12, letterSpacing: 2, padding: "15px", borderRadius: 4, cursor: "pointer", textTransform: "uppercase", fontWeight: 700 }}>
            CHECK PULSE AGAIN
          </button>
        </div>
        <Footer />
      </div>
    );
  }
  return null;
}
