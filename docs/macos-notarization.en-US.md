# macOS Signing and Notarization Guide

PPT.html Studio supports cloud signing and Apple notarization for macOS release builds. Certificates and private keys are never committed to the repository; configure them as GitHub Actions secrets instead.

## Current Behavior

- Without secrets: GitHub Actions still builds macOS `.dmg` and `.zip` files, but they are unsigned and not notarized.
- With complete secrets and `ENABLE_APPLE_NOTARIZATION=true`: GitHub Actions signs the app with a Developer ID certificate and notarizes it through Apple notarytool.
- If `ENABLE_APPLE_NOTARIZATION` is not exactly `true`: release builds use the unsigned fallback, even if old Apple secrets still exist in the repository.

## Required Apple Materials

- Apple Developer Program account.
- Developer ID Application certificate exported as `.p12`.
- The `.p12` export password.
- Notarization credentials.

Recommended notarization method:

- App Store Connect API key `.p8`.
- Key ID.
- Issuer ID.

Alternative method:

- Apple ID.
- App-specific password.
- Team ID.

## GitHub Variable

Open:

```text
Settings -> Secrets and variables -> Actions -> Variables -> New repository variable
```

Add:

| Variable | Value | Purpose |
| --- | --- | --- |
| `ENABLE_APPLE_NOTARIZATION` | `true` | Enables Developer ID signing and Apple notarization for macOS release jobs |

## GitHub Secrets

Open:

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

Signing certificate:

| Secret | Description |
| --- | --- |
| `MAC_CERTIFICATE_BASE64` | Base64 content of the Developer ID Application `.p12` file |
| `MAC_CERTIFICATE_PASSWORD` | Password used when exporting the `.p12` file |

CyberCode/Tauri-style aliases are also accepted:

| Secret | Equivalent to |
| --- | --- |
| `APPLE_CERTIFICATE` | `MAC_CERTIFICATE_BASE64` |
| `APPLE_CERTIFICATE_PASSWORD` | `MAC_CERTIFICATE_PASSWORD` |
| `APPLE_SIGNING_IDENTITY` | Optional signing identity hint |

Recommended API-key notarization:

| Secret | Description |
| --- | --- |
| `APPLE_API_KEY_BASE64` | Base64 content of the `AuthKey_XXXX.p8` file |
| `APPLE_API_KEY_ID` | App Store Connect API Key ID |
| `APPLE_API_ISSUER` | App Store Connect Issuer ID |

Apple ID notarization fallback:

| Secret | Description |
| --- | --- |
| `APPLE_ID` | Apple Developer account email |
| `APPLE_APP_SPECIFIC_PASSWORD` | Apple ID app-specific password |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

`APPLE_PASSWORD` is accepted as an alias for `APPLE_APP_SPECIFIC_PASSWORD`.

## Workflow Rules

1. The workflow reads the version from `package.json`.
2. Tag builds must use the exact tag `v<version>`.
3. macOS Apple secrets are validated only when `ENABLE_APPLE_NOTARIZATION=true`.
4. Incomplete secrets fail before packaging starts, with a clear missing-secret error.
5. If notarization is not enabled, all four platforms still build; macOS artifacts are unsigned fallback packages.

## Base64 Commands

On macOS:

```bash
base64 -i DeveloperIDApplication.p12 | pbcopy
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

## Publish

Update `package.json`, then push the matching tag:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

## Verify

After downloading a macOS release:

```bash
codesign --verify --deep --strict --verbose=2 "PPT.html Studio.app"
spctl --assess --type execute --verbose "PPT.html Studio.app"
xcrun stapler validate "PPT.html Studio.app"
xcrun stapler validate htmlppt-X.Y.Z-mac-arm64.dmg
```
