import { CustomButton, FormField } from "@/components";
import { useGlobalContext } from "@/context/GlobalProvider";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import logo from "../../assets/images/icon.png";
import { useLoginUserMutation } from "../../store/api/userApi";
import { setUserInfo } from "../../store/slice/userSlice";

import { jwtDecode } from "jwt-decode";

const SignIn = () => {
  const dispatch = useDispatch();
  const [login] = useLoginUserMutation();
  const { setLoggedIn, storeData, removeData } = useGlobalContext();

  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    // console.log(form);
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    } else {
      console.log(form)
      setSubmitting(true);
      try {
        const result = await login({
          email: form.email,
          password: form.password,
        });

        console.log("RESULT:", result);

        if (result?.data?.status) {
          removeData("user");
          const token = result?.data?.access_token;
          const decodedToken = jwtDecode(token);
          setLoggedIn(true);
          storeData("user", decodedToken);
          dispatch(setUserInfo({ ...decodedToken, isLoggedIn: true }));
          router.push("/(drawer)/(tabs)");
        } else {
          // Custom error handling
          const errorObj = result?.error;
          const errorMessage =
            errorObj?.data?.error ||
            errorObj?.error ||
            errorObj?.message ||
            "An unknown error occurred. Please try again.";

          const displayMessage = typeof errorMessage === 'string'
            ? errorMessage
            : JSON.stringify(errorMessage);

          Alert.alert("Error", displayMessage);
        }
      } catch (error) {
        console.log("LOGIN CATCH ERROR:", error);
        const errorMessage =
          error?.message || "Something went wrong. Please try again later.";

        const displayMessage = typeof errorMessage === 'string'
          ? errorMessage
          : JSON.stringify(errorMessage);

        Alert.alert("Error", displayMessage);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dark"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView className=" bg-dark ">
        <SafeAreaView
          className="w-full flex justify-center "
          style={{
            minHeight: Dimensions.get("window").height + 200,
          }}
        >

          <View className="bg-dark px-8  pb-10 ">
            <View className="flex w-full justify-start items-center">
              <Image className="h-36 w-36" source={logo} />
            </View>
            <FormField
              title="Username"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-14"
              placeholder="username"
              keyboard="default"
            />
            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-5"
              placeholder="Password"
              keyboard="number-pad"
            />
            <CustomButton
              title="Sign In"
              handlePress={submit}
              containerStyles="mt-7 h-16 bg-gray-500"
              isLoading={isSubmitting}
            />
            <View className="flex justify-center pt-10 flex-row gap-2 pb-48">
              {/* <Text className="text-lg text-black-200 font-pregular">
                Don't have an account?
              </Text> */}
              <Link
                href="/forgot-password"
                className="text-lg font-psemibold text-gray-400"
              >
                Forgot Password
              </Link>
            </View>
          </View>
        </SafeAreaView>
        <StatusBar backgroundColor="#fff" style="light" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
