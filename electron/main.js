"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { fileURLToPath } = require("node:url");
const { app, BrowserWindow, Menu, dialog, ipcMain, nativeImage, shell } = require("electron");

const isMac = process.platform === "darwin";
const appName = "PPT.html Studio";

function appIconPath() {
  let iconFile = "icon.png";
  if (process.platform === "darwin") iconFile = "icon.icns";
  if (process.platform === "win32") iconFile = "icon.ico";
  return path.join(__dirname, "..", "build", iconFile);
}

function appPngIconPath() {
  return path.join(__dirname, "..", "build", "icon.png");
}

function loadAppIcon() {
  const primaryIcon = nativeImage.createFromPath(appIconPath());
  if (!primaryIcon.isEmpty()) return primaryIcon;
  return nativeImage.createFromPath(appPngIconPath());
}

function configureAppIdentity() {
  app.setName(appName);

  if (process.platform === "win32") {
    app.setAppUserModelId("world.wk42.htmlppt");
  }

  if (isMac && typeof app.setAboutPanelOptions === "function") {
    app.setAboutPanelOptions({
      applicationName: appName,
      applicationVersion: app.getVersion(),
      iconPath: appIconPath()
    });
  }

  if (isMac && app.dock) {
    try {
      const dockIcon = loadAppIcon();
      if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon);
    } catch (error) {
      console.warn("Unable to set PPT.html dock icon:", error.message);
    }
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 680,
    show: false,
    backgroundColor: "#f4f7fb",
    title: appName,
    icon: appIconPath(),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
      sandbox: true
    }
  });

  window.once("ready-to-show", () => {
    if (!window.isDestroyed()) window.show();
  });

  window.loadFile(path.join(__dirname, "..", "index.html")).catch((error) => {
    console.error("Unable to load PPT.html Studio:", error);
    if (!window.isDestroyed()) window.show();
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function deckFileFilters() {
  return [
    { name: "PPT.html files", extensions: ["html", "json"] },
    { name: "All files", extensions: ["*"] }
  ];
}

function sendCommand(command) {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.webContents.send("menu-command", command);
}

function defaultDeckPath(defaultName) {
  return path.join(app.getPath("documents"), defaultName || "deck.ppt.html");
}

function registerIpcHandlers() {
  ipcMain.handle("deck:open", async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(window, {
      title: "Open PPT.html",
      properties: ["openFile"],
      filters: deckFileFilters()
    });

    if (result.canceled || !result.filePaths.length) return { canceled: true };

    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, "utf8");
    return { canceled: false, filePath, content };
  });

  ipcMain.handle("deck:save", async (event, payload) => {
    return saveDeckFromRenderer(event, payload, false);
  });

  ipcMain.handle("deck:saveAs", async (event, payload) => {
    return saveDeckFromRenderer(event, payload, true);
  });

  ipcMain.handle("asset:embed", async (_event, payload) => {
    return embedAssetFromRenderer(payload || {});
  });

  ipcMain.handle("window:setFullScreen", async (event, enabled) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return false;
    window.setFullScreen(Boolean(enabled));
    return window.isFullScreen();
  });
}

async function saveDeckFromRenderer(event, payload, forceDialog) {
  const window = BrowserWindow.fromWebContents(event.sender);
  const data = payload || {};
  let filePath = data.filePath || "";

  if (forceDialog || !filePath) {
    const result = await dialog.showSaveDialog(window, {
      title: "Save PPT.html",
      defaultPath: defaultDeckPath(data.defaultName),
      filters: deckFileFilters()
    });

    if (result.canceled || !result.filePath) return { canceled: true };
    filePath = result.filePath;
  }

  await fs.writeFile(filePath, data.content || "", "utf8");
  return { canceled: false, filePath };
}

