# macOS 서명 및 공증 가이드

PPT.html Studio는 macOS 릴리스 빌드의 클라우드 서명과 Apple notarization을 지원합니다. 인증서와 비밀 키는 저장소에 커밋하지 않고 GitHub Actions secrets에 설정합니다.

## 현재 동작

- secrets가 없을 때: macOS `.dmg`와 `.zip`은 계속 빌드되지만 서명/공증되지 않습니다.
- secrets가 모두 있고 `ENABLE_APPLE_NOTARIZATION=true`일 때: Developer ID 인증서로 서명하고 Apple notarytool로 공증합니다.
- `ENABLE_APPLE_NOTARIZATION`이 정확히 `true`가 아닐 때: 오래된 Apple secrets가 남아 있어도 서명되지 않은 fallback 빌드를 사용합니다.

## 필요한 Apple 자료

- Apple Developer Program 계정.
- `.p12`로 내보낸 Developer ID Application 인증서.
- `.p12` 내보내기 암호.
- 공증 인증 정보.

권장 방식:

- App Store Connect API key `.p8`.
- Key ID.
- Issuer ID.

대체 방식:

- Apple ID.
- App-specific password.
- Team ID.

## GitHub Variable

다음으로 이동합니다.

```text
Settings -> Secrets and variables -> Actions -> Variables -> New repository variable
```

추가할 값:

| Variable | 값 | 목적 |
| --- | --- | --- |
| `ENABLE_APPLE_NOTARIZATION` | `true` | macOS 릴리스 job에서 Developer ID 서명과 Apple 공증을 활성화 |

## GitHub Secrets

다음으로 이동합니다.

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

서명 인증서:

| Secret | 설명 |
| --- | --- |
| `MAC_CERTIFICATE_BASE64` | Developer ID Application `.p12` 파일의 base64 내용 |
| `MAC_CERTIFICATE_PASSWORD` | `.p12` 내보내기 암호 |

CyberCode/Tauri 스타일 별칭도 사용할 수 있습니다.

| Secret | 대응 값 |
| --- | --- |
| `APPLE_CERTIFICATE` | `MAC_CERTIFICATE_BASE64` |
| `APPLE_CERTIFICATE_PASSWORD` | `MAC_CERTIFICATE_PASSWORD` |
| `APPLE_SIGNING_IDENTITY` | 선택 사항인 서명 identity 힌트 |

권장 API key 공증:

| Secret | 설명 |
| --- | --- |
| `APPLE_API_KEY_BASE64` | `AuthKey_XXXX.p8` 파일의 base64 내용 |
| `APPLE_API_KEY_ID` | App Store Connect API Key ID |
| `APPLE_API_ISSUER` | App Store Connect Issuer ID |

Apple ID 방식:

| Secret | 설명 |
| --- | --- |
| `APPLE_ID` | Apple Developer 계정 이메일 |
| `APPLE_APP_SPECIFIC_PASSWORD` | Apple ID app-specific password |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

`APPLE_PASSWORD`는 `APPLE_APP_SPECIFIC_PASSWORD`의 별칭으로 사용할 수 있습니다.

## Workflow 규칙

1. workflow는 `package.json`의 버전을 읽습니다.
2. tag 빌드는 tag가 `v<version>`과 정확히 일치해야 합니다.
3. macOS Apple secrets는 `ENABLE_APPLE_NOTARIZATION=true`일 때만 검증됩니다.
4. secrets가 부족하면 패키징 전에 명확한 오류로 실패합니다.
5. 공증을 활성화하지 않아도 네 플랫폼은 계속 빌드되며, macOS 산출물은 서명되지 않은 fallback 패키지입니다.

## Base64 명령

macOS에서 실행합니다.

```bash
base64 -i DeveloperIDApplication.p12 | pbcopy
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

## 릴리스

`package.json` 버전을 업데이트한 뒤 일치하는 tag를 push합니다.

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

## 검증

macOS 릴리스를 다운로드한 뒤:

```bash
codesign --verify --deep --strict --verbose=2 "PPT.html Studio.app"
spctl --assess --type execute --verbose "PPT.html Studio.app"
xcrun stapler validate "PPT.html Studio.app"
xcrun stapler validate htmlppt-X.Y.Z-mac-arm64.dmg
```
