import { sequence } from "@sveltejs/kit/hooks";
import { C as CONSTANTS } from "./constants.js";
const themeHandler = async ({ event, resolve }) => {
  const theme = event.cookies.get(CONSTANTS.LOCAL_STORAGE_THEME_KEY) || "dark";
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      let bodyClass = "";
      if (theme !== "dark") {
        bodyClass = `theme-${theme}`;
      }
      return html.replace(
        /<body(.*?)>/,
        `<body class="${bodyClass}"$1>`
      );
    }
  });
  return response;
};
const handle = sequence(themeHandler);
export {
  handle
};
