import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/baseUrl";

const DashbordApi = createApi({
  reducerPath: "DashbordApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Dashbord"],
  endpoints: (builder) => ({
    dashbord: builder.query<any, any>({
      query: ({ date, warehouse }) => `/dashboard/byDate/${warehouse}/${date}`,
      providesTags: ["Dashbord"],
    }),
    pettyCashSummary: builder.query<any, string>({
      query: (warehouseId) => `/petty-cash-summary/${warehouseId}`,
      providesTags: ["Dashbord"],
    }),
  }),
});

export const { useDashbordQuery, usePettyCashSummaryQuery } = DashbordApi;

export default DashbordApi;