export const getApiData = (state) => state.apiData || {};
export const getDashboardInfo = (state) => state.apiData?.dashboardInfo || {};
export const isLoading = (state) => state.isLoading;
export const getError = (state) => state.error;
export const getSettings = (state) => state.apiData?.settings || {};
export const isSaving = (state) => !!state.isSaving;

export const getTemplates = (state) => state.templates?.templates || [];
export const getTemplatesTotalPages = (state) => state.templates?.total_pages || 0;
export const getTemplatesTotalItems = (state) => state.templates?.total_items || 0;
// Unfiltered library size — drives the first-run banner and the table chrome.
export const getTemplatesLibraryCount = (state) => state.templates?.library_count || 0;
export const hasResolvedTemplates = (state) => undefined !== state.templates?.library_count;
export const isTemplatesLoading = (state) => !!state.templatesLoading;

// Settings page groups — classic `_sptp_settings` keys, served by the REST bootstrap.
export const getPerformanceSettings = (state) => state.apiData?.performance || {};
export const getAdvancedSettings = (state) => state.apiData?.advanced || {};
export const getCustomCodeSettings = (state) => state.apiData?.customCode || {};
export const getSinglePageSettings = (state) => state.apiData?.singlePage || {};
// White Label Branding drawer — the custom labels.
// Settings → Accessibility — the carousel's screen-reader messages.
export const getAccessibilitySettings = (state) => state.apiData?.accessibility || {};
// Preloader module drawer — min loading time, style, spinner.
export const getPreloaderSettings = (state) => state.apiData?.preloader || {};
export const getWhiteLabelSettings = (state) => state.apiData?.whiteLabel || {};
// Public AI settings — null while the AI Team Builder module is off.
export const getAISettings = (state) => state.apiData?.ai ?? null;
// Opt-in diagnostic data consent — its own `sptp_diagnostics` option, not `_sptp_settings`.
export const getDiagnostics = (state) => state.apiData?.diagnostics || {};
// Template editor link, block-theme flag and layout thumbnails for Single Page.
export const getSinglePageMeta = (state) => state.apiData?.settingsMeta?.singlePage || {};
// Defaults for the panels' Reset, so JS keeps no second copy of them.
export const getSettingsMeta = (state) => state.apiData?.settingsMeta || {};
// Published teams, for Tools → Export → Selected Team.
export const getGenerators = (state) => state.apiData?.generators || [];
