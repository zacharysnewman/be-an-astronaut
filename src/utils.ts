import type { LogType } from './types';
import { ui } from './ui';

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateProviderPriceSets(count: number): Array<{ finite: number; weeklink: number; bliply: number }> {
  const rng = mulberry32(0xBEA5730);
  return Array.from({ length: count }, () => ({
    finite:   parseFloat((0.5 + rng() * 3.0).toFixed(2)),
    weeklink: parseFloat((0.5 + rng() * 3.0).toFixed(2)),
    bliply:   parseFloat((0.5 + rng() * 3.0).toFixed(2)),
  }));
}

export function logMessage(msg: string, type: LogType = ''): void {
  let colorStyle = '';
  if (type === 'bad')    colorStyle = 'color: #ff5555; font-weight: bold;';
  if (type === 'good')   colorStyle = 'color: #55ff55; font-weight: bold;';
  if (type === 'promo')  colorStyle = 'color: #55aaff; font-weight: bold;';
  if (type === 'system') colorStyle = 'color: #d284fc;';

  ui.log.innerHTML += `<div style="${colorStyle}">${msg}</div>`;
}

export function formatMoney(amount: number): string {
  const absAmount = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount < 0 ? `-$${absAmount}` : `$${absAmount}`;
}

export function getGeometricCost(base: number, rate: number, level: number): number {
  return Math.floor(base * Math.pow(rate, level));
}

export function getLinearCost(base: number, count: number): number {
  return base * (count + 1);
}
