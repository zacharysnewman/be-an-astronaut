import { loadCloudState } from './storage';
import { transitionToPhase, mainLoop } from './loop';
import { registerEventListeners } from './events';
import { state } from './state';

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('touchmove', (e: TouchEvent) => {
  if ((e as TouchEvent & { scale: number }).scale !== 1) e.preventDefault();
}, { passive: false });

registerEventListeners();

window.addEventListener('load', () => {
  loadCloudState();
  transitionToPhase(state.phase);
  requestAnimationFrame(mainLoop);
});
