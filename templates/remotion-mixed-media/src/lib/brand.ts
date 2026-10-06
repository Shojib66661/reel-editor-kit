import {random} from 'remotion';

/** 4SEASONS brand (sampled from their profile logo + wordmark) + a few accents. */
export const C = {
	navy: '#0b2642',
	navyDeep: '#06182b',
	lime: '#aacd4f',
	limeHi: '#c8ec62', // brighter lime for text on video
	white: '#fbfbf6',
	ink: '#101418',
	heat: '#ff8a3d',
	water: '#5fb8ff',
	warn: '#e2483d',
	mold: '#7f8f5a',
	wood: '#b9824f',
};

export const FONT = {
	sans: 'Montserrat',
	sansBlack: 'Montserrat Black',
	serif: 'Playfair Italic',
	serifMid: 'Playfair Italic Mid',
	hand: 'Caveat Brush',
};

/** Thick sticker outline around a transparent element (stacked hard drop-shadows). */
export const outline = (color: string, px = 6, shadow = true) =>
	[
		`drop-shadow(${px}px 0 0 ${color})`,
		`drop-shadow(-${px}px 0 0 ${color})`,
		`drop-shadow(0 ${px}px 0 ${color})`,
		`drop-shadow(0 -${px}px 0 ${color})`,
		shadow ? 'drop-shadow(0 12px 14px rgba(0,0,0,0.35))' : '',
	].join(' ');

/** Stop-motion wobble: value changes only every `hold` frames. */
export const wob = (seed: string, frame: number, amp: number, hold = 3) =>
	(random(`${seed}-${Math.floor(frame / hold)}`) - 0.5) * 2 * amp;

/** Stepped pop-in (sticker slapped on): 0 -> overshoot -> settle. */
export const pop = (local: number) => {
	if (local < 0) return 0;
	const steps = [0.4, 0.85, 1.12, 1.04, 1];
	return steps[Math.min(local, steps.length - 1)];
};

/** Stepped pop-out over 3 frames. */
export const popOut = (local: number) => {
	if (local < 0) return 1;
	const steps = [1.06, 0.7, 0.3, 0];
	return steps[Math.min(local, steps.length - 1)];
};

/** 0..1 progress on twos (hand-animated feel). */
export const prog2 = (local: number, dur: number) => Math.max(0, Math.min(1, (Math.floor(local / 2) * 2) / dur));
