// Windows shell: opens the live billing site in its own window (same data as the phone app).
const { app, BrowserWindow, shell, session, Menu } = require("electron");
const path = require("path");
const APP_URL = "https://1981varunverma-hue.github.io/Divine-elite-oil/";
const SITE = "https://1981varunverma-hue.github.io";

if (!app.requestSingleInstanceLock()) app.quit();
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 380, minHeight: 600,
    title: "Divine Elite Oil Billing",
    icon: path.join(__dirname, "build", "icon.png"),
    backgroundColor: "#f4f7ef",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, spellcheck: false }
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: "ऐप", submenu: [
      { label: "रीलोड", accelerator: "F5", click: () => win.webContents.reloadIgnoringCache() },
      { label: "प्रिंट", accelerator: "CmdOrCtrl+P", click: () => win.webContents.print() },
      { type: "separator" }, { role: "zoomIn", label: "बड़ा करें" }, { role: "zoomOut", label: "छोटा करें" }, { role: "resetZoom", label: "सामान्य साइज़" },
      { type: "separator" }, { role: "togglefullscreen", label: "फ़ुल स्क्रीन" }, { role: "quit", label: "बंद करें" }
    ]}
  ]));
  win.loadURL(APP_URL);
  win.webContents.on("did-fail-load", (_e, code, _d, url, isMain) => {
    if (isMain && code !== -3) win.loadFile(path.join(__dirname, "offline.html"));
  });
  // WhatsApp, Instagram, maps etc. open in the normal browser / WhatsApp Desktop
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(SITE) || url.startsWith("blob:") || url.startsWith("about:")) return { action: "allow" };
    shell.openExternal(url); return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith(SITE) && !url.startsWith("file:")) { e.preventDefault(); shell.openExternal(url); }
  });
}

app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  // camera for the sticker QR scanner and bill photos
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(["media", "clipboard-sanitized-write", "notifications", "fullscreen"].includes(perm)));
  session.defaultSession.setPermissionCheckHandler((wc, perm) => ["media", "clipboard-sanitized-write"].includes(perm));
  createWindow();
});
app.on("window-all-closed", () => app.quit());
