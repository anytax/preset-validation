# Publishing Guide

This document explains how to publish the `@anytax/preset-validation` package to npm.

## Prerequisites

1. An npm account with publish permissions for the `@anytax` scope
2. Node.js 14 or higher installed
3. npm CLI installed and logged in (`npm login`)

## Pre-publish Checklist

Before publishing, ensure:

- [ ] All tests pass: `npm test`
- [ ] Code builds successfully: `npm run build`
- [ ] Version number is updated in `package.json`
- [ ] CHANGELOG is updated (if applicable)
- [ ] README is up to date
- [ ] Repository URL is correct in `package.json`

## Publishing Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
npm test
```

All tests must pass before publishing.

### 3. Build the Package

```bash
npm run build
```

This will:
- Clean the `dist` directory
- Compile TypeScript to JavaScript
- Generate type definitions (`.d.ts` files)
- Copy `country-codes.json` to the dist folder

### 4. Verify Package Contents

```bash
npm pack --dry-run
```

This shows what files will be included in the published package without actually creating the tarball.

### 5. Update Version

Update the version in `package.json` following semantic versioning:

- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features, backwards compatible
- **Major** (x.0.0): Breaking changes

Or use npm version command:

```bash
npm version patch  # for 1.0.1
npm version minor  # for 1.1.0
npm version major  # for 2.0.0
```

### 6. Publish to npm

For first-time publishing or public packages:

```bash
npm publish --access public
```

For subsequent updates (if already public):

```bash
npm publish
```

### 7. Verify Publication

Check that the package is available:

```bash
npm view @anytax/preset-validation
```

Or visit: https://www.npmjs.com/package/@anytax/preset-validation

## Package Structure

The published package includes:

```
dist/
├── index.js                    # Main entry point
├── index.d.ts                  # TypeScript definitions
├── preset-validation.helper.js # Main validation functions
├── preset-validation.helper.d.ts
├── country-codes.json          # Country code data
└── tax-number/                 # Tax number validation modules
    ├── finanzamtsdaten.js
    ├── normalization.js
    ├── prufziffernverfahren.js
    └── validation-tax-number.js
    └── ... (with corresponding .d.ts files)
```

## Troubleshooting

### Authentication Issues

If you get authentication errors:

```bash
npm login
```

Enter your npm credentials.

### Scope Permission Issues

Ensure you have publish rights for the `@anytax` scope. Contact the npm organization admin if needed.

### Build Failures

If the build fails:

1. Delete `node_modules` and `dist`: `rm -rf node_modules dist`
2. Reinstall: `npm install`
3. Try building again: `npm run build`

## Rollback

If you need to unpublish a version (within 72 hours of publishing):

```bash
npm unpublish @anytax/preset-validation@1.0.0
```

**Note**: Unpublishing is discouraged. Consider publishing a patch version instead.

## Deprecating a Version

To deprecate a version without unpublishing:

```bash
npm deprecate @anytax/preset-validation@1.0.0 "Deprecated due to [reason]"
```

