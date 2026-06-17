import { normalizeSteuernummer, normalizeTo13Digits } from '../src/tax-number/normalization';

describe('normalizeSteuernummer', () => {
  it('strips non-digit characters', () => {
    expect(normalizeSteuernummer('11/16/0/12345/673')).toBe('1116012345673');
    expect(normalizeSteuernummer('66 815 / 08156')).toBe('6681508156');
  });

  it('returns empty string for invalid lengths', () => {
    expect(normalizeSteuernummer('')).toBe('');
    expect(normalizeSteuernummer('123')).toBe('');
    expect(normalizeSteuernummer('12345678901234')).toBe('');
  });

  it('accepts 10/11/12/13-digit inputs', () => {
    expect(normalizeSteuernummer('6681508156')).toBe('6681508156');
    expect(normalizeSteuernummer('19881508152')).toBe('19881508152');
    expect(normalizeSteuernummer('286681508156')).toBe('286681508156');
    expect(normalizeSteuernummer('2866081508156')).toBe('2866081508156');
  });
});

describe('normalizeTo13Digits', () => {
  it('returns 13-digit input unchanged (strips separators)', () => {
    expect(normalizeTo13Digits('2866 0815 08156', '2866')).toBe('2866081508156');
  });

  it('inserts 0 at position 4 for 12-digit input', () => {
    expect(normalizeTo13Digits('286681508156', '2866')).toBe('2866081508156');
  });

  it('returns null for invalid lengths', () => {
    expect(normalizeTo13Digits('12345', '2866')).toBeNull();
  });

  it('returns null when BUFA is not 4 digits', () => {
    expect(normalizeTo13Digits('66815/08156', '28')).toBeNull();
  });

  it('strips separators from the BUFA argument', () => {
    expect(normalizeTo13Digits('66815/08156', '28/66')).toBe('2866081508156');
  });

  it('returns null for empty input', () => {
    expect(normalizeTo13Digits('', '2866')).toBeNull();
  });

  describe('BUFA is optional for 12- and 13-digit inputs', () => {
    it('returns 13-digit input unchanged without BUFA', () => {
      expect(normalizeTo13Digits('2866081508156')).toBe('2866081508156');
      expect(normalizeTo13Digits('2866081508156', null)).toBe('2866081508156');
    });

    it('inserts 0 at position 4 for 12-digit input without BUFA', () => {
      expect(normalizeTo13Digits('286681508156')).toBe('2866081508156');
    });

    it('returns null for 10/11-digit input without BUFA', () => {
      expect(normalizeTo13Digits('6681508156')).toBeNull();
      expect(normalizeTo13Digits('19881508152')).toBeNull();
    });
  });

  describe('on-Bescheid 10-digit (FF BBB UUUUP)', () => {
    const cases: Array<[string, string, string, string]> = [
      ['Baden-Württemberg', '66815/08156', '2866', '2866081508156'],
      ['Berlin', '97/815/08154', '1197', '1197081508154'],
      ['Bremen', '97 123 01233', '2497', '2497012301233'],
      ['Hamburg', '93/815/08150', '2293', '2293081508150'],
      ['Niedersachsen', '88/815/08158', '2388', '2388081508158'],
      ['Rheinland-Pfalz', '99/815/08152', '2799', '2799081508152'],
      ['Schleswig-Holstein', '38/815/08154', '2138', '2138081508154'],
    ];
    it.each(cases)('%s: %s @ %s -> %s', (_s, input, bufa, expected) => {
      expect(normalizeTo13Digits(input, bufa)).toBe(expected);
    });
  });

  describe('on-Bescheid 11-digit non-NRW (FFF BBB UUUUP)', () => {
    const cases: Array<[string, string, string, string]> = [
      ['Bayern (München)', '198/815/08152', '9198', '9198081508152'],
      ['Bayern (Nürnberg)', '296/815/08153', '9296', '9296081508153'],
      ['Brandenburg', '098/815/08157', '3098', '3098081508157'],
      ['Hessen (0FF prefix)', '053 815 08158', '2653', '2653081508158'],
      ['Mecklenburg-Vorpommern', '098/815/08157', '4098', '4098081508157'],
      ['Saarland', '096/815/08187', '1096', '1096081508187'],
      ['Sachsen', '248/815/08156', '3248', '3248081508156'],
      ['Sachsen-Anhalt', '198/815/08152', '3198', '3198081508152'],
      ['Thüringen', '198/815/08152', '4198', '4198081508152'],
    ];
    it.each(cases)('%s: %s @ %s -> %s', (_s, input, bufa, expected) => {
      expect(normalizeTo13Digits(input, bufa)).toBe(expected);
    });
  });

  describe('on-Bescheid 11-digit NRW (FFF BBBB UUUP)', () => {
    const cases: Array<[string, string, string, string]> = [
      ['NRW (54)', '400/8150/8159', '5400', '5400081508159'],
      ['NRW (55)', '500/8150/8151', '5500', '5500081508151'],
      ['NRW (56)', '600/8150/8154', '5600', '5600081508154'],
    ];
    it.each(cases)('%s: %s @ %s -> %s', (_s, input, bufa, expected) => {
      expect(normalizeTo13Digits(input, bufa)).toBe(expected);
    });
  });

  it('accepts legacy "ELSTER minus LL" 11-digit form (FF0 BBB UUUUP)', () => {
    // Bayern ELSTER 9198081508152 minus LL "91" -> 98081508152
    expect(normalizeTo13Digits('98081508152', '9198')).toBe('9198081508152');
  });
});
