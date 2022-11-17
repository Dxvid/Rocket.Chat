import { App, AppPermission } from '@rocket.chat/core-typings';

import { Apps } from '../../../../../app/apps/client/orchestrator';
import { handleAPIError } from './handleAPIError';
import { warnStatusChange } from './warnStatusChange';

type installAppProps = App & {
	permissionsGranted: AppPermission[];
};

export const installApp = async ({ id, name, marketplaceVersion, permissionsGranted }: installAppProps): Promise<void> => {
	try {
		const { status } = await Apps.installApp(id, marketplaceVersion, permissionsGranted);
		if (status) {
			warnStatusChange(name, status);
		}
	} catch (error) {
		handleAPIError(error);
	}
};
