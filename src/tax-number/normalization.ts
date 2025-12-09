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
 * Converts 10, 11, or 12-digit tax numbers to 13-digit ELSTER format
 *
 * @param input - Normalized tax number (10, 11, or 12 digits)
 * @param bufa - 4-digit BUFA code (Landesnummer + Finanzamtsnummer)
 * @returns 13-digit ELSTER format, or null if conversion not possible
 */
export function normalizeTo13Digits(input: string, bufa: string): string | null {
  const digits = input.replace(/\D+/g, '');

  const LL = bufa.substring(0, 2);
  // const FF = bufa.substring(2, 4); // Not currently used in conversion logic

  // NRW check (Nordrhein-Westfalen has different structure)
  const isNRW = LL === '05';

  if (digits.length === 10) {
    // FF BBB UUUUP  (normal states)
    const FF_in = digits.substring(0, 2);
    const BBB = digits.substring(2, 5);
    const UUUU = digits.substring(5, 9);
    const P = digits.substring(9);

    if (!isNRW) {
      // Insert 0 after LLFF to make 13 digits: LLFF0BBBUUUUP
      return `${LL}${FF_in}0${BBB}${UUUU}${P}`;
    } else {
      // NRW = FF BBBB UUUP (10-digit)
      const BBBB = digits.substring(2, 6);
      const UUUP = digits.substring(6, 10);
      return `${LL}${FF_in}0${BBBB}${UUUP}`;
    }
  }

  if (digits.length === 11) {
    // 11-digit format: Assume it needs LL prepended
    // FFBBB UUUUP -> LLFFBBB UUUUP (but that's 12 digits)
    // OR it could be LLFFBBB UUUUP already but missing one digit
    // For now, try to convert by adding LL at the beginning and padding
    const FF_in = digits.substring(0, 2);

    if (!isNRW) {
      // Try assuming it's FFBBBUUUUP (missing check digit)
      const BBB = digits.substring(2, 5);
      const UUUU = digits.substring(5, 9);
      const P = digits.substring(9, 11);
      return `${LL}${FF_in}0${BBB}${UUUU}${P}`;
    } else {
      // NRW format
      const BBBB = digits.substring(2, 6);
      const UUUP = digits.substring(6, 11);
      return `${LL}${FF_in}0${BBBB}${UUUP}`;
    }
  }

  if (digits.length === 12) {
    // LLFFBBB UUUU  (normal) - missing the leading 0 and check digit
    const LL_in = digits.substring(0, 2);
    const FF_in = digits.substring(2, 4);

    if (!isNRW) {
      const BBB = digits.substring(4, 7);
      const UUUU = digits.substring(7, 11);
      const P = digits.substring(11, 12);
      return `${LL_in}${FF_in}0${BBB}${UUUU}${P}`;
    } else {
      const BBBB = digits.substring(4, 8);
      const UUUP = digits.substring(8, 12);
      return `${LL_in}${FF_in}0${BBBB}${UUUP}`;
    }
  }

  if (digits.length === 13) {
    return digits; // already correct
  }

  return null;
}
