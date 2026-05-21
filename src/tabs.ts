import { state } from './state';
import { ui } from './ui';

export type TabId = 'goals' | 'job-search' | 'macrofirm' | 'email';

export function switchTab(tab: TabId): void {
  ui.goalsContainer.classList.toggle('hidden', tab !== 'goals');
  ui.p1Container.classList.toggle('hidden', tab !== 'job-search');
  ui.p2Container.classList.toggle('hidden', tab !== 'macrofirm');
  ui.emailContainer.classList.toggle('hidden', tab !== 'email');

  ui.tabJobSearch.classList.toggle('tab-active', tab === 'job-search');
  ui.tabGoals.classList.toggle('tab-active', tab === 'goals');
  ui.tabMacrofirm.classList.toggle('tab-active', tab === 'macrofirm');
  ui.tabEmail.classList.toggle('tab-active', tab === 'email');

  ui.tabMacrofirm.disabled = state.phase < 2;
}
