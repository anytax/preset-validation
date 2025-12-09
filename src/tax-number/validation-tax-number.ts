import { BUFA_MAP } from './finanzamtsdaten';
import { normalizeSteuernummer, normalizeTo13Digits } from './normalization';
import { validatePruefziffer } from './prufziffernverfahren';

/**
 * Finds all possible BUFA codes that match the Finanzamt number from the input
 */
function findPossibleBufas(finanzamtNumber: string): string[] {
  const bufas: string[] = [];

  for (const [bufa, info] of Object.entries(BUFA_MAP)) {
    if (info.finanzamtsnummer === finanzamtNumber) {
      bufas.push(bufa);
    }
  }

  return bufas;
}

/**
 * Validates 10-digit old format tax numbers by converting to 13-digit ELSTER format
 * Format: FFBBB UUUUP (Finanzamt 2 digits + Bezirk 3 digits + Unterscheidung 4 digits + Prüfziffer 1 digit)
 */
function validate10DigitFormat(normalized: string): {
  valid: boolean;
  normalized?: string;
  bufa?: string;
  bundesland?: string;
  reason?: string;
} {
  // Check if it's all zeros (invalid)
  if (/^0+$/.test(normalized)) {
    return { valid: false, reason: 'Tax number cannot be all zeros' };
  }

  // Extract Finanzamt number (first 2 digits)
  const finanzamtNumber = normalized.substring(0, 2);

  // Find all possible BUFAs with this Finanzamt number
  const possibleBufas = findPossibleBufas(finanzamtNumber);

  if (possibleBufas.length === 0) {
    // No matching Finanzamt found - reject it
    return {
      valid: false,
      reason: 'Unknown Finanzamt number - no matching BUFA found',
    };
  }

  // Try each possible BUFA and see if any produces a valid 13-digit number
  for (const bufa of possibleBufas) {
    const converted13Digit = normalizeTo13Digits(normalized, bufa);

    if (converted13Digit) {
      const info = BUFA_MAP[bufa];
      const isValidCheckDigit = validatePruefziffer(converted13Digit, info);

      if (isValidCheckDigit) {
        // Found a valid conversion!
        return {
          valid: true,
          normalized: converted13Digit,
          bufa,
          bundesland: info.bundesland,
        };
      }
    }
  }

  // None of the possible conversions passed Prüfziffer validation - reject it
  return {
    valid: false,
    reason: 'Invalid check digit (Prüfziffer) for all possible BUFAs',
  };
}

/**
 * Validates 11-digit format tax numbers by converting to 13-digit ELSTER format
 * Used by some federal states
 */
function validate11DigitFormat(normalized: string): {
  valid: boolean;
  normalized?: string;
  bufa?: string;
  bundesland?: string;
  reason?: string;
} {
  // Check if it's all zeros (invalid)
  if (/^0+$/.test(normalized)) {
    return { valid: false, reason: 'Tax number cannot be all zeros' };
  }

  // Extract Finanzamt number (first 2 digits)
  const finanzamtNumber = normalized.substring(0, 2);

  // Find all possible BUFAs with this Finanzamt number
  const possibleBufas = findPossibleBufas(finanzamtNumber);

  if (possibleBufas.length === 0) {
    // No matching Finanzamt found - reject it
    return {
      valid: false,
      reason: 'Unknown Finanzamt number - no matching BUFA found',
    };
  }

  // Try each possible BUFA and see if any produces a valid 13-digit number
  for (const bufa of possibleBufas) {
    const converted13Digit = normalizeTo13Digits(normalized, bufa);

    if (converted13Digit) {
      const info = BUFA_MAP[bufa];
      const isValidCheckDigit = validatePruefziffer(converted13Digit, info);

      if (isValidCheckDigit) {
        return {
          valid: true,
          normalized: converted13Digit,
          bufa,
          bundesland: info.bundesland,
        };
      }
    }
  }

  // Reject - Prüfziffer validation failed
  return {
    valid: false,
    reason: 'Invalid check digit (Prüfziffer) for all possible BUFAs',
  };
}

