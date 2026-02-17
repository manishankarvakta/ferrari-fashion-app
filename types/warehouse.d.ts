interface WarehouseTypes {
  _id?: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  type: string;
  currentBalance?: number;
  totalCashIn?: number;
  totalCashOut?: number;
  status: string;
}

export type { WarehouseTypes };
