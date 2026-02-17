import { FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from "@/context/GlobalProvider";
import { router, useNavigation } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import { format } from 'date-fns';
import { useWarehousesQuery } from "@/store/api/warehouseApi"; // import api warehouse
import { WarehouseTypes } from "@/types/warehouse"; //import warehousetypes
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCustomersQuery } from '@/store/api/customerApi';

const customerReport = () => {
  const navigation = useNavigation();
  const { userInfo: currentUser } = useGlobalContext();

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  const { data: warehousesData } = useWarehousesQuery();
  const [warehouses, setWarehouses] = useState<WarehouseTypes[]>([]);

  // warehouse role
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    currentUser?.role === "user" ? currentUser.warehouse : null
  );

  const { data: customersData, isLoading: isCustomersLoading, refetch: refetchCustomers } = useCustomersQuery(selectedWarehouse || "all");

  useEffect(() => {
    if (selectedWarehouse) refetchCustomers();
  }, [selectedWarehouse]);

  // Set warehouses after fetch
  useEffect(() => {
    if (warehousesData) {
      setWarehouses(warehousesData);
      if (currentUser?.role === "admin" && warehousesData.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(warehousesData[0]._id as string);
      }
    }
  }, [warehousesData]);
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Customer Report",
      headerStyle: {
        backgroundColor: `#000000`,
      },
      headerTintColor: `#ffffff`,
      headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View className="me-4 flex flex-row justify-center items-center gap-2">
          <TouchableOpacity
            onPress={() => console.log("print")}
            className="flex flex-row justify-center items-center gap-2"
          >
            <Ionicons name="print-outline" size={30} color="gray" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);
  return (
    <View className="flex-1 bg-dark">
      {/* Header */}
      <View className='flex-row items-center justify-between -2 mb-4'>
        <View>

          {/* <Text className="text-white ms-2 ">Select Warehouse</Text> */}
          <Dropdown
            data={warehouses.map((wh) => ({ label: wh.name, value: wh._id }))}
            labelField="label"
            valueField="value"
            placeholder="Select Warehouse"
            value={selectedWarehouse}
            onChange={(item: any) => setSelectedWarehouse(item.value)}
            placeholderStyle={{ color: 'white' }}
            style={{ backgroundColor: '#1f1f1f', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, width: 190, height: 45, marginTop: 10 }}
            selectedTextStyle={{ color: 'white' }}
            itemTextStyle={{ color: 'black' }}
          />
        </View>

        <View className="flex-row gap-3 mt-3">
          <TouchableOpacity onPress={() => setShowStartPicker(true)} className="p-2 ms-2 rounded-xl bg-black-200 flex-col">
            <Text className='text-white'><Ionicons name="calendar-number-sharp" size={24} color="#fdb714" /></Text>
            <Text className="text-white  text-sm"> {format(fromDate, "dd MMM yyyy")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndPicker(true)} className="p-2 rounded-xl bg-black-200  flex-col">
            <Text className='flex-row justify-end items-end text-end' ><Ionicons className="flex-row justify-end items-center " name="calendar-number-sharp" size={24} color="#fdb714" /></Text>
            <Text className="text-white  text-sm"> {format(toDate, "dd MMM yyyy")}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/** Date Pickers */}
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

      <View className="flex-row justify-between mb-4 px-2">
        <View className="bg-black-200 p-4 rounded-2xl w-[48%]">
          <Text className="text-zinc-300 text-sm">Total Customers</Text>
          <Text className="text-yellow-400 text-xl font-bold">{customersData?.length || 0}</Text>
        </View>
        <View className="bg-black-200 p-4 rounded-2xl w-[48%]">
          <Text className="text-zinc-300 text-sm">Total Balance</Text>
          <Text className="text-primary text-xl font-bold">
            {customersData?.reduce((sum, c) => sum + (c.currentBalance || 0), 0).toLocaleString()} BDT
          </Text>
        </View>
      </View>

      <FlatList
        data={customersData}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={({ item }) => (
          <View className="bg-black-200 p-4 rounded-2xl mb-3 mx-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-200 text-lg font-semibold">
                {item.name}
              </Text>
              <Text className="text-gray-400 text-xs">{item.code}</Text>
            </View>

            <View className="flex-row justify-between mt-2">
              <View>
                <Text className="text-zinc-400 text-sm">
                  {item.company}
                </Text>
                <Text className="text-gray-300 font-bold">
                  Points: {item.point || 0}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-green-400 font-bold">
                  Open: {(item.balance || 0).toLocaleString()} BDT
                </Text>
                <Text className="text-primary font-bold">
                  Current: {(item.currentBalance || 0).toLocaleString()} BDT
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default customerReport;