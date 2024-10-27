import { useRouteParameter, useRoute, usePermission } from '@rocket.chat/ui-contexts';
import React, { useState, useEffect } from 'react';

import PageSkeleton from '../../components/PageSkeleton';
import NotAuthorizedPage from '../notAuthorized/NotAuthorizedPage';
import AppDetailsPage from './AppDetailsPage';
import AppInstallPage from './AppInstallPage';
import AppsOrchestratorProvider from './AppsOrchestratorProvider';
import AppsPage from './AppsPage';
import BannerEnterpriseTrialEnded from './components/BannerEnterpriseTrialEnded';

const AppsRoute = () => {
	const [isLoading, setLoading] = useState(true);
	const marketplaceRoute = useRoute('marketplace');

	const context = useRouteParameter('context') || 'explore';
	const id = useRouteParameter('id');
	const page = useRouteParameter('page');

	const isAdminUser = usePermission('manage-apps');
	const canAccessMarketplace = usePermission('access-marketplace');

	if (!page) marketplaceRoute.push({ context, page: 'list' });

	useEffect(() => {
		let mounted = true;

		const initialize = async (): Promise<void> => {
			if (!mounted) {
				return;
			}

			setLoading(false);
		};

		initialize();

		return (): void => {
			mounted = false;
		};
	}, [marketplaceRoute, context]);

	if (
		(context === 'explore' || context === 'installed' || context === 'private' || context === 'premium') &&
		!canAccessMarketplace &&
		!isAdminUser
	) {
		return <NotAuthorizedPage />;
	}

	if ((context === 'requested' || page === 'install') && !isAdminUser) return <NotAuthorizedPage />;

	if (isLoading) {
		return <PageSkeleton />;
	}

	return (
		<AppsOrchestratorProvider>
			<BannerEnterpriseTrialEnded />
			{(page === 'list' && <AppsPage />) ||
				(id && page === 'info' && <AppDetailsPage id={id} />) ||
				(page === 'install' && <AppInstallPage />)}
		</AppsOrchestratorProvider>
	);
};

export default AppsRoute;
