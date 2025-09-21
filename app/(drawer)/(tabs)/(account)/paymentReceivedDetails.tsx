import { useGlobalContext } from "@/context/GlobalProvider";
import { useTransactionQuery } from "@/store/api/transactionApi";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const PaymentReceivedDetails = () => {
  const { _id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { userInfo, fetchUser } = useGlobalContext();
  const type = userInfo?.type

  const { data, isSuccess, isLoading, error, isError, refetch } =
    useTransactionQuery(_id as string);

  useEffect(() => {
    refetch();
  }, [_id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View className="flex flex-row me-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ),
      title: "Payment Received Details",
      headerStyle: {
        backgroundColor: "#000000",
      },
      headerTintColor: "#ffffff",
      headerTitleStyle: { fontWeight: "bold", fontSize: 18, color: "#ffffff" },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerShown: true,
    });
  }, [navigation]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-white mt-4 text-lg">
          Loading transaction details...
        </Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-dark justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-white mt-4 text-xl font-semibold text-center">
          Transaction not found
        </Text>
        <Text className="text-gray-400 mt-2 text-center">
          The transaction you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-dark";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "paymentReceived":
        return "text-green-400";
      case "payment":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "paymentReceived":
        return "add-circle";
      case "payment":
        return "remove-circle";
      default:
        return "swap-horizontal";
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark">
      {/* Header Card */}
      <View className="mx-4 mt-6 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
              <Ionicons
                name={getTypeIcon(data.type)}
                size={24}
                color="#ffffff"
              />
            </View>
            <View>
              <Text className="text-white text-lg font-semibold capitalize">
                {data.type}
              </Text>
              <Text className="text-white/80 text-sm">
                Transaction #{data.code}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-white/80 text-sm">Amount</Text>
            <Text className="text-white text-2xl font-bold">
              ৳{data.amount?.toLocaleString()}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="bg-white/20 rounded-lg px-3 py-2">
            <Text className="text-white/80 text-xs">Status</Text>
            <Text
              className={`text-white font-semibold capitalize ${getStatusColor(data.status)}`}
            >
              {data.status}
            </Text>
          </View>
          <View className="bg-white/20 rounded-lg px-3 py-2">
            <Text className="text-white/80 text-xs">Date</Text>
            <Text className="text-white font-semibold">
              {data.date && format(new Date(data.date), "dd MMM yyyy")}
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction Details */}
      <View className="mx-4 mt-6 bg-black-200 rounded-2xl p-6">
        <Text className="text-white text-xl font-semibold mb-4">
          Transaction Details
        </Text>

        <View className="space-y-4">
          <View className="flex-row justify-between items-center py-3 border-b border-gray-700">
            <Text className="text-gray-300 text-base">Customer</Text>
            <Text className="text-white text-base font-medium">
              {data?.customerId?.name || "N/A"}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-700">
            <Text className="text-gray-300 text-base">Transaction Code</Text>
            <Text className="text-white text-base font-medium font-mono">
              {data.code}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-700">
            <Text className="text-gray-300 text-base">Date & Time</Text>
            <Text className="text-white text-base font-medium">
              {data.date && format(new Date(data.date), "dd MMM yyyy, h:mm a")}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-700">
            <Text className="text-gray-300 text-base">Type</Text>
            <Text
              className={`text-base font-medium capitalize ${getTypeColor(data.type)}`}
            >
              {data.type}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-700">
            <Text className="text-gray-300 text-base">Status</Text>
            <Text
              className={`text-base font-medium capitalize ${getStatusColor(data.status)}`}
            >
              {data.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Balance Information */}
      <View className="mx-4 mt-6 bg-black-200 rounded-2xl p-6">
        <Text className="text-white text-xl font-semibold mb-4">
          Balance Information
        </Text>

        <View className="space-y-4">
          <View className="flex-row justify-between items-center py-3 border-b border-gray-700">
            <Text className="text-gray-300 text-base">Opening Balance</Text>
            <Text className="text-white text-base font-medium">
              ৳{data.openingBalance?.toLocaleString()}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-700">
            <Text className="text-gray-300 text-base">Transaction Amount</Text>
            <Text className="text-green-400 text-base font-medium">
              +৳{data.amount?.toLocaleString()}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3">
            <Text className="text-white text-lg font-semibold">
              New Balance
            </Text>
            <Text className="text-white text-lg font-bold">
              ৳{data.currentBalance?.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Additional Information */}
      {(data.note || data.invoices || data.photo) && (
        <View className="mx-4 mt-6 bg-black-200 rounded-2xl p-6 mb-6">
          <Text className="text-white text-xl font-semibold mb-4">
            Additional Information
          </Text>

          {data.note && (
            <View className="mb-4">
              <Text className="text-gray-300 text-base mb-2">Note</Text>
              <Text className="text-white text-base bg-gray-700 rounded-lg p-3">
                {data.note}
              </Text>
            </View>
          )}

          {data.invoices && (
            <View className="mb-4">
              <Text className="text-gray-300 text-base mb-2">
                Invoice Reference
              </Text>
              <Text className="text-white text-base bg-gray-700 rounded-lg p-3 font-mono">
                {data.invoices}
              </Text>
            </View>
          )}

          {data.photo && (
            <View>
              <Text className="text-gray-300 text-base mb-2">Photo</Text>
              <View className="bg-gray-700 rounded-lg p-3">
                <Text className="text-white text-base text-center">
                  Photo attached
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View className="mx-4 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-black-200 py-4 rounded-xl items-center"
        >
          <Text className="text-white text-lg font-semibold">
            Back to Transactions
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PaymentReceivedDetails;
