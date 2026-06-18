/**
 * Normalizes a German tax number (Steuernummer) by removing formatting characters
 * and returning only digits.
 *
 * Supported formats:
 * - 10 digits: Old format (FFBBB UUUUP)
 * - 11 digits: Some Länder format
 * - 12 digits: LLFF BBB UUUU (without leading zero)
 * - 13 digits: ELSTER unified format (LL FFBB UUUUP)
 *
 * @param input - Tax number with or without formatting
 * @returns Normalized digits string, or empty string if invalid
 */
export function normalizeSteuernummer(input: string): string {
  if (!input) return '';

  // Convert to string if not already (handles numeric input)
  const inputStr = String(input);

  // remove all non-digits
  const digits = inputStr.replace(/\D+/g, '');

  // Most common lengths:
  // 10 digits (old format), 11 digits (some Länder), 12 digits, 13 digits (ELSTER)
  if (digits.length === 10) {
    // old FFBBB UUUUP format
    return digits;
  }

  if (digits.length === 11) {
    // 11-digit format used by some federal states
    return digits;
  }

  if (digits.length === 12) {
    // 12-digit format (LLFF BBB UUUU)
    return digits;
  }

  if (digits.length === 13) {
    // ELSTER unified 13-digit format
    return digits;
  }

  return ''; // invalid structure
}

/**
 * Converts a 10/11/12-digit tax number to the 13-digit ELSTER format.
 *
 * ELSTER format: `LLFF0BBBUUUUP` (non-NRW) or `LLFF0BBBBUUUP` (NRW).
 *
 * For every on-Bescheid 10/11-digit shape (`FF BBB UUUUP`, `FFF BBB UUUUP`,
 * `0FF BBB UUUUP` for Hessen, `FFF BBBB UUUP` for NRW, and the legacy
 * "ELSTER minus LL" `FF0BBBUUUUP`), the trailing 8 digits are always the
 * `BBB+UUUUP` (non-NRW) or `BBBB+UUUP` (NRW) suffix — i.e., everything after
 * the `0` separator in the 13-digit form. So the unified rule for those inputs
 * is `bufa + '0' + last8`.
 *
 * 12- and 13-digit inputs already encode the BUFA themselves, so `bufa` is
 * optional in those cases; for 10/11-digit inputs a valid 4-digit BUFA is
 * required (separators in `bufa` are tolerated and stripped).
 *
 * @param input - Tax number digits (10, 11, 12, or 13 digits; separators stripped automatically)
 * @param bufa  - 4-digit BUFA code (Landesnummer + Finanzamtsnummer); required for 10/11-digit input
 * @returns 13-digit ELSTER format, or null if conversion not possible
 */
export function normalizeTo13Digits(input: string, bufa?: string | null): string | null {
  if (!input) return null;

  const digits = input.replace(/\D+/g, '');
  const cleanBufa = bufa ? String(bufa).replace(/\D+/g, '').substring(0, 4) : null;

  if (digits.length === 13) return digits;

  // 12-digit: LLFF + (BBB+UUUUP | BBBB+UUUP) — insert '0' at position 4
  if (digits.length === 12) {
    return digits.substring(0, 4) + '0' + digits.substring(4);
  }

  // 10 or 11-digit Bescheid forms — drop the leading FF/FFF/0FF/FF0 prefix and
  // prepend `BUFA + '0'`. Works uniformly for NRW and non-NRW.
  if ((digits.length === 10 || digits.length === 11) && cleanBufa && cleanBufa.length === 4) {
    return cleanBufa + '0' + digits.slice(-8);
  }

  return null;
}
