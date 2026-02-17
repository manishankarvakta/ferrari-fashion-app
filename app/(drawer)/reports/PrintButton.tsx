import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useRouter } from "expo-router";

type PrintButtonProps = {
  filteredData: any[];
  title?: string;
  subtitle?: string;
};

export default function PrintButton({ filteredData = [], title = "Report", subtitle }: PrintButtonProps) {
  const router = useRouter();

  const generatePDF = async (data: any[], subTitle?: string) => {
    if (!data || data.length === 0) {
      throw new Error("No data available for printing");
    }

    // Dynamically get table headers from object keys, excluding technical/ID fields
    const excludedKeys = ["_id", "id", "__v", "user", "warehouse", "status", "photo", "createdAt", "updatedAt"];

    // Get all possible keys first
    const allKeys = Object.keys(data[0]).filter(key =>
      !excludedKeys.includes(key) &&
      typeof data[0][key] !== 'object'
    );

    // Filter out columns that are completely empty in all rows
    const headers = allKeys.filter(key => {
      return data.some(item => {
        const value = item[key];
        return value !== null && value !== undefined && value !== "";
      });
    });

    const formatValue = (key: string, value: any) => {
      if (value === null || value === undefined || value === "") return "-";

      // If key contains date or value looks like a date string (ISO format etc)
      const isDateKey = key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key === 'createdAt' || key === 'updatedAt';

      if (isDateKey) {
        try {
          const dateObj = new Date(value);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }).replace(/\//g, '-'); // Formats to DD-MM-YYYY
          }
        } catch (e) {
          return value;
        }
      }
      return value;
    };

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
            th { background-color: #fdb714; color: white; }
            .subtitle { text-align: center; color: #666; margin-top: -10px; margin-bottom: 20px; font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${subTitle ? `<div class="subtitle">${subTitle}</div>` : ""}
          <table>
            <tr>
              ${headers.map((key) => `<th>${key.toUpperCase()}</th>`).join("")}
            </tr>
            ${data
        .map(
          (item) => `
                <tr>
                  ${headers.map((key) => `<td>${formatValue(key, item[key])}</td>`).join("")}
                </tr>`
        )
        .join("")}
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  };

  const printPDF = async (pdfUri: string) => {
    await Print.printAsync({ uri: pdfUri });
  };

  return (
    <TouchableOpacity
      onPress={async () => {
        try {
          const pdf = await generatePDF(filteredData, subtitle);
          await printPDF(pdf);
          router.back();
        } catch (error) {
          console.error("Error printing report:", error);
        }
      }}
      style={{ marginRight: 16 }}
    >
      <Ionicons name="print-outline" size={28} color="white" />
    </TouchableOpacity>
  );
}

