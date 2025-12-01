import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    withTiming,
} from "react-native-reanimated";
import { icons } from "@/constants";
import { Image } from "react-native";

interface SwipeButtonProps {
    onSwipeComplete: () => void;
    title: string;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    containerHeight?: number;
    thumbSize?: number;
    thumbColor?: string;
    trackColor?: string;
}

const SwipeButton = ({
    onSwipeComplete,
    title,
    loading = false,
    disabled = false,
    className = "",
    containerHeight = 60,
    thumbSize = 50,
    thumbColor = "#fff",
    trackColor = "#0286FF",
}: SwipeButtonProps) => {
    const [swiped, setSwiped] = useState(false);
    const translateX = useSharedValue(0);
    const BUTTON_WIDTH = 300; // Approximate width, or use onLayout to measure
    const SWIPE_THRESHOLD = BUTTON_WIDTH - thumbSize - 10;

    const handleComplete = () => {
        setSwiped(true);
        onSwipeComplete();
        // Reset after a delay if needed, or keep it swiped until parent resets
        setTimeout(() => {
            translateX.value = withSpring(0);
            setSwiped(false);
        }, 1000);
    };

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            if (disabled || loading || swiped) return;
            translateX.value = Math.max(0, Math.min(event.translationX, SWIPE_THRESHOLD));
        })
        .onEnd(() => {
            if (disabled || loading || swiped) return;
            if (translateX.value > SWIPE_THRESHOLD * 0.8) {
                translateX.value = withSpring(SWIPE_THRESHOLD);
                runOnJS(handleComplete)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const textOpacityStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(translateX.value > 20 ? 0 : 1),
        };
    });

    return (
        <View
            className={`relative justify-center items-center rounded-full overflow-hidden ${className}`}
            style={{
                height: containerHeight,
                backgroundColor: disabled ? "#ccc" : trackColor,
                width: "100%",
            }}
        >
            <Animated.Text
                style={[textOpacityStyle]}
                className="text-white font-JakartaBold text-lg absolute z-10"
            >
                {loading ? "Processing..." : title}
            </Animated.Text>

            <View
                className="absolute left-1 top-1 bottom-1 z-20"
                style={{ width: thumbSize, height: thumbSize }}
            >
                <GestureDetector gesture={pan}>
                    <Animated.View
                        style={[
                            animatedStyle,
                            {
                                width: thumbSize,
                                height: thumbSize,
                                borderRadius: thumbSize / 2,
                                backgroundColor: thumbColor,
                                justifyContent: "center",
                                alignItems: "center",
                            },
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={trackColor} />
                        ) : (
                            <Image source={icons.point} className="w-6 h-6" resizeMode="contain" />
                            //   <Text style={{ color: trackColor, fontWeight: "bold" }}>{">"}</Text>
                        )}
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
};

export default SwipeButton;
