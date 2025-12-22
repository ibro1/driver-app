import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const getHeaders = async () => {
    const token = await SecureStore.getItemAsync("session_token");
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
    };
};

export const getOnboardingStatus = async () => {
    const response = await fetch(`${API_URL}/api/driver/onboarding/status`, {
        method: "GET",
        headers: await getHeaders(),
    });
    return await response.json();
};

export const saveStep1city = async (city: string) => {
    const response = await fetch(`${API_URL}/api/driver/onboarding/step-1`, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify({ city }),
    });
    return await response.json();
};

export const saveStep2Profile = async (data: any) => {
    const response = await fetch(`${API_URL}/api/driver/onboarding/step-2`, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify(data),
    });
    return await response.json();
};

export const saveStep3Vehicle = async (data: any) => {
    const response = await fetch(`${API_URL}/api/driver/onboarding/step-3`, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify(data),
    });
    return await response.json();
};

export const completeOnboarding = async () => {
    const response = await fetch(`${API_URL}/api/driver/onboarding/complete`, {
        method: "POST",
        headers: await getHeaders(),
    });
    return await response.json();
};
