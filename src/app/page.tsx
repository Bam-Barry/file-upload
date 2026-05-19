"use client";

import styles from "./page.module.css";
import Card, { type UploadOutcome } from "@/components/Card/Card";
import { useState } from "react";

export default function Home() {
  const [outcome, setOutcome] = useState<UploadOutcome>("success");
  const [uploadDuration, setUploadDuration] = useState(2.8);
  const [triggerToken, setTriggerToken] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <main className={styles.page}>
      <section className={styles.stage}>
        <Card
          key={triggerToken}
          outcome={outcome}
          uploadDuration={uploadDuration}
          autoStart={triggerToken > 0}
        />
      </section>

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
              <span className={styles.controlLabel}>Outcome</span>
              <div className={styles.iconSegmented}>
                <button
                  type="button"
                  className={outcome === "success" ? styles.iconSegmentActive : styles.iconSegment}
                  aria-label="Set outcome to success"
                  onClick={() => setOutcome("success")}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M5.25 10.35L8.38 13.48L14.95 6.52"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={outcome === "error" ? styles.iconSegmentActive : styles.iconSegment}
                  aria-label="Set outcome to failed"
                  onClick={() => setOutcome("error")}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M6.3 6.3L13.7 13.7M13.7 6.3L6.3 13.7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
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
                  onChange={(event) => setUploadDuration(Number(event.target.value))}
                />
                <span className={styles.speedValue}>{uploadDuration.toFixed(1)}</span>
              </span>
            </label>
          </div>

          <button
            type="button"
            className={styles.runButton}
            onClick={() => setTriggerToken((value) => value + 1)}
          >
            Run upload
          </button>
        </div>
      </aside>
    </main>
  );
}
