# Preset Validation Helper

A comprehensive, framework-agnostic validation library for German tax identifiers and international banking codes. This module provides validation for Tax IDs, Tax Numbers, IBANs, and BIC/SWIFT codes with built-in country code verification.

## Features

✅ **German Tax ID (Steueridentifikationsnummer)** - Validates using modulo 11 algorithm  
✅ **German Tax Number (Steuernummer)** - Supports multiple federal state formats  
✅ **IBAN** - Full ISO 13616 compliance with mod-97 validation  
✅ **BIC/SWIFT** - ISO 9362 standard validation  
✅ **Country Code Validation** - ISO 13616 IBAN-compliant countries (49 countries)  
✅ **Zero Dependencies** - Pure TypeScript/JavaScript  
✅ **Framework Agnostic** - Works with React, Vue, Angular, Node.js, etc.  
✅ **Fully Tested** - 37 comprehensive test cases

---

## Installation

```bash
# Copy the preset-validation folder to your project
cp -r preset-validation /path/to/your/project/src/utils/
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

---

## Quick Start

```typescript
import { runValidationPreset, ValidationPreset } from './preset-validation';

// Validate German Tax ID
const isValid = runValidationPreset(ValidationPreset.TAX_ID, '12345678903');
console.log(isValid); // true or false

// Using string literals (also supported)
const ibanValid = runValidationPreset('iban', 'DE89370400440532013000');
console.log(ibanValid); // true

// Validate BIC
const bicValid = runValidationPreset(ValidationPreset.BIC, 'DEUTDEFF500');
console.log(bicValid); // true
```

---

## API Documentation

### Types

#### `ValidationPresetType`

Type definition for validation presets:

```typescript
type ValidationPresetType = 'taxId' | 'taxNumber' | 'iban' | 'bic';
```

#### `ValidationPreset` (Constant)

Enum-like constant for type-safe preset references:

```typescript
const ValidationPreset = {
  TAX_ID: 'taxId',
  TAX_NUMBER: 'taxNumber',
  IBAN: 'iban',
  BIC: 'bic',
} as const;
```

### Main Function

#### `runValidationPreset(presetKey: ValidationPresetType, value: string): boolean`

Main validation function that runs the appropriate preset validator.

**Parameters:**

- `presetKey` - The validation preset type (use `ValidationPreset` constant or string literal)
- `value` - The value to validate (string)

**Returns:**

- `boolean` - `true` if valid, `false` otherwise

**Examples:**

```typescript
// Using ValidationPreset constant (recommended)
runValidationPreset(ValidationPreset.TAX_ID, '12345678903'); // true
runValidationPreset(ValidationPreset.IBAN, 'DE89370400440532013000'); // true

// Using string literals (also supported)
runValidationPreset('taxId', '12345678903'); // true
runValidationPreset('iban', 'INVALID'); // false
```

---

### Individual Validation Functions

You can also import and use individual validators directly:

```typescript
import {
  validateGermanTaxId,
  validateGermanTaxNumber,
  validateIBAN,
  validateBIC,
  ValidationPreset,
  type ValidationPresetType,
} from './preset-validation';
```

---

## Validation Types

### 1. German Tax ID (Steueridentifikationsnummer)

**Preset Key:** `'taxId'`

**Description:**  
Validates German tax identification numbers using the official modulo 11 algorithm with check digit verification.

**Format Requirements:**

- Exactly 11 digits
- Last digit is a valid check digit calculated via modulo 11 algorithm
- Whitespace is automatically removed

**Examples:**

```typescript
// Valid Tax IDs
validateGermanTaxId('12345678903'); // ✅ true
validateGermanTaxId('86095742719'); // ✅ true
validateGermanTaxId('123 456 789 03'); // ✅ true (spaces removed)
validateGermanTaxId('  12345678903  '); // ✅ true (trimmed)

