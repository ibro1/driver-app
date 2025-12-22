import { useState, useEffect } from "react";
import { Alert, View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useUser } from "@/lib/auth-context";
import { getOnboardingStatus, saveStep1city, saveStep2Profile, saveStep3Vehicle, completeOnboarding } from "@/lib/onboarding-api";
import Step1City from "@/components/Onboarding/Step1City";
import Step2Profile from "@/components/Onboarding/Step2Profile";
import Step3Vehicle from "@/components/Onboarding/Step3Vehicle";

const Onboarding = () => {
    const { user } = useUser();
    const [step, setStep] = useState(0); // 0 = loading
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await getOnboardingStatus();
            if (res.driver) {
                setData(res.driver); // Assuming driver object matches what steps expect roughly
                setStep(res.onboardingStep || 1);
            } else {
                setStep(1);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load progress");
        } finally {
            setLoading(false);
        }
    };

    const handleStep1 = async (stepData: any) => {
        setLoading(true);
        try {
            const res = await saveStep1city(stepData.city);
            if (res.success) {
                setData({ ...data, ...stepData });
                setStep(2);
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = async (stepData: any) => {
        setLoading(true);
        try {
            const res = await saveStep2Profile(stepData);
            if (res.success) {
                setData({ ...data, ...stepData });
                setStep(3);
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStep3 = async (stepData: any) => {
        setLoading(true);
        try {
            const res = await saveStep3Vehicle(stepData);
            if (res.success) {
                // Finalize
                await completeOnboarding();
                Alert.alert("Success", "Application submitted for review!");
                router.replace("/(root)/(tabs)/home");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && step === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0286FF" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Progress Bar (Simple) */}
            <View className="flex-row h-1 bg-neutral-100 mx-5 mt-2 mb-5">
                <View className={`h-full bg-primary-500 ${step >= 1 ? "w-1/3" : "w-0"}`} />
                <View className={`h-full bg-primary-500 ${step >= 2 ? "w-1/3" : "w-0"}`} />
                <View className={`h-full bg-primary-500 ${step >= 3 ? "w-1/3" : "w-0"}`} />
            </View>

            <KeyboardAwareScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 50 }}>
                {step === 1 && (
                    <Step1City
                        initialData={data}
                        onNext={handleStep1}
                        loading={loading}
                    />
                )}
                {step === 2 && (
                    <Step2Profile
                        initialData={data}
                        onNext={handleStep2}
                        onBack={() => setStep(1)}
                        loading={loading}
                    />
                )}
                {step === 3 && (
                    <Step3Vehicle
                        initialData={data}
                        onNext={handleStep3}
                        onBack={() => setStep(2)}
                        loading={loading}
                    />
                )}
                {step > 3 && (
                    <View className="flex-1 justify-center items-center mt-20">
                        <Text className="text-xl font-JakartaBold">Application Under Review</Text>
                        <Text className="text-gray-500 mt-2 text-center">Your application is currently being reviewed by our team.</Text>
                        <Text className="text-primary-500 mt-5" onPress={() => router.replace("/(root)/(tabs)/home")}>Go to Dashboard</Text>
                    </View>
                )}
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default Onboarding;
