import { FinanzamtInfo } from './finanzamtsdaten';

// Factor arrays — source: ELSTER Prüfung document + rechtlogisch/steuernummer reference
const FACTORS_STANDARD_ELFER = [0, 5, 4, 3, 0, 2, 7, 6, 5, 4, 3, 2];
const FACTORS_BERLIN_A       = [0, 0, 0, 0, 0, 7, 6, 5, 8, 4, 3, 2];
const FACTORS_BERLIN_B_NI    = [0, 0, 2, 9, 0, 8, 7, 6, 5, 4, 3, 2];
const FACTORS_HH_HB          = [0, 0, 4, 3, 0, 2, 7, 6, 5, 4, 3, 2];
const FACTORS_NRW             = [0, 3, 2, 1, 0, 7, 6, 5, 4, 3, 2, 1];
const FACTORS_RP              = [0, 0, 1, 2, 0, 1, 2, 1, 2, 1, 2, 1];
const FACTORS_ZWEIER          = [0, 0, 512, 256, 0, 128, 64, 32, 16, 8, 4, 2];
const SUMMANDS_ZWEIER         = [0, 0, 9, 8, 0, 7, 6, 5, 4, 3, 2, 1];

// Berlin: BUFAs that always use sub-procedure B
const BERLIN_ALWAYS_B = new Set([
  1115, 1118,
  1131, 1132, 1133, 1134, 1135, 1136, 1137, 1138,
  1194, 1195, 1196, 1197, 1198,
]);

// Berlin: BUFAs that always use sub-procedure A
const BERLIN_ALWAYS_A = new Set([1127, 1129, 1130]);

// Berlin: BUFAs that use B only when district (BBB, positions 5-7) falls in these ranges
const BERLIN_B_RANGES: Record<number, Array<[number, number]>> = {
  1113: [[201, 693]],
  1114: [[201, 693]],
  1116: [[1, 29], [201, 693], [875, 899]],
  1117: [[201, 693]],
  1119: [[201, 639], [680, 684]],
  1120: [[201, 693]],
  1121: [[201, 693]],
  1123: [[201, 693]],
  1124: [[201, 693]],
  1125: [[201, 693]],
};

function berlinFactors(elster13: string, bufa: number): number[] {
  if (BERLIN_ALWAYS_B.has(bufa)) return FACTORS_BERLIN_B_NI;
  if (BERLIN_ALWAYS_A.has(bufa)) return FACTORS_BERLIN_A;

  const ranges = BERLIN_B_RANGES[bufa];
  if (ranges) {
    const district = parseInt(elster13.substring(5, 8), 10);
    for (const [lo, hi] of ranges) {
      if (district >= lo && district <= hi) return FACTORS_BERLIN_B_NI;
    }
  }
  return FACTORS_BERLIN_A;
}

// Standard 11er-Verfahren: check = (11 − sum%11) % 11.  Returns 10 when no valid check
// digit exists for this number body (used to detect structurally unissuable numbers).
function elfer(elster13: string, factors: number[]): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += factors[i] * Number(elster13[i]);
  }
  return (11 - (sum % 11)) % 11;
}

// NRW: rounds DOWN to previous multiple of 11 → check = sum % 11
function nrw(elster13: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += FACTORS_NRW[i] * Number(elster13[i]);
  }
  return sum % 11;
}

// Recursive digit sum (Quersumme)
function crossfoot(n: number): number {
  if (n < 10) return n;
  let s = 0;
  while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
  return crossfoot(s);
}

// Zweier-Verfahren (BW, HE, SH)
function zweier(elster13: string): number {
  let total = 0;
  for (let i = 0; i < 12; i++) {
    let s = SUMMANDS_ZWEIER[i] + Number(elster13[i]);
    if (s > 9) s = s % 10;
    total += crossfoot(s * FACTORS_ZWEIER[i]);
  }
  return total % 10 === 0 ? 0 : 10 - (total % 10);
}

// Special Elfer RP: product > 9 → (last digit) + 1; then next-multiple-of-10
function specialElferRP(elster13: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let p = FACTORS_RP[i] * Number(elster13[i]);
    if (p > 9) p = (p % 10) + 1;
    sum += p;
  }
  return sum % 10 === 0 ? 0 : 10 - (sum % 10);
}

export function validatePruefziffer(elster13: string, info: FinanzamtInfo): boolean {
  const checkDigit = Number(elster13[12]);
  const ll = info.landesnummer;

  switch (info.verfahren) {
    case 'NRW_11':
      return nrw(elster13) === checkDigit;

    case 'ZWEIER':
      return zweier(elster13) === checkDigit;

    case 'MOD11_RP':
      return specialElferRP(elster13) === checkDigit;

    case 'ELF':
    default: {
      // Hamburg (22) and Bremen (24) use their own factor set
      if (ll === '22' || ll === '24') {
        const check = elfer(elster13, FACTORS_HH_HB);
        return check < 10 && check === checkDigit;
      }

      // Niedersachsen (23) shares the Berlin-B / NI factor set
      if (ll === '23') {
        const check = elfer(elster13, FACTORS_BERLIN_B_NI);
        return check < 10 && check === checkDigit;
      }

      // Berlin (11): sub-procedure depends on BUFA code and district
      if (ll === '11') {
        const bufaNum = parseInt(info.bufa, 10);
        const factors = berlinFactors(elster13, bufaNum);
        const check = elfer(elster13, factors);
        return check < 10 && check === checkDigit;
      }

      // Standard Elfer: BY, BB, MV, SL, SN, ST, TH, SH (non-ZWEIER offices), etc.
      const check = elfer(elster13, FACTORS_STANDARD_ELFER);
      return check < 10 && check === checkDigit;
    }
  }
}
