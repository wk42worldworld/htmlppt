"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("htmlpptDesktop", {
  isDesktop: true,
  openDeck: () => ipcRenderer.invoke("deck:open"),
  saveDeck: (payload) => ipcRenderer.invoke("deck:save", payload),
  saveDeckAs: (payload) => ipcRenderer.invoke("deck:saveAs", payload),
  onMenuCommand: (callback) => {
    const listener = (_event, command) => callback(command);
    ipcRenderer.on("menu-command", listener);
    return () => ipcRenderer.removeListener("menu-command", listener);
  }
});
