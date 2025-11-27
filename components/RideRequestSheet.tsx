import React, { useMemo } from "react";
import { View, Text, Image } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";

interface RideRequestSheetProps {
    request: {
        origin_address: string;
        destination_address: string;
        fare_price: number;
        ride_time: number;
        distance?: number;
    } | null;
    onAccept: () => void;
    onDecline: () => void;
}

const RideRequestSheet = ({ request, onAccept, onDecline }: RideRequestSheetProps) => {
    const snapPoints = useMemo(() => ["40%"], []);

    if (!request) return null;

    return (
        <BottomSheet snapPoints={snapPoints} index={0} enablePanDownToClose={false}>
            <BottomSheetView className="flex-1 p-5">
                <Text className="text-xl font-JakartaBold mb-5 text-center">New Ride Request</Text>

                <View className="flex-row items-center mb-5">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-3">
                            <Image source={icons.to} className="w-6 h-6 mr-3" />
                            <Text className="text-base font-JakartaMedium flex-1" numberOfLines={1}>
                                {request.origin_address}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Image source={icons.point} className="w-6 h-6 mr-3" />
                            <Text className="text-base font-JakartaMedium flex-1" numberOfLines={1}>
                                {request.destination_address}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row justify-between items-center mb-5 bg-general-100 p-3 rounded-lg">
                    <View className="items-center">
                        <Text className="text-gray-500 font-JakartaRegular text-xs">Est. Fare</Text>
                        <Text className="text-lg font-JakartaBold">${request.fare_price.toFixed(2)}</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-gray-500 font-JakartaRegular text-xs">Distance</Text>
                        <Text className="text-lg font-JakartaBold">{(request.distance || 0).toFixed(1)} km</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-gray-500 font-JakartaRegular text-xs">Time</Text>
                        <Text className="text-lg font-JakartaBold">{request.ride_time} min</Text>
                    </View>
                </View>

                <View className="flex-row gap-3">
                    <CustomButton
                        title="Decline"
                        bgVariant="danger"
                        className="flex-1"
                        onPress={onDecline}
                    />
                    <CustomButton
                        title="Accept"
                        bgVariant="success"
                        className="flex-1"
                        onPress={onAccept}
                    />
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
};

export default RideRequestSheet;
