import React from "react";
import { Image, Text, View } from "react-native";

interface AvatarProps {
    source?: string | null;
    name: string;
    size?: number;
    className?: string;
}

const Avatar = ({ source, name, size = 12, className }: AvatarProps) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    if (source) {
        return (
            <Image
                source={{ uri: source }}
                className={`rounded-full ${className}`}
                style={{ width: size * 4, height: size * 4 }}
            />
        );
    }

    return (
        <View
            className={`rounded-full bg-blue-100 items-center justify-center ${className}`}
            style={{ width: size * 4, height: size * 4 }}
        >
            <Text className="text-blue-600 font-JakartaBold text-lg">{initials}</Text>
        </View>
    );
};

export default Avatar;
