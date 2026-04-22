import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/slice/userSlice";

interface GlobalContextType {
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  user: any;
  loading: boolean;
  setLoading: (value: boolean) => void;
  userInfo: any;
  fetchUser: () => void;
  logout: () => void;
  storeData: (key: string, value: any) => Promise<void>;
  getData: (key: string) => Promise<any>;
  removeData: (key: string) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType>({
  loggedIn: false,
  setLoggedIn: () => {},
  user: null,
  loading: true,
  setLoading: () => {},
  userInfo: null,
  fetchUser: () => {},
  logout: () => {},
  storeData: async () => {},
  getData: async () => null,
  removeData: async () => {},
});

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

interface GlobalProviderProps {
  children: ReactNode;
}

const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: any) => state.user);
  const [loggedIn, setLoggedIn] = useState(user?.isLoggedIn || false);
  const dispatch = useDispatch();

  useEffect(() => {
    setLoggedIn(user?.isLoggedIn || false);
  }, [user?.isLoggedIn]);

  useEffect(() => {
    // Initialize auth state - check if user is logged in
    // This is where you'd check AsyncStorage, SecureStore, etc.
    // For now, we'll just set loading to false
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const fetchUser = () => {
    // Implement user fetching logic here
    // console.log("Fetching user...");
  };

  const logout = () => {
    console.log("Logging out...");
    dispatch(logoutUser());
  };

  const storeData = async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Error storing data:", error);
    }
  };

  const getData = async (key: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error getting data:", error);
      return null;
    }
  };

  const removeData = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data:", error);
    }
  };

  const value: GlobalContextType = {
    loggedIn,
    setLoggedIn,
    user,
    loading,
    setLoading,
    userInfo: user,
    fetchUser,
    logout,
    storeData,
    getData,
    removeData,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalProvider;
