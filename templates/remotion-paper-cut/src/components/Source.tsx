import React from 'react';
import {Freeze, OffthreadVideo, staticFile} from 'remotion';
import {TL} from '../lib/timeline';

/**
 * Shows exactly one frame of the source clip. Every video layer in the edit
 * computes its own source frame (jump cuts, frozen collage panels, cutouts),
 * so we freeze an OffthreadVideo on that frame instead of playing it.
 */
export const SrcFrame: React.FC<{
	frame: number;
	cutout?: boolean;
	style?: React.CSSProperties;
}> = ({frame, cutout, style}) => {
	// <Freeze> is clamped to the composition length, so freeze on a small
	// frame number and carry the rest in startFrom.
	const base = Math.floor(frame / 600) * 600;
	return (
	<Freeze frame={frame - base}>
		<OffthreadVideo
			src={staticFile(cutout ? 'video/cutout.webm' : 'video/source.mp4')}
			startFrom={base}
			muted
			transparent={cutout}
			style={{position: 'absolute', left: 0, top: 0, width: TL.srcWidth, height: TL.srcHeight, ...style}}
		/>
	</Freeze>
	);
};
