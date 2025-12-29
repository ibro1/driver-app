import { useUser } from "@/lib/auth-context";
import { Image, ScrollView, Text, View, TouchableOpacity, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/constants";
import { router } from "expo-router";
import Avatar from "@/components/Avatar";
import { useFetch } from "@/lib/fetch";
import Skeleton from "@/components/Skeleton";
import Constants from "expo-constants";

const Profile = () => {
  const { user, signOut } = useUser();
  const { data: profileData, loading, error } = useFetch<any>("/api/driver/profile");
  const { data: settingsData } = useFetch<any>("/api/settings");

  // Get current app version
  const currentVersion = Constants.expoConfig?.version || "1.0.0";

  // Check if update is needed
  const minDriverVersion = settingsData?.minDriverVersion || "1.0.0";
  const needsUpdate = compareVersions(currentVersion, minDriverVersion) < 0;

  // Version comparison function
  function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 < num2) return -1;
      if (num1 > num2) return 1;
    }

    return 0;
  }

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const driver = profileData?.driver;
  const vehicle = profileData?.vehicle;
  const stats = profileData?.stats;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-JakartaBold my-5 text-neutral-900">My Profile</Text>

        {/* Update Notice Banner */}
        {needsUpdate && (
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mr-3">
                <Image source={icons.info} className="w-5 h-5" tintColor="#F59E0B" resizeMode="contain" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-JakartaBold text-amber-900 mb-1">Update Available</Text>
                <Text className="text-sm font-JakartaMedium text-amber-700 mb-3">
                  A new version of the app is required. Current: v{currentVersion} → Required: v{minDriverVersion}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const playStoreId = process.env.EXPO_PUBLIC_DRIVER_PLAY_STORE_ID || "ng.karride.driver";
                    const appStoreId = process.env.EXPO_PUBLIC_DRIVER_APP_STORE_ID || "id123456789";
                    const storeUrl =
                      Constants.platform?.android
                        ? `https://play.google.com/store/apps/details?id=${playStoreId}`
                        : `https://apps.apple.com/app/karride-driver/${appStoreId}`;
                    Linking.openURL(storeUrl);
                  }}
                  className="bg-amber-500 py-2.5 px-4 rounded-xl"
                >
                  <Text className="text-white font-JakartaBold text-center text-sm">Update Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Header Section */}
        <View className="flex items-center justify-center mb-8">
          <View className="relative">
            <Avatar
              source={user?.image}
              name={user?.name || "Driver"}
              size={28}
              className="border-4 border-white shadow-lg"
            />
            <View className="absolute bottom-1 right-1 bg-[#9D00FF] w-6 h-6 rounded-full border-2 border-white items-center justify-center shadow-sm">
              <Image source={icons.checkmark} className="w-3 h-3" tintColor="white" />
            </View>
          </View>

          <Text className="text-2xl font-JakartaBold mt-4 text-neutral-800">
            {user?.name || "Driver Name"}
          </Text>
          <Text className="text-base text-neutral-500 mb-2 font-JakartaMedium">{user?.email}</Text>

          <View className="flex-row items-center bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
            <Image source={icons.star} className="w-3.5 h-3.5 mr-1.5" tintColor="#FFD700" />
            <Text className="text-xs font-JakartaBold text-neutral-800">
              {loading ? (
                <Text>...</Text>
              ) : (
                <>
                  {driver?.rating?.toFixed(1) || "5.0"}
                  <Text className="text-neutral-500 font-JakartaRegular text-[10px]"> ({driver?.ratingCount || 0} reviews)</Text>
                </>
              )}
            </Text>
          </View>
        </View>

        {/* Wallet Balance Card */}
        <View className="overflow-hidden rounded-3xl shadow-lg shadow-purple-200 mb-8">
          <LinearGradient
            colors={["#9D00FF", "#6A0DAD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6"
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white/80 font-JakartaMedium text-sm tracking-wide">Wallet Balance</Text>
              <View className="bg-white/20 p-2 rounded-xl">
                <Image source={icons.dollar} className="w-4 h-4" tintColor="white" resizeMode="contain" />
              </View>
            </View>
            {loading ? (
              <Skeleton width={150} height={40} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <Text className="text-3xl font-JakartaExtraBold text-white tracking-tight">
                ₦{driver?.walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-neutral-50 p-5 rounded-2xl flex-1 mr-2 items-center border border-neutral-100 shadow-sm shadow-neutral-100">
            {loading ? (
              <Skeleton width={40} height={30} style={{ marginBottom: 4 }} />
            ) : (
              <Text className="text-2xl font-JakartaBold text-[#9D00FF]">{stats?.totalRides || 0}</Text>
            )}
            <Text className="text-[10px] text-neutral-400 font-JakartaBold mt-1 uppercase tracking-wider">Total Rides</Text>
          </View>
          <View className="bg-neutral-50 p-5 rounded-2xl flex-1 ml-2 items-center border border-neutral-100 shadow-sm shadow-neutral-100">
            {loading ? (
              <Skeleton width={40} height={30} style={{ marginBottom: 4 }} />
            ) : (
              <Text className="text-2xl font-JakartaBold text-neutral-800">{stats?.yearsActive || 1}</Text>
            )}
            <Text className="text-[10px] text-neutral-400 font-JakartaBold mt-1 uppercase tracking-wider">Years Active</Text>
          </View>
        </View>

        {/* Vehicle Info Card */}
        <View className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm mb-8">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-lg font-JakartaBold text-neutral-800">Vehicle Details</Text>
            <TouchableOpacity onPress={() => router.push("/(root)/edit-vehicle")}>
              <Text className="text-[#9D00FF] font-JakartaBold text-sm">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-[#9D00FF]/5 rounded-xl items-center justify-center mr-4">
              <Image source={icons.list} className="w-6 h-6" resizeMode="contain" tintColor="#9D00FF" />
            </View>
            <View>
              {loading ? (
                <>
                  <Skeleton width={120} height={20} style={{ marginBottom: 6 }} />
                  <Skeleton width={180} height={16} />
                </>
              ) : (
                <>
                  <Text className="text-base font-JakartaBold text-neutral-800">
                    {vehicle?.make} {vehicle?.model}
                  </Text>
                  <Text className="text-sm text-neutral-500 font-JakartaMedium">
                    {vehicle?.plateNumber} • {vehicle?.color}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm mb-8">
          <TouchableOpacity
            onPress={() => router.push("/(root)/edit-profile")}
            className="flex-row items-center p-4 border-b border-neutral-50"
          >
            <View className="w-8 h-8 bg-neutral-50 rounded-lg items-center justify-center mr-3">
              <Image source={icons.person} className="w-4 h-4" resizeMode="contain" tintColor="#9D00FF" />
            </View>
            <Text className="text-sm font-JakartaSemiBold text-neutral-800 flex-1">Edit Profile</Text>
            <Image source={icons.arrowDown} className="w-3 h-3 -rotate-90" tintColor="#C4C4C4" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(root)/emergency-contacts")}
            className="flex-row items-center p-4"
          >
            <View className="w-8 h-8 bg-neutral-50 rounded-lg items-center justify-center mr-3">
              <Image source={icons.phone} className="w-4 h-4" resizeMode="contain" tintColor="#9D00FF" />
            </View>
            <Text className="text-sm font-JakartaSemiBold text-neutral-800 flex-1">Emergency Contacts</Text>
            <Image source={icons.arrowDown} className="w-3 h-3 -rotate-90" tintColor="#C4C4C4" />
          </TouchableOpacity>
        </View>

        {/* Compliance & Legal */}
        <View className="mb-8">
          <Text className="text-lg font-JakartaBold text-neutral-800 mb-4 ml-1">Legal & Compliance</Text>
          <View className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
            {[
              { icon: icons.lock, label: "Privacy Policy", url: "https://karride.ng/privacy-policy" },
              { icon: icons.term, label: "Terms of Service", url: "https://karride.ng/terms-of-service" },
            ].map((item, index, arr) => (
              <TouchableOpacity
                key={index}
                onPress={() => Linking.openURL(item.url)}
                className={`flex-row items-center p-4 ${index !== arr.length - 1 ? 'border-b border-neutral-50' : ''}`}
              >
                <View className="w-8 h-8 bg-neutral-50 rounded-lg items-center justify-center mr-3">
                  <Image source={item.icon} className="w-4 h-4" resizeMode="contain" tintColor="#9D00FF" />
                </View>
                <Text className="text-sm font-JakartaSemiBold text-neutral-800 flex-1">{item.label}</Text>
                <Image source={icons.arrowDown} className="w-3 h-3 -rotate-90" tintColor="#C4C4C4" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Actions */}
        <View className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
          {[
            { icon: icons.chat, label: "Support & Help", route: "/(root)/support" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className="flex-row items-center p-4 border-b border-neutral-50"
            >
              <View className="w-8 h-8 bg-neutral-50 rounded-lg items-center justify-center mr-3">
                <Image source={item.icon} className="w-4 h-4" resizeMode="contain" tintColor="#9D00FF" />
              </View>
              <Text className="text-sm font-JakartaSemiBold text-neutral-800 flex-1">{item.label}</Text>
              <Image source={icons.arrowDown} className="w-3 h-3 -rotate-90" tintColor="#C4C4C4" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center p-4"
          >
            <View className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center mr-3">
              <Image source={icons.out} className="w-4 h-4" resizeMode="contain" tintColor="#EF4444" />
            </View>
            <Text className="text-sm font-JakartaSemiBold text-red-500 flex-1">Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
