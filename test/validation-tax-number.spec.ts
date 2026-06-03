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

  describe('on-Bescheid 10-digit inputs (FF BBB UUUUP)', () => {
    // [bundesland, input, expected ELSTER, expected BUFA]
    const cases: Array<[string, string, string, string]> = [
      ['Baden-Württemberg', '66815/08156', '2866081508156', '2866'],
      ['Berlin', '97/815/08154', '1197081508154', '1197'],
      ['Bremen', '97 123 01233', '2497012301233', '2497'],
      ['Hamburg', '93/815/08150', '2293081508150', '2293'],
      ['Niedersachsen', '88/815/08158', '2388081508158', '2388'],
      ['Rheinland-Pfalz', '99/815/08152', '2799081508152', '2799'],
      ['Schleswig-Holstein', '38/815/08154', '2138081508154', '2138'],
    ];

    it.each(cases)('%s: %s -> %s', (_state, input, expectedElster, expectedBufa) => {
      const r = validateSteuernummer(input);
      expect(r.valid).toBe(true);
      expect(r.normalized).toBe(expectedElster);
      expect(r.bufa).toBe(expectedBufa);
    });
  });

  describe('on-Bescheid 11-digit inputs (FFF BBB UUUUP, non-NRW)', () => {
    // Cases where the trailing 3 digits of BUFA are unique among test BUFAs:
    // the validator picks the right BUFA unambiguously.
    const uniqueCases: Array<[string, string, string, string]> = [
      ['Bayern (Nürnberg)', '296/815/08153', '9296081508153', '9296'],
      ['Saarland', '096/815/08187', '1096081508187', '1096'],
      ['Sachsen', '248/815/08156', '3248081508156', '3248'],
    ];

    it.each(uniqueCases)('%s: %s -> %s', (_state, input, expectedElster, expectedBufa) => {
      const r = validateSteuernummer(input);
      expect(r.valid).toBe(true);
      expect(r.normalized).toBe(expectedElster);
      expect(r.bufa).toBe(expectedBufa);
    });

    // Several test BUFAs intentionally share trailing 3 digits AND use universal
    // ELF check digits (designed to accept any test number). Without a taxOfficeId
    // hint the validator cannot disambiguate — any structurally-matching BUFA
    // whose Prüfziffer passes is an acceptable result. Real production BUFAs do
    // not collide this way.
    const collidingCases: Array<[string, string, string[]]> = [
      // Bayern München (9198), Sachsen-Anhalt (3198), Thüringen (4198), Berlin (1198)
      ['Bayern München', '198/815/08152', ['9198', '3198', '4198', '1198']],
      ['Thüringen', '198/815/08152', ['9198', '3198', '4198', '1198']],
      // Brandenburg (3098), Mecklenburg-Vorpommern (4098)
      ['Brandenburg', '098/815/08157', ['3098', '4098']],
      ['Mecklenburg-Vorpommern', '098/815/08157', ['3098', '4098']],
    ];

    it.each(collidingCases)('%s: %s resolves to one of %p', (_state, input, validBufas) => {
      const r = validateSteuernummer(input);
      expect(r.valid).toBe(true);
      // The trailing 8 digits (BBB+UUUUP) must be preserved exactly.
      const inputDigits = input.replace(/\D+/g, '');
      expect(r.normalized?.slice(-8)).toBe(inputDigits.slice(-8));
      expect(validBufas).toContain(r.bufa);
    });
  });

  describe('on-Bescheid 11-digit Hessen (0FF BBB UUUUP)', () => {
    it('Hessen 053 815 08158 -> 2653081508158', () => {
      const r = validateSteuernummer('053 815 08158');
      expect(r.valid).toBe(true);
      expect(r.normalized).toBe('2653081508158');
      expect(r.bufa).toBe('2653');
      expect(r.bundesland).toBe('Hessen');
    });
  });

  describe('on-Bescheid 11-digit NRW (FFF BBBB UUUP)', () => {
    const cases: Array<[string, string, string, string]> = [
      ['NRW (54)', '400/8150/8159', '5400081508159', '5400'],
      ['NRW (55)', '500/8150/8151', '5500081508151', '5500'],
      ['NRW (56)', '600/8150/8154', '5600081508154', '5600'],
    ];

    it.each(cases)('%s: %s -> %s', (_state, input, expectedElster, expectedBufa) => {
      const r = validateSteuernummer(input);
      expect(r.valid).toBe(true);
      expect(r.normalized).toBe(expectedElster);
      expect(r.bufa).toBe(expectedBufa);
      expect(r.bundesland).toBe('Nordrhein-Westfalen');
    });
  });
});
