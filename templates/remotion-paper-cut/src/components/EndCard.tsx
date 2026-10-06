import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, pop, tornClip, wob} from '../lib/paper';
import {PaperDesk, STICKER} from './Shots';
import {SrcFrame} from './Source';
import {Paper} from './Paper';
import {LogoCard, PhoneStrip, RansomTitle, Stamp, Sunburst} from './Graphics';

/** 5 s paper-cut CTA: logo, headline, free consultation, phone, website, and her as a sticker. */
export const EndCard: React.FC<{local: number}> = ({local}) => {
	const f = local;
	// sticker of her smiling ("Hey Texas!" frame), cropped above the old caption
	const smile = 9 + (Math.floor(f / 3) % 6);
	const herIn = pop(f - 26);
	return (
		<AbsoluteFill>
			<PaperDesk kind="cream" />
			<div
				style={{
					position: 'absolute',
					left: -80,
					top: -60,
					width: 1240,
					height: 980,
					background: C.blue,
					transform: 'rotate(-7deg)',
					clipPath: tornClip('end-blue', {jagX: 0, jagY: 4, nx: 36, edges: {b: true}}),
					boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
				}}
			/>
			<Sunburst x={540} y={1720} r={760} frame={f} color="rgba(255,199,44,0.55)" />

			<LogoCard x={540} y={250} w={520} local={f - 2} rot={-3} frame={f} />
			<RansomTitle text="UPGRADE YOUR ROOF" x={540} y={590} local={f - 8} size={112} seed="end-title" maxWidth={940} perLetter={1} />
			<Stamp lines={['FREE', 'CONSULTATION']} x={540} y={850} local={f - 30} rot={-5} color={C.navy} size={78} />
			<PhoneStrip x={540} y={1060} local={f - 40} frame={f} size={98} rot={2} />
			{f >= 48 ? (
				<div style={{position: 'absolute', left: 540, top: 1210, transform: `translate(-50%, -50%) rotate(${-2 + wob('web', f, 0.6, 4)}deg) scale(${pop(f - 48)})`}}>
					<Paper seed="web" color={C.kraft} texture="kraft" jagX={2} jagY={8} contentStyle={{padding: '12px 36px 6px', fontFamily: FONT.heavy, fontSize: 60, color: C.ink}}>
						hprtexas.com
					</Paper>
				</div>
			) : null}

			{/* her, as a paper sticker peeking up from the bottom */}
			<div
				style={{
					position: 'absolute',
					left: 650 - 360 * 0.92,
					top: 1250 + (1 - herIn) * 600,
					width: 720 * 0.92,
					height: 760 * 0.92,
					overflow: 'hidden',
					clipPath: tornClip('her-bottom', {jagX: 0, jagY: 3, nx: 24, edges: {b: true}}),
				}}
			>
				<div style={{position: 'absolute', left: 0, top: -110 * 0.92, width: 720, height: 1280, transform: 'scale(0.92)', transformOrigin: '0 0', filter: STICKER}}>
					<SrcFrame frame={smile} cutout />
				</div>
			</div>
			{f >= 60 ? (
				<div
					style={{
						position: 'absolute',
						left: 40,
						top: 1330,
						transform: `rotate(-10deg) scale(${pop(f - 60)})`,
						fontFamily: FONT.marker,
						fontSize: 50,
						color: C.navy,
						lineHeight: 1.05,
					}}
				>
					North Texas
					<br />
					Residential &amp;
					<br />
					Commercial
				</div>
			) : null}
		</AbsoluteFill>
	);
};
