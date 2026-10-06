import React from 'react';
import {C, FONT} from '../lib/brand';

/** Leaf + check mark (redrawn from the 4SEASONS profile logo). viewBox 0 0 200 200. */
const LeafCheck: React.FC<{color: string; vein: string}> = ({color, vein}) => (
	<>
		<path d="M 104 108 C 86 82, 96 44, 140 30 C 150 62, 140 98, 104 108 Z" fill={color} />
		<path d="M 106 102 C 116 80, 126 60, 138 38" stroke={vein} strokeWidth={5} fill="none" strokeLinecap="round" />
		<path d="M 62 104 L 94 152 L 108 112" stroke={color} strokeWidth={17} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</>
);

export const LogoMark: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
	<svg width={size} height={size} viewBox="0 0 200 200" style={style}>
		<circle cx={100} cy={100} r={99} fill={C.navy} />
		<circle cx={100} cy={100} r={80} fill="none" stroke={C.lime} strokeWidth={11} />
		<LeafCheck color={C.lime} vein={C.navy} />
	</svg>
);

/** The "O" of the wordmark: lime ring with the leaf inside. */
const RingO: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 200 200" style={{display: 'inline-block', verticalAlign: 'baseline', margin: `0 ${size * 0.02}px`}}>
		<circle cx={100} cy={100} r={84} fill="none" stroke={C.lime} strokeWidth={20} />
		<g transform="translate(100 100) scale(0.78) translate(-100 -100)">
			<LeafCheck color={C.lime} vein="#fff" />
		</g>
	</svg>
);

/** 4SEASONS wordmark: big "4", SEAS(O)NS, "solar powered vents" underneath. */
export const Wordmark: React.FC<{width: number; dark?: boolean}> = ({width, dark}) => {
	const u = width / 100;
	const ink = dark ? C.white : C.navy;
	return (
		<div style={{display: 'flex', alignItems: 'flex-end', width, fontFamily: FONT.sansBlack, color: ink, lineHeight: 0.8}}>
			<div style={{fontSize: 34 * u, letterSpacing: -1 * u, marginRight: 1 * u}}>4</div>
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<div style={{fontSize: 17.5 * u, letterSpacing: 0.2 * u, display: 'flex', alignItems: 'center'}}>
					SEAS
					<RingO size={15 * u} />
					NS
				</div>
				<div style={{fontFamily: FONT.sans, fontWeight: 400, fontSize: 7.4 * u, color: C.lime, marginTop: 1.6 * u, letterSpacing: 0.1 * u, lineHeight: 1}}>
					solar powered vents
				</div>
			</div>
		</div>
	);
};
