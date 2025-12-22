import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { registerDriver } from "@/lib/auth-api";
import { useUser } from "@/lib/auth-context";

const Onboarding = () => {
    const { user } = useUser();
    const [form, setForm] = useState({
        firstName: user?.name?.split(" ")[0] || "",
        lastName: user?.name?.split(" ")[1] || "",
        phone: "",
        licenseNumber: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        vehicleColor: "",
        plateNumber: "",
        seats: "4",
    });
    const [loading, setLoading] = useState(false);

    const onRegisterPress = async () => {
        if (!form.licenseNumber || !form.vehicleMake || !form.vehicleModel || !form.plateNumber) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            await registerDriver(
                form.firstName,
                form.lastName,
                form.phone,
                form.licenseNumber,
                "standard",
                form.vehicleMake,
                form.vehicleModel,
                parseInt(form.vehicleYear) || 2020,
                form.vehicleColor,
                form.plateNumber,
                parseInt(form.seats) || 4
            );
            Alert.alert("Success", "You are now registered as a driver!");
            router.replace("/(root)/(tabs)/home");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAwareScrollView className="flex-1 px-5" enableOnAndroid={true} extraScrollHeight={20}>
                <Text className="text-2xl font-JakartaBold mb-5 mt-5">Driver Registration</Text>

                <Text className="text-lg font-JakartaSemiBold mb-3">Personal Info</Text>
                <InputField
                    label="First Name"
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChangeText={(value) => setForm({ ...form, firstName: value })}
                />
                <InputField
                    label="Last Name"
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChangeText={(value) => setForm({ ...form, lastName: value })}
                />
                <InputField
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChangeText={(value) => setForm({ ...form, phone: value })}
                    keyboardType="phone-pad"
                />
                <InputField
                    label="License Number"
                    placeholder="Enter license number"
                    value={form.licenseNumber}
                    onChangeText={(value) => setForm({ ...form, licenseNumber: value })}
                />

                <Text className="text-lg font-JakartaSemiBold mb-3 mt-5">Vehicle Info</Text>
                <InputField
                    label="Vehicle Make"
                    placeholder="e.g. Toyota"
                    value={form.vehicleMake}
                    onChangeText={(value) => setForm({ ...form, vehicleMake: value })}
                />
                <InputField
                    label="Vehicle Model"
                    placeholder="e.g. Camry"
                    value={form.vehicleModel}
                    onChangeText={(value) => setForm({ ...form, vehicleModel: value })}
                />
                <InputField
                    label="Vehicle Year"
                    placeholder="e.g. 2020"
                    value={form.vehicleYear}
                    onChangeText={(value) => setForm({ ...form, vehicleYear: value })}
                    keyboardType="numeric"
                />
                <InputField
                    label="Vehicle Color"
                    placeholder="e.g. Silver"
                    value={form.vehicleColor}
                    onChangeText={(value) => setForm({ ...form, vehicleColor: value })}
                />
                <InputField
                    label="Plate Number"
                    placeholder="Enter plate number"
                    value={form.plateNumber}
                    onChangeText={(value) => setForm({ ...form, plateNumber: value })}
                />

                <CustomButton
                    title={loading ? "Registering..." : "Complete Registration"}
                    onPress={onRegisterPress}
                    className="mt-10 mb-10"
                    disabled={loading}
                />
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default Onboarding;
