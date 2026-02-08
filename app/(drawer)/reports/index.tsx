import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme.web";
// import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import {
  endOfDay,
  isSameDay,
  isWithinInterval,
  startOfDay
} from "date-fns";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

// ===== Dummy User Context =====
const useGlobalContext = () => {
  return { userInfo: { warehouse: "Main" } };
};

// ===== Dummy transactions to simulate API response =====
const MOCK_TX = [
  {
    id: "tx1",
    date: "2025-08-29",
    module: "Sales",
    ref: "S-1001",
    amount: 290000,
    status: "paid",
  },
  {
    id: "tx2",
    date: "2025-08-30",
    module: "Purchases",
    ref: "P-2042",
    amount: 120000,
    status: "due",
  },
  {
    id: "tx3",
    date: "2025-08-31",
    module: "Accounts",
    ref: "RCV-311",
    amount: 50000,
    status: "received",
  },
  {
    id: "tx4",
    date: "2025-08-31",
    module: "Sales",
    ref: "S-1002",
    amount: 175000,
    status: "partial",
  },
  {
    id: "tx5",
    date: "2025-08-28",
    module: "Supplier",
    ref: "SUP-999",
    amount: 220000,
    status: "paid",
  },
  {
    id: "tx6",
    date: "2025-08-31",
    module: "Warehouse",
    ref: "STK-33",
    amount: 0,
    status: "moved",
  },
  {
    id: "tx7",
    date: "2025-08-31",
    module: "Customer",
    ref: "CUST-19",
    amount: 0,
    status: "updated",
  },
  {
    id: "tx8",
    date: "2025-08-31",
    module: "Stock",
    ref: "CUST-19",
    amount: 0,
    status: "updated",
  },
];

const MODULES = [
  "All",
  "Supplier",
  "Customer",
  "Warehouse",
  "Sales",
  "Purchases",
  "Accounts",
  "Users",
  "Stock",
] as const;

const CustomDrawerToggleButton = ({ tintColor = "#FDB714" }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ marginLeft: 16 }}
    >
      <Ionicons name="menu" size={24} color={tintColor} />
    </TouchableOpacity>
  );
};

