export const channelWithResponse = {
  title: false,
  icon: false,
  attentionNeeded: false,
  quit: false,
  fetch: true,
};
export const channels = Object.keys(channelWithResponse);
export type Channel = keyof typeof channelWithResponse;
export type FetchProxyResponse = {
  status: number;
  headers: Record<string, string>;
  body: unknown;
};
type Responses = {
  title: void;
  icon: void;
  attentionNeeded: void;
  quit: void;
  fetch: FetchProxyResponse;
};

const win = globalThis as any;

const rpc = {
  async send<T extends Channel, R = Responses[T]>(
    channel: T,
    ...args: any[]
  ): Promise<R> {
    if (win.rpc?.call) {
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
