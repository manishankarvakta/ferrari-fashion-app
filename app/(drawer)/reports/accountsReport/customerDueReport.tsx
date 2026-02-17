import { useGlobalContext } from "@/context/GlobalProvider";
import { useAllSaleQuery } from "@/store/api/saleApi";
import { useWarehousesQuery } from "@/store/api/warehouseApi";
import { WarehouseTypes } from "@/types/warehouse";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import PrintButton from "../PrintButton";

export default function CustomerDueReport() {
  const navigation = useNavigation();
  const { userInfo: currentUser } = useGlobalContext();

  const { data: warehousesData } = useWarehousesQuery();
  const [warehouses, setWarehouses] = useState<WarehouseTypes[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    currentUser?.type === "admin" ? null : currentUser?.warehouse ?? null
  );

  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentDay, setCurrentDay] = useState(new Date());

  // Set warehouses after fetch
  useEffect(() => {
    if (warehousesData) {
      setWarehouses(warehousesData);
      if (currentUser?.type === "admin" && warehousesData.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(warehousesData[0]._id as string);
      }
    }
  }, [warehousesData]);

  const { data: customerDue, refetch } = useAllSaleQuery({
    warehouse: (selectedWarehouse || currentUser?.warehouse || "all") as string,
    startDate: format(fromDate, "MM-dd-yyyy"),
    endDate: format(toDate, "MM-dd-yyyy"),
    aamarId: currentUser?.id || "",
    isDate: "range"
  } as any);

  useEffect(() => {
    if (selectedWarehouse) refetch();
  }, [selectedWarehouse, fromDate, toDate]);

  const selectedWarehouseName = React.useMemo(() => {
    if (!selectedWarehouse) return "All Warehouses";
    const wh = warehouses.find(w => w._id === selectedWarehouse);
    return wh ? wh.name : "Unknown Warehouse";
  }, [selectedWarehouse, warehouses]);

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Customer Due Report",
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
          filteredData={customerDue as any[]}
          title="Customer Due Report"
          subtitle={`Warehouse: ${selectedWarehouseName}`}
        />
      ),
    });
  }, [navigation, customerDue, selectedWarehouseName]);

  const totalCustomerDue = customerDue?.length || 0;
  const totalAmount =
    customerDue?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <View className="flex-1 bg-dark p-2">
        {/* Filters */}
        <View className="flex-row justify-between items-center mb-4">
          {currentUser?.type === "admin" && warehouses?.length > 0 && (
            <Dropdown
              data={warehouses.map((wh) => ({ label: wh.name, value: wh._id }))}
              labelField="label"
              valueField="value"
              placeholder="Select Warehouse"
              value={selectedWarehouse}
              onChange={(item: any) => setSelectedWarehouse(item.value)}
              placeholderStyle={{ color: "white" }}
              style={{
                backgroundColor: "#1f1f1f",
                borderRadius: 8,
                padding: 8,
                width: 180,
                height: 45,
              }}
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
            <Text className="text-zinc-300 text-sm">Total Customer Due</Text>
            <Text className="text-yellow-400 text-xl font-bold">
              {totalCustomerDue}
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
        {/* <FlatList
          data={customerDue}
          keyExtractor={(item) => item._id}
          renderItem={({ item }: { item: any }) => (
            <View className="bg-black-200 p-4 rounded-2xl mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-200 text-xl font-semibold">
                  {item?.customerName}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-400 font-bold">{item?.formatedDate}</Text>
                <Text className="text-gray-300 font-bold text-lg">
                  Due <Text className="text-primary">{item?.amount}</Text> BDT
                </Text>
              </View>
            </View>
          )}
        /> */}
        <FlatList
          data={customerDue as any[]}
          keyExtractor={(item: any, index: number) =>
            item?._id ? item._id.toString() : index.toString()
          }
          renderItem={({ item }: { item: any }) => (
            <View className="bg-black-200 p-4 rounded-2xl mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-200 text-xl font-semibold">
                  {item?.customerName}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-400 font-bold">
                  {item?.formatedDate}
                </Text>

                <Text className="text-gray-300 font-bold text-lg">
                  Due <Text className="text-primary">{item?.amount}</Text> BDT
                </Text>
              </View>
            </View>
          )}
        />

      </View>
    </>
  );
}
