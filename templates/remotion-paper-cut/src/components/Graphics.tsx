import React from 'react';
import {Img, random, staticFile} from 'remotion';
import {C, FONT, pop, tornClip, wob} from '../lib/paper';
import {Paper} from './Paper';

const PAPERS = [
	{bg: C.white, fg: C.ink, font: FONT.block},
	{bg: C.blue, fg: '#fff', font: FONT.heavy},
	{bg: C.yellow, fg: C.navy, font: FONT.serif},
	{bg: C.ink, fg: C.white, font: FONT.block},
	{bg: C.cream, fg: C.blue, font: FONT.serifItalic},
	{bg: C.navy, fg: C.yellow, font: FONT.heavy},
];

/** Ransom-note title: every letter cut from a different scrap, slapped down on twos. */
export const RansomTitle: React.FC<{
	text: string;
	x: number;
	y: number;
	local: number;
	size?: number;
	seed: string;
	maxWidth?: number;
	rot?: number;
	perLetter?: number;
	exit?: number;
}> = ({text, x, y, local, size = 110, seed, maxWidth = 1000, rot = 0, perLetter = 1, exit}) => {
	if (local < 0) return null;
	const words = text.split(' ');
	let li = 0;
	const out = exit !== undefined && exit >= 0 ? Math.max(0, 1 - exit / 5) : 1;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: maxWidth,
				transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${out})`,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				rowGap: 10,
				columnGap: size * 0.32,
			}}
		>
			{words.map((w, wi) => (
				<div key={wi} style={{display: 'flex', gap: 3}}>
					{w.split('').map((ch, ci) => {
						const idx = li++;
						const r = random(`${seed}-${idx}`);
						const p = PAPERS[Math.floor(r * PAPERS.length)];
						const appear = pop(local - idx * perLetter);
						if (appear === 0) return <div key={ci} style={{width: size * 0.62}} />;
						const tilt = (random(`${seed}-r${idx}`) - 0.5) * 14 + wob(`${seed}-w${idx}`, local, 1.6, 4);
						const dy = (random(`${seed}-y${idx}`) - 0.5) * size * 0.16;
						return (
							<Paper
								key={ci}
								seed={`${seed}-p${idx}`}
								color={p.bg}
								jagX={7}
								jagY={7}
								nx={6}
								ny={6}
								shadow={0.7}
								style={{transform: `translateY(${dy}px) rotate(${tilt}deg) scale(${appear})`}}
								contentStyle={{
									fontFamily: p.font,
									fontSize: size * (0.86 + random(`${seed}-s${idx}`) * 0.24),
									color: p.fg,
									lineHeight: 1,
									padding: `${size * 0.1}px ${size * 0.12}px ${size * 0.05}px`,
									textTransform: p.font === FONT.serifItalic ? 'none' : 'uppercase',
									minWidth: size * 0.5,
									textAlign: 'center',
								}}
							>
								{ch}
							</Paper>
						);
					})}
				</div>
			))}
		</div>
	);
};

/** Round seal badge with serrated paper edge, e.g. TEXAS PROOF ROOF. */
export const SealBadge: React.FC<{
	top: string;
	middle: string;
	bottom: string;
	x: number;
	y: number;
	size?: number;
	local: number;
	color?: string;
	ink?: string;
	exit?: number;
}> = ({top, middle, bottom, x, y, size = 330, local, color = C.yellow, ink = C.navy, exit}) => {
	if (local < 0) return null;
	const out = exit !== undefined && exit >= 0 ? Math.max(0, 1 - exit / 5) : 1;
	const s = pop(local) * out;
	const spin = -10 + wob('seal', local, 2.5, 4);
	const teeth = 28;
	const pts: string[] = [];
	for (let i = 0; i < teeth * 2; i++) {
		const a = (i / (teeth * 2)) * Math.PI * 2;
		const r = i % 2 ? 46 : 50;
		pts.push(`${(50 + Math.cos(a) * r).toFixed(2)}% ${(50 + Math.sin(a) * r).toFixed(2)}%`);
	}
	const id = `arc-${top.length}-${bottom.length}`;
	return (
		<div
			style={{
				position: 'absolute',
				left: x - size / 2,
				top: y - size / 2,
				width: size,
				height: size,
				transform: `rotate(${spin}deg) scale(${s})`,
				filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.35))',
			}}
		>
			<div style={{position: 'absolute', inset: 0, background: '#fff', clipPath: `polygon(${pts.join(',')})`}} />
			<div
				style={{
					position: 'absolute',
					inset: size * 0.035,
					background: color,
					backgroundImage: `url(${staticFile('img/paper-cream.jpg')})`,
					backgroundBlendMode: 'multiply',
					clipPath: `polygon(${pts.join(',')})`,
				}}
			/>
			<svg viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
				<defs>
					<path id={`${id}-t`} d="M 17 50 A 33 33 0 0 1 83 50" />
					<path id={`${id}-b`} d="M 14 50 A 36 36 0 0 0 86 50" />
				</defs>
				<circle cx="50" cy="50" r="39.5" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="2 1.4" />
				<circle cx="50" cy="50" r="27" fill={ink} />
				<text fontFamily={FONT.heavy} fontSize="8.6" fill={ink} letterSpacing="1.2">
					<textPath href={`#${id}-t`} startOffset="50%" textAnchor="middle">
						{top}
					</textPath>
				</text>
				<text fontFamily={FONT.heavy} fontSize="7" fill={ink} letterSpacing="0.4">
					<textPath href={`#${id}-b`} startOffset="50%" textAnchor="middle">
						{bottom}
					</textPath>
				</text>
				<text x="50" y="49" textAnchor="middle" fontFamily={FONT.block} fontSize="13" fill={C.yellow}>
					{middle}
				</text>
				<text x="50" y="62" textAnchor="middle" fontFamily={FONT.block} fontSize="9" fill="#fff">
					★ ★ ★
				</text>
			</svg>
		</div>
	);
};

