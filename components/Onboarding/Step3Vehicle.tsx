import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
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
        // License
        licenseNumber: (initialData as any).licenseNumber || "",

        // Vehicle
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
        { key: "license", label: "Driver's License / ID Card" },
        { key: "vehicle_image", label: "Vehicle Exterior Photo" },
        { key: "insurance", label: "Vehicle Insurance Check" },
        { key: "roadworthiness", label: "Road Worthiness Certificate" },
        {
            key: "hackney_permit",
            label: isLagos ? "Lagos State Hackney Permit" : `${city} Hackney Permit / Papers`
        },
        { key: "ownership_proof", label: "Proof of Ownership" },
    ];

    const [documents, setDocuments] = useState<{ [key: string]: string }>(
        () => {
            const docs = (initialData.documents || []).reduce((acc: any, doc: any) => {
                acc[doc.type] = doc.url;
                return acc;
            }, {});
            if ((initialData as any).licenseUrl && !docs['license']) {
                docs['license'] = (initialData as any).licenseUrl;
            }
            return docs;
        }
    );

    const [docStatuses, setDocStatuses] = useState<{ [key: string]: { status: string, reason?: string } }>(
        () => {
            return (initialData.documents || []).reduce((acc: any, doc: any) => {
                acc[doc.type] = { status: doc.status, reason: doc.rejectionReason };
                return acc;
            }, {});
        }
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
            // Reset status on new upload so it looks "pending" or just "uploaded" locally
            setDocStatuses(prev => ({ ...prev, [type]: { status: 'new_upload' } }));
        }
    };

    const handleNext = async () => {
        if (!form.licenseNumber) {
            Alert.alert("Error", "Please provide License Number.");
            return;
        }

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
            let processedLicenseUrl = null;

            for (const docType of Object.keys(documents)) {
                let url = documents[docType];
                // Only upload if it's a local file (file://) or explicit upload
                // If it is http and ALREADY approved/pending, maybe skip re-upload?
                // But simplified logic: check if http.
                if (url && !url.startsWith("http")) {
                    url = await uploadFile(url);
                }
                uploadedDocs.push({ type: docType, url });

                if (docType === 'license') {
                    processedLicenseUrl = url;
                }
            }

            // Send licenseUrl separately to match backend logic, or just rely on 'license' type in documents array (which backend also handles in loop).
            // Backend handles both. We'll send both for robustness.
            onNext({ ...form, licenseUrl: processedLicenseUrl, documents: uploadedDocs });
        } catch (error: any) {
            Alert.alert("Upload Error", error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View className="flex-1">
            <Text className="text-2xl font-JakartaBold mb-5">Credentials & Vehicle</Text>

            <Text className="text-xl font-JakartaBold mb-3 mt-5">Vehicle Details</Text>

            <InputField
                label="License Number"
                placeholder="Driver's License Number"
                value={form.licenseNumber}
                onChangeText={(t) => setForm({ ...form, licenseNumber: t })}
            />

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

            <Text className="text-xl font-JakartaBold mt-5 mb-3">Required Documents ({city})</Text>
            {documentTypes.map((doc) => {
                const statusInfo = docStatuses[doc.key];
                const isRejected = statusInfo?.status === 'rejected';

                return (
                    <View key={doc.key} className="bg-neutral-100 p-4 rounded-xl mb-3 border border-neutral-200">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-JakartaMedium text-base flex-1">{doc.label}</Text>
                            <TouchableOpacity
                                onPress={() => pickDocument(doc.key)}
                                className={`px-4 py-2 rounded-full ${isRejected ? "bg-red-100 border border-red-300" :
                                        documents[doc.key] ? "bg-green-100" : "bg-white border border-neutral-300"
                                    }`}
                            >
                                <Text className={`${isRejected ? "text-red-700 font-bold" :
                                        documents[doc.key] ? "text-green-700 font-bold" : "text-black"
                                    }`}>
                                    {isRejected ? "Re-upload" :
                                        documents[doc.key] ? "Uploaded ✓" : "Upload"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {isRejected && statusInfo?.reason && (
                            <Text className="text-red-500 text-sm mt-2 ml-1">
                                Reason: {statusInfo.reason}
                            </Text>
                        )}
                    </View>
                );
            })}

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