async function embedAssetFromRenderer(payload) {
  const src = String(payload.src || "").trim();
  if (!src) return { src: "" };
  if (/^data:/i.test(src)) return { src };

  if (/^https?:\/\//i.test(src)) {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText || ""}`.trim());
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "";
    return {
      src: bufferToDataUrl(buffer, mimeFromSource(src, payload.kind, contentType)),
      size: buffer.length
    };
  }

  const filePath = resolveAssetPath(src, payload.basePath);
  const buffer = await fs.readFile(filePath);
  return {
    src: bufferToDataUrl(buffer, mimeFromSource(filePath, payload.kind, "")),
    size: buffer.length
  };
}

function resolveAssetPath(src, basePath) {
  if (/^blob:/i.test(src)) {
    throw new Error("Blob URL cannot be embedded after the app session ends");
  }

  if (/^file:/i.test(src)) return fileURLToPath(src);
  if (path.isAbsolute(src)) return src;

  if (!basePath) {
    throw new Error(`Relative asset has no deck file base path: ${src}`);
  }

  return path.resolve(path.dirname(basePath), src);
}

function bufferToDataUrl(buffer, mime) {
  return `data:${mime || "application/octet-stream"};base64,${buffer.toString("base64")}`;
}

function mimeFromSource(src, kind, contentType) {
  const cleanType = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (cleanType) return cleanType;

  const ext = path.extname(src.split("?")[0].split("#")[0]).toLowerCase();
  const table = {
    ".avif": "image/avif",
    ".bmp": "image/bmp",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".m4v": "video/mp4",
    ".mov": "video/quicktime",
    ".mp4": "video/mp4",
    ".ogv": "video/ogg",
    ".webm": "video/webm",
    ".aac": "audio/aac",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
    ".oga": "audio/ogg",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
    ".weba": "audio/webm"
  };
  if (table[ext]) return table[ext];
  if (kind === "image") return "image/png";
  if (kind === "video") return "video/mp4";
  if (kind === "audio") return "audio/mpeg";
  return "application/octet-stream";
}

function buildMenu() {
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    }] : []),
    {
      label: "File",
      submenu: [
        {
          label: "New",
          accelerator: "CmdOrCtrl+N",
          click: () => sendCommand("new")
        },
        {
          label: "New From Template",
          accelerator: "CmdOrCtrl+Shift+N",
          click: () => sendCommand("templates")
        },
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: () => sendCommand("open")
        },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => sendCommand("save")
        },
        {
          label: "Save As",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => sendCommand("saveAs")
        },
        { type: "separator" },
        {
          label: "Validate Deck",
          accelerator: "CmdOrCtrl+Shift+V",
          click: () => sendCommand("validate")
        },
        {
          label: "Start Presentation",
          accelerator: "F5",
          click: () => sendCommand("presentFromStart")
        },
        {
          label: "Present From Current Slide",
          accelerator: "Shift+F5",
          click: () => sendCommand("present")
        },
        { type: "separator" },
        { role: isMac ? "close" : "quit" }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        {
          label: "Fit Canvas to Window",
          accelerator: "CmdOrCtrl+0",
          click: () => sendCommand("canvasZoomFit")
        },
        {
          label: "Actual Canvas Size",
          accelerator: "CmdOrCtrl+1",
          click: () => sendCommand("canvasZoomActual")
        },
        {
          label: "Zoom Canvas In",
          accelerator: "CmdOrCtrl+=",
          click: () => sendCommand("canvasZoomIn")
        },
        {
          label: "Zoom Canvas Out",
          accelerator: "CmdOrCtrl+-",
          click: () => sendCommand("canvasZoomOut")
        },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac ? [
          { type: "separator" },
          { role: "front" }
        ] : [])
      ]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Keyboard Shortcuts",
          accelerator: "CmdOrCtrl+/",
          click: () => sendCommand("shortcuts")
        },
        {
          label: "PPT.html on GitHub",
          click: async () => {
            await shell.openExternal("https://github.com/wk42worldworld/htmlppt");
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

configureAppIdentity();

app.whenReady().then(() => {
  configureAppIdentity();
  registerIpcHandlers();
  buildMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});
