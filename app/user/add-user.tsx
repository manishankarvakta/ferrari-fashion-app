import { Colors } from "@/constants/Colors";
import { useGlobalContext } from "@/context/GlobalProvider";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { CustomButton } from "@/components";

import CustomDropdown from "@/components/CustomDropdown";
import { useAddUserMutation } from "@/store/api/userApi";
import { useWarehousesQuery } from "@/store/api/warehouseApi";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import profile from "../../assets/images/profile.jpg";

const AddUser = () => {
  const { userInfo } = useGlobalContext();
  // const warehouse = userInfo?.warehouse;
  const [isPhoto, setIsPhoto] = useState(false);
  const [warehouse, setWarehouse] = useState([
    {
      label: "Select Warehouse",
      value: "",
    },
  ]);

  const [addNewUser, { isLoading: isAdding }] = useAddUserMutation();

  const [type, setType] = useState([
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
  ]);
  const [status, setStatus] = useState([
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]);

  const { data, isSuccess, isError, isLoading } = useWarehousesQuery();

  // console.log("WAREHOUSE DATA", data);
  useEffect(() => {
    if (isSuccess) {
      setWarehouse(
        data?.map((item) => ({ label: item?.name, value: item?._id })),
      );
    }
  }, [isSuccess, data]);

  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View className="flex flex-row me-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ),
      title: "Add User",
      headerStyle: {
        backgroundColor: Colors[colorScheme ?? "dark"].backgroundColor,
      },
      headerTintColor: `${Colors[colorScheme ?? "dark"].backgroundColor}`,
      headerTitleStyle: { fontWeight: "bold", fontSize: 18, color: "#ffffff" },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerShown: true,
    });
  }, [navigation]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    type: "manager",
    photo: "",
    phone: "",
    status: "active",
    warehouse: "",
  });

  // console.log("User DATA", form);

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  useEffect(() => {
    handleInputChange("username", form?.phone);
  }, [form?.phone]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setForm({ ...form, photo: result.assets[0].uri });
    }
  };

  const handleCreateUser = async () => {
    try {
      console.log("FORM DATA", form);
      const response = await addNewUser(form).unwrap();
      console.log("User added successfully:", response);
      Alert.alert("Success", "User added successfully!", [
        { text: "OK", onPress: () => router.push("/user") }
      ]);
    } catch (error) {
      console.error("Error adding User:", error);
      Alert.alert("Error", "Failed to add user. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      style={{ flex: 1 }}
    >
      <ScrollView 
        className="flex-1 bg-dark p-4 mx-auto w-full"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 360 }}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >

      <StatusBar style="light" />
      <View>
        
        <TouchableOpacity
          onPress={pickImage}
          className="flex justify-center items-center"
        >
          <Image source={profile} className="w-40 h-40 rounded-full" />
        </TouchableOpacity>
      </View>

      <Text className="text-gray-200 placeholder:text-gray-500 font-regular text-lg ms-3">
        Name
      </Text>
      <TextInput
        placeholder="User Name"
        value={form.name}
        onChangeText={(value) => handleInputChange("name", value)}
        className="border placeholder:text-gray-500 bg-black-200 rounded-full p-4 mb-3 text-gray-200"
      />
      <Text className="text-gray-200 placeholder:text-gray-500 font-regular text-lg ms-3">
        Phone
      </Text>
      <TextInput
        placeholder="Phone number"
        value={form.phone}
        onChangeText={(value) => handleInputChange("phone", value)}
        className="border placeholder:text-gray-500 bg-black-200 rounded-full p-4 mb-3 text-gray-200"
      />
      <Text className="text-gray-200 placeholder:text-gray-500 font-regular text-lg ms-3">
        Password
      </Text>
      <TextInput
        placeholder="Password"
        value={form.password}
        secureTextEntry={true}
        onChangeText={(value) => handleInputChange("password", value)}
        className="border placeholder:text-gray-500 bg-black-200 rounded-full p-4 mb-3 text-gray-200"
      />
      <Text className="text-gray-200 placeholder:text-gray-500 font-regular text-lg ms-3">
        Email
      </Text>
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(value) => handleInputChange("email", value)}
        className="border placeholder:text-gray-500 bg-black-200 rounded-full p-4 mb-3 text-gray-200"
      />
      <Text className="text-gray-200 placeholder:text-gray-500 font-regular text-lg ms-3">
        Warehouse
      </Text>
      <CustomDropdown
        data={warehouse}
        value={form.warehouse}
        setValue={(value) => handleInputChange("warehouse", value)}
        placeholder="Select Warehouse"
        mode="modal"
        search={false}
      />

      <View className="flex flex-row gap-2 justify-center ms-[-25px]  ">
        <View className="w-[160px]">
          <Text className="text-gray-200 placeholder:text-gray-500 font-regular text-lg ms-3">
            Type
          </Text>
          <CustomDropdown
            data={type}
            value={form.type}
            placeholder="Type"
            mode="modal"
            setValue={(value) => handleInputChange("type", value)}
          />
        </View>

        <View className="w-[160px]">
          <Text className="text-gray-200 placeholder:text-gray-500 font-regular text-lg ms-3">
            Status
          </Text>
          <CustomDropdown
            data={status}
            value={form.status}
            placeholder="Status"
            mode="modal"
            search={false}
            setValue={(value) => handleInputChange("status", value)}
          />
        </View>
      </View>


        <CustomButton
          title={isAdding ? "Adding User..." : "Add User"}
          handlePress={handleCreateUser}
          isLoading={isAdding}
          containerStyles="bg-primary mt-2 mb-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddUser;
