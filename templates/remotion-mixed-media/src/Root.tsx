import React from 'react';
import {Composition, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {AtticVents} from './AtticVents';
import {TL} from './lib/timeline';

const fonts: Array<[string, string, string?]> = [
	['Montserrat', 'fonts/Montserrat800.woff2', '800'],
	['Montserrat', 'fonts/Montserrat400.woff2', '400'],
	['Montserrat Black', 'fonts/Montserrat900.woff2'],
	['Playfair Italic', 'fonts/PlayfairItalic800.woff2'],
	['Playfair Italic Mid', 'fonts/PlayfairItalic600.woff2'],
	['Caveat Brush', 'fonts/CaveatBrush.woff2'],
];
for (const [family, file, weight] of fonts) loadFont({family, url: staticFile(file), weight});

export const RemotionRoot: React.FC = () => (
	<Composition
		id="AtticVents"
		component={AtticVents}
		durationInFrames={TL.totalFrames}
		fps={TL.fps}
		width={TL.width}
		height={TL.height}
	/>
);
