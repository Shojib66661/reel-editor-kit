import {random} from 'remotion';

export const C = {
	ink: '#141414',
	navy: '#0b2a5b',
	blue: '#1d5fd1',
	sky: '#5fa8ff',
	yellow: '#ffc72c',
	cream: '#f4ecdd',
	white: '#fbf8f1',
	kraft: '#c49a6c',
	red: '#e0402a',
};

export const FONT = {
	block: 'Anton',
	heavy: 'Archivo Black',
	serif: 'DM Serif Display',
	serifItalic: 'DM Serif Italic',
	marker: 'Permanent Marker',
};

/**
 * Torn-paper outline as a CSS clip-path polygon in percentages.
 * jagX / jagY are the max tear depth in % of width / height.
 */
export const tornClip = (
	seed: string,
	{
		jagX = 1.2,
		jagY = 5,
		nx = 26,
		ny = 8,
		inset = 0,
		edges = {t: true, r: true, b: true, l: true},
	}: {
		jagX?: number;
		jagY?: number;
		nx?: number;
		ny?: number;
		inset?: number;
		edges?: {t?: boolean; r?: boolean; b?: boolean; l?: boolean};
	} = {},
) => {
	const pts: string[] = [];
	const r = (i: string) => random(`${seed}-${i}`);
	const iy = inset * 0.5 * (jagY / Math.max(jagX, 1));
	const ix = inset;
	for (let i = 0; i <= nx; i++) {
		const x = (i / nx) * 100;
		const y = edges.t ? iy + r(`t${i}`) * jagY : 0;
		pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
	}
	for (let i = 1; i < ny; i++) {
		const y = (i / ny) * 100;
		const x = edges.r ? 100 - ix - r(`r${i}`) * jagX : 100;
		pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
	}
	for (let i = nx; i >= 0; i--) {
		const x = (i / nx) * 100;
		const y = edges.b ? 100 - iy - r(`b${i}`) * jagY : 100;
		pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
	}
	for (let i = ny - 1; i >= 1; i--) {
		const y = (i / ny) * 100;
		const x = edges.l ? ix + r(`l${i}`) * jagX : 0;
		pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
	}
	return `polygon(${pts.join(',')})`;
};

/** Stop-motion wobble: value changes only every `hold` frames (animation "on threes"). */
export const wob = (seed: string, frame: number, amp: number, hold = 3) =>
	(random(`${seed}-${Math.floor(frame / hold)}`) - 0.5) * 2 * amp;

/** Stepped pop-in scale (paper slapped down): 0 -> overshoot -> settle, on ones. */
export const pop = (local: number) => {
	if (local < 0) return 0;
	const steps = [0.35, 0.8, 1.12, 1.04, 1];
	return steps[Math.min(local, steps.length - 1)];
};

/** Snap a frame to "twos" for a hand-animated feel. */
export const twos = (f: number) => f - (f % 2);
