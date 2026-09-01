/**
 * Generates a ticket number in the format:
 * TKT-YYYY-NNNNNN
 *
 * Example:
 * TKT-2026-000001
 */
export function generateTicketNumber(
  sequence: number,
  date: Date = new Date()
): string {
  const year = date.getFullYear();

  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Sequence must be a positive integer.");
  }

  const paddedSequence = sequence.toString().padStart(6, "0");

  return `TKT-${year}-${paddedSequence}`;
}
