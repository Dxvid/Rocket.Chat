import type { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Contextualbar } from '../../../../components/Contextualbar';
import PruneMessages from './PruneMessages';

export default {
	title: 'Room/Contextual Bar/PruneMessages',
	component: PruneMessages,
	parameters: {
		layout: 'fullscreen',
		actions: { argTypesRegex: '^on.*' },
	},
	decorators: [
		(fn) => {
			const methods = useForm({
				defaultValues: {
					pinned: true,
				},
			});

			return (
				<FormProvider {...methods}>
					<Contextualbar height='100vh'>{fn()}</Contextualbar>
				</FormProvider>
			);
		},
	],
} satisfies Meta<typeof PruneMessages>;

const Template: StoryFn<typeof PruneMessages> = (args) => <PruneMessages {...args} />;

export const Default = Template.bind({});

export const WithCallout = Template.bind({});
WithCallout.args = {
	callOutText: 'This is a callout',
};
