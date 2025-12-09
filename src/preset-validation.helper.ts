import * as validCountryCodes from './country-codes.json';
import { validateSteuernummer } from './tax-number/validation-tax-number';

/**
 * Validation preset types
 */
export type ValidationPresetType = 'taxId' | 'taxNumber' | 'iban' | 'bic';

/**
 * Validation preset enum for consistency
 */
export const ValidationPreset = {
  TAX_ID: 'taxId' as const,
  TAX_NUMBER: 'taxNumber' as const,
  IBAN: 'iban' as const,
  BIC: 'bic' as const,
} as const;

/**
 * Calculates the check digit for a German tax ID (Steueridentifikationsnummer)
 * using the modulo 11 algorithm
 */
function calculateTaxIdCheckDigit(taxIdDigits: string): number {
  const modulus = 11;
  const base = 10;
  let product = base;

  const length = taxIdDigits.length;
  for (let i = 0; i < length; i++) {
    const digit = parseInt(taxIdDigits.charAt(i), 10);
    let sum = (digit + product) % base;

    if (sum === 0) {
      sum = base;
    }

    product = (2 * sum) % modulus;
  }

  const checkDigit = modulus - product;
  return checkDigit === 10 ? 0 : checkDigit;
}

/**
 * Validates a German tax ID (Steueridentifikationsnummer)
 * Requirements:
 * - Must be exactly 11 digits
 * - Last digit must be a valid check digit according to modulo 11 algorithm
 */
export function validateGermanTaxId(taxId: string): boolean {
  // Remove any whitespace
  const cleanedTaxId = taxId.trim().replace(/\s/g, '');

  // German tax ID must be exactly 11 digits
  if (!/^\d{11}$/.test(cleanedTaxId)) {
    return false;
  }

  // Extract the first 10 digits and the check digit (last digit)
  const mainDigits = cleanedTaxId.substring(0, 10);
  const providedCheckDigit = parseInt(cleanedTaxId.charAt(10), 10);

  // Calculate what the check digit should be
  const calculatedCheckDigit = calculateTaxIdCheckDigit(mainDigits);

  // Validate by comparing calculated check digit with provided check digit
  return calculatedCheckDigit === providedCheckDigit;
}

/**
 * Validates a German tax number (Steuernummer)
 * German tax numbers can have different formats depending on the federal state
 * This validates the unified federal format (13 digits) and common state formats (10-11 digits)
 */
export function validateGermanTaxNumber(taxNumber: string): boolean {
  const result = validateSteuernummer(taxNumber);
  return result.valid;
}

/**
 * Validates an IBAN (International Bank Account Number) using mod-97 algorithm
 * Based on ISO 13616 standard
 */
export function validateIBAN(iban: string): boolean {
  // Remove all whitespace and convert to uppercase
  const cleaned = iban.trim().replace(/\s/g, '').toUpperCase();

  // IBAN must be 15-34 characters (varies by country)
  if (cleaned.length < 15 || cleaned.length > 34) {
    return false;
  }

  // First two characters must be letters (country code)
  // Next two characters must be digits (check digits)
  // Remaining characters are alphanumeric
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleaned)) {
    return false;
  }

  // Validate country code against ISO 13616 IBAN-compliant countries
  const countryCode = cleaned.substring(0, 2);
  const validCodes = validCountryCodes.countryCodes;
  if (!validCodes.includes(countryCode)) {
    return false;
  }

  // Validate using mod-97 algorithm (ISO 7064)
  // Move first 4 characters to the end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);

  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged.charAt(i);
    if (char >= 'A' && char <= 'Z') {
      // Convert letter to number: A=10, B=11, ..., Z=35
      numericString += (char.charCodeAt(0) - 55).toString();
    } else {
      numericString += char;
    }
  }

  // Calculate mod 97 of the numeric string
  // For large numbers, we need to calculate mod iteratively
  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString.charAt(i), 10)) % 97;
  }

  // Valid IBAN has remainder of 1
  return remainder === 1;
}

/**
 * Validates a BIC/SWIFT code (Bank Identifier Code)
 * Based on ISO 9362 standard
 * Format: AAAA BB CC [DDD]
 * - AAAA: 4 letter bank code
 * - BB: 2 letter country code (ISO 3166-1 alpha-2)
 * - CC: 2 character location code (letters or digits)
 * - DDD: Optional 3 character branch code (letters or digits)
 */
export function validateBIC(bic: string): boolean {
  // Remove whitespace and convert to uppercase
  const cleaned = bic.trim().replace(/\s/g, '').toUpperCase();

  // BIC must be either 8 or 11 characters
  if (cleaned.length !== 8 && cleaned.length !== 11) {
    return false;
  }

  // Validate format:
  // - First 4 characters: letters only (bank code)
  // - Next 2 characters: letters only (country code)
  // - Next 2 characters: letters or digits (location code)
  // - Optional last 3 characters: letters or digits (branch code)
  if (cleaned.length === 8) {
    // Format: AAAABBCC
    if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}$/.test(cleaned)) {
      return false;
    }
  } else {
    // Format: AAAABBCCDDD
    if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[A-Z0-9]{3}$/.test(cleaned)) {
      return false;
    }
  }

  // Additional validation: Check if country code is IBAN-compliant (ISO 13616)
  const countryCode = cleaned.substring(4, 6);
  const validCodes = validCountryCodes.countryCodes;
  if (!validCodes.includes(countryCode)) {
    return false;
  }

  return true;
}

/**
 * Main validation function that runs the appropriate preset validator
 * @param presetKey - The validation preset type
 * @param value - The value to validate
 * @returns boolean indicating if the value is valid
 */
export function runValidationPreset(presetKey: ValidationPresetType, value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  switch (presetKey) {
    case ValidationPreset.TAX_ID:
      return validateGermanTaxId(value);
    case ValidationPreset.IBAN:
      return validateIBAN(value);
    case ValidationPreset.BIC:
      return validateBIC(value);
    case ValidationPreset.TAX_NUMBER:
      return validateGermanTaxNumber(value);
    default:
      console.warn(`[runValidationPreset] Unknown validation preset: "${presetKey}"`);
      return false;
  }
}
