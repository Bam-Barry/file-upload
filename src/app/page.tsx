"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import styles from "./page.module.css";
import Card, { type UploadOutcome } from "@/components/Card/Card";
import DraggableFile from "@/components/DraggableFile/DraggableFile";

interface FileItem {
  name: string;
  size: string;
  mime: string;
  accent: string;
}

const INITIAL_FILES: FileItem[] = [
  { name: "report.pdf", size: "2.4 MB", mime: "application/pdf", accent: "#EF6C6C" },
  { name: "photo.png",  size: "1.1 MB", mime: "image/png",        accent: "#5B9BF5" },
  { name: "notes.txt",  size: "18 KB",  mime: "text/plain",        accent: "#F5A623" },
];

const chipVariants = {
  initial: { opacity: 0, scale: 0.88, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.92, y: -10 },
};

export default function Home() {
  const [outcome, setOutcome] = useState<UploadOutcome>("success");
  const [uploadDuration, setUploadDuration] = useState(2.8);
  const [triggerToken, setTriggerToken] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const [fileList, setFileList] = useState<FileItem[]>(INITIAL_FILES);
  const [isUploading, setIsUploading] = useState(false);
  const [showFiles, setShowFiles] = useState(true);

  // Tracks the file being dragged so it can be restored if the drop is cancelled
  const draggedRef = useRef<{ file: FileItem; index: number } | null>(null);
  // Flips to true the moment an upload starts so dragEnd knows not to restore
  const uploadStartedRef = useRef(false);

  const handleFileDragStart = useCallback((name: string) => {
    setFileList((prev) => {
      const idx = prev.findIndex((f) => f.name === name);
      if (idx === -1) return prev;
      draggedRef.current = { file: prev[idx], index: idx };
      uploadStartedRef.current = false;
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const handleFileDragEnd = useCallback(() => {
    if (!uploadStartedRef.current && draggedRef.current) {
      const { file, index } = draggedRef.current;
      setFileList((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, file);
        return next;
      });
    }
    draggedRef.current = null;
  }, []);

  const handleUploadStart = useCallback(() => {
    uploadStartedRef.current = true;
    draggedRef.current = null;
    setIsUploading(true);
  }, []);

  const handleUploadReset = useCallback(() => {
    setIsUploading(false);
  }, []);

  const fileRowVisible = showFiles && fileList.length > 0;

  return (
    <main className={styles.page}>
      <div className={styles.center}>
        <section className={styles.stage}>
          <Card
            key={triggerToken}
            outcome={outcome}
            uploadDuration={uploadDuration}
            autoStart={triggerToken > 0}
            onUploadStart={handleUploadStart}
            onReset={handleUploadReset}
          />
        </section>

        {fileRowVisible && (
          <div className={`${styles.fileRow} ${isUploading ? styles.fileRowFaded : ""}`}>
            <AnimatePresence mode="popLayout">
              {fileList.map((f) => (
                <motion.div
                  key={f.name}
                  layout
                  variants={chipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                >
                  <DraggableFile
                    name={f.name}
                    size={f.size}
                    mime={f.mime}
                    accent={f.accent}
                    onDragStart={handleFileDragStart}
                    onDragEnd={handleFileDragEnd}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <aside className={styles.dialKit} aria-label="Upload controls">
        <button
          type="button"
          className={styles.kitHeader}
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
        >
          <p className={styles.kitTitle}>Customization</p>
          <span className={isOpen ? styles.chevronOpen : styles.chevron}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M6.5 8.25L10 11.75L13.5 8.25"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <div className={isOpen ? styles.kitContents : `${styles.kitContents} ${styles.kitContentsClosed}`}>
          <div className={styles.kitBody}>

            <div className={styles.controlGroup}>
              <div className={styles.controlRowInline}>
                <span className={styles.controlLabel}>Files</span>
                <button
                  type="button"
                  className={`${styles.toggle} ${showFiles ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() => setShowFiles((v) => !v)}
                  aria-label={showFiles ? "Hide draggable files" : "Show draggable files"}
                >
                  <span className={styles.toggleThumb} style={{ left: showFiles ? 17 : 3 }} />
                </button>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Outcome</span>
              <div className={styles.iconSegmented}>
                <button
                  type="button"
                  className={outcome === "success" ? styles.iconSegmentActive : styles.iconSegment}
                  aria-label="Set outcome to success"
                  onClick={() => setOutcome("success")}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5.25 10.35L8.38 13.48L14.95 6.52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={outcome === "error" ? styles.iconSegmentActive : styles.iconSegment}
                  aria-label="Set outcome to failed"
                  onClick={() => setOutcome("error")}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M6.3 6.3L13.7 13.7M13.7 6.3L6.3 13.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <label className={styles.controlGroup}>
              <span className={styles.controlLabel}>Upload speed</span>
              <span className={styles.sliderShell}>
                <input
                  className={styles.slider}
                  type="range"
                  min="0.9"
                  max="5"
                  step="0.1"
                  value={uploadDuration}
                  onChange={(e) => setUploadDuration(Number(e.target.value))}
                />
                <span className={styles.speedValue}>{uploadDuration.toFixed(1)}</span>
              </span>
            </label>
          </div>

          <button
            type="button"
            className={styles.runButton}
            onClick={() => {
              setIsUploading(true);
              setTriggerToken((v) => v + 1);
            }}
          >
            Run upload
          </button>
        </div>
      </aside>
    </main>
  );
}
