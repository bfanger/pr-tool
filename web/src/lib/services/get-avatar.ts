import { map, shareReplay } from "rxjs/operators";
import type { Observable } from "rxjs";
import azure from "./azure";

function base64toBlob(value: string, mimetype: string) {
  const binary = atob(value);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mimetype });
}

const cache: Record<string, Observable<string>> = {};
export default function getAvatar(
  organization: string,
  token: string,
  descriptor: string,
  size?: string
) {
  const key = `${descriptor}_${size}`;
  if (!cache[key]) {
    cache[key] = azure.avatar(organization, token, descriptor, size).pipe(
      map((response) => {
        const blob = base64toBlob(response.value, "image/png");
        const url = URL.createObjectURL(blob);
        return url;
      }),
      shareReplay(1)
    );
  }
  return cache[key];
}
