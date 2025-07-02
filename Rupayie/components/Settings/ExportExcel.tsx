import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Text, View } from "../Themed";
import { useTransactionFilter } from "@/context/filterTransByDate";
import formatDateTimeSimple, { formatDate } from "@/utils/formatDateTimeSimple";
import { useUserData } from "@/context/user";
import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface Transaction {
  _id: string;
  amount: number;
  category: {
    name: string;
    hexColor: string;
    sign: string;
    type: string;
    _id: string;
  };
  note: string;
  pushedIntoTransactions: boolean;
  
  people: {
    name: string;
    relation: string;
    contact: number;
    _id: string;
  };
  createdAt: Date;
  image: string;
}

const ExportExcel = () => {
  const { transactionsList } = useUserData();
  const { exportTransactionsFilter } = useTransactionFilter();

  // ✅ Filter transactions based on selected date range
  const filteredTransactions = transactionsList?.filter((tx: Transaction) => {
    const transactionDate = new Date(tx.createdAt);
    return (
      transactionDate >= new Date(exportTransactionsFilter.from) &&
      transactionDate <= new Date(exportTransactionsFilter.to)
    );
  });

  // Export filtered transactions to Excel
  const exportToExcel = async () => {
    try {
      // Prepare data for Excel
      const data = filteredTransactions.map((tx: Transaction) => ({
        Date: formatDateTimeSimple(tx.createdAt),
        Amount: tx.amount,
        // Status: tx.status,
        Category: tx.category.name,
        Type: tx.category.type,
        Note: tx.note,
        ...(tx.category.type === "Borrowed" || tx.category.type === "Lend"
          ? {
            People: tx.people.name,
            Relation: tx.people.relation,
            Contact: tx.people.contact,
          }
          : {}),
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

      // Convert workbook to binary string
      const excelBinary = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

      // Define file path
      const filePath = FileSystem.cacheDirectory + `Transactions of ${exportTransactionsFilter.title}.xlsx`;

      // Save the file
      await FileSystem.writeAsStringAsync(filePath, excelBinary, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        alert("Sharing not available on this device");
      }
    } catch (error) {
      console.error("Error exporting Excel:", error);
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ marginBottom: 10 }}>
        Exporting Data from {formatDate(exportTransactionsFilter.from)} to{" "}
        {formatDate(exportTransactionsFilter.to)}
      </Text>
      <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={exportToExcel}>
        <Text style={{ textAlign: "center", fontWeight: "500", color: "#FFF" }}>EXPORT</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExportExcel;

const styles = StyleSheet.create({
  button: {
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 7,
    backgroundColor: "#005eff",
  },
});
