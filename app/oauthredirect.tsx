import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function OAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after a brief moment
    const timer = setTimeout(() => {
      router.replace("/");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#0286FF" />
    </View>
  );
}
