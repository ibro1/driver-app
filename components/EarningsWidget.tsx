import { View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";
import { router } from "expo-router";
import Skeleton from "./Skeleton";

interface EarningsWidgetProps {
    earnings: number;
    ridesCount: number;
    loading?: boolean;
}

const EarningsWidget = ({ earnings, ridesCount, loading }: EarningsWidgetProps) => {
    return (
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-neutral-200 mx-5 mb-6 border border-neutral-50">
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                    <View className="w-1 h-4 bg-[#9D00FF] rounded-full mr-2" />
                    <Text className="text-lg font-JakartaBold text-gray-900">
                        Today's Summary
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push("/(root)/earnings")}
                    className="bg-purple-50 px-3 py-1.5 rounded-xl flex-row items-center"
                >
                    <Text className="text-xs font-JakartaBold text-[#9D00FF] mr-1">
                        View Details
                    </Text>
                    <Image source={icons.arrowDown} className="w-3 h-3 -rotate-90" tintColor="#9D00FF" resizeMode="contain" />
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center">
                <View className="items-center flex-1 border-r border-neutral-100">
                    {loading ? (
                        <Skeleton width={100} height={28} borderRadius={8} />
                    ) : (
                        <Text className="text-2xl font-JakartaExtraBold text-[#9D00FF]">
                            ₦{earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    )}
                    <Text className="text-[12px] font-JakartaMedium text-neutral-400 mt-1 uppercase tracking-wider">
                        Earnings
                    </Text>
                </View>

                <View className="items-center flex-1">
                    {loading ? (
                        <Skeleton width={40} height={28} borderRadius={8} />
                    ) : (
                        <Text className="text-2xl font-JakartaExtraBold text-gray-900">
                            {ridesCount}
                        </Text>
                    )}
                    <Text className="text-[12px] font-JakartaMedium text-gray-400 mt-1 uppercase tracking-wider">
                        Trips
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default EarningsWidget;