// Invalid Tax IDs
validateGermanTaxId('12345678901'); // ❌ false (wrong check digit)
validateGermanTaxId('1234567890'); // ❌ false (too short)
validateGermanTaxId('123456789012'); // ❌ false (too long)
validateGermanTaxId('1234567890A'); // ❌ false (contains letter)
```

**Use Case:**  
Perfect for tax filing applications, payroll systems, and any German tax-related forms.

---

### 2. German Tax Number (Steuernummer)

**Preset Key:** `'taxNumber'`

**Description:**  
Validates German tax numbers in various federal state formats, supporting both old state formats and the unified federal format.

**Format Requirements:**

- 10-13 digits
- Supports formatting characters (slashes, hyphens, spaces) which are automatically removed
- Cannot be all zeros

**Supported Formats:**

- **10-11 digits**: Old state formats (e.g., "181/815/08155")
- **13 digits**: Unified federal format (Bundeseinheitliche Steuernummer)

**Examples:**

```typescript
// Valid Tax Numbers
validateGermanTaxNumber('1234567890'); // ✅ true (10 digits)
validateGermanTaxNumber('12345678901'); // ✅ true (11 digits)
validateGermanTaxNumber('1234567890123'); // ✅ true (13 digits)
validateGermanTaxNumber('181/815/08155'); // ✅ true (with slashes)
validateGermanTaxNumber('12 345 678 90'); // ✅ true (with spaces)
validateGermanTaxNumber('123-456-789-01'); // ✅ true (with hyphens)

// Invalid Tax Numbers
validateGermanTaxNumber('123456789'); // ❌ false (too short)
validateGermanTaxNumber('12345678901234'); // ❌ false (too long)
validateGermanTaxNumber('ABC1234567'); // ❌ false (contains letters)
validateGermanTaxNumber('0000000000'); // ❌ false (all zeros)
```

**Use Case:**  
Essential for German business tax systems, invoicing, and government form submissions.

---

### 3. IBAN (International Bank Account Number)

**Preset Key:** `'iban'`

**Description:**  
Validates International Bank Account Numbers using the ISO 13616 standard with full mod-97 algorithm implementation and country code verification.

**Format Requirements:**

- 15-34 characters (varies by country)
- First 2 characters: Country code (ISO 3166-1 alpha-2)
- Next 2 characters: Check digits
- Remaining: Bank and account identifier
- Validated using mod-97 algorithm (ISO 7064)
- Country code must be a valid ISO 3166-1 alpha-2 code

**Examples:**

```typescript
// Valid IBANs
validateIBAN('DE89370400440532013000'); // ✅ true (Germany)
validateIBAN('GB82WEST12345698765432'); // ✅ true (UK)
validateIBAN('FR1420041010050500013M02606'); // ✅ true (France)
validateIBAN('ES9121000418450200051332'); // ✅ true (Spain)
validateIBAN('IT60X0542811101000000123456'); // ✅ true (Italy)
validateIBAN('DE89 3704 0044 0532 0130 00'); // ✅ true (spaces removed)
validateIBAN('de89370400440532013000'); // ✅ true (case insensitive)

// Invalid IBANs
validateIBAN('DE89370400440532013001'); // ❌ false (wrong checksum)
validateIBAN('DE123'); // ❌ false (too short)
validateIBAN('1234567890123456'); // ❌ false (no country code)
validateIBAN('ZZ89370400440532013000'); // ❌ false (invalid country code)
validateIBAN('DEAA370400440532013000'); // ❌ false (letters in check digits)
```

**Supported Countries:**  
49 IBAN-compliant countries including DE, GB, FR, ES, IT, NL, BE, AT, CH, PL, and more.

**Use Case:**  
Critical for banking applications, payment processing, international money transfers, and financial compliance systems.

---

### 4. BIC/SWIFT Code (Bank Identifier Code)

**Preset Key:** `'bic'`

**Description:**  
Validates Bank Identifier Codes (also known as SWIFT codes) according to ISO 9362 standard with country code verification.

**Format Requirements:**

- 8 or 11 characters
- Characters 1-4: Bank code (letters only)
- Characters 5-6: Country code (letters only, ISO 3166-1 alpha-2)
- Characters 7-8: Location code (letters or digits)
- Characters 9-11: Optional branch code (letters or digits)
- Country code must be a valid ISO 3166-1 alpha-2 code

**Examples:**

```typescript
// Valid BIC Codes (8 characters)
validateBIC('DEUTDEFF'); // ✅ true (Deutsche Bank)
validateBIC('COBADEFF'); // ✅ true (Commerzbank)
validateBIC('BYLADEM1'); // ✅ true (Bayern LB)

