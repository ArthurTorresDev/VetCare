/**
 * Controllers / Adaptadores de regra de interface do frontend
 */
export class UIController {
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
