import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function escapeHTML(str: string): string {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function fmtTime(ts: number): string {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 3600) return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd';
  return new Date(ts).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

export const TAG_CLASS: Record<string, string> = {
  dibujo: 'bg-red-500/15 text-red-400',
  ia: 'bg-green-500/15 text-green-400',
  familia: 'bg-emerald-500/15 text-emerald-400',
  tech: 'bg-purple-500/15 text-purple-400',
};

export const TAG_LABEL: Record<string, string> = {
  dibujo: 'Dibujo',
  ia: 'IA',
  familia: 'Familia',
  tech: 'Tech',
};
