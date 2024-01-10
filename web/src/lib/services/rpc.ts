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

const rpc = {
  async send<T extends Channel, R = Responses[T]>(
    channel: T,
    ...args: any[]
  ): Promise<R> {
    if (window.rpc && window.rpc.call) {
      // eslint-disable-next-line @typescript-eslint/return-await
      return await window.rpc.call(channel, ...args);
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
