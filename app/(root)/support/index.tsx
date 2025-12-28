import { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useUser } from "@/lib/auth-context";

const faqs = [
    { id: 1, question: "How do I request a refund?", answer: "Go to your ride history, select the ride, and tap 'Report Issue'." },
    { id: 2, question: "Why is my account pending?", answer: "We are verifying your documents. This usually takes 24-48 hours." },
    { id: 3, question: "Can I change my payment method?", answer: "Yes, you can update it in your Wallet settings." },
];

const SupportHome = () => {
    const { user } = useUser();
    const { data: ticketsData, loading, error, refetch } = useFetch<any>("/api/support/list");
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            console.log("SupportHome focused, refetching tickets...");
            refetch();
        }, [refetch])
    );

    useEffect(() => {
        if (ticketsData) console.log("Tickets Data:", JSON.stringify(ticketsData, null, 2));
        if (loading) console.log("Loading tickets...");
        if (error) console.error("SupportHome Fetch Error:", error);
    }, [ticketsData, loading, error]);

    const renderTicket = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white p-5 rounded-2xl border border-neutral-100 mb-4 shadow-sm"
            onPress={() => router.push(`/(root)/support/chat/${item.id}` as any)}
        >
            <View className="flex-row justify-between items-center mb-3">
                <Text className="font-JakartaBold text-neutral-800 text-base">{item.category}</Text>
                <View className={`px-3 py-1 rounded-full ${item.status === 'resolved' ? 'bg-neutral-100' : 'bg-[#9D00FF]/10'}`}>
                    <Text className={`text-[10px] uppercase font-JakartaExtraBold ${item.status === 'resolved' ? 'text-neutral-500' : 'text-[#9D00FF]'}`}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <Text className="text-neutral-500 text-sm font-JakartaMedium" numberOfLines={1}>{item.subject}</Text>
            <View className="flex-row items-center mt-3">
                <Image source={icons.point} className="w-3 h-3 mr-1.5" tintColor="#C4C4C4" />
                <Text className="text-neutral-400 text-xs font-JakartaMedium">{new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            {/* Custom Header Matching RideLayout */}
            <View className="flex flex-row items-center justify-start px-5 py-6 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => router.back()}>
                    <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                        <Image
                            source={icons.backArrow}
                            resizeMode="contain"
                            className="w-6 h-6"
                        />
                    </View>
                </TouchableOpacity>
                <Text className="text-xl font-JakartaBold ml-5">
                    Help & Support
                </Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
                {/* FAQ Section */}
                <Text className="text-lg font-JakartaBold mb-4 text-neutral-800">Frequently Asked Questions</Text>
                <View className="mb-8">
                    {faqs.map((faq) => (
                        <TouchableOpacity
                            key={faq.id}
                            activeOpacity={0.8}
                            onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                            className="bg-white p-4 rounded-xl border border-neutral-100 mb-3 shadow-sm"
                        >
                            <View className="flex-row justify-between items-center">
                                <Text className="font-JakartaSemiBold text-neutral-800 flex-1">{faq.question}</Text>
                                <Image
                                    source={icons.arrowDown}
                                    className={`w-4 h-4 ${expandedFaq === faq.id ? 'rotate-180' : ''}`}
                                    style={{ tintColor: expandedFaq === faq.id ? '#9D00FF' : '#C4C4C4' }}
                                    resizeMode="contain"
                                />
                            </View>
                            {expandedFaq === faq.id && (
                                <View className="mt-3 pt-3 border-t border-neutral-50">
                                    <Text className="text-neutral-500 text-sm leading-6 font-JakartaMedium">{faq.answer}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Tickets Section */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-JakartaBold text-neutral-800">Recent Tickets</Text>
                    <TouchableOpacity onPress={() => router.push("/(root)/support/new-ticket")}>
                        <Text className="text-[#9D00FF] font-JakartaBold">Start Chat</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color="#9D00FF" />
                ) : (ticketsData?.tickets && ticketsData.tickets.length > 0) ? (
                    <View>
                        {ticketsData.tickets.map((ticket: any) => (
                            <View key={ticket.id}>{renderTicket({ item: ticket })}</View>
                        ))}
                    </View>
                ) : (
                    <View className="items-center justify-center py-12 bg-white rounded-3xl border border-neutral-100 shadow-sm">
                        <View className="w-16 h-16 bg-neutral-50 rounded-full items-center justify-center mb-4">
                            <Image source={icons.chat} className="w-8 h-8" tintColor="#C4C4C4" resizeMode="contain" />
                        </View>
                        <Text className="text-neutral-400 font-JakartaBold mb-6">No active tickets yet</Text>
                        <TouchableOpacity
                            onPress={() => router.push("/(root)/support/new-ticket")}
                            className="bg-[#9D00FF] px-8 py-3.5 rounded-full shadow-lg shadow-purple-200"
                        >
                            <Text className="text-white font-JakartaBold">Chat with Support</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default SupportHome;
