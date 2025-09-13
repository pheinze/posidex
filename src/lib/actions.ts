// src/lib/actions.ts

interface TrackClickParams {
  category: string;
  action: string;
  name: string;
}

export function trackClick(node: HTMLElement, params: TrackClickParams) {
  node.setAttribute('data-mtm-category', params.category);
  node.setAttribute('data-mtm-action', params.action);
  node.setAttribute('data-mtm-name', params.name);

  return {
    destroy() {
      node.removeAttribute('data-mtm-category');
      node.removeAttribute('data-mtm-action');
      node.removeAttribute('data-mtm-name');
    }
  };
}
