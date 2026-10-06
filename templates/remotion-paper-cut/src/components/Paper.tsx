import React from 'react';
import {staticFile} from 'remotion';
import {C, tornClip} from '../lib/paper';

type Edges = {t?: boolean; r?: boolean; b?: boolean; l?: boolean};

/**
 * A piece of torn paper: white fibrous rim + coloured face with paper texture
 * + soft cast shadow. Children are laid out on top of the face.
 */
export const Paper: React.FC<{
	seed: string;
	color?: string;
	texture?: 'cream' | 'kraft' | 'none';
	rim?: string | false;
	jagX?: number;
	jagY?: number;
	nx?: number;
	ny?: number;
	edges?: Edges;
	shadow?: number;
	style?: React.CSSProperties;
	contentStyle?: React.CSSProperties;
	children?: React.ReactNode;
}> = ({
	seed,
	color = C.white,
	texture = 'cream',
	rim = '#ffffff',
	jagX = 1.4,
	jagY = 6,
	nx,
	ny,
	edges,
	shadow = 1,
	style,
	contentStyle,
	children,
}) => {
	const outer = tornClip(seed, {jagX, jagY, nx, ny, edges});
	const inner = tornClip(`${seed}-in`, {jagX: jagX * 1.3, jagY: jagY * 1.3, nx, ny, edges, inset: jagX * 0.9});
	const tex = texture === 'none' ? undefined : `url(${staticFile(texture === 'kraft' ? 'img/kraft.jpg' : 'img/paper-cream.jpg')})`;
	return (
		<div
			style={{
				position: 'relative',
				filter: shadow
					? `drop-shadow(0 ${6 * shadow}px ${5 * shadow}px rgba(0,0,0,${0.32 * Math.min(1, shadow)})) drop-shadow(0 ${1.5 * shadow}px ${1 * shadow}px rgba(0,0,0,0.25))`
					: undefined,
				...style,
			}}
		>
			{rim ? <div style={{position: 'absolute', inset: 0, background: rim, clipPath: outer}} /> : null}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					clipPath: rim ? inner : outer,
					backgroundColor: color,
					backgroundImage: tex,
					backgroundSize: '1080px 1920px',
					backgroundBlendMode: 'multiply',
				}}
			/>
			<div style={{position: 'relative', ...contentStyle}}>{children}</div>
		</div>
	);
};

/** Strip of semi-transparent masking tape. */
export const Tape: React.FC<{x: number; y: number; w?: number; rot?: number; seed: string}> = ({x, y, w = 150, rot = 0, seed}) => (
	<div
		style={{
			position: 'absolute',
			left: x - w / 2,
			top: y - 22,
			width: w,
			height: 44,
			transform: `rotate(${rot}deg)`,
			background: 'rgba(238, 228, 196, 0.82)',
			clipPath: tornClip(seed, {jagX: 4, jagY: 0, nx: 4, ny: 6, edges: {l: true, r: true}}),
			boxShadow: '0 2px 3px rgba(0,0,0,0.15)',
		}}
	/>
);
