import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, outline, pop, wob} from '../lib/brand';
import {PhotoPrint, StarBurst, Sticker, Sun} from './Graphics';
import {LogoMark, Wordmark} from './Logo';

/** ~2.8 s CTA built only from their profile: logo, VENT DIFFERENT, since 2010, where to buy, link. */
export const EndCard: React.FC<{local: number; frame: number}> = ({local, frame}) => {
	const f = local;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #12355a 0%, ${C.navyDeep} 75%)`}}>
			<StarBurst x={540} y={1800} r={620} local={f + 10} frame={frame} color="#0f3253" />
			<Sticker x={560} y={1085} local={f - 10} rot={-5} seed="ec-photo" frame={frame} edge={C.lime}>
				<PhotoPrint src="img/vent_broll.jpg" w={540} h={290} bw />
			</Sticker>
			<Sticker x={850} y={935} local={f - 18} rot={10} seed="ec-sun" frame={frame} scale={0.62}>
				<Sun frame={frame} />
			</Sticker>

			{/* logo card */}
			<Sticker x={540} y={330} local={f + 20} rot={-2} seed="ec-logo" frame={frame}>
				<div style={{background: C.white, borderRadius: 26, padding: '26px 40px 30px', display: 'flex', alignItems: 'center', gap: 26}}>
					<LogoMark size={150} />
					<Wordmark width={500} />
				</div>
			</Sticker>

			{/* VENT DIFFERENT */}
			<div style={{position: 'absolute', left: 540, top: 640, transform: `translate(-50%, -50%) rotate(${-4 + wob('vd', frame, 0.5, 4)}deg) scale(${pop(f - 4)})`, textAlign: 'center'}}>
				<div style={{fontFamily: FONT.sansBlack, fontSize: 92, color: C.white, letterSpacing: 8, lineHeight: 1}}>VENT</div>
				<div style={{fontFamily: FONT.serif, fontSize: 190, color: C.limeHi, lineHeight: 0.95, textShadow: `8px 10px 0 #000a`}}>Different</div>
			</div>

			{/* since 2010 tag */}
			<Sticker x={225} y={870} local={f - 14} rot={-10} seed="ec-since" frame={frame}>
				<div style={{background: C.lime, borderRadius: 999, padding: '10px 30px', fontFamily: FONT.sansBlack, fontSize: 40, color: C.navy, letterSpacing: 2}}>SINCE 2010</div>
			</Sticker>

			{/* where to buy */}
			<div
				style={{
					position: 'absolute',
					left: 540,
					top: 1385,
					transform: `translate(-50%, -50%) scale(${pop(f - 24)})`,
					width: 940,
					textAlign: 'center',
					fontFamily: FONT.sans,
					fontWeight: 800,
					fontSize: 46,
					color: C.white,
					lineHeight: 1.2,
					textShadow: '0 4px 0 rgba(0,0,0,0.5)',
				}}
			>
				Available at roofing supply
				<br />
				stores &amp; <span style={{fontFamily: FONT.serif, fontWeight: 400, fontSize: 62, color: C.limeHi}}>Amazon</span>
			</div>
			<div style={{position: 'absolute', left: 540, top: 1500, transform: `translate(-50%, -50%) rotate(-1.5deg) scale(${pop(f - 30)})`, filter: outline('#fff', 5)}}>
				<div style={{background: C.lime, borderRadius: 999, padding: '12px 40px', fontFamily: FONT.sansBlack, fontSize: 44, color: C.navy, display: 'flex', alignItems: 'center', gap: 14}}>
					<svg width={40} height={40} viewBox="0 0 24 24">
						<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke={C.navy} strokeWidth={2.6} fill="none" strokeLinecap="round" />
					</svg>
					linktr.ee/4seasonsvents
				</div>
			</div>
		</AbsoluteFill>
	);
};
