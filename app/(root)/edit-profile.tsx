import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { useFetch } from "@/lib/fetch";
import { useUser } from "@/lib/auth-context";
import Skeleton from "@/components/Skeleton";

const EditProfile = () => {
    const { user } = useUser();
    const { data: profileData, loading: loadingData } = useFetch<any>("/api/driver/profile");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log("EditProfile: profileData changed", JSON.stringify(profileData, null, 2));
        if (profileData?.driver) {
            console.log("EditProfile: Setting form with", profileData.driver);
            setForm({
                firstName: profileData.driver.firstName || "",
                lastName: profileData.driver.lastName || "",
                phone: profileData.driver.phone || "",
                email: user?.email || "",
            });
        }
    }, [profileData, user]);

    const handleUpdate = async () => {
        if (!form.firstName || !form.lastName) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await import("expo-secure-store").then(s => s.getItemAsync("session_token"));
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/driver/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update profile");
            }

            Alert.alert("Success", "Profile updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <ScrollView className="px-5">
                    <Text className="text-2xl font-JakartaBold my-5">Edit Profile</Text>

                    <View className="mb-5">
                        <Skeleton width={100} height={20} style={{ marginBottom: 8 }} />
                        <Skeleton height={50} borderRadius={50} />
                    </View>
                    <View className="mb-5">
                        <Skeleton width={100} height={20} style={{ marginBottom: 8 }} />
                        <Skeleton height={50} borderRadius={50} />
                    </View>
                    <View className="mb-5">
                        <Skeleton width={100} height={20} style={{ marginBottom: 8 }} />
                        <Skeleton height={50} borderRadius={50} />
                    </View>
                    <View className="mb-5">
                        <Skeleton width={100} height={20} style={{ marginBottom: 8 }} />
                        <Skeleton height={50} borderRadius={50} />
                    </View>
                    <Skeleton height={50} borderRadius={50} style={{ marginTop: 24 }} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-2xl font-JakartaBold my-5">Edit Profile</Text>

                <InputField
                    label="First Name"
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChangeText={(text) => setForm({ ...form, firstName: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Last Name"
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChangeText={(text) => setForm({ ...form, lastName: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Email"
                    placeholder="Email address"
                    value={form.email}
                    editable={false}
                    containerStyle="bg-neutral-100 opacity-50"
                />

                <InputField
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={form.phone}
                    editable={false}
                    containerStyle="bg-neutral-100 opacity-50"
                />

                <CustomButton
                    title="Save Changes"
                    onPress={handleUpdate}
                    className="mt-6"
                    loading={isSubmitting}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfile;
