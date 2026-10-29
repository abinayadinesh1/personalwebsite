// 'YYYY-MM-DD' -> 'MM.DD.YY', the bookshelf's date style
export function shelfDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${m}.${d}.${y.slice(2)}`;
}
