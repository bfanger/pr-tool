import Axios from "axios";
import {
  app,
  BrowserWindow,
  ipcMain,
  type IpcMainEvent,
  Menu,
  nativeTheme,
  screen,
  Tray,
} from "electron";
import open from "open";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const currentDir = dirname(fileURLToPath(import.meta.url));

let tray: Tray;
let window: BrowserWindow;
let currentIcon = "busy";
const windowWidth = 550;
const windowHeight = 500;

function getWindowPosition() {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  let x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2,
  );
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  if (trayBounds.x > 0 && trayBounds.x < width) {
    x = Math.max(0, Math.min(x, width - windowWidth - 2)); // prevent clipping on windows
  }

  // Position window 4 pixels vertically below or above the tray icon
  const y =
    trayBounds.y < windowHeight
      ? Math.round(trayBounds.y + trayBounds.height + 4)
      : trayBounds.y - windowHeight - 2;
  return { x, y };
}
function showWindow() {
  const position = getWindowPosition();
  if (!window.isVisibleOnAllWorkspaces()) {
    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
  }
  window.setPosition(position.x, position.y, false);
  window.show();
  window.focus();
}
function toggleWindow() {
  if (loaded === false) {
    load();
    return;
  }
  if (window.isVisible()) {
    window.hide();
    app.dock?.hide();
  } else {
    showWindow();
  }
}

// Don't show the app in the dock
app.dock?.hide();

// Quit the app when the window is closed
app.on("window-all-closed", () => {
  app.quit();
});
const icons = ["default", "error", "busy"];
function iconFilename(icon: string) {
  return path.join(
    currentDir,
    process.env.NODE_ENV === "development" ? "../../public" : "./",
    `tray-${icon}Template.png`,
  );
}
function createTray() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Restart",
      click: async () => {
        await load();
        showWindow();
      },
    },
    {
      label: "Quit",
      click: () => app.exit(0),
    },
  ]);
  tray = new Tray(iconFilename(currentIcon));
  tray.on("right-click", (e) => {
    contextMenu.popup();
  });
  tray.on("double-click", toggleWindow);
  tray.on("click", (event) => {
    toggleWindow();
    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.webContents.openDevTools({ mode: "detach" });
    }
  });
}
nativeTheme.on("updated", () => {
  tray.setImage(iconFilename(currentIcon));
});

let loaded = false;
async function load() {
  try {
    currentIcon = "busy";
    tray.setImage(iconFilename(currentIcon));
    await window.loadURL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173/v3"
        : "https://pr.bfanger.nl/v3",
    );
    loaded = true;
  } catch (err) {
    tray.setImage(iconFilename("error"));
    currentIcon = "error";
  }
}

function createWindow() {
  window = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      preload: path.join(currentDir, "preload.cjs"),
    },
  });
  load();

  window.webContents.setWindowOpenHandler(({ url }) => {
    open(url);
    return { action: "deny" };
  });

  // Hide the window when it loses focus
  window.on("blur", () => {
    app.dock?.hide();
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });
}

ipcMain.on("title", (event, title) => {
  tray.setTitle(title);
  tray.setToolTip(title);
});

ipcMain.on("icon", (event, icon) => {
  if (icons.includes(icon) === false) {
    console.warn(new Error(`Invalid icon: ${icon}`));
    return;
  }
  tray.setImage(iconFilename(icon));
  currentIcon = icon;
});
ipcMain.on("quit", () => {
  app.exit(0);
});

ipcMain.on("axios", (event, options) => {
  const reply = createAsyncResponse(event);
  Axios(options)
    .then((res) => {
      reply(null, {
        status: res.status,
        headers: res.headers,
        body: res.data,
      });
    })
    .catch((err) => {
      reply(err);
    });
});
app.on("ready", () => {
  createTray();
  createWindow();
});

const requestIds = new Set<number>();
const MAX_CONCURRENT = 10;

function createRequestId() {
  let i = 0;
  while (i < MAX_CONCURRENT) {
    i += 1;
    if (requestIds.has(i) === false) {
      requestIds.add(i);
      return i;
    }
  }
  throw new Error(`Request limit ${MAX_CONCURRENT} exceeded`);
}
type AsyncHandler = (err: Error | null, reponse?: any) => void;
function createAsyncResponse(event: IpcMainEvent): AsyncHandler {
  const id = createRequestId();
  const eventName = `async-response-${id}`;

  event.returnValue = eventName;
  let sent = false;

  return (err, response) => {
    if (sent) {
      console.warn("response already sent");
      return;
    }
    sent = true;
    event.reply(eventName, err, response);
    requestIds.delete(id);
  };
}