// Valid BIC Codes (11 characters with branch)
validateBIC('DEUTDEFF500'); // ✅ true (Deutsche Bank, branch 500)
validateBIC('COBADEFFXXX'); // ✅ true (Commerzbank)
validateBIC('CHASUS33XXX'); // ✅ true (JP Morgan Chase, USA)

// Valid with formatting
validateBIC('DEUT DE FF'); // ✅ true (spaces removed)
validateBIC('deutdeff'); // ✅ true (case insensitive)
validateBIC('DEUTDE5F'); // ✅ true (alphanumeric location)

// Invalid BIC Codes
validateBIC('DEUT'); // ❌ false (too short)
validateBIC('DEUTDEFF50'); // ❌ false (10 chars - invalid)
validateBIC('12UTDEFF'); // ❌ false (digits in bank code)
validateBIC('DEUT12FF'); // ❌ false (digits in country code)
validateBIC('DEUTZZFF'); // ❌ false (invalid country code)
validateBIC('DEUT-DEFF'); // ❌ false (special characters)
```

**Use Case:**  
Essential for international wire transfers, SEPA payments, correspondent banking, and financial messaging systems.

---

## Country Code Validation

All IBAN and BIC validators include automatic country code verification against the ISO 13616 standard for IBAN-compliant countries.

**Supported Country Codes (ISO 13616 IBAN-Compliant):**  
AL, AD, BE, BG, DK, DE, EE, FI, FR, GF, GI, GR, GP, IE, IS, IT, HR, LV, LI, LT, LU, MT, MQ, YT, MD, MC, ME, NL, MK, NO, AT, PL, PT, RE, RO, BL, MF, PM, SM, SE, CH, SK, SI, ES, CZ, HU, VA, GB, CY

Total: **49 IBAN-compliant countries**

These countries support the IBAN format according to the ISO 13616 standard and include all SEPA (Single Euro Payments Area) countries plus additional European territories and overseas departments.

---

## Usage Examples

### React/Frontend Example

```typescript
import { runValidationPreset, ValidationPreset } from '@/utils/preset-validation';

function TaxIdInput() {
  const [taxId, setTaxId] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleValidate = () => {
    const valid = runValidationPreset(ValidationPreset.TAX_ID, taxId);
    setIsValid(valid);
  };

  return (
    <div>
      <input
        value={taxId}
        onChange={(e) => setTaxId(e.target.value)}
        placeholder="Enter Tax ID"
      />
      <button onClick={handleValidate}>Validate</button>
      {isValid !== null && (
        <p>{isValid ? '✅ Valid' : '❌ Invalid'}</p>
      )}
    </div>
  );
}
```

### Node.js/Backend Example

```typescript
import { runValidationPreset, ValidationPreset } from './preset-validation';

app.post('/api/validate-bank-details', (req, res) => {
  const { iban, bic } = req.body;

  const ibanValid = runValidationPreset(ValidationPreset.IBAN, iban);
  const bicValid = runValidationPreset(ValidationPreset.BIC, bic);

  if (!ibanValid || !bicValid) {
    return res.status(400).json({
      error: 'Invalid bank details',
      ibanValid,
      bicValid,
    });
  }

  // Process valid bank details
  res.json({ success: true });
});
```

### Form Validation Example

```typescript
import { validateGermanTaxId, validateIBAN, validateBIC } from './preset-validation';

interface TaxForm {
  taxId: string;
  iban: string;
  bic: string;
}

function validateForm(form: TaxForm): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!validateGermanTaxId(form.taxId)) {
    errors.taxId = 'Invalid German Tax ID';
  }

  if (!validateIBAN(form.iban)) {
    errors.iban = 'Invalid IBAN';
  }

  if (!validateBIC(form.bic)) {
    errors.bic = 'Invalid BIC/SWIFT code';
  }

  return errors;
}
```

### Custom Validation Wrapper

```typescript
import {
  runValidationPreset,
  ValidationPreset,
  type ValidationPresetType,
} from './preset-validation';

interface ValidationResult {
  isValid: boolean;
  preset: ValidationPresetType;
  value: string;
  message: string;
}

