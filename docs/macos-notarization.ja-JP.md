# macOS 署名と公証ガイド

PPT.html Studio は、macOS リリースビルドのクラウド署名と Apple notarization に対応しています。証明書や秘密鍵はリポジトリにコミットせず、GitHub Actions の secrets として設定します。

## 現在の動作

- secrets 未設定: macOS の `.dmg` と `.zip` はビルドされますが、未署名・未公証です。
- secrets が揃い、`ENABLE_APPLE_NOTARIZATION=true` の場合: Developer ID 証明書で署名し、Apple notarytool で公証します。
- `ENABLE_APPLE_NOTARIZATION` が `true` でない場合: 古い Apple secrets が残っていても、未署名 fallback としてビルドします。

## 必要な Apple 情報

- Apple Developer Program アカウント。
- `.p12` として書き出した Developer ID Application 証明書。
- `.p12` の書き出しパスワード。
- 公証用の認証情報。

推奨方式:

- App Store Connect API key `.p8`。
- Key ID。
- Issuer ID。

代替方式:

- Apple ID。
- App-specific password。
- Team ID。

## GitHub Variable

次を開きます。

```text
Settings -> Secrets and variables -> Actions -> Variables -> New repository variable
```

追加する値:

| Variable | 値 | 目的 |
| --- | --- | --- |
| `ENABLE_APPLE_NOTARIZATION` | `true` | macOS リリース job で Developer ID 署名と Apple 公証を有効にする |

## GitHub Secrets

次を開きます。

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

署名証明書:

| Secret | 説明 |
| --- | --- |
| `MAC_CERTIFICATE_BASE64` | Developer ID Application `.p12` ファイルの base64 内容 |
| `MAC_CERTIFICATE_PASSWORD` | `.p12` 書き出し時のパスワード |

CyberCode/Tauri 形式の別名も利用できます。

| Secret | 対応する値 |
| --- | --- |
| `APPLE_CERTIFICATE` | `MAC_CERTIFICATE_BASE64` |
| `APPLE_CERTIFICATE_PASSWORD` | `MAC_CERTIFICATE_PASSWORD` |
| `APPLE_SIGNING_IDENTITY` | 任意の署名 identity ヒント |

推奨の API key 公証:

| Secret | 説明 |
| --- | --- |
| `APPLE_API_KEY_BASE64` | `AuthKey_XXXX.p8` ファイルの base64 内容 |
| `APPLE_API_KEY_ID` | App Store Connect API Key ID |
| `APPLE_API_ISSUER` | App Store Connect Issuer ID |

Apple ID 方式:

| Secret | 説明 |
| --- | --- |
| `APPLE_ID` | Apple Developer アカウントのメールアドレス |
| `APPLE_APP_SPECIFIC_PASSWORD` | Apple ID の app-specific password |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

`APPLE_PASSWORD` は `APPLE_APP_SPECIFIC_PASSWORD` の別名として使えます。

## Workflow のルール

1. workflow は `package.json` からバージョンを読みます。
2. tag ビルドでは tag が `v<version>` と完全一致する必要があります。
3. macOS の Apple secrets は `ENABLE_APPLE_NOTARIZATION=true` のときだけ検証されます。
4. secrets が不足している場合、パッケージング前に明確なエラーで停止します。
5. 公証を有効にしない場合も四平台はビルドされ、macOS は未署名 fallback になります。

## Base64 コマンド

macOS で実行します。

```bash
base64 -i DeveloperIDApplication.p12 | pbcopy
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

## リリース

`package.json` を更新し、一致する tag を push します。

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

## 検証

macOS リリースをダウンロードしたあと:

```bash
codesign --verify --deep --strict --verbose=2 "PPT.html Studio.app"
spctl --assess --type execute --verbose "PPT.html Studio.app"
xcrun stapler validate "PPT.html Studio.app"
xcrun stapler validate htmlppt-X.Y.Z-mac-arm64.dmg
```
