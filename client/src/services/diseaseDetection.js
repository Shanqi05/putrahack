import { getInferenceUrl } from "../config/api";

export const predictDisease = async (file, topK = 3) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(getInferenceUrl(`/predict?top_k=${topK}`), {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        let message = "Disease prediction failed";
        try {
            const errorData = await response.json();
            message = errorData.detail || errorData.message || message;
        } catch {
            // Keep the fallback error message when the response is not JSON.
        }
        throw new Error(message);
    }

    return response.json();
};
