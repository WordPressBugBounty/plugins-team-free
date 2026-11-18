const DEFAULT_STATE = {
	apiData: {},
	isLoading: false,
	isSaving: false,
	error: null,
	templates: {},
	templatesLoading: false,
};

const reducer = (state = DEFAULT_STATE, action) => {
	switch (action.type) {
		case 'SET_API_DATA':
			return { ...state, apiData: action.data };
		case 'SET_LOADING':
			return { ...state, isLoading: action.isLoading };
		case 'SET_SAVING':
			return { ...state, isSaving: action.isSaving };
		case 'SET_ERROR':
			return { ...state, error: action.error };
		case 'SET_TEMPLATES':
			return { ...state, templates: action.templates };
		case 'SET_TEMPLATES_LOADING':
			return { ...state, templatesLoading: action.isLoading };
		default:
			return state;
	}
};

export default reducer;
