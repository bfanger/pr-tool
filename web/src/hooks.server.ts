import type { HandleServerError } from "@sveltejs/kit";

export const handleError: HandleServerError = ({ event, error, message }) => {
  if (
    event.url.pathname === "/.well-known/appspecific/com.chrome.devtools.json"
  ) {
    return { message };
  }
  console.error(error);
  return { message };
};
