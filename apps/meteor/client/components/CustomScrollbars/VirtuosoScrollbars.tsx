import type { ComponentProps, Ref } from 'react';
import React, { forwardRef } from 'react';

import CustomScrollbars from './CustomScrollbars';

type VirtuosoScrollbarsProps = ComponentProps<typeof CustomScrollbars>;

const VirtuosoScrollbars = forwardRef(function VirtuosoScrollbars(
	{ style, children, ...props }: VirtuosoScrollbarsProps,
	ref: Ref<HTMLDivElement>,
) {
	return (
		<CustomScrollbars style={style} ref={ref} renderView={(viewProps) => <div tabIndex={-1} {...viewProps} {...props} />}>
			{children}
		</CustomScrollbars>
	);
});

export default VirtuosoScrollbars;
