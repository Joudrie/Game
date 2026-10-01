import { open } from './lib.mjs';
const { b, p, ev, log } = await open();
console.log('load ms', log.loadMs);
await p.mouse.click(640, 360);
await p.waitForTimeout(500);
console.log('locked?', await ev(() => document.pointerLockElement === document.querySelector('canvas')));
console.log(await ev(() => ({ hot: __game.inv.hot.map((x) => x && x.id), bag: __game.inv.bag.filter(Boolean).map((x) => x.id), diff: __game.difficulty, gear: __game.gear })));
console.log('errors', log.errors, 'reports', log.reports);
await b.close();
