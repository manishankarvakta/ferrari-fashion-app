import { CustomDrawerToggleButton } from "@/components";
import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useWarehousesQuery } from "@/store/api/warehouseApi"; // ✅ change to your actual import
import { WarehouseTypes } from "@/types/warehouse";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { isLoading } from "expo-font";
import { Link, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, Text, TextInput, useColorScheme, View } from "react-native";

const Warehouse = () => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  const { userInfo, fetchUser } = useGlobalContext();
  // const type = userInfo?.type
  const [warehouse, setWarehouse] = useState<WarehouseTypes[]>([]);

  // ✅ RTK Query mutation hook
  const { data, isError, isSuccess, refetch } = useWarehousesQuery();
  console.log('warehouse data', data)
  useEffect(() => {
    if (isSuccess) {
      setWarehouse(data);
    }
  }, [isSuccess, data]);

  // console.log("WAREHOUSE:", data, isError, isSuccess, refetch);

  const warehouseFilter = (text: string) => {
    if (text.length > 0) {
      setWarehouse(data?.filter((wh) => wh.name.includes(text)) ?? []);
    } else {
      setWarehouse(data ?? []);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Warehouse",
      //@ts-ignore
      headerStyle: {
        backgroundColor: `${Colors[colorScheme ?? "dark"].backgroundColor}`,
      },
      headerLeft: () => <CustomDrawerToggleButton tintColor="#ffffff" />,
      headerRight: () => (
        <View className="flex flex-row items-center me-4">
          <Link href="/warehouse/warehouseEdit" className="text-white">
            <View className="flex flex-row items-center">
              <Ionicons name="add" size={24} color="gray" />
              <Text className="text-gray-200 text-lg">Add</Text>
            </View>
          </Link>
        </View>
      ),
      //@ts-ignore
      headerTintColor: `${Colors[colorScheme ?? "dark"].backgroundColor}`,
      headerTitleStyle: { fontWeight: "bold", fontSize: 18, color: "#ffffff" },
      headerShadowVisible: true,
      headerTitleAlign: "center",
      headerShown: true,
    });
  }, [navigation, userInfo?.permissions]);

  return (
    <View className="flex-1 bg-dark m-4">
      {/* Search bar */}

      <View className="flex flex-row justify-between mb-4 items-center h-12 w-full px-4 bg-black-200 rounded-full p-2 mx-auto">
        <TextInput
          placeholder="Search Warehouse"
          className="p-2 placeholder:text-gray-400 text-gray-300"
          onChangeText={(text) => warehouseFilter(text)}
        />
        <Ionicons name="search" size={18} color="#fdb714" />
      </View>
      <ScrollView>
        {/* Warehouse list */}
        {warehouse?.map((wh) => (
          <Link
            href={`/warehouse/details/${wh?._id}`}
            key={wh._id}
            className="p-4 mb-3 rounded-lg bg-black-200 border-zinc-800 items-center flex  justify-between"
          >
            <View className="flex w-full flex-row justify-between items-center mb-2">
              <View className="flex flex-row justify-center items-center">
                {wh.type === "factory" ? (
                  <MaterialIcons
                    name="factory"
                    size={20}
                    color="#fdb714"
                    className="me-2"
                  />
                ) : (
                  <MaterialIcons
                    name="storefront"
                    size={20}
                    color="#fdb714"
                    className="me-2"
                  />
                )}
                <Text className="text-lg font-bold text-white">{wh.name}</Text>
              </View>
              <Text className="text-sm font-bold text-primary">{wh.status}</Text>
            </View>
            <View className="flex flex-row justify-between items-center w-full">
              <Text className="text-sm text-gray-200 w-[60%]">{wh.address}</Text>
              <Text className="text-lg text-gray-200">{wh.phone}</Text>
            </View>
          </Link>
        ))}
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
};

export default Warehouse;
