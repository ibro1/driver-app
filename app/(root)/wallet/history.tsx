import { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { icons, images } from "@/constants";
const noResultImage = images.noResult;
import { useFetch } from "@/lib/fetch";
import { formatDate } from "@/lib/utils";

const PayoutHistory = () => {
    const { data: historyData, loading, error, refetch } = useFetch<any>("/api/driver/transactions");

    // Robust parsing to handle both { data: [...] } and [...] formats
    const rawData = historyData?.data || historyData;
    const transactions = Array.isArray(rawData) ? rawData : [];

    console.log("HISTORY DATA RECEIVED:", JSON.stringify(historyData, null, 2));
    console.log("TRANSACTIONS COUNT:", transactions.length);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    const formatTimeOfDay = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success': return 'text-[#9D00FF] bg-purple-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'failed': return 'text-red-600 bg-red-50';
            default: return 'text-neutral-500 bg-neutral-50';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex flex-row items-center justify-start px-5 py-6 bg-white shadow-sm z-10 border-b border-neutral-50">
                <TouchableOpacity onPress={() => router.back()}>
                    <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                        <Image
                            source={icons.backArrow}
                            resizeMode="contain"
                            className="w-6 h-6"
                        />
                    </View>
                </TouchableOpacity>
                <Text className="text-xl font-JakartaBold ml-5">Payout History</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#9D00FF" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={refetch} colors={["#9D00FF"]} />
                    }
                    ListEmptyComponent={() => (
                        <View className="items-center py-10">
                            <Image source={noResultImage} className="w-40 h-40" resizeMode="contain" />
                            <Text className="text-neutral-500 font-JakartaMedium mt-4">No payout history yet.</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View className="flex-row justify-between items-center bg-white p-4 rounded-xl border border-neutral-100 mb-3 shadow-sm">
                            <View className="flex-1 mr-4">
                                <Text className="text-base font-JakartaBold text-neutral-800 mb-1">
                                    {item.type === 'withdrawal' ? 'Cash Out' : 'Trip Earned'}
                                </Text>
                                <Text className="text-xs text-neutral-500 mb-1">
                                    {formatDate(item.createdAt)} • {formatTimeOfDay(item.createdAt)}
                                </Text>
                                <Text className="text-xs text-neutral-400" numberOfLines={1}>
                                    {item.description || (item.type === 'withdrawal' ? 'Bank Transfer' : 'Ride Income')}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-lg font-JakartaBold text-neutral-800 mb-1">
                                    {item.type === 'withdrawal' ? '-' : '+'}₦{item.amount?.toFixed(2)}
                                </Text>
                                <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                                    <Text className={`text-[10px] font-JakartaBold capitalize ${getStatusColor(item.status).split(' ')[0]}`}>
                                        {item.type === 'withdrawal' ? item.status : 'Settled'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default PayoutHistory;
