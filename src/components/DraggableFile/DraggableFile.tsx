"use client";

import { useRef } from "react";
import styles from "./DraggableFile.module.css";

interface Props {
  name: string;
  size: string;
  mime: string;
  accent: string;
  onDragStart: (name: string) => void;
  onDragEnd: () => void;
}

function FileIcon({ accent }: { accent: string }) {
  return (
    <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
      <path d="M3 0 L16 0 L24 8 L24 30 L0 30 L0 3 Q0 0 3 0 Z" fill="#EFEFEF" />
      <path d="M16 0 L24 8 L16 8 Z" fill={accent} />
    </svg>
  );
}

function DragDots() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
      <circle cx="2" cy="2"  r="1.4" fill="currentColor" />
      <circle cx="6" cy="2"  r="1.4" fill="currentColor" />
      <circle cx="2" cy="6"  r="1.4" fill="currentColor" />
      <circle cx="6" cy="6"  r="1.4" fill="currentColor" />
      <circle cx="2" cy="10" r="1.4" fill="currentColor" />
      <circle cx="6" cy="10" r="1.4" fill="currentColor" />
    </svg>
  );
}

export default function DraggableFile({ name, size, mime, accent, onDragStart, onDragEnd }: Props) {
  const chipRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/x-drag-file", JSON.stringify({ name, mime }));
    e.dataTransfer.effectAllowed = "copy";

    const chip = chipRef.current;
    if (chip) {
      const clone = chip.cloneNode(true) as HTMLElement;
      clone.style.cssText = `
        position: fixed; top: -9999px; left: -9999px;
        width: ${chip.offsetWidth}px; font: inherit; pointer-events: none;
      `;
      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, chip.offsetWidth / 2, chip.offsetHeight / 2);
      requestAnimationFrame(() => clone.remove());
    }

    onDragStart(name);
  };

  return (
    <div
      ref={chipRef}
      className={styles.chip}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      title={`Drag "${name}" into the card`}
    >
      <FileIcon accent={accent} />
      <div className={styles.meta}>
        <span className={styles.name}>{name}</span>
        <span className={styles.size}>{size}</span>
      </div>
      <span className={styles.handle}>
        <DragDots />
      </span>
    </div>
  );
}
