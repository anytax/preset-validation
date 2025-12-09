import { FinanzamtInfo } from './finanzamtsdaten';

const BERLIN_A_MULTIPLIERS = [0, 0, 0, 0, 0, 7, 6, 5, 8, 4, 3, 2];

const BERLIN_B_MULTIPLIERS = [0, 0, 2, 9, 0, 8, 7, 6, 5, 4, 3, 2];

function pruefzifferBayern(elster13: string): number {
  let sum = 0;
  const base = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];

  for (let i = 0; i < 12; i++) {
    const p = Number(elster13[i]) * base[i];
    sum += p > 9 ? (p % 10) + 1 : p;
  }
  const check = (10 - (sum % 10)) % 10;
  return check;
}

export function validatePruefziffer(elster13: string, info: FinanzamtInfo): boolean {
  const body = elster13.substring(0, 12);
  const checkDigit = Number(elster13[12]);

  switch (info.verfahren) {
    case 'BERLIN_A': {
      return computeWeightedCheckDigit(body, BERLIN_A_MULTIPLIERS) === checkDigit;
    }
    case 'BERLIN_B': {
      return computeWeightedCheckDigit(body, BERLIN_B_MULTIPLIERS) === checkDigit;
    }
    case 'BAYERN_11ER': {
      return pruefzifferBayern(elster13) === checkDigit;
    }
    // NRW special:
    case 'NRW': {
      return computeWeightedCheckDigit(body, [0, 3, 2, 1, 0, 7, 6, 5, 4, 3, 2, 1]) === checkDigit;
    }
    default:
      // fallback = Bayern 11er (used by most Länder)
      return pruefzifferBayern(elster13) === checkDigit;
  }
}

function computeWeightedCheckDigit(body: string, multipliers: number[]): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(body[i]) * multipliers[i];
  }
  return (sum % 11) % 10;
}
