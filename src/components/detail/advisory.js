export const ADVISORY = {
  G: 'Suitable for all ages.',
  PG: 'Some material may not be suitable for young children.',
  'PG-13': 'Violence, intense sequences and some strong language.',
  R: 'Strong violence, language and mature themes.',
  'TV-14': 'May contain intense themes, violence and language unsuitable for under 14.',
  'TV-MA': 'Mature audiences only: strong violence, language and adult content.',
};
export const advisoryFor = (cert) => ADVISORY[cert] || 'Viewer discretion is advised.';