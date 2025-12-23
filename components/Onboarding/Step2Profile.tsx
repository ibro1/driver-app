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
        email?: string;
        nin: string;
        profileImageUrl?: string;
    };
    onNext: (data: any) => void;
    onBack: () => void;
    loading: boolean;
}

const Step2Profile: React.FC<Step2Props> = ({ initialData, onNext, onBack, loading }) => {
    const [form, setForm] = useState({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        nin: initialData.nin || "",
    });
    const [profileImage, setProfileImage] = useState<string | null>(initialData.profileImageUrl || null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleNext = async () => {
        if (!form.firstName || !form.lastName || !form.email || !form.nin || !profileImage) {
            Alert.alert("Error", "Please fill all fields and upload a profile photo.");
            return;
        }

        setUploading(true);
        try {
            let profileImageUrl = profileImage;
            if (profileImage && !profileImage.startsWith("http")) {
                profileImageUrl = await uploadFile(profileImage);
            }
            onNext({ ...form, profileImageUrl });
        } catch (error: any) {
            Alert.alert("Upload Error", error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View>
            <Text className="text-xl font-JakartaBold mb-5">Personal Details</Text>

            <View className="items-center mb-5">
                <TouchableOpacity onPress={pickImage} className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center border border-gray-300 overflow-hidden">
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <Image source={icons.profile} className="w-10 h-10 tint-gray-400" resizeMode="contain" />
                    )}
                </TouchableOpacity>
                <Text className="text-primary-500 mt-2 font-JakartaMedium" onPress={pickImage}>Upload Profile Photo</Text>
            </View>

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
                label="Email Address"
                placeholder="Enter email address"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                keyboardType="email-address"
            />
            <InputField
                label="NIN"
                placeholder="National Identity Number"
                value={form.nin}
                onChangeText={(t) => setForm({ ...form, nin: t })}
            />

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
