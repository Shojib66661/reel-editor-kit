import data from '../data/timeline.json';

export type Box = [number, number, number, number];
export type FrameRow = [number, 'f' | 'c', Box | null, number, number | null];

export type Word = {w: string; f: number; emph: boolean};
export type Chunk = {seg: string; words: Word[]; start: number; end: number};
export type Piece = {srcIn: number; srcOut: number; start: number; end: number};
export type Segment = {id: string; start: number; end: number; pieces: Piece[]};

export const TL = data as unknown as {
	fps: number;
	width: number;
	height: number;
	srcWidth: number;
	srcHeight: number;
	totalFrames: number;
	speechFrames: number;
	endCardStart: number;
	segments: Segment[];
	chunks: Chunk[];
	frames: FrameRow[];
};

export const row = (f: number): FrameRow | null => TL.frames[f] ?? null;

export const segment = (id: string): Segment => {
	const s = TL.segments.find((x) => x.id === id);
	if (!s) throw new Error(`no segment ${id}`);
	return s;
};

export const segmentAt = (f: number) => TL.segments.find((s) => f >= s.start && f < s.end) ?? null;

export const pieceAt = (f: number) => {
	for (const s of TL.segments) for (const p of s.pieces) if (f >= p.start && f < p.end) return p;
	return null;
};

export const chunkIndexAt = (f: number) => TL.chunks.findIndex((c) => f >= c.start && f < c.end);

/** Output frame at which `word` (nth occurrence, case-insensitive, punctuation ignored) is spoken in a segment. */
export const wordFrame = (segId: string, word: string, nth = 0): number => {
	const clean = (t: string) => t.toLowerCase().replace(/[^a-z0-9']/g, '');
	let n = 0;
	for (const c of TL.chunks) {
		if (c.seg !== segId) continue;
		for (const w of c.words) {
			if (clean(w.w) === clean(word)) {
				if (n === nth) return w.f;
				n++;
			}
		}
	}
	throw new Error(`word ${word} not found in ${segId}`);
};

/** Source (720x1280) -> output (1080x1920) mapping for the full-frame talking head. */
export const SRC_SCALE = TL.width / TL.srcWidth;
export const ORIGIN = {x: 360, y: 560};

export const toScreen = (x: number, y: number, zoom: number) => ({
	x: TL.width / 2 + (x - ORIGIN.x) * SRC_SCALE * zoom,
	y: ORIGIN.y * SRC_SCALE + (y - ORIGIN.y) * SRC_SCALE * zoom,
});

/** Zoom at an output frame, with a slow push inside each piece for life. */
export const zoomAt = (f: number) => {
	const r = row(f);
	if (!r) return 1;
	const p = pieceAt(f);
	const t = p ? (f - p.start) / Math.max(1, p.end - p.start) : 0;
	return r[3] * (1 + 0.025 * t);
};

/** Contiguous runs of the collage layout, so the collage can animate in. */
export const collageRuns: Array<[number, number]> = (() => {
	const runs: Array<[number, number]> = [];
	TL.frames.forEach((r, i) => {
		if (r[1] !== 'c') return;
		const last = runs[runs.length - 1];
		if (last && last[1] === i - 1) last[1] = i;
		else runs.push([i, i]);
	});
	return runs;
})();

export const collageRunAt = (f: number) => collageRuns.find(([a, b]) => f >= a && f <= b) ?? null;
