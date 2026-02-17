import { CustomDrawerToggleButton } from "@/components";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
// import { CustomDrawerToggleButton } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
// // import { useColorScheme } from "react-native";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useTransactionListQuery } from "@/store/api/transactionApi";
import { useWarehouseQuery } from "@/store/api/warehouseApi";
import { format } from "date-fns";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDashbordQuery } from "@/store/api/dashbordApi";



const Accounts = () => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { userInfo, fetchUser } = useGlobalContext();
  const type = userInfo?.type
  const [currentDay, setCurrentDay] = useState(new Date());
  const [openingBalance, setOpeningBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  useLayoutEffect(() => {
    navigation.setOptions({
      // headerRight: () => (
      // <View className='me-4' >
      //     <TouchableOpacity onPress={()=>setIsPhoto(!isPhoto)} className='flex flex-row justify-center items-center gap-2'>
      //       <Ionicons name={isPhoto ? "image-sharp" : "image-outline"} size={24}  color="#f2652d" />
      //       <Text className='text-primary text-xl font-pmedium'>Photo</Text>
      //     </TouchableOpacity>
      // </View>
      // ),
      title: "Accounts",
      //@ts-ignore
      headerStyle: {
        backgroundColor: `#000000`,
      },
      headerLeft: () => <CustomDrawerToggleButton tintColor="#ffffff" />,
      //@ts-ignore
      headerTintColor: `${Colors[colorScheme ?? "dark"]?.backgroundColor || Colors[colorScheme ?? "dark"]?.background}`,
      headerTitleStyle: { fontWeight: "bold", fontSize: 18, color: "#ffffff" },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerShown: true,
    });
  }, [navigation]);
  const { data: warehousedata } = useWarehouseQuery(userInfo?.warehouse, { skip: !userInfo?.warehouse });
  console.log('warehousedata', warehousedata)
  // cash deposit data fetch
  const { data, isSuccess, isLoading, error, isError, refetch } =
    useTransactionListQuery({
      warehouse: userInfo?.warehouse,
      type: "deposit",
      date: currentDay ? format(currentDay, "MM-dd-yyyy") : format(new Date(), "MM-dd-yyyy"),
      forceRefetch: true,
    }, {
      skip: !userInfo?.warehouse || !currentDay
    });
  const totalDepositAmount = data?.transactions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  // cash out data fetch

  const { data: cashOutData } =
    useTransactionListQuery({
      warehouse: userInfo?.warehouse,
      type: "cashOut",
      date: currentDay ? format(currentDay, "MM-dd-yyyy") : format(new Date(), "MM-dd-yyyy"),
      forceRefetch: true,
    }, {
      skip: !userInfo?.warehouse || !currentDay
    });
  const totalCashOutAmount = cashOutData?.transactions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  //payment data fetch
  const { data: paymentData } =
    useTransactionListQuery({
      warehouse: userInfo?.warehouse,
      type: "payment",
      date: currentDay ? format(currentDay, "MM-dd-yyyy") : format(new Date(), "MM-dd-yyyy"),
      forceRefetch: true,
    }, {
      skip: !userInfo?.warehouse || !currentDay
    });
  const totalPaymentAmount = paymentData?.transactions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  // received payment data fetch
  const { data: receivedPaymentData } =
    useTransactionListQuery({
      warehouse: userInfo?.warehouse,
      type: "paymentReceived",
      date: currentDay ? format(currentDay, "MM-dd-yyyy") : format(new Date(), "MM-dd-yyyy"),
      forceRefetch: true,
    }, {
      skip: !userInfo?.warehouse || !currentDay
    });
  const totalReceivedPaymentAmount = receivedPaymentData?.transactions?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;


  const { data: warehouseInfo } = useWarehouseQuery(userInfo?.warehouse, { skip: !userInfo?.warehouse });
  console.log('warehouseInfo', warehouseInfo)
  const cashIn = warehouseInfo?.totalCashIn || 0;
  const cashOut = warehouseInfo?.totalCashOut || 0;
  const Balance = cashIn - cashOut;

  useEffect(() => {
    setOpeningBalance(Balance);
    setCurrentBalance(Balance);
  }, [Balance]);

  const { data: dashboardData } = useDashbordQuery(
    { warehouse: userInfo?.warehouse, date: format(currentDay, "MM-dd-yyyy"), type: type } as any,
    { skip: !userInfo } // Skip query until userInfo is available
  );

  const pettyCashData = useMemo(() => {
    if (!dashboardData?.accountsData) return null;

    const totalDeposit = dashboardData.accountsData.deposit?.totalAmount || 0;
    const totalCashOut = dashboardData.accountsData.cashOut?.totalAmount || 0;
    const balance = totalDeposit - totalCashOut;

    return {
      summary: {
        totalDeposit,
        totalCashOut,
        balance
      }
    };
  }, [dashboardData]);


  return (

    <>
      <StatusBar style="light" backgroundColor="#000" />

      <ScrollView
        className="flex-1 bg-black-700  h-full"
        showsVerticalScrollIndicator={false}
      >
        {/* Top balances */}

        {/* Transactions Summary Cards */}
        <View className="mt-2">
          <Text className="text-white text-lg font-pbold mb-4">
            Transactions
          </Text>
          {/* opening & current balance  */}
          <View className="flex-row mb-4 w-full">
            {/* <View className="flex-1 bg-black-200 rounded-xl h-28 p-4 mr-2 ">
            <View className="flex-row items-center justify-between mb-2 px-1">
              <Ionicons name="trending-up" size={22} color="#fdb714" />
              <Text className="text-gray-300">Opening Balance</Text>
            </View>
          <Text className="text-white text-xl font-pbold">{openingBalance}</Text>
          </View> */}
            <View className="flex-1 ml-2 bg-black-200 rounded-xl h-28 p-4 ">
              <View className="flex-row items-center mb-2 py-1">
                <Ionicons name="wallet" size={22} color="#fdb714" />
                <Text className="text-gray-300 text-lg ml-3 text-white">Balance</Text>
              </View>
              <Text className="text-white text-xl font-pbold">{Balance}</Text>
              {/* <Text className="text-white text-xl font-pbold">100</Text> */}
            </View>
          </View>


          <View className="flex-row mb-4">
            {/* Payment */}
            <TouchableOpacity
              onPress={() => router.push("/(account)/paymentList")}
              className="flex-1 bg-black-200 rounded-xl p-4 h-28 mr-2 border border-gray-700">
              <View className="flex-row items-center mb-2 px-1">
                <Ionicons name="cash" size={22} color="#fdb714" />
                <Text className="text-gray-300 ms-2">Payment</Text>
              </View>
              <Text className="text-white text-xl font-pbold ms-1">{totalPaymentAmount}</Text>
            </TouchableOpacity>

            {/* Payment Received */}
            <TouchableOpacity
              onPress={() => router.push("/(account)/paymentReceivedList")}
              className="flex-1 bg-black-200 rounded-xl p-4 h-28 ml-2 border border-gray-700">
              <View className="flex-row items-center mb-2 px-1 ">
                <Ionicons name="checkmark-done-circle" size={22} color="#fdb714" />
                <Text className="text-gray-300 ms-2"> Received</Text>
              </View>
              <Text className="text-white text-xl font-pbold ms-1">{totalReceivedPaymentAmount}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-4">
            {/* Cash Out */}
            <TouchableOpacity
              onPress={() => router.push("/(account)/cashOutList")}
              className="flex-1 bg-black-200 rounded-xl p-4 h-28 mr-2 border border-gray-700">
              <View className="flex-row items-center mb-2 px-1 ">
                <Ionicons name="arrow-up-circle" size={22} color="#fdb714" />
                <Text className="text-gray-300 ms-1">Cash Out</Text>
              </View>
              <Text className="text-white text-xl font-pbold ms-2">{totalCashOutAmount}</Text>
            </TouchableOpacity>

            {/* Cash Deposit */}
            <TouchableOpacity
              onPress={() => router.push("/(account)/cashDepositList")}
              className="flex-1 bg-black-200 rounded-xl p-4 h-28 ml-2 border border-gray-700">
              <View className="flex-row items-center mb-2 px-1">
                <Ionicons name="arrow-down-circle" size={22} color="#fdb714" />
                <Text className="text-gray-300 ms-1 ">Cash deposit</Text>
              </View>
              <Text className="text-white text-xl font-pbold ms-2">{totalDepositAmount}</Text>
            </TouchableOpacity>
          </View>

          {/* Lifetime Petty Cash Summary */}
          {/*  */}

          <TouchableOpacity
            onPress={() => router.push("/(account)/warehouseBalance")}
          >
            <View className="mt-2 flex-row bg-black-200 rounded-xl h-20 justify-center items-center border border-gray-700">
              <Ionicons name="storefront-outline" size={24} color="#FDB714" />
              <Text className="text-gray-200 text-lg p-2">
                Pritty cash Balance
              </Text>
            </View>

          </TouchableOpacity>

          <View>


            <Text className="text-lg text-gray-300 pb-4 mt-4 font-pbold "> Payment Section</Text>
            {/* Row 1 */}
            <View className="flex-row mb-4">
              <TouchableOpacity
                className="flex-1 bg-black-200 rounded-xl h-32 justify-center items-center mr-2"
                activeOpacity={0.8}
                onPress={() => router.push("/(drawer)/purchases")}
              >
                <Ionicons name="wallet" size={28} color="#FDB714" />
                <Text className="text-white text-base mt-2">Purchases</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
          className="flex-1 bg-black-200 rounded-xl h-32 justify-center items-center mr-2"
          activeOpacity={0.8}
          onPress={() => router.push("/(account)/cashDeposit")}
        >
          <Ionicons name="wallet" size={28} color="#FDB714" />
          <Text className="text-white text-base mt-2">Cash Deposit</Text>
        </TouchableOpacity> */}

              <TouchableOpacity
                className="flex-1 bg-black-200 rounded-xl h-32 justify-center items-center ml-2"
                activeOpacity={0.8}
                onPress={() => router.push("/(drawer)/sales")}
              >
                <Ionicons name="card" size={28} color="#FDB714" />
                <Text className="text-white text-base mt-2">Sales</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
          className="flex-1 bg-black-200 rounded-xl h-32 justify-center items-center ml-2"
          activeOpacity={0.8}
          onPress={() => router.push("/(account)/cashOut")}
        >
          <Ionicons name="card" size={28} color="#FDB714" />
          <Text className="text-white text-base mt-2">Cash Out</Text>
        </TouchableOpacity> */}
            </View>
            {/* Row 2 */}
            <View className="flex-row">

              {/* <TouchableOpacity
          className="flex-1 bg-black-200 rounded-xl h-32 justify-center items-center mr-2"
          activeOpacity={0.8}
          onPress={() => router.push("/(account)/payment")}
        >
          <Ionicons name="cash" size={28} color="#FDB714" />
          <Text className="text-white text-base mt-2">Payment</Text>
        </TouchableOpacity> */}

              {/* <TouchableOpacity
          className="flex-1 bg-black-200 rounded-xl h-32 justify-center items-center ml-2"
          activeOpacity={0.8}
          onPress={() => router.push("/(account)/received-payment/")}
        >
          <Ionicons name="checkmark-done-circle" size={28} color="#FDB714" />
          <Text className="text-white text-base mt-2">Received Payment</Text>
        </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </ScrollView>

    </>
  );
};

export default Accounts;

