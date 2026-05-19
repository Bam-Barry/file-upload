"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import {
  FOLDER_HEIGHT,
  FOLDER_WIDTH,
  FolderBackLayer,
  FolderFrontLayer,
} from "./FolderIcon";
import styles from "./UploadingState.module.css";

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];

function FileSvg() {
  return (
    <svg width={46} height={60} viewBox="0 0 38 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 0 L28 0 L38 10 L38 50 L0 50 L0 6 Q0 0 6 0 Z" fill="#F3F3F3" />
      <path d="M28 0 L38 10 L28 10 Z" fill="#D1DDFF" />
    </svg>
  );
}

/*
  File positions in CSS px (folder stack = FOLDER_WIDTH × FOLDER_HEIGHT).
  Path center x ≈ 47.5 → FILE_LEFT = 47.5 − 19 = 28.5
  Flap top edge y ≈ 30 (path y=38, viewBox origin y=8)
*/
const FILE_LEFT = 24.5; // folder center 47.5 − half file width 23 = 24.5
const FILE_TOP = -20;
const SPAWN_Y = -48;
const FILE_INSERTION_DELAY = 1.05;

interface UploadingStateProps {
  result: "success" | "error" | null;
  uploadDuration: number;
  onComplete: () => void;
  onReset: () => void;
}

