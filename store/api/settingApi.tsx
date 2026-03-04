import { BASE_URL } from "@/constants/baseUrl";
import { Setting } from "@/models/settingModel";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const SettingApi = createApi({
  reducerPath: "SettingApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Setting"],
  endpoints: (builder) => ({
    // Fetch setting by aamarId
    setting: builder.query<Setting, { aamarId: string }>({
      query: ({ aamarId }) => `/settings/${aamarId}/`,
      providesTags: ["Setting"],
    }),

    // Update setting with only storeSettings as body
    updateSetting: builder.mutation<any, { aamarId: string, storeSettings: Partial<Setting> }>({
      query: ({ aamarId, storeSettings }) => {
        if (!storeSettings || typeof storeSettings !== "object") {
          throw new Error("Invalid storeSettings object for updateSetting");
        }

        return {
          url: `/mobileApp/setting/update/${aamarId}`,
          method: "PUT",
          body: storeSettings,
        };
      },
      invalidatesTags: ["Setting"],
    }),
  }),
});

export const {
  useSettingQuery,
  useUpdateSettingMutation,
} = SettingApi;

export default SettingApi;
