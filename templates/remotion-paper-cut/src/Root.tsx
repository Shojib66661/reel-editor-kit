import React from 'react';
import {Composition, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {HighProfileRidge} from './HighProfileRidge';
import {TL} from './lib/timeline';

const fonts: Array<[string, string]> = [
	['Anton', 'fonts/Anton.woff2'],
	['Archivo Black', 'fonts/ArchivoBlack.woff2'],
	['DM Serif Display', 'fonts/DMSerif.woff2'],
	['DM Serif Italic', 'fonts/DMSerifItalic.woff2'],
	['Permanent Marker', 'fonts/PermanentMarker.woff2'],
];
for (const [family, file] of fonts) loadFont({family, url: staticFile(file)});

export const RemotionRoot: React.FC = () => (
	<Composition
		id="HighProfileRidge"
		component={HighProfileRidge}
		durationInFrames={TL.totalFrames}
		fps={TL.fps}
		width={TL.width}
		height={TL.height}
	/>
);
