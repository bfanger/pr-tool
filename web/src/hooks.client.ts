import rpc from "$lib/services/rpc";

export function init() {
  rpc.send("icon", "default");
}
