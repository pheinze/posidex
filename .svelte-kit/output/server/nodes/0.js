import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.RsOc149r.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/NkhEIytD.js","_app/immutable/chunks/DPmpeZiJ.js"];
export const stylesheets = ["_app/immutable/assets/0.DWZ1zkS_.css"];
export const fonts = [];
