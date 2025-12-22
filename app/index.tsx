import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { getDriverProfile } from "@/lib/auth-api";

const Page = () => {
  const { user, isSignedIn, isLoaded } = useAuth();
  const [isDriver, setIsDriver] = useState<boolean | null>(null);
  const [checkingDriver, setCheckingDriver] = useState(false);

  useEffect(() => {
    const checkDriverStatus = async () => {
      if (isSignedIn && user) {
        setCheckingDriver(true);
        try {
          // getDriverProfile now takes userId optionally or uses session
          // Assuming getDriverProfile handles it
          const profile = await getDriverProfile(user.id);
          if (profile && profile.driver && profile.vehicle) {
            setIsDriver(true);
          } else {
            setIsDriver(false);
          }
        } catch (error) {
          console.error("Failed to check driver status", error);
          setIsDriver(false);
        } finally {
          setCheckingDriver(false);
        }
      }
    };

    if (isLoaded && isSignedIn) {
      checkDriverStatus();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || (isSignedIn && checkingDriver)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  if (isSignedIn) {
    if (isDriver === true) {
      return <Redirect href="/(root)/(tabs)/home" />;
    } else if (isDriver === false) {
      return <Redirect href="/(auth)/onboarding" />;
    }
    // If checkingDriver is false but isDriver is null (shouldn't happen if signed in), wait or default
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(auth)/welcome" />;
};

export default Page;
