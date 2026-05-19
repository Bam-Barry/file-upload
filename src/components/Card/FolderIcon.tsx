"use client";

import { type ReactNode, useId } from "react";

/** Layout size — folder paths fill this box 1:1 (no letterboxing). */
export const FOLDER_WIDTH = 95;
export const FOLDER_HEIGHT = 85;

/**
 * Tight bbox of folder paths in design coordinates (126×117 Figma export).
 * Maps path geometry to exactly FOLDER_WIDTH × FOLDER_HEIGHT.
 */
export const FOLDER_VIEWBOX = "15.5795 8 94.2635 85";

const BODY_PATH =
  "M74.3335 8C75.137 8 75.9224 8.24187 76.5864 8.69434L78.9653 10.3154H93.5522C102.619 10.3155 109.843 17.8989 109.404 26.9551L106.931 77.8994C106.521 86.3551 99.5453 93 91.0796 93H34.3423C25.8767 92.9999 18.9012 86.355 18.4907 77.8994L16.019 26.9551C15.5795 17.899 22.803 10.3157 31.8696 10.3154H46.4565L48.8355 8.69434C49.4994 8.24205 50.2841 8 51.0874 8H74.3335Z";

const FLAP_PATH =
  "M16.4534 55.0389C15.7823 45.8435 23.0616 38.0137 32.2814 38.0137L44.5495 38.0137C46.5174 38.0137 48.4416 38.5943 50.081 39.6828L51.7416 40.7854L62.7318 40.7971L73.6777 40.7879L75.1232 39.7884C76.7946 38.6327 78.7784 38.0137 80.8105 38.0137H93.1405C102.36 38.0137 109.64 45.8435 108.968 55.0388L107.272 78.2848C106.667 86.5794 99.7607 92.9998 91.444 92.9998H33.9779C25.6612 92.9998 18.7552 86.5794 18.1499 78.2849L16.4534 55.0389Z";

interface FolderSvgProps {
  width?: number;
  height?: number;
  className?: string;
}

function FolderSvg({
  width = FOLDER_WIDTH,
  height = FOLDER_HEIGHT,
  className,
  children,
}: FolderSvgProps & { children: ReactNode }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={FOLDER_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      className={className}
      style={{ display: "block" }}
    >
      {children}
    </svg>
  );
}

function FolderDefs({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <filter
        id={`${idPrefix}-shadow`}
        x="-20%"
        y="-20%"
        width="140%"
        height="160%"
        filterUnits="objectBoundingBox"
      >
        <feDropShadow
          dx="0"
          dy="8"
          stdDeviation="8"
          floodColor="rgba(170, 197, 240, 0.55)"
        />
      </filter>
      <linearGradient
        id={`${idPrefix}-body-grad`}
        x1="75.9"
        y1="-11"
        x2="75.9"
        y2="108"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.27" stopColor="#7AB3FF" />
        <stop offset="0.60" stopColor="#005EDB" />
      </linearGradient>
      <linearGradient
        id={`${idPrefix}-flap-grad`}
        x1="62.7"
        y1="30"
        x2="62.7"
        y2="102"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#7AB3FF" />
        <stop offset="0.66" stopColor="#006CFD" />
      </linearGradient>
    </defs>
  );
}

/** Back body layer (shadow + body path) for composited upload animation. */
export function FolderBackLayer({ width, height, className }: FolderSvgProps) {
  const id = useId();
  const prefix = `folder-back${id.replace(/:/g, "")}`;

  return (
    <FolderSvg width={width} height={height} className={className}>
      <FolderDefs idPrefix={prefix} />
      <g filter={`url(#${prefix}-shadow)`}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={BODY_PATH}
          fill={`url(#${prefix}-body-grad)`}
        />
      </g>
    </FolderSvg>
  );
}

/** Front flap layer for composited upload animation. */
export function FolderFrontLayer({ width, height, className }: FolderSvgProps) {
  const id = useId();
  const prefix = `folder-front${id.replace(/:/g, "")}`;

  return (
    <FolderSvg width={width} height={height} className={className}>
      <FolderDefs idPrefix={prefix} />
      <path
        d={FLAP_PATH}
        fill={`url(#${prefix}-flap-grad)`}
        fillOpacity="0.75"
      />
    </FolderSvg>
  );
}

/** Full folder (body + flap in one SVG). */
export default function FolderIcon({
  width = FOLDER_WIDTH,
  height = FOLDER_HEIGHT,
  className,
}: FolderSvgProps) {
  const id = useId();
  const prefix = `folder${id.replace(/:/g, "")}`;

  return (
    <FolderSvg width={width} height={height} className={className}>
      <FolderDefs idPrefix={prefix} />
      <g filter={`url(#${prefix}-shadow)`}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={BODY_PATH}
          fill={`url(#${prefix}-body-grad)`}
        />
      </g>
      <path
        d={FLAP_PATH}
        fill={`url(#${prefix}-flap-grad)`}
        fillOpacity="0.75"
      />
    </FolderSvg>
  );
}