/** Rubber stamp (distressed border + text) that slams down. */
export const Stamp: React.FC<{
	lines: string[];
	x: number;
	y: number;
	local: number;
	rot?: number;
	color?: string;
	size?: number;
	exit?: number;
}> = ({lines, x, y, local, rot = -9, color = C.red, size = 92, exit}) => {
	if (local < 0) return null;
	const out = exit !== undefined && exit >= 0 ? Math.max(0, 1 - exit / 5) : 1;
	const slam = local < 3 ? [2.2, 1.35, 0.94][local] : 1;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${slam * out})`,
				opacity: local < 1 ? 0.6 : 1,
			}}
		>
			<Paper
				seed={`stamp-${lines.join('')}`}
				color={C.white}
				jagX={1.5}
				jagY={4}
				shadow={0.8}
				contentStyle={{padding: '18px 24px'}}
			>
				<div
					style={{
						border: `8px solid ${color}`,
						borderRadius: 14,
						padding: '6px 26px 2px',
						color,
						fontFamily: FONT.block,
						fontSize: size,
						lineHeight: 1.02,
						textAlign: 'center',
						textTransform: 'uppercase',
						letterSpacing: 2,
						maskImage: `url(${staticFile('img/grain.png')})`,
						maskSize: '600px 1100px',
						WebkitMaskImage: `url(${staticFile('img/grain.png')})`,
						WebkitMaskSize: '600px 1100px',
					}}
				>
					{lines.map((l, i) => (
						<div key={i}>{l}</div>
					))}
				</div>
			</Paper>
		</div>
	);
};

/** Hand-drawn marker stroke that draws itself on (SVG path, stepped). */
export const MarkerStroke: React.FC<{
	d: string;
	local: number;
	dur?: number;
	color?: string;
	width?: number;
	viewBox?: string;
	style?: React.CSSProperties;
	len?: number;
}> = ({d, local, dur = 8, color = C.yellow, width = 12, viewBox = '0 0 1080 1920', style, len = 3000}) => {
	if (local < 0) return null;
	const t = Math.min(1, Math.floor(local / 2) * 2 / dur);
	return (
		<svg viewBox={viewBox} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, overflow: 'visible', ...style}}>
			<path
				d={d}
				fill="none"
				stroke="rgba(0,0,0,0.45)"
				strokeWidth={width}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={len}
				strokeDashoffset={len * (1 - t)}
				transform="translate(4 5)"
			/>
			<path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
		</svg>
	);
};

/** Paper sunburst (rays) used behind the cutout in the cold open. */
export const Sunburst: React.FC<{x: number; y: number; r: number; frame: number; color?: string}> = ({x, y, r, frame, color = C.yellow}) => {
	const rays = 18;
	const rotation = Math.floor(frame / 3) * 1.5;
	const pts: string[] = [];
	for (let i = 0; i < rays; i++) {
		const a0 = (i / rays) * Math.PI * 2;
		const a1 = ((i + 0.5) / rays) * Math.PI * 2;
		pts.push(`M ${x} ${y} L ${x + Math.cos(a0) * r} ${y + Math.sin(a0) * r} L ${x + Math.cos(a1) * r} ${y + Math.sin(a1) * r} Z`);
	}
	return (
		<svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: 1080, height: 1920}}>
			<g transform={`rotate(${rotation} ${x} ${y})`}>
				<path d={pts.join(' ')} fill={color} opacity={0.95} />
			</g>
		</svg>
	);
};

/** Approximate Texas outline (lon/lat -> local coords), cut from blue paper. */
const TX: Array<[number, number]> = [
	[-106.64, 31.99], [-103.06, 32.0], [-103.04, 36.5], [-100.0, 36.5], [-100.0, 34.56], [-99.2, 34.33],
	[-98.1, 34.13], [-97.0, 33.77], [-96.3, 33.75], [-95.3, 33.88], [-94.48, 33.64], [-94.04, 33.55],
	[-94.04, 32.0], [-93.75, 31.2], [-93.53, 30.4], [-93.85, 29.7], [-94.7, 29.35], [-95.6, 28.75],
	[-96.6, 28.3], [-97.2, 27.7], [-97.4, 26.9], [-97.15, 25.95], [-97.6, 26.0], [-98.3, 26.2],
	[-99.1, 26.5], [-99.5, 27.5], [-100.3, 28.3], [-100.8, 29.3], [-101.4, 29.77], [-102.4, 29.78],
	[-103.0, 29.0], [-103.6, 29.15], [-104.4, 29.6], [-104.9, 30.4], [-105.6, 31.1], [-106.2, 31.45],
];
const lonLat = (lon: number, lat: number, w: number) => {
	const k = w / 13.2;
	return [(lon + 106.8) * k, (36.7 - lat) * k * 1.12] as const;
};

export const TexasMap: React.FC<{x: number; y: number; w?: number; local: number; pinLocal: number; frame: number}> = ({
	x,
	y,
	w = 400,
	local,
	pinLocal,
	frame,
}) => {
	if (local < 0) return null;
	const s = pop(local);
	const d = TX.map(([lo, la], i) => {
		const [px, py] = lonLat(lo, la, w);
		return `${i ? 'L' : 'M'} ${px.toFixed(1)} ${py.toFixed(1)}`;
	}).join(' ') + ' Z';
	const [fx, fy] = lonLat(-96.82, 33.15, w);
	const h = w * 0.96;
	const pinDrop = pinLocal < 0 ? null : pinLocal < 4 ? [-80, -30, 6, 0][pinLocal] : 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: h,
				transform: `rotate(${-6 + wob('tx', frame, 1.2, 4)}deg) scale(${s})`,
				filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.4))',
			}}
		>
			<svg viewBox={`-12 -12 ${w + 24} ${h + 24}`} style={{position: 'absolute', left: -12, top: -12, width: w + 24, height: h + 24, overflow: 'visible'}}>
				<path d={d} fill="#fff" stroke="#fff" strokeWidth={16} strokeLinejoin="round" />
				<path d={d} fill={C.blue} />
				{pinDrop !== null ? (
					<g transform={`translate(${fx} ${fy + pinDrop})`}>
						<path d="M 0 0 C -18 -26 -26 -40 -26 -52 A 26 26 0 1 1 26 -52 C 26 -40 18 -26 0 0 Z" fill={C.yellow} stroke="#fff" strokeWidth={5} />
						<circle cx={0} cy={-52} r={9} fill={C.navy} />
					</g>
				) : null}
			</svg>
			{pinLocal >= 2 ? (
				<div
					style={{
						position: 'absolute',
						left: fx - 300,
						top: fy + 30,
						transform: `rotate(-8deg) scale(${pop(pinLocal - 2)})`,
						transformOrigin: 'right center',
					}}
				>
					<Paper seed="frisco" color={C.yellow} jagX={4} jagY={10} shadow={0.6} contentStyle={{padding: '6px 16px 2px', fontFamily: FONT.marker, fontSize: 46, color: C.navy, whiteSpace: 'nowrap'}}>
						Frisco, TX
					</Paper>
				</div>
			) : null}
		</div>
	);
};

/** HP logo on a torn white card. */
export const LogoCard: React.FC<{x: number; y: number; w?: number; local: number; rot?: number; frame: number; exit?: number}> = ({
	x,
	y,
	w = 520,
	local,
	rot = 3,
	frame,
	exit,
}) => {
	if (local < 0) return null;
	const out = exit !== undefined && exit >= 0 ? Math.max(0, 1 - exit / 5) : 1;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot + wob('logo', frame, 0.8, 4)}deg) scale(${pop(local) * out})`}}>
			<Paper seed="logo-card" color="#ffffff" texture="none" jagX={2} jagY={4} contentStyle={{padding: '26px 34px 22px'}}>
				<Img src={staticFile('img/hp-logo.png')} style={{width: w, display: 'block'}} />
			</Paper>
		</div>
	);
};

