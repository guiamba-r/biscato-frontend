export function formatMT(value: number): string {
  return `${new Intl.NumberFormat('pt-MZ', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))} MT`;
}

export function formatMTRange(min: number, max: number): string {
  const fmt = new Intl.NumberFormat('pt-MZ', { maximumFractionDigits: 0 });
  return `${fmt.format(min)} – ${fmt.format(max)} MT`;
}
