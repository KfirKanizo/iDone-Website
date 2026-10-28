/**
 * iDone logo — animated web component + motion timeline.
 *
 *   <script type="module" src="/brand/animation/idone-logo.js"></script>
 *   <idone-logo layout="horizontal" animation="intro" trigger="visible"></idone-logo>
 *
 * Attributes
 *   layout     mark | horizontal | stacked            (default: horizontal)
 *   animation  intro | loop | none                    (default: intro)
 *   trigger    load | visible | hover | manual        (default: visible — plays once when scrolled into view)
 *   theme      light | dark | mono-black | mono-white | inherit   (default: light)
 *              "inherit" reads --idone-ink and --idone-accent from the page, so the site theme controls colours.
 *   tap        present → clicking/tapping the logo plays the "done" micro-animation
 *   label      accessible name (default: "iDone Technologies")
 *
 * Methods: play(), replay(), stop(), tap(), seek(timeline, ms)
 * Events:  "idone:landed" (the dot locks into the D), "idone:finished" (intro complete)
 *
 * prefers-reduced-motion: the final frame is shown and nothing moves.
 * The motion functions below are pure (time → state), so the same timeline
 * drives the website, the exported videos and the animated SVG.
 */

export const DATA = {"palette":{"light":{"ink":"#0E1A2B","accent":"#2F5BFF"},"dark":{"ink":"#F4F6FA","accent":"#7D97FF"}},"horizontal":{"W":182.92,"H":64,"mark":[0,0],"word":[{"t":"path","d":"M84.47 37.4V17.4H89.87V37.4Z","c":"ink"},{"t":"circle","d":[87.167,12.4,2.9],"c":"accent"},{"t":"path","d":"M94.87 37.4V11.4H104.13Q111.07 11.4 114.2 14.82Q117.33 18.23 117.33 24.4Q117.33 30.57 114.2 33.98Q111.07 37.4 104.13 37.4ZM100.47 33.07H103.8Q106.37 33.07 108.08 32.28Q109.8 31.5 110.67 29.62Q111.53 27.73 111.53 24.4Q111.53 21.07 110.67 19.18Q109.8 17.3 108.08 16.52Q106.37 15.73 103.8 15.73H100.47Z","c":"ink"},{"t":"path","d":"M128.29 37.9Q123.33 37.9 120.88 35.05Q118.43 32.2 118.43 27.4Q118.43 22.6 120.88 19.75Q123.33 16.9 128.29 16.9Q133.26 16.9 135.71 19.75Q138.16 22.6 138.16 27.4Q138.16 32.2 135.71 35.05Q133.26 37.9 128.29 37.9ZM128.29 34.3Q130.49 34.3 131.53 32.57Q132.56 30.83 132.56 27.37Q132.56 23.93 131.53 22.22Q130.49 20.5 128.29 20.5Q126.09 20.5 125.06 22.22Q124.03 23.93 124.03 27.37Q124.03 30.83 125.06 32.57Q126.09 34.3 128.29 34.3Z","c":"ink"},{"t":"path","d":"M141.24 37.4V17.4H146.24V20.4H147.04Q147.64 18.9 148.89 17.9Q150.14 16.9 152.57 16.9Q155.91 16.9 157.57 19Q159.24 21.1 159.24 24.7V37.4H153.84V25.6Q153.84 23.53 153.11 22.42Q152.37 21.3 150.71 21.3Q148.77 21.3 147.71 22.82Q146.64 24.33 146.64 26.6V37.4Z","c":"ink"},{"t":"path","d":"M171.75 37.9Q167.02 37.9 164.54 35.07Q162.05 32.23 162.05 27.37Q162.05 24.1 163.17 21.77Q164.29 19.43 166.44 18.17Q168.59 16.9 171.69 16.9Q176.15 16.9 178.54 19.6Q180.92 22.3 180.92 27.53V28.67H167.32Q167.49 31.2 168.64 32.65Q169.79 34.1 171.75 34.1Q173.32 34.1 174.27 33.17Q175.22 32.23 175.52 31H180.65Q180.35 32.83 179.32 34.4Q178.29 35.97 176.42 36.93Q174.55 37.9 171.75 37.9ZM167.32 25.27H175.65Q175.52 23 174.52 21.75Q173.52 20.5 171.65 20.5Q169.82 20.5 168.7 21.68Q167.59 22.87 167.32 25.27Z","c":"ink"}],"desc":[{"t":"path","d":"M84.13 52.6V47.37H82.24V46.4H87.25V47.37H85.35V52.6Z","c":"ink"},{"t":"path","d":"M90.72 52.6V46.4H94.89V47.37H91.93V48.84H94.22V49.75H91.93V51.62H94.94V52.6Z","c":"ink"},{"t":"path","d":"M100.99 52.72Q99.66 52.72 98.92 51.87Q98.19 51.02 98.19 49.5Q98.19 47.99 98.92 47.14Q99.65 46.28 100.99 46.28Q101.79 46.28 102.36 46.58Q102.93 46.88 103.26 47.41Q103.58 47.94 103.64 48.64H102.41Q102.35 47.97 101.97 47.59Q101.6 47.21 100.99 47.21Q100.23 47.21 99.84 47.81Q99.45 48.41 99.45 49.51Q99.45 50.64 99.85 51.21Q100.25 51.79 100.98 51.79Q101.62 51.79 101.99 51.39Q102.36 50.99 102.41 50.36H103.64Q103.58 51.05 103.26 51.58Q102.93 52.12 102.36 52.42Q101.79 52.72 100.99 52.72Z","c":"ink"},{"t":"path","d":"M107.11 52.6V46.4H108.33V48.79H111.1V46.4H112.32V52.6H111.1V49.79H108.33V52.6Z","c":"ink"},{"t":"path","d":"M116.19 52.6V46.4H118.32L120.38 51.64H120.57V46.4H121.68V52.6H119.54L117.48 47.36H117.3V52.6Z","c":"ink"},{"t":"path","d":"M128.09 52.71Q127.11 52.71 126.46 52.32Q125.81 51.92 125.5 51.2Q125.18 50.48 125.18 49.5Q125.18 48.51 125.5 47.8Q125.81 47.08 126.46 46.68Q127.11 46.29 128.09 46.29Q129.07 46.29 129.72 46.68Q130.36 47.08 130.68 47.8Q131 48.51 131 49.5Q131 50.48 130.68 51.2Q130.36 51.92 129.72 52.32Q129.07 52.71 128.09 52.71ZM128.09 51.78Q128.93 51.78 129.33 51.19Q129.73 50.59 129.73 49.5Q129.73 48.4 129.33 47.81Q128.93 47.22 128.09 47.22Q127.24 47.22 126.84 47.81Q126.44 48.4 126.44 49.5Q126.44 50.59 126.84 51.19Q127.24 51.78 128.09 51.78Z","c":"ink"},{"t":"path","d":"M134.5 52.6V46.4H135.72V51.62H138.39V52.6Z","c":"ink"},{"t":"path","d":"M144.41 52.71Q143.43 52.71 142.78 52.32Q142.13 51.92 141.82 51.2Q141.5 50.48 141.5 49.5Q141.5 48.51 141.82 47.8Q142.13 47.08 142.78 46.68Q143.43 46.29 144.41 46.29Q145.39 46.29 146.04 46.68Q146.68 47.08 147 47.8Q147.32 48.51 147.32 49.5Q147.32 50.48 147 51.2Q146.68 51.92 146.04 52.32Q145.39 52.71 144.41 52.71ZM144.41 51.78Q145.25 51.78 145.65 51.19Q146.05 50.59 146.05 49.5Q146.05 48.4 145.65 47.81Q145.25 47.22 144.41 47.22Q143.56 47.22 143.16 47.81Q142.76 48.4 142.76 49.5Q142.76 50.59 143.16 51.19Q143.56 51.78 144.41 51.78Z","c":"ink"},{"t":"path","d":"M153.13 52.71Q152.27 52.71 151.67 52.31Q151.07 51.9 150.76 51.17Q150.44 50.45 150.44 49.48Q150.44 48.51 150.77 47.79Q151.09 47.08 151.72 46.68Q152.36 46.29 153.3 46.29Q154.09 46.29 154.64 46.56Q155.18 46.84 155.49 47.33Q155.8 47.81 155.89 48.47H154.71Q154.62 47.86 154.26 47.54Q153.89 47.22 153.27 47.22Q152.46 47.22 152.07 47.81Q151.68 48.41 151.68 49.48Q151.68 50.6 152.09 51.2Q152.5 51.8 153.31 51.8Q153.99 51.8 154.36 51.4Q154.73 51 154.77 50.31H152.96V49.41H155.9V52.6H155V51.87H154.81Q154.64 52.2 154.25 52.46Q153.86 52.71 153.13 52.71Z","c":"ink"},{"t":"path","d":"M159.65 52.6V46.4H160.88V52.6Z","c":"ink"},{"t":"path","d":"M164.75 52.6V46.4H168.92V47.37H165.96V48.84H168.25V49.75H165.96V51.62H168.97V52.6Z","c":"ink"},{"t":"path","d":"M174.83 52.72Q174.13 52.72 173.65 52.53Q173.16 52.35 172.85 52.03Q172.54 51.72 172.39 51.34Q172.24 50.95 172.21 50.57H173.36Q173.38 50.87 173.54 51.15Q173.71 51.43 174.04 51.61Q174.37 51.79 174.87 51.79Q175.4 51.79 175.68 51.56Q175.95 51.34 175.95 50.97Q175.95 50.6 175.7 50.39Q175.46 50.18 175.07 50.04L174.24 49.77Q173.8 49.62 173.41 49.41Q173.01 49.21 172.76 48.86Q172.5 48.52 172.5 47.98Q172.5 47.43 172.78 47.06Q173.05 46.68 173.53 46.48Q174.02 46.28 174.66 46.28Q175.45 46.28 175.93 46.55Q176.4 46.83 176.63 47.25Q176.85 47.67 176.9 48.15H175.75Q175.73 47.91 175.61 47.69Q175.5 47.47 175.26 47.33Q175.01 47.19 174.6 47.19Q174.15 47.19 173.91 47.39Q173.68 47.58 173.68 47.89Q173.68 48.23 173.93 48.43Q174.19 48.63 174.58 48.76L175.4 49.04Q175.85 49.18 176.24 49.39Q176.63 49.6 176.88 49.95Q177.14 50.3 177.14 50.88Q177.14 51.74 176.52 52.23Q175.91 52.72 174.83 52.72Z","c":"ink"}]},"stacked":{"W":123.29,"H":134,"mark":[29.646153846153844,0],"word":[{"t":"path","d":"M6.85 114V90.92H13.08V114Z","c":"ink"},{"t":"circle","d":[9.962,85.154,3.346],"c":"accent"},{"t":"path","d":"M18.85 114V84H29.54Q37.54 84 41.15 87.94Q44.77 91.88 44.77 99Q44.77 106.12 41.15 110.06Q37.54 114 29.54 114ZM25.31 109H29.15Q32.12 109 34.1 108.1Q36.08 107.19 37.08 105.02Q38.08 102.85 38.08 99Q38.08 95.15 37.08 92.98Q36.08 90.81 34.1 89.9Q32.12 89 29.15 89H25.31Z","c":"ink"},{"t":"path","d":"M57.42 114.58Q51.68 114.58 48.86 111.29Q46.03 108 46.03 102.46Q46.03 96.92 48.86 93.63Q51.68 90.35 57.42 90.35Q63.15 90.35 65.97 93.63Q68.8 96.92 68.8 102.46Q68.8 108 65.97 111.29Q63.15 114.58 57.42 114.58ZM57.42 110.42Q59.95 110.42 61.15 108.42Q62.34 106.42 62.34 102.42Q62.34 98.46 61.15 96.48Q59.95 94.5 57.42 94.5Q54.88 94.5 53.68 96.48Q52.49 98.46 52.49 102.42Q52.49 106.42 53.68 108.42Q54.88 110.42 57.42 110.42Z","c":"ink"},{"t":"path","d":"M72.35 114V90.92H78.12V94.38H79.05Q79.74 92.65 81.18 91.5Q82.62 90.35 85.43 90.35Q89.28 90.35 91.2 92.77Q93.12 95.19 93.12 99.35V114H86.89V100.38Q86.89 98 86.05 96.71Q85.2 95.42 83.28 95.42Q81.05 95.42 79.82 97.17Q78.58 98.92 78.58 101.54V114Z","c":"ink"},{"t":"path","d":"M107.56 114.58Q102.1 114.58 99.23 111.31Q96.37 108.04 96.37 102.42Q96.37 98.65 97.66 95.96Q98.95 93.27 101.43 91.81Q103.91 90.35 107.48 90.35Q112.64 90.35 115.39 93.46Q118.14 96.58 118.14 102.62V103.92H102.45Q102.64 106.85 103.97 108.52Q105.29 110.19 107.56 110.19Q109.37 110.19 110.47 109.12Q111.56 108.04 111.91 106.62H117.83Q117.48 108.73 116.29 110.54Q115.1 112.35 112.95 113.46Q110.79 114.58 107.56 114.58ZM102.45 100H112.06Q111.91 97.38 110.75 95.94Q109.6 94.5 107.45 94.5Q105.33 94.5 104.04 95.87Q102.75 97.23 102.45 100Z","c":"ink"}],"desc":[{"t":"path","d":"M11.62 132V126.09H9.49V125H15.14V126.09H13.01V132Z","c":"ink"},{"t":"path","d":"M19.07 132V125H23.77V126.09H20.43V127.76H23.02V128.78H20.43V130.9H23.82V132Z","c":"ink"},{"t":"path","d":"M30.66 132.13Q29.16 132.13 28.33 131.17Q27.49 130.21 27.49 128.5Q27.49 126.79 28.32 125.83Q29.14 124.87 30.66 124.87Q31.56 124.87 32.2 125.2Q32.85 125.54 33.22 126.14Q33.59 126.74 33.65 127.53H32.27Q32.19 126.78 31.77 126.35Q31.34 125.92 30.66 125.92Q29.8 125.92 29.36 126.59Q28.92 127.27 28.92 128.51Q28.92 129.78 29.37 130.43Q29.82 131.08 30.65 131.08Q31.37 131.08 31.79 130.64Q32.2 130.19 32.27 129.47H33.65Q33.59 130.25 33.22 130.85Q32.85 131.45 32.21 131.79Q31.57 132.13 30.66 132.13Z","c":"ink"},{"t":"path","d":"M37.57 132V125H38.95V127.7H42.07V125H43.45V132H42.07V128.82H38.95V132Z","c":"ink"},{"t":"path","d":"M47.82 132V125H50.23L52.55 130.91H52.77V125H54.02V132H51.6L49.27 126.09H49.07V132Z","c":"ink"},{"t":"path","d":"M61.25 132.13Q60.15 132.13 59.42 131.68Q58.68 131.24 58.33 130.42Q57.97 129.6 57.97 128.5Q57.97 127.39 58.33 126.57Q58.68 125.76 59.42 125.32Q60.15 124.87 61.25 124.87Q62.36 124.87 63.09 125.32Q63.82 125.76 64.18 126.57Q64.54 127.39 64.54 128.5Q64.54 129.6 64.18 130.42Q63.82 131.24 63.09 131.68Q62.36 132.13 61.25 132.13ZM61.25 131.08Q62.2 131.08 62.66 130.4Q63.11 129.73 63.11 128.5Q63.11 127.26 62.66 126.59Q62.2 125.92 61.25 125.92Q60.3 125.92 59.85 126.59Q59.39 127.26 59.39 128.5Q59.39 129.73 59.85 130.4Q60.3 131.08 61.25 131.08Z","c":"ink"},{"t":"path","d":"M68.49 132V125H69.87V130.9H72.89V132Z","c":"ink"},{"t":"path","d":"M79.68 132.13Q78.57 132.13 77.84 131.68Q77.11 131.24 76.75 130.42Q76.39 129.6 76.39 128.5Q76.39 127.39 76.75 126.57Q77.11 125.76 77.84 125.32Q78.57 124.87 79.68 124.87Q80.79 124.87 81.52 125.32Q82.24 125.76 82.6 126.57Q82.96 127.39 82.96 128.5Q82.96 129.6 82.6 130.42Q82.24 131.24 81.52 131.68Q80.79 132.13 79.68 132.13ZM79.68 131.08Q80.63 131.08 81.08 130.4Q81.54 129.73 81.54 128.5Q81.54 127.26 81.08 126.59Q80.63 125.92 79.68 125.92Q78.73 125.92 78.27 126.59Q77.82 127.26 77.82 128.5Q77.82 129.73 78.27 130.4Q78.73 131.08 79.68 131.08Z","c":"ink"},{"t":"path","d":"M89.53 132.13Q88.56 132.13 87.88 131.67Q87.2 131.21 86.85 130.39Q86.49 129.57 86.49 128.48Q86.49 127.38 86.86 126.57Q87.22 125.76 87.94 125.32Q88.66 124.87 89.72 124.87Q90.61 124.87 91.23 125.18Q91.84 125.49 92.19 126.05Q92.54 126.6 92.64 127.33H91.31Q91.21 126.65 90.8 126.29Q90.39 125.92 89.69 125.92Q88.77 125.92 88.33 126.6Q87.89 127.27 87.89 128.48Q87.89 129.74 88.35 130.42Q88.82 131.09 89.73 131.09Q90.5 131.09 90.91 130.64Q91.33 130.2 91.38 129.42H89.33V128.4H92.65V132H91.64V131.17H91.42Q91.23 131.55 90.79 131.84Q90.35 132.13 89.53 132.13Z","c":"ink"},{"t":"path","d":"M96.89 132V125H98.27V132Z","c":"ink"},{"t":"path","d":"M102.65 132V125H107.35V126.09H104.01V127.76H106.6V128.78H104.01V130.9H107.41V132Z","c":"ink"},{"t":"path","d":"M114.03 132.13Q113.24 132.13 112.69 131.92Q112.14 131.71 111.79 131.36Q111.44 131 111.27 130.57Q111.1 130.14 111.07 129.7H112.37Q112.38 130.04 112.57 130.36Q112.76 130.68 113.13 130.88Q113.51 131.08 114.07 131.08Q114.67 131.08 114.98 130.83Q115.29 130.57 115.29 130.16Q115.29 129.75 115.01 129.51Q114.73 129.26 114.3 129.11L113.36 128.81Q112.87 128.63 112.42 128.4Q111.97 128.17 111.68 127.78Q111.4 127.4 111.4 126.79Q111.4 126.17 111.71 125.74Q112.02 125.31 112.56 125.09Q113.11 124.87 113.83 124.87Q114.73 124.87 115.26 125.17Q115.8 125.48 116.05 125.96Q116.31 126.44 116.36 126.97H115.07Q115.04 126.71 114.91 126.46Q114.78 126.21 114.51 126.05Q114.23 125.9 113.77 125.9Q113.25 125.9 112.99 126.12Q112.72 126.34 112.72 126.69Q112.72 127.06 113.01 127.29Q113.3 127.51 113.75 127.67L114.67 127.98Q115.17 128.14 115.62 128.38Q116.06 128.62 116.35 129.01Q116.63 129.41 116.63 130.05Q116.63 131.03 115.94 131.58Q115.25 132.13 114.03 132.13Z","c":"ink"}]}};

