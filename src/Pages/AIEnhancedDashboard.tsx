import React, { useEffect, useMemo, useRef, useState } from "react";
import Vetting from "./Vetting";

const AIEnhancedDashboard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const transform = useMemo(() => {
    if (reducedMotion) return "none";
    return `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
  }, [tilt, reducedMotion]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const max = 2.4;
    setTilt({
      x: (0.5 - py) * max,
      y: (px - 0.5) * max,
    });
  };

  const onMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      data-ai-enhanced="true"
      style={{
        minHeight: "100vh",
        position: "relative",
        background:
          "radial-gradient(1200px 500px at 12% -12%, rgba(59,130,246,0.32), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(99,102,241,0.28), transparent 55%), linear-gradient(180deg, #0b1022 0%, #111a36 45%, #0d142d 100%)",
        padding: "20px",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage:
            "radial-gradient(circle at 50% 20%, rgba(0,0,0,0.9), rgba(0,0,0,0.45) 65%, transparent 100%)",
        }}
      />

      <style>{`
        [data-ai-enhanced="true"] .scrutiny-root {
          background: transparent !important;
        }
        [data-ai-enhanced="true"] .st-card {
          background: rgba(255,255,255,0.92) !important;
          border-color: rgba(148,163,184,0.45) !important;
          box-shadow: 0 10px 28px rgba(2,6,23,0.16) !important;
        }
        [data-ai-enhanced="true"] .st-title {
          color: #f8fbff !important;
          text-shadow: 0 2px 10px rgba(59,130,246,0.32);
          letter-spacing: 0.6px;
          font-weight: 800;
        }
        [data-ai-enhanced="true"] .st-subtitle {
          color: #60a5fa !important;
          opacity: 1;
          font-weight: 700;
        }
        [data-ai-enhanced="true"] .st-section-title {
          color: #f8fbff !important;
          text-shadow: 0 2px 8px rgba(59,130,246,0.2);
        }
        [data-ai-enhanced="true"] .st-tab {
          border-color: rgba(148,163,184,0.55) !important;
          background: rgba(255,255,255,0.94) !important;
        }
        [data-ai-enhanced="true"] .st-tab.active {
          background: #2563eb !important;
          border-color: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 8px 20px rgba(37,99,235,0.35);
        }
      `}</style>

      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: 16 }} />

        <div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={onMouseLeave}
          style={{
            borderRadius: 22,
            border: "1px solid rgba(148,163,184,0.28)",
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))",
            boxShadow: isHovering
              ? "0 28px 56px rgba(2,6,23,0.55), 0 0 0 1px rgba(96,165,250,0.25)"
              : "0 20px 44px rgba(2,6,23,0.45)",
            backdropFilter: "blur(14px)",
            transform,
            transformStyle: "preserve-3d",
            transition: reducedMotion
              ? "none"
              : "transform 180ms ease, box-shadow 220ms ease",
            padding: 10,
          }}
        >
          <Vetting />
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedDashboard;