const Report = () => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { userInfo } = useGlobalContext();

  const [fromDate, setFromDate] = useState<Date>(startOfDay(new Date()));
  const [toDate, setToDate] = useState<Date>(endOfDay(new Date()));
  const [showPicker, setShowPicker] = useState<{
    which: "from" | "to" | null;
  }>({ which: null });
  const [module, setModule] =
    useState<(typeof MODULES)[number]>("All");
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      // headerRight: () => (
      //   <View className="me-4 flex flex-row justify-center items-center gap-2">
      //     <TouchableOpacity
      //       onPress={() => console.log("download")}
      //       className="flex flex-row justify-center items-center gap-2"
      //     >
      //       <Ionicons name="download-outline" size={24} color="#ffffff" />
      //     </TouchableOpacity>
      //     <TouchableOpacity
      //       onPress={() => console.log("print")}
      //       className="flex flex-row justify-center items-center gap-2"
      //     >
      //       <Ionicons name="print-outline" size={24} color="#ffffff" />
      //     </TouchableOpacity>
      //   </View>
      // ),
      title: "Report",
      //@ts-ignore
      headerStyle: {
        backgroundColor: `${Colors[colorScheme ?? "dark"].backgroundColor}`,
      },
      headerLeft: () => (
        <CustomDrawerToggleButton tintColor="#ffffff" />
      ),
      //@ts-ignore
      headerTintColor: `${Colors[colorScheme ?? "dark"].backgroundColor}`,
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 18,
        color: "#ffffff",
      },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerShown: true,
    });
  }, [navigation]);

  // ===== Mock data instead of API =====
  const list = useMemo(() => {
    const interval = { start: startOfDay(fromDate), end: endOfDay(toDate) };
    return MOCK_TX.filter((t) => {
      const inRange =
        isWithinInterval(new Date(t.date), interval) ||
        isSameDay(new Date(t.date), fromDate) ||
        isSameDay(new Date(t.date), toDate);
      const byModule = module === "All" ? true : t.module === module;
      return inRange && byModule;
    });
  }, [fromDate, toDate, module]);

  const totals = useMemo(() => {
    const stock = list
      .filter((x) => x.module.toLowerCase() === "stock")
      .reduce((s, x) => s + x.amount, 0);
    const sales = list
      .filter((x) => x.module.toLowerCase() === "sales")
      .reduce((s, x) => s + x.amount, 0);
    const purchases = list
      .filter((x) => x.module === "Purchases")
      .reduce((s, x) => s + x.amount, 0);
    const paymentsReceived = list
      .filter((x) => x.module === "Accounts" && x.status === "received")
      .reduce((s, x) => s + x.amount, 0);
    const balance = sales - purchases;
    const customer = list
      .filter((x) => x.module === "Customer")
      .reduce((s, x) => s + x.amount, 0);
    const supplier = list
      .filter((x) => x.module === "Supplier")
      .reduce((s, x) => s + x.amount, 0);
    return {
      sales,
      purchases,
      paymentsReceived,
      balance,
      stock,
      customer,
      supplier,
    };
  }, [list]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);


  const closePicker = () => setShowPicker({ which: null });
  const onChangeDate = (_: any, selected?: Date) => {
    if (Platform.OS === "android") closePicker();
    if (!selected) return;
    if (showPicker.which === "from") setFromDate(startOfDay(selected));
    if (showPicker.which === "to") setToDate(endOfDay(selected));
  };



  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <ScrollView className="flex-1 bg-dark p-2">
        {/* Sales Report */}
        <View className="p-2 rounded-lg mt-4">
          <Text className="text-gray-200 text-2xl font-pbold">Sales Report</Text>

          <View className="bg-black-200 p-4 rounded-lg mt-4">
            <TouchableOpacity
              onPress={() => router.push('/(drawer)/reports/salesReport/salesReport')}
              className="flex-row items-center">
              <Ionicons name="cart-outline" size={28} color="#fdb714" />
              <Text className="text-gray-200 text-lg ms-2">Sales Report</Text>
            </TouchableOpacity>
          </View>

          {/* <View className="bg-black-200 p-4 rounded-lg mt-4">
          <TouchableOpacity 
          onPress={()=>router.push('/(drawer)/reports/salesReport/ProductWiseSale')}
          className="flex-row items-center">
            <Ionicons name="pricetag-outline" size={28} color="#fdb714" />
            <Text className="text-gray-200 text-lg ms-2">Product Wise Sale</Text>
          </TouchableOpacity>
        </View> */}


        </View>

        {/* Product Report */}
        <View className="p-2 rounded-lg mt-4">
          <Text

            className="text-gray-200 text-2xl font-pbold">Product Report</Text>

          <TouchableOpacity
            onPress={() => router.push('/(drawer)/reports/productReport/currentStock')}
            className="bg-black-200 rounded-lg p-4 flex-row items-center mt-4">
            <Ionicons name="cube-outline" size={28} color="#fdb714" />
            <Text className="text-gray-200 text-lg ms-2">Current Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(drawer)/reports/productReport/stockInOrStockOut')}
            className="bg-black-200 rounded-lg p-4 flex-row items-center mt-4">
            <Ionicons name="swap-horizontal-outline" size={28} color="#fdb714" />
            <Text className="text-gray-200 text-lg ms-2">Stock In</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity 
        onPress={()=>router.push('/(drawer)/reports/productReport/stockOut')}
        className="bg-black-200 rounded-lg p-4 flex-row items-center mt-4">
          <Ionicons name="swap-horizontal-outline" size={28} color="#fdb714" />
          <Text className="text-gray-200 text-lg ms-2">Stock Out</Text>
        </TouchableOpacity> */}

          {/* <TouchableOpacity className="bg-black-200 rounded-lg p-4 flex-row items-center mt-4 ">
          <Ionicons name="stats-chart-outline" size={28} color="#fdb714" />
          <Text className="text-gray-200 text-lg ms-2">
            Product Wise Sales & Purchases
          </Text>
        </TouchableOpacity> */}
        </View>

        {/* Customer Report */}
        {/* <View className="p-2 rounded-lg mt-4">
        <Text className="text-gray-200 text-2xl font-pbold">Customer Report</Text>



           <View className="bg-black-200 p-4 rounded-lg mt-4">
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="people-outline" size={28} color="#fdb714" />
            <Text className="text-gray-200 text-lg ms-2">Customer Wise Sale</Text>
          </TouchableOpacity>
        </View>
        <View>
           <TouchableOpacity className="bg-black-200 rounded-lg p-4 flex-row items-center mt-4 ">
          <Ionicons name="alert-circle-outline" size={28} color="#fdb714" />
          <Text className="text-gray-200 text-lg ms-2">Customer Due Report</Text>
        </TouchableOpacity>
        </View>
        <TouchableOpacity className="bg-black-200 rounded-lg p-4  flex-row items-center mt-4">
          <Ionicons name="person-outline" size={28} color="#fdb714" />
          <Text className="text-gray-200 text-lg ms-2">Customer Wise Sales</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-black-200 rounded-lg p-4  flex-row items-center mt-4">
          <Ionicons name="cash-outline" size={28} color="#fdb714" />
          <Text className="text-gray-200 text-lg ms-2">Payment Received</Text>
        </TouchableOpacity>
      </View> */}

        {/* Supplier Report */}
        {/* <View className="p-2 rounded-lg mt-4">
        <Text className="text-gray-200 text-2xl font-pbold">Supplier Report</Text>

        <TouchableOpacity className="bg-black-200 flex-row rounded-lg p-4 items-center mt-4">
          <Ionicons name="business-outline" size={28} color="#fdb714" />
          <Text className="text-gray-200 text-lg ms-2">Total Supplier</Text>
        </TouchableOpacity>

        
      </View> */}

        {/* Accounts Report */}
        <View className="p-2 rounded-lg mt-4 mb-6">
          <Text className="text-gray-200 text-2xl font-pbold">Accounts Report</Text>

          {/* <TouchableOpacity className="bg-black-200 flex-row rounded-lg p-4 items-center mt-4 ">
          <Ionicons name="wallet-outline" size={28} color="#fdb714" />
          <Text className="text-gray-200 text-lg ms-2">Account Balance</Text>
        </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => router.push('/(drawer)/reports/accountsReport/dipositReport')}
            className="bg-black-200 flex-row rounded-lg p-4 items-center mt-4">
            <Ionicons name="arrow-down-circle-outline" size={28} color="#fdb714" />
            <Text className="text-gray-200 text-lg ms-2">Deposit Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(drawer)/reports/accountsReport/cashOutReport')}
            className="bg-black-200 flex-row rounded-lg p-4 items-center mt-4">
            <Ionicons name="arrow-up-circle-outline" size={28} color="#fdb714" />
            <Text className="text-gray-200 text-lg ms-2">Cashout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(drawer)/reports/accountsReport/customerDueReport')}
            className="bg-black-200 flex-row rounded-lg p-4 items-center mt-4">
            <Ionicons name="document-text-outline" size={28} color="#fdb714" />
            <Text className="text-gray-200 text-lg ms-2">Customer Due Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(drawer)/reports/accountsReport/paymentReceivedReport')}
            className="bg-black-200 flex-row rounded-lg p-4 items-center mt-4 ">
            <Ionicons name="cash-outline" size={28} color="#fdb714" />
            <Text className="text-gray-200 text-lg ms-2">Payment Received</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(drawer)/reports/accountsReport/supplierWisePurchases')}
            className="bg-black-200 flex-row rounded-lg p-4 items-center mt-4">
            <Ionicons name="cart-outline" size={28} color="#fdb714" />
            <Text className="text-gray-200 text-lg ms-2">Supplier Wise Purchases</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  )
};

function SummaryCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <View className="bg-zinc-800 rounded-2xl p-4 mb-3">
      <Text className="text-zinc-300 text-sm mb-1">{label}</Text>
      <Text className="text-yellow-400 text-xl font-bold">
        {value.toLocaleString()} {suffix ?? ""}
      </Text>
    </View>
  );
}

export default Report;