/** Paper explainer: roof ridge cross-sections, standard vs high profile. */
export const RidgeExplainer: React.FC<{local: number; showHp: number; frame: number; exit?: number}> = ({local, showHp, frame, exit}) => {
	if (local < 0) return null;
	const out = exit !== undefined && exit >= 0 ? Math.max(0, 1 - exit / 5) : 1;
	const roof = (cap: 'flat' | 'tall') => (
		<svg viewBox="0 0 400 260" style={{width: 400, height: 260, overflow: 'visible'}}>
			{/* sky-blue backing */}
			<path d="M 20 250 L 200 70 L 380 250 Z" fill="#fff" stroke="#fff" strokeWidth={14} strokeLinejoin="round" />
			<path d="M 20 250 L 200 70 L 380 250 Z" fill="#6f6a63" />
			{[0, 1, 2, 3, 4].map((i) => (
				<path key={i} d={`M ${40 + i * 18} ${230 - i * 34} L ${360 - i * 18} ${230 - i * 34}`} stroke="#57524c" strokeWidth={5} />
			))}
			{cap === 'flat' ? (
				<>
					<path d="M 160 112 L 200 72 L 240 112 L 232 120 L 200 88 L 168 120 Z" fill="#8a847c" stroke="#3a3632" strokeWidth={3} />
					<path d="M 232 120 L 240 112" stroke={C.red} strokeWidth={6} strokeLinecap="round" />
					<path d="M 160 112 L 168 120" stroke={C.red} strokeWidth={6} strokeLinecap="round" />
				</>
			) : (
				<>
					<path d="M 150 118 C 150 60, 250 60, 250 118 L 236 124 C 236 84, 164 84, 164 124 Z" fill="#4c4843" stroke="#2a2724" strokeWidth={3} />
					<path d="M 160 100 C 175 70, 225 70, 240 100" stroke="#77716a" strokeWidth={4} fill="none" />
				</>
			)}
		</svg>
	);
	return (
		<div
			style={{
				position: 'absolute',
				left: 540,
				top: 470,
				transform: `translate(-50%, -50%) rotate(${-1.5 + wob('rx', frame, 0.5, 4)}deg) scale(${pop(local) * out})`,
			}}
		>
			<Paper seed="explainer" color={C.cream} jagX={1.2} jagY={3} contentStyle={{padding: '30px 34px 26px', display: 'flex', gap: 26}}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					{roof('flat')}
					<div style={{fontFamily: FONT.block, fontSize: 54, color: C.ink, marginTop: 6}}>STANDARD RIDGE</div>
					<div style={{fontFamily: FONT.marker, fontSize: 40, color: C.red, marginTop: -4}}>edges show ✗</div>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						opacity: showHp >= 0 ? 1 : 0.15,
						transform: `scale(${showHp >= 0 ? pop(showHp) : 1})`,
					}}
				>
					{roof('tall')}
					<div style={{fontFamily: FONT.block, fontSize: 54, color: C.blue, marginTop: 6}}>HIGH PROFILE</div>
					<div style={{fontFamily: FONT.marker, fontSize: 40, color: '#1d8a3a', marginTop: -4}}>smooth finish ✓</div>
				</div>
			</Paper>
		</div>
	);
};