/* ------------------------------------------------------------------ geometry (64-unit grid) */
export const GEO = {
  dShape: 'M10 10H32A22 22 0 0 1 32 54H10ZM22 22V42H32A10 10 0 0 0 32 22Z',
  // centreline the D is "drawn" along: up the spine, across, round the bowl, back
  dTrace: 'M16 54V16H32A16 16 0 0 1 32 48H16',
  traceStroke: 12,
  stemFraction: 38 / (38 + 16 + Math.PI * 16 + 16),
  dot: { x: 32, y: 32, r: 6 },          // resting place: centre of the counter
  iDot: { x: 16, y: 3 },                // where the dot of the "i" sits above the spine
  leapControl: { x: 30, y: -16 },       // quadratic control point of the leap
};

/* ------------------------------------------------------------------ easing */
export const ease = {
  linear: t => t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (t, a, b) => clamp((t - a) / (b - a));
const squash = tau => (tau < 0 ? 0 : 0.26 * Math.exp(-7 * tau) * Math.cos(15 * tau)); // damped spring, seconds
const click = tau => (tau < 0 || tau > 0.24 ? 0 : 0.035 * Math.sin(Math.PI * tau / 0.24));

/* ------------------------------------------------------------------ timelines (ms) */
export const TIMELINES = {
  intro: { duration: 1900, landAt: 1180 },
  loop:  { duration: 1800, landAt: 1000, loop: true },
  tap:   { duration: 560,  landAt: 0 },
};

/**
 * Pure state for a moment in time.
 * returns { draw:[a,b], dot:{x,y,s,sx,sy}, dScale, letters:(i)=>{o,dx,dy}, desc:{o,dy} }
 */
export function frame(name, t, letterCount = 6) {
  const G = GEO;
  if (name === 'intro') {
    // 1. spine rises (an "i" stem), 2. the i-dot pops above it, 3. the bowl closes while the dot leaps in
    const p1 = ease.outCubic(span(t, 0, 380)) * G.stemFraction;
    const p2 = ease.inOutCubic(span(t, 760, 1180)) * (1 - G.stemFraction);
    const pop = span(t, 300, 560);
    const leap = ease.inOutCubic(span(t, 760, 1180));
    const u = leap, a = G.iDot, c = G.leapControl, b = G.dot;
    const x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * c.x + u * u * b.x;
    const y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * c.y + u * u * b.y;
    const tau = (t - 1180) / 1000;
    const sq = squash(tau);
    const stretch = leap > 0 && leap < 1 ? 0.12 * Math.sin(Math.PI * leap) : 0; // elongate mid-flight
    const s = pop <= 0 ? 0 : ease.outBack(pop);
    const letters = i => {
      const k = ease.outCubic(span(t, 1140 + i * 45, 1140 + i * 45 + 420));
      return { o: k, dx: -10 * (1 - k), dy: 0 };
    };
    const di = ease.outCubic(span(t, 1450, 1900));
    return {
      draw: [0, p1 + p2],
      dot: { x, y, s, sx: 1 + sq - stretch, sy: 1 - sq + stretch },
      dScale: 1 - click(tau),
      letters, wordDot: wordDotDrop(t, 1420),
      desc: { o: di, dy: 3 * (1 - di) },
    };
  }
  if (name === 'loop') {
    const b = ease.inOutCubic(span(t, 0, 800));
    const a = ease.inOutCubic(span(t, 1300, 1700));
    const pop = span(t, 760, 1000);
    const out = ease.inCubic(span(t, 1300, 1550));
    const tau = (t - 1000) / 1000;
    const sq = t < 1300 ? squash(tau) : 0;
    const s = (pop <= 0 ? 0 : ease.outBack(pop)) * (1 - out);
    return {
      draw: [a, b],
      dot: { x: GEO.dot.x, y: GEO.dot.y, s, sx: 1 + sq, sy: 1 - sq },
      dScale: 1 - click(tau),
      letters: () => ({ o: 1, dx: 0, dy: 0 }), wordDot: { dy: 0, sx: 1, sy: 1 },
      desc: { o: 1, dy: 0 },
    };
  }
  // tap: the dot is pressed and springs back; the D answers with a click
  const tau = t / 1000;
  const sq = -squash(tau);
  return {
    draw: [0, 1],
    dot: { x: GEO.dot.x, y: GEO.dot.y, s: 1, sx: 1 + sq, sy: 1 - sq },
    dScale: 1 - click(tau),
    letters: () => ({ o: 1, dx: 0, dy: 0 }), wordDot: wordDotDrop(t + 200, 0),
    desc: { o: 1, dy: 0 },
  };
}

function wordDotDrop(t, start) {
  // the accent dot on the wordmark "i" drops in last, echoing the mark
  const k = span(t, start, start + 260);
  const tau = (t - start - 260) / 1000;
  const sq = squash(tau) * 0.8;
  return { dy: -14 * (1 - ease.inCubic(k)), o: k > 0 ? 1 : 0, sx: 1 + sq, sy: 1 - sq };
}

export const FINAL = frame('intro', TIMELINES.intro.duration);

/* ------------------------------------------------------------------ SVG markup */
const THEMES = {
  light: DATA.palette.light,
  dark: DATA.palette.dark,
  'mono-black': { ink: '#000000', accent: '#000000' },
  'mono-white': { ink: '#FFFFFF', accent: '#FFFFFF' },
};

function itemsSVG(items, cls) {
  // group glyph items: a circle belongs to the glyph before it (the i and its dot)
  const groups = [];
  for (const it of items) {
    if (it.t === 'circle' && groups.length) groups[groups.length - 1].push(it); else groups.push([it]);
  }
  return groups.map((g, i) => `<g class="${cls}" data-i="${i}">` + g.map(it => it.t === 'path'
    ? `<path class="${it.c}" d="${it.d}"/>`
    : `<circle class="${it.c} word-dot" cx="${it.d[0]}" cy="${it.d[1]}" r="${it.d[2]}" style="transform-origin:${it.d[0]}px ${it.d[1] + it.d[2]}px"/>`).join('') + '</g>').join('');
}

export function markup(layout = 'horizontal', label = 'iDone Technologies') {
  const L = layout === 'mark' ? { W: 64, H: 64, mark: [0, 0], word: [], desc: [] } : DATA[layout];
  const [mx, my] = L.mark;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L.W} ${L.H}" role="img" aria-label="${label}" overflow="visible">
  <defs><mask id="trace" maskUnits="userSpaceOnUse" x="-20" y="-40" width="104" height="124">
    <path class="trace" d="${GEO.dTrace}" pathLength="100" fill="none" stroke="#fff" stroke-width="${GEO.traceStroke}" stroke-linejoin="miter"/>
  </mask></defs>
  <g class="mark" transform="translate(${mx} ${my})">
    <g class="dgroup" style="transform-origin:32px 32px"><path class="ink" fill-rule="evenodd" d="${GEO.dShape}" mask="url(#trace)"/></g>
    <circle class="accent dot" cx="0" cy="0" r="${GEO.dot.r}"/>
  </g>
  ${itemsSVG(L.word, 'letter')}
  <g class="desc">${itemsSVG(L.desc, 'dl')}</g>
</svg>`;
}

/** Apply a state to an SVG produced by markup(). */
export function apply(svg, st) {
  const trace = svg.querySelector('.trace');
  const [a, b] = st.draw;
  trace.setAttribute('stroke-dasharray', `${Math.max(0, (b - a) * 100)} 200`);
  trace.setAttribute('stroke-dashoffset', `${-a * 100}`);
  // fully drawn → drop the mask so the final edges are exactly the static logo
  const dpath = svg.querySelector('.dgroup path');
  if (a <= 0 && b >= 0.9999) dpath.removeAttribute('mask'); else dpath.setAttribute('mask', 'url(#trace)');
  svg.querySelector('.dgroup').setAttribute('transform', `translate(32 32) scale(${st.dScale}) translate(-32 -32)`);
  const d = st.dot;
  svg.querySelector('.dot').setAttribute('transform',
    `translate(${d.x} ${d.y}) scale(${d.s * d.sx} ${d.s * d.sy})`);
  svg.querySelectorAll('.letter').forEach((g, i) => {
    const l = st.letters(i);
    g.setAttribute('opacity', l.o.toFixed(3));
    g.setAttribute('transform', `translate(${l.dx.toFixed(2)} ${l.dy.toFixed(2)})`);
  });
  svg.querySelectorAll('.word-dot').forEach(c => {
    const w = st.wordDot;
    c.style.transform = `translateY(${w.dy}px) scale(${w.sx}, ${w.sy})`;
    c.style.opacity = w.o ?? 1;
  });
  const desc = svg.querySelector('.desc');
  desc.setAttribute('opacity', st.desc.o.toFixed(3));
  desc.setAttribute('transform', `translate(0 ${st.desc.dy.toFixed(2)})`);
}

/* ------------------------------------------------------------------ custom element */
if (typeof HTMLElement !== 'undefined' && !customElements.get('idone-logo')) {
  const CSS = `
    :host{display:inline-block;line-height:0;-webkit-tap-highlight-color:transparent}
    :host([tap]){cursor:pointer}
    svg{width:100%;height:100%;display:block;overflow:visible}
    .ink{fill:var(--_ink)} .accent{fill:var(--_accent)}
    :host(:focus-visible){outline:2px solid var(--_accent);outline-offset:4px;border-radius:4px}
  `;
  class IDoneLogo extends HTMLElement {
    static observedAttributes = ['layout', 'theme', 'label', 'animation'];
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._raf = 0; this._name = null; this._t0 = 0; this._played = false;
    }
    connectedCallback() {
      this._render();
      const trig = this.getAttribute('trigger') || 'visible';
      if (this._reduced() || this._anim() === 'none') return this._show(FINAL);
      if (this._anim() === 'loop') return this.play();
      this._show(frame('intro', 0));
      if (trig === 'load') this.play();
      else if (trig === 'visible') {
        this._io = new IntersectionObserver(es => {
          if (es.some(e => e.isIntersecting) && !this._played) { this.play(); this._io.disconnect(); }
        }, { threshold: 0.4 });
        this._io.observe(this);
      } else if (trig === 'hover') {
        this._show(FINAL);
        this.addEventListener('pointerenter', () => this.replay());
      }
      if (this.hasAttribute('tap')) {
        this.tabIndex = 0;
        this.addEventListener('click', () => this.tap());
        this.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.tap(); } });
      }
    }
    disconnectedCallback() { cancelAnimationFrame(this._raf); this._io?.disconnect(); }
    attributeChangedCallback() { if (this.shadowRoot.firstChild) { this._render(); this._show(this._last || FINAL); } }
    _anim() { return this.getAttribute('animation') || 'intro'; }
    _reduced() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
    _render() {
      const theme = this.getAttribute('theme') || 'light';
      const c = THEMES[theme];
      const vars = c ? `:host{--_ink:${c.ink};--_accent:${c.accent}}`
                     : `:host{--_ink:var(--idone-ink,${THEMES.light.ink});--_accent:var(--idone-accent,${THEMES.light.accent})}`;
      this.shadowRoot.innerHTML = `<style>${CSS}${vars}</style>` + markup(this.getAttribute('layout') || 'horizontal', this.getAttribute('label') || 'iDone Technologies');
      this._svg = this.shadowRoot.querySelector('svg');
    }
    _show(st) { this._last = st; apply(this._svg, st); }
    _run(name) {
      cancelAnimationFrame(this._raf);
      const T = TIMELINES[name]; this._name = name; this._t0 = performance.now(); let landed = false;
      const step = now => {
        let t = now - this._t0;
        if (T.loop) t %= T.duration;
        this._show(frame(name, Math.min(t, T.duration)));
        if (!landed && t >= T.landAt && name !== 'tap') { landed = true; this.dispatchEvent(new CustomEvent('idone:landed', { bubbles: true })); }
        if (T.loop || t < T.duration) this._raf = requestAnimationFrame(step);
        else if (name === 'intro') this.dispatchEvent(new CustomEvent('idone:finished', { bubbles: true }));
      };
      this._raf = requestAnimationFrame(step);
    }
    play() { if (this._reduced()) return this._show(FINAL); this._played = true; this._run(this._anim() === 'loop' ? 'loop' : 'intro'); }
    replay() { this.play(); }
    stop() { cancelAnimationFrame(this._raf); this._show(FINAL); }
    tap() { if (this._reduced() || this._name === 'intro' && performance.now() - this._t0 < TIMELINES.intro.duration) return; this._run('tap'); }
    seek(name, ms) { cancelAnimationFrame(this._raf); this._show(frame(name, ms)); }
  }
  customElements.define('idone-logo', IDoneLogo);
}
