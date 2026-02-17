import { DashboardCard } from "@/components/DashboardCard";
import { PaymentChart } from "@/components/PaymentChart";
import { WelcomeCard } from "@/components/WelcomeCard";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useDashbordQuery } from "@/store/api/dashbordApi";
import { useGetuserPhotoQuery } from "@/store/api/userApi";
import { useWarehouseQuery } from "@/store/api/warehouseApi";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { subDays } from "date-fns/subDays";
import { router } from "expo-router";

import { useEffect, useState, useMemo } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
// import {
//   useChartSaleQuery,
//   useDashboardSaleQuery,
//   useLatestSaleQuery,
// } from "../../../store/api/saleApi";

const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth * 0.4;
const profile = require("@/assets/images/profile.jpg");

export default function PosDashboard() {
  const scheme = useColorScheme(); // "light" or "dark"
  const [startDate, setStartDate] = useState(format(new Date(), "MM-dd-yyyy"));
  const [endDate, setEndDate] = useState(format(new Date(), "MM-dd-yyyy"));
  // const [warehouse, setWarehouse] = useState("allWh");
  const { userInfo, fetchUser } = useGlobalContext();
  const [openingBalance, setOpeningBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const type = userInfo?.type;
  const [warehouse, setWarehouse] = useState(userInfo?.type && userInfo?.type !== "admin" && userInfo?.warehouse || "all");


  const { data: dashboardData, error, isLoading, isFetching, isSuccess, refetch } = useDashbordQuery(
    { warehouse: warehouse, date: startDate, type: type } as any,
    { skip: !userInfo } // Skip query until userInfo is available
  );

  // Backend route doesn't exist yet, so we'll calculate from dashboard data
  // const { data: pettyCashData, error: pettyCashError, isLoading: pettyCashLoading, refetch: pettyRefetch } = usePettyCashSummaryQuery(warehouse, {
  //   skip: !userInfo || !warehouse || warehouse === "all"
  // });

  // Calculate petty cash summary from dashboard data
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





  const { data: userPhoto } = useGetuserPhotoQuery({ id: userInfo?.id });

  // console.log("User Photo Data:", userPhoto)


  // console.log(dashboardData, error, isLoading, isFetching, isSuccess, refetch);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setWarehouse(userInfo?.type && userInfo?.type !== "admin" && userInfo?.warehouse || "all");
  }, [type]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchUser();
  }, [warehouse]);



  const handleSelectDay = (day: number) => {
    const today = new Date();
    const last3Day = subDays(today, 3);
    const last7Day = subDays(today, 7);
    const last30Day = subDays(today, 30);

    setEndDate(format(new Date(), "MM-dd-yyyy"));
    if (day === 3) {
      setStartDate(format(new Date(last3Day), "MM-dd-yyyy"));
    } else if (day === 7) {
      setStartDate(format(new Date(last7Day), "MM-dd-yyyy"));
    } else if (day === 30) {
      setStartDate(format(new Date(last30Day), "MM-dd-yyyy"));
    } else {
      setStartDate(format(new Date(), "MM-dd-yyyy"));
    }
    refetch();
  };

  // Function to fetch updated data
  const onRefresh = () => {
    setRefreshing(true);

    refetch();
    // chartRefetch();
    // latestRefetch();
    // Simulate fetching dashboard data
    setTimeout(() => {
      console.log("Dashboard data refreshed!");
      setRefreshing(false);
    }, 1500);
  };

  useEffect(() => {
    refetch();
  }, [startDate, warehouse]);


  interface StatItemProps {
    title: string;
    value: string | number;
    iconName: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
  }

  const StatItem: React.FC<StatItemProps> = ({
    title,
    value,
    iconName,
    onPress,
  }) => {
    const ItemWrapper = onPress ? TouchableOpacity : View;

    return (
      <ItemWrapper
        className="bg-black-200 p-4 rounded-lg mr-3"
        style={{
          width: cardWidth,
          height: cardWidth, // Make it square
          minHeight: 120,
        }}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {/* Icon at top left */}
        <View className="flex-row justify-start mb-2">
          <View className="bg-primary/10 p-2 rounded-lg">
            <Ionicons name={iconName} size={20} color="#FDB714" />
          </View>
        </View>
        {/* Title at bottom */}
        <View className="justify-end">
          <Text className="text-gray-400 text-xs leading-3">{title}</Text>
        </View>

        {/* Value - large number */}
        <View className="flex-1 justify-center">
          <Text className="text-white text-3xl font-pbold mb-1">{value}</Text>
        </View>
      </ItemWrapper>
    );
  };
  const { data: warehouseInfo } = useWarehouseQuery(userInfo?.warehouse, { skip: !userInfo?.warehouse });

  const cashIn = warehouseInfo?.totalCashIn || 0;
  const cashOut = warehouseInfo?.totalCashOut || 0;
  const Balance = cashIn - cashOut;


  useEffect(() => {

    setOpeningBalance(Balance);
    setCurrentBalance(Balance);
  }, [Balance]);

  return (
    <>

      <ScrollView
        className="flex-1 bg-black-700 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <WelcomeCard
          userName={userInfo?.name || "NK Noyon"}
          userImage={userPhoto?.photo !== null && userPhoto?.photo !== "" && userPhoto?.photo !== undefined ? { uri: userPhoto?.photo } : profile}
          onProfilePress={() => router.push("/settings/profile")}
        />
        {/* current & opening balance */}
        <View className="flex-row mb-4 w-full mx-auto">
          {/* <View className="flex-1 bg-black-200  rounded-xl h-24 p-4 mr-2 ">
                    <View className="flex-row items-center gap-2 justify-start mb-2 px-1">
                      <Ionicons name="trending-up" size={22} color="#fdb714" />
                      <Text className="text-gray-300">Opening Balance</Text>
                    </View>
                    <Text className="text-white text-xl font-pbold">{openingBalance}</Text>
                  </View> */}
          <View className="flex-1  bg-black-200 rounded-xl h-24 p-4 ">
            <View className="flex-row items-center gap-2 justify-start mb-2 px-1">
              <Ionicons name="wallet" size={22} color="#fdb714" />
              <Text className="text-gray-300">Balance</Text>
            </View>
            <Text className="text-white text-xl font-pbold">{Balance}</Text>
          </View>
        </View>
        {/* Cash In/Out Cards */}
        <View className="flex-row mb-2">
          <View className="flex-1 mr-2">
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/(account)/cashDepositList")}
            >
              <DashboardCard
                title="Cash In"
                value={dashboardData?.accountsData?.deposit?.totalAmount || 0}
                iconName="wallet"
                bgColor="bg-black-200"
              />
            </TouchableOpacity>
          </View>
          <View className="flex-1 ml-2">
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/(account)/cashOutList")}
            >

              <DashboardCard
                title="Cash Out"
                value={dashboardData?.accountsData?.cashOut?.totalAmount || 0}
                iconName="card"
                bgColor="bg-black-200"
              />
            </TouchableOpacity>

          </View>
        </View>

        {/* Second Row Cash In/Out */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/(account)/paymentList")}
            >
              <DashboardCard
                title="Payment"
                value={dashboardData?.accountsData?.payment?.totalAmount || 0}
                iconName="trending-up"
                bgColor="bg-black-200"
              />
            </TouchableOpacity>
          </View>
          <View className="flex-1 ml-2">
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/(tabs)/(account)/paymentReceivedList")}
            >
              <DashboardCard
                title="Received"
                value={dashboardData?.accountsData?.paymentReceived?.totalAmount || 0}
                iconName="trending-down"
                bgColor="bg-black-200"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lifetime Petty Cash Summary */}
        {/* {pettyCashData && (
          <View className="mb-4">
            <View className="bg-black-200 p-4 rounded-xl">
              <View className="flex-row items-center gap-2 mb-3">
                <Ionicons name="cash" size={20} color="#fdb714" />
                <Text className="text-white text-lg font-pbold">Petty Cash Summary</Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <View>
                  <Text className="text-gray-400 text-xs">Total Deposit</Text>
                  <Text className="text-white text-lg font-psemibold">
                    {pettyCashData?.summary?.totalDeposit || 0}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-400 text-xs">Total Cash Out</Text>
                  <Text className="text-white text-lg font-psemibold">
                    {pettyCashData?.summary?.totalCashOut || 0}
                  </Text>
                </View>
              </View>

              <View className="h-[1px] bg-white/10 my-2" />

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300 font-pmedium">Net Cash Balance</Text>
                <Text className="text-primary text-xl font-pbold">
                  {pettyCashData?.summary?.balance || 0}
                </Text>
              </View>
            </View>
          </View>
        )} */}

        {/* Stats Grid */}
        {/* <StatsGrid stats={statsData} /> */}

        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            className="flex-row"
          >
            <StatItem
              title="Total Products"
              value={dashboardData?.productCount || 0}
              iconName="cube"
              onPress={() => router.push("/(drawer)/(tabs)/(stock)/products")}
            />
            {/* <StatItem
              title="Stock Items"
              value={dashboardData?.productCount || 0}
              iconName="archive"
              onPress={() => router.push("/(drawer)/(tabs)/(stock)")}
            /> */}
            <StatItem
              title="Suppliers"
              value={dashboardData?.supplierCount || 0}
              iconName="people"
              onPress={() => router.push("/(drawer)/(tabs)/(connects)/suppliers" as any)}
            />
            <StatItem
              title="Customers"
              value={dashboardData?.customerCount || 0}
              iconName="person"
              onPress={() => router.push("/(drawer)/(tabs)/(connects)/customers")}
            />
            <StatItem title="Orders"
              value={dashboardData?.orderCount || 0}
              iconName="receipt"
              onPress={() => router.push("/(drawer)/(tabs)/accounts")}
            />
          </ScrollView>
        </View>

        {/* Payment & Collections Chart */}
        <View className="mt-4">
          <Text className="text-white text-lg font-pbold mb-3">
            Payments & Collections
          </Text>
          <PaymentChart data={dashboardData?.chartData || {}} />
        </View>
        <StatusBar
          barStyle={scheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={scheme === "dark" ? "#000000" : "#ffffff"}
        />
      </ScrollView>
    </>
  );
}
