import React from 'react';
import {Chunk} from '../lib/timeline';
import {C, FONT, pop, wob} from '../lib/paper';
import {Paper} from './Paper';

const EMPH = ['yellow', 'blue', 'serif'] as const;

/** Reels-style captions drop commas and full stops. */
const clean = (t: string) => t.replace(/[.,]+$/, '');

/** One emphasised word: its own scrap of coloured paper or a big serif italic. */
const EmphWord: React.FC<{text: string; kind: (typeof EMPH)[number]; seed: string; spoken: boolean; size: number}> = ({
	text,
	kind,
	seed,
	spoken,
	size,
}) => {
	if (kind === 'serif') {
		return (
			<span
				style={{
					fontFamily: FONT.serifItalic,
					fontSize: size * 1.12,
					lineHeight: 0.95,
					color: C.blue,
					textTransform: 'none',
					letterSpacing: 0,
					opacity: spoken ? 1 : 0.55,
					margin: '0 4px',
					transform: 'translateY(-4px)',
					display: 'inline-block',
				}}
			>
				{text}
			</span>
		);
	}
	const bg = kind === 'yellow' ? C.yellow : C.blue;
	const fg = kind === 'yellow' ? C.navy : '#ffffff';
	return (
		<Paper
			seed={seed}
			color={bg}
			jagX={3}
			jagY={9}
			nx={10}
			ny={4}
			shadow={0.6}
			style={{display: 'inline-block', transform: `rotate(${(seed.length % 2 ? -1 : 1) * 2.5}deg)`, margin: '0 2px'}}
			contentStyle={{padding: '2px 16px 0', color: fg, opacity: spoken ? 1 : 0.6}}
		>
			{text}
		</Paper>
	);
};

/**
 * Caption card: a torn cream-paper strip carrying the current 1-4 words.
 * It is centred on (and at least as big as) the original burned-in caption so
 * that the old caption is always hidden underneath it.
 */
export const CaptionCard: React.FC<{
	chunk: Chunk;
	index: number;
	frame: number;
	cx: number;
	cy: number;
	minW: number;
	minH: number;
	size?: number;
}> = ({chunk, index, frame, cx, cy, minW, minH, size = 88}) => {
	const local = frame - chunk.start;
	const s = pop(local);
	const rot = (index % 2 ? -1.6 : 1.3) + wob(`cap${index}`, frame, 0.35, 4);
	let emphN = index;
	return (
		<div
			style={{
				position: 'absolute',
				left: cx,
				top: cy,
				transform: `translate(-50%, -50%) rotate(${rot}deg)`,
			}}
		>
			<Paper
				seed={`cap-${index}`}
				color={C.white}
				jagX={1.1}
				jagY={7}
				nx={22}
				ny={5}
				style={{minWidth: minW, minHeight: minH, maxWidth: 1010}}
				contentStyle={{
					minWidth: minW,
					minHeight: minH,
					maxWidth: 1010,
					boxSizing: 'border-box',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '18px 34px 14px',
					fontFamily: FONT.block,
					fontSize: size,
					lineHeight: 1.05,
					textTransform: 'uppercase',
					color: C.ink,
					letterSpacing: 0.5,
				}}
			>
				{/* the strip is full size from the first frame (it must hide the old caption); only the words pop */}
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'center',
						alignContent: 'center',
						columnGap: 16,
						rowGap: 4,
						transform: `scale(${s})`,
					}}
				>
				{chunk.words.map((w, i) => {
					const spoken = frame >= w.f - 1;
					if (w.emph) {
						const kind = EMPH[emphN++ % EMPH.length];
						return <EmphWord key={i} text={clean(w.w)} kind={kind} seed={`e${index}-${i}`} spoken={spoken} size={size} />;
					}
					return (
						<span key={i} style={{opacity: spoken ? 1 : 0.5}}>
							{clean(w.w)}
						</span>
					);
				})}
				</div>
			</Paper>
		</div>
	);
};
