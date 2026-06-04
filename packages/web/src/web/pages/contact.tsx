import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";

// ── Custom Cursor (shared) ────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailCount = 4;
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const pos = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.documentElement.style.cursor = "none";
    let raf: number;
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      trailsRef.current.forEach((el, i) => {
        if (el) {
          setTimeout(() => {
            el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            el.style.opacity = "0.4";
            setTimeout(() => { el.style.opacity = "0"; }, 80);
          }, i * 30);
        }
      });
    };
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
      raf = requestAnimationFrame(animate);
    };
    animate();
    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setHovered(!!(target.closest("a, button, [data-cursor]")));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("mouseover", onOver);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      {Array.from({ length: trailCount }).map((_, i) => (
        <div key={i} ref={el => { if (el) trailsRef.current[i] = el; }}
          className="pointer-events-none fixed top-0 left-0 rounded-full"
          style={{ zIndex: 99998, width: `${6 - i}px`, height: `${6 - i}px`,
            marginLeft: `${-(6 - i) / 2}px`, marginTop: `${-(6 - i) / 2}px`,
            background: i % 2 === 0 ? "#D4AF37" : "#E8671A", opacity: 0,
            filter: "blur(0.5px)", willChange: "transform" }} />
      ))}
      <div ref={ringRef} className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{ zIndex: 99998, width: hovered ? "56px" : "36px", height: hovered ? "56px" : "36px",
          marginLeft: hovered ? "-28px" : "-18px", marginTop: hovered ? "-28px" : "-18px",
          border: `1.5px solid ${hovered ? "#D4AF37" : "rgba(212,175,55,0.5)"}`,
          background: hovered ? "rgba(212,175,55,0.08)" : "transparent",
          transition: "all 0.3s ease", opacity: hidden ? 0 : 1, willChange: "transform" }} />
      <div ref={dotRef} className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{ zIndex: 99999, width: "6px", height: "6px", marginLeft: "-3px", marginTop: "-3px",
          background: "linear-gradient(135deg, #D4AF37, #E8671A)",
          boxShadow: "0 0 6px rgba(212,175,55,0.5)", opacity: hidden ? 0 : 1, willChange: "transform",
          transform: clicked ? "scale(0.7)" : "scale(1)", transition: "transform 0.1s ease, opacity 0.3s ease" }} />
    </>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { label: "Menu", href: "/#menu" },
    { label: "About", href: "/#about" },
    { label: "Combos", href: "/#combos" },
    { label: "Reviews", href: "/#reviews" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border-b border-[rgba(212,175,55,0.15)] py-3" : "bg-transparent py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.jpg" alt="Mija's Pasta" className="h-10 w-auto object-contain" />
          <span className="bebas text-2xl tracking-widest hidden sm:block" style={{ color: "#D4AF37" }}>MIJA'S PASTA</span>
        </Link>
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}
              className={`transition-colors duration-300 text-sm font-medium tracking-wide relative group ${link.href === "/contact" ? "text-[#D4AF37]" : "text-[#9b9b9b] hover:text-[#D4AF37]"}`}>
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-[1px] bg-[#D4AF37] transition-all duration-300 ${link.href === "/contact" ? "w-full" : "w-0 group-hover:w-full"}`} />
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => (window as any).__mijaOpenOrder?.()}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 text-black"
            style={{ background: "linear-gradient(135deg, #D4AF37, #E8671A)", boxShadow: "0 0 20px rgba(212,175,55,0.3)", cursor: "none", border: "none" }}>
            <span>🍝</span> Order Now
          </button>
          <button className="lg:hidden p-2 text-[#f5f5f5]" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" style={{ cursor: "none", background: "none", border: "none" }}>
            <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[rgba(10,10,10,0.98)] border-t border-[rgba(212,175,55,0.1)] px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-[#9b9b9b] hover:text-[#D4AF37] transition-colors text-sm font-medium" onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <button onClick={() => { setMenuOpen(false); (window as any).__mijaOpenOrder?.(); }}
            className="mt-2 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-black font-bold"
            style={{ background: "linear-gradient(135deg, #D4AF37, #E8671A)", cursor: "none", border: "none" }}>
            Order via WhatsApp
          </button>
        </div>
      )}
    </nav>
  );
}

