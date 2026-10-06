import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {TL, chunkIndexAt, collageRunAt, row, segment, segmentAt, toScreen, wordFrame, zoomAt} from './lib/timeline';
import {C, FONT, pop, wob} from './lib/paper';
import {SrcFrame} from './components/Source';
import {Camera, Collage, MarkerNote, STICKER} from './components/Shots';
import {CaptionCard} from './components/Caption';
import {
	Checklist,
	LogoCard,
	MarkerStroke,
	PhoneStrip,
	RansomTitle,
	RidgeExplainer,
	RisingBars,
	SealBadge,
	Stamp,
	Sunburst,
	TexasMap,
} from './components/Graphics';
import {PaperTear} from './components/Transitions';
import {Paper} from './components/Paper';
import {EndCard} from './components/EndCard';

// ---------------------------------------------------------------------------
// Beat sheet: every graphic is keyed to the word that triggers it.
// ---------------------------------------------------------------------------
const W = wordFrame;
const S = (id: string) => segment(id);

const BEATS = {
	hook: 0,
	stampStandard: W('cold', 'standard'),
	texasBig: W('intro', 'Texas!') - 1,
	map: W('intro', 'build'),
	pin: W('intro', 'Frisco,'),
	upgradeNote: W('upgrade', 'upgrades'),
	sealUpgrade: W('upgrade', 'Texas'),
	hprArrow: W('hpr', 'High') + 2,
	ridgeNote: S('accessory').start + 4,
	nicely: W('accessory', 'nicely.'),
	explainer: W('difference', 'oftentimes'),
	explainerHp: W('difference', 'edge'),
	hpNote: W('difference', 'High'),
	smoothNote: W('difference', 'smooth'),
	tearOffNote: S('lessoften').start + 8,
	knownFor: W('lessoften', 'known'),
	apartNote: W('lessoften', 'apart'),
	bars: S('deduct').start,
	checklist: S('industry').start + 2,
	check1: W('industry', 'changing,', 0),
	check2: W('industry', 'changing,', 1),
	check3: W('industry', 'change'),
	sealTx: S('txproof').start,
	logo: W('txproof', 'High'),
	freeStamp: W('consult', 'complimentary'),
	inspectNote: W('consult', 'inspect'),
	phone: W('call', 'give') + 1,
};

const TEARS = [S('intro').start, S('accessory').start, S('lessoften').start, S('txproof').start, TL.endCardStart];

const inRange = (f: number, a: number, b: number) => f >= a && f < b;

