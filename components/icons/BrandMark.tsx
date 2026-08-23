// file: components/icons/BrandMark.tsx
import * as React from 'react';

export interface BrandMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function BrandMark({ size, className, ...props }: BrandMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 838.92 245"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      role="img"
      aria-label="Brand mark"
      {...props}
    >
      <g>
        <rect x="194.49" y="122.49" width="53.55" height="95.11" />
        <rect x="274.82" y="217.48" width="53.56" height="0.13" />
        <polygon points="57.18 51.16 57.18 193.82 114.15 193.82 114.15 122.49 167.71 122.49 167.71 241.38 56.91 241.38 56.91 217.6 3.62 217.6 3.62 27.99 56.91 27.99 56.91 3.62 167.71 3.62 167.71 51.16 57.18 51.16" />
        <path d="M782,27.39V3.62H671.2V241.38H782V217.6H835.3V27.39ZM724.76,51.16h57V193.83h-57Z" />
        <path d="M356.6,27.39V217.6h53.55V122.49H493.9V27.39ZM467.12,98.71h-57V51.16h57Z" />
        <path d="M513.7,27.39V217.6h53.56V122.49h57V217.6H651V27.39ZM624.24,98.71h-57V51.16h57Z" />
        <polygon points="328.38 122.49 328.38 190.72 343.15 190.72 343.15 217.48 274.82 217.48 274.82 122.49 261.89 122.49 261.89 80.86 274.82 80.86 274.82 27.39 328.3 27.39 328.3 80.86 343.15 80.86 343.15 122.49 328.38 122.49" />
        <rect x="195.03" y="27.39" width="53.48" height="53.48" />
        <rect
          x="3.62"
          y="3.62"
          width="831.68"
          height="237.77"
          fill="none"
          stroke="currentColor"
          strokeMiterlimit="10"
          strokeWidth="7.23"
        />
      </g>
    </svg>
  );
}