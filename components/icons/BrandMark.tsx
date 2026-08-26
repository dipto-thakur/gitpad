// file: components/icons/BrandMark.tsx

import * as React from "react";

/* ---------- Updated folder icon (standalone, reusable) ---------- */

export interface FolderIconProps
  extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const FolderIcon = React.forwardRef<
  SVGSVGElement,
  FolderIconProps
>(({ size = "1em", className, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 392.72 361.65"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      role="img"
      aria-hidden="true"
      {...props}
    >
      <g>
        {/* Back / tab layer */}
        <path
          opacity="0.78"
          d="
            M392.72 109.41
            V310.26
            C392.72 338.64 373.74 361.65 350.34 361.65
            H42.38
            C19 361.65 0 338.64 0 310.26
            V51.39
            C0 23 19 0 42.38 0
            H141
            C153.13 0 164.56 6.91 171.87 18.65
            L184.77 39.38
            C192.06 51.12 203.49 58 215.62 58
            H350.34
            C373.74 58 392.72 81 392.72 109.41
            Z
          "
        />

        {/* Front layer */}
        <path
          d="
            M392.72 100.78
            V318.45
            C392.72 342.32 373.74 361.65 350.34 361.65
            H42.38
            C19 361.65 0 342.32 0 318.45
            V100.78
            C0 76.91 19 57.56 42.38 57.56
            H350.34
            C373.74 57.56 392.72 76.91 392.72 100.78
            Z
          "
        />
      </g>
    </svg>
  );
});

FolderIcon.displayName = "FolderIcon";

/* ---------- BrandMark: icon + wordmark ---------- */

/*
 * Internal reference:
 * - Original icon: 392.72 x 361.65
 * - Wordmark artwork: 349.54 x 130.29
 *
 * Both are normalized to the same reference height so the combined
 * mark remains responsive and predictable.
 */

const ICON_WIDTH = 392.72;
const ICON_HEIGHT = 361.65;
const ICON_CENTER_X = ICON_WIDTH / 2;

const TEXT_REFERENCE_WIDTH = 349.54;
const TEXT_REFERENCE_HEIGHT = 130.29;

export interface BrandMarkProps
  extends React.SVGProps<SVGSVGElement> {
  /** Wordmark text. Default: "Gitpad" */
  text?: string;

  /** Icon scale around its own center. Default: 1 */
  iconScale?: number;

  /** Gap between icon and wordmark. Default: 32 */
  gap?: number;

  /** Wordmark font size. Default: 119.87 */
  fontSize?: number;

  /** Wordmark letter spacing. Default: 1 */
  letterSpacing?: number;

  /** Wordmark baseline position. Default: 99.62 */
  textY?: number;

  /** Font family. */
  fontFamily?: string;

  /** Font weight. Default: 700 */
  fontWeight?: number | string;

  /** Icon color. Defaults to currentColor. */
  iconColor?: string;

  /** Wordmark color. Defaults to currentColor. */
  textColor?: string;

  /** Right padding after wordmark. Default: 8 */
  trailingPad?: number;
}

export const BrandMark = React.forwardRef<
  SVGSVGElement,
  BrandMarkProps
>(
  (
    {
      text = "Gitpad",
      iconScale = 1,
      gap = 32,
      fontSize = 119.87,
      letterSpacing = 1,
      textY = 99.62,
      fontFamily = "'Californian FB', serif",
      fontWeight = 700,
      iconColor,
      textColor,
      trailingPad = 8,
      className,
      fill = "currentColor",
      ...props
    },
    ref
  ) => {
    /*
     * Normalize the icon to the wordmark's reference height.
     * 392.72 / 361.65 x 130.29 ~= 141.49
     */
    const referenceHeight = TEXT_REFERENCE_HEIGHT;

    const iconReferenceWidth =
      (ICON_WIDTH / ICON_HEIGHT) * referenceHeight;

    const iconCenterX = iconReferenceWidth / 2;

    const scaledIconWidth = iconReferenceWidth * iconScale;

    const iconLeft = iconCenterX - scaledIconWidth / 2;

    const textScale = fontSize / TEXT_REFERENCE_HEIGHT;

    /*
     * Estimate the dynamic wordmark width from the source artwork
     * (font-size 119.87, scaleX 0.97 in the supplied SVG).
     */
    const baseTextWidth = TEXT_REFERENCE_WIDTH * textScale * 0.97;

    const textWidth =
      text === "Gitpad"
        ? baseTextWidth
        : text.length * fontSize * 0.59 +
          Math.max(text.length - 1, 0) * letterSpacing;

    const textX = iconLeft + scaledIconWidth + gap;

    const totalWidth = textX + textWidth + trailingPad;

    const totalHeight = referenceHeight;

    // Center the icon vertically inside the wordmark reference height.
    const iconY = (referenceHeight - referenceHeight * iconScale) / 2;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className={className}
        role="img"
        aria-label={text}
        {...props}
      >
        {/* ---------- Icon ---------- */}
        <g
          transform={`
            translate(${iconLeft} ${iconY})
            scale(${(referenceHeight / ICON_HEIGHT) * iconScale})
          `}
          fill={iconColor ?? fill}
        >
          {/* Back / tab layer */}
          <path
            opacity="0.78"
            d="
              M392.72 109.41
              V310.26
              C392.72 338.64 373.74 361.65 350.34 361.65
              H42.38
              C19 361.65 0 338.64 0 310.26
              V51.39
              C0 23 19 0 42.38 0
              H141
              C153.13 0 164.56 6.91 171.87 18.65
              L184.77 39.38
              C192.06 51.12 203.49 58 215.62 58
              H350.34
              C373.74 58 392.72 81 392.72 109.41
              Z
            "
          />

          {/* Front layer */}
          <path
            d="
              M392.72 100.78
              V318.45
              C392.72 342.32 373.74 361.65 350.34 361.65
              H42.38
              C19 361.65 0 342.32 0 318.45
              V100.78
              C0 76.91 19 57.56 42.38 57.56
              H350.34
              C373.74 57.56 392.72 76.91 392.72 100.78
              Z
            "
          />
        </g>

        {/* ---------- Wordmark ---------- */}
        <text
          x={textX}
          y={textY}
          fontFamily={fontFamily}
          fontSize={fontSize}
          fontWeight={fontWeight}
          letterSpacing={letterSpacing}
          fill={textColor ?? fill}
          textLength={text === "Gitpad" ? baseTextWidth : undefined}
          lengthAdjust={text === "Gitpad" ? "spacingAndGlyphs" : undefined}
        >
          {text}
        </text>
      </svg>
    );
  }
);

BrandMark.displayName = "BrandMark";