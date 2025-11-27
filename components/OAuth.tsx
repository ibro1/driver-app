import { router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { signInWithGoogle } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";

WebBrowser.maybeCompleteAuthSession();

const OAuth = () => {
  const { refreshSession } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    handleGoogleSignInResponse();
  }, [response]);

  const handleGoogleSignInResponse = async () => {
    if (response?.type === "success") {
      const { authentication } = response;

      if (authentication?.idToken) {
        try {
          await signInWithGoogle(authentication.idToken);
          await refreshSession();
          Alert.alert("Success", "You have successfully signed in with Google");
          router.replace("/(root)/(tabs)/home");
        } catch (error: any) {
          console.error("Google sign in error:", error);
          Alert.alert("Error", error.message || "Google sign in failed");
        }
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      Alert.alert("Error", "Failed to initiate Google sign in");
    }
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title="Log In with Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
        disabled={!request}
      />
    </View>
  );
};

export default OAuth;
