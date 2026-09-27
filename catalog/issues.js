export const magazineIssues = [
  {
    number: 1,
    label: 'Mag 01',
    title: 'Strength, beauty, culture and you',
    href: '/catalog/',
    cover: '/assets/catalog-strength-black.jpeg',
    published: true,
    current: true,
  },
];

export function publishedIssuesNewestFirst() {
  return magazineIssues
    .filter((issue) => issue.published)
    .slice()
    .sort((a, b) => b.number - a.number);
}
