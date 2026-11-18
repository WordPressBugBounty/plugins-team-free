import { Button } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import './editor.scss';
import { DesktopIcon, MobileIcon, TabletIcon } from './icon';
import { useDeviceType } from '../../controls/controls';

const Responsive = () => {
	const Device = (e) => {
		const canvas = document.getElementsByClassName('edit-site-visual-editor__editor-canvas');
		if (canvas.length > 0) {
			dispatch('core/edit-site').__experimentalSetPreviewDeviceType(
				e.target.closest('button').value
			);
		} else {
			dispatch('core/edit-post').__experimentalSetPreviewDeviceType(
				e.target.closest('button').value
			);
		}
	};

	const deviceType = useDeviceType();

	const DeviceIcon = () => {
		if ('Desktop' === deviceType) {
			return <DesktopIcon />;
		}
		if ('Tablet' === deviceType) {
			return <TabletIcon />;
		}
		if ('Mobile' === deviceType) {
			return <MobileIcon />;
		}
	};

	return (
		<>
			<div className="sp-smart-team-responsive">
				<div className="sp-smart-team-units">
					<span aria-label="Change device preview">
						<DeviceIcon />
					</span>
					<div className="sp-smart-team-units-btn">
						<Button
							aria-label="Switch to desktop view"
							className={deviceType === 'Desktop' ? 'active' : ''}
							value={'Desktop'}
							onClick={Device}
						>
							<DesktopIcon />
						</Button>
						<Button
							aria-label="Switch to tablet view"
							className={deviceType === 'Tablet' ? 'active' : ''}
							value={'Tablet'}
							onClick={Device}
						>
							<TabletIcon />
						</Button>
						<Button
							aria-label="Switch to mobile view"
							className={deviceType === 'Mobile' ? 'active' : ''}
							value={'Mobile'}
							onClick={Device}
						>
							<MobileIcon />
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Responsive;
