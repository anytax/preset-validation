import { validateSteuernummer } from '../src/tax-number/validation-tax-number';

describe('validateSteuernummer', () => {
  it('accepts a valid number and returns normalized fields', () => {
    const result = validateSteuernummer('1116012345673');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('1116012345673');
    expect(result.bufa).toBe('1116');
    expect(result.bundesland).toBe('Berlin');
  });

  it('strips formatting characters before validating', () => {
    expect(validateSteuernummer('11 16 / 012 / 345673').valid).toBe(true);
    expect(validateSteuernummer('11-16-012-345-673').valid).toBe(true);
  });

  it('accepts valid numbers across formats and states', () => {
    const cases = [
      '1116012345673', '1121081508150', '3046012345673',  // Berlin, Brandenburg
      '9101012345677', '5101012345670', '2801012345678',  // Bavaria, NRW, Baden-Württemberg
      '2210012345670',                                    // Hamburg
      '16/123/45673',  '10/123/45670',                   // 10-digit local
      '16012345673',   '16/0/123/45673', '10012345670',  // 11-digit local
    ];
    for (const n of cases) {
      expect(validateSteuernummer(n).valid).toBe(true);
    }
  });

  it('rejects invalid inputs', () => {
    const cases = [
      '',                  // empty
      null as any,         // null
      '123456789',         // too short
      '11160123456789',    // too long
      '0000000000',        // all zeros
      '9999012345678',     // unknown BUFA
      '1116012345670',     // wrong check digit
      '12340A1234567',     // letters embedded
    ];
    for (const n of cases) {
      expect(validateSteuernummer(n).valid).toBe(false);
    }
  });

  it('reports reason for different failure modes', () => {
    expect(validateSteuernummer('123456789').reason).toBe('Invalid length or characters');
    expect(validateSteuernummer('9999012345678').reason).toBe('Unknown BUFA or Finanzamt');
    expect(validateSteuernummer('1116012345670').reason).toBe('Invalid Prüfziffer');
    expect(validateSteuernummer('0000000000').reason).toBe('Tax number cannot be all zeros');
  });
});
