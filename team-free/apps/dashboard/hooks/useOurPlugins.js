/**
 * Loads ShapedPlugin's other free plugins for the Our Plugins cards, once per mount.
 */
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';

const OUR_PLUGINS_ROUTE = '/sptp/v1/our-plugins';

const useOurPlugins = () => {
	const [state, setState] = useState({ status: 'loading', plugins: [] }); // loading | loaded | error

	useEffect(() => {
		let active = true;

		apiFetch({ path: OUR_PLUGINS_ROUTE })
			.then((response) => {
				if (active) {
					setState({ status: 'loaded', plugins: response?.plugins || [] });
				}
			})
			.catch(() => {
				if (active) {
					setState({ status: 'error', plugins: [] });
				}
			});

		return () => {
			active = false;
		};
	}, []);

	return state;
};

export default useOurPlugins;
