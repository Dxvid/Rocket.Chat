import type {
	AtLeast,
	ILivechatContact,
	ILivechatContactChannel,
	ILivechatVisitor,
	RocketChatRecordDeleted,
} from '@rocket.chat/core-typings';
import type { FindPaginated, ILivechatContactsModel, InsertionModel } from '@rocket.chat/model-typings';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import type {
	Document,
	Collection,
	Db,
	RootFilterOperators,
	Filter,
	FindOptions,
	FindCursor,
	IndexDescription,
	UpdateResult,
} from 'mongodb';

import { BaseRaw } from './BaseRaw';

export class LivechatContactsRaw extends BaseRaw<ILivechatContact> implements ILivechatContactsModel {
	constructor(db: Db, trash?: Collection<RocketChatRecordDeleted<ILivechatContact>>) {
		super(db, 'livechat_contact', trash);
	}

	protected modelIndexes(): IndexDescription[] {
		return [
			{
				key: { name: 1 },
				unique: false,
				name: 'name_insensitive',
				collation: { locale: 'en', strength: 2, caseLevel: false },
			},
			{
				key: { emails: 1 },
				unique: false,
				name: 'emails_insensitive',
				partialFilterExpression: { emails: { $exists: true } },
				collation: { locale: 'en', strength: 2, caseLevel: false },
			},
			{
				key: { phones: 1 },
				partialFilterExpression: { phones: { $exists: true } },
				unique: false,
			},
		];
	}

	async insertContact(
		data: InsertionModel<Omit<ILivechatContact, 'createdAt'>> & { createdAt?: ILivechatContact['createdAt'] },
	): Promise<ILivechatContact['_id']> {
		const result = await this.insertOne({
			createdAt: new Date(),
			...data,
		});

		return result.insertedId;
	}

	async upsertContact(contactId: string, data: Partial<ILivechatContact>): Promise<ILivechatContact | null> {
		const result = await this.findOneAndUpdate(
			{ _id: contactId },
			{ $set: data, $setOnInsert: { createdAt: new Date() } },
			{ upsert: true },
		);
		return result.value;
	}

	async updateContact(contactId: string, data: Partial<ILivechatContact>): Promise<ILivechatContact> {
		const updatedValue = await this.findOneAndUpdate(
			{ _id: contactId },
			{ $set: { ...data, unknown: false } },
			{ returnDocument: 'after' },
		);
		return updatedValue.value as ILivechatContact;
	}

	findPaginatedContacts(searchText?: string, options?: FindOptions): FindPaginated<FindCursor<ILivechatContact>> {
		const searchRegex = escapeRegExp(searchText || '');
		const match: Filter<ILivechatContact & RootFilterOperators<ILivechatContact>> = {
			$or: [
				{ name: { $regex: searchRegex, $options: 'i' } },
				{ emails: { $regex: searchRegex, $options: 'i' } },
				{ phones: { $regex: searchRegex, $options: 'i' } },
			],
		};

		return this.findPaginated(
			{ ...match },
			{
				allowDiskUse: true,
				...options,
			},
		);
	}

	async findContactMatchingVisitor(visitor: AtLeast<ILivechatVisitor, 'visitorEmails' | 'phone'>): Promise<ILivechatContact | null> {
		const emails = visitor.visitorEmails?.map(({ address }) => address).filter((email) => Boolean(email)) || [];
		const phoneNumbers = visitor.phone?.map(({ phoneNumber }) => phoneNumber).filter((phone) => Boolean(phone)) || [];

		if (!emails?.length && !phoneNumbers?.length) {
			return null;
		}

		const query = {
			$and: [
				{
					$or: [...emails?.map((email) => ({ emails: email })), ...phoneNumbers?.map((phone) => ({ phones: phone }))],
				},
				{
					$or: [
						{
							channels: { $exists: false },
						},
						{
							channels: { $size: 0 },
						},
					],
				},
			],
		};

		return this.findOne(query);
	}

	async findOneByVisitorId<T extends Document = ILivechatContact>(
		visitorId: ILivechatVisitor['_id'],
		options: FindOptions<ILivechatContact> = {},
	): Promise<T | null> {
		const query = {
			'channels.visitorId': visitorId,
		};
		return this.findOne<T>(query, options);
	}

	async addChannel(contactId: string, channel: ILivechatContactChannel): Promise<void> {
		await this.updateOne({ _id: contactId }, { $push: { channels: channel } });
	}

	updateLastChatById(contactId: string, lastChat: ILivechatContact['lastChat']): Promise<UpdateResult> {
		return this.updateOne({ _id: contactId }, { $set: { lastChat } });
	}
}
