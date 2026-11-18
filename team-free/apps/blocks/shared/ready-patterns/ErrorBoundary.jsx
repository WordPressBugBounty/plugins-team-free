import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Catches render errors inside the pattern library and offers retry.
 */
export default class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="sptp-ready-patterns-error">
					<p>{__('Something went wrong loading the pattern library.', 'team-free')}</p>
					<Button
						variant="secondary"
						onClick={() => {
							this.setState({ hasError: false });
							this.props.onRetry?.();
						}}
					>
						{__('Try again', 'team-free')}
					</Button>
				</div>
			);
		}

		return this.props.children;
	}
}
