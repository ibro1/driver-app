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

  console.log("OAuth Config:", {
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  console.log("OAuth Request:", request);

  useEffect(() => {
    handleGoogleSignInResponse();
  }, [response]);

  const handleGoogleSignInResponse = async () => {
    console.log("OAuth Response:", response);
    if (response?.type === "success") {
      const { authentication, params } = response;
      console.log("Authentication:", authentication);
      console.log("Params:", params);

      if (authentication?.idToken) {
        try {
          console.log("Calling signInWithGoogle with idToken...");
          await signInWithGoogle(authentication.idToken);
          console.log("Google sign in successful, refreshing session...");
          await refreshSession();
          console.log("Session refreshed, navigating to home...");
          router.replace("/(root)/(tabs)/home");
        } catch (error: any) {
          console.error("Google sign in error:", error);
          Alert.alert("Error", error.message || "Google sign in failed");
        }
      }
    } else if (response?.type === "error") {
      console.error("OAuth Error:", response.error);
      Alert.alert("OAuth Error", response.error?.message || "Authentication failed");
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("Google Sign In button clicked");
    try {
      console.log("Calling promptAsync...");
      const result = await promptAsync();
      console.log("PromptAsync result:", result);
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
