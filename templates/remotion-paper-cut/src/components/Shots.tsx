import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {SRC_SCALE, TL} from '../lib/timeline';
import {C, FONT, pop, tornClip, wob} from '../lib/paper';
import {SrcFrame} from './Source';
import {Tape} from './Paper';

/** Places the 720x1280 source plane on screen with a punch-in zoom. */
export const Camera: React.FC<{zoom: number; children: React.ReactNode; style?: React.CSSProperties}> = ({zoom, children, style}) => {
	const s = SRC_SCALE * zoom;
	const tx = TL.width / 2 - 360 * s;
	const ty = 840 - 840 * zoom;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: TL.srcWidth,
				height: TL.srcHeight,
				transformOrigin: '0 0',
				transform: `translate(${tx}px, ${ty}px) scale(${s})`,
				...style,
			}}
		>
			{children}
		</div>
	);
};

/** White sticker outline around a transparent cutout (stacked hard drop-shadows). */
export const STICKER = [
	'drop-shadow(5px 0 0 #fff)',
	'drop-shadow(-5px 0 0 #fff)',
	'drop-shadow(0 5px 0 #fff)',
	'drop-shadow(0 -5px 0 #fff)',
	'drop-shadow(0 10px 10px rgba(0,0,0,0.35))',
].join(' ');

/** Paper desk background used behind collages and the end card. */
export const PaperDesk: React.FC<{kind?: 'kraft' | 'cream'}> = ({kind = 'kraft'}) => (
	<AbsoluteFill>
		<Img src={staticFile(kind === 'kraft' ? 'img/kraft.jpg' : 'img/paper-cream.jpg')} style={{width: '100%', height: '100%'}} />
	</AbsoluteFill>
);

/** A cropped region of the source shown as a torn photo print. */
const PhotoCard: React.FC<{
	srcFrame: number;
	crop: {y0: number; y1: number};
	width: number;
	x: number;
	y: number;
	rot: number;
	seed: string;
	tornEdge: 'top' | 'bottom';
}> = ({srcFrame, crop, width, x, y, rot, seed, tornEdge}) => {
	const sc = width / TL.srcWidth;
	const h = (crop.y1 - crop.y0) * sc;
	const border = 14;
	const edges = tornEdge === 'bottom' ? {b: true, l: false, r: false, t: false} : {t: true, l: false, r: false, b: false};
	return (
		<div
			style={{
				position: 'absolute',
				left: x - width / 2 - border,
				top: y,
				width: width + border * 2,
				height: h + border * 2,
				transform: `rotate(${rot}deg)`,
				filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.35)) drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
			}}
		>
			<div style={{position: 'absolute', inset: 0, background: C.white, clipPath: tornClip(seed, {jagY: 3, jagX: 0, nx: 30, edges})}} />
			<div
				style={{
					position: 'absolute',
					left: border,
					top: border,
					width,
					height: h,
					overflow: 'hidden',
					clipPath: tornClip(`${seed}-p`, {jagY: 4, jagX: 0, nx: 30, edges, inset: 0.5}),
				}}
			>
				<div style={{position: 'absolute', left: 0, top: -crop.y0 * sc, width: TL.srcWidth, height: TL.srcHeight, transform: `scale(${sc})`, transformOrigin: '0 0'}}>
					<SrcFrame frame={srcFrame} />
				</div>
			</div>
		</div>
	);
};

/**
 * Rebuilds the original split-screen (B-roll over talking head) as a paper
 * collage. The old caption sat on the seam (y 555-615), which is exactly what
 * we crop away, and our caption strip is laid over the gap instead.
 */
export const Collage: React.FC<{src: number; topSrc: number; local: number; frame: number; label?: React.ReactNode}> = ({
	src,
	topSrc,
	local,
	frame,
	label,
}) => {
	const inTop = pop(local);
	const inBot = pop(local - 2);
	return (
		<AbsoluteFill>
			<PaperDesk />
			<div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - inBot) * 300}px)`, opacity: inBot > 0 ? 1 : 0}}>
				<PhotoCard
					srcFrame={src}
					crop={{y0: 640, y1: 1280}}
					width={980}
					x={540}
					y={968}
					rot={1.4 + wob('cb', frame, 0.25, 4)}
					seed="collage-bottom"
					tornEdge="top"
				/>
			</div>
			<div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - inTop) * -300}px) rotate(${(1 - inTop) * -6}deg)`}}>
				<PhotoCard
					srcFrame={topSrc}
					crop={{y0: 0, y1: 500}}
					width={1000}
					x={540}
					y={118}
					rot={-2.2 + wob('ct', frame, 0.25, 4)}
					seed="collage-top"
					tornEdge="bottom"
				/>
				<Tape x={170} y={128} rot={-28} seed="t1" />
				<Tape x={918} y={112} rot={24} seed="t2" />
				{label}
			</div>
		</AbsoluteFill>
	);
};

/** Handwritten marker note. */
export const MarkerNote: React.FC<{
	text: string;
	x: number;
	y: number;
	rot?: number;
	size?: number;
	color?: string;
	local: number;
	align?: 'left' | 'center';
}> = ({text, x, y, rot = -4, size = 64, color = C.yellow, local, align = 'center'}) => {
	if (local < 0) return null;
	// write-on: reveal characters on twos
	const n = Math.min(text.length, Math.floor(local / 2) * 2 + 2);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%) rotate(${rot}deg)`,
				fontFamily: FONT.marker,
				fontSize: size,
				color,
				whiteSpace: 'pre',
				textShadow: '3px 3px 0 rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6)',
			}}
		>
			{text.slice(0, n)}
			<span style={{opacity: 0}}>{text.slice(n)}</span>
		</div>
	);
};
