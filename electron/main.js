"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { app, BrowserWindow, Menu, dialog, ipcMain, nativeImage, shell } = require("electron");

const isMac = process.platform === "darwin";
const appName = "PPT.html Studio";

function appIconPath() {
  const iconFile = process.platform === "win32" ? "icon.ico" : "icon.png";
  return path.join(__dirname, "..", "build", iconFile);
}

function configureAppIdentity() {
  app.setName(appName);

  if (process.platform === "win32") {
    app.setAppUserModelId("world.wk42.htmlppt");
  }

  if (isMac && app.dock) {
    const dockIcon = nativeImage.createFromPath(appIconPath());
    if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon);
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: "#e9ecef",
    title: appName,
    icon: appIconPath(),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
      sandbox: true
    }
  });

  window.loadFile(path.join(__dirname, "..", "index.html"));

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
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
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
