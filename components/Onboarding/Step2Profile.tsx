import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { uploadFile } from "@/lib/auth-api";
import { icons } from "@/constants";

interface Step2Props {
    initialData: {
        firstName: string;
        lastName: string;
        nin: string;
        licenseNumber: string;
        licenseUrl?: string;
        profileImageUrl?: string; // Add profile image too? The plan says "Personal Info... Camera interface"
    };
    onNext: (data: any) => void;
    onBack: () => void;
    loading: boolean;
}

const Step2Profile: React.FC<Step2Props> = ({ initialData, onNext, onBack, loading }) => {
    const [form, setForm] = useState({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        nin: initialData.nin || "",
        licenseNumber: initialData.licenseNumber || "",
    });
    const [licenseImage, setLicenseImage] = useState<string | null>(initialData.licenseUrl || null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchCameraAsync({ // Camera preferred for license
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setLicenseImage(result.assets[0].uri);
        }
    };

    const handleNext = async () => {
        if (!form.firstName || !form.lastName || !form.nin || !form.licenseNumber || !licenseImage) {
            Alert.alert("Error", "Please fill all fields and upload license.");
            return;
        }

        setUploading(true);
        try {
            let licenseUrl = licenseImage;
            // Only upload if it's a local file (not already a remote URL)
            if (licenseImage && !licenseImage.startsWith("http")) {
                licenseUrl = await uploadFile(licenseImage);
            }
            onNext({ ...form, licenseUrl });
        } catch (error: any) {
            Alert.alert("Upload Error", error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View className="flex-1">
            <Text className="text-xl font-JakartaBold mb-5">Personal Details</Text>

            <InputField
                label="First Name"
                placeholder="First Name"
                value={form.firstName}
                onChangeText={(t) => setForm({ ...form, firstName: t })}
            />
            <InputField
                label="Last Name"
                placeholder="Last Name"
                value={form.lastName}
                onChangeText={(t) => setForm({ ...form, lastName: t })}
            />
            <InputField
                label="NIN"
                placeholder="National Identity Number"
                value={form.nin}
                onChangeText={(t) => setForm({ ...form, nin: t })}
            />
            <InputField
                label="License Number"
                placeholder="Driver's License Number"
                value={form.licenseNumber}
                onChangeText={(t) => setForm({ ...form, licenseNumber: t })}
            />

            <Text className="text-lg font-JakartaSemiBold mt-5 mb-3">License Photo</Text>
            <TouchableOpacity onPress={pickImage} className="w-full h-40 bg-gray-100 rounded-lg items-center justify-center border border-dashed border-gray-300 mb-5">
                {licenseImage ? (
                    <Image source={{ uri: licenseImage }} className="w-full h-full rounded-lg" resizeMode="cover" />
                ) : (
                    <View className="items-center">
                        <Image source={icons.upload} className="w-8 h-8 tint-gray-400" resizeMode="contain" />
                        <Text className="text-gray-500 mt-2">Tap to take photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View className="flex-row justify-between mt-5 gap-3">
                <CustomButton
                    title="Back"
                    onPress={onBack}
                    className="flex-1 bg-neutral-200"
                    textVariant="secondary"
                    disabled={loading || uploading}
                />
                <CustomButton
                    title={uploading ? "Uploading..." : "Next"}
                    onPress={handleNext}
                    disabled={loading || uploading}
                    isLoading={loading || uploading}
                    className="flex-1"
                />
            </View>
        </View>
    );
};

export default Step2Profile;
