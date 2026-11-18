import { createContext, useCallback, useContext, useState } from '@wordpress/element';

// Create context
export const TogglePanelBodyContext = createContext();

const addFlashClass = (target) => {
	const panelBodyEl = document.querySelectorAll('.sp-smart-team-block-panels');
	if (!panelBodyEl || !panelBodyEl.length) {
		return;
	}
	panelBodyEl.forEach((panel) => {
		panel.classList.toggle('sp-flash', Boolean(target));
	});
};

// Create a context provider components
export const TogglePanelBodyProvider = ({ children }) => {
	// const [ openPanel, setOpenPanel ] = useState( localStor.get() || '' );
	const [openPanel, setOpenPanel] = useState('general');

	const togglePanelBody = useCallback(
		(event = false, panel) => {
			// event?.stopPropagation?.();
			const panelName =
				'object' === typeof event
					? event?.target?.closest('.sp-panel-data')?.dataset?.component
					: event;
			const panelValue = panelName || panel;

			setOpenPanel(openPanel === panelValue && 'string' === typeof event ? '' : panelValue);
			addFlashClass(event.target);
		},
		[openPanel]
	);

	const contextValue = { openPanel, togglePanelBody };

	return (
		<TogglePanelBodyContext.Provider value={contextValue}>
			{children}
		</TogglePanelBodyContext.Provider>
	);
};

export const usePanelBodyContext = () => {
	const context = useContext(TogglePanelBodyContext);
	return context;
};
