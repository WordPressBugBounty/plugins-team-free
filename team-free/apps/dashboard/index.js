import { createRoot, render } from '@wordpress/element';
import './store';
import App from './App';
import './style.scss';

const mount = () => {
	const el = document.getElementById('sptp-admin-dashboard-wrapper');
	if (!el) {
		return;
	}
	if (typeof createRoot === 'function') {
		createRoot(el).render(<App />);
	} else if (typeof render === 'function') {
		render(<App />, el);
	}
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', mount);
} else {
	mount();
}
