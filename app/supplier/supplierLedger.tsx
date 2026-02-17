import { useSupplierQuery } from "@/store/api/supplierApi";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SupplierLedger = () => {
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    // Ensure id is a string
    const supplierId = Array.isArray(id) ? id[0] : id;

    const { data, isLoading, isFetching, refetch } = useSupplierQuery(
        {
            _id: supplierId,
            date: new Date().toDateString(),
            isDate: "all",
        },
        { skip: !supplierId }
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            title: data?.supplier?.name || "Supplier Ledger",
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
            headerShadowVisible: false,
            headerTitleAlign: "center",
            headerShown: true,
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} className="ms-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, data]);

    // Show all transactions
    const filteredTransactions = useMemo(() => {
        if (!data?.transaction) return [];
        return data.transaction;
    }, [data?.transaction]);

    const ledgerRows = useMemo(() => {
        if (!data?.supplier || filteredTransactions.length === 0) return [];

        // For Supplier: Purchase increases balance (Credit), Payment decreases balance (Debit)
        const totalPurchase = filteredTransactions
            .filter((t: any) => t.type?.toLowerCase() === "purchase")
            .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

        const totalPayment = filteredTransactions
            .filter((t: any) => t.type?.toLowerCase() === "payment")
            .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

        // Opening Balance = Current - Purchase(Credit) + Payment(Debit)
        let runningBalance = (data.supplier.balance || 0) - totalPurchase + totalPayment;

        return [...filteredTransactions]
            .reverse()
            .map((item: any) => {
                const isPurchase = item.type?.toLowerCase() === "purchase";

                // Accounting: Supplier (Liability)
                // Purchase -> Credit (Increases Balance)
                // Payment -> Debit (Decreases Balance)

                const credit = isPurchase ? (Number(item.amount) || 0) : 0;
                const debit = !isPurchase ? (Number(item.amount) || 0) : 0; // Payment

                runningBalance = runningBalance + credit - debit;

                return {
                    ...item,
                    debit,
                    credit,
                    balance: runningBalance,
                };
            });
    }, [data, filteredTransactions]);

    // Calculate summary
    const summary = useMemo(() => {
        const totalDebit = ledgerRows.reduce((sum, row) => sum + (row.debit || 0), 0);
        const totalCredit = ledgerRows.reduce((sum, row) => sum + (row.credit || 0), 0);
        const finalBalance = ledgerRows.length > 0
            ? ledgerRows[ledgerRows.length - 1].balance
            : (data?.supplier?.balance || 0);

        return { totalDebit, totalCredit, finalBalance };
    }, [ledgerRows, data?.supplier?.balance]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch();
        setTimeout(() => setRefreshing(false), 1000);
    }, [refetch]);

    // Show loading only if we don't have data yet
    if (isLoading && !data) {
        return (
            <View className="flex-1 bg-dark justify-center items-center">
                <ActivityIndicator size="large" color="#fdb714" />
                <Text className="text-white mt-4">Loading Ledger...</Text>
            </View>
        );
    }

    // Show error state if no supplier data
    if (!data?.supplier) {
        return (
            <View className="flex-1 bg-dark justify-center items-center">
                <Ionicons name="alert-circle-outline" size={60} color="gray" />
                <Text className="text-gray-400 text-lg mt-4">Supplier not found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }} className="bg-dark">
            <StatusBar style="light" backgroundColor="#000" />

            {/* Supplier Info Card */}
            <View className="bg-black-200 mx-3 mt-3 rounded-2xl overflow-hidden mb-3">
                {/* Supplier Info */}
                <View className="p-4">
                    <Text className="text-white text-xl font-bold">
                        {data?.supplier?.name}
                    </Text>

                    <Text className="text-gray-400 text-sm mt-1">
                        {data?.supplier?.company} • {data?.supplier?.phone}
                    </Text>
                </View>

                {/* Divider */}
                <View className="h-[1px] bg-white/10 mx-4" />

                {/* Summary Section */}
                <View className="p-4 space-y-3">
                    {/* Debit / Credit */}
                    <View className="flex-row justify-between">
                        <View>
                            <Text className="text-gray-400 text-xs uppercase">
                                Total Paid
                            </Text>
                            <Text className="text-green-500 text-lg font-bold mt-1">
                                {summary.totalDebit.toLocaleString()}
                            </Text>
                        </View>

                        <View className="items-end">
                            <Text className="text-gray-400 text-xs uppercase">
                                Total Purchase
                            </Text>
                            <Text className="text-red-500 text-lg font-bold mt-1">
                                {summary.totalCredit.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    {/* Inner Divider */}
                    <View className="h-[1px] bg-white/10" />

                    {/* Balance */}
                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-300 text-sm font-semibold">
                            Current Balance
                        </Text>

                        <Text className="text-primary text-2xl font-extrabold">
                            {summary.finalBalance.toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>


            {/* Summary Card */}


            {/* Table Header */}
            <View className="flex-row bg-gray-300 py-2 mx-[1px]">
                <Text className="flex-[1] font-bold text-[12px] px-1 mx-[1px]">Date</Text>
                <Text className="flex-[1] font-bold text-[12px] px-1 mx-[1px]">Type</Text>
                <Text className="flex-[1] font-bold text-[12px] px-1 mx-[1px]">Debit</Text>
                <Text className="flex-[1] font-bold text-[12px] px-1 mx-[1px]">Credit</Text>
                <Text className="flex-[1] font-bold text-[12px] px-1 mx-[1px]">Balance</Text>
            </View>

            {/* Ledger List */}
            {ledgerRows.length > 0 ? (
                <FlatList
                    data={ledgerRows}
                    keyExtractor={(item, index) => item?._id || index.toString()}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    renderItem={({ item }) => (
                        <View className="flex-row py-2 bg-white mx-[1px]">
                            <Text className="flex-[1] text-[11px] px-1 mx-[1px]">
                                {format(new Date(item.createdAt), "dd MMM")}
                            </Text>
                            <Text className="flex-[1] text-[11px] px-1 mx-[1px]">
                                {item.type}
                            </Text>
                            <Text className="flex-[1] text-[11px] font-semibold text-green-600 px-1 mx-[1px]">
                                {item.debit || "-"}
                            </Text>
                            <Text className="flex-[1] text-[11px] font-semibold text-red-600 px-1 mx-[1px]">
                                {item.credit || "-"}
                            </Text>
                            <Text className="flex-[1] text-[12px] font-bold px-1 mx-[1px]">
                                {item.balance}
                            </Text>
                        </View>
                    )}
                />
            ) : (
                <View className="flex-1 justify-center items-center mt-10">
                    <Ionicons name="receipt-outline" size={60} color="gray" />
                    <Text className="text-gray-400 text-lg mt-4">No transactions found</Text>
                    <Text className="text-gray-500 text-sm">for this supplier</Text>
                </View>
            )}
        </View>
    );
};

export default SupplierLedger;
