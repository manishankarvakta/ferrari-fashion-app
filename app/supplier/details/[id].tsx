import { useGlobalContext } from "@/context/GlobalProvider";
import { useSupplierQuery } from "@/store/api/supplierApi";
import { Ionicons } from "@expo/vector-icons";
import { addMonths, subMonths, format } from "date-fns";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

const SupplierDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const userInfo = useGlobalContext();

  const { data, refetch } = useSupplierQuery({
    _id: id,
    date: currentDate,
  });

  useEffect(() => {
    refetch();
  }, [id, currentDate]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${data?.supplier?.name || "Supplier Details"}`,
      headerStyle: { backgroundColor: "#000000" },
      headerTintColor: "#ffffff",
      headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () =>
        userInfo.permissions?.suppliers?.edit && (
          <TouchableOpacity
            onPress={() => router.push(`/supplier/${Array.isArray(id) ? id[0] : id}`)}
            className="flex flex-row items-center gap-2"
          >
            <Ionicons name="pencil-outline" size={24} color="white" />
            <Text className="text-white text-lg">Edit</Text>
          </TouchableOpacity>
        ),
    });
  }, [navigation, data]);

  // formatted date
  const formattedDate = {
    month: currentDate.toLocaleString("en-US", { month: "long" }),
    year: currentDate.getFullYear(),
  };

  // months array for picker grid
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // month/year picker functions
  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    const now = new Date();
    if (nextMonth <= now) setCurrentDate(nextMonth);
  };

  return (
    <>
      <ScrollView>
        {/* Supplier Info */}
        <View className="px-4 py-4 space-y-2">
          <View key={data?.supplier?._id} className="mb-4">
            <View className="flex flex-row ">
              <Ionicons name="business-outline" size={18} color={"#fdb714"} />
              <Text className="text-gray-200 text-lg ms-2">{data?.supplier?.company}</Text>
            </View>
            <View className="flex flex-row ">
              <Ionicons name="phone-portrait-sharp" size={18} color={"#fdb714"} />
              <Text className="text-gray-200 text-[18px] ms-2">{data?.supplier?.phone}</Text>
            </View>
            <View className="flex flex-row ">
              <Ionicons name="location-outline" size={16} color={"#fdb714"} />
              <Text className="text-gray-400 p-1 ms-2">{data?.supplier?.address}</Text>
            </View>
          </View>
        </View>

        {/* Calendar header */}
        <View className="m-2 p-2 flex-1">
          <View className="flex flex-row justify-between items-center bg-black-200 p-2 rounded-lg">
            <TouchableOpacity onPress={goToPreviousMonth} className="p-2">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex flex-row items-center px-4 rounded-lg"
            >
              <Text className="text-primary text-lg">{formattedDate.month}</Text>
              <Text className="text-white text-lg ml-2">{formattedDate.year}</Text>
              <Ionicons name="calendar-outline" size={20} color="#fdb714" className="ml-2" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToNextMonth}
              className={`p-2 ${currentDate >= new Date() ? "opacity-50" : ""}`}
              disabled={currentDate >= new Date()}
            >
              <Ionicons
                name="arrow-forward"
                size={24}
                color={currentDate >= new Date() ? "#666" : "white"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Start & Current Balance */}
        <View className="flex flex-row justify-evely items-center mx-auto">
          <View className="flex bg-black-200 items-center justify-center p-5 text-center w-[180px] rounded-lg m-1">
            <Text className="text-white text-xl">Starting balance</Text>
            <Text className="text-primary font-bold text-center text-xl">
              {data?.supplier?.balance} <Text className="text-white">BDT</Text>
            </Text>
          </View>
          <View className="flex bg-black-200 items-center justify-center p-5 w-[180px] text-center rounded-lg m-1">
            <Text className="text-white text-xl">Current balance</Text>
            <Text className="text-primary font-bold text-lg text-center">
              {data?.supplier?.currentBalance} <Text className="text-white">BDT</Text>
            </Text>
          </View>
        </View>

        {/* Transactions */}
        {data?.transaction?.map((item: any) => (
          <View
            key={item?._id}
            className="bg-black-200 flex justify-between p-4 rounded-lg mt-4 w-[380px] h-[84px] p-4 mx-auto"
          >
            <Text className="text-white text-xl">{item?.type}</Text>
            <View className="flex flex-row justify-between items-center">
              <Text className="text-white text-md me-2">
                {format(new Date(item?.createdAt), "dd MMM yyyy, h:mm a")}
              </Text>
              <Text className="text-primary text-lg font-bold">
                {item?.amount} <Text className="text-white">BDT</Text>
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Month/Year Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-black-200 rounded-2xl p-6 mx-4 w-full">
            <Text className="text-white text-xl font-semibold mb-4">Select Month</Text>
            
            {/* Year select */}
            <View className="flex flex-row justify-between mb-4">
              <TouchableOpacity onPress={() => setCurrentDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl">{currentDate.getFullYear()}</Text>
              <TouchableOpacity onPress={() => setCurrentDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))}>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Months Grid */}
            <View className="flex flex-row flex-wrap justify-between">
              {months.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => selectMonth(i)}
                  className={`p-4 rounded-lg mb-2 w-[28%] ${
                    currentDate.getMonth() === i ? "bg-primary" : "bg-black-300"
                  }`}
                >
                  <Text className={`${currentDate.getMonth() === i ? "text-white" : "text-white" } text-center`}>
                    {m.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              className="mt-4 p-3 rounded-lg bg-gray-600"
            >
              <Text className="text-white text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SupplierDetails;
