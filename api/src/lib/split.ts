/**
 * Splits totalCents across memberCount members using integer arithmetic (cents).
 * The first (totalCents % memberCount) members each receive (base + 1) cents,
 * in the order they were added.
 * All remaining members receive base cents.
 * Guarantees: sum of shares always equals totalCents exactly.
 *
 * Examples:
 *   splitCents(1000, 3) → [334, 333, 333]
 *   splitCents(3000, 3) → [1000, 1000, 1000]
 *   splitCents(4999, 1) → [4999]
 */
export function splitCents(totalCents: number, memberCount: number): number[] {
  const base = Math.floor(totalCents / memberCount)
  const remainder = totalCents % memberCount
  return Array.from({ length: memberCount }, (_, i) => (i < remainder ? base + 1 : base))
}
