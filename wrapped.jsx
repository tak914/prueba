import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Config ───────────────────────────────────────────────────────────────────
const GIFT_TAPS_REQUIRED = 20;
const SLIDE_DURATION = 9000;

const SLIDE_DATA = [
  { id: 0, suspense: null, type: "intro" },
  {
    id: 1,
    suspense: { icon: "🌙", line1: "Hubo noches", line2: "que ningún reloj midió…" },
    type: "stats",
    props: {
      emoji: "🌙", title: "Noches sin dormir", stat: "247",
      sub: "noches hablando hasta el amanecer, mirando el techo y dejando pasar el tiempo",
      color1: "#00e5ff", color2: "#7c3aed", img: "/assets/foto1.jpg",
    },
  },
  {
    id: 2,
    suspense: { icon: "😂", line1: "Hubo un número", line2: "que no cabe en ninguna foto…" },
    type: "stats",
    props: {
      emoji: "😂", title: "Risas contadas", stat: "+3.200",
      sub: "carcajadas, memes compartidos y chistes que solo entienden ustedes dos",
      color1: "#fbbf24", color2: "#f472b6", img: "/assets/foto2.jpg",
    },
  },
  {
    id: 3,
    suspense: { icon: "🗺️", line1: "Cada kilómetro", line2: "tiene una historia…" },
    type: "stats",
    props: {
      emoji: "🌊", title: "Aventuras compartidas", stat: "52",
      sub: "planes, escapadas y momentos que cambiaron todo para siempre",
      color1: "#34d399", color2: "#00bfff", img: "/assets/foto3.jpg",
    },
  },
  {
    id: 4,
    suspense: { icon: "🍕", line1: "Hubo comidas", line2: "que se volvieron rituales…" },
    type: "stats",
    props: {
      emoji: "🍕", title: "Pedidos a medianoche", stat: "89",
      sub: "delivery, picadas, antojos y cenas que duraron tres horas",
      color1: "#fb923c", color2: "#ef4444", img: "/assets/foto4.jpg",
    },
  },
  {
    id: 5,
    suspense: { icon: "🎵", line1: "Sonó una canción", line2: "y fue tuya para siempre…" },
    type: "stats",
    props: {
      emoji: "🎵", title: "Canciones en loop", stat: "1.847",
      sub: "minutos de música que marcaron cada momento juntos",
      color1: "#a78bfa", color2: "#ec4899", img: "/assets/foto5.jpg",
    },
  },
  {
    id: 6,
    suspense: { icon: "💬", line1: "Algunas palabras", line2: "no se olvidan jamás…" },
    type: "quote",
    props: {
      quote: "No sé qué haría sin vos. En serio.",
      author: "— Vos, un martes a las 2am",
      color1: "#a78bfa", color2: "#ec4899",
    },
  },
  {
    id: 7,
    suspense: { icon: "🎬", line1: "Y hubo un momento", line2: "que quedó grabado para siempre…" },
    type: "video",
  },
  {
    id: 8,
    suspense: { icon: "🎁", line1: "Pero lo mejor", line2: "todavía no llegó…" },
    type: "gift",
  },
];

const TOTAL_SLIDES = SLIDE_DATA.length;

// ─── Componentes visuales ─────────────────────────────────────────────────────

