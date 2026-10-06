import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {TL, chunkIndexAt, row, toScreen, wordFrame, zoomAt} from './lib/timeline';
import {C, outline, wob} from './lib/brand';
import {SrcFrame} from './components/Source';
import {Camera} from './components/Camera';
import {MixedCaption} from './components/Caption';
import {
	AtticDiagram,
	BehindWord,
	BillSticker,
	DamageCard,
	HandTag,
	HeatRise,
	HouseThink,
	MarkerStroke,
	PhotoPrint,
	ShieldMark,
	StarBurst,
	Sticker,
	Sun,
} from './components/Graphics';
import {LogoMark, Wordmark} from './components/Logo';
import {EndCard} from './components/EndCard';

// ---------------------------------------------------------------------------
// Beat sheet: every graphic is keyed to the word that triggers it.
// Output frames per shot (see scripts/edl.py SHOTS): A 0-38 hook talking head,
// B 38-64 roof B-roll, C 64-105, D 105-143 aerial, E 143-158, F 158-252 truck,
// G 252-345 street, H 345-440, I 440-477 vent, J 477-506, K 506-575 roof,
// L 575-652 talking head, M 652-730 aerial, end card 730+.
// ---------------------------------------------------------------------------
const W = wordFrame;
const BEATS = {
	rotPhoto: 20, // the original editor's "rotting wood" inset shows on source frames ~21-37
	homeowners: W('myth', 'homeowners'),
	shingles: W('myth', 'shingles'),
	not: W('myth', 'not.'),
	under: W('under', 'underneath'),
	attic: W('attic', 'attic'),
	heat: W('attic', 'heat'),
	moist: W('attic', 'moisture,'),
	mold: W('damage', 'mold,'),
	wood: W('damage', 'wood'),
	life: W('damage', 'lifespan'),
	solar: W('solar', 'solar'),
	pulling: W('pull', 'pulling'),
	hydro: W('hydro', "don't"),
	increase: W('hydro', 'increase'),
	protect: W('protect', 'Protect'),
	replace: W('protect', 'replace'),
};

const inRange = (f: number, a: number, b: number) => f >= a && f < b;

/** Moments where the world goes B&W and he becomes a colour sticker with a word behind him. */
const BW = [
	{a: 0, b: 38, word: 'Rotting', y: 600, size: 300, local0: -12, star: true},
	{a: BEATS.under, b: 252, word: 'underneath', y: 560, size: 205, local0: 0, star: false},
	{a: 602, b: 652, word: 'hydro bill', y: 520, size: 210, local0: 0, star: true},
];

