import { useGlobalContext } from "@/context/GlobalProvider";
import { useAddStockMutation } from "@/store/api/stockApi";
import {
  clearError,
  resetStockItem,
  setError,
  setLoading,
  updateNote,
  updateStockQuantity,
} from "@/store/slice/stockSlice";
import { RootState } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useLayoutEffect } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const StockOut = () => {
  const { id } = useLocalSearchParams();
  const { userInfo } = useGlobalContext();
  // const type = userInfo?.type

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Redux selectors
  const { stockItem, isLoading, error, success, successMessage } = useSelector(
    (state: RootState) => state.stock,
  );

  // API hooks
  const [createStock] = useAddStockMutation();

  // console.log("stockItem", stockItem);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View className="me-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex flex-row justify-center items-center gap-2"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
      title: "Stock Out",
      //@ts-ignore
      headerStyle: {
        backgroundColor: `#000000`,
      },
      //@ts-ignore
      headerTintColor: `#ffffff`,
      headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
      headerShadowVisible: false,
      headerTitleAlign: "left",
      headerShown: true,
    });
  }, [navigation]);

  const handleSubmit = async () => {
    // console.log("STOCK OUT", stockItem);
    if (!stockItem.stock || parseInt(stockItem.stock.toString()) <= 0) {
      dispatch(setError("Please enter a valid stock quantity"));
      return;
    }
    if (!stockItem.note.trim()) {
      dispatch(setError("Please enter a note"));
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      const result = await createStock(stockItem).unwrap();
      console.log("Stock added:", result);

      dispatch(resetStockItem());
      router.back();
    } catch (error) {
      console.error("Error adding stock:", error);
      dispatch(setError("Failed to add stock. Please try again."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      {/* Success/Error Messages */}
      {success && (
        <View className="mx-6 mt-4 bg-green-500 rounded-lg p-4">
          <Text className="text-white text-center font-bold">
            {successMessage}
          </Text>
        </View>
      )}

      {error && (
        <View className="mx-6 mt-4 bg-red-500 rounded-lg p-4">
          <Text className="text-white text-center font-bold">{error}</Text>
        </View>
      )}

      {/* Form */}
      <ScrollView className="flex-1">
        <View className="flex-1 px-6 pt-8">
          {/* Stock Quantity Input */}
          <View className="mb-6">
            <Text className="text-gray-300 text-lg font-medium mb-3">
              Stock Quantity to Remove
            </Text>
            <TextInput
              className="border border-black-200 text-gray-300 bg-black-200 rounded-lg p-4 text-lg text-center"
              value={stockItem.stock.toString()}
              onChangeText={(value) =>
                dispatch(updateStockQuantity(parseInt(value)))
              }
              placeholder="Enter quantity"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              autoFocus={true}
            />
          </View>

          {/* Note Input */}
          <View className="mb-8">
            <Text className="text-gray-300 text-lg font-medium mb-3">Note</Text>
            <TextInput
              multiline={true}
              numberOfLines={4}
              className="border border-black-200 text-gray-300 bg-black-200 rounded-lg p-4 text-base text-left min-h-[120px]"
              value={stockItem.note}
              onChangeText={(value) => dispatch(updateNote(value))}
              placeholder="Enter your note here..."
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`w-full p-4 rounded-lg mb-10 ${isLoading || !stockItem.stock || !stockItem.note.trim()
                ? "bg-gray-400"
                : "bg-red-600"
              }`}
            onPress={handleSubmit}
            disabled={isLoading || !stockItem.stock || !stockItem.note.trim()}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-md">
              {isLoading ? "Removing Stock..." : "Stock Out"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default StockOut;
