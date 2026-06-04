import { useEffect, useRef, useState, useCallback } from "react";

// ── Custom Cursor ─────────────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const pos = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    // Hide default cursor
    document.documentElement.style.cursor = "none";

    let raf: number;

    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };

      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Trail particles
      trailsRef.current.forEach((el, i) => {
        if (!el) return;
        setTimeout(() => {
          el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
          el.style.opacity = `${0.6 - i * 0.1}`;
        }, i * 30);
      });
    };

    // Smooth ring follow
    const animateRing = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }
      raf = requestAnimationFrame(animateRing);
    };
    raf = requestAnimationFrame(animateRing);

    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    // Detect hoverable elements
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLink = target.closest("a, button, [data-cursor]");
      const isText = target.closest("h1, h2, h3");
      const isImg = target.closest(".menu-card, .gallery-img");
      const cursorLabel = (isLink as HTMLElement)?.dataset?.cursorLabel || "";

      setHovered(!!(isLink || isText || isImg));
      setLabel(cursorLabel);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("mouseover", onOver);

    return () => {
      document.documentElement.style.cursor = "";
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return null;

  const trailCount = 5;

  return (
    <>
      {/* Trail particles */}
      {Array.from({ length: trailCount }).map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) trailsRef.current[i] = el; }}
          className="pointer-events-none fixed top-0 left-0 rounded-full"
          style={{
            zIndex: 99998,
            width: `${6 - i}px`,
            height: `${6 - i}px`,
            marginLeft: `${-(6 - i) / 2}px`,
            marginTop: `${-(6 - i) / 2}px`,
            background: i % 2 === 0 ? "#D4AF37" : "#E8671A",
            opacity: 0,
            transition: `opacity 0.3s ease`,
            filter: "blur(0.5px)",
            willChange: "transform",
          }}
        />
      ))}

      {/* Outer ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{
          zIndex: 99998,
          width: hovered ? "56px" : "36px",
          height: hovered ? "56px" : "36px",
          marginLeft: hovered ? "-28px" : "-18px",
          marginTop: hovered ? "-28px" : "-18px",
          border: `1.5px solid ${hovered ? "#D4AF37" : "rgba(212,175,55,0.5)"}`,
          background: hovered ? "rgba(212,175,55,0.08)" : "transparent",
          transition: "width 0.3s ease, height 0.3s ease, margin 0.3s ease, border-color 0.3s ease, background 0.3s ease, opacity 0.3s ease",
          opacity: hidden ? 0 : 1,
          willChange: "transform",
          backdropFilter: hovered ? "blur(2px)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label && (
          <span style={{
            color: "#D4AF37",
            fontSize: "9px",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}>
            {label}
          </span>
        )}
      </div>

      {/* Inner dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{
          zIndex: 99999,
          width: clicked ? "6px" : hovered ? "8px" : "6px",
          height: clicked ? "6px" : hovered ? "8px" : "6px",
          marginLeft: clicked ? "-3px" : hovered ? "-4px" : "-3px",
          marginTop: clicked ? "-3px" : hovered ? "-4px" : "-3px",
          background: "linear-gradient(135deg, #D4AF37, #E8671A)",
          boxShadow: clicked
            ? "0 0 12px rgba(212,175,55,0.8), 0 0 24px rgba(232,103,26,0.4)"
            : hovered
            ? "0 0 10px rgba(212,175,55,0.7)"
            : "0 0 6px rgba(212,175,55,0.5)",
          transition: "width 0.2s ease, height 0.2s ease, margin 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease",
          opacity: hidden ? 0 : 1,
          willChange: "transform",
          transform: clicked ? "scale(0.7)" : "scale(1)",
        }}
      />
    </>
  );
}

// ── Loader ──────────────────────────────────────────────────────────────────
function Loader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="loader-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="relative mb-8">
        <svg width="120" height="80" viewBox="0 0 120 80">
          {[0, 10, 20, 30, 40].map((offset, i) => (
            <path
              key={i}
              d={`M0 ${40 + offset - 20} Q30 ${30 + offset - 20} 60 ${40 + offset - 20} Q90 ${50 + offset - 20} 120 ${40 + offset - 20}`}
              fill="none"
              stroke={i % 2 === 0 ? "#D4AF37" : "#E8671A"}
              strokeWidth="2"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              style={{
                animation: `draw-strand 1.5s ease forwards ${i * 0.2}s`,
              }}
            />
          ))}
        </svg>
      </div>
      <div className="bebas text-4xl gold-text tracking-widest mb-2">MIJA'S PASTA</div>
      <div className="text-[#9b9b9b] text-sm poppins tracking-[0.3em] uppercase">Loading experience...</div>
      <div className="mt-8 w-40 h-[2px] bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #D4AF37, #E8671A)",
            animation: "shimmer-bar 2.8s ease forwards",
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

// ── Particles ────────────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
    drift: `${(Math.random() - 0.5) * 100}px`,
    color: i % 3 === 0 ? "#D4AF37" : i % 3 === 1 ? "#E8671A" : "#ffffff",
    opacity: Math.random() * 0.6 + 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
            "--drift": p.drift,
            animation: `float-particle ${p.duration}s ease-in ${p.delay}s infinite`,
            filter: "blur(0.5px)",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Menu", href: "#menu" },
    { label: "About", href: "#about" },
    { label: "Combos", href: "#combos" },
    { label: "Reviews", href: "#reviews" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-b border-[rgba(212,175,55,0.15)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <img src="/logo.jpg" alt="Mija's Pasta" className="h-10 w-auto object-contain" />
            <span className="bebas text-2xl gold-text tracking-widest hidden sm:block">MIJA'S PASTA</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[#9b9b9b] hover:text-[#D4AF37] transition-colors duration-300 text-sm font-medium tracking-wide relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => (window as any).__mijaOpenOrder?.()}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 text-black"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #E8671A)",
                boxShadow: "0 0 20px rgba(212,175,55,0.3)",
                cursor: "none",
                border: "none",
              }}
            >
              <span>🍝</span> Order Now
            </button>

            <button
              className="lg:hidden p-2 text-[#f5f5f5]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-[#111] border-l border-[rgba(212,175,55,0.15)] transition-transform duration-500 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 pt-24 flex flex-col gap-6">
            <img src="/logo.jpg" alt="Logo" className="h-12 w-auto object-contain mb-4" />
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-2xl font-bold text-[#f5f5f5] hover:text-[#D4AF37] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); (window as any).__mijaOpenOrder?.(); }}
              className="mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-black font-bold"
              style={{ background: "linear-gradient(135deg, #D4AF37, #E8671A)", cursor: "none", border: "none" }}
            >
              Order via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const tiltRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, tick = 0, rafId = 0;

    function resize() {
      const rect = hero.getBoundingClientRect();
      W = canvas.width = rect.width;
      H = canvas.height = rect.height;
    }
    resize();
    window.addEventListener("resize", resize);

    const mouse = mouseRef.current;

    function onMouseMove(e: MouseEvent) {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }
    hero.addEventListener("mousemove", onMouseMove);

    // Sparkles
    function spawnSparkle(x: number, y: number) {
      const el = document.createElement("div");
      el.style.cssText = `
        position:absolute;pointer-events:none;z-index:6;border-radius:50%;
        background:radial-gradient(circle,#fff 0%,rgba(212,175,55,0.9) 40%,transparent 70%);
        left:${x}px;top:${y}px;
        width:${Math.random() * 6 + 3}px;height:${Math.random() * 6 + 3}px;
        animation:sparkleAnim ${Math.random() * 0.7 + 0.4}s ease-in-out forwards;
      `;
      hero.appendChild(el);
      setTimeout(() => el.remove(), 1100);
    }

    let lastSparkle = 0;
    function onMouseMoveSparkle(e: MouseEvent) {
      const now = Date.now();
      if (now - lastSparkle > 80) {
        const r = hero.getBoundingClientRect();
        if (Math.random() > 0.5) spawnSparkle(e.clientX - r.left, e.clientY - r.top);
        lastSparkle = now;
      }
    }
    hero.addEventListener("mousemove", onMouseMoveSparkle);

    // Particle class
    class Particle {
      x = 0; y = 0; size = 0; speedY = 0; speedX = 0;
      life = 0; maxLife = 0; alpha = 0; color = "";
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 10;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = -(Math.random() * 0.6 + 0.2);
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.life = init ? Math.random() * 400 : 0;
        this.maxLife = Math.random() * 300 + 200;
        this.alpha = 0;
        const gold = Math.random() > 0.4;
        this.color = gold
          ? `rgba(212,175,${Math.floor(Math.random() * 40 + 20)},`
          : `rgba(255,245,${Math.floor(Math.random() * 30 + 220)},`;
      }
      update() {
        this.x += this.speedX + (mouse.x / (W || 1) - 0.5) * 0.1;
        this.y += this.speedY;
        this.life++;
        const p = this.life / this.maxLife;
        this.alpha = p < 0.1 ? p * 10 * 0.5 : p > 0.85 ? ((1 - p) / 0.15) * 0.5 : 0.5;
        if (this.life > this.maxLife) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ")";
        ctx.fill();
      }
    }

    // Pasta strand class
    class PastaStrand {
      x = 0; y = 0; len = 0; angle = 0; rotSpeed = 0;
      speedY = 0; speedX = 0; alpha = 0; life = 0; maxLife = 0;
      width = 0; wave = 0; waveAmp = 0; waveFreq = 0;
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 20;
        this.len = Math.random() * 60 + 30;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.015;
        this.speedY = -(Math.random() * 0.5 + 0.15);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.alpha = 0;
        this.life = init ? Math.random() * 600 : 0;
        this.maxLife = Math.random() * 400 + 300;
        this.width = Math.random() * 1.5 + 0.5;
        this.wave = Math.random() * 2;
        this.waveAmp = Math.random() * 6 + 2;
        this.waveFreq = Math.random() * 0.05 + 0.02;
      }
      update() {
        this.angle += this.rotSpeed;
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        const p = this.life / this.maxLife;
        this.alpha = p < 0.1 ? p * 10 * 0.35 : p > 0.8 ? ((1 - p) / 0.2) * 0.35 : 0.35;
        if (this.life > this.maxLife) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        for (let i = 0; i < 20; i++) {
          const t = i / 20;
          const px = (t - 0.5) * this.len;
          const py = Math.sin(t * Math.PI * 2 * this.wave + tick * 0.03) * this.waveAmp;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(212,165,40,${this.alpha})`;
        ctx.lineWidth = this.width;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 90 }, () => new Particle());
    const strands = Array.from({ length: 20 }, () => new PastaStrand());

    function drawVignette() {
      const grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, H * 0.85);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(0,0,0,0.82)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    function drawAmbient() {
      const cx = mouse.x || W / 2;
      const cy = mouse.y || H / 2;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
      grd.addColorStop(0, "rgba(160,90,10,0.07)");
      grd.addColorStop(0.5, "rgba(212,175,55,0.03)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function updateLogoTilt() {
      if (!logoWrapRef.current || !W || !H) return;
      const cx = W / 2, cy = H / 2;
      const tx = (mouse.x - cx) / cx;
      const ty = (mouse.y - cy) / cy;
      tiltRef.current.x = lerp(tiltRef.current.x, ty * 10, 0.06);
      tiltRef.current.y = lerp(tiltRef.current.y, tx * 10, 0.06);
      logoWrapRef.current.style.transform =
        `scale(1) translateY(0) rotateX(${-tiltRef.current.x}deg) rotateY(${tiltRef.current.y}deg)`;
    }

    function animate() {
      rafId = requestAnimationFrame(animate);
      tick++;
      ctx.clearRect(0, 0, W, H);
      drawAmbient();
      particles.forEach(p => { p.update(); p.draw(); });
      strands.forEach(s => { s.update(); s.draw(); });
      drawVignette();
      updateLogoTilt();
    }
    animate();

    // Entry animations
    const t1 = setTimeout(() => {
      logoWrapRef.current?.classList.add("hero-logo-visible");
      setTimeout(() => headlineRef.current?.classList.add("hero-el-visible"), 500);
      setTimeout(() => dividerRef.current?.classList.add("hero-el-visible"), 900);
      setTimeout(() => taglineRef.current?.classList.add("hero-el-visible"), 1000);
      setTimeout(() => ctaRef.current?.classList.add("hero-el-visible"), 1300);
    }, 200);

    // Device orientation for mobile
    function onOrientation(e: DeviceOrientationEvent) {
      if (e.beta !== null) {
        const nx = (e.gamma || 0) / 45;
        const ny = (e.beta || 0) / 90;
        mouse.x = W / 2 + nx * W * 0.3;
        mouse.y = H / 2 + ny * H * 0.3;
      }
    }
    window.addEventListener("deviceorientation", onOrientation);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      window.removeEventListener("resize", resize);
      window.removeEventListener("deviceorientation", onOrientation);
      hero.removeEventListener("mousemove", onMouseMove);
      hero.removeEventListener("mousemove", onMouseMoveSparkle);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100svh", background: "#000", fontFamily: "'Cormorant Garamond', serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&display=swap');

        #hero-logo-wrap {
          position:relative; width:240px; height:240px;
          transform-style:preserve-3d; perspective:800px;
          opacity:0; transform:scale(0.6) translateY(30px);
          transition:opacity 1.2s cubic-bezier(.22,.8,.45,1), transform 1.2s cubic-bezier(.22,.8,.45,1);
          margin:0 auto 28px;
        }
        #hero-logo-wrap.hero-logo-visible { opacity:1; transform:scale(1) translateY(0); }

        #hero-logo-glow {
          position:absolute; inset:-30px; border-radius:50%;
          background:radial-gradient(ellipse,rgba(212,175,55,0.18) 0%,transparent 70%);
          animation:heroGlowPulse 3s ease-in-out infinite;
        }
        @keyframes heroGlowPulse {
          0%,100%{transform:scale(1);opacity:0.6;} 50%{transform:scale(1.12);opacity:1;}
        }
        #hero-logo-ring1 {
          position:absolute; inset:-14px; border-radius:50%;
          border:1px solid rgba(212,175,55,0.25);
          animation:heroRotate 18s linear infinite;
        }
        #hero-logo-ring2 {
          position:absolute; inset:-24px; border-radius:50%;
          border:1px dashed rgba(212,175,55,0.12);
          animation:heroRotate 30s linear infinite reverse;
        }
        @keyframes heroRotate { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

        #hero-logo-img {
          width:240px; height:240px; object-fit:contain; border-radius:50%;
          filter:drop-shadow(0 0 28px rgba(212,175,55,0.35)) drop-shadow(0 0 8px rgba(255,255,255,0.15));
          transition:filter 0.4s ease;
          background:radial-gradient(ellipse at 40% 35%,rgba(212,175,55,0.08),transparent 70%);
        }
        #hero-logo-img:hover {
          filter:drop-shadow(0 0 40px rgba(212,175,55,0.65)) drop-shadow(0 0 16px rgba(255,255,255,0.25));
        }

        .hero-el {
          opacity:0; transform:translateY(18px);
          transition:opacity 0.9s ease, transform 0.9s ease;
        }
        .hero-el.hero-el-visible { opacity:1; transform:translateY(0); }

        #hero-headline {
          font-family:'Playfair Display',serif;
          font-size:clamp(2rem,5vw,3.4rem); font-weight:700;
          color:#fff; letter-spacing:0.04em; line-height:1.1;
          text-shadow:0 2px 32px rgba(212,175,55,0.3);
        }
        #hero-headline span { color:#D4AF37; font-style:italic; }

        #hero-tagline {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(0.95rem,2.5vw,1.25rem);
          font-weight:300; font-style:italic;
          color:rgba(212,175,55,0.85); letter-spacing:0.12em;
        }

        #hero-divider {
          width:80px; height:1px;
          background:linear-gradient(90deg,transparent,rgba(212,175,55,0.7),transparent);
          margin:18px auto;
        }

        #hero-order-btn {
          position:relative;
          padding:15px 44px;
          font-family:'Cormorant Garamond',serif;
          font-size:1rem; font-weight:500;
          letter-spacing:0.2em; text-transform:uppercase;
          color:#D4AF37;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(212,175,55,0.5);
          overflow:hidden;
          transition:color 0.35s, border-color 0.35s, box-shadow 0.35s;
          backdrop-filter:blur(10px);
          text-decoration:none;
          display:inline-block;
        }
        #hero-order-btn:hover {
          color:#fff; border-color:rgba(212,175,55,0.9);
          box-shadow:0 0 32px rgba(212,175,55,0.25),inset 0 0 20px rgba(212,175,55,0.08);
        }
        #hero-order-btn:active { transform:scale(0.97); }
        #hero-btn-shine {
          position:absolute; top:0; left:-80%; width:60%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
          transform:skewX(-20deg);
          animation:heroBtnShine 4s ease-in-out infinite 2s;
        }
        @keyframes heroBtnShine { 0%{left:-80%;} 30%,100%{left:140%;} }

        #hero-ambient-l, #hero-ambient-r {
          position:absolute; top:-20%; width:50%; height:80%;
          border-radius:50%; pointer-events:none; z-index:1;
          animation:heroAmbient 6s ease-in-out infinite;
        }
        #hero-ambient-l { left:-20%; background:radial-gradient(ellipse,rgba(180,100,20,0.22) 0%,transparent 65%); opacity:0.45; }
        #hero-ambient-r { right:-20%; background:radial-gradient(ellipse,rgba(212,175,55,0.14) 0%,transparent 65%); opacity:0.45; animation-delay:3s; }
        @keyframes heroAmbient {
          0%,100%{opacity:0.35;transform:scale(1);} 50%{opacity:0.55;transform:scale(1.08);}
        }

        @keyframes sparkleAnim {
          0%{transform:scale(0) rotate(0deg);opacity:1;}
          50%{transform:scale(1) rotate(180deg);opacity:0.9;}
          100%{transform:scale(0) rotate(360deg);opacity:0;}
        }

        #hero-scroll-hint {
          position:absolute; bottom:28px; left:50%; transform:translateX(-50%);
          display:flex; flex-direction:column; align-items:center; gap:6px; z-index:20;
        }
        #hero-scroll-label {
          font-size:10px; color:#9b9b9b; letter-spacing:0.3em; text-transform:uppercase;
          font-family:'Poppins',sans-serif;
        }
        #hero-scroll-line {
          width:1px; height:48px;
          background:linear-gradient(to bottom,#D4AF37,transparent);
          animation:heroPulse 2s ease-in-out infinite;
        }
        @keyframes heroPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

        #hero-social-proof {
          display:inline-flex; align-items:center; gap:10px;
          padding:10px 18px; border-radius:999px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          backdrop-filter:blur(10px);
          margin-top:24px;
        }
        #hero-social-proof span { font-family:'Poppins',sans-serif; font-size:0.8rem; color:#f5f5f5; font-weight:600; }
      `}</style>

      {/* Canvas bg */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

      {/* Ambient light blobs */}
      <div id="hero-ambient-l" />
      <div id="hero-ambient-r" />

      {/* Main content */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-28"
        style={{ minHeight: "100svh", zIndex: 10 }}
      >
        {/* Logo */}
        <div id="hero-logo-wrap" ref={logoWrapRef}>
          <div id="hero-logo-glow" />
          <div id="hero-logo-ring2" />
          <div id="hero-logo-ring1" />
          <img id="hero-logo-img" src="/logo.jpg" alt="Mija's Pasta" draggable={false} />
        </div>

        {/* Headline */}
        <h1 id="hero-headline" className="hero-el" ref={headlineRef}>
          Fresh &amp; <span>Delicious</span>
        </h1>

        {/* Divider */}
        <div id="hero-divider" className="hero-el" ref={dividerRef} />

        {/* Tagline */}
        <p id="hero-tagline" className="hero-el" ref={taglineRef}>
          "Once Mija's Pasta, Always Mija's Pasta."
        </p>

        {/* CTA */}
        <div className="hero-el mt-8 flex flex-wrap gap-4 items-center justify-center" ref={ctaRef}>
          <button
            id="hero-order-btn"
            onClick={() => (window as any).__mijaOpenOrder?.()}
            data-cursor-label="ORDER"
          >
            <span id="hero-btn-shine" />
            Order Now
          </button>
          <a
            href="#menu"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1rem", fontWeight: 500,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(212,175,55,0.7)",
              padding: "15px 32px",
              border: "1px solid rgba(212,175,55,0.2)",
              textDecoration: "none", display: "inline-block",
              backdropFilter: "blur(10px)",
              transition: "color 0.3s, border-color 0.3s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#D4AF37";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.5)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "rgba(212,175,55,0.7)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.2)";
            }}
          >
            View Menu
          </a>
        </div>

        {/* Social proof */}
        <div className="hero-el" style={{ opacity: 0, transitionDelay: "1.6s" }} ref={el => {
          if (el) setTimeout(() => el.classList.add("hero-el-visible"), 1600);
        }}>
          <div id="hero-social-proof">
            <div style={{ display: "flex", gap: 2 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill={i <= 4 ? "#D4AF37" : "#444"}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span>694+ Google Reviews • 4.4 Rating</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div id="hero-scroll-hint">
        <span id="hero-scroll-label">Scroll</span>
        <div id="hero-scroll-line" />
      </div>
    </section>
  );
}

