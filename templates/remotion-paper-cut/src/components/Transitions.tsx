import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {C, tornClip} from '../lib/paper';

/**
 * Paper tear transition centred on `at`: a sheet of paper swipes in to cover
 * the cut, then rips in two and the halves fly apart (animated on twos).
 */
export const PaperTear: React.FC<{frame: number; at: number; color?: string; seed: string}> = ({frame, at, color = C.cream, seed}) => {
	const l = frame - at;
	if (l < -6 || l > 9) return null;
	const tex = `url(${staticFile('img/paper-cream.jpg')})`;
	const sheet: React.CSSProperties = {
		position: 'absolute',
		backgroundColor: color,
		backgroundImage: tex,
		backgroundBlendMode: 'multiply',
		backgroundSize: '1080px 1920px',
	};
	if (l < 0) {
		// sweep in from the right on twos
		const t = Math.floor((l + 6) / 2) * 2 / 6; // 0..1
		const x = (1 - t) * 1300;
		return (
			<AbsoluteFill style={{filter: 'drop-shadow(-14px 0 18px rgba(0,0,0,0.4))'}}>
				<div style={{...sheet, left: x - 60, top: -100, width: 1300, height: 2120, transform: 'rotate(4deg)', clipPath: tornClip(`${seed}-in`, {jagX: 4, jagY: 0, nx: 4, ny: 40, edges: {l: true}})}} />
			</AbsoluteFill>
		);
	}
	// rip: halves fly up and down
	const t = Math.floor(l / 2) * 2 / 8;
	const dy = t * t * 1300;
	const rot = t * 7;
	const rim = '#fff';
	const top = tornClip(`${seed}-rip`, {jagX: 0, jagY: 5, nx: 30, edges: {b: true}});
	const bot = tornClip(`${seed}-rip`, {jagX: 0, jagY: 5, nx: 30, edges: {t: true}});
	return (
		<AbsoluteFill style={{filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.45))'}}>
			<div style={{position: 'absolute', left: -60, top: -40 - dy, width: 1200, height: 1040, transform: `rotate(${-rot}deg)`}}>
				<div style={{position: 'absolute', inset: 0, background: rim, clipPath: top}} />
				<div style={{...sheet, inset: 0, bottom: 14, clipPath: top}} />
			</div>
			<div style={{position: 'absolute', left: -60, top: 940 + dy, width: 1200, height: 1060, transform: `rotate(${rot}deg)`}}>
				<div style={{position: 'absolute', inset: 0, background: rim, clipPath: bot}} />
				<div style={{...sheet, inset: 0, top: 14, clipPath: bot}} />
			</div>
		</AbsoluteFill>
	);
};

/** Quick white flash-frame + slight shake used on hard jump cuts. */
export const CutFlash: React.FC<{frame: number; at: number}> = ({frame, at}) => {
	const l = frame - at;
	if (l < 0 || l > 1) return null;
	return <AbsoluteFill style={{background: '#fff', opacity: l === 0 ? 0.35 : 0.12}} />;
};
