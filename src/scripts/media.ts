/** Lazy <video>: sources carry data-src until the element is near the viewport. */
export function loadVideo(v: HTMLVideoElement) {
  if (v.dataset.loaded) return;
  v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => { s.src = s.dataset.src!; });
  v.dataset.loaded = '1';
  v.load();
}
