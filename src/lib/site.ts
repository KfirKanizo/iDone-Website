/** Site-wide facts. Placeholders are marked [TBD] and listed in the README. */
export const SITE = {
  name: 'iDone Technologies',
  url: 'https://www.idone.co.il',
  /** Contact form webhook (n8n). */
  formEndpoint: 'https://n8n.idone.co.il/webhook/website-form',
  /** Assessment questionnaire webhook (n8n, workflow "Assessment Submitted"). */
  assessmentEndpoint: 'https://n8n.idone.co.il/webhook/assessment',
  email: 'support@idone.co.il',
  phone: '052-8888182',
  /** International format without "+" or spaces, e.g. 9725XXXXXXXX. Empty = button links to the contact page. */
  whatsapp: '972528888182',
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61578292571197',
    instagram: 'https://www.instagram.com/idoneautomations/',
    linkedin: '',
  },
  /** For ProfessionalService structured data. */
  address: { locality: '[TBD: city]', country: 'IL' },
  founded: '',
} as const;

export const isPlaceholder = (s: string) => !s || s.startsWith('[TBD');

export function whatsappHref(text?: string): string | null {
  if (!SITE.whatsapp) return null;
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${SITE.whatsapp}${q}`;
}
