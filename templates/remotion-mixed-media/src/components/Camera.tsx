import React from 'react';
import {SRC_SCALE, TL} from '../lib/timeline';

/** Places the 720x1280 source plane on screen with a punch-in zoom about source (360, 560). */
export const Camera: React.FC<{zoom: number; children: React.ReactNode; style?: React.CSSProperties}> = ({zoom, children, style}) => {
	const s = SRC_SCALE * zoom;
	const tx = TL.width / 2 - 360 * s;
	const ty = 840 - 840 * zoom;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: TL.srcWidth,
				height: TL.srcHeight,
				transformOrigin: '0 0',
				transform: `translate(${tx}px, ${ty}px) scale(${s})`,
				...style,
			}}
		>
			{children}
		</div>
	);
};
