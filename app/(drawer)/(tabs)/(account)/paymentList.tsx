import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useTransactionListQuery } from "@/store/api/transactionApi";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addDays, format, isToday, subDays } from "date-fns";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Modal,
  Platform,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const PaymentList = () => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { userInfo } = useGlobalContext();
  // Date state management
  const [currentDay, setCurrentDay] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View className="flex flex-row me-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ),
      title: "Payment List",
      headerStyle: {
        backgroundColor: Colors[colorScheme ?? "dark"].backgroundColor,
      },
      headerTintColor: `${Colors[colorScheme ?? "dark"].backgroundColor}`,
      headerTitleStyle: { fontWeight: "bold", fontSize: 18, color: "#ffffff" },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerShown: true,

      headerRight: () => (
        <View className="me-4">
          <TouchableOpacity
            onPress={() => router.push("/(drawer)/(tabs)/(account)/payment")}
            className="flex flex-row justify-center items-center gap-2"
          >
            <MaterialIcons name="inventory" size={22} color="#ffffff" />
            <Text className="text-gray-200 text-lg" >Add</Text>
          </TouchableOpacity>
        </View>
      )
    });
  }, [navigation]);

  const { data, isSuccess, isLoading, error, isError, refetch } =
    useTransactionListQuery({
      warehouse: userInfo?.warehouse,
      type: "payment",
      date: currentDay ? format(currentDay, "MM-dd-yyyy") : format(new Date(), "MM-dd-yyyy"),
      forceRefetch: true,
    }, {
      skip: !userInfo?.warehouse || !currentDay
    });

  // console.log("PAYMENT LIST DATA:", data);

  useEffect(() => {
    if (userInfo?.warehouse) {
      refetch();
    }
  }, [userInfo?.warehouse, currentDay]);

  const [paymentList, setPaymentList] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      if (Array.isArray(data)) {
        setPaymentList(data);
      } else if (
        data &&
        typeof data === "object" &&
        "transactions" in data &&
        Array.isArray((data as any).transactions)
      ) {
        setPaymentList((data as any).transactions);
      } else {
        setPaymentList([]);
      }
    }
  }, [data, isSuccess]);

  //date formatting
  const formattedDate = {
    day: currentDay.getDate(),
    month: currentDay.toLocaleString("en-US", { month: "long" }),
    year: currentDay.getFullYear(),
  };


  // const filteredList = paymentList.filter(
  //   (item) =>
  //     item?.name?.toLowerCase()?.includes(search.toLowerCase()) ||
  //     item?.amount?.toString()?.includes(search) ||
  //     item?.date?.includes(search),
  // );

  const filteredList = paymentList.filter((item) => {
    const supplierName = item?.supplierId?.name?.toLowerCase() || "";  // name safe
    const amountStr = item?.amount?.toString() || "";                   // amount safe
    const dateStr = item?.date ? format(new Date(item.date), "dd-MM-yyyy") : ""; // date safe
    const term = search.toLowerCase();

    return (
      supplierName.includes(term) ||
      amountStr.includes(term) ||
      dateStr.includes(term)
    );
  });

  // Date navigation functions
  const goToPreviousDay = () => {
    setCurrentDay((prev) => subDays(prev, 1));
  };

  const goToNextDay = () => {
    if (!isToday(currentDay)) {
      setCurrentDay((prev) => addDays(prev, 1));
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setCurrentDay(selectedDate); // ✅ Direct update
    }
  };

  // console.log("SUMMARY", (data as any)?.summary);
  const typeLabels: Record<string, string> = {
    deposit: "Cash In",
    cashOut: "Cash Out",
    payment: "Payment",
    paymentReceived: "Payment Received",
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="mt-4 mx-4">
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/paymentDetails",
            params: { _id: item?._id },
          })
        }
        className="flex-row justify-between bg-black-200 rounded-xl p-4 items-center"
      >
        <View className="flex flex-col items-start">
          <Text className="text-lg font-medium text-primary">
            {item?.supplierId?.name || "N/A"}
          </Text>
          <Text className="text-sm text-gray-200">
            {item?.date && format(new Date(item?.date), "dd-MM-yyyy")}
          </Text>
        </View>
        <View>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-primary capitalize">
              {typeLabels[item.type] || item.type}
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/cashoutInvoicePhoto",
                  params: {
                    invoice: item?.invoices,
                    photo: item?.photo,
                  },
                })
              }
            >
              <Text className="text-sm text-white border border-gray-300 ml-4 px-2 rounded-lg">
                Photo
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-lg text-primary">
            ৳{item.amount?.toLocaleString()}{" "}
            <Text className="text-white">BDT</Text>
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item._id || Math.random().toString()}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            {/* calendar */}
            <View className="mt-2 mb-2">
              <View className="flex flex-row justify-between items-center bg-black-200  p-2 rounded-lg mx-4">
                <TouchableOpacity onPress={goToPreviousDay} className="p-2">
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={openDatePicker}
                  className="flex flex-row items-center px-4  rounded-lg"
                >
                  <Text className="text-white text-lg me-2">
                    {formattedDate.day}
                  </Text>
                  <Text className="text-primary text-lg">
                    {formattedDate.month}
                  </Text>
                  <Text className="text-white text-lg ml-2">
                    {formattedDate.year}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#fdb714"
                    className="ml-2"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={goToNextDay}
                  disabled={isToday(currentDay)}
                  className={`p-2 ${isToday(currentDay) ? "opacity-50" : ""}`}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color={isToday(currentDay) ? "#666" : "white"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Picker Modal */}
            {showDatePicker && (
              <DateTimePicker
                value={currentDay} // ✅ always show selected date
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <View className="bg-zinc-800 mb-2 text-white h-14 rounded-full flex-row items-center px-3 py-2 mt-2 mx-4">
              <TextInput
                className="ml-2 flex-1 text-white"
                value={search}
                onChangeText={setSearch}
                placeholder="Search by name, amount, or date"
                placeholderTextColor="#d1d5db"
                style={{
                  backgroundColor: "transparent",
                  borderWidth: 0,
                  width: "100%",
                }}
              />
              <Ionicons name="search" size={20} color="#fdb714" />
            </View>
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 h-96 w-full justify-center items-center mt-10">
              <Ionicons name="save-outline" size={60} color="gray" />
              <Text className="text-primary text-lg mt-4">No data found</Text>
              <Text className="text-white text-sm">
                Please select a different date
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </>
  );
};

export default PaymentList;
