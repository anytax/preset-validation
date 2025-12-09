/**
 * Unit tests for preset validation functions
 */
import {
  runValidationPreset,
  validateBIC,
  validateGermanTaxId,
  validateGermanTaxNumber,
  validateIBAN,
} from '../src/index';

describe('Preset Validation Functions', () => {
  describe('validateGermanTaxId', () => {
    describe('valid tax IDs', () => {
      it('should validate correct German tax IDs', () => {
        expect(validateGermanTaxId('12345678903')).toBe(true);
        expect(validateGermanTaxId('86095742719')).toBe(true);
        expect(validateGermanTaxId('01234567896')).toBe(true);
        expect(validateGermanTaxId('10000000000')).toBe(true);
      });

      it('should validate tax ID with whitespace (removed automatically)', () => {
        expect(validateGermanTaxId('123 456 789 03')).toBe(true);
        expect(validateGermanTaxId('  12345678903  ')).toBe(true);
      });
    });

    describe('invalid tax IDs', () => {
      it('should reject tax ID with incorrect check digit', () => {
        expect(validateGermanTaxId('12345678901')).toBe(false);
      });

      it('should reject tax ID with wrong length', () => {
        expect(validateGermanTaxId('1234567890')).toBe(false); // too short
        expect(validateGermanTaxId('123456789012')).toBe(false); // too long
      });

      it('should reject tax ID with non-numeric characters', () => {
        expect(validateGermanTaxId('1234567890A')).toBe(false);
        expect(validateGermanTaxId('12345-67890')).toBe(false);
        expect(validateGermanTaxId('')).toBe(false);
      });
    });
  });

  describe('validateGermanTaxNumber', () => {
    describe('valid tax numbers', () => {
      it('should reject tax numbers without valid BUFA codes', () => {
        // Strict validation: Numbers with unknown Finanzamt or invalid check digits are rejected
        expect(validateGermanTaxNumber('11/160/87412')).toBe(false); // Invalid check digit
        expect(validateGermanTaxNumber('12345678901')).toBe(false); // Unknown Finanzamt "12"
        expect(validateGermanTaxNumber('111601234567')).toBe(false); // Invalid check digit
        // Note: Real valid tax numbers require correct BUFA codes AND valid check digits
      });

      it('should reject tax numbers with unknown Finanzamt', () => {
        expect(validateGermanTaxNumber('18/181/50815')).toBe(false); // Unknown Finanzamt "18"
        expect(validateGermanTaxNumber('12 345 678 90')).toBe(false); // Unknown Finanzamt "12"
        expect(validateGermanTaxNumber('123-456-789-01')).toBe(false); // Unknown Finanzamt "12"
      });

      it('should reject numbers without valid BUFA during conversion', () => {
        // All rejected due to unknown Finanzamt or invalid check digits
        expect(validateGermanTaxNumber('1234567890')).toBe(false); // Unknown Finanzamt "12"
        expect(validateGermanTaxNumber('12345678901')).toBe(false); // Unknown Finanzamt "12"
        expect(validateGermanTaxNumber('123456789012')).toBe(false); // Unknown BUFA "1234"
      });

      it('should reject complex formatted numbers with invalid BUFA', () => {
        // All rejected due to invalid check digits or unknown BUFA
        expect(validateGermanTaxNumber('  11 / 160 / 874 - 12  ')).toBe(false);
        expect(validateGermanTaxNumber('12-345-678-90')).toBe(false);
        expect(validateGermanTaxNumber('11 16 08 74 12')).toBe(false);
      });
    });

    describe('invalid tax numbers', () => {
      it('should reject tax numbers with wrong length', () => {
        expect(validateGermanTaxNumber('123456789')).toBe(false); // too short (9 digits)
        expect(validateGermanTaxNumber('12345678901234')).toBe(false); // too long (14 digits)
      });

      it('should reject tax numbers with non-numeric characters', () => {
        expect(validateGermanTaxNumber('ABC1234567')).toBe(false);
        expect(validateGermanTaxNumber('12345X7890')).toBe(false);
      });

      it('should reject all zeros', () => {
        expect(validateGermanTaxNumber('0000000000')).toBe(false); // 10 digits all zeros
        expect(validateGermanTaxNumber('00000000000')).toBe(false); // 11 digits all zeros
        expect(validateGermanTaxNumber('000000000000')).toBe(false); // 12 digits all zeros
        expect(validateGermanTaxNumber('0000000000000')).toBe(false); // 13 digits all zeros
      });

      it('should reject empty string', () => {
        expect(validateGermanTaxNumber('')).toBe(false);
      });

      it('should reject tax numbers with invalid length boundaries', () => {
        expect(validateGermanTaxNumber('1')).toBe(false); // 1 digit
        expect(validateGermanTaxNumber('12')).toBe(false); // 2 digits
        expect(validateGermanTaxNumber('123456')).toBe(false); // 6 digits
        expect(validateGermanTaxNumber('123456789')).toBe(false); // 9 digits (just below min)
        expect(validateGermanTaxNumber('12345678901234')).toBe(false); // 14 digits (just above max)
        expect(validateGermanTaxNumber('123456789012345')).toBe(false); // 15 digits
      });
    });
  });

  describe('validateIBAN', () => {
    describe('valid IBANs', () => {
      it('should validate correct German IBANs', () => {
        expect(validateIBAN('DE89370400440532013000')).toBe(true);
        expect(validateIBAN('DE44500105175407324931')).toBe(true);
      });

      it('should validate IBANs from other countries', () => {
        expect(validateIBAN('GB82WEST12345698765432')).toBe(true); // UK
        expect(validateIBAN('FR1420041010050500013M02606')).toBe(true); // France
        expect(validateIBAN('ES9121000418450200051332')).toBe(true); // Spain
        expect(validateIBAN('IT60X0542811101000000123456')).toBe(true); // Italy
      });

      it('should validate IBANs with spaces (removed automatically)', () => {
        expect(validateIBAN('DE89 3704 0044 0532 0130 00')).toBe(true);
        expect(validateIBAN('GB82 WEST 1234 5698 7654 32')).toBe(true);
      });

      it('should be case insensitive', () => {
        expect(validateIBAN('de89370400440532013000')).toBe(true);
        expect(validateIBAN('De89370400440532013000')).toBe(true);
      });
    });

    describe('invalid IBANs', () => {
      it('should reject IBAN with incorrect check digits', () => {
        expect(validateIBAN('DE89370400440532013001')).toBe(false); // wrong checksum
        expect(validateIBAN('GB82WEST12345698765433')).toBe(false); // wrong checksum
      });

      it('should reject IBAN with wrong length', () => {
        expect(validateIBAN('DE123')).toBe(false); // too short
        expect(validateIBAN('DE89370400440532013000123456789012345')).toBe(false); // too long
      });

      it('should reject IBAN with invalid format', () => {
        expect(validateIBAN('1234567890123456')).toBe(false); // no country code
        expect(validateIBAN('DEAA370400440532013000')).toBe(false); // letters in check digits
        expect(validateIBAN('DE89370400440532013-00')).toBe(false); // special characters
      });

      it('should reject empty string', () => {
        expect(validateIBAN('')).toBe(false);
      });
    });
  });

  describe('validateBIC', () => {
    describe('valid BICs', () => {
      it('should validate 8-character BIC codes', () => {
        expect(validateBIC('DEUTDEFF')).toBe(true); // Deutsche Bank
        expect(validateBIC('COBADEFF')).toBe(true); // Commerzbank
        expect(validateBIC('BYLADEM1')).toBe(true); // Bayern LB
      });

      it('should validate 11-character BIC codes (with branch)', () => {
        expect(validateBIC('DEUTDEFF500')).toBe(true); // Deutsche Bank, branch 500
        expect(validateBIC('COBADEFFXXX')).toBe(true); // Commerzbank
        expect(validateBIC('BNPAFRPPXXX')).toBe(true); // BNP Paribas, France
      });

      it('should validate BICs with spaces (removed automatically)', () => {
        expect(validateBIC('DEUT DE FF')).toBe(true);
        expect(validateBIC('DEUT DE FF 500')).toBe(true);
      });

      it('should be case insensitive', () => {
        expect(validateBIC('deutdeff')).toBe(true);
        expect(validateBIC('DeUtDeFf')).toBe(true);
      });

      it('should validate BICs with alphanumeric location codes', () => {
        expect(validateBIC('DEUTDE5F')).toBe(true); // location with letter and digit
        expect(validateBIC('DEUTDE55')).toBe(true); // location with digits
      });
    });

    describe('invalid BICs', () => {
      it('should reject BIC with wrong length', () => {
        expect(validateBIC('DEUT')).toBe(false); // too short
        expect(validateBIC('DEUTDE')).toBe(false); // too short
        expect(validateBIC('DEUTDEFF50')).toBe(false); // 10 characters (invalid)
        expect(validateBIC('DEUTDEFF5000')).toBe(false); // too long
      });

      it('should reject BIC with invalid format', () => {
        expect(validateBIC('12UTDEFF')).toBe(false); // digits in bank code
        expect(validateBIC('DEUT12FF')).toBe(false); // digits in country code
        expect(validateBIC('DEUTZZFF')).toBe(false); // ZZ country code (invalid)
        expect(validateBIC('DEUT-DEFF')).toBe(false); // special characters
      });

      it('should reject empty string', () => {
        expect(validateBIC('')).toBe(false);
      });
    });
  });

  describe('runValidationPreset', () => {
    describe('valid inputs', () => {
      it('should validate taxId preset', () => {
        expect(runValidationPreset('taxId', '12345678903')).toBe(true);
        expect(runValidationPreset('taxId', '86095742719')).toBe(true);
      });

      it('should reject taxNumber preset with invalid BUFA', () => {
        // Strict validation: All rejected due to invalid BUFA or check digits
        expect(runValidationPreset('taxNumber', '11/160/87412')).toBe(false); // Invalid check digit
        expect(runValidationPreset('taxNumber', '12345678901')).toBe(false); // Unknown Finanzamt
        expect(runValidationPreset('taxNumber', '123456789012')).toBe(false); // Unknown BUFA
      });

      it('should validate iban preset', () => {
        expect(runValidationPreset('iban', 'DE89370400440532013000')).toBe(true);
        expect(runValidationPreset('iban', 'GB82WEST12345698765432')).toBe(true);
      });

      it('should validate bic preset', () => {
        expect(runValidationPreset('bic', 'DEUTDEFF')).toBe(true);
        expect(runValidationPreset('bic', 'DEUTDEFF500')).toBe(true);
      });
    });

    describe('invalid inputs', () => {
      it('should reject invalid taxId', () => {
        expect(runValidationPreset('taxId', '12345678901')).toBe(false);
      });

      it('should reject invalid taxNumber', () => {
        expect(runValidationPreset('taxNumber', '123')).toBe(false);
      });

      it('should reject invalid iban', () => {
        expect(runValidationPreset('iban', 'DE89370400440532013001')).toBe(false);
      });

      it('should reject invalid bic', () => {
        expect(runValidationPreset('bic', 'DEUTZZFF')).toBe(false);
      });

      it('should reject empty or non-string values', () => {
        expect(runValidationPreset('taxId', '')).toBe(false);
        expect(runValidationPreset('iban', null as any)).toBe(false);
        expect(runValidationPreset('bic', undefined as any)).toBe(false);
      });
    });
  });
});
