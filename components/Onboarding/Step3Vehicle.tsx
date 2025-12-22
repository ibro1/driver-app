import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { uploadFile } from "@/lib/auth-api";
import { icons } from "@/constants";

interface Step3Props {
    initialData: {
        vehicleMake: string;
        vehicleModel: string;
        vehicleYear: string;
        vehicleColor: string;
        vehiclePlateNumber: string;
        vehicleSeats: string;
        documents?: { type: string; url: string }[];
    };
    onNext: (data: any) => void;
    onBack: () => void;
    loading: boolean;
}

const DOCUMENT_TYPES = [
    { key: "insurance", label: "Vehicle Insurance" },
    { key: "roadworthiness", label: "Road Worthiness" },
    { key: "hackney_permit", label: "Hackney Permit" },
    { key: "ownership_proof", label: "Proof of Ownership" },
];

const Step3Vehicle: React.FC<Step3Props> = ({ initialData, onNext, onBack, loading }) => {
    const [form, setForm] = useState({
        vehicleMake: initialData.vehicleMake || "",
        vehicleModel: initialData.vehicleModel || "",
        vehicleYear: initialData.vehicleYear || "",
        vehicleColor: initialData.vehicleColor || "",
        vehiclePlateNumber: initialData.vehiclePlateNumber || "",
        vehicleSeats: initialData.vehicleSeats || "4",
    });

    // Determine city-specific rules
    // Default to 'State' if city is not specific
    const city = (initialData as any).city || "State";
    const isLagos = city.toLowerCase().includes("lagos");

    const documentTypes = [
        { key: "insurance", label: "Vehicle Insurance Check" }, // Tweaked label
        { key: "roadworthiness", label: "Road Worthiness Certificate" },
        {
            key: "hackney_permit",
            label: isLagos ? "Lagos State Hackney Permit" : `${city} Hackney Permit / Papers`
        },
        { key: "ownership_proof", label: "Proof of Ownership" },
    ];

    // Add LASDRI for Lagos if we want to be strict? User said "Regional Rules ... vehicle age".
    // For now, let's keep it to the label change as a first step + Vehicle Year check?
    // User mentioned "Vehicle Age". Let's add a warning if year is too old for Lagos (e.g. < 2005)

    const [documents, setDocuments] = useState<{ [key: string]: string }>(
        (initialData.documents || []).reduce((acc: any, doc: any) => {
            acc[doc.type] = doc.url;
            return acc;
        }, {})
    );
    const [uploading, setUploading] = useState(false);

    const pickDocument = async (type: string) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setDocuments(prev => ({ ...prev, [type]: result.assets[0].uri }));
        }
    };

    const handleNext = async () => {
        if (!form.vehicleMake || !form.vehicleModel || !form.vehiclePlateNumber) {
            Alert.alert("Error", "Please fill vehicle details");
            return;
        }

        // Vehicle Age Check for Lagos (Example Rule)
        if (isLagos) {
            const year = parseInt(form.vehicleYear);
            if (year < 2005) {
                Alert.alert("Vehicle Policy", "For Lagos operations, vehicles must be 2005 or newer.");
                return;
            }
        }

        // Check required documents
        const missingDocs = documentTypes.filter(d => !documents[d.key]);
        if (missingDocs.length > 0) {
            Alert.alert("Missing Documents", `Please upload: ${missingDocs.map(d => d.label).join(", ")}`);
            return;
        }

        setUploading(true);
        try {
            const uploadedDocs = [];
            for (const docType of Object.keys(documents)) {
                let url = documents[docType];
                if (url && !url.startsWith("http")) {
                    url = await uploadFile(url);
                }
                uploadedDocs.push({ type: docType, url });
            }

            onNext({ ...form, documents: uploadedDocs });
        } catch (error: any) {
            Alert.alert("Upload Error", error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View className="flex-1">
            <Text className="text-xl font-JakartaBold mb-5">Vehicle & Documents</Text>

            <InputField label="Make" placeholder="Toyota" value={form.vehicleMake} onChangeText={(t) => setForm({ ...form, vehicleMake: t })} />
            <InputField label="Model" placeholder="Camry" value={form.vehicleModel} onChangeText={(t) => setForm({ ...form, vehicleModel: t })} />
            <View className="flex-row gap-3">
                <View className="flex-1">
                    <InputField label="Year" placeholder="2015" value={form.vehicleYear} onChangeText={(t) => setForm({ ...form, vehicleYear: t })} keyboardType="numeric" />
                </View>
                <View className="flex-1">
                    <InputField label="Color" placeholder="Silver" value={form.vehicleColor} onChangeText={(t) => setForm({ ...form, vehicleColor: t })} />
                </View>
            </View>
            <InputField label="Plate Number" placeholder="Number Plate" value={form.vehiclePlateNumber} onChangeText={(t) => setForm({ ...form, vehiclePlateNumber: t })} />

            <Text className="text-lg font-JakartaSemiBold mt-5 mb-3">Required Documents ({city})</Text>
            {documentTypes.map((doc) => (
                <View key={doc.key} className="flex-row items-center justify-between bg-neutral-100 p-4 rounded-xl mb-3 border border-neutral-200">
                    <Text className="font-JakartaMedium text-base flex-1">{doc.label}</Text>
                    <TouchableOpacity
                        onPress={() => pickDocument(doc.key)}
                        className={`px-4 py-2 rounded-full ${documents[doc.key] ? "bg-green-100" : "bg-white border border-neutral-300"}`}
                    >
                        <Text className={`${documents[doc.key] ? "text-green-700 font-bold" : "text-black"}`}>
                            {documents[doc.key] ? "Uploaded ✓" : "Upload"}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}

            <View className="flex-row justify-between mt-5 gap-3 mb-10">
                <CustomButton
                    title="Back"
                    onPress={onBack}
                    className="flex-1 bg-neutral-200"
                    textVariant="secondary"
                    disabled={loading || uploading}
                />
                <CustomButton
                    title={uploading ? "Uploading..." : "Submit Application"}
                    onPress={handleNext}
                    disabled={loading || uploading}
                    isLoading={loading || uploading}
                    className="flex-1"
                />
            </View>
        </View>
    );
};

export default Step3Vehicle;
