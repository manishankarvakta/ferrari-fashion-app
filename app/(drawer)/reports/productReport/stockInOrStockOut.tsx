import { useGlobalContext } from "@/context/GlobalProvider";
import { useProductsQuery } from "@/store/api/productApi";
import { useWarehousesQuery } from "@/store/api/warehouseApi"; // import api warehouse
import { RootState } from "@/store/store";
import { WarehouseTypes } from "@/types/warehouse"; //import warehousetypes
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSelector } from "react-redux";
import PrintButton from "../PrintButton";
export default function CashInReport() {
  const navigation = useNavigation();
  const {userInfo : currentUser}= useGlobalContext()
  const { data: warehousesData } = useWarehousesQuery();
  const [warehouses, setWarehouses] = useState<WarehouseTypes[]>([]);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");

const formatDateString = (date: Date) => date.toISOString().split("T")[0];


const selectedDateString = formatDateString(fromDate);
const { data: productData, error, isLoding } =
    useProductsQuery({
      q: searchQuery || "all",
      forceRefetch: true,
    });
    // console.log("User Info in Stock Index:", productData);
  const { stockItem, isLoading, success, successMessage } = useSelector(
    (state: RootState) => state.stock,
  );
  // console.log("Stock In Data from Redux:", stockItem);

//  useEffect(()=>{
//     refetch()
//  },[stockIn])
// warehouse  role
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    // currentUser.warehouse : null
  );
  // Set warehouses after fetch
  useEffect(() => {
    if (warehousesData) {
      setWarehouses(warehousesData);
      if (currentUser.role === "admin" && warehousesData.length > 0) {
        setSelectedWarehouse(warehousesData[0]._id);
      }
    }
  }, [warehousesData]);
 const totalStock = Array.isArray(productData)
  ? Math.max(
      productData.reduce((sum, item) => sum + (item.openingStock || 0), 0),
      0
    )
  : 0;

  // Fetch CashIn data from backend

  // Header with print button
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Stock In Report",
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
        <PrintButton filteredData={productData} title="Stock In Report" />  
      ),
    });
  }, [navigation]);

  
  // if (isLoading) return <Text>Loading .......</Text>;
  if (error) return <Text>Error Loading data</Text>;



  return (
    <>
     <StatusBar style="light" backgroundColor="#000" />
    <View className=" bg-dark p-2 flex-1">
      {/* Filters */}
      <View className="flex-row justify-between items-center mb-4">
        {
            currentUser?.type === "admin" && warehouses?.length > 0 && 
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
        <View className="bg-black-200 p-4  rounded-lg flex-row justify-between items-center">
        <Text className="text-zinc-300 text-xl">Total Opening Stock</Text>
        <Text className="text-yellow-400 text-xl font-bold">{totalStock}</Text>
      </View>
      </View>
      {/* List */}

      
      <FlatList
        data={productData || []}
        keyExtractor={(item) => item?._id}
        renderItem={({ item }) => (
          <View className="bg-black-200 p-4 rounded-xl mb-3">
            <Text className="text-gray-200 text-xl">{item?.style}</Text>
            <View className="flex-row justify-between mt-2">
            <Text className="text-gray-300 text-lg ">Code : {item?.code}</Text>
              <Text className="text-primary text-lg">{item?.openingStock} </Text>
              {/* <Text className="text-green-400 font-bold">+ {item.amount.toLocaleString()} BDT</Text> */}
            </View>
          </View>
        )}
      />
    </View>


    </>
  );
}