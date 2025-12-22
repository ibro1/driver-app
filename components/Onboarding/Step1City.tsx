import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";

interface Step1Props {
    initialData: { city: string };
    onNext: (data: { city: string }) => void;
    loading: boolean;
}

const CITIES = [
    "Lagos", "Abuja", "Port Harcourt", "Ibadan",
    "Kano", "Benin City", "Enugu", "Owerri", "Calabar", "Jos"
];

const Step1City: React.FC<Step1Props> = ({ initialData, onNext, loading }) => {
    const [city, setCity] = useState(initialData.city || "");
    const [searchText, setSearchText] = useState("");
    const [detectingLocation, setDetectingLocation] = useState(false);

    const handleNext = () => {
        if (!city) return;
        onNext({ city });
    };

    const handleUseCurrentLocation = async () => {
        setDetectingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Allow location access to detect your city.");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (address && address.length > 0) {
                const detectedCity = address[0].city || address[0].region || address[0].subregion;
                if (detectedCity) {
                    setCity(detectedCity);
                    setSearchText(""); // Clear search to show selection
                } else {
                    Alert.alert("Error", "Could not determine city from your location.");
                }
            }
        } catch (error) {
            Alert.alert("Error", "Failed to detect location.");
        } finally {
            setDetectingLocation(false);
        }
    };

    const filteredCities = CITIES.filter(c => c.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <View className="flex-1">
            <Text className="text-xl font-JakartaBold mb-2">Where will you drive?</Text>
            <Text className="text-gray-500 mb-5">Select your operating city.</Text>

            {/* Detection Button */}
            <TouchableOpacity
                onPress={handleUseCurrentLocation}
                className="flex-row items-center justify-center bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6"
                disabled={detectingLocation}
            >
                {detectingLocation ? (
                    <ActivityIndicator size="small" color="#0286FF" />
                ) : (
                    <>
                        <Feather name="map-pin" size={20} color="#0286FF" />
                        <Text className="text-primary-500 font-JakartaSemiBold ml-2">Use Current Location</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Search Input */}
            <View className="relative">
                <InputField
                    label="Or search city"
                    placeholder="Search city (e.g. Lagos)"
                    value={searchText || (city && !CITIES.includes(city) ? city : "")}
                    onChangeText={(text) => {
                        setSearchText(text);
                        if (text === "") setCity("");
                    }}
                    // Passing a wrapper component that renders the Feather Icon
                    icon={() => <Feather name="search" size={20} color="#6b7280" />}
                />
            </View>

            {/* City Selection List */}
            <ScrollView className="flex-1 mt-2 mb-4" keyboardShouldPersistTaps="handled">
                {/* Show filtered list only if searching OR no city selected yet */}
                {filteredCities.map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => {
                            setCity(item);
                            setSearchText(""); // Clear search or keep it? Clearing feels cleaner if we show selection
                        }}
                        className={`p-4 mb-2 rounded-xl border ${city === item ? "bg-primary-50 border-primary-500" : "bg-gray-50 border-gray-100"}`}
                    >
                        <View className="flex-row justify-between items-center">
                            <Text className={`font-JakartaMedium ${city === item ? "text-primary-700" : "text-gray-700"}`}>
                                {item}
                            </Text>
                            {city === item && <View className="w-3 h-3 rounded-full bg-primary-500" />}
                        </View>
                    </TouchableOpacity>
                ))}

                {filteredCities.length === 0 && searchText.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setCity(searchText)}
                        className="p-4 mb-2 rounded-xl bg-gray-50 border border-gray-100"
                    >
                        <Text className="text-gray-700">Use custom: "{searchText}"</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <View className="mt-auto">
                {city ? (
                    <Text className="text-center text-gray-500 mb-2">Selected: <Text className="font-bold text-black">{city}</Text></Text>
                ) : null}

                <CustomButton
                    title="Next"
                    onPress={handleNext}
                    disabled={!city || loading}
                    isLoading={loading}
                />
            </View>
        </View>
    );
};

export default Step1City;
