import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function trimHash(hash = '', startSize = 4): string {
  if (!hash) return '';

  return `${hash?.substring(0, startSize)}...${hash?.substring(
    (hash?.length || 0) - 4
  )}`;
}
