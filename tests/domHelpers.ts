// Small helpers shared by the DOM (jsdom) tests.
import { act } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** jsdom has no layout. Leaflet only draws a map that has a size, so give every element one. */
export function giveElementsASize() {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 800 });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 600 });
}

const mounted: Array<() => void> = [];
export async function mount(ui: ReactElement) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(ui));
  const unmount = () => { act(() => root.unmount()); host.remove(); };
  mounted.push(unmount);
  return { host, unmount };
}
export function unmountAll() { while (mounted.length) mounted.pop()!(); }

/** Let pending promises and zero-delay timers finish (for example a mocked fetch resolving). */
export async function settle(rounds = 3) {
  for (let i = 0; i < rounds; i += 1) await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
}
export const click = (el: Element) => act(async () => { (el as HTMLElement).click(); });
export const byText = <T extends Element>(root: ParentNode, selector: string, text: string): T => {
  const found = [...root.querySelectorAll<T>(selector)].find((e) => e.textContent?.trim() === text);
  if (!found) throw new Error(`No ${selector} with text "${text}"`);
  return found;
};
