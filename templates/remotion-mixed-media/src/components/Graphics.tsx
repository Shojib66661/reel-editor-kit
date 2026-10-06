import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, FONT, outline, pop, popOut, prog2, wob} from '../lib/brand';
import {LogoMark} from './Logo';

/** Positions a sticker: pop-in, optional pop-out, stop-motion wobble, white outline. */
export const Sticker: React.FC<{
	x: number;
	y: number;
	local: number;
	out?: number;
	rot?: number;
	seed: string;
	frame: number;
	scale?: number;
	edge?: string | false;
	children: React.ReactNode;
}> = ({x, y, local, out, rot = 0, seed, frame, scale = 1, edge = '#ffffff', children}) => {
	if (local < 0) return null;
	const s = pop(local) * (out !== undefined ? popOut(out) : 1);
	if (s <= 0) return null;
	const r = rot + wob(seed, frame, 1.6, 4);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) rotate(${r}deg) scale(${s * scale})`,
				filter: edge ? outline(edge, 6) : undefined,
			}}
		>
			{children}
		</div>
	);
};

/** Navy 10-point star burst behind the subject (the reference's red star, in brand navy). */
export const StarBurst: React.FC<{x: number; y: number; r: number; local: number; frame: number; color?: string}> = ({x, y, r, local, frame, color = C.navy}) => {
	if (local < 0) return null;
	const pts: string[] = [];
	const n = 10;
	for (let i = 0; i < n * 2; i++) {
		const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
		const rr = i % 2 ? r * 0.56 : r;
		pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
	}
	const spin = Math.floor(frame / 3) * 0.6;
	return (
		<div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `scale(${pop(local)}) rotate(${spin}deg)`, filter: outline(C.lime, 7, false)}}>
			<svg width={r * 2} height={r * 2} viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`}>
				<polygon points={pts.join(' ')} fill={color} />
			</svg>
		</div>
	);
};