/**
 * Validates 12-digit format tax numbers by converting to 13-digit ELSTER format
 */
function validate12DigitFormat(normalized: string): {
  valid: boolean;
  normalized?: string;
  bufa?: string;
  bundesland?: string;
  reason?: string;
} {
  // Check if it's all zeros (invalid)
  if (/^0+$/.test(normalized)) {
    return { valid: false, reason: 'Tax number cannot be all zeros' };
  }

  // Extract BUFA (first 4 digits: LL + FF)
  const bufa = normalized.substring(0, 4);
  const info = BUFA_MAP[bufa];

  if (!info) {
    // Unknown BUFA - reject it
    return {
      valid: false,
      reason: 'Unknown BUFA code - not a valid German tax office',
    };
  }

  // Try to convert to 13 digits
  const converted13Digit = normalizeTo13Digits(normalized, bufa);

  if (!converted13Digit) {
    return { valid: false, reason: 'Cannot convert to 13-digit format' };
  }

  // Validate check digit
  const isValidCheckDigit = validatePruefziffer(converted13Digit, info);

  if (!isValidCheckDigit) {
    // Invalid check digit - reject it
    return {
      valid: false,
      reason: 'Invalid check digit (Prüfziffer)',
    };
  }

  return {
    valid: true,
    normalized: converted13Digit,
    bufa,
    bundesland: info.bundesland,
  };
}

/**
 * Validates 13-digit ELSTER format with full BUFA and Prüfziffer validation
 */
function validate13DigitFormat(normalized: string): {
  valid: boolean;
  normalized?: string;
  bufa?: string;
  bundesland?: string;
  reason?: string;
} {
  const landesnummer = normalized.substring(0, 2);
  const finanzamtsnummer = normalized.substring(2, 4);
  const bufa = landesnummer + finanzamtsnummer;

  const info = BUFA_MAP[bufa];
  if (!info) {
    return { valid: false, reason: 'Unknown BUFA or Finanzamt' };
  }

  const isValidCheckDigit = validatePruefziffer(normalized, info);
  if (!isValidCheckDigit) {
    return { valid: false, reason: 'Invalid Prüfziffer', bufa, bundesland: info.bundesland };
  }

  return {
    valid: true,
    normalized,
    bufa,
    bundesland: info.bundesland,
  };
}

/**
 * Validates a German tax number (Steuernummer)
 * Supports multiple formats:
 * - 10 digits: Old format (FFBBB UUUUP) - converts to 13-digit ELSTER format if possible
 * - 11 digits: Some Länder format - converts to 13-digit ELSTER format if possible
 * - 12 digits: LLFF BBB UUUU - converts to 13-digit ELSTER format if possible
 * - 13 digits: ELSTER unified format with full BUFA and Prüfziffer validation
 *
 * For 10, 11, and 12-digit formats, the function attempts to convert to 13-digit ELSTER
 * format and validate with full BUFA and Prüfziffer checking. If conversion is not possible,
 * basic validation is performed.
 */
export function validateSteuernummer(input: string): {
  valid: boolean;
  normalized?: string;
  bufa?: string;
  bundesland?: string;
  reason?: string;
} {
  const normalized = normalizeSteuernummer(input);
  if (!normalized) return { valid: false, reason: 'Invalid length or characters' };

  // Route to appropriate validator based on length
  switch (normalized.length) {
    case 10:
      return validate10DigitFormat(normalized);
    case 11:
      return validate11DigitFormat(normalized);
    case 12:
      return validate12DigitFormat(normalized);
    case 13:
      return validate13DigitFormat(normalized);
    default:
      return { valid: false, reason: 'Invalid length: must be 10, 11, 12, or 13 digits' };
  }
}
