import type { App } from '@rocket.chat/core-typings';
import React from 'react';

import { useAppQuery } from '../hooks/useAppQuery';
import InstalledAppDetailsPage from './InstalledAppDetailsPage';
import MarketplaceAppDetailsPage from './MarketplaceAppDetailsPage';
import SkeletonAppDetailsPage from './SkeletonAppDetailsPage';

type AppDetailsPageProps = {
	id: App['id'];
};

const AppDetailsPage = ({ id: appId }: AppDetailsPageProps) => {
	const { isLoading, isError, error, data: app } = useAppQuery(appId);

	if (isLoading) {
		return <SkeletonAppDetailsPage />;
	}

	if (isError) {
		throw error;
	}

	if (app.installed) {
		return <InstalledAppDetailsPage app={app} />;
	}

	return <MarketplaceAppDetailsPage app={app} />;
};

export default AppDetailsPage;
