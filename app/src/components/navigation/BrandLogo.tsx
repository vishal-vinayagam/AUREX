import React from 'react';

interface BrandLogoProps {
  showText?: boolean;
  text?: string;
  imageClassName?: string;
  textClassName?: string;
  className?: string;
}

export default function BrandLogo({
  showText = true,
  text = 'AUREX',
  imageClassName = 'w-8 h-8',
  textClassName = 'font-extrabold text-lg tracking-[0.08em] text-foreground',
  className = '',
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <img
        src="/logo.png"
        alt="AUREX Logo"
        className={`${imageClassName} rounded-lg object-contain shrink-0`.trim()}
      />
      {showText && <span className={textClassName}>{text}</span>}
    </div>
  );
}

