import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { getDriverProfile } from "@/lib/auth-api";

const Page = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [isDriver, setIsDriver] = useState<boolean | null>(null);
  const [checkingDriver, setCheckingDriver] = useState(false);

  useEffect(() => {
    const checkDriverStatus = async () => {
      if (isSignedIn) {
        setCheckingDriver(true);
        try {
          const profile = await getDriverProfile();
          if (profile && profile.driver) {
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
  }, [isLoaded, isSignedIn]);

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
  }

  return <Redirect href="/(auth)/welcome" />;
};

export default Page;
