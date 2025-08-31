import { C as CONSTANTS } from "../../chunks/constants.js";
import { i as initialAppState } from "../../chunks/stores.js";
const prerender = true;
const load = async ({ cookies }) => {
  const theme = cookies.get(CONSTANTS.LOCAL_STORAGE_THEME_KEY) || "dark";
  return {
    theme,
    initialAppState
    // Pass initialAppState to the layout
  };
};
export {
  load,
  prerender
};
