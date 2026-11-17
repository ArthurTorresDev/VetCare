/**
 * Retorna classe de ícone Phosphor correspondente à espécie do animal.
 */
export function getPetIcon(species?: string): string {
  if (!species) return 'ph-paw-print';
  const s = species.toLowerCase();
  if (s.includes('gato') || s.includes('felino')) return 'ph-cat';
  if (s.includes('cão') || s.includes('cao') || s.includes('cachorro') || s.includes('canino'))
    return 'ph-dog';
  if (s.includes('ave') || s.includes('pássaro') || s.includes('passaro') || s.includes('papagaio'))
    return 'ph-bird';
  return 'ph-paw-print';
}

/**
 * Retorna a descrição legível da idade calculada.
 */
export function calculateAgeDescription(birthDateString?: string): string {
  if (!birthDateString) return 'Idade não informada';
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return 'Idade não informada';
  const now = new Date();
  const monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (monthsDiff < 1) return 'Menos de 1 mês';
  if (monthsDiff < 12) return `${monthsDiff} ${monthsDiff === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(monthsDiff / 12);
  const remainingMonths = monthsDiff % 12;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years}a ${remainingMonths}m`;
}
