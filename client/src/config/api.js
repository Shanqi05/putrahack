const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || 'https://triplegain-api-pm67.onrender.com'
);

export const INFERENCE_API_BASE_URL = trimTrailingSlash(
    import.meta.env.VITE_INFERENCE_API_BASE_URL || API_BASE_URL
);

export const getApiUrl = (endpoint = '') => {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}/api${normalizedEndpoint}`;
};

export const getInferenceUrl = (endpoint = '') => {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${INFERENCE_API_BASE_URL}${normalizedEndpoint}`;
};
