import type { Channel } from "pr-tool-web/src/lib/services/rpc";
import { contextBridge, ipcRenderer } from "electron";
import {
  channels,
  channelWithResponse,
  // eslint-disable-next-line import/no-relative-packages
} from "../../web/src/lib/services/rpc";

contextBridge.exposeInMainWorld("rpc", {
  call: (channel: Channel, ...args: any[]) => {
    if (channels.includes(channel)) {
      const async = channelWithResponse[channel];
      if (async) {
        const eventName = ipcRenderer.sendSync(channel, ...args);
        return new Promise((resolve, reject) => {
          ipcRenderer.once(eventName, (event, err, data) => {
            if (err !== null) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      }
      ipcRenderer.send(channel, ...args);
    }
    return undefined;
  },
  callSync: (channel: Channel, ...args: any[]) => {
    if (channels.includes(channel)) {
      return ipcRenderer.sendSync(channel, ...args);
    }
    return undefined;
  },
});
