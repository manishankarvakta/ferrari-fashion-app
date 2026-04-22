import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router, usePathname, useSegments } from "expo-router";
import Drawer from "expo-router/drawer";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import * as globalCon from "@/context/GlobalProvider"
import { useGetuserPhotoQuery } from "@/store/api/userApi";
import { StatusBar } from "expo-status-bar";
import { useGlobalContext } from "../../context/GlobalProvider";
const profile = require("@/assets/images/profile.jpg");

const TabIcon = ({ icon, iconAlt, color, pathname, focused }) => {
  const isFocused = Array.isArray(focused)
    ? focused.includes(pathname)
    : focused === pathname;

  return (
    <>
      <Ionicons
        //@ts-ignore
        name={isFocused ? icon : iconAlt}
        size={isFocused ? 24 : 26}
        color={isFocused ? "#FDB714" : color}
        //@ts-ignore
        style={{ marginLeft: isFocused ? 10 : 0 }}
      />
      {
        // isFocused && <Text style={{ color: color, fontSize: 12, marginLeft: 5 }}>{name}</Text>
      }
      {/* {isFocused && <Text className='text-slate-700 font-pregular text-xs'>{name}</Text>}  */}
    </>
  );
};


const CustomDrawerComponent = (props: any) => {
  // Set the animation options. This is optional.
  // SplashScreen.setOptions({
  //   duration: 1000,
  //   fade: true,
  // });


  // const userInfo = useSelector((state: any) => state.user);

  const { userInfo } = useGlobalContext();

  const { data, isSuccess, refetch } = useGetuserPhotoQuery({ id: userInfo?.id });
  // console.log("User Photo Data:", data, isSuccess);

  // console.log(userInfo)

  const pathname = usePathname();
  const { logout } = useGlobalContext();

  // console.log("userInfo", userInfo, );




  return (
    <DrawerContentScrollView {...props}>
      <StatusBar style="light" />
      <TouchableOpacity onPress={() => router.push("/")} className="mx-2 pe-3">
        <View className="flex flex-row gap-x-3 border-b items-center border-slate-400 pb-4 mb-2">
          <Image source={data?.photo !== null ? { uri: data?.photo } : profile} className="w-12 h-12 rounded-full" />

          <View>
            <Text className="text-xl text-gray-200 font-pmedium">
              {userInfo?.name}
            </Text>
            <Text className="text-base text-gray-200">
              <Text className="text-gray-200"> {userInfo?.type} | </Text>
              {userInfo?.phone}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {userInfo?.type === 'admin' &&
        <DrawerItem
          icon={({ color }) => (
            <TabIcon
              pathname={pathname}
              icon="home"
              iconAlt="home-outline"
              color={color}
              focused={["/"]}
            />
          )}
          label={"Home"}
          labelStyle={[
            styles.labelStyle,
            { color: pathname === "/" ? "#ffffff" : "#ffffff" },
          ]}
          style={{ backgroundColor: pathname === "/" ? "#000000" : "#131313" }}
          onPress={() => router.push("/(drawer)/(tabs)")}
        />
      }
      {
        userInfo?.type === "admin" &&
        <DrawerItem
          icon={({ color }) => (
            <TabIcon
              pathname={pathname}
              icon="storefront"
              iconAlt="storefront-outline"
              color={color}
              focused={["/warehouse"]}
            />
          )}
          label={"Warehouse"}
          labelStyle={[
            styles.labelStyle,
            { color: pathname === "/warehouse" ? "#ffffff" : "#ffffff" },
          ]}
          style={{
            backgroundColor: pathname === "/warehouse" ? "#000000" : "#131313",
          }}
          onPress={() => router.push("/(drawer)/warehouse")}
        />
      }
      {/* {userInfo?.permissions?.users && */}

      <DrawerItem
        icon={({ size, color, focused }) => (
          <TabIcon
            pathname={pathname}
            icon="archive"
            iconAlt="archive-outline"
            color={color}
            focused={["/products"]}
          />
        )}
        label={"Stock"}
        labelStyle={[
          styles.labelStyle,
          { color: pathname === "/products" ? "#ffffff" : "#ffffff" },
        ]}
        style={{
          backgroundColor: pathname === "/products" ? "#000000" : "#131313",
        }}
        onPress={() => router.push("/(drawer)/(tabs)/(stock)/products")}
      />
      {/* } */}

      {/* {userInfo?.permissions?.suppliers && */}

      <DrawerItem
        icon={({ size, color, focused }) => (
          <TabIcon
            pathname={pathname}
            icon="people"
            iconAlt="people-outline"
            color={color}
            focused={["/suppliers"]}
          />
        )}
        label={"Suppliers"}
        labelStyle={[
          styles.labelStyle,
          {
            color: pathname == "/suppliers" ? "#ffffff" : "#ffffff",
          },
        ]}
        style={{
          backgroundColor: pathname == "/suppliers" ? "#000000" : "#131313",
        }}
        onPress={() => router.push("/(drawer)/(tabs)/(connects)/suppliers")}
      />
      {/* } */}

      {/* {userInfo?.permissions?.customers && */}

      <DrawerItem
        icon={({ size, color, focused }) => (
          <TabIcon
            pathname={pathname}
            icon="people"
            iconAlt="people-outline"
            color={color}
            focused={["/customers"]}
          />
        )}
        label={"Customers"}
        labelStyle={[
          styles.labelStyle,
          {
            color: pathname == "/customers" ? "#ffffff" : "#ffffff",
          },
        ]}
        style={{
          backgroundColor: pathname == "/customers" ? "#000000" : "#131313",
        }}
        onPress={() => router.push("/(drawer)/(tabs)/(connects)/customers")}
      />
      {/* } */}
      {/* {userInfo?.permissions?.sales && */}

      <DrawerItem
        icon={({ size, color, focused }) => (
          <TabIcon
            pathname={pathname}
            icon="cart"
            iconAlt="cart-outline"
            color={color}
            focused={["/sales"]}
          />
        )}
        label={"Sales"}
        labelStyle={[
          styles.labelStyle,
          {
            color: pathname == "/sales" ? "#ffffff" : "#ffffff",
          },
        ]}
        style={{
          backgroundColor: pathname == "/sales" ? "#000000" : "#131313",
        }}
        onPress={() => router.push("/(drawer)/sales")}
      />
      {/* } */}
      {/* {userInfo?.permissions?.users && */}

      <DrawerItem
        icon={({ size, color, focused }) => (
          <TabIcon
            pathname={pathname}
            icon="cart-outline"
            iconAlt="cart-outline"
            color={color}
            focused={["/purchases"]}
          />
        )}
        label={"Purchases"}
        labelStyle={[
          styles.labelStyle,
          {
            color: pathname == "/purchases" ? "#ffffff" : "#ffffff",
          },
        ]}
        style={{
          backgroundColor: pathname == "/purchases" ? "#000000" : "#131313",
        }}
        onPress={() => router.push("/(drawer)/purchases")}
      />
      {/* } */}
      {/* {userInfo?.permissions?.users && */}

      <DrawerItem
        icon={({ size, color, focused }) => (
          <TabIcon
            pathname={pathname}
            icon="wallet-outline"
            iconAlt="wallet-outline"
            color={color}
            focused={["/account"]}
          />
        )}
        label={"Accounts"}
        labelStyle={[
          styles.labelStyle,
          {
            color: pathname === "/account" ? "#ffffff" : "#ffffff",
          },
        ]}
        style={{
          backgroundColor: pathname === "/account" ? "#000000" : "#131313",
        }}
        onPress={() => router.push("/(drawer)/(tabs)/(account)")}
      />
      {/* } */}
      {/* {userInfo?.permissions?.users && */}
      {userInfo.type === 'admin' &&
        <DrawerItem
          icon={({ size, color, focused }) => (
            <TabIcon
              pathname={pathname}
              icon="person"
              iconAlt="person-outline"
              color={color}
              focused={["/user"]}
            />
          )}
          label={"Users"}
          labelStyle={[
            styles.labelStyle,
            {
              color: pathname === "/user" ? "#ffffff" : "#ffffff",
            },
          ]}
          style={{
            backgroundColor: pathname === "/user" ? "#000000" : "#131313",
          }}
          onPress={() => router.push("/user")}
        />
      }
      {/* } */}
      {/* {userInfo?.permissions?.users &&  */}
      <DrawerItem
        icon={({ size, color, focused }) => (
          <TabIcon
            pathname={pathname}
            icon="archive"
            iconAlt="archive-outline"
            color={color}
            focused={["/reports"]}
          />
        )}
        label={"Reports"}
        labelStyle={[
          styles.labelStyle,
          { color: pathname == "/reports" ? "#ffffff" : "#ffffff" },
        ]}
        style={{
          backgroundColor: pathname === "/reports" ? "#000000" : "#131313",
        }}
        onPress={() => router.push("/(drawer)/reports")}
      />
      {/* } */}
      {/* <DrawerItem
        icon={({ size, color, focused }) => (
          <TabIcon
            pathname={pathname}
            icon="cog"
            iconAlt="cog-outline"
            color={color}
            focused={["/setting"]}
          />
        )}
        label={"Setting"}
        labelStyle={[
          styles.labelStyle,
          { color: pathname == "/setting" ? "#ffffff" : "#ffffff" },
        ]}
        style={{
          backgroundColor: pathname == "/setting" ? "#000000" : "#131313",
        }}
        onPress={() => router.push("/settings/setting")}
      /> */}
      <TouchableOpacity
        onPress={() => logout()}
        className="flex flex-row ms-5 mt-4"
      >
        <Ionicons name="power" size={24} color={"#ff6a39"} />
        <Text className="text-xl font-pmedium text-gray-400 ms-3 ">Logout</Text>
      </TouchableOpacity>

      <View className="flex flex-row items-center justify-center mt-10 pt-12 ms-6">
        <Text className="text-gray-500 text-sm">Powerd By Techsoul</Text>
      </View>
    </DrawerContentScrollView>
  );
};



const DrawerLayout = () => {
  const { userInfo, loading } = useGlobalContext();
  const segments = useSegments();

  useEffect(() => {
    if (loading || segments.length === 0) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!userInfo?.isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    }
  }, [userInfo?.isLoggedIn, segments, loading]);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerComponent {...props} />}
      screenOptions={{ headerShown: false }}
    />
  );
};


export default DrawerLayout;

const styles = StyleSheet.create({
  labelStyle: { fontSize: 18, fontWeight: 300 },
});
