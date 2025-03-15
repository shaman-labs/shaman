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
      const gridColsMap: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10',
        11: 'grid-cols-11',
        12: 'grid-cols-12',
      };
      return gridColsMap[cols] || 'grid-cols-1';
    }

    const breakpoints = ['grid-cols-1'];

    if (cols.sm) {
      const smMap: Record<number, string> = {
        1: 'sm:grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-3',
        4: 'sm:grid-cols-4',
        5: 'sm:grid-cols-5',
        6: 'sm:grid-cols-6',
        7: 'sm:grid-cols-7',
        8: 'sm:grid-cols-8',
        9: 'sm:grid-cols-9',
        10: 'sm:grid-cols-10',
        11: 'sm:grid-cols-11',
        12: 'sm:grid-cols-12',
      };
      breakpoints.push(smMap[cols.sm] || '');
    }

    if (cols.md) {
      const mdMap: Record<number, string> = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
        5: 'md:grid-cols-5',
        6: 'md:grid-cols-6',
        7: 'md:grid-cols-7',
        8: 'md:grid-cols-8',
        9: 'md:grid-cols-9',
        10: 'md:grid-cols-10',
        11: 'md:grid-cols-11',
        12: 'md:grid-cols-12',
      };
      breakpoints.push(mdMap[cols.md] || '');
    }

    if (cols.lg) {
      const lgMap: Record<number, string> = {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
        5: 'lg:grid-cols-5',
        6: 'lg:grid-cols-6',
        7: 'lg:grid-cols-7',
        8: 'lg:grid-cols-8',
        9: 'lg:grid-cols-9',
        10: 'lg:grid-cols-10',
        11: 'lg:grid-cols-11',
        12: 'lg:grid-cols-12',
      };
      breakpoints.push(lgMap[cols.lg] || '');
    }

    if (cols.xl) {
      const xlMap: Record<number, string> = {
        1: 'xl:grid-cols-1',
        2: 'xl:grid-cols-2',
        3: 'xl:grid-cols-3',
        4: 'xl:grid-cols-4',
        5: 'xl:grid-cols-5',
        6: 'xl:grid-cols-6',
        7: 'xl:grid-cols-7',
        8: 'xl:grid-cols-8',
        9: 'xl:grid-cols-9',
        10: 'xl:grid-cols-10',
        11: 'xl:grid-cols-11',
        12: 'xl:grid-cols-12',
      };
      breakpoints.push(xlMap[cols.xl] || '');
    }

    return breakpoints.join(' ');
  };

  const getGapClass = () => {
    if (typeof gap === 'number') {
      const gapMap: Record<number, string> = {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
        10: 'gap-10',
        12: 'gap-12',
        16: 'gap-16',
        20: 'gap-20',
        24: 'gap-24',
      };
      return gapMap[gap] || 'gap-4';
    }
    return `gap-${gap}`;
  };

  return (
    <div className={cn('grid', getColsClass(), getGapClass(), className)}>
      {children}
    </div>
  );
}

export function GridItem({ children, colSpan = 1, className }: GridItemProps) {
  const getColSpanClass = () => {
    if (typeof colSpan === 'number') {
      const colSpanMap: Record<number, string> = {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4',
        5: 'col-span-5',
        6: 'col-span-6',
        7: 'col-span-7',
        8: 'col-span-8',
        9: 'col-span-9',
        10: 'col-span-10',
        11: 'col-span-11',
        12: 'col-span-12',
      };
      return colSpanMap[colSpan] || 'col-span-1';
    }

    const breakpoints = [];

    if (colSpan.sm) {
      const smMap: Record<number, string> = {
        1: 'sm:col-span-1',
        2: 'sm:col-span-2',
        3: 'sm:col-span-3',
        4: 'sm:col-span-4',
        5: 'sm:col-span-5',
        6: 'sm:col-span-6',
        7: 'sm:col-span-7',
        8: 'sm:col-span-8',
        9: 'sm:col-span-9',
        10: 'sm:col-span-10',
        11: 'sm:col-span-11',
        12: 'sm:col-span-12',
      };
      breakpoints.push(smMap[colSpan.sm] || '');
    }

    if (colSpan.md) {
      const mdMap: Record<number, string> = {
        1: 'md:col-span-1',
        2: 'md:col-span-2',
        3: 'md:col-span-3',
        4: 'md:col-span-4',
        5: 'md:col-span-5',
        6: 'md:col-span-6',
        7: 'md:col-span-7',
        8: 'md:col-span-8',
        9: 'md:col-span-9',
        10: 'md:col-span-10',
        11: 'md:col-span-11',
        12: 'md:col-span-12',
      };
      breakpoints.push(mdMap[colSpan.md] || '');
    }

    if (colSpan.lg) {
      const lgMap: Record<number, string> = {
        1: 'lg:col-span-1',
        2: 'lg:col-span-2',
        3: 'lg:col-span-3',
        4: 'lg:col-span-4',
        5: 'lg:col-span-5',
        6: 'lg:col-span-6',
        7: 'lg:col-span-7',
        8: 'lg:col-span-8',
        9: 'lg:col-span-9',
        10: 'lg:col-span-10',
        11: 'lg:col-span-11',
        12: 'lg:col-span-12',
      };
      breakpoints.push(lgMap[colSpan.lg] || '');
    }

    if (colSpan.xl) {
      const xlMap: Record<number, string> = {
        1: 'xl:col-span-1',
        2: 'xl:col-span-2',
        3: 'xl:col-span-3',
        4: 'xl:col-span-4',
        5: 'xl:col-span-5',
        6: 'xl:col-span-6',
        7: 'xl:col-span-7',
        8: 'xl:col-span-8',
        9: 'xl:col-span-9',
        10: 'xl:col-span-10',
        11: 'xl:col-span-11',
        12: 'xl:col-span-12',
      };
      breakpoints.push(xlMap[colSpan.xl] || '');
    }

    return breakpoints.join(' ');
  };

  return (
    <div className={cn('w-full overflow-hidden', getColSpanClass(), className)}>
      {children}
    </div>
  );
}
