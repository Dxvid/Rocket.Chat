import { Meteor } from 'meteor/meteor';
import type { IUser } from '@rocket.chat/core-typings';
import type { FindCursor } from 'mongodb';
import type { FindPaginated } from '@rocket.chat/model-typings';
import { Users } from '@rocket.chat/models';

import { settings } from '../../app/settings/server';
import { getMessagesLayoutPreference } from '../../app/utils/lib/getMessagesLayoutPreference';

type FindUsersParam = {
	rid: string;
	status?: string;
	skip?: number;
	limit?: number;
	filter?: string;
	sort?: Record<string, any>;
};

export function findUsersOfRoom({
	rid,
	status,
	skip = 0,
	limit = 0,
	filter = '',
	sort = {},
}: FindUsersParam): FindPaginated<FindCursor<IUser>> {
	const options = {
		projection: {
			name: 1,
			username: 1,
			nickname: 1,
			status: 1,
			avatarETag: 1,
			_updatedAt: 1,
			federated: 1,
		},
		sort: {
			statusConnection: -1,
			...(sort || { [getMessagesLayoutPreference(Meteor.userId()) !== 'username' ? 'name' : 'username']: 1 }),
		},
		...(skip > 0 && { skip }),
		...(limit > 0 && { limit }),
	};

	const searchFields = settings.get<string>('Accounts_SearchFields').trim().split(',');

	return Users.findPaginatedByActiveUsersExcept(filter, undefined, options, searchFields, [
		{
			__rooms: rid,
			...(status && { status }),
		},
	]);
}
