export interface CommodityPrice {
  id: string;
  commodity: string;
  mandiPrice: number;
  unit: string;
  market: string;
  updatedAt: string | any;
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

export interface CalculationResult {
  mandiPrice: number;
  transportCost: number;
  wastagePercent: number;
  profitMarginPercent: number;
  landedCost: number;
  effectiveCost: number;
  rrp: number; // Recommended Retail Price
  netProfitPerUnit: number;
  grossRevenuePerUnit: number;
}

export interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  market: string;
  timestamp: any;
}
