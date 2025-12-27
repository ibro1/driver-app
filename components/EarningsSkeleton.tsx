import { View } from "react-native";
import Skeleton from "./Skeleton";

export const EarningsItemSkeleton = () => (
    <View className="flex-row items-center bg-white p-5 rounded-[24px] mb-4 border border-gray-50 shadow-sm">
        <View className="w-12 h-12 rounded-2xl bg-neutral-50 items-center justify-center mr-4">
            <Skeleton width={24} height={24} borderRadius={6} />
        </View>

        <View className="flex-1">
            <View className="mb-2">
                <Skeleton width={120} height={16} borderRadius={8} />
            </View>
            <Skeleton width={80} height={12} borderRadius={6} />
        </View>

        <View className="items-end">
            <View className="mb-2">
                <Skeleton width={70} height={20} borderRadius={10} />
            </View>
            <Skeleton width={50} height={14} borderRadius={7} />
        </View>
    </View>
);

export const ChatMessageSkeleton = () => (
    <View className="flex-row items-center p-4 border-b border-gray-100">
        <View className="mr-4">
            <Skeleton width={48} height={48} borderRadius={24} />
        </View>
        <View className="flex-1">
            <View className="flex-row justify-between items-center mb-2">
                <Skeleton width={100} height={18} borderRadius={9} />
                <Skeleton width={60} height={20} borderRadius={10} />
            </View>
            <Skeleton width={150} height={14} borderRadius={7} />
        </View>
        <View className="ml-2">
            <Skeleton width={20} height={20} borderRadius={10} />
        </View>
    </View>
);
