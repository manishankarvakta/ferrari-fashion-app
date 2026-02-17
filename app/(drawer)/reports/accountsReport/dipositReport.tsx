import { useGlobalContext } from "@/context/GlobalProvider";
import { useTransactionListQuery } from "@/store/api/transactionApi";
import { useWarehouseQuery, useWarehousesQuery } from "@/store/api/warehouseApi"; // import api warehouse
import { WarehouseTypes } from "@/types/warehouse"; //import warehousetypes
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import PrintButton from "../PrintButton";

export default function CashInReport() {
  const navigation = useNavigation();
  const { userInfo } = useGlobalContext();

  const { data: warehousesData } = useWarehousesQuery();
  const [warehouses, setWarehouses] = useState<WarehouseTypes[]>([]);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentDay, setCurrentDay] = useState(new Date());

  const formatDateString = (date: Date) => date.toISOString().split("T")[0];

  const selectedDateString = formatDateString(fromDate);

  const { data } = useWarehouseQuery(userInfo?.warehouse);

  // warehouse role
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    userInfo.role === "userInfo" ? userInfo.warehouse : null
  );

  const {
    data: cashDeposit,
    isSuccess,
    isLoading,
    error,
    isError,
    refetch,
  } = useTransactionListQuery({
    warehouse: selectedWarehouse || userInfo?.warehouse,
    type: "deposit",
    startDate: format(fromDate, "MM-dd-yyyy"),
    endDate: format(toDate, "MM-dd-yyyy"),
    forceRefetch: true,
  }, {
    skip: (!selectedWarehouse && !userInfo?.warehouse) || !fromDate || !toDate
  });

  useEffect(() => {
    refetch();
  }, [cashDeposit]);

  // Set warehouses after fetch
  useEffect(() => {
    if (warehousesData) {
      setWarehouses(warehousesData);
      if (userInfo.role === "admin" && warehousesData.length > 0) {
        setSelectedWarehouse(warehousesData[0]._id || null);
      }
    }
  }, [warehousesData]);


  const selectedWarehouseName = React.useMemo(() => {
    if (!selectedWarehouse) return "All Warehouses";
    const wh = warehouses.find(w => w._id === selectedWarehouse);
    return wh ? wh.name : "Unknown Warehouse";
  }, [selectedWarehouse, warehouses]);

  // Header with print button
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Cash Deposit Report",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#000000" },
      headerTintColor: "#ffffff",
      headerTitleStyle: { fontWeight: "bold" },
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} className="ms-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <PrintButton
          filteredData={cashDeposit?.transactions || []}
          title="Cash Deposit Report"
          subtitle={`Warehouse: ${selectedWarehouseName}`}
        />),
    });
  }, [navigation, cashDeposit, selectedWarehouseName]);

  // Filter data by role, warehouse, and date
  const totalCashIn = cashDeposit?.transactions?.length || 0;
  const totalAmount =
    cashDeposit?.transactions?.reduce(
      (sum: number, item: any) => sum + (item.amount || 0),
      0
    ) || 0;
  // refetch handled by hook args change
  // useEffect(() => {
  //   if (userInfo && selectedWarehouse) {
  //     refetch();
  //   }
  // }, [selectedWarehouse, fromDate, toDate]);
  if (!warehousesData) return null;

  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <View className="flex-1 bg-dark p-2">
        {/* Filters */}
        <View className="flex-row justify-between items-center mb-4">
          {userInfo?.type === "admin" && warehouses?.length > 0 && (
            <Dropdown
              data={warehouses.map((wh) => ({ label: wh.name, value: wh._id }))}
              labelField="label"
              valueField="value"
              placeholder="Select Warehouse"
              value={selectedWarehouse}
              onChange={(item: any) => setSelectedWarehouse(item.value)}
              placeholderStyle={{ color: "white" }}
              style={{ backgroundColor: "#1f1f1f", borderRadius: 8, padding: 8, width: 180, height: 45 }}
              selectedTextStyle={{ color: "white" }}
              itemTextStyle={{ color: "black" }}
            />
          )}

          {/* From / To Dates */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              className="p-2 rounded-xl bg-black-200 flex-col items-center"
            >
              <Ionicons name="calendar-number-sharp" size={24} color="#fdb714" />
              <Text className="text-white text-sm">
                {format(fromDate, "dd MMM yyyy")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              className="p-2 rounded-xl bg-black-200 flex-col items-center"
            >
              <Ionicons name="calendar-number-sharp" size={24} color="#fdb714" />
              <Text className="text-white text-sm">
                {format(toDate, "dd MMM yyyy")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(e, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) setFromDate(selectedDate);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(e, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) setToDate(selectedDate);
            }}
          />
        )}

        {/* Summary */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-black-200 p-4 rounded-2xl w-[48%]">
            <Text className="text-zinc-300 text-sm">Total Cash In</Text>
            <Text className="text-yellow-400 text-xl font-bold">
              {totalCashIn}
            </Text>
          </View>
          <View className="bg-black-200 p-4 rounded-2xl w-[48%]">
            <Text className="text-zinc-300 text-sm">Total Amount</Text>
            <Text className="text-primary text-xl font-bold">
              {totalAmount} BDT
            </Text>
          </View>
        </View>

        {/* List */}
        <FlatList
          data={cashDeposit?.transactions || []}
          keyExtractor={(item, index) =>
            item?._id?.toString() || item?.id?.toString() || index.toString()
          }
          renderItem={({ item }) => (
            <View className="bg-black-200 p-4 rounded-xl mb-3">
              <Text className="text-gray-300 text-xl">
                Name: {String(item?.name ?? "")}
              </Text>
              <View className="flex-row justify-between mt-2 items-center">
                <Text className="text-gray-300">
                  {item?.date ? format(new Date(item.date), "dd-MM-yyyy") : ""}
                </Text>
                <Text className="text-white font-semibold text-lg">
                  <Text className="text-primary">{item?.amount ?? 0}</Text>
                  {" BDT"}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </>
  );
}


