import type { LogType } from './types';
import { ui } from './ui';

export function logMessage(msg: string, type: LogType = ''): void {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  let colorStyle = '';
  if (type === 'bad')    colorStyle = 'color: #ff5555; font-weight: bold;';
  if (type === 'good')   colorStyle = 'color: #55ff55; font-weight: bold;';
  if (type === 'promo')  colorStyle = 'color: #55aaff; font-weight: bold;';
  if (type === 'system') colorStyle = 'color: #d284fc;';

  ui.log.innerHTML = `<span style="${colorStyle}">[${time}] ${msg}</span><br>` + ui.log.innerHTML;
}

export function formatMoney(amount: number): string {
  const absAmount = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return amount < 0 ? `-$${absAmount}` : `$${absAmount}`;
}

export function getGeometricCost(base: number, rate: number, level: number): number {
  return Math.floor(base * Math.pow(rate, level));
}

export function getExponentialCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}