/** Paper bar chart: deductibles going up and up. */
export const RisingBars: React.FC<{local: number; frame: number; exit?: number}> = ({local, frame, exit}) => {
	if (local < 0) return null;
	const out = exit !== undefined && exit >= 0 ? Math.max(0, 1 - exit / 5) : 1;
	const bars = [0.35, 0.6, 1];
	return (
		<div style={{position: 'absolute', left: 540, top: 430, transform: `translate(-50%, -50%) rotate(${2 + wob('bars', frame, 0.6, 4)}deg) scale(${pop(local) * out})`}}>
			<Paper seed="bars" color={C.cream} jagX={1.5} jagY={3} contentStyle={{padding: '26px 40px 20px', width: 640}}>
				<div style={{fontFamily: FONT.block, fontSize: 64, color: C.ink, textAlign: 'center', lineHeight: 1}}>DEDUCTIBLES</div>
				<div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 46, height: 300, marginTop: 14, position: 'relative'}}>
					{bars.map((b, i) => {
						const grow = Math.min(1, Math.max(0, (Math.floor((local - 4 - i * 6) / 2) * 2) / 6));
						return (
							<div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'}}>
								{grow >= 1 ? <div style={{fontFamily: FONT.heavy, fontSize: 52, color: C.red}}>$</div> : null}
								<div
									style={{
										width: 118,
										height: 260 * b * grow,
										background: i === 2 ? C.red : C.kraft,
										backgroundImage: `url(${staticFile('img/paper-cream.jpg')})`,
										backgroundBlendMode: 'multiply',
										clipPath: tornClip(`bar${i}`, {jagX: 2, jagY: 3, edges: {t: true}}),
										boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
									}}
								/>
							</div>
						);
					})}
					<MarkerStroke
						d="M 40 270 C 200 230, 330 170, 560 40 M 560 40 L 500 44 M 560 40 L 540 96"
						viewBox="0 0 640 300"
						local={local - 18}
						dur={8}
						color={C.red}
						width={14}
						style={{width: 640, height: 300}}
						len={900}
					/>
				</div>
			</Paper>
		</div>
	);
};

