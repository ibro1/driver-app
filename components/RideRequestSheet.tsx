import React, { useMemo, useRef, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { playRideRequestAlert, stopRideRequestAlert } from "@/lib/ride-alert";

interface RideRequestSheetProps {
    request: {
        origin_address?: string;
        originAddress?: string;
        destination_address?: string;
        destinationAddress?: string;
        fare_price?: number;
        farePrice?: number;
        ride_time?: number;
        rideTime?: number;
        distance?: number;
        rideDistanceKm?: number;
    } | null;
    onAccept: () => void;
    onDecline: () => void;
    loading?: boolean;
    declineLoading?: boolean;
}

const TIMEOUT_SECONDS = 45; // Industry standard: 45 seconds for emerging markets

const RideRequestSheet = ({ request, onAccept, onDecline, loading, declineLoading }: RideRequestSheetProps) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["55%"], []);
    const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pulse animation for urgency
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Sound + Vibration Alert
    useEffect(() => {
        if (request) {
            playRideRequestAlert();
        } else {
            stopRideRequestAlert();
        }
        return () => {
            stopRideRequestAlert();
        };
    }, [request]);

    // Countdown timer
    useEffect(() => {
        if (!request) {
            setCountdown(TIMEOUT_SECONDS);
            return;
        }
        setCountdown(TIMEOUT_SECONDS);
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    stopRideRequestAlert();
                    onDecline(); // Auto-decline when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [request]);

    useEffect(() => {
        if (request) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [request]);

    if (!request) return null;

    const origin = request.origin_address || request.originAddress;
    const destination = request.destination_address || request.destinationAddress;
    const price = request.fare_price || request.farePrice;
    const time = request.ride_time || request.rideTime;
    const distance = request.distance || request.rideDistanceKm || 0;

    const isUrgent = countdown <= 10;

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            index={0}
            enablePanDownToClose={false}
            handleIndicatorStyle={{ backgroundColor: "#E5E7EB", width: 40 }}
            backgroundStyle={{ borderRadius: 32, backgroundColor: 'white' }}
        >
            <BottomSheetView className="flex-1">
                <View className="px-5 pt-2 pb-6">
                    {/* Header with Countdown */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center gap-x-3">
                            <Text className="text-lg font-JakartaBold text-neutral-900">New Request</Text>
                            <View className="bg-[#9D00FF]/10 px-2.5 py-1 rounded-full">
                                <Text className="text-[#9D00FF] font-JakartaBold text-[8px] uppercase tracking-wider">Premium</Text>
                            </View>
                        </View>

                        {/* Countdown Timer */}
                        <Animated.View
                            style={{ transform: [{ scale: isUrgent ? pulseAnim : 1 }] }}
                            className={`px-3 py-1.5 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-neutral-800'}`}
                        >
                            <Text className="text-white font-JakartaBold text-sm">{countdown}s</Text>
                        </Animated.View>
                    </View>

                    {/* Compact Route Card */}
                    <View className="bg-neutral-50 rounded-2xl p-4 mb-4">
                        <View className="flex-row items-start">
                            {/* Timeline */}
                            <View className="items-center mr-3 pt-0.5">
                                <View className="w-3 h-3 rounded-full border-2 border-[#9D00FF] bg-white" />
                                <View className="w-[1px] h-8 bg-neutral-300 my-0.5" />
                                <Ionicons name="location" size={14} color="#9D00FF" />
                            </View>

                            {/* Addresses */}
                            <View className="flex-1 gap-y-4">
                                <View>
                                    <Text className="text-neutral-400 text-[8px] uppercase font-JakartaBold mb-0.5">Pickup</Text>
                                    <Text className="text-neutral-900 font-JakartaSemiBold text-xs" numberOfLines={1}>
                                        {origin}
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-neutral-400 text-[8px] uppercase font-JakartaBold mb-0.5">Drop-off</Text>
                                    <Text className="text-neutral-900 font-JakartaSemiBold text-xs" numberOfLines={1}>
                                        {destination}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Compact Metrics Row */}
                    <View className="flex-row bg-white rounded-xl border border-neutral-100 mb-5">
                        <View className="flex-1 items-center py-3 border-r border-neutral-100">
                            <Text className="text-[#9D00FF] font-JakartaBold text-lg">₦{price}</Text>
                            <Text className="text-neutral-400 text-[8px] uppercase font-JakartaBold">Fare</Text>
                        </View>
                        <View className="flex-1 items-center py-3 border-r border-neutral-100">
                            <Text className="text-neutral-800 font-JakartaBold text-lg">{distance.toFixed(1)} km</Text>
                            <Text className="text-neutral-400 text-[8px] uppercase font-JakartaBold">Distance</Text>
                        </View>
                        <View className="flex-1 items-center py-3">
                            <Text className="text-neutral-800 font-JakartaBold text-lg">{Math.round(time || 0)}m</Text>
                            <Text className="text-neutral-400 text-[8px] uppercase font-JakartaBold">Time</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-x-3">
                        <TouchableOpacity
                            onPress={onDecline}
                            disabled={declineLoading}
                            className={`flex-1 h-12 bg-neutral-100 rounded-xl items-center justify-center ${declineLoading ? "opacity-50" : ""}`}
                        >
                            <Text className="text-neutral-500 font-JakartaBold text-base">Decline</Text>
                        </TouchableOpacity>

                        <Animated.View style={{ flex: 1.5, transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity
                                onPress={onAccept}
                                disabled={loading}
                                className={`h-12 bg-[#9D00FF] rounded-xl items-center justify-center ${loading ? "opacity-50" : ""}`}
                            >
                                {loading ? (
                                    <Text className="text-white font-JakartaBold text-base">Accepting...</Text>
                                ) : (
                                    <Text className="text-white font-JakartaBold text-base">Accept Ride</Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

export default RideRequestSheet;

