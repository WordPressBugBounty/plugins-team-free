import { __ } from '@wordpress/i18n';

const newMemberUrl = window.sptpBlocksEditor?.newMemberUrl || '';

/**
 * Editor-only banner shown while useMembers() is serving the bundled demo
 * members, so nobody mistakes the sample team for their own data.
 */
const DemoMembersNotice = () => (
	<div className="sp-smart-team-demo-notice">
		{__(
			"You're viewing sample team members to preview the card design and layout.",
			'team-free'
		)}{' '}
		{newMemberUrl ? (
			<a href={newMemberUrl} target="_blank" rel="noopener noreferrer">
				{__('Add Your Team Members', 'team-free')}
			</a>
		) : (
			__('Add Your Team Members', 'team-free')
		)}{' '}
		{__('to showcase your real team.', 'team-free')}
	</div>
);

export default DemoMembersNotice;
