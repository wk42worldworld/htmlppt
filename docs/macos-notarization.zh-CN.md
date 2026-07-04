# macOS 签名与公证指南

PPT.html Studio 的 macOS Release 已经支持云端签名和 Apple notarization。由于 Apple 公证必须使用开发者账号和私有证书，仓库不会提交任何证书或密钥；需要在 GitHub Secrets 中配置。

## 当前状态

- 没有配置 secrets 时：GitHub Actions 仍会构建 macOS `.dmg` 和 `.zip`，但它们是未签名、未公证版本。
- 配置完整 secrets 后：GitHub Actions 会自动使用 Developer ID 证书签名，并通过 Apple notarytool 公证。

## 为什么需要公证

面向 Mac App Store 之外分发的 macOS 应用，正式发布应使用 Developer ID 签名并提交 Apple notarization。公证成功后，Gatekeeper 可以识别这个 app 已经过 Apple 检查，用户首次打开时会少很多安全阻碍。

## 需要准备的 Apple 资料

必须具备：

- Apple Developer Program 账号。
- Developer ID Application 证书，导出为 `.p12`。
- 证书导出密码。
- notarization 凭据。

推荐使用 App Store Connect API key：

- API Key `.p8` 文件。
- Key ID。
- Issuer ID。

也可以使用 Apple ID app-specific password：

- Apple ID。
- App-specific password。
- Team ID。

## GitHub Secrets

进入 GitHub 仓库：

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

配置签名证书：

| Secret | 说明 |
| --- | --- |
| `MAC_CERTIFICATE_BASE64` | Developer ID Application `.p12` 文件的 base64 内容 |
| `MAC_CERTIFICATE_PASSWORD` | 导出 `.p12` 时设置的密码 |

推荐配置 notarization API key：

| Secret | 说明 |
| --- | --- |
| `APPLE_API_KEY_BASE64` | `AuthKey_XXXX.p8` 文件的 base64 内容 |
| `APPLE_API_KEY_ID` | App Store Connect API Key ID |
| `APPLE_API_ISSUER` | App Store Connect Issuer ID |

或者配置 Apple ID 方式：

| Secret | 说明 |
| --- | --- |
| `APPLE_ID` | Apple Developer 账号邮箱 |
| `APPLE_APP_SPECIFIC_PASSWORD` | Apple ID app-specific password |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

如果两种 notarization 方式都配置，workflow 优先使用 App Store Connect API key。

## 生成 base64 内容

在 macOS 上：

```bash
base64 -i DeveloperIDApplication.p12 | pbcopy
```

把剪贴板内容粘贴到 `MAC_CERTIFICATE_BASE64`。

API key：

```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

把剪贴板内容粘贴到 `APPLE_API_KEY_BASE64`。

## 触发发布

配置好 secrets 后，推送新 tag：

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

Release workflow 会为 macOS x64 和 macOS arm64 自动执行：

1. 导入 `.p12` 签名证书。
2. 使用 hardened runtime 和 entitlements 签名 app。
3. 调用 Apple notarization。
4. 生成 `.dmg` 和 `.zip` Release 资产。

## 本地验证公证结果

下载 Release 里的 macOS 包后，可以在 macOS 上验证。

验证 app 签名：

```bash
codesign --verify --deep --strict --verbose=2 "PPT.html Studio.app"
```

验证 Gatekeeper：

```bash
spctl --assess --type execute --verbose "PPT.html Studio.app"
```

验证 notarization ticket：

```bash
xcrun stapler validate "PPT.html Studio.app"
```

如果验证 `.dmg`：

```bash
xcrun stapler validate htmlppt-0.2.0-mac-arm64.dmg
```

## 常见问题

### 为什么现在的 Release 可能仍然提示安全警告？

如果仓库还没有配置 Apple Developer 证书和 notarization secrets，GitHub Actions 只能生成未签名包。用户仍然可以运行，但 macOS 会显示更严格的安全提示。

### 能不能不买 Apple Developer 账号？

可以继续生成未签名包，但无法完成 Developer ID notarization。正式面向普通用户分发时建议配置 Apple Developer 账号。

### 为什么使用 App Store Connect API key？

API key 适合 CI，权限可控，也不需要在 workflow 中使用 Apple ID 密码。它是推荐的云构建方式。

### 是否需要重新发布一个版本？

配置好 secrets 后，需要重新推送一个新 tag，例如 `v0.2.1`，这样 Release workflow 才会重新构建并上传 notarized macOS 资产。
