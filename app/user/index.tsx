import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { useUsersQuery } from "@/store/api/userApi";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import profile from "@/assets/images/profile.jpg";
import { useGlobalContext } from "@/context/GlobalProvider";
import { StatusBar } from "expo-status-bar";
import { useProxyPhotoUrlQuery } from "@/store/api/uploadApi";

import { ScreenLoader } from "@/components";

const Profile = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [isSaved, setIsSaved] = useState(true);
  const [user, setUser] = useState([]);
    const { userInfo } = useGlobalContext();

  const { data, isSuccess, isError, isLoading } = useUsersQuery({
    limit: 10,
    aamarId: userInfo?.aamarId,
    q: "",
  });

  // console.log("User Info in User Index:", data);

  useEffect(() => {
    if (isSuccess) {
      setUser(data);
    }
  }, [isSuccess, data]);

  // console.log("USER DATA", user);
  const handleUpdateSetting = async () => {
    try {
      const updatedData = {
        ...userInfo?.storeSettings,
        paymentMethods: paymentOptions || [],
      };

      console.log("✅ Successfully updated:", response);
    } catch (error) {
      console.error("❌ Update failed:", error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex flex-row me-4">
          <TouchableOpacity
            className="flex flex-row gap-2 items-center"
            onPress={() => handleUpdateSetting()}
          >
            <Text className={`text-lg ${isSaved ? "#ffffff" : "#ffffff"}`}>
              <TouchableOpacity
                className="flex items-center flex-row"
                onPress={() => router.push("/user/add-user")}
              >
                <Ionicons name="add" size={24} color="#ffffff" />
                <Text className="text-white text-xl font-pmedium">Add</Text>
              </TouchableOpacity>
            </Text>
          </TouchableOpacity>
        </View>
      ), // normal user dakta parba na
      headerLeft: () => (
        <View className="flex flex-row me-4">
          <TouchableOpacity onPress={() => router.push("/")}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ),
      title: "Users",
      headerStyle: {
        backgroundColor: Colors[colorScheme ?? "dark"].backgroundColor,
      },
      headerTintColor: `${Colors[colorScheme ?? "dark"].backgroundColor}`,
      headerTitleStyle: { fontWeight: "bold", fontSize: 18, color: "#ffffff" },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerShown: true,
    });
  }, [navigation, colorScheme, isSaved]);

  const router = useRouter();


  const handleLogout = () => {
    // Add logout logic here
    console.log("Logout pressed");
  };

  const handleEditProfile = () => {
    // Add edit profile logic here
    router.push("/user/add-user");
  };

  if (isLoading) {
    return <ScreenLoader message="Loading users..." />;
  }
  
  return (
    <ScrollView className="flex-1 bg-dark ">

      <StatusBar style="light" backgroundColor="#000" />
      {data?.map((user) => (
        <TouchableOpacity
          key={user._id}
          onPress={() => router.push(`/user/${user._id}`)}
          className=" p-2"
        >
          <View key={user.id} className="bg-black-200 rounded-lg mr-2 ms-2 mt-1 p-4">

            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-orange-500 items-center justify-center mr-4">
                <Image source={user?.photo !== null && user?.photo !== "" && user?.photo !== undefined ?{uri:user?.photo}:profile} height={80} width={80} className="w-12 h-12 rounded-full" />
              </View>
              <View className="flex-1">

                <Text className="text-yellow-400 text-lg font-bold">
                  {user.name}
                </Text>
                <Text className="text-white text-sm">{user.type}</Text>
              </View>
              <View className="flex-col items-end">
                <Text className=" text-sm text-primary">{user.status}</Text>
                <Text className="text-white text-sm">{user.phone}</Text>

              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Profile;