/** Things drawn in SOURCE coordinates (they ride along with the punch-in zoom). */
const SourceSpace: React.FC<{f: number; seg: string}> = ({f, seg}) => {
	const sp = S(seg);
	return (
		<>
			{seg === 'hpr' ? (
				// covers the original editor's product card (bottom-left)
				<div style={{position: 'absolute', left: 144, top: 1100, transform: `translate(-50%, -50%) rotate(-5deg) scale(${pop(f - sp.start)})`}}>
					<Paper seed="ridgecap" color={C.kraft} texture="kraft" jagX={3} jagY={8} contentStyle={{padding: '8px 18px 4px', fontFamily: FONT.marker, fontSize: 34, color: C.ink, whiteSpace: 'nowrap', minWidth: 210, minHeight: 92, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						ridge cap ↑
					</Paper>
				</div>
			) : null}
			{seg === 'txproof' && f < sp.pieces[0].end + 2 ? (
				// covers the original editor's thumbnail sticker on her chest
				<SealBadge top="TEXAS PROOF" middle="ROOF" bottom="HIGH PERFORMANCE" x={360} y={688} size={210} local={f - sp.start} />
			) : null}
		</>
	);
};

export const HighProfileRidge: React.FC = () => {
	const f = useCurrentFrame();
	const isEnd = f >= TL.endCardStart;
	const r = row(f);
	const seg = segmentAt(f);
	const segId = seg?.id ?? 'end';
	const zoom = zoomAt(f);

	let scene: React.ReactNode = null;
	if (isEnd) {
		scene = <EndCard local={f - TL.endCardStart} />;
	} else if (r) {
		const [src, lay, , , topSrc] = r;
		if (lay === 'c') {
			const run = collageRunAt(f)!;
			const local = f - run[0];
			let label: React.ReactNode = null;
			if (segId === 'accessory') label = <MarkerNote text="the ridge ↓" x={760} y={300} local={f - BEATS.ridgeNote} rot={-6} />;
			if (segId === 'difference') {
				label = (
					<>
						<MarkerNote text="high profile ridge" x={540} y={660} local={f - BEATS.hpNote} rot={-3} size={70} />
						<MarkerNote text="smooth ✓" x={800} y={240} local={f - BEATS.smoothNote} rot={8} size={76} color="#7dff9a" />
					</>
				);
			}
			if (segId === 'lessoften' && f < BEATS.knownFor) label = <MarkerNote text="re-roof again? no thanks" x={540} y={660} local={f - BEATS.tearOffNote} rot={-3} size={60} />;
			if (segId === 'lessoften' && f > BEATS.knownFor) label = <MarkerNote text="not your average roofer" x={540} y={660} local={f - BEATS.apartNote} rot={-3} size={62} />;
			if (segId === 'consult') label = <MarkerNote text="free inspection ✓" x={540} y={660} local={f - BEATS.inspectNote} rot={-4} size={70} />;
			scene = <Collage src={src} topSrc={topSrc ?? src} local={local} frame={f} label={label} />;
		} else {
			const cold = segId === 'cold';
			const texasBehind = segId === 'intro' && inRange(f, BEATS.texasBig, BEATS.map + 4);
			const useCutout = cold || texasBehind;
			scene = (
				<AbsoluteFill>
					<Camera zoom={zoom}>
						<SrcFrame frame={src} style={cold ? {filter: 'grayscale(1) contrast(1.35) brightness(1.06)'} : undefined} />
					</Camera>
					{cold ? (
						<>
							<AbsoluteFill style={{background: 'rgba(244,236,221,0.18)', mixBlendMode: 'multiply'}} />
							<Sunburst x={540} y={toScreen(360, 330, zoom).y} r={1100} frame={f} />
						</>
					) : null}
					{texasBehind ? (
						<div
							style={{
								position: 'absolute',
								left: 540,
								top: 330,
								transform: `translate(-50%, -50%) rotate(-6deg) scale(${pop(f - BEATS.texasBig) * (1 + (f - BEATS.texasBig) * 0.002)})`,
								fontFamily: FONT.serifItalic,
								fontSize: 330,
								color: C.yellow,
								textShadow: `8px 8px 0 ${C.navy}, -3px -3px 0 #fff`,
								whiteSpace: 'nowrap',
							}}
						>
							Texas
						</div>
					) : null}
					{useCutout ? (
						<Camera zoom={zoom} style={{filter: cold ? STICKER : undefined}}>
							<SrcFrame frame={src} cutout />
						</Camera>
					) : null}
					<Camera zoom={zoom}>
						<SourceSpace f={f} seg={segId} />
					</Camera>
				</AbsoluteFill>
			);
		}
	}

	// ---- caption --------------------------------------------------------
	let caption: React.ReactNode = null;
	const ci = chunkIndexAt(f);
	if (!isEnd && r && ci >= 0) {
		const chunk = TL.chunks[ci];
		const [, lay, box] = r;
		let cx = 540;
		let cy = 1450;
		let minW = 520;
		let minH = 130;
		if (lay === 'c') {
			cy = 905;
		} else if (box) {
			const a = toScreen(box[0], box[1], zoom);
			const b = toScreen(box[2], box[3], zoom);
			cx = Math.min(560, Math.max(520, (a.x + b.x) / 2));
			cy = (a.y + b.y) / 2;
			minW = Math.min(1040, b.x - a.x + 90);
			minH = b.y - a.y + 56;
		}
		caption = <CaptionCard chunk={chunk} index={ci} frame={f} cx={cx} cy={cy} minW={minW} minH={minH} />;
	}

	// ---- overlays (front) -------------------------------------------------
	const fx: React.ReactNode[] = [];
	if (segId === 'cold') {
		fx.push(<RansomTitle key="hook" text="STOP RE-ROOFING EVERY FEW YEARS" x={540} y={270} local={f - BEATS.hook} size={92} seed="hook" maxWidth={1000} rot={-2} />);
		fx.push(<Stamp key="std" lines={['STANDARD', 'ROOFING?']} x={300} y={1000} local={f - BEATS.stampStandard} rot={-11} size={80} />);
		fx.push(<MarkerStroke key="x" d="M 140 880 L 470 1110 M 470 880 L 140 1120" local={f - BEATS.stampStandard - 5} dur={6} color={C.red} width={22} />);
	}
	if (segId === 'intro') {
		fx.push(<TexasMap key="map" x={560} y={170} w={400} local={f - BEATS.map} pinLocal={f - BEATS.pin} frame={f} />);
	}
	if (segId === 'upgrade') {
		fx.push(<MarkerNote key="up" text="★ upgrade" x={820} y={250} local={f - BEATS.upgradeNote} rot={-8} size={66} />);
		fx.push(<SealBadge key="seal" top="TEXAS PROOF" middle="ROOF" bottom="HIGH PERFORMANCE" x={250} y={330} size={360} local={f - BEATS.sealUpgrade} />);
	}
	if (segId === 'hpr') {
		fx.push(
			<MarkerStroke key="arr" d="M 860 640 C 900 900, 760 1150, 420 1380 M 420 1380 L 520 1370 M 420 1380 L 460 1290" local={f - BEATS.hprArrow} dur={8} width={16} />,
		);
	}
	if (segId === 'accessory' && f >= BEATS.nicely) {
		fx.push(<MarkerStroke key="chk" d="M 760 360 L 830 440 L 990 220" local={f - BEATS.nicely} dur={6} width={22} color="#7dff9a" />);
	}
	if (segId === 'difference' && r && r[1] === 'f' && f < BEATS.hpNote) {
		fx.push(<RidgeExplainer key="rx" local={f - BEATS.explainer} showHp={f - BEATS.explainerHp} frame={f} />);
	}
	if (segId === 'lessoften' && r && r[1] === 'f') {
		fx.push(<RansomTitle key="last" text="ROOFS THAT LAST" x={540} y={250} local={f - BEATS.knownFor} size={96} seed="last" rot={2} />);
	}
	if (segId === 'deduct') fx.push(<RisingBars key="bars" local={f - BEATS.bars} frame={f} />);
	if (segId === 'industry') {
		fx.push(
			<Checklist
				key="cl"
				local={f - BEATS.checklist}
				frame={f}
				items={[
					{label: 'INDUSTRY', note: 'changing ✓', at: BEATS.check1},
					{label: 'INSURANCE', note: 'changing ✓', at: BEATS.check2},
					{label: 'YOUR ROOF', note: 'next! →', at: BEATS.check3, color: C.blue},
				]}
			/>,
		);
	}
	if (segId === 'txproof' && f >= BEATS.logo) fx.push(<LogoCard key="logo" x={540} y={300} w={500} local={f - BEATS.logo} frame={f} />);
	if (segId === 'consult' && r && r[1] === 'f') {
		fx.push(<Stamp key="free" lines={['FREE', 'CONSULTATION']} x={540} y={330} local={f - BEATS.freeStamp} rot={-7} color={C.blue} size={86} />);
	}
	if (segId === 'call') fx.push(<PhoneStrip key="ph" x={540} y={400} local={f - BEATS.phone} frame={f} />);

	// ---- global finish: grain + vignette ----------------------------------
	const finish = (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)'}} />
			<AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.22}}>
				<Img
					src={staticFile('img/grain.png')}
					style={{width: 1080, height: 1920, transform: `translate(${wob('gx', f, 30, 2)}px, ${wob('gy', f, 30, 2)}px) scale(1.06)`}}
				/>
			</AbsoluteFill>
		</>
	);

	return (
		<AbsoluteFill style={{background: C.ink}}>
			{scene}
			{fx}
			{caption}
			{finish}
			{TEARS.map((t, i) => (
				<PaperTear key={i} frame={f} at={t} seed={`tear${i}`} color={i % 2 ? C.yellow : C.cream} />
			))}
			<Soundtrack />
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------------------
// Audio: isolated voice + generated music bed + paper foley
// ---------------------------------------------------------------------------
const Sfx: React.FC<{at: number; src: string; volume?: number}> = ({at, src, volume = 0.6}) =>
	at < 0 ? null : (
		<Sequence from={at} durationInFrames={40} layout="none">
			<Audio src={staticFile(src)} volume={volume} />
		</Sequence>
	);

const Soundtrack: React.FC = () => {
	const end = TL.endCardStart;
	const total = TL.totalFrames;
	const collageStarts = TL.frames
		.map((r, i) => (r[1] === 'c' && (i === 0 || TL.frames[i - 1][1] !== 'c') ? i : -1))
		.filter((i) => i >= 0);
	const segStarts = TL.segments.slice(1).map((s) => s.start).filter((s) => !TEARS.includes(s));
	return (
		<>
			<Audio src={staticFile('audio/voice.wav')} volume={1} />
			<Audio
				src={staticFile('audio/music.mp3')}
				volume={(fr) =>
					interpolate(fr, [0, 6, end - 10, end + 4, total - 18, total - 1], [0.0, 0.15, 0.15, 0.42, 0.42, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})
				}
			/>
			{TEARS.map((t, i) => (
				<Sfx key={`tear${i}`} at={t - 3} src={i % 2 ? 'sfx/rip2.mp3' : 'sfx/rip.mp3'} volume={0.55} />
			))}
			{segStarts.map((t, i) => (
				<Sfx key={`seg${i}`} at={t - 2} src="sfx/swish.mp3" volume={0.28} />
			))}
			{collageStarts.map((t, i) => (
				<Sfx key={`col${i}`} at={t} src="sfx/swish2.mp3" volume={0.35} />
			))}
			<Sfx at={BEATS.hook} src="sfx/snip.mp3" volume={0.5} />
			<Sfx at={BEATS.stampStandard} src="sfx/stamp.wav" volume={0.7} />
			<Sfx at={BEATS.stampStandard + 5} src="sfx/marker.mp3" volume={0.5} />
			<Sfx at={BEATS.texasBig} src="sfx/swish.mp3" volume={0.4} />
			<Sfx at={BEATS.map} src="sfx/swish2.mp3" volume={0.35} />
			<Sfx at={BEATS.pin} src="sfx/stamp.wav" volume={0.45} />
			<Sfx at={BEATS.upgradeNote} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.sealUpgrade} src="sfx/stamp.wav" volume={0.6} />
			<Sfx at={S('hpr').start} src="sfx/snip.mp3" volume={0.45} />
			<Sfx at={BEATS.hprArrow} src="sfx/marker.mp3" volume={0.45} />
			<Sfx at={BEATS.ridgeNote} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.nicely} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.explainer} src="sfx/swish2.mp3" volume={0.4} />
			<Sfx at={BEATS.hpNote} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.smoothNote} src="sfx/marker.mp3" volume={0.35} />
			<Sfx at={BEATS.tearOffNote} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.knownFor} src="sfx/snip.mp3" volume={0.45} />
			<Sfx at={BEATS.apartNote} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.bars} src="sfx/swish2.mp3" volume={0.4} />
			<Sfx at={BEATS.bars + 18} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.checklist} src="sfx/swish.mp3" volume={0.35} />
			<Sfx at={BEATS.check1} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.check2} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.check3} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.sealTx} src="sfx/stamp.wav" volume={0.5} />
			<Sfx at={BEATS.logo} src="sfx/stamp.wav" volume={0.6} />
			<Sfx at={BEATS.freeStamp} src="sfx/stamp.wav" volume={0.7} />
			<Sfx at={BEATS.inspectNote} src="sfx/marker.mp3" volume={0.4} />
			<Sfx at={BEATS.phone} src="sfx/stamp.wav" volume={0.55} />
			{/* end card assembly */}
			<Sfx at={end + 2} src="sfx/stamp.wav" volume={0.5} />
			<Sfx at={end + 8} src="sfx/snip.mp3" volume={0.45} />
			<Sfx at={end + 26} src="sfx/swish2.mp3" volume={0.4} />
			<Sfx at={end + 30} src="sfx/stamp.wav" volume={0.7} />
			<Sfx at={end + 40} src="sfx/swish.mp3" volume={0.4} />
			<Sfx at={end + 48} src="sfx/stamp.wav" volume={0.45} />
			<Sfx at={end + 60} src="sfx/marker.mp3" volume={0.4} />
		</>
	);
};
