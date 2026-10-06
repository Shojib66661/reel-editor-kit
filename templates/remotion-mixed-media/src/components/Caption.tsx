import React from 'react';
import {Chunk} from '../lib/timeline';
import {C, FONT, pop, wob} from '../lib/brand';

/** Reels-style captions drop trailing commas and full stops. */
const clean = (t: string) => t.replace(/[.,]+$/, '');

/**
 * Mixed-media caption (after the reference): small white sans words with one
 * hero word in a big italic serif. Words appear as they are spoken.
 *
 * The old burned-in caption was inpainted away, but a soft smear stays on that
 * strip, so this caption always sits on it with a dark glow (`glow` box, screen px).
 */
export const MixedCaption: React.FC<{
	chunk: Chunk;
	index: number;
	frame: number;
	cx: number;
	cy: number;
	glow: {x0: number; y0: number; x1: number; y1: number} | null;
	hideHero?: boolean;
	showAll?: boolean;
	heroColor?: string;
}> = ({chunk, index, frame, cx, cy, glow, hideHero, showAll, heroColor = C.limeHi}) => {
	const rot = wob(`cap${index}`, frame, 0.6, 4);
	const words = hideHero ? chunk.words.filter((w) => !w.emph) : chunk.words;
	return (
		<>
			{glow ? (
				<div
					style={{
						position: 'absolute',
						left: glow.x0 - 110,
						top: glow.y0 - 70,
						width: glow.x1 - glow.x0 + 220,
						height: glow.y1 - glow.y0 + 140,
						background: 'radial-gradient(ellipse at center, rgba(6,24,43,0.5) 0%, rgba(6,24,43,0.4) 50%, rgba(6,24,43,0) 72%)',
						filter: 'blur(8px)',
					}}
				/>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: cx,
					top: cy,
					width: 960,
					transform: `translate(-50%, -50%) rotate(${rot}deg)`,
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					alignItems: 'baseline',
					columnGap: 18,
					rowGap: 0,
				}}
			>
				{words.map((w, i) => {
					const local = frame - w.f;
					// upcoming words show dimmed (keeps the cleaned strip covered), then pop when spoken
					const spoken = showAll || local >= -1;
					const s = spoken ? (showAll ? 1 : Math.max(0.85, pop(local + 1))) : 1;
					const common: React.CSSProperties = {
						display: 'inline-block',
						opacity: spoken ? 1 : 0.42,
						transform: `scale(${s})`,
						transformOrigin: '50% 80%',
					};
					if (w.emph) {
						return (
							<span
								key={i}
								style={{
									...common,
									fontFamily: FONT.serif,
									fontSize: 140,
									lineHeight: 1.0,
									color: heroColor,
									textShadow: `5px 6px 0 ${C.navy}, 0 0 26px rgba(0,0,0,0.45)`,
									letterSpacing: -1,
									padding: '0 4px',
								}}
							>
								{clean(w.w)}
							</span>
						);
					}
					return (
						<span
							key={i}
							style={{
								...common,
								fontFamily: FONT.sans,
								fontWeight: 800,
								fontSize: 76,
								lineHeight: 1.15,
								color: C.white,
								textShadow: '0 4px 0 rgba(6,24,43,0.85), 0 0 18px rgba(0,0,0,0.55)',
							}}
						>
							{clean(w.w)}
						</span>
					);
				})}
			</div>
		</>
	);
};
