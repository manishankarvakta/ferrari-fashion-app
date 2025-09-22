import { useGlobalContext } from "@/context/GlobalProvider";
import { useAddTransactionMutation } from "@/store/api/transactionApi";
import { useWarehouseQuery } from "@/store/api/warehouseApi";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const CashDepositDetails = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { userInfo } = useGlobalContext();
// const type = userInfo?.type

  const { data, isSuccess, isLoading, refetch } = useWarehouseQuery(
    userInfo?.warehouse,
  );

  useEffect(() => {
    refetch();
  }, [userInfo]);

  useEffect(() => {
    if (data && isSuccess) {
      setFormData((prev) => ({
        ...prev,
        openingBalance: data?.currentBalance,
        currentBalance: data?.currentBalance,
      }));
    }
  }, [data, isSuccess]);

  const [createTransaction] = useAddTransactionMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    user: userInfo?.id,
    warehouse: userInfo?.warehouse,
    amount: 0,
    openingBalance: 0,
    currentBalance: 0,
    photo: "",
    invoices: "",
    note: "",
    date: new Date(),
    type: "deposit",
    status: "complete",
  });

  console.log("FD", formData);

  console.log(data);

  useEffect(() => {
    if (data && isSuccess) {
      setFormData((prev) => ({
        ...prev,
        openingBalance: data?.currentBalance,
        currentBalance: data?.currentBalance,
      }));
    }
  }, [data, isSuccess]);

  const [showDatePicker, setShowDatePicker] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Deposit",
      //@ts-ignore
      headerStyle: {
        backgroundColor: `#000000`,
      },
      //@ts-ignore
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
    });
  }, [navigation]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log("Date picker event:", event);
    console.log("Selected date:", selectedDate);

    if (selectedDate) {
      setFormData((prev) => ({ ...prev, date: selectedDate }));
      console.log("Date updated to:", selectedDate);

      // Close picker after selection
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }
    }
  };

  const handleDatePress = () => {
    console.log("Opening date picker");
    setShowDatePicker(true);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "amount") {
      // Convert string to number for numeric fields
      const numValue = parseInt(value) || 0;

      setFormData((prev) => ({
        ...prev,
        [field]: numValue,
        currentBalance: parseInt(data?.currentBalance) + numValue,
      }));
    } else {
      // Handle string fields normally
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleTypeChange = (
    type: "income" | "expense" | "payment" | "receipt",
  ) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleSubmit = async () => {
    console.log("Transaction Form Data:", formData);
    console.log("Photo URI:", formData.photo);

    try {
      const response = await createTransaction(formData).unwrap();
      // console.log("Transaction created:", response);
    } catch (error) {
      // console.error("Error creating transaction:", error);
    
    }
      router.back();

    // Alert.alert(
    //   "Success",
    //   "Form data logged to console. Check console for details.",
    //   [
    //     {
    //       text: "OK",
    //       onPress: () => {
    //         setFormData({
    //           name: "",
    //           user: userInfo?.id,
    //           warehouse: userInfo?.warehouse,
    //           amount: 0,
    //           openingBalance: 0,
    //           currentBalance: 0,
    //           photo: "",
    //           invoices: "",
    //           note: "",
    //           date: new Date(),
    //           type: "deposit",
    //           status: "complete",
    //         });
    //         router.back();
    //       },
    //     },
    //   ],
    // );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dark"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView className="flex-1 bg-dark"
        keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="light" />

        {/* Name Input */}
        <View className="mb-4">
          <Text className="text-gray-300 text-lg font-medium">Name</Text>
          <TextInput
            className="border  border-black-200 bg-black-200  rounded-lg p-4 text-lg text-white"
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder="Enter name"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        {/* Date Input */}
        <View className="mb-4">
          <Text className="text-gray-300 text-lg font-medium">Date</Text>
          <TouchableOpacity
            className="border border-black-200 bg-black-200 rounded-lg p-4 flex-row justify-between items-center"
            onPress={handleDatePress}
            activeOpacity={0.7}
          >
            <Text className="text-white text-lg">
              {formatDate(formData.date)}
            </Text>
            <Ionicons name="calendar" size={24} color="#FDB714" />
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View className="mb-4">
          <Text className="text-gray-300 text-lg font-medium">Amount</Text>
          <TextInput
            className="border  border-black-200 bg-black-200  rounded-lg p-4 text-lg text-white"
            value={formData.amount.toString()}
            onChangeText={(value) => handleInputChange("amount", value)}
            placeholder="Enter amount"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        {/* Note Input */}
        <View className="mb-4">
          <Text className="text-gray-300 text-lg font-medium">Note</Text>
          <TextInput
            multiline={true}
            numberOfLines={4}
            className="border  border-black-200 bg-black-200  rounded-lg p-4 text-base text-white min-h-[120px]"
            value={formData.note}
            onChangeText={(value) => handleInputChange("note", value)}
            placeholder="Enter transaction note..."
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="w-full bg-primary p-4 rounded-lg mt-4 mb-8"
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text className="text-black text-center font-bold text-lg">
            Create Transaction
          </Text>
        </TouchableOpacity>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <View className="absolute inset-0 bg-black/70 justify-center items-center z-50">
          <View className="bg-gray-900 rounded-2xl p-6 w-full border border-gray-700 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Select Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="bg-gray-800 rounded-xl p-4 mb-6">
              <DateTimePicker
                value={formData.date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(2020, 0, 1)}
                textColor="#ffffff"
                themeVariant="dark"
              />
            </View>

            {Platform.OS === "ios" && (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="w-52 bg-gray-700 p-4 rounded-xl border border-gray-600"
                  onPress={() => setShowDatePicker(false)}
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-300 text-center font-semibold text-lg">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary p-4 rounded-xl"
                  onPress={() => setShowDatePicker(false)}
                  activeOpacity={0.7}
                >
                  <Text className="text-black text-center font-bold text-lg">
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CashDepositDetails;
