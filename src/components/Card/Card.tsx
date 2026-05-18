"use client";

import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import styles from "./Card.module.css";
import UploadIcon from "./UploadIcon";

const REPEL_RADIUS = 90;
const REPEL_STRENGTH = 10;

type UploadState = "idle" | "uploading" | "success";

interface CardProps {
  className?: string;
  style?: React.CSSProperties;
}

// Parent stagger: each child exits 110ms after the previous
const idleContainerVariants = {
  visible: {},
  exit: {
    transition: { staggerChildren: 0.11, staggerDirection: 1 },
  },
};

const fadePop = {
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function Card({ className, style }: CardProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const iconSlotRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashTween = useRef<gsap.core.Tween | null>(null);
  const dragCounter = useRef(0);

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isActive = isHovered || isDragging;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadState("uploading");
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // GSAP repel — quickTo created lazily so it always targets the live DOM element
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    let currentSlot: HTMLDivElement | null = null;
    let xTo: ReturnType<typeof gsap.quickTo> | null = null;
    let yTo: ReturnType<typeof gsap.quickTo> | null = null;

    const onMove = (e: MouseEvent) => {
      const slot = iconSlotRef.current;
      if (!slot) return;

      if (slot !== currentSlot) {
        currentSlot = slot;
        xTo = gsap.quickTo(slot, "x", { duration: 0.55, ease: "power3.out" });
        yTo = gsap.quickTo(slot, "y", { duration: 0.55, ease: "power3.out" });
      }

      const r = slot.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
        xTo!(-(dx / dist) * force);
        yTo!(-(dy / dist) * force);
      } else {
        xTo!(0);
        yTo!(0);
      }
    };

    const onLeave = () => { xTo?.(0); yTo?.(0); };

    inner.addEventListener("mousemove", onMove);
    inner.addEventListener("mouseleave", onLeave);
    return () => {
      inner.removeEventListener("mousemove", onMove);
      inner.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // GSAP hover — stroke + marching dashes (idle only)
  useEffect(() => {
    const rect = rectRef.current;
    if (!rect) return;

    if (isActive && uploadState === "idle") {
      gsap.to(rect, { attr: { stroke: "#ADC9FF" }, duration: 0.3, ease: "power2.out" });
      dashTween.current = gsap.fromTo(
        rect,
        { attr: { "stroke-dashoffset": 0 } },
        { attr: { "stroke-dashoffset": -12 }, duration: 0.5, ease: "none", repeat: -1 }
      );
    } else if (uploadState === "idle") {
      gsap.to(rect, { attr: { stroke: "#e4e4e4" }, duration: 0.3, ease: "power2.out" });
      dashTween.current?.kill();
      dashTween.current = null;
      gsap.to(rect, { attr: { "stroke-dashoffset": 0 }, duration: 0.2 });
    } else {
      dashTween.current?.kill();
      dashTween.current = null;
    }
  }, [isActive, uploadState]);

  const innerClass = [
    styles.inner,
    uploadState === "uploading" || uploadState === "success"
      ? styles.innerUploading
      : isActive
      ? styles.innerHovered
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${styles.card}${className ? ` ${className}` : ""}`}
      style={style}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        ref={innerRef}
        className={innerClass}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Dashed border — fades out independently */}
        <motion.svg
          className={styles.dashedBorder}
          animate={{ opacity: uploadState === "idle" ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <rect
            ref={rectRef}
            x="0" y="0"
            width="100%" height="100%"
            rx="20"
            fill="none"
            stroke="#e4e4e4"
            strokeWidth="1"
            strokeDasharray="6"
          />
        </motion.svg>

        {/* Idle content — icon, title, subtitle stagger out one by one */}
        <AnimatePresence>
          {uploadState === "idle" && (
            <motion.div
              key="idle"
              className={styles.idleContent}
              variants={idleContainerVariants}
              initial="visible"
              animate="visible"
              exit="exit"
            >
              {/* Icon */}
              <motion.div variants={fadePop} transition={{ duration: 0.32, ease: "easeOut" }}>
                <motion.div
                  animate={{ y: [0, -4, 0], scale: [1, 1.04, 1], opacity: [0.88, 1, 0.88] }}
                  transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
                >
                  <div ref={iconSlotRef} className={styles.iconSlot}>
                    <UploadIcon width={24} height={24} />
                  </div>
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.p variants={fadePop} transition={{ duration: 0.32, ease: "easeOut" }} className={styles.title}>
                Upload files
              </motion.p>

              {/* Subtitle */}
              <motion.p variants={fadePop} transition={{ duration: 0.32, ease: "easeOut" }} className={styles.subtitle}>
                Drag and drop your files here, or{" "}
                <span className={styles.link}>click to select</span>.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploading scene — coming next */}
        <AnimatePresence>
          {uploadState === "uploading" && (
            <motion.div
              key="uploading"
              className={styles.uploadingScene}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
            >
              {/* uploading UI — coming soon */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
