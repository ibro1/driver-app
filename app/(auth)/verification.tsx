import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { useAuth } from "@/lib/auth-context";

const Verification = () => {
    const { phone } = useLocalSearchParams();
    const { verifyOtp, isLoaded } = useAuth();

    const [code, setCode] = useState({
        value: "",
        error: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);

    const onVerifyPress = useCallback(async () => {
        if (!isLoaded) return;
        if (!code.value || code.value.length < 6) {
            setCode({ ...code, error: "Please enter a valid 6-digit code" });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await verifyOtp(phone as string, code.value);

            if (response.success) {
                const isNew = response.isNewUser;
                setIsNewUser(!!isNew);

                if (isNew) {
                    setShowSuccessModal(true);
                } else {
                    // Existing user - login immediately without modal
                    router.replace("/(root)/(tabs)/home");
                }
            } else {
                setCode({
                    ...code,
                    error: response.error || "Verification failed"
                });
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setCode({
                ...code,
                error: err.message || "Failed to verify. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [isLoaded, code.value, phone, verifyOtp]);

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="relative w-full h-[250px]">
                    <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
                    <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
                        Verification
                    </Text>
                </View>

                <View className="p-5">
                    <Text className="font-Jakarta mb-5 text-base text-gray-500">
                        We've sent a verification code to {phone}.
                    </Text>

                    <InputField
                        label="Code"
                        icon={icons.lock}
                        placeholder="123456"
                        keyboardType="numeric"
                        value={code.value}
                        onChangeText={(value) => setCode({ value, error: "" })}
                    />

                    {code.error ? (
                        <Text className="text-red-500 text-sm mt-1">{code.error}</Text>
                    ) : null}

                    <CustomButton
                        title="Verify"
                        onPress={onVerifyPress}
                        className="mt-5 bg-success-500"
                        isLoading={isSubmitting}
                    />
                </View>

                <ReactNativeModal isVisible={showSuccessModal}>
                    <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                        <Image
                            source={images.check}
                            className="w-[110px] h-[110px] mx-auto my-5"
                        />
                        <Text className="text-3xl font-JakartaBold text-center">
                            Verified!
                        </Text>
                        <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                            You have successfully verified your account.
                        </Text>
                        <CustomButton
                            title="Continue"
                            onPress={() => {
                                setShowSuccessModal(false);
                                if (isNewUser) {
                                    router.replace("/(auth)/onboarding");
                                } else {
                                    router.replace("/(root)/(tabs)/home");
                                }
                            }}
                            className="mt-5"
                        />
                    </View>
                </ReactNativeModal>
            </View>
        </ScrollView>
    );
};

export default Verification;
