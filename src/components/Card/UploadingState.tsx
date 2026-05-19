"use client";

import { motion } from "framer-motion";
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
    <svg width={38} height={50} viewBox="0 0 38 50" fill="none" xmlns="http://www.w3.org/2000/svg">
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
const FILE_LEFT = 28.5;
const FILE_TOP = -20;
const SPAWN_Y = -48;

export default function UploadingState() {
  const fileRef = useRef<HTMLDivElement>(null);
  const folderStackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const file = fileRef.current;
    const folder = folderStackRef.current;
    if (!file || !folder) return;

    let killed = false;
    let delayed: gsap.core.Tween | null = null;

    function runCycle() {
      if (killed) return;

      gsap.set(file, {
        y: SPAWN_Y,
        opacity: 0,
        scale: 0.82,
        transformOrigin: "center center",
      });

      const tl = gsap.timeline();

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
          if (!killed) delayed = gsap.delayedCall(0.3, runCycle);
        });
    }

    delayed = gsap.delayedCall(0.65, runCycle);

    return () => {
      killed = true;
      delayed?.kill();
      gsap.killTweensOf(file);
      gsap.killTweensOf(folder);
    };
  }, []);

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.animArea}
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.48, ease: easeOut }}
      >
        <div
          ref={folderStackRef}
          className={styles.folderStack}
          style={{ width: FOLDER_WIDTH, height: FOLDER_HEIGHT }}
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

      <motion.div
        className={styles.progressWrap}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.42, ease: easeOut }}
      >
        <div className={styles.track}>
          <motion.div
            className={styles.fill}
            initial={{ width: "0%" }}
            animate={{ width: "68%" }}
            transition={{ delay: 0.52, duration: 2.4, ease: easeOut }}
          />
        </div>
      </motion.div>
    </div>
  );
}
