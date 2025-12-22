import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";

const { width } = Dimensions.get("window");

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = activeIndex === onboarding.length - 1;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <SafeAreaView className="flex-1 items-center justify-between bg-white">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-in");
        }}
        className="w-full flex justify-end items-end p-5"
      >
        <Text className="text-black text-md font-JakartaBold">Skip</Text>
      </TouchableOpacity>

      <View className="flex-1 w-full justify-center items-center">
        <FlatList
          ref={flatListRef}
          data={onboarding}
          renderItem={({ item }) => (
            <View className="flex items-center justify-center p-5" style={{ width }}>
              <Image
                source={item.image}
                className="w-full h-[300px]"
                resizeMode="contain"
              />
              <View className="flex flex-row items-center justify-center w-full mt-10">
                <Text className="text-black text-3xl font-bold mx-10 text-center">
                  {item.title}
                </Text>
              </View>
              <Text className="text-md font-JakartaSemiBold text-center text-[#858585] mx-10 mt-3">
                {item.description}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
        />

        {/* Dots */}
        <View className="flex-row justify-center mt-5 absolute bottom-10">
          {onboarding.map((_, index) => (
            <View
              key={index}
              className={`w-[32px] h-[4px] mx-1 rounded-full ${index === activeIndex ? "bg-[#0286FF]" : "bg-[#E2E8F0]"
                }`}
            />
          ))}
        </View>
      </View>

      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() => {
          if (isLastSlide) {
            router.replace("/(auth)/sign-in");
          } else {
            flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
          }
        }}
        className="w-11/12 mt-10 mb-5"
      />
    </SafeAreaView>
  );
};

export default Home;