export default function UploadingState({
  result,
  uploadDuration,
  onComplete,
  onReset,
}: UploadingStateProps) {
  const fileRef = useRef<HTMLDivElement>(null);
  const folderStackRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef(false);

  const progress = useMotionValue(0);
  const fillWidth = useTransform(progress, (v) => `${v}%`);
  const pctLabel = useTransform(progress, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    const controls = animate(progress, 100, {
      delay: 0.52,
      duration: uploadDuration,
      ease: [0.22, 1, 0.36, 1],
    });
    const completionTimer = window.setTimeout(
      onComplete,
      (uploadDuration + 0.52) * 1000
    );

    return () => {
      controls.stop();
      window.clearTimeout(completionTimer);
    };
  }, [onComplete, progress, uploadDuration]);

  useEffect(() => {
    completeRef.current = result !== null;
  }, [result]);

  useEffect(() => {
    const file = fileRef.current;
    const folder = folderStackRef.current;
    if (!file || !folder) return;

    let killed = false;
    let delayed: gsap.core.Tween | null = null;
    let tl: gsap.core.Timeline | null = null;

    gsap.set(file, {
      y: SPAWN_Y,
      opacity: 0,
      scale: 0.82,
      transformOrigin: "center center",
    });

    function runCycle() {
      if (killed || completeRef.current) return;

      gsap.set(file, {
        y: SPAWN_Y,
        opacity: 0,
        scale: 0.82,
        transformOrigin: "center center",
      });

      tl = gsap.timeline();

      tl
        .to(file, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.15,
          ease: "back.out(1.8)",
        })
        .to(file, {
          y: 42,
          duration: 0.3,
          ease: "power3.in",
          delay: 0.14,
        })
        .to(file, {
          y: 38,
          scale: 0.88,
          opacity: 0.8,
          duration: 0.13,
          ease: "power2.out",
        })
        .to(
          folder,
          {
            scaleX: 1.03,
            scaleY: 0.98,
            duration: 0.08,
            ease: "power2.in",
            transformOrigin: "center bottom",
          },
          "<-0.04"
        )
        .to(folder, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.42,
          ease: "elastic.out(1, 0.55)",
        })
        .to(file, { duration: 0.9 })
        .to(file, {
          opacity: 0,
          y: 42,
          duration: 0.18,
          ease: "power2.in",
        })
        .call(() => {
          if (!killed && !completeRef.current) {
            delayed = gsap.delayedCall(0.3, runCycle);
          }
        });
    }

    delayed = gsap.delayedCall(FILE_INSERTION_DELAY, runCycle);

    return () => {
      killed = true;
      delayed?.kill();
      tl?.kill();
      gsap.killTweensOf(file);
      gsap.killTweensOf(folder);
    };
  }, []);

  useEffect(() => {
    const file = fileRef.current;
    const folder = folderStackRef.current;
    if (!file || !folder || result === null) return;

    gsap.killTweensOf(file);
    gsap.killTweensOf(folder);
    gsap.to(file, {
      y: 38,
      scale: 0.86,
      opacity: 0.88,
      duration: 0.28,
      ease: "power3.out",
    });
    gsap.to(folder, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.22,
      ease: "power2.out",
    });
  }, [result]);

  const isComplete = result !== null;
  const isError = result === "error";

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.successStack}
        initial={{ y: 0 }}
        animate={{
          y: isComplete ? -30 : 0,
        }}
        transition={{ duration: 0.52, ease: easeOut }}
      >
        <motion.div
          className={styles.animArea}
          initial={{ scale: 0.7 }}
          animate={{ scale: isComplete ? 0.68 : 1 }}
          transition={{ duration: 0.52, ease: easeOut }}
        >
          <div
            ref={folderStackRef}
            className={styles.folderStack}
            style={{ width: FOLDER_WIDTH, height: FOLDER_HEIGHT }}
            onMouseEnter={() => {
              if (result !== "success") return;
              const file = fileRef.current;
              if (!file) return;
              gsap.to(file, {
                y: 18,
                rotation: -8,
                scale: 0.9,
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
                transformOrigin: "center bottom",
              });
            }}
            onMouseLeave={() => {
              if (result !== "success") return;
              const file = fileRef.current;
              if (!file) return;
              gsap.to(file, {
                y: 38,
                rotation: 0,
                scale: 0.86,
                opacity: 0.88,
                duration: 0.35,
                ease: "power2.out",
              });
            }}
          >
            <div className={styles.folderLayer}>
              <FolderBackLayer width={FOLDER_WIDTH} height={FOLDER_HEIGHT} />
            </div>

            <div className={styles.filesLayer}>
              <div
                ref={fileRef}
                className={styles.file}
                style={{ left: FILE_LEFT, top: FILE_TOP }}
              >
                <FileSvg />
              </div>
            </div>

            <div className={styles.folderFrontLayer}>
              <FolderFrontLayer width={FOLDER_WIDTH} height={FOLDER_HEIGHT} />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isComplete && (
            <motion.div
              className={isError ? styles.errorBadge : styles.checkBadge}
              initial={{ opacity: 0, y: -12, scale: 0.65 }}
              animate={{ opacity: 1, y: -12, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.8 }}
              transition={{ delay: 0.1, duration: 0.46, ease: easeOut }}
            >
              {isError ? (
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M6.3 6.3L13.7 13.7M13.7 6.3L6.3 13.7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M5.25 10.35L8.38 13.48L14.95 6.52"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key="progress"
            className={styles.progressWrap}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.38, duration: 0.42, ease: easeOut }}
          >
            <div className={styles.trackWrap}>
              <div className={styles.track}>
                <motion.div className={styles.fill} style={{ width: fillWidth }} />
              </div>
              <motion.span className={styles.pctText}>{pctLabel}</motion.span>
            </div>
          </motion.div>
        ) : (
          <div key="success" className={styles.successContent}>
            <motion.div
              className={styles.textGroup}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.16, duration: 0.42, ease: easeOut }}
            >
              <p className={styles.successTitle}>
                {isError ? "Upload failed" : "Uploaded successfully"}
              </p>
              <p className={styles.successSubtitle}>
                {isError
                  ? "Something went wrong. Please try again."
                  : "Everything has been processed successfully"}
              </p>
            </motion.div>

            <motion.button
              type="button"
              className={styles.resetButton}
              aria-label="Upload again"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ delay: 0.78, duration: 0.34, ease: easeOut }}
              onClick={onReset}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M15.62 8.2C14.95 5.75 12.71 4 10.08 4C7.73 4 5.7 5.39 4.78 7.39M4.38 4.94V7.72H7.16M4.38 11.8C5.05 14.25 7.29 16 9.92 16C12.27 16 14.3 14.61 15.22 12.61M15.62 15.06V12.28H12.84"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
