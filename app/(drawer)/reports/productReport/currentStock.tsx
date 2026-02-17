import { useGlobalContext } from "@/context/GlobalProvider";
import { useProductsQuery } from "@/store/api/productApi";
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
export default function CurrentStock() {
  const navigation = useNavigation();
  const { userInfo } = useGlobalContext()
  const { data: warehousesData } = useWarehousesQuery();
  const [warehouses, setWarehouses] = useState<WarehouseTypes[]>([]);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const formatDateString = (date: Date) => date.toISOString().split("T")[0];


  const selectedDateString = formatDateString(fromDate);
  const { data: productData, error } =
    useProductsQuery({
      q: searchQuery || "all",
      forceRefetch: true,
    });
  console.log("User Info in Stock Index:", productData);


  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    userInfo?.type === "admin" ? null : userInfo?.warehouse ?? null
  );

  // Filter products based on selected warehouse
  const filteredProducts = React.useMemo(() => {
    if (!productData) return [];
    if (!selectedWarehouse) return productData;

    return productData.map((product: any) => {
      // Find specific stock for the selected warehouse if it's in the stock array
      let warehouseStock = product.currentStock;
      let hasStockInWarehouse = false;

      // Check top-level warehouse
      const prodWhId = typeof product.warehouse === 'string' ? product.warehouse : product.warehouse?._id;
      if (prodWhId === selectedWarehouse) {
        hasStockInWarehouse = true;
      }

      // Check stock array
      if (Array.isArray(product.stock)) {
        const stockEntry = product.stock.find((s: any) => {
          const sWhId = typeof s.warehouse === 'string' ? s.warehouse : s.warehouse?._id;
          return sWhId === selectedWarehouse;
        });
        if (stockEntry) {
          warehouseStock = stockEntry.currentStock ?? stockEntry.stock ?? 0;
          hasStockInWarehouse = true;
        }
      }

      if (hasStockInWarehouse) {
        return { ...product, displayStock: warehouseStock };
      }
      return null;
    }).filter(Boolean);
  }, [productData, selectedWarehouse]);

  // Set warehouses after fetch
  useEffect(() => {
    if (warehousesData) {
      setWarehouses(warehousesData);
      if (userInfo?.type === "admin" && warehousesData.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(warehousesData[0]._id);
      }
    }
  }, [warehousesData, userInfo?.type]);

  const totalStock = React.useMemo(() => {
    return filteredProducts.reduce((sum: number, item: any) => sum + (item.displayStock || 0), 0);
  }, [filteredProducts]);

  // Fetch CashIn data from backend

  const selectedWarehouseName = React.useMemo(() => {
    if (!selectedWarehouse) return "All Warehouses";
    const wh = warehouses.find(w => w._id === selectedWarehouse);
    return wh ? wh.name : "Unknown Warehouse";
  }, [selectedWarehouse, warehouses]);

  // Header with print button
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Current Stock Report",
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
          filteredData={filteredProducts}
          title="Current Stock Report"
          subtitle={`Warehouse: ${selectedWarehouseName}`}
        />
      ),
    });
  }, [navigation, filteredProducts, selectedWarehouseName]);


  // if (isLoading) return <Text>Loading .......</Text>;
  if (error) return <Text>Error Loading data</Text>;



  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <View className=" bg-dark p-2 flex-1">
        {/* Filters */}
        <View className="flex-row justify-between items-center mb-4">
          {
            userInfo?.type === "admin" && warehouses?.length > 0 &&
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
        <View className=" mb-4">
          <View className="bg-black-200 p-4 rounded-2xl ">
            <Text className="text-zinc-300 text-sm">Total Stock In</Text>
            <Text className="text-yellow-400 text-xl font-bold">
              {totalStock}
            </Text>
            {/* <Text className="text-yellow-400 text-xl font-bold">{productData.length}</Text> */}
          </View>

        </View>
        {/* List */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, index) => item?._id || item?.id || index.toString()}
          renderItem={({ item }) => (
            <View className="bg-black-200 p-4 rounded-xl mb-3">
              <Text className="text-white font-semibold">{item?.style}</Text>
              <View className="flex-row justify-between mt-2">
                <Text className="text-white font-semibold">Code : {item?.code}</Text>
                <Text className="text-gray-300">
                  {selectedWarehouse ? (item.displayStock ?? 0) : (item.currentStock ?? 0)}
                </Text>
                {/* <Text className="text-green-400 font-bold">+ {item.amount.toLocaleString()} BDT</Text> */}
              </View>
            </View>
          )}
        />
      </View>
    </>
  );
}