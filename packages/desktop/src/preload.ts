import { contextBridge, ipcRenderer } from "electron";

export interface SpannerDesktopBridge {
  invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T>;
  setWindowTitle(title: string): Promise<void>;
  platform: NodeJS.Platform;
  versions: {
    electron: string;
    node: string;
    chrome: string;
  };
}

const api: SpannerDesktopBridge = {
  invoke: <T = unknown>(channel: string, ...args: unknown[]): Promise<T> =>
    ipcRenderer.invoke(channel, ...args) as Promise<T>,
  setWindowTitle: (title: string): Promise<void> =>
    ipcRenderer.invoke("spanner:window.setTitle", title) as Promise<void>,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
};

contextBridge.exposeInMainWorld("spannerDesktop", api);
