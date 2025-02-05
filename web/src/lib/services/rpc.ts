export const channelWithResponse = {
  title: false,
  icon: false,
  quit: false,
  axios: true,
};
export const channels = Object.keys(channelWithResponse);
export type Channel = keyof typeof channelWithResponse;
type AxiosResponse = {
  status: number;
  body: string;
  headers: Record<string, string>;
};
type Responses = {
  title: void;
  icon: void;
  quit: void;
  axios: AxiosResponse;
};

const win = globalThis as any;

const rpc = {
  async send<T extends Channel, R = Responses[T]>(
    channel: T,
    ...args: any[]
  ): Promise<R> {
    if (win.rpc && win.rpc.call) {
      return await win.rpc.call(channel, ...args);
    }
    // not available in web
    console.info(`[rpc] ${channel}`, ...args);
    if (channelWithResponse[channel]) {
      throw new Error("RPC not available");
    }

    return undefined as any;
  },
};
export default rpc;
