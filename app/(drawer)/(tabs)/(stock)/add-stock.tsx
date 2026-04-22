import photo from "@/assets/images/product.jpg";
import { DatePickerField } from "@/components/DatePickerField";
import PhotoUploader from "@/components/PhotoUploader";
import { CustomButton } from "@/components";
import { useGlobalContext } from "@/context/GlobalProvider";
import { useAddProductMutation } from "@/store/api/productApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Platform } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const AddStock = () => {
  const {userInfo} = useGlobalContext()
  // console.log("userInfo", userInfo);
  

  const [formData, setFormData] = useState({
    style: "",
    code: "",
    openingStock: 0,
    currentStock: 0,
    details: "",
    status: "active",
    date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
    warehouse: userInfo?.warehouse,
    photo: null,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      warehouse: userInfo?.warehouse,
    }));
  }, [userInfo?.warehouse]);

  const [createProduct, { isLoading: isAdding }] = useAddProductMutation();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // console.log("userInfo", formData);
    // Validate required fields
    if (!formData.style || !formData.code || !formData.openingStock) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const result = await createProduct(formData).unwrap();
      console.log("Response:", result);
      Alert.alert("Success", "Product added successfully!", [
        { text: "OK", onPress: () => router.push("/(drawer)/(tabs)/(stock)/products") }
      ]);
    } catch (error) {
      console.error("Error creating product:", error);
      Alert.alert("Error", "Failed to add product. Please try again.");
    }
  };
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Add Stock",
      headerStyle: { backgroundColor: "#000000" },
      headerTintColor: "#ffffff",
      headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
      headerTitleAlign: "center",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1"
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
    <ScrollView
            className="flex-1 m-2"
           contentContainerStyle={{ paddingBottom: 220 }}
         keyboardShouldPersistTaps="handled"
         showsVerticalScrollIndicator={false}
          >
      <View className="">
        {/* Form */}
        <View className="bg-dark p-4 rounded-lg">
          {/* Styles Input */}
          <View className="mb-4">
            <Text className="text-white text-base font-pmedium mb-2">
              Styles <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-black-200 border border-gray-600 p-4 rounded-lg flex-row items-center">
              <Ionicons
                name="shirt"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 12 }}
              />
              <TextInput
                className="flex-1 text-white text-base"
                value={formData.style}
                onChangeText={(value) => handleInputChange("style", value)}
                placeholder="Enter style name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Code Input */}
          <View className="mb-4">
            <Text className="text-white text-base font-pmedium mb-2">
              Code <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-black-200 border border-gray-600 p-4 rounded-lg flex-row items-center">
              <Ionicons
                name="barcode"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 12 }}
              />
              <TextInput
                className="flex-1 text-white text-base"
                value={formData.code}
                onChangeText={(value) => handleInputChange("code", value)}
                placeholder="Enter product code"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Quantity Input */}
          <View className="mb-4">
            <Text className="text-white text-base font-pmedium mb-2">
              Qty <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-black-200 border border-gray-600 p-4 rounded-lg flex-row items-center">
              <Ionicons
                name="cube"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 12 }}
              />
              <TextInput
                className="flex-1 text-white text-base"
                value={formData.openingStock}
                onChangeText={(value) =>
                  handleInputChange("openingStock", value)
                }
                placeholder="Enter quantity"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Date Picker */}
          <DatePickerField
            label="Date"
            value={formData.date}
            onChange={(date) => handleInputChange("date", date)}
            required
          />
        </View>

        {/* Media Upload */}
        {/* <ImageUploader
          image={formData.image}
          onImageSelected={(uri) => handleInputChange("image", uri)}
        /> */}
       <PhotoUploader
                placeholder={photo}
                onUploadSuccess={(url)=>handleInputChange("photo", url)}
                previewStyle={"square"}
                aspectRatio={[1,1]}
                />


        {/* Action Buttons */}
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity
            className="flex-1 bg-gray-600 p-4 rounded-lg flex-row items-center justify-center"
            onPress={() => router.back()}
            activeOpacity={0.8}
            disabled={isAdding}
          >
            <Ionicons name="close-outline" size={20} color="#ffffff" />
            <Text className="text-white font-pbold ml-2">Cancel</Text>
          </TouchableOpacity>

          <CustomButton
            title={isAdding ? "Saving..." : "Save Stock"}
            handlePress={handleSubmit}
            isLoading={isAdding}
            containerStyles="flex-1 bg-primary rounded-lg"
            textStyles="text-black font-pbold"
          />
        </View>
      </View>
    </ScrollView>
 </KeyboardAvoidingView>
  );
};

export default AddStock;
