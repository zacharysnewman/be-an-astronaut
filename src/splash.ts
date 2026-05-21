const MESSAGES = [
  'Connecting to network...',
  'Locating DNS server...',
  'Establishing secure session...',
  'Loading Indebt.com portal...',
  'Restoring your profile...',
];

const DURATION = 2800;
const FADE_MS  = 400;

export function showSplash(): void {
  const overlay  = document.getElementById('loading-overlay') as HTMLElement;
  const statusEl = overlay.querySelector<HTMLElement>('.splash-status')!;
  const fillEl   = overlay.querySelector<HTMLElement>('.splash-progress-fill')!;

  overlay.classList.remove('hidden', 'splash-fade-out');

  // Restart progress bar CSS animation
  fillEl.classList.remove('splash-animating');
  void fillEl.offsetHeight; // force reflow
  fillEl.classList.add('splash-animating');

  statusEl.textContent = MESSAGES[0];
  let idx = 0;
  const step = Math.floor(DURATION / MESSAGES.length);
  const timer = setInterval(() => {
    idx++;
    if (idx < MESSAGES.length) statusEl.textContent = MESSAGES[idx];
  }, step);

  setTimeout(() => {
    clearInterval(timer);
    statusEl.textContent = 'Done.';
    overlay.classList.add('splash-fade-out');
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('splash-fade-out');
    }, FADE_MS);
  }, DURATION);
}

export function skipSplash(): void {
  const overlay = document.getElementById('loading-overlay') as HTMLElement;
  overlay.classList.add('hidden');
  overlay.classList.remove('splash-fade-out');
}