export const AtticVents: React.FC = () => {
	const f = useCurrentFrame();
	const isEnd = f >= TL.endCardStart;
	const r = row(f);

	const zoom = zoomAt(f);
	const bw = BW.find((m) => inRange(f, m.a, m.b)) ?? null;

	// ---- scene -------------------------------------------------------------
	let scene: React.ReactNode = null;
	if (isEnd) {
		scene = <EndCard local={f - TL.endCardStart} frame={f} />;
	} else if (r) {
		const [src] = r;
		scene = (
			<AbsoluteFill>
				<Camera zoom={zoom}>
					<SrcFrame frame={src} style={bw ? {filter: 'grayscale(1) contrast(1.3) brightness(1.05)'} : {filter: 'saturate(1.05) contrast(1.04)'}} />
				</Camera>
				{bw ? (
					<>
						{bw.star ? <StarBurst x={540} y={toScreen(360, 700, zoom).y} r={460} local={f - bw.a - bw.local0} frame={f} /> : null}
						<BehindWord text={bw.word} x={540} y={bw.y} size={bw.size} local={f - bw.a - bw.local0} frame={f} />
						<Camera zoom={zoom} style={{filter: outline(C.lime, 5)}}>
							<SrcFrame frame={src} cutout />
						</Camera>
					</>
				) : null}
			</AbsoluteFill>
		);
	}

	// ---- graphics (in front of the video, behind the caption) ---------------
	const fx: React.ReactNode[] = [];
	if (inRange(f, BEATS.rotPhoto, 38)) {
		// covers the original "rotting wood" inset (source x 205-512, y 690-915) with our own print of it
		fx.push(
			<Sticker key="rot" x={540} y={1205} local={f - BEATS.rotPhoto} rot={-4} seed="rot" frame={f} edge={C.lime}>
				<PhotoPrint src="img/rot.jpg" w={500} h={330} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.homeowners, 105)) {
		fx.push(
			<Sticker key="house" x={810} y={430} local={f - BEATS.homeowners} rot={6} seed="house" frame={f}>
				<HouseThink size={250} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.shingles, 143)) {
		fx.push(<MarkerStroke key="circ" d="M 250 620 C 300 470, 820 450, 860 640 C 900 820, 360 900, 260 760 C 220 700, 260 640, 330 600" local={f - BEATS.shingles} dur={8} width={14} />);
	}
	if (inRange(f, BEATS.shingles + 4, 158)) {
		fx.push(
			<Sticker key="stag" x={330} y={430} local={f - BEATS.shingles - 4} rot={-7} seed="stag" frame={f}>
				<HandTag text="the shingles?" size={70} strike={f - BEATS.not} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.attic, 345)) {
		fx.push(
			<Sticker key="attic" x={540} y={470} local={f - BEATS.attic} rot={-2} seed="attic" frame={f} out={f - 342}>
				<AtticDiagram heat={f - BEATS.heat} moist={f - BEATS.moist} frame={f} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.mold, 440)) {
		const out = f - 437;
		fx.push(
			<Sticker key="mold" x={205} y={470} local={f - BEATS.mold} rot={-6} seed="dmold" frame={f} out={out}>
				<DamageCard kind="mold" label={'MOLD'} />
			</Sticker>,
			<Sticker key="wood" x={540} y={445} local={f - BEATS.wood} rot={3} seed="dwood" frame={f} out={out}>
				<DamageCard kind="wood" label={'WOOD\nDAMAGE'} />
			</Sticker>,
			<Sticker key="life" x={872} y={475} local={f - BEATS.life} rot={7} seed="dlife" frame={f} out={out}>
				<DamageCard kind="life" label={'SHORTER\nROOF LIFE'} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.solar, 506)) {
		fx.push(
			<Sticker key="sun" x={820} y={420} local={f - BEATS.solar} rot={8} seed="sun" frame={f}>
				<Sun size={260} frame={f} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.pulling, 575)) {
		fx.push(<HeatRise key="heat" x={770} y={960} local={f - BEATS.pulling} frame={f} height={480} />);
		fx.push(
			<Sticker key="hot" x={760} y={400} local={f - BEATS.pulling - 10} rot={-6} seed="hot" frame={f}>
				<HandTag text="hot air out!" size={70} color={C.heat} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.hydro, 652)) {
		fx.push(
			<Sticker key="bill" x={235} y={1330} local={f - BEATS.hydro} rot={-8} seed="bill" frame={f}>
				<BillSticker cross={f - BEATS.increase} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.protect, BEATS.replace + 2)) {
		fx.push(
			<Sticker key="shield" x={540} y={700} local={f - BEATS.protect} rot={-3} seed="shield" frame={f} out={f - BEATS.replace}>
				<ShieldMark size={300} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.replace - 6, TL.endCardStart)) {
		fx.push(
			<Sticker key="logo" x={540} y={330} local={f - BEATS.replace + 6} rot={-2} seed="ec-logo" frame={f}>
				<div style={{background: C.white, borderRadius: 26, padding: '26px 40px 30px', display: 'flex', alignItems: 'center', gap: 26}}>
					<LogoMark size={150} />
					<Wordmark width={500} />
				</div>
			</Sticker>,
		);
	}

	// ---- caption: always on the old caption strip (hides the inpaint smear) --
	let caption: React.ReactNode = null;
	const ci = chunkIndexAt(f);
	if (!isEnd && r && ci >= 0) {
		const chunk = TL.chunks[ci];
		const box = r[2];
		let cx = 540;
		let cy = toScreen(360, 715, zoom).y;
		let glow = null;
		if (box) {
			const a = toScreen(box[0], box[1], zoom);
			const b = toScreen(box[2], box[3], zoom);
			cx = Math.min(580, Math.max(500, (a.x + b.x) / 2));
			cy = (a.y + b.y) / 2;
			glow = {x0: a.x, y0: a.y, x1: b.x, y1: b.y};
		}
		const hideHero = !!bw && chunk.words.some((w) => w.emph && bw.word.toLowerCase().startsWith(w.w.toLowerCase().replace(/[^a-z]/g, '')));
		caption = <MixedCaption chunk={chunk} index={ci} frame={f} cx={cx} cy={cy} glow={glow} hideHero={hideHero} showAll={ci === 0} />;
	}

	// ---- finish: grain + vignette -------------------------------------------
	const finish = (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)'}} />
			<AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.2}}>
				<Img src={staticFile('img/grain.png')} style={{width: 1080, height: 1920, transform: `translate(${wob('gx', f, 30, 2)}px, ${wob('gy', f, 30, 2)}px) scale(1.06)`}} />
			</AbsoluteFill>
		</>
	);

	// lime flash frame into the end card
	const flash = f >= TL.endCardStart && f < TL.endCardStart + 2 ? <AbsoluteFill style={{background: C.lime, opacity: f === TL.endCardStart ? 0.9 : 0.4}} /> : null;

	return (
		<AbsoluteFill style={{background: C.navyDeep}}>
			{scene}
			{fx}
			{caption}
			{finish}
			{flash}
		</AbsoluteFill>
	);
};
