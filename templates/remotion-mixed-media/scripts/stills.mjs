// Render a list of stills with one bundle: node scripts/stills.mjs 30 200 400 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({serveUrl, id: 'AtticVents', browserExecutable});
for (const frame of frames) {
	await renderStill({composition, serveUrl, frame, output: `${process.env.OUTDIR ?? 'out/stills'}/f${String(frame).padStart(4, '0')}.png`, browserExecutable, scale: 0.5});
	console.log('frame', frame);
}