function GlassCard({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-3xl border border-white/20 ${className}`}
      style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 40px rgba(0,80,180,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Orb({ size, x, y, color, delay = 0 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color, filter: "blur(70px)", opacity: 0.45 }}
      animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.55, 0.35] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function ProgressBar({ current, progress }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex gap-1 p-3 px-4">
      {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
        <div key={i} className="flex-1 h-[3px] rounded-full bg-white/15 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={false}
            animate={{ width: i < current ? "100%" : i === current ? `${progress * 100}%` : "0%" }}
            transition={{ duration: 0.1 }}
          />
        </div>
      ))}
    </div>
  );
}

function Confetti({ active }) {
  const pieces = useRef(
    Array.from({ length: 75 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#00e5ff", "#7c3aed", "#f472b6", "#fbbf24", "#34d399", "#fb923c"][i % 6],
      delay: Math.random() * 0.7,
      size: 5 + Math.random() * 9,
      rot: Math.random() * 720,
      dur: 2 + Math.random() * 1.8,
    }))
  ).current;
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((p) => (
        <motion.div key={p.id} className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: -20, width: p.size, height: p.size, background: p.color }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "115vh", rotate: p.rot, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ─── Pantalla de Suspenso ─────────────────────────────────────────────────────

function SuspenseScreen({ data, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2700);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-white text-center px-10 gap-7 relative overflow-hidden">
      <Orb size={300} x="-60px" y="8%" color="radial-gradient(circle,#00bfff,transparent)" delay={0} />
      <Orb size={240} x="55%" y="45%" color="radial-gradient(circle,#7c3aed,transparent)" delay={1} />

      {/* Partículas flotantes */}
      {[...Array(10)].map((_, i) => (
        <motion.div key={i}
          className="absolute rounded-full bg-white/30"
          style={{ width: 3, height: 3, left: `${8 + i * 9}%`, top: `${15 + (i % 4) * 20}%` }}
          animate={{ y: [-10, 10, -10], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2.2 + i * 0.25, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}

      <motion.div
        className="text-7xl"
        initial={{ scale: 0, rotate: -20, opacity: 0 }}
        animate={{ scale: [0, 1.35, 1], rotate: [-20, 8, 0], opacity: [0, 1, 1] }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        style={{ filter: "drop-shadow(0 0 32px rgba(0,200,255,0.75))" }}
      >
        {data.icon}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}>
        <p className="text-2xl font-light text-white/60 mb-2">{data.line1}</p>
        <p
          className="text-3xl font-black"
          style={{ background: "linear-gradient(135deg,#fff 20%,#00e5ff 60%,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {data.line2}
        </p>
      </motion.div>

      {/* Barra de carga */}
      <div className="w-52 flex flex-col items-center gap-2 mt-2">
        <div className="w-full h-[2px] rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#00e5ff,#7c3aed,#f472b6)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </div>
        <motion.p
          className="text-white/30 text-[10px] uppercase tracking-[0.3em]"
          animate={{ opacity: [0.25, 0.65, 0.25] }}
          transition={{ repeat: Infinity, duration: 1.3 }}
        >
          cargando tu historia…
        </motion.p>
      </div>
    </div>
  );
}

// ─── Slides ───────────────────────────────────────────────────────────────────

function SlideIntro() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-white px-8 text-center gap-6">
      <Orb size={320} x="-80px" y="-60px" color="radial-gradient(circle,#00bfff,transparent)" delay={0} />
      <Orb size={270} x="55%" y="50%" color="radial-gradient(circle,#7c3aed,transparent)" delay={2} />
      <Orb size={190} x="25%" y="72%" color="radial-gradient(circle,#f472b6,transparent)" delay={3} />

      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 110, delay: 0.2 }}>
        <div className="text-7xl" style={{ filter: "drop-shadow(0 0 28px rgba(0,200,255,0.85))" }}>✨</div>
      </motion.div>

      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
        <p className="text-white/45 text-base font-light tracking-[0.32em] uppercase mb-3">Tu año en modo</p>
        <h1
          className="text-7xl font-black tracking-tight"
          style={{ background: "linear-gradient(135deg,#fff 25%,#00e5ff 70%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(0,200,255,0.45))" }}
        >
          Wrapped
        </h1>
        <p className="text-white/35 mt-4 text-sm">Tocá el costado · Deslizá arriba para avanzar</p>
      </motion.div>

      <motion.div
        className="w-6 h-10 rounded-full border-2 border-white/25 flex items-start justify-center p-1 mt-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
      >
        <div className="w-1.5 h-3 rounded-full bg-white/45" />
      </motion.div>
    </div>
  );
}

function SlideStats({ emoji, title, stat, sub, color1, color2, img }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-5 text-white">
      <Orb size={290} x="-50px" y="5%" color={`radial-gradient(circle,${color1},transparent)`} delay={0} />
      <Orb size={230} x="52%" y="52%" color={`radial-gradient(circle,${color2},transparent)`} delay={1.5} />

      <motion.div
        initial={{ scale: 0.78, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 14, delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <GlassCard className="overflow-hidden">
          <div className="relative w-full h-56 overflow-hidden rounded-t-3xl bg-white/5">
            <img src={img} alt={title} className="w-full h-full object-cover opacity-60"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="text-[4.8rem]"
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                style={{ filter: `drop-shadow(0 0 24px ${color1})` }}
              >
                {emoji}
              </motion.div>
            </div>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(2,11,26,0.75), transparent 50%)" }} />
          </div>
          <div className="p-6 pt-5">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{title}</p>
            <motion.p
              className="text-6xl font-black leading-none"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              style={{ background: `linear-gradient(135deg,#fff,${color1})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {stat}
            </motion.p>
            <motion.p className="text-white/60 mt-3 text-sm leading-relaxed"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            >
              {sub}
            </motion.p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function SlideQuote({ quote, author, color1, color2 }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-6 text-white">
      <Orb size={280} x="-40px" y="15%" color={`radial-gradient(circle,${color1},transparent)`} delay={0} />
      <Orb size={220} x="50%" y="50%" color={`radial-gradient(circle,${color2},transparent)`} delay={1.5} />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.15 }}
        className="w-full max-w-sm"
      >
        <GlassCard className="p-8 flex flex-col gap-5">
          <motion.div
            className="text-5xl"
            initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 20px ${color1})` }}
          >
            💬
          </motion.div>
          <motion.p
            className="text-[1.6rem] font-bold leading-snug"
            style={{ background: `linear-gradient(135deg,#fff,${color1})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            "{quote}"
          </motion.p>
          <motion.p className="text-white/40 text-sm italic"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          >
            {author}
          </motion.p>
          <div className="flex gap-1 mt-1">
            {[color1, color2, "#ffffff55"].map((c, i) => (
              <motion.div key={i} className="h-[3px] rounded-full" style={{ background: c }}
                initial={{ width: 0 }} animate={{ width: 20 + i * 18 }}
                transition={{ delay: 0.85 + i * 0.1 }}
              />
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function SlideVideo() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-5 text-white">
      <Orb size={300} x="20%" y="-40px" color="radial-gradient(circle,#f472b6,transparent)" delay={0} />
      <Orb size={200} x="-20px" y="55%" color="radial-gradient(circle,#00bfff,transparent)" delay={2} />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <GlassCard className="p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl" style={{ filter: "drop-shadow(0 0 16px #f472b6)" }}>🎬</span>
            <p className="text-white/45 text-xs uppercase tracking-widest">El momento del año</p>
          </div>
          <div className="w-full rounded-2xl overflow-hidden bg-black/30 flex items-center justify-center"
            style={{ minHeight: 200, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <video src="/assets/video.mp4" controls playsInline className="w-full rounded-2xl"
              onError={(e) => {
                e.target.parentElement.innerHTML = `<div style="height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:rgba(255,255,255,0.3)"><div style="font-size:3rem">📽️</div><p style="font-size:0.8rem;text-align:center">Colocá tu video en<br/>/assets/video.mp4</p></div>`;
              }}
            />
          </div>
          <p className="text-white/50 text-sm text-center leading-relaxed">Ese momento que guardamos para siempre 💫</p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function SlideGift({ onComplete }) {
  const [taps, setTaps] = useState(0);
  const [exploded, setExploded] = useState(false);
  const [showCake, setShowCake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);

  const remaining = GIFT_TAPS_REQUIRED - taps;
  const progress = taps / GIFT_TAPS_REQUIRED;
  const pct = Math.round(progress * 100);
  const giftScale = 1 + progress * 0.18;
  const glowIntensity = 10 + progress * 35;

  const handleTap = useCallback(() => {
    if (exploded) return;
    setShake(true);
    setTimeout(() => setShake(false), 280);
    setTaps((t) => {
      const next = t + 1;
      if (next >= GIFT_TAPS_REQUIRED) {
        setTimeout(() => {
          setExploded(true);
          setShowConfetti(true);
          setTimeout(() => { setShowCake(true); onComplete?.(); }, 950);
        }, 80);
      }
      return next;
    });
  }, [exploded, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-6 text-white relative overflow-hidden">
      <Confetti active={showConfetti} />
      <Orb size={340} x="-70px" y="-50px" color="radial-gradient(circle,#fbbf24,transparent)" delay={0} />
      <Orb size={260} x="48%" y="48%" color="radial-gradient(circle,#f472b6,transparent)" delay={1.5} />

      <AnimatePresence mode="wait">
        {!showCake ? (
          <motion.div key="gift" className="flex flex-col items-center gap-6 w-full max-w-sm"
            exit={{ scale: 0, opacity: 0, rotate: 15 }} transition={{ duration: 0.45 }}
          >
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <p className="text-white/45 text-xs uppercase tracking-[0.3em] text-center">El regalo</p>
              <h2 className="text-3xl font-black text-center mt-2">¿Te animás a abrirlo?</h2>
            </motion.div>

            <motion.div
              onClick={handleTap}
              animate={
                exploded
                  ? { scale: [giftScale, 2.2, 0], opacity: [1, 1, 0] }
                  : shake
                  ? { rotate: [-7, 7, -5, 5, -2, 2, 0], scale: giftScale }
                  : { y: [0, -8, 0], scale: giftScale }
              }
              transition={
                exploded ? { duration: 0.45 }
                  : shake ? { duration: 0.28 }
                  : { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
              }
              className="cursor-pointer"
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
            >
              <GlassCard className="p-8 flex flex-col items-center gap-2" style={{ minWidth: 190 }}>
                <div className="text-8xl"
                  style={{ filter: `drop-shadow(0 0 ${glowIntensity}px rgba(251,191,36,${0.45 + progress * 0.55}))` }}
                >
                  🎁
                </div>
                <p className="text-white/35 text-xs mt-1">¡Tocá para abrir!</p>
              </GlassCard>
            </motion.div>

            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#00e5ff,#7c3aed,#f472b6,#fbbf24)" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 180 }}
                />
              </div>
              <div className="flex items-center justify-between w-full px-1">
                <p className="text-white/40 text-xs">
                  {remaining > 0 ? `${remaining} toque${remaining !== 1 ? "s" : ""} más` : "¡Abriendo! 🎊"}
                </p>
                <p className="text-white/40 text-xs">{pct}%</p>
              </div>
            </div>

            {progress > 0.7 && !exploded && (
              <motion.p
                className="text-sm font-bold text-center"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                animate={{ opacity: [0.6, 1, 0.6], scale: [0.97, 1.03, 0.97] }}
                transition={{ repeat: Infinity, duration: 0.75 }}
              >
                ¡Ya casi! ✨ ¡Seguí tocando!
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div key="cake" className="flex flex-col items-center gap-5 text-center"
            initial={{ scale: 0, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 85, delay: 0.2 }}
          >
            <GlassCard className="p-8 flex flex-col items-center gap-5 max-w-xs">
              <motion.div
                animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.07, 1] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
              >
                <img src="/assets/torta.png" alt="Torta" className="w-36 h-36 object-contain"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
                />
                <div className="text-8xl hidden" style={{ filter: "drop-shadow(0 0 30px #fbbf24)" }}>🎂</div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <p className="text-white/45 text-xs uppercase tracking-widest mb-3">¡Feliz Cumpleaños!</p>
                <p className="text-2xl font-black leading-snug"
                  style={{ background: "linear-gradient(135deg,#fff,#00e5ff,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  Que este año sea tan especial como vos 💫
                </p>
                <p className="text-white/38 mt-3 text-sm">Con todo el amor del mundo 🌊</p>
              </motion.div>
              <div className="flex gap-1 mt-1">
                {["⭐", "🌟", "✨", "💛", "✨", "🌟", "⭐"].map((s, i) => (
                  <motion.span key={i} className="text-sm"
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.14 }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Render por tipo ──────────────────────────────────────────────────────────

function renderSlide(slide, onGiftComplete) {
  switch (slide.type) {
    case "intro":  return <SlideIntro />;
    case "stats":  return <SlideStats {...slide.props} />;
    case "quote":  return <SlideQuote {...slide.props} />;
    case "video":  return <SlideVideo />;
    case "gift":   return <SlideGift onComplete={onGiftComplete} />;
    default:       return null;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [showSuspense, setShowSuspense] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const currentSlide = SLIDE_DATA[slideIdx];
  const isGift = currentSlide?.type === "gift";

  const goToSlide = useCallback((idx) => {
    if (idx < 0 || idx >= TOTAL_SLIDES) return;
    const target = SLIDE_DATA[idx];
    setProgress(0);
    if (idx > slideIdx && target.suspense) {
      setShowSuspense(true);
    } else {
      setShowSuspense(false);
    }
    setSlideIdx(idx);
  }, [slideIdx]);

  const advanceSlide = useCallback(() => {
    goToSlide(slideIdx + 1);
  }, [slideIdx, goToSlide]);

  useEffect(() => {
    if (paused || isGift || showSuspense) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) { advanceSlide(); return 0; }
        return p + 100 / SLIDE_DURATION;
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [slideIdx, paused, isGift, showSuspense, advanceSlide]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
    setPlaying((p) => !p);
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.y < -50 || info.velocity.y < -300) advanceSlide();
    else if (info.offset.y > 50 || info.velocity.y > 300) goToSlide(slideIdx - 1);
    setTimeout(() => setPaused(false), 300);
  };

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: "#020b1a" }}>
      <audio ref={audioRef} src="/assets/musica.mp3" loop />

      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 15% 15%, rgba(0,120,220,0.28) 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(124,58,237,0.22) 0%, transparent 55%), #020b1a",
      }} />

      <ProgressBar current={slideIdx} progress={showSuspense ? 0 : progress} />

      {/* Zonas toque izq/der */}
      <div className="absolute inset-0 z-10 flex pointer-events-none">
        <div className="w-1/3 h-full pointer-events-auto cursor-pointer"
          onClick={() => !showSuspense && goToSlide(slideIdx - 1)} />
        <div className="w-1/3 h-full" />
        <div className="w-1/3 h-full pointer-events-auto cursor-pointer"
          onClick={() => !isGift && !showSuspense && advanceSlide()} />
      </div>

      {/* Slide + drag */}
      <motion.div className="absolute inset-0 z-20"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.08}
        onDragStart={() => setPaused(true)}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          {showSuspense ? (
            <motion.div key={`sus-${slideIdx}`} className="absolute inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4 }}
            >
              <SuspenseScreen data={currentSlide.suspense} onDone={() => setShowSuspense(false)} />
            </motion.div>
          ) : (
            <motion.div key={`slide-${slideIdx}`} className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.95, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -35 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              {renderSlide(currentSlide, () => setPaused(true))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Botón audio */}
      <motion.button
        className="fixed bottom-8 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center border border-white/20"
        style={{
          background: "rgba(255,255,255,0.09)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 4px 24px rgba(0,180,255,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
        onClick={toggleAudio}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
      >
        <span className="text-white text-lg">{playing ? "⏸" : "▶"}</span>
      </motion.button>

      <div className="fixed bottom-8 left-6 z-50 text-white/22 text-xs tabular-nums">
        {slideIdx + 1} / {TOTAL_SLIDES}
      </div>
    </div>
  );
}