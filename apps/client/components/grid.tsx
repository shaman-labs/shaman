import React from 'react';
import { cn } from '@/lib/utils';

type GridProps = {
  children: React.ReactNode;
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
  className?: string;
};

type GridItemProps = {
  children: React.ReactNode;
  colSpan?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  className?: string;
};

export function Grid({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className,
}: GridProps) {
  const getColsClass = () => {
    if (typeof cols === 'number') {
      return `grid-cols-${cols}`;
    }

    const breakpoints = [];
    if (cols.sm) breakpoints.push(`grid-cols-${cols.sm}`);
    if (cols.md) breakpoints.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) breakpoints.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) breakpoints.push(`xl:grid-cols-${cols.xl}`);

    return breakpoints.join(' ');
  };

  const gapClass = typeof gap === 'number' ? `gap-${gap}` : `gap-${gap}`;

  return (
    <div className={cn('grid', getColsClass(), gapClass, className)}>
      {children}
    </div>
  );
}

export function GridItem({ children, colSpan = 1, className }: GridItemProps) {
  const getColSpanClass = () => {
    if (typeof colSpan === 'number') {
      return `col-span-${colSpan}`;
    }

    const breakpoints = [];
    if (colSpan.sm) breakpoints.push(`col-span-${colSpan.sm}`);
    if (colSpan.md) breakpoints.push(`md:col-span-${colSpan.md}`);
    if (colSpan.lg) breakpoints.push(`lg:col-span-${colSpan.lg}`);
    if (colSpan.xl) breakpoints.push(`xl:col-span-${colSpan.xl}`);

    return breakpoints.join(' ');
  };

  return (
    <div className={cn('w-full overflow-hidden', getColSpanClass(), className)}>
      {children}
    </div>
  );
}