/** Giant italic serif word placed BEHIND the person (cutout drawn on top). */
export const BehindWord: React.FC<{text: string; x: number; y: number; size: number; local: number; frame: number; rot?: number; color?: string}> = ({
	text,
	x,
	y,
	size,
	local,
	frame,
	rot = -4,
	color = C.limeHi,
}) => {
	if (local < 0) return null;
	// letters slap on one by one (on ones), whole word drifts slowly
	const n = Math.min(text.length, local + 1);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) rotate(${rot + wob('bw' + text, frame, 0.5, 4)}deg) scale(${1 + local * 0.0015})`,
				fontFamily: FONT.serif,
				fontSize: size,
				lineHeight: 0.9,
				color,
				whiteSpace: 'nowrap',
				textShadow: `10px 12px 0 ${C.navy}`,
				letterSpacing: -size * 0.02,
			}}
		>
			{text.split('').map((ch, i) => (
				<span key={i} style={{opacity: i < n ? 1 : 0, display: 'inline-block', transform: `scale(${pop(local - i)})`}}>
					{ch === ' ' ? ' ' : ch}
				</span>
			))}
		</div>
	);
};

/** Hand-drawn marker path that draws itself on twos. */
export const MarkerStroke: React.FC<{d: string; local: number; dur?: number; color?: string; width?: number; len?: number}> = ({
	d,
	local,
	dur = 8,
	color = C.limeHi,
	width = 14,
	len = 3000,
}) => {
	if (local < 0) return null;
	const t = prog2(local, dur);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 4px 0 rgba(6,24,43,0.7))'}}>
			<path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
		</svg>
	);
};

/** Handwritten note on a small white tag. */
export const HandTag: React.FC<{text: string; size?: number; color?: string; bg?: string; strike?: number}> = ({text, size = 64, color = C.navy, bg = C.white, strike}) => (
	<div style={{position: 'relative', background: bg, padding: '6px 26px 2px', borderRadius: 10, fontFamily: FONT.hand, fontSize: size, color, whiteSpace: 'nowrap'}}>
		{text}
		{strike !== undefined && strike >= 0 ? (
			<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', left: 0, top: 0}}>
				<path d="M 6 72 L 94 30" stroke={C.warn} strokeWidth={9} strokeLinecap="round" vectorEffect="non-scaling-stroke" strokeDasharray={140} strokeDashoffset={140 * (1 - prog2(strike, 4))} pathLength={140} />
				<path d="M 8 28 L 92 74" stroke={C.warn} strokeWidth={9} strokeLinecap="round" vectorEffect="non-scaling-stroke" strokeDasharray={140} strokeDashoffset={140 * (1 - prog2(strike - 3, 4))} pathLength={140} />
			</svg>
		) : null}
	</div>
);

/** Little house with a thought bubble ("most homeowners think..."). */
export const HouseThink: React.FC<{size?: number}> = ({size = 220}) => (
	<svg width={size} height={size} viewBox="0 0 200 200">
		<path d="M 30 110 L 90 58 L 150 110 Z" fill={C.navy} />
		<rect x={46} y={106} width={88} height={70} fill={C.white} stroke={C.navy} strokeWidth={6} />
		<rect x={80} y={134} width={22} height={42} fill={C.lime} />
		<rect x={108} y={120} width={18} height={16} fill={C.water} />
		<circle cx={150} cy={46} r={30} fill={C.white} stroke={C.navy} strokeWidth={5} />
		<circle cx={128} cy={84} r={7} fill={C.white} stroke={C.navy} strokeWidth={4} />
		<text x={150} y={60} textAnchor="middle" fontFamily="Playfair Italic" fontSize={44} fill={C.navy}>
			?
		</text>
	</svg>
);

/** Cut-paper attic cross-section: heat waves + moisture drops appear on cue. */
export const AtticDiagram: React.FC<{heat: number; moist: number; frame: number}> = ({heat, moist, frame}) => {
	const w = 560;
	const h = 400;
	const waves = [150, 250, 350, 450];
	const drops = [
		[190, 250],
		[300, 225],
		[400, 260],
		[250, 300],
		[360, 305],
	];
	const rise = (frame % 24) / 24;
	return (
		<div style={{width: w, height: h, position: 'relative'}}>
			<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
				{/* roof */}
				<path d={`M 10 230 L ${w / 2} 30 L ${w - 10} 230 Z`} fill={C.navy} />
				{/* attic space */}
				<path d={`M 70 224 L ${w / 2} 72 L ${w - 70} 224 Z`} fill="#2a3f57" />
				{/* shingle lines */}
				{[60, 100, 140, 180].map((y) => (
					<path key={y} d={`M ${w / 2 - (y - 30) * 1.35} ${y} L ${w / 2 + (y - 30) * 1.35} ${y}`} stroke="#1c3554" strokeWidth={0} />
				))}
				{/* house body */}
				<rect x={70} y={224} width={w - 140} height={160} fill={C.white} />
				<rect x={70} y={224} width={w - 140} height={14} fill={C.wood} />
				<rect x={120} y={268} width={70} height={60} fill={C.water} opacity={0.75} />
				<rect x={w - 190} y={268} width={70} height={60} fill={C.water} opacity={0.75} />
				<rect x={w / 2 - 34} y={290} width={68} height={94} fill={C.lime} />
				<text x={w / 2} y={160} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={30} letterSpacing={4} fill={C.white} opacity={0.9}>
					ATTIC
				</text>
				{/* heat waves */}
				{heat >= 0
					? waves.map((x, i) => {
							const t = prog2(heat - i * 2, 6);
							const y0 = 215 - rise * 10;
							return (
								<path
									key={i}
									d={`M ${x - 40 + 40} ${y0} c -18 -16, 18 -26, 0 -42 c -18 -16, 18 -26, 0 -42`}
									transform={`translate(${(x - 300) * -0.15} 0)`}
									fill="none"
									stroke={C.heat}
									strokeWidth={9}
									strokeLinecap="round"
									strokeDasharray={200}
									strokeDashoffset={200 * (1 - t)}
								/>
							);
						})
					: null}
				{/* moisture drops */}
				{moist >= 0
					? drops.map(([x, y], i) => {
							const s = pop(moist - i * 2);
							return s > 0 ? (
								<path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M 0 -22 C 10 -6, 14 2, 14 8 A 14 14 0 0 1 -14 8 C -14 2, -10 -6, 0 -22 Z" fill={C.water} stroke="#fff" strokeWidth={3} />
							) : null;
						})
					: null}
			</svg>
		</div>
	);
};

const MoldIcon = () => (
	<svg width={120} height={110} viewBox="0 0 120 110">
		{[
			[40, 50, 26],
			[72, 40, 20],
			[78, 72, 24],
			[46, 80, 16],
			[22, 72, 12],
			[96, 52, 10],
		].map(([x, y, r], i) => (
			<circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#5d6b3c' : C.mold} />
		))}
		{[
			[34, 44],
			[70, 36],
			[80, 70],
			[50, 82],
		].map(([x, y], i) => (
			<circle key={i} cx={x} cy={y} r={4} fill="#3e4a26" />
		))}
	</svg>
);

const WoodIcon = () => (
	<svg width={150} height={110} viewBox="0 0 150 110">
		<rect x={8} y={30} width={134} height={50} rx={6} fill={C.wood} />
		{[44, 56, 68].map((y) => (
			<path key={y} d={`M 14 ${y} C 50 ${y - 6}, 90 ${y + 6}, 136 ${y}`} stroke="#8a5a30" strokeWidth={3} fill="none" />
		))}
		<path d="M 60 30 L 72 52 L 64 60 L 78 80" stroke="#3b2412" strokeWidth={6} fill="none" strokeLinejoin="round" />
		<path d="M 100 30 L 92 46 L 104 56" stroke="#3b2412" strokeWidth={5} fill="none" strokeLinejoin="round" />
	</svg>
);

const LifespanIcon = () => (
	<svg width={140} height={110} viewBox="0 0 140 110">
		<path d="M 10 70 L 60 26 L 110 70 Z" fill={C.navy} />
		<rect x={24} y={68} width={72} height={36} fill={C.white} stroke={C.navy} strokeWidth={5} />
		<path d="M 118 20 L 118 86 M 102 70 L 118 88 L 134 70" stroke={C.warn} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

/** One damage card: icon + label on white. */
export const DamageCard: React.FC<{kind: 'mold' | 'wood' | 'life'; label: string}> = ({kind, label}) => (
	<div style={{background: C.white, borderRadius: 18, padding: '14px 20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 230}}>
		{kind === 'mold' ? <MoldIcon /> : kind === 'wood' ? <WoodIcon /> : <LifespanIcon />}
		<div style={{fontFamily: FONT.sansBlack, fontSize: 34, color: C.navy, marginTop: 4, letterSpacing: 1, textAlign: 'center', lineHeight: 1.05, whiteSpace: 'pre'}}>{label}</div>
	</div>
);

/** Sun doodle (solar), rays turn on threes. */
export const Sun: React.FC<{size?: number; frame: number}> = ({size = 230, frame}) => {
	const rot = Math.floor(frame / 3) * 7;
	return (
		<svg width={size} height={size} viewBox="-100 -100 200 200">
			<g transform={`rotate(${rot})`}>
				{Array.from({length: 12}).map((_, i) => (
					<path key={i} d="M 0 -62 L 9 -92 L -9 -92 Z" transform={`rotate(${i * 30})`} fill="#ffd23f" stroke={C.navy} strokeWidth={4} strokeLinejoin="round" />
				))}
			</g>
			<circle r={52} fill="#ffd23f" stroke={C.navy} strokeWidth={5} />
			<path d="M -20 8 C -10 24, 10 24, 20 8" stroke={C.navy} strokeWidth={6} fill="none" strokeLinecap="round" />
			<circle cx={-18} cy={-10} r={6} fill={C.navy} />
			<circle cx={18} cy={-10} r={6} fill={C.navy} />
		</svg>
	);
};

/** Wavy hot-air lines rising (screen space). */
export const HeatRise: React.FC<{x: number; y: number; local: number; frame: number; height?: number}> = ({x, y, local, frame, height = 520}) => {
	if (local < 0) return null;
	const lines = [-70, 0, 70];
	const scroll = (Math.floor(frame / 2) * 2 * 6) % 80;
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 4px 0 rgba(6,24,43,0.6))'}}>
			{lines.map((dx, i) => {
				let d = `M ${x + dx} ${y + scroll}`;
				for (let k = 0; k < height / 80 + 1; k++) d += ` c 26 -20, -26 -40, 0 -${80}`;
				const t = prog2(local - i * 2, 10);
				return (
					<g key={i}>
						<path d={d} fill="none" stroke={C.heat} strokeWidth={13} strokeLinecap="round" strokeDasharray={1400} strokeDashoffset={1400 * (1 - t)} />
					</g>
				);
			})}
			{/* arrow heads at the top */}
			{local > 8
				? lines.map((dx, i) => (
						<path key={i} d={`M ${x + dx - 26} ${y - height + 30} L ${x + dx} ${y - height} L ${x + dx + 26} ${y - height + 30}`} stroke={C.heat} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					))
				: null}
		</svg>
	);
};

/** Hydro bill sticker: bill with an up-arrow that gets crossed out. */
export const BillSticker: React.FC<{cross: number}> = ({cross}) => (
	<div style={{position: 'relative', width: 230, height: 290, background: C.white, borderRadius: 12, padding: 18, boxSizing: 'border-box'}}>
		<div style={{fontFamily: FONT.sansBlack, fontSize: 30, color: C.navy, letterSpacing: 1}}>HYDRO</div>
		<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 22, color: '#7b8794'}}>BILL</div>
		{[0, 1, 2].map((i) => (
			<div key={i} style={{height: 10, background: '#d9dee3', borderRadius: 5, margin: '12px 0', width: `${90 - i * 18}%`}} />
		))}
		<svg width={120} height={110} viewBox="0 0 120 110" style={{position: 'absolute', right: 14, bottom: 14}}>
			<text x={10} y={90} fontFamily="Montserrat Black" fontSize={80} fill={C.navy}>
				$
			</text>
			<path d="M 92 92 L 92 22 M 72 42 L 92 20 L 112 42" stroke={C.warn} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
		{cross >= 0 ? (
			<svg width={230} height={290} viewBox="0 0 230 290" style={{position: 'absolute', left: 0, top: 0}}>
				<path d="M 20 30 L 210 260" stroke={C.lime} strokeWidth={20} strokeLinecap="round" strokeDasharray={300} strokeDashoffset={300 * (1 - prog2(cross, 4))} />
				<path d="M 210 30 L 20 260" stroke={C.lime} strokeWidth={20} strokeLinecap="round" strokeDasharray={300} strokeDashoffset={300 * (1 - prog2(cross - 3, 4))} />
			</svg>
		) : null}
	</div>
);

/** Shield with the 4SEASONS leaf mark ("protect your roof"). */
export const ShieldMark: React.FC<{size?: number}> = ({size = 260}) => (
	<div style={{position: 'relative', width: size, height: size * 1.15}}>
		<svg width={size} height={size * 1.15} viewBox="0 0 200 230" style={{position: 'absolute', left: 0, top: 0}}>
			<path d="M 100 8 L 186 38 C 186 120, 160 188, 100 222 C 40 188, 14 120, 14 38 Z" fill={C.lime} />
			<path d="M 100 24 L 172 49 C 170 118, 148 174, 100 204 C 52 174, 30 118, 28 49 Z" fill={C.navy} />
		</svg>
		<LogoMark size={size * 0.62} style={{position: 'absolute', left: size * 0.19, top: size * 0.2}} />
	</div>
);

/** A photo print with white border and a strip of tape. */
export const PhotoPrint: React.FC<{src: string; w: number; h: number; bw?: boolean}> = ({src, w, h, bw}) => (
	<div style={{position: 'relative', background: C.white, padding: 14, paddingBottom: 18}}>
		<Img src={staticFile(src)} style={{width: w, height: h, objectFit: 'cover', display: 'block', filter: bw ? 'grayscale(1) contrast(1.2)' : 'saturate(1.1) contrast(1.05)'}} />
		<div style={{position: 'absolute', left: '50%', top: -20, width: 150, height: 42, marginLeft: -75, background: 'rgba(232,226,200,0.85)', transform: 'rotate(-4deg)'}} />
	</div>
);
