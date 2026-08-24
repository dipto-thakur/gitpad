// file: components/icons/BrandMark.tsx

import * as React from "react";

/* ---------- Folder icon (standalone, reusable) ---------- */

export interface FolderIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const FolderIcon = React.forwardRef<SVGSVGElement, FolderIconProps>(
  ({ size = "1em", className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 262 150"
        width={size}
        height={size}
        className={className}
        fill="currentColor"
        role="img"
        aria-hidden="true"
        {...props}
      >
        <path
          d="
            M18 34
            C18 24.06 26.06 16 36 16
            H131
            C136.4 16 141.48 18.44 144.88 22.64
            L154.8 34.96
            C158.2 39.16 163.28 41.6 168.68 41.6
            H226
            C235.94 41.6 244 49.66 244 59.6
            V116
            C244 125.94 235.94 134 226 134
            H36
            C26.06 134 18 125.94 18 116
            Z
          "
        />
      </svg>
    );
  }
);
FolderIcon.displayName = "FolderIcon";

/* ---------- BrandMark: single SVG (icon + wordmark), scales via
   className (h-6 w-auto etc). All internal proportions are prop-driven. ---------- */

const H = 150; // fixed internal reference height
const ICON_LEFT = 18;
const ICON_RIGHT = 244;
const ICON_CENTER_X = (ICON_LEFT + ICON_RIGHT) / 2; // 131

export interface BrandMarkProps extends React.SVGProps<SVGSVGElement> {
  /** wordmark text. Default "Gitpad" */
  text?: string;
  /** icon scale about its own center. Default 1 */
  iconScale?: number;
  /** gap (svg units, ref height 150) between icon and text. Default 32 */
  gap?: number;
  /** wordmark font-size (svg units, ref height 150). Default 82 */
  fontSize?: number;
  /** wordmark letter-spacing (svg units). Default -2 */
  letterSpacing?: number;
  /** wordmark baseline y position (svg units). Default 111 */
  textY?: number;
  /** font-family for wordmark. Default Space Mono */
  fontFamily?: string;
  /** font-weight for wordmark. Default 700 */
  fontWeight?: number | string;
  /** icon fill color override (default currentColor / inherit). */
  iconColor?: string;
  /** text fill color override (default currentColor / inherit). */
  textColor?: string;
  /** right-edge padding after text (svg units). Default 8 */
  trailingPad?: number;
}

export const BrandMark = React.forwardRef<SVGSVGElement, BrandMarkProps>(
  (
    {
      text = "Gitpad",
      iconScale = 1,
      gap = 32,
      fontSize = 142,
      letterSpacing = 1,
      textY = 111,
      fontFamily = "'Californian FB', ui-monospace, monospace",
      fontWeight = 800,
      iconColor,
      textColor,
      trailingPad = 8,
      className,
      fill = "currentColor",
      ...props
    },
    ref
  ) => {
    // icon scales about its own center, so layout shifts stay predictable
    const iconRight = ICON_CENTER_X + (ICON_RIGHT - ICON_CENTER_X) * iconScale;
    const iconTransform = `translate(${ICON_CENTER_X - ICON_CENTER_X * iconScale}, ${
      H / 2 - (H / 2) * iconScale
    }) scale(${iconScale})`;

    // monospace char-width estimate (Space Mono ≈ 0.6em per glyph)
    const charW = fontSize * 0.6;
    const textWidth =
      text.length * charW + Math.max(text.length - 1, 0) * letterSpacing;

    const textX = iconRight + gap;
    const totalWidth = textX + textWidth + trailingPad;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${totalWidth} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className={className}
        role="img"
        aria-label={text}
        {...props}
      >
        <g transform={iconTransform} fill={iconColor ?? fill}>
          <path
            d="
              M18 34
              C18 24.06 26.06 16 36 16
              H131
              C136.4 16 141.48 18.44 144.88 22.64
              L154.8 34.96
              C158.2 39.16 163.28 41.6 168.68 41.6
              H226
              C235.94 41.6 244 49.66 244 59.6
              V116
              C244 125.94 235.94 134 226 134
              H36
              C26.06 134 18 125.94 18 116
              Z
            "
          />
        </g>
        <text
          x={textX}
          y={textY}
          fontFamily={fontFamily}
          fontSize={fontSize}
          fontWeight={fontWeight}
          letterSpacing={letterSpacing}
          fill={textColor ?? fill}
        >
          {text}
        </text>
      </svg>
    );
  }
);
BrandMark.displayName = "BrandMark";