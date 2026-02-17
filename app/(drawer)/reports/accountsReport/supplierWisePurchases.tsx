import { useGlobalContext } from "@/context/GlobalProvider";
import { usePurchaseByDateQuery, usePurchasesDWQuery } from "@/store/api/purchasApi";
import { useWarehousesQuery } from "@/store/api/warehouseApi"; // import api warehouse
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

export default function SupplierPaymentReport() {
  const navigation = useNavigation();
  // const { data: userInfo } = { data: currentUser };
  const { userInfo: currentUser } = useGlobalContext()
  // const type = userInfo?.type;
  const { data: warehousesData } = useWarehousesQuery();
  const [warehouses, setWarehouses] = useState<WarehouseTypes[]>([]);


  //   const [cashInData, setCashInData] = useState<any[]>([]); // backend data
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());



  // warehouse  role
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    currentUser.role === "user" ? currentUser.warehouse : null
  );
  // Set warehouses after fetch
  useEffect(() => {
    if (warehousesData) {
      setWarehouses(warehousesData);
      if (currentUser.role === "admin" && warehousesData.length > 0) {
        setSelectedWarehouse(warehousesData[0]._id);
      }
    }
  }, [warehousesData, currentUser]);

  // Fetch Purchase data from backend
  const { data: purchasesData, isSuccess, isError, refetch } = usePurchaseByDateQuery({
    warehouse: selectedWarehouse || currentUser?.warehouse || "all",
    startDate: format(fromDate, "MM-dd-yyyy"),
    endDate: format(toDate, "MM-dd-yyyy")
  });

  // refetch handled by hook args change
  // useEffect(() => {
  //   refetch()
  // }, [selectedWarehouse, fromDate, toDate])

  // Header with print button
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Supplier Purchese Report",
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
        <PrintButton filteredData={purchasesData as any[]} title="Supplier Purchese Report" />
      ),

    });
  }, [navigation, purchasesData]);
  const totalPurchases = purchasesData?.length || 0;
  const totalAmount = purchasesData?.reduce(
    (sum: number, item: any) => sum + (item.amount || 0),
    0
  ) || 0;

  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <View className="flex-1 bg-dark p-2">
        {/* Filters */}
        <View className="flex-row justify-between items-center mb-4">
          {currentUser?.type === "admin" && warehouses?.length > 0 &&
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
          }

          {/* From / To Dates */}
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => setShowStartPicker(true)} className="p-2 rounded-xl bg-black-200 flex-col items-center">
              <Ionicons name="calendar-number-sharp" size={24} color="#fdb714" />
              <Text className="text-white text-sm">{format(fromDate, "dd MMM yyyy")}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowEndPicker(true)} className="p-2 rounded-xl bg-black-200 flex-col items-center">
              <Ionicons name="calendar-number-sharp" size={24} color="#fdb714" />
              <Text className="text-white text-sm">{format(toDate, "dd MMM yyyy")}</Text>
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
            <Text className="text-zinc-300 text-sm">Supplier Total Purchases</Text>
            <Text className="text-yellow-400 text-xl font-bold">{totalPurchases}</Text>
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
        data={purchasesData}
        keyExtractor={(item) => item?.id}
        renderItem={({ item }) => (
          <View className="bg-black-200 p-4 rounded-xl mb-3">
            <Text className="text-gray-200 font-semibold text-lg">{item?.supplierName}</Text>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-400">{item?.formatedDate}</Text>
              <Text className="text-primary font-bold text-lg"> {item?.amount.toLocaleString()} <Text className="text-gray-200">BDT</Text></Text>
            </View>
          </View>
        )}
      /> */}
        <FlatList
          data={purchasesData}
          keyExtractor={(item: any, index) =>
            item?._id || item?.id ? (item._id || item.id).toString() : index.toString()
          }
          renderItem={({ item }) => (
            <View className="bg-black-200 p-4 rounded-xl mb-3">
              <Text className="text-gray-200 font-semibold text-lg">
                {item?.supplierName}
              </Text>

              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-400">
                  {item?.formatedDate}
                </Text>

                <Text className="text-primary font-bold text-lg">
                  {item?.amount?.toLocaleString()}
                  <Text className="text-gray-200"> BDT</Text>
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </>
  );
}
