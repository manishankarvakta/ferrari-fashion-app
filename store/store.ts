import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";

// Example slice reducer (you can replace this with your actual slice)
import { AccountApi } from "./api/accountApi";
import { AccountHeadApi } from "./api/accountHeadApi";
import CustomerApi from "./api/customerApi";
import DashboarApi from "./api/dashbordApi";
import ProductApi from "./api/productApi";
import PurchaseApi from "./api/purchasApi";
import SaleApi from "./api/saleApi";
import SearchApi from "./api/searchApi";
import SettingApi from "./api/settingApi";
import StockApi from "./api/stockApi";
import SupplierApi from "./api/supplierApi";
import TransactionApi from "./api/transactionApi";
import UploadApi from "./api/uploadApi";
import UserApi from "./api/userApi";
import WarehouseApi from "./api/warehouseApi";
import settingReducer from "./slice/settingSlice";
import stockReducer from "./slice/stockSlice";
import userReducer from "./slice/userSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["pos", "user"],
};

const rootReducers = combineReducers({
  user: userReducer,
  setting: settingReducer,
  stock: stockReducer,
  [UserApi.reducerPath]: UserApi.reducer,
  [DashboarApi.reducerPath]: DashboarApi.reducer,
  [WarehouseApi.reducerPath]: WarehouseApi.reducer,
  [CustomerApi.reducerPath]: CustomerApi.reducer,
  [SupplierApi.reducerPath]: SupplierApi.reducer,
  [ProductApi.reducerPath]: ProductApi.reducer,
  [StockApi.reducerPath]: StockApi.reducer,
  [SaleApi.reducerPath]: SaleApi.reducer,
  [TransactionApi.reducerPath]: TransactionApi.reducer,
  [SettingApi.reducerPath]: SettingApi.reducer,
  [UploadApi.reducerPath]: UploadApi.reducer,
  [PurchaseApi.reducerPath]: PurchaseApi.reducer,
  [AccountApi.reducerPath]: AccountApi.reducer,
  [AccountHeadApi.reducerPath]: AccountHeadApi.reducer,
  [SearchApi.reducerPath]: SearchApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([
      SaleApi.middleware,
      DashboarApi.middleware,
      WarehouseApi.middleware,
      ProductApi.middleware,
      TransactionApi.middleware,
      StockApi.middleware,
      CustomerApi.middleware,
      SupplierApi.middleware,
      UserApi.middleware,
      SettingApi.middleware,
      UploadApi.middleware,
      PurchaseApi.middleware,
      AccountApi.middleware,
      AccountHeadApi.middleware,
      SearchApi.middleware,
    ]),
});

// Export the RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;
