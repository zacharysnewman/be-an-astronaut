import type { Email } from './types';
import { MACROFIRM, INDEBT, ZENMO } from './constants';
import { formatMoney } from './utils';

export function createMacrofirmOfferEmail(): Email {
  return {
    id: 'macrofirm-offer',
    from: `HR@${MACROFIRM}.com`,
    subject: `Job Offer — Specialist, ${MACROFIRM}`,
    bodyHtml: `<p>Dear Applicant,</p>
<p>Thank you for your interest in the <b>Specialist</b> position at <b>${MACROFIRM}</b>. After a thorough review of your application materials, we are pleased to extend a formal offer of employment.</p>
<p>You will be assigned to <b>Desk 4B</b>, effective immediately upon acceptance. Compensation is structured at a rate of <b>$0.60&ndash;$1.20/hr</b>, commensurate with corporate grade level.</p>
<p>Please review these terms and click below to confirm your acceptance.</p>`,
    read: false,
    actions: [{ id: 'accept-macrofirm-offer', label: 'Accept Offer', executed: false }],
  };
}

export function createIndebtPromoEmail(): Email {
  return {
    id: `indebt-promo-${Date.now()}`,
    from: `promotions@${INDEBT}`,
    subject: `[PROMO] Complimentary Job Search — on us!`,
    bodyHtml: `<p>Hi there,</p>
<p>We noticed your job listing pool is running a little dry. Don't get discouraged — every great career has its rough patches!</p>
<p>As a valued ${INDEBT} member, we're treating you to a <b>complimentary job search</b>, on the house. Click the button below to refresh your listings at no charge.</p>
<p style="color:#888;font-size:0.85em;">— The ${INDEBT} Team</p>`,
    read: false,
    actions: [{ id: 'indebt-free-search', label: 'Free Job Search!', executed: false }],
  };
}

export function createZenmoParentalEmail(amount: number, note?: string): Email {
  const noteHtml = note
    ? `<p><b>Note:</b> &ldquo;${note}&rdquo;</p>`
    : '';
  return {
    id: `zenmo-parental-${Date.now()}`,
    from: `no-reply@${ZENMO}.com`,
    subject: `Mom sent you ${formatMoney(amount)}`,
    bodyHtml: `<p>Hi!</p>
<p>Your mom sent you <b>${formatMoney(amount)}</b> via <b>${ZENMO}</b>.</p>
${noteHtml}<p>Funds have been deposited to your account.</p>
<p style="color:#888;font-size:0.85em;">— The ${ZENMO} Team</p>`,
    read: false,
    actions: [],
  };
}