// ── Stats ────────────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="bebas text-[clamp(3rem,6vw,5rem)] gold-text leading-none mb-1">
        {count}{suffix}
      </div>
      <div className="text-[#9b9b9b] text-sm tracking-wide">{label}</div>
    </div>
  );
}

// ── About ────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{
        background: "radial-gradient(ellipse at 80% 50%, #D4AF37 0%, transparent 70%)"
      }} />

      <div className="max-w-7xl mx-auto px-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-24 reveal">
          <StatItem value={694} suffix="+" label="Google Reviews" />
          <StatItem value={4} suffix=".4★" label="Average Rating" />
          <StatItem value={2500} suffix="+" label="Happy Customers" />
          <StatItem value={6} suffix="" label="Signature Dishes" />
          <div className="glass-card rounded-2xl p-6 text-center border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.5)] transition-all duration-300">
            <div className="text-2xl font-black text-[#D4AF37] mb-1">Ogidan</div>
            <div className="text-[#9b9b9b] text-xs uppercase tracking-widest">Branch</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center border border-[rgba(232,103,26,0.2)] hover:border-[rgba(232,103,26,0.5)] transition-all duration-300">
            <div className="text-2xl font-black text-[#E8671A] mb-1">Downtown</div>
            <div className="text-[#9b9b9b] text-xs uppercase tracking-widest">Branch</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal-left">
            <div className="text-[#D4AF37] text-sm font-semibold tracking-[0.3em] uppercase mb-4">Our Story</div>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight mb-6">
              Born from a <span className="gold-text">Passion</span> for<br />Perfect Pasta
            </h2>
            <p className="text-[#9b9b9b] leading-relaxed mb-6 text-base">
              Mija's Pasta is Osogbo's premier Quick Service Restaurant — a top-rated destination for freshly prepared pasta dishes that blend bold Nigerian flavors with irresistible culinary craftsmanship.
            </p>
            <p className="text-[#9b9b9b] leading-relaxed mb-8 text-base">
              Founded with a determination to offer satisfying, delicious, and convenient meals, Mija's Pasta has already won the hearts of countless pasta lovers across Osun State. Every dish is made fresh — no shortcuts, no compromise.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Fresh Ingredients", "Made to Order", "Nigerian Flavors", "Fast Service"].map(tag => (
                <span key={tag} className="px-4 py-2 rounded-full text-xs font-semibold text-[#D4AF37] gradient-border">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="reveal-right relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="/food2.webp" alt="About Mija's" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, transparent 50%, rgba(10,10,10,0.9) 100%)"
              }} />
              {/* Floating card */}
              <div className="absolute bottom-6 left-6 right-6 glass-card rounded-xl p-4 border border-[rgba(212,175,55,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, #D4AF37, #E8671A)" }}>🍝</div>
                  <div>
                    <div className="text-white font-bold text-sm">Osogbo's Favorite</div>
                    <div className="text-[#9b9b9b] text-xs">Oke Baale, Osogbo • Open Daily</div>
                  </div>
                  <div className="ml-auto text-[#D4AF37] font-black text-lg">4.4★</div>
                </div>
              </div>
            </div>
            {/* Decorative glow */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: "#D4AF37" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Menu ─────────────────────────────────────────────────────────────────────
const menuItems = [
  {
    name: "Stir Fry Spaghetti & Chicken",
    desc: "Wok-tossed spaghetti with crispy chicken strips, bell peppers, and Mija's secret sauce",
    price: "₦2,500",
    tag: "🔥 Bestseller",
    img: "/pasta-sauce.jpg",
    color: "#D4AF37",
  },
  {
    name: "Native Spaghetti",
    desc: "Classic Nigerian-style spaghetti cooked with palm oil, crayfish, and bold spices",
    price: "₦2,000",
    tag: "🏆 Fan Favorite",
    img: "/pasta-hero.jpg",
    color: "#E8671A",
  },
  {
    name: "Jollof Spaghetti",
    desc: "Smoky jollof-style spaghetti with tomato base, scotch bonnet, and savory proteins",
    price: "₦2,200",
    tag: "❤️ Nigerian Classic",
    img: "/pasta-eating.jpg",
    color: "#D4AF37",
  },
  {
    name: "Coconut Pasta",
    desc: "Creamy coconut-infused pasta with aromatic herbs and your choice of protein",
    price: "₦2,800",
    tag: "✨ Premium",
    img: "/pasta-bowl.jpg",
    color: "#E8671A",
  },
  {
    name: "Pepper Turkey",
    desc: "Succulent peppered turkey with Mija's spice blend — the perfect side or main",
    price: "₦1,500",
    tag: "🌶️ Spicy",
    img: "/dark-pasta.jpg",
    color: "#D4AF37",
  },
  {
    name: "Crispy Chicken",
    desc: "Golden-fried crispy chicken with signature seasoning — tender inside, crunch outside",
    price: "₦1,800",
    tag: "🍗 Crowd Pleaser",
    img: "/crispy-chicken.jpg",
    color: "#E8671A",
  },
];

function MenuCard({ item, index }: { item: typeof menuItems[0]; index: number }) {
  return (
    <div
      className={`menu-card glass-card rounded-2xl overflow-hidden reveal delay-${(index % 3 + 1) * 100} group`}
      data-cursor-label="VIEW"
      style={{ transition: "all 0.4s ease", border: "1px solid rgba(212,175,55,0.1)" }}
    >
      <div className="relative overflow-hidden h-52">
        <img
          src={item.img}
          alt={item.name}
          className="menu-img w-full h-full object-cover transition-transform duration-500"
        />
        <div className="absolute inset-0" style={{
          background: `linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.95) 100%)`
        }} />
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-black"
          style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)` }}
        >
          {item.tag}
        </div>
        <div className="absolute bottom-3 right-3 text-xl font-black text-white"
          style={{ fontFamily: "Montserrat", textShadow: "0 0 20px rgba(212,175,55,0.5)" }}>
          {item.price}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#D4AF37] transition-colors">{item.name}</h3>
        <p className="text-[#9b9b9b] text-sm leading-relaxed mb-4">{item.desc}</p>
        <button
          onClick={() => (window as any).__mijaOpenOrder?.()}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(232,103,26,0.1))",
            border: "1px solid rgba(212,175,55,0.3)",
            color: "#D4AF37",
            cursor: "none",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #D4AF37, #E8671A)";
            (e.currentTarget as HTMLElement).style.color = "#000";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(232,103,26,0.1))";
            (e.currentTarget as HTMLElement).style.color = "#D4AF37";
          }}
        >
          Order on WhatsApp →
        </button>
      </div>
    </div>
  );
}

function Menu() {
  return (
    <section id="menu" className="py-24 relative">
      <div className="absolute inset-0 opacity-5" style={{
        background: "radial-gradient(ellipse at 20% 50%, #E8671A 0%, transparent 70%)"
      }} />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <div className="text-[#E8671A] text-sm font-semibold tracking-[0.3em] uppercase mb-4">What We Serve</div>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight mb-4">
            Our <span className="gold-text">Signature</span> Menu
          </h2>
          <p className="text-[#9b9b9b] max-w-lg mx-auto">Every dish made fresh to order. Because you deserve nothing less than perfection.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, i) => (
            <MenuCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Combos ───────────────────────────────────────────────────────────────────
const combos = [
  {
    name: "Solo Feast",
    items: ["1x Pasta of choice", "1x Chicken/Turkey", "1x Drink"],
    price: "₦3,500",
    popular: false,
    emoji: "🍝",
  },
  {
    name: "Couple's Delight",
    items: ["2x Pasta of choice", "2x Protein options", "2x Drinks", "Free extra sauce"],
    price: "₦6,500",
    popular: true,
    emoji: "❤️",
  },
  {
    name: "Family Pack",
    items: ["4x Pasta of choice", "4x Proteins", "Garlic bread", "4x Drinks", "Priority packaging"],
    price: "₦12,000",
    popular: false,
    emoji: "👨‍👩‍👧‍👦",
  },
];

function Combos() {
  return (
    <section id="combos" className="py-24 bg-[#080808] relative">
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16 reveal">
          <div className="text-[#D4AF37] text-sm font-semibold tracking-[0.3em] uppercase mb-4">Special Offers</div>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight mb-4">
            Combo <span className="orange-text">Packages</span>
          </h2>
          <p className="text-[#9b9b9b] max-w-lg mx-auto">More food, more value, more memories. Pick your perfect combo.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {combos.map((combo, i) => (
            <div
              key={combo.name}
              className={`relative reveal delay-${(i + 1) * 200} rounded-2xl p-8 text-center transition-all duration-400 hover:scale-105 cursor-pointer ${
                combo.popular
                  ? "gold-glow"
                  : "glass-card"
              }`}
              style={combo.popular ? {
                background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(232,103,26,0.08))",
                border: "1px solid rgba(212,175,55,0.5)",
              } : {
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {combo.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-black"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #E8671A)" }}>
                  MOST POPULAR
                </div>
              )}
              <div className="text-5xl mb-4">{combo.emoji}</div>
              <h3 className="text-xl font-black text-white mb-2">{combo.name}</h3>
              <div className={`text-3xl font-black mb-6 ${combo.popular ? "gold-text" : "orange-text"}`}>{combo.price}</div>
              <ul className="space-y-2 mb-8 text-left">
                {combo.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-[#9b9b9b] text-sm">
                    <span className="text-[#D4AF37]">✓</span> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => (window as any).__mijaOpenOrder?.()}
                className="block w-full py-3 rounded-full font-bold text-sm transition-all duration-300"
                style={combo.popular ? {
                  background: "linear-gradient(135deg, #D4AF37, #E8671A)",
                  color: "#000",
                  cursor: "none",
                  border: "none",
                } : {
                  border: "1px solid rgba(212,175,55,0.4)",
                  color: "#D4AF37",
                  cursor: "none",
                  background: "transparent",
                }}
              >
                Order This Combo
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Why Us ───────────────────────────────────────────────────────────────────
const reasons = [
  { icon: "🌿", title: "Always Fresh", desc: "Every pasta is made to order from fresh ingredients — zero pre-cooking shortcuts." },
  { icon: "⚡", title: "Super Fast", desc: "Your order is ready in minutes. We respect your time as much as your taste buds." },
  { icon: "🏆", title: "Award-Winning Taste", desc: "4.4 stars on Google with 694+ reviews doesn't happen by accident." },
  { icon: "🇳🇬", title: "Nigerian Soul", desc: "Bold local flavors fused with premium pasta craft — uniquely Mija's." },
  { icon: "💬", title: "WhatsApp Orders", desc: "Order in seconds via WhatsApp — no apps, no stress, just great food." },
  { icon: "🚚", title: "Local Delivery", desc: "We bring Mija's magic right to your door within Osogbo." },
];

function WhyUs() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <div className="text-[#E8671A] text-sm font-semibold tracking-[0.3em] uppercase mb-4">Why Choose Us</div>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight">
            Customers <span className="gold-text">Love</span> Mija's
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className={`reveal delay-${(i % 3 + 1) * 100} glass-card rounded-2xl p-6 group hover:border-[rgba(212,175,55,0.3)] transition-all duration-300`}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{r.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#D4AF37] transition-colors">{r.title}</h3>
              <p className="text-[#9b9b9b] text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Reviews ──────────────────────────────────────────────────────────────────
const reviews = [
  {
    name: "Adebola F.",
    rating: 5,
    text: "Honestly the best pasta in Osogbo! The stir fry spaghetti hits different. I come here every week and it never disappoints. Mija's is on another level!",
    date: "2 weeks ago",
    avatar: "A",
  },
  {
    name: "Funmilayo O.",
    rating: 5,
    text: "I drove from Ibadan just because my sister wouldn't stop talking about Mija's. I understand the hype now. The coconut pasta is absolutely divine!",
    date: "1 month ago",
    avatar: "F",
  },
  {
    name: "Tunde A.",
    rating: 4,
    text: "Native spaghetti cooked to perfection. The seasoning is insane. Fast service, friendly staff. This is what a QSR should look like in Nigeria.",
    date: "3 weeks ago",
    avatar: "T",
  },
  {
    name: "Blessing M.",
    rating: 5,
    text: "Ordered via WhatsApp and it was delivered still hot and perfect. The crispy chicken + jollof spaghetti combo is elite. 10/10 no notes!",
    date: "1 week ago",
    avatar: "B",
  },
  {
    name: "Seun K.",
    rating: 5,
    text: "Best decision I made this year was discovering Mija's Pasta. The food is consistently amazing. Love that it's fresh every time.",
    date: "5 days ago",
    avatar: "S",
  },
];

function Reviews() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive(a => (a + 1) % reviews.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const review = reviews[active];

  return (
    <section id="reviews" className="py-24 bg-[#080808] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        background: "radial-gradient(ellipse at 50% 50%, #D4AF37 0%, transparent 70%)"
      }} />
      <div className="max-w-5xl mx-auto px-6 relative">
        <div className="text-center mb-16 reveal">
          <div className="text-[#D4AF37] text-sm font-semibold tracking-[0.3em] uppercase mb-4">Real Stories</div>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight">
            What People <span className="orange-text">Say</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1,2,3,4,5].map(i => (
              <svg key={i} className="w-6 h-6" viewBox="0 0 20 20" fill="#D4AF37">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[#9b9b9b] ml-2">4.4 average from 694 reviews</span>
          </div>
        </div>

        {/* Main review card */}
        <div key={active} className="testimonial-slide glass-card rounded-3xl p-10 text-center mb-8 max-w-3xl mx-auto"
          style={{ border: "1px solid rgba(212,175,55,0.2)" }}>
          <div className="text-6xl text-[#D4AF37] mb-6 opacity-50 font-serif">"</div>
          <p className="text-white text-xl leading-relaxed mb-8 font-light">{review.text}</p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-black font-black text-lg"
              style={{ background: "linear-gradient(135deg, #D4AF37, #E8671A)" }}>
              {review.avatar}
            </div>
            <div className="text-left">
              <div className="text-white font-bold">{review.name}</div>
              <div className="text-[#9b9b9b] text-sm">{review.date} • Google Review</div>
            </div>
            <div className="flex ml-4">
              {Array.from({ length: review.rating }).map((_, i) => (
                <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="#D4AF37">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active ? "w-8 h-2 bg-[#D4AF37]" : "w-2 h-2 bg-[#333]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Gallery ──────────────────────────────────────────────────────────────────
function Gallery() {
  const images = [
    { src: "/food1.webp", span: "col-span-2 row-span-2" },
    { src: "/pasta-sauce.jpg", span: "" },
    { src: "/crispy-chicken.jpg", span: "" },
    { src: "/pasta-eating.jpg", span: "col-span-2" },
    { src: "/dark-pasta.jpg", span: "" },
    { src: "/food2.webp", span: "" },
  ];

  return (
    <section id="gallery" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <div className="text-[#E8671A] text-sm font-semibold tracking-[0.3em] uppercase mb-4">Visual Feast</div>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight mb-4">
            Food That <span className="gold-text">Speaks</span>
          </h2>
          <p className="text-[#9b9b9b]">Follow us on Instagram & TikTok for daily drool-worthy content</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="https://instagram.com/mijas_pasta" target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-semibold glass-card border border-[rgba(212,175,55,0.2)] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] transition-all">
              @mijas_pasta
            </a>
            <a href="https://tiktok.com/@mijas.pasta" target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-semibold glass-card border border-[rgba(232,103,26,0.2)] text-[#E8671A] hover:bg-[rgba(232,103,26,0.1)] transition-all">
              @mijas.pasta
            </a>
          </div>
        </div>
        <div className="grid grid-cols-3 grid-rows-2 gap-3 h-[500px] reveal">
          {images.map((img, i) => (
            <div key={i} className={`${img.span} overflow-hidden rounded-2xl group cursor-pointer relative`}>
              <img
                src={img.src}
                alt={`Gallery ${i}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full flex items-center justify-center glass-card border border-white/20">
                  <span className="text-white text-lg">+</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Delivery ─────────────────────────────────────────────────────────────────
function Delivery() {
  return (
    <section className="py-24 bg-[#080808] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{
        background: "radial-gradient(ellipse at 30% 50%, #E8671A 0%, transparent 60%)"
      }} />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal-left">
            <div className="text-[#D4AF37] text-sm font-semibold tracking-[0.3em] uppercase mb-4">Order & Delivery</div>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight mb-6">
              Mija's Delivered<br />to Your <span className="orange-text">Door</span>
            </h2>
            <p className="text-[#9b9b9b] leading-relaxed mb-8">
              Order via WhatsApp and get your fresh pasta delivered within Osogbo. 
              We also partner with online platforms for maximum convenience.
            </p>
            <div className="space-y-4 mb-10">
              {[
                { icon: "💬", title: "WhatsApp Order", desc: "Message us directly — fast, easy, personal", link: "__order__" },
                { icon: "🌐", title: "Order Online", desc: "Via our food delivery platform", link: "https://mijaspasta.foodgital.com" },
                { icon: "📍", title: "Walk In", desc: "Osun State University Main Rd, Oke Baale, Osogbo", link: "#map" },
              ].map(opt => (
                opt.link === "__order__" ? (
                  <button key={opt.title} onClick={() => (window as any).__mijaOpenOrder?.()}
                    className="flex items-center gap-4 p-4 glass-card rounded-xl border border-[rgba(255,255,255,0.07)] hover:border-[rgba(212,175,55,0.3)] transition-all group w-full text-left"
                    style={{ cursor: "none", background: "transparent" }}>
                    <div className="text-3xl">{opt.icon}</div>
                    <div>
                      <div className="text-white font-bold group-hover:text-[#D4AF37] transition-colors">{opt.title}</div>
                      <div className="text-[#9b9b9b] text-sm">{opt.desc}</div>
                    </div>
                    <div className="ml-auto text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                  </button>
                ) : (
                  <a key={opt.title} href={opt.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 glass-card rounded-xl border border-[rgba(255,255,255,0.07)] hover:border-[rgba(212,175,55,0.3)] transition-all group">
                    <div className="text-3xl">{opt.icon}</div>
                    <div>
                      <div className="text-white font-bold group-hover:text-[#D4AF37] transition-colors">{opt.title}</div>
                      <div className="text-[#9b9b9b] text-sm">{opt.desc}</div>
                    </div>
                    <div className="ml-auto text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                  </a>
                )
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[#9b9b9b] text-xs mb-1">Hours</div>
                <div className="text-white font-semibold">Mon–Sat: 10am – 7pm</div>
              </div>
              <div className="w-px h-8 bg-[#333]" />
              <div>
                <div className="text-[#9b9b9b] text-xs mb-1">Phone</div>
                <a href="tel:09045438824" className="text-[#D4AF37] font-semibold hover:underline">0904 543 8824</a>
              </div>
            </div>
          </div>

          <div className="reveal-right">
            <div className="glass-card rounded-3xl p-8 border border-[rgba(212,175,55,0.2)]">
              <div className="text-center mb-8">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-xl font-black text-white mb-2">Order via WhatsApp</h3>
                <p className="text-[#9b9b9b] text-sm">It takes less than 60 seconds to order your favorite pasta</p>
              </div>
              <div className="space-y-3 mb-8">
                {["Choose your pasta", "Pick your protein", "Add sides if you want", "Send your order", "Enjoy within minutes!"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #D4AF37, #E8671A)" }}>
                      {i + 1}
                    </div>
                    <span className="text-[#ccc] text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => (window as any).__mijaOpenOrder?.()}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-black transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #25D366, #128C7E)",
                  boxShadow: "0 0 30px rgba(37,211,102,0.3)",
                  cursor: "none",
                  border: "none",
                }}
              >
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-white">Chat on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Map ──────────────────────────────────────────────────────────────────────
function MapSection() {
  return (
    <section id="map" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 reveal">
          <div className="text-[#D4AF37] text-sm font-semibold tracking-[0.3em] uppercase mb-4">Find Us</div>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight">
            Come Visit <span className="gold-text">Us</span>
          </h2>
          <p className="text-[#9b9b9b] mt-3">Osun State University Main Rd, Oke Baale Lane, Osogbo, Osun State</p>
        </div>
        <div className="reveal">
          <div className="rounded-3xl overflow-hidden border border-[rgba(212,175,55,0.2)] relative" style={{ height: "420px" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.0!2d4.5580!3d7.7827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDYnNTcuNyJOIDTCsDMzJzI4LjgiRQ!5e0!3m2!1sen!2sng!4v1234567890&markers=color:red%7C7.7827,4.5580"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) saturate(0.5)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mija's Pasta Location"
            />
            <div className="absolute top-4 left-4 glass-card rounded-xl px-4 py-3 border border-[rgba(212,175,55,0.3)]">
              <div className="text-[#D4AF37] font-bold text-sm">📍 Mija's Pasta</div>
              <div className="text-[#9b9b9b] text-xs">Oke Baale, Osogbo</div>
            </div>
          </div>
        </div>

        {/* Branch Contact Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-10 reveal">
          {/* Ogidan Branch */}
          <div className="glass-card rounded-2xl p-6 border border-[rgba(212,175,55,0.25)] hover:border-[rgba(212,175,55,0.5)] transition-all duration-300" style={{ boxShadow: "0 0 32px rgba(212,175,55,0.08)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}>
                <span className="text-[#D4AF37] text-lg">📍</span>
              </div>
              <div>
                <div className="text-white font-bold text-base">Ogidan Branch</div>
                <div className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold">Osogbo</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4 text-[#9b9b9b] text-sm">
              <span>📞</span>
              <a href="tel:08082363028" className="hover:text-[#D4AF37] transition-colors">08082363028</a>
            </div>
            <a
              href="https://wa.me/2348082363028"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp — Ogidan
            </a>
          </div>

          {/* Downtown Branch */}
          <div className="glass-card rounded-2xl p-6 border border-[rgba(232,103,26,0.25)] hover:border-[rgba(232,103,26,0.5)] transition-all duration-300" style={{ boxShadow: "0 0 32px rgba(232,103,26,0.08)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,103,26,0.15)", border: "1px solid rgba(232,103,26,0.3)" }}>
                <span className="text-[#E8671A] text-lg">📍</span>
              </div>
              <div>
                <div className="text-white font-bold text-base">Downtown Branch</div>
                <div className="text-[#E8671A] text-xs uppercase tracking-widest font-semibold">Osogbo</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4 text-[#9b9b9b] text-sm">
              <span>📞</span>
              <a href="tel:08084413657" className="hover:text-[#E8671A] transition-colors">08084413657</a>
            </div>
            <a
              href="https://wa.me/2348084413657"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "rgba(232,103,26,0.12)", border: "1px solid rgba(232,103,26,0.3)", color: "#E8671A" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp — Downtown
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  { q: "How do I place an order?", a: "You can order via WhatsApp at 0904 543 8824, through our online platform at mijaspasta.foodgital.com, or simply walk in to our restaurant at Oke Baale, Osogbo." },
  { q: "What are your opening hours?", a: "We're open Monday to Saturday, 10am to 7pm. Delivery hours are 10am to 6pm. Come early — the food goes fast!" },
  { q: "Do you do deliveries?", a: "Yes! We deliver within Osogbo. Place your order via WhatsApp and we'll get it to you fresh and fast." },
  { q: "Can I customize my pasta order?", a: "Absolutely! Tell us your preferred spice level, protein choice, and any special requests when you order via WhatsApp." },
  { q: "Are the ingredients fresh?", a: "Every single dish is made to order with fresh ingredients. We don't pre-cook or reheat — your plate goes straight from the kitchen to you." },
  { q: "Do you cater for events?", a: "Yes! We offer catering for events of all sizes. Contact us via WhatsApp or call 0904 543 8824 to discuss your event needs." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-[#080808] relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <div className="text-[#E8671A] text-sm font-semibold tracking-[0.3em] uppercase mb-4">Got Questions?</div>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-tight">
            Frequently <span className="gold-text">Asked</span>
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`reveal delay-${(i % 3 + 1) * 100} glass-card rounded-2xl border transition-all duration-300 ${
                open === i ? "border-[rgba(212,175,55,0.4)]" : "border-[rgba(255,255,255,0.06)]"
              }`}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`font-semibold text-sm sm:text-base transition-colors ${open === i ? "text-[#D4AF37]" : "text-white"}`}>
                  {faq.q}
                </span>
                <span className={`text-[#D4AF37] text-xl transition-transform duration-300 flex-shrink-0 ml-4 ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`faq-content px-5 ${open === i ? "open pb-5" : ""}`}>
                <p className="text-[#9b9b9b] text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer id="contact" className="relative pt-20 pb-10 border-t border-[rgba(212,175,55,0.1)]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/logo.jpg" alt="Mija's Pasta" className="h-14 w-auto object-contain mb-4" />
            <div className="bebas text-3xl gold-text tracking-widest mb-3">MIJA'S PASTA</div>
            <p className="text-[#9b9b9b] text-sm leading-relaxed mb-6 max-w-xs">
              Osogbo's premier pasta restaurant. Fresh. Bold. Unforgettable. Made with love every single day.
            </p>
            <div className="flex gap-3">
              {[
                { label: "IG", href: "https://instagram.com/mijas_pasta" },
                { label: "TT", href: "https://tiktok.com/@mijas.pasta" },
                { label: "X", href: "https://x.com/mijas_pasta" },
                { label: "WA", href: "https://wa.me/2349045438824" },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full glass-card border border-[rgba(212,175,55,0.2)] flex items-center justify-center text-[#D4AF37] text-xs font-bold hover:bg-[rgba(212,175,55,0.15)] transition-all">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div className="text-white font-bold mb-4">Quick Links</div>
            <div className="space-y-2">
              {["#menu", "#about", "#combos", "#reviews", "#gallery"].map((href, i) => (
                <a key={href} href={href} className="block text-[#9b9b9b] hover:text-[#D4AF37] transition-colors text-sm">
                  {["Menu", "About", "Combos", "Reviews", "Gallery"][i]}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="text-white font-bold mb-4">Contact</div>
            <div className="space-y-3 text-sm text-[#9b9b9b]">
              <div>📍 Osun State University Main Rd, Oke Baale Ln, Osogbo</div>
              <div><a href="tel:09045438824" className="hover:text-[#D4AF37] transition-colors">📞 0904 543 8824</a></div>
              <div><a href="tel:08082363028" className="hover:text-[#D4AF37] transition-colors">📞 0808 236 3028</a></div>
              <div>⏰ Mon–Sat: 10am – 7pm</div>
              <div>
                <button onClick={() => (window as any).__mijaOpenOrder?.()}
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full text-black text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #E8671A)", cursor: "none", border: "none" }}>
                  Order on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#555] text-xs">© 2025 Mija's Pasta. All rights reserved. Osogbo, Osun State, Nigeria.</p>
          <p className="text-[#555] text-xs">Crafted with 🍝 for pasta lovers everywhere</p>
        </div>
      </div>
    </footer>
  );
}

// ── Floating WhatsApp Button ──────────────────────────────────────────────────
function FloatingButton() {
  return (
    <button
      onClick={() => (window as any).__mijaOpenOrder?.()}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full text-white font-bold text-sm shadow-2xl transition-all duration-300 hover:scale-110"
      style={{
        background: "linear-gradient(135deg, #25D366, #128C7E)",
        boxShadow: "0 0 30px rgba(37,211,102,0.4)",
        animation: "float-btn 3s ease-in-out infinite",
        cursor: "none",
        border: "none",
      }}
    >
      <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span className="hidden sm:block">Order Now</span>
    </button>
  );
}

// ── Scroll Reveal Hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Order Modal ───────────────────────────────────────────────────────────────
const ORDER_BRANCHES = [
  {
    icon: "📍",
    badge: "BRANCH",
    title: "Ogidan",
    subtitle: "Place your order directly with our Ogidan Branch team for fresh and delicious pasta.",
    phone: "08082363028",
    btnLabel: "Order from Ogidan",
    url: "https://wa.me/2348082363028?text=Hello%20Mija's%20Pasta!%20I'd%20like%20to%20place%20an%20order%20from%20the%20Ogidan%20Branch.",
    accent: "#D4AF37",
    glow: "rgba(212,175,55,0.35)",
    tagColor: "#D4AF37",
  },
  {
    icon: "📍",
    badge: "BRANCH",
    title: "Downtown",
    subtitle: "Order from our Downtown Branch and enjoy the authentic Mija's Pasta experience.",
    phone: "08084413657",
    btnLabel: "Order from Downtown",
    url: "https://wa.me/2348084413657?text=Hello%20Mija's%20Pasta!%20I'd%20like%20to%20place%20an%20order%20from%20the%20Downtown%20Branch.",
    accent: "#E8671A",
    glow: "rgba(232,103,26,0.35)",
    tagColor: "#E8671A",
  },
  {
    icon: "🤖",
    badge: "AI ASSISTANT",
    title: "MIMO",
    subtitle: "Need recommendations or have questions? Chat with MIMO, our intelligent WhatsApp assistant.",
    phone: "09024395004",
    btnLabel: "Chat with MIMO AI",
    url: "https://wa.me/2349024395004?text=Hi%20MIMO!%20I%20need%20help%20placing%20an%20order.",
    accent: "#25D366",
    glow: "rgba(37,211,102,0.35)",
    tagColor: "#25D366",
  },
];

function OrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  // Entrance animation
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => { document.body.style.overflow = ""; }, 400);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Floating pasta particle canvas
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = { x: number; y: number; r: number; vx: number; vy: number; alpha: number; rot: number; vrot: number; type: number };
    const particles: Particle[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 3 + Math.random() * 5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.4,
      alpha: 0.08 + Math.random() * 0.18,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.02,
      type: Math.floor(Math.random() * 3),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.type === 0) {
          // Circle (flour dust)
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "#D4AF37";
          ctx.fill();
        } else if (p.type === 1) {
          // Wavy line (pasta strand)
          ctx.beginPath();
          ctx.moveTo(-p.r * 3, 0);
          for (let i = 0; i <= 12; i++) {
            ctx.lineTo(-p.r * 3 + i * p.r * 0.5, Math.sin(i * 0.9) * p.r * 0.7);
          }
          ctx.strokeStyle = "#E8671A";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          // Diamond sparkle
          ctx.beginPath();
          ctx.moveTo(0, -p.r * 1.2);
          ctx.lineTo(p.r * 0.5, 0);
          ctx.lineTo(0, p.r * 1.2);
          ctx.lineTo(-p.r * 0.5, 0);
          ctx.closePath();
          ctx.fillStyle = "#fff";
          ctx.fill();
        }
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.y < -20) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -20) p.x = canvas.width + 10;
        if (p.x > canvas.width + 20) p.x = -10;
      });
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  if (!open && !visible) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div
        ref={modalRef}
        style={{
          position: "relative",
          width: "100%", maxWidth: "960px",
          background: "linear-gradient(145deg, rgba(18,12,6,0.97) 0%, rgba(28,18,8,0.97) 50%, rgba(12,8,4,0.97) 100%)",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: "24px",
          padding: "clamp(24px,5vw,48px)",
          boxShadow: "0 0 80px rgba(212,175,55,0.1), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.15)",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.92) translateY(30px)",
          transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "24px", pointerEvents: "none", zIndex: 0 }}
        />

        {/* Ambient glow top */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "60%", height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)",
          borderRadius: "2px", zIndex: 1,
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "20px", zIndex: 10,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%", width: "36px", height: "36px",
            color: "rgba(255,255,255,0.6)", fontSize: "18px", cursor: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginBottom: "clamp(20px,4vw,36px)" }}>
          <div style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display',serif", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            🍝 Choose How You'd Like to Order
          </div>
          <p style={{ marginTop: "10px", color: "rgba(212,175,55,0.75)", fontSize: "clamp(13px,1.8vw,15px)", fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif", letterSpacing: "0.04em" }}>
            "Fresh and Delicious — Once Mija's Pasta, Always Mija's Pasta."
          </p>
          {/* Divider */}
          <div style={{ margin: "16px auto 0", width: "80px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }} />
        </div>

        {/* Cards */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "clamp(12px,2.5vw,20px)",
        }}>
          {ORDER_BRANCHES.map((branch, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "relative",
                background: hovered === i
                  ? `linear-gradient(145deg, rgba(28,20,8,0.95), rgba(22,14,4,0.98))`
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${hovered === i ? branch.accent : "rgba(255,255,255,0.08)"}`,
                borderRadius: "18px",
                padding: "clamp(20px,3vw,28px)",
                cursor: "none",
                transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                transform: hovered === i ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: hovered === i
                  ? `0 20px 50px ${branch.glow}, 0 0 0 1px ${branch.accent}30, inset 0 1px 0 rgba(255,255,255,0.06)`
                  : "0 4px 20px rgba(0,0,0,0.3)",
                backdropFilter: "blur(20px)",
                overflow: "hidden",
              }}
            >
              {/* Card ambient top line */}
              <div style={{
                position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
                background: hovered === i ? `linear-gradient(90deg, transparent, ${branch.accent}, transparent)` : "transparent",
                transition: "all 0.35s",
              }} />

              {/* Badge */}
              <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  background: `linear-gradient(135deg, ${branch.accent}22, ${branch.accent}44)`,
                  border: `1px solid ${branch.accent}55`,
                  color: branch.accent,
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em",
                  padding: "3px 10px", borderRadius: "999px",
                  fontFamily: "'Poppins',sans-serif",
                }}>
                  {branch.badge}
                </span>
              </div>

              {/* Icon + Title */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px", lineHeight: 1 }}>{branch.icon}</span>
                <div>
                  <div style={{ fontSize: "clamp(16px,2.5vw,20px)", fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display',serif" }}>
                    {branch.title}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ color: "rgba(200,185,160,0.8)", fontSize: "clamp(12px,1.5vw,13.5px)", lineHeight: 1.65, marginBottom: "18px", fontFamily: "'Poppins',sans-serif" }}>
                {branch.subtitle}
              </p>

              {/* Phone */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={branch.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <span style={{ color: branch.accent, fontSize: "13px", fontWeight: 600, fontFamily: "'Poppins',sans-serif", letterSpacing: "0.05em" }}>
                  {branch.phone}
                </span>
              </div>

              {/* CTA Button */}
              <a
                href={branch.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block", width: "100%", textAlign: "center",
                  padding: "13px 20px",
                  borderRadius: "12px",
                  fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "13px", letterSpacing: "0.08em",
                  textDecoration: "none", textTransform: "uppercase",
                  color: "#000",
                  background: hovered === i
                    ? `linear-gradient(135deg, ${branch.accent}, ${branch.accent}cc)`
                    : `linear-gradient(135deg, ${branch.accent}cc, ${branch.accent}99)`,
                  boxShadow: hovered === i ? `0 8px 24px ${branch.glow}` : "none",
                  transform: hovered === i ? "scale(1.02)" : "scale(1)",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {branch.btnLabel}
              </a>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginTop: "clamp(16px,3vw,28px)" }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", letterSpacing: "0.08em", fontFamily: "'Poppins',sans-serif" }}>
            All orders are handled via WhatsApp • Available daily
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function IndexPage() {
  const [loaded, setLoaded] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const openOrder = useCallback(() => setOrderOpen(true), []);
  const closeOrder = useCallback(() => setOrderOpen(false), []);
  const handleLoaderDone = useCallback(() => setLoaded(true), []);
  useScrollReveal();

  // Expose openOrder globally so Hero / Navbar / FloatingButton can trigger it
  useEffect(() => {
    (window as any).__mijaOpenOrder = openOrder;
    return () => { delete (window as any).__mijaOpenOrder; };
  }, [openOrder]);

  return (
    <>
      <title>Mija's Pasta — Osogbo's #1 Pasta Restaurant | Fresh. Creamy. Unforgettable.</title>
      {!loaded && <Loader onDone={handleLoaderDone} />}
      <CustomCursor />
      <OrderModal open={orderOpen} onClose={closeOrder} />
      <div className={`transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
        <Navbar />
        <Hero />
        <About />
        <Menu />
        <Combos />
        <WhyUs />
        <Reviews />
        <Gallery />
        <Delivery />
        <MapSection />
        <FAQ />
        <Footer />
        <FloatingButton />
      </div>
    </>
  );
}