/** Paper checklist: industry / insurance / your roof. */
export const Checklist: React.FC<{items: Array<{label: string; note: string; at: number; color?: string}>; local: number; frame: number; exit?: number}> = ({
	items,
	local,
	frame,
	exit,
}) => {
	if (local < 0) return null;
	const out = exit !== undefined && exit >= 0 ? Math.max(0, 1 - exit / 5) : 1;
	return (
		<div style={{position: 'absolute', left: 540, top: 330, transform: `translate(-50%, -50%) rotate(${3 + wob('check', frame, 0.6, 4)}deg) scale(${pop(local) * out})`}}>
			<Paper seed="checklist" color={C.cream} jagX={1.4} jagY={3} contentStyle={{padding: '24px 40px 18px', width: 720}}>
				{items.map((it, i) => {
					const l = frame - it.at;
					return (
						<div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 112, borderBottom: i < items.length - 1 ? '4px dashed rgba(20,20,20,0.18)' : undefined}}>
							<div style={{fontFamily: FONT.block, fontSize: 74, color: C.ink, opacity: l >= 0 ? 1 : 0.3}}>{it.label}</div>
							{l >= 0 ? (
								<div style={{fontFamily: FONT.marker, fontSize: 60, color: it.color ?? C.red, transform: `rotate(-6deg) scale(${pop(l)})`}}>{it.note}</div>
							) : null}
						</div>
					);
				})}
			</Paper>
		</div>
	);
};

/** Torn yellow strip with the phone number. */
export const PhoneStrip: React.FC<{x: number; y: number; local: number; frame: number; size?: number; rot?: number}> = ({x, y, local, frame, size = 104, rot = -3}) => {
	if (local < 0) return null;
	const ring = local < 18 ? wob('ring', frame, 4, 2) : 0;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot + ring}deg) scale(${pop(local)})`}}>
			<Paper seed="phone" color={C.yellow} jagX={1.2} jagY={8} contentStyle={{padding: '20px 44px 12px', display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap'}}>
				<svg viewBox="0 0 24 24" style={{width: size * 0.8, height: size * 0.8}}>
					<path
						fill={C.navy}
						d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8z"
					/>
				</svg>
				<span style={{fontFamily: FONT.block, fontSize: size, color: C.navy, letterSpacing: 1}}>(214) 396-7772</span>
			</Paper>
		</div>
	);
};
