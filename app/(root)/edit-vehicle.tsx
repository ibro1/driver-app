import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { useFetch } from "@/lib/fetch";
import Skeleton from "@/components/Skeleton";

const EditVehicle = () => {
    const { data: profileData, loading: loadingData } = useFetch<any>("/api/driver/profile");

    const [form, setForm] = useState({
        make: "",
        model: "",
        year: "",
        color: "",
        plateNumber: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log("EditVehicle: profileData changed", JSON.stringify(profileData, null, 2));
        if (profileData?.vehicle) {
            console.log("EditVehicle: Setting form with", profileData.vehicle);
            setForm({
                make: profileData.vehicle.make || "",
                model: profileData.vehicle.model || "",
                year: profileData.vehicle.year?.toString() || "",
                color: profileData.vehicle.color || "",
                plateNumber: profileData.vehicle.plateNumber || "",
            });
        }
    }, [profileData]);

    const handleUpdate = async () => {
        if (!form.make || !form.model || !form.year || !form.color || !form.plateNumber) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await import("expo-secure-store").then(s => s.getItemAsync("session_token"));
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/driver/vehicle`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    year: parseInt(form.year),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update vehicle");
            }

            Alert.alert("Success", "Vehicle updated successfully", [
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
                    <Text className="text-2xl font-JakartaBold my-5">Edit Vehicle</Text>

                    {[1, 2, 3, 4, 5].map((i) => (
                        <View key={i} className="mb-5">
                            <Skeleton width={100} height={20} style={{ marginBottom: 8 }} />
                            <Skeleton height={50} borderRadius={50} />
                        </View>
                    ))}

                    <Skeleton height={50} borderRadius={50} style={{ marginTop: 24 }} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-2xl font-JakartaBold my-5">Edit Vehicle</Text>

                <InputField
                    label="Make"
                    placeholder="e.g. Toyota"
                    value={form.make}
                    onChangeText={(text) => setForm({ ...form, make: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Model"
                    placeholder="e.g. Camry"
                    value={form.model}
                    onChangeText={(text) => setForm({ ...form, model: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Year"
                    placeholder="e.g. 2020"
                    value={form.year}
                    onChangeText={(text) => setForm({ ...form, year: text })}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                />

                <InputField
                    label="Color"
                    placeholder="e.g. Silver"
                    value={form.color}
                    onChangeText={(text) => setForm({ ...form, color: text })}
                    editable={!isSubmitting}
                />

                <InputField
                    label="Plate Number"
                    placeholder="Enter plate number"
                    value={form.plateNumber}
                    onChangeText={(text) => setForm({ ...form, plateNumber: text })}
                    editable={!isSubmitting}
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

export default EditVehicle;