// ── Scroll Reveal ─────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Contact Page ──────────────────────────────────────────────────────────────
export default function ContactPage() {
  useScrollReveal();

  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    setStatus("sending");
    const text = `Hello Mija's Pasta!%0A%0AName: ${encodeURIComponent(form.name)}%0APhone: ${encodeURIComponent(form.phone)}%0A%0AMessage: ${encodeURIComponent(form.message)}`;
    setTimeout(() => {
      window.open(`https://wa.me/2349045438824?text=${text}`, "_blank");
      setStatus("sent");
      setForm({ name: "", phone: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    }, 600);
  }, [form]);

  const branches = [
    {
      name: "Ogidan Branch",
      phone: "08082363028",
      tel: "tel:08082363028",
      wa: "https://wa.me/2348082363028?text=Hello%20Mija's%20Pasta!%20I'd%20like%20to%20get%20in%20touch%20with%20the%20Ogidan%20Branch.",
      accent: "#D4AF37",
      glow: "rgba(212,175,55,0.3)",
    },
    {
      name: "Downtown Branch",
      phone: "08084413657",
      tel: "tel:08084413657",
      wa: "https://wa.me/2348084413657?text=Hello%20Mija's%20Pasta!%20I'd%20like%20to%20get%20in%20touch%20with%20the%20Downtown%20Branch.",
      accent: "#E8671A",
      glow: "rgba(232,103,26,0.3)",
    },
  ];

  return (
    <>
      <title>Contact — Mija's Pasta | Reach Out to Us</title>
      <CustomCursor />

      <div style={{ background: "#080604", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", color: "#f5f5f5" }}>
        <Navbar />

        {/* Hero Header */}
        <section style={{ paddingTop: "140px", paddingBottom: "60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          {/* BG glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "300px",
            background: "radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="reveal" style={{ opacity: 0, transform: "translateY(30px)", transition: "all 0.7s ease" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px",
              background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)",
              padding: "6px 18px", borderRadius: "999px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase" }}>Get In Touch</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px,6vw,64px)", fontWeight: 700,
              color: "#fff", lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-0.02em" }}>
              Contact <span style={{ background: "linear-gradient(135deg, #D4AF37, #E8671A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mija's Pasta</span>
            </h1>
            <p style={{ color: "rgba(200,185,160,0.75)", fontSize: "clamp(14px,2vw,17px)", maxWidth: "540px", margin: "0 auto", lineHeight: 1.7, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" }}>
              We'd love to hear from you. Reach out for inquiries, feedback, partnerships, or support.
            </p>
          </div>

          {/* Divider */}
          <div style={{ width: "80px", height: "2px", background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", margin: "32px auto 0", borderRadius: "2px" }} />
        </section>

        {/* Branch Cards */}
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {branches.map((branch, i) => (
              <div key={i} className="reveal"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  opacity: 0, transition: `all 0.6s ease ${i * 0.1}s`,
                  background: hoveredCard === i
                    ? "linear-gradient(145deg, rgba(28,20,8,0.98), rgba(22,14,4,0.98))"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${hoveredCard === i ? branch.accent : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "20px", padding: "clamp(24px,4vw,36px)",
                  boxShadow: hoveredCard === i ? `0 20px 60px ${branch.glow}` : "0 4px 20px rgba(0,0,0,0.3)",
                  transform: hoveredCard === i ? "translateY(-6px)" : "translateY(0)",
                  backdropFilter: "blur(20px)",
                  position: "relative", overflow: "hidden",
                }}>
                {/* Top accent line */}
                <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
                  background: hoveredCard === i ? `linear-gradient(90deg, transparent, ${branch.accent}, transparent)` : "transparent",
                  transition: "all 0.35s" }} />

                {/* Badge */}
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ background: `linear-gradient(135deg, ${branch.accent}22, ${branch.accent}44)`,
                    border: `1px solid ${branch.accent}55`, color: branch.accent,
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em",
                    padding: "4px 12px", borderRadius: "999px" }}>
                    BRANCH
                  </span>
                </div>

                {/* Icon + Name */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: `linear-gradient(135deg, ${branch.accent}22, ${branch.accent}11)`,
                    border: `1px solid ${branch.accent}33`, fontSize: "22px", flexShrink: 0 }}>
                    📍
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0 }}>
                      {branch.name}
                    </h3>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px",
                  padding: "10px 14px", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={branch.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  <span style={{ color: branch.accent, fontSize: "14px", fontWeight: 600, letterSpacing: "0.05em" }}>{branch.phone}</span>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <a href={branch.tel}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      padding: "12px 20px", borderRadius: "12px", textDecoration: "none",
                      fontWeight: 700, fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase",
                      color: "#000", background: `linear-gradient(135deg, ${branch.accent}, ${branch.accent}cc)`,
                      boxShadow: `0 4px 20px ${branch.glow}`,
                      transition: "all 0.25s ease" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${branch.glow}`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${branch.glow}`; }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    Call Now
                  </a>
                  <a href={branch.wa} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      padding: "12px 20px", borderRadius: "12px", textDecoration: "none",
                      fontWeight: 700, fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase",
                      color: "#fff", background: "rgba(37,211,102,0.12)",
                      border: "1px solid rgba(37,211,102,0.3)",
                      transition: "all 0.25s ease" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #25D366, #128C7E)"; (e.currentTarget as HTMLElement).style.border = "1px solid transparent"; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,211,102,0.12)"; (e.currentTarget as HTMLElement).style.border = "1px solid rgba(37,211,102,0.3)"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Follow Us */}
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px 80px" }}>
          <div className="reveal" style={{ opacity: 0, transform: "translateY(30px)", transition: "all 0.7s ease",
            background: "linear-gradient(135deg, rgba(131,58,180,0.08), rgba(253,29,29,0.06), rgba(252,176,69,0.08))",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px",
            padding: "clamp(28px,5vw,48px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            {/* BG decoration */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(131,58,180,0.06), transparent 60%)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Instagram icon */}
              <div style={{ width: "64px", height: "64px", borderRadius: "18px", margin: "0 auto 20px",
                background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 32px rgba(131,58,180,0.4)" }}>
                <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>

              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
                Follow Us
              </h2>
              <p style={{ color: "rgba(200,185,160,0.7)", fontSize: "15px", marginBottom: "28px", fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" }}>
                Stay updated with our latest dishes, offers, and behind-the-scenes moments.
              </p>

              <a href="https://instagram.com/mijas_pasta" target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "10px",
                  padding: "14px 32px", borderRadius: "50px", textDecoration: "none",
                  fontWeight: 700, fontSize: "14px", letterSpacing: "0.06em", textTransform: "uppercase",
                  color: "#fff", background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
                  boxShadow: "0 8px 32px rgba(131,58,180,0.35)",
                  transition: "all 0.3s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(131,58,180,0.5)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(131,58,180,0.35)"; }}>
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Visit Our Instagram
              </a>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section style={{ maxWidth: "640px", margin: "0 auto", padding: "0 20px 120px" }}>
          <div className="reveal" style={{ opacity: 0, transform: "translateY(30px)", transition: "all 0.7s ease" }}>
            {/* Section heading */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
                Send Us a Message
              </h2>
              <div style={{ width: "60px", height: "2px", background: "linear-gradient(90deg, transparent, #D4AF37, transparent)", margin: "0 auto", borderRadius: "2px" }} />
            </div>

            <form onSubmit={handleSubmit}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px", padding: "clamp(28px,5vw,48px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)", backdropFilter: "blur(20px)" }}>

              {/* Field helper */}
              {[
                { id: "name", label: "Full Name", type: "text", placeholder: "e.g. Adebisi Johnson", value: form.name, key: "name" as const },
                { id: "phone", label: "Phone Number", type: "tel", placeholder: "e.g. 0812 345 6789", value: form.phone, key: "phone" as const },
              ].map((field) => (
                <div key={field.id} style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "rgba(212,175,55,0.8)", marginBottom: "8px" }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    required
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={{ width: "100%", padding: "14px 18px", borderRadius: "12px", outline: "none",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f5f5f5", fontSize: "15px", fontFamily: "'Poppins', sans-serif",
                      transition: "all 0.3s", boxSizing: "border-box" }}
                    onFocus={e => { e.currentTarget.style.border = "1px solid rgba(212,175,55,0.6)"; e.currentTarget.style.background = "rgba(212,175,55,0.05)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.08)"; }}
                    onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              ))}

              {/* Message */}
              <div style={{ marginBottom: "28px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "rgba(212,175,55,0.8)", marginBottom: "8px" }}>
                  Message
                </label>
                <textarea
                  placeholder="Type your message here..."
                  rows={5}
                  value={form.message}
                  required
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ width: "100%", padding: "14px 18px", borderRadius: "12px", outline: "none",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#f5f5f5", fontSize: "15px", fontFamily: "'Poppins', sans-serif",
                    resize: "vertical", transition: "all 0.3s", boxSizing: "border-box" }}
                  onFocus={e => { e.currentTarget.style.border = "1px solid rgba(212,175,55,0.6)"; e.currentTarget.style.background = "rgba(212,175,55,0.05)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.08)"; }}
                  onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>

              {/* Submit */}
              <button type="submit" disabled={status === "sending" || status === "sent"}
                style={{ width: "100%", padding: "16px 24px", borderRadius: "14px", border: "none",
                  fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px",
                  letterSpacing: "0.08em", textTransform: "uppercase", cursor: "none",
                  color: status === "sent" ? "#fff" : "#000",
                  background: status === "sent"
                    ? "linear-gradient(135deg, #25D366, #128C7E)"
                    : status === "sending"
                    ? "rgba(212,175,55,0.5)"
                    : "linear-gradient(135deg, #D4AF37, #E8671A)",
                  boxShadow: status === "sent"
                    ? "0 8px 32px rgba(37,211,102,0.35)"
                    : "0 8px 32px rgba(212,175,55,0.3)",
                  transition: "all 0.35s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                onMouseEnter={e => { if (status === "idle") { (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(212,175,55,0.45)"; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = status === "sent" ? "0 8px 32px rgba(37,211,102,0.35)" : "0 8px 32px rgba(212,175,55,0.3)"; }}>
                {status === "sending" ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Sending...
                  </>
                ) : status === "sent" ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Message Sent!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Send Message
                  </>
                )}
              </button>

              <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
                Your message will be sent via WhatsApp
              </p>
            </form>
          </div>
        </section>

        {/* Footer strip */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 20px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", letterSpacing: "0.08em" }}>
            © 2025 Mija's Pasta. All rights reserved. •{" "}
            <Link href="/" style={{ color: "rgba(212,175,55,0.5)", textDecoration: "none" }}>Back to Home</Link>
          </p>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
          * { cursor: none !important; }
          @media (hover: none) { * { cursor: auto !important; } }
          .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
          .reveal.visible { opacity: 1 !important; transform: translateY(0) !important; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
          input, textarea { color-scheme: dark; }
        `}</style>
      </div>
    </>
  );
}