function validateWithFeedback(preset: ValidationPresetType, value: string): ValidationResult {
  const isValid = runValidationPreset(preset, value);

  const messages: Record<ValidationPresetType, string> = {
    taxId: isValid
      ? 'Valid German Tax ID'
      : 'Invalid Tax ID. Must be 11 digits with valid check digit.',
    taxNumber: isValid ? 'Valid German Tax Number' : 'Invalid Tax Number. Must be 10-13 digits.',
    iban: isValid ? 'Valid IBAN' : 'Invalid IBAN. Check country code and format.',
    bic: isValid ? 'Valid BIC/SWIFT code' : 'Invalid BIC. Must be 8 or 11 characters.',
  };

  return {
    isValid,
    preset,
    value,
    message: messages[preset],
  };
}

// Usage with ValidationPreset constant
const result = validateWithFeedback(ValidationPreset.TAX_ID, '12345678903');
console.log(result);
// {
//   isValid: true,
//   preset: 'taxId',
//   value: '12345678903',
//   message: 'Valid German Tax ID'
// }

// Usage with string literal
const result2 = validateWithFeedback('iban', 'DE89370400440532013000');
```

---

## Testing

The module includes comprehensive test coverage with 37 test cases covering:

- ✅ Valid inputs for all validation types
- ✅ Invalid inputs (wrong format, length, check digits)
- ✅ Edge cases (whitespace, case sensitivity, formatting)
- ✅ Country code validation
- ✅ Unknown preset handling

### Running Tests

```bash
# Run all tests
npm test -- preset-validation.helper.spec.ts

# Run with coverage
npm test -- preset-validation.helper.spec.ts --coverage

# Watch mode
npm test -- preset-validation.helper.spec.ts --watch
```

---

## Technical Details

### Algorithms Used

#### 1. German Tax ID - Modulo 11 Algorithm

```text
1. Take first 10 digits
2. Apply modulo 11 algorithm with base 10
3. Calculate check digit
4. Compare with 11th digit
```

#### 2. IBAN - Mod-97 Algorithm (ISO 7064)

```text
1. Move first 4 characters to end
2. Replace letters with numbers (A=10, B=11, ..., Z=35)
3. Calculate mod 97 of resulting number
4. Valid if remainder equals 1
```

#### 3. BIC/SWIFT - Format Validation

```text
1. Validate length (8 or 11 characters)
2. Check bank code (4 letters)
3. Verify country code (2 letters, ISO 3166-1)
4. Validate location code (2 alphanumeric)
5. Optional: Validate branch code (3 alphanumeric)
```

### Performance

- **Zero external dependencies** - Minimal bundle size
- **Pure functions** - Easy to test and reason about
- **O(n) complexity** - Linear time for all validations
- **Memory efficient** - No caching or state management required

---

## Browser Support

Works in all modern browsers and Node.js environments:

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Node.js 14+

---

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
export function validateGermanTaxId(taxId: string): boolean;
export function validateGermanTaxNumber(taxNumber: string): boolean;
export function validateIBAN(iban: string): boolean;
export function validateBIC(bic: string): boolean;
export function runValidationPreset(presetKey: string, value: string): boolean;
```

---

## Future NPM Package

This module is designed to be published as an NPM package. Future enhancements may include:

- 📦 NPM package publication
- 🌍 Additional country-specific validators
- 🔍 Detailed validation error messages
- 📊 Validation metadata (country, bank info, etc.)
- ⚡ Performance optimizations
- 🎨 Validation result types with detailed feedback

---

## Contributing

When adding new validators:

1. Add the validation function to `preset-validation.helper.ts`
2. Update the `runValidationPreset` switch statement
3. Add comprehensive tests in `preset-validation.helper.spec.ts`
4. Update this README with examples and documentation
5. Ensure all tests pass

---

## License

MIT License - Free to use in commercial and personal projects.

---

## Version History

### v1.0.0 (Current)

- ✅ German Tax ID validation (Steueridentifikationsnummer)
- ✅ German Tax Number validation (Steuernummer)
- ✅ IBAN validation with mod-97 algorithm
- ✅ BIC/SWIFT validation
- ✅ ISO 13616 IBAN-compliant country validation (49 countries)
- ✅ 37 comprehensive test cases
- ✅ Full TypeScript support
- ✅ Zero dependencies

---

## Support

For issues, questions, or contributions, please contact the development team or open an issue in the repository.

---

**Made with ❤️ for German data validation**
