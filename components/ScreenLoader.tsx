import React from "react";
import { ActivityIndicator, View, Text } from "react-native";

interface ScreenLoaderProps {
  message?: string;
}

const ScreenLoader: React.FC<ScreenLoaderProps> = ({ message = "Loading data..." }) => {
  return (
    <View className="flex-1 justify-center items-center bg-dark">
      <ActivityIndicator size="large" color="#FDB714" />
      <Text className="text-gray-400 mt-4 font-pmedium text-base">{message}</Text>
    </View>
  );
};

export default ScreenLoader;
