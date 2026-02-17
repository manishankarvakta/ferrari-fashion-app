import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/baseUrl";
import { Transaction } from "../../types/transactions";
import DashbordApi from "./dashbordApi";
import { warehouseApi } from "./warehouseApi";

// console.log(BASE_URL);

export const TransactionApi = createApi({
  reducerPath: "TransactionApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Transaction", "Warehouse", "Dashbord"],
  endpoints: (builder) => ({
    Transactions: builder.query<Transaction[], void>({
      query: () => "/transaction",
      providesTags: ["Transaction"],
    }),
    Transaction: builder.query<Transaction, string>({
      query: (_id) => `/transaction/${_id}`,
      providesTags: ["Transaction"],
    }),
    TransactionList: builder.query<{ transactions: Transaction[] }, any>({
      query: ({ warehouse, type, date, startDate, endDate }) => {
        // Use startDate/endDate if provided, otherwise fall back to single date
        if (startDate && endDate) {
          return `/transaction/list/${warehouse}/${type}?startDate=${startDate}&endDate=${endDate}`;
        } else if (date) {
          return `/transaction/list/${warehouse}/${type}/${date}`;
        } else {
          // If no date parameters provided, throw error to prevent undefined in URL
          throw new Error('Either date or startDate/endDate must be provided');
        }
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log(`[API DEBUG] TransactionList Success - Type: ${arg.type}`, data);
        } catch (err) {
          console.error(`[API DEBUG] TransactionList Error - Type: ${arg.type}`, err);
        }
      },
      providesTags: (result, error, { warehouse }) => [
        { type: "Transaction", id: warehouse },
        "Transaction",
      ],
    }),
    TransactionByCustomer: builder.query<Transaction[], any>({
      query: ({ startDate, endDate, customerId }) =>
        `/transaction/byCustomer/${startDate}/${endDate}/?id=${customerId}`,
      providesTags: ["Transaction"],
    }),
    addTransaction: builder.mutation<{}, Transaction>({
      query: (Transaction) => ({
        url: "/transaction",
        method: "POST",
        body: Transaction,
      }),
      invalidatesTags: ["Transaction"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          if (arg.warehouse) {
            // Invalidate Warehouse specifically and generally
            dispatch(
              warehouseApi.util.invalidateTags([
                { type: "Warehouse", id: arg.warehouse },
                "Warehouse",
              ])
            );
            // Invalidate Transaction specifically and generally
            dispatch(
              TransactionApi.util.invalidateTags([
                { type: "Transaction", id: arg.warehouse },
                "Transaction",
              ])
            );
            // Invalidate Dashboard
            dispatch(
              DashbordApi.util.invalidateTags(["Dashbord"])
            );
          }
        } catch { }
      },
    }),
    updateTransaction: builder.mutation<void, Transaction>({
      query: ({ _id, ...rest }) => ({
        url: `/transaction/${_id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: ["Transaction"],
    }),
    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/transaction/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transaction"],
    }),

    // new to cashIn report

    cashInTransaction: builder.query<{ transactions: Transaction[] }, { warehouse: string; date?: string }>({
      query: ({ warehouse, date }) => `/transaction/list/${warehouse}/deposit/${date || ""}`,
      providesTags: (result, error, { warehouse }) => [
        { type: "Transaction", id: warehouse },
        "Transaction",
      ],

    }),
    // addBalanceTransaction: builder.mutation<any, any>({
    //   query: (data) => ({
    //     url: "/transaction/add-balance",
    //     method: "POST",
    //     body: data,
    //   }),
    //   invalidatesTags: ["Transaction", "Warehouse", "Dashbord"],
    // }),
  }),
});

export const {
  useTransactionsQuery,
  useTransactionQuery,
  useTransactionListQuery,
  useTransactionByCustomerQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useCashInTransactionQuery,
  // useAddBalanceTransactionMutation,
} = TransactionApi;

export default TransactionApi;
