export interface PortfolioDataPoint {
    date: string;
    value: number;
}

export interface AssetAllocation {
    id: string;
    label: string;
    value: number;
    color: string;
}

export interface Holding {
    id: string;
    symbol: string;
    name: string;
    shares: number;
    price: number;
    change: number; // percentage change
    totalValue: number;
    assetClass: "Stock" | "Bond" | "ETF" | "Crypto" | "Cash";
}

export const mockPortfolioHistory: PortfolioDataPoint[] = [
    { date: "2024-01-01", value: 45000 },
    { date: "2024-02-01", value: 46200 },
    { date: "2024-03-01", value: 45800 },
    { date: "2024-04-01", value: 47500 },
    { date: "2024-05-01", value: 48900 },
    { date: "2024-06-01", value: 48500 },
    { date: "2024-07-01", value: 50100 },
    { date: "2024-08-01", value: 51200 },
    { date: "2024-09-01", value: 50800 },
    { date: "2024-10-01", value: 52500 },
    { date: "2024-11-01", value: 54000 },
    { date: "2024-12-01", value: 55600 },
];

export const mockAssetAllocation: AssetAllocation[] = [
    { id: "stocks", label: "Stocks", value: 35000, color: "hsl(var(--chart-1))" },
    { id: "bonds", label: "Bonds", value: 10000, color: "hsl(var(--chart-2))" },
    { id: "crypto", label: "Crypto", value: 5000, color: "hsl(var(--chart-3))" },
    { id: "cash", label: "Cash", value: 5600, color: "hsl(var(--chart-4))" },
];

export const mockHoldings: Holding[] = [
    {
        id: "1",
        symbol: "AAPL",
        name: "Apple Inc.",
        shares: 50,
        price: 185.50,
        change: 1.25,
        totalValue: 9275,
        assetClass: "Stock",
    },
    {
        id: "2",
        symbol: "VOO",
        name: "Vanguard S&P 500 ETF",
        shares: 45,
        price: 450.20,
        change: 0.85,
        totalValue: 20259,
        assetClass: "ETF",
    },
    {
        id: "3",
        symbol: "US T-Bond",
        name: "US Treasury Bond 2030",
        shares: 100,
        price: 98.50,
        change: -0.15,
        totalValue: 9850,
        assetClass: "Bond",
    },
    {
        id: "4",
        symbol: "BTC",
        name: "Bitcoin",
        shares: 0.12,
        price: 42500,
        change: 2.50,
        totalValue: 5100,
        assetClass: "Crypto",
    },
    {
        id: "5",
        symbol: "MSFT",
        name: "Microsoft Corp.",
        shares: 15,
        price: 390.10,
        change: 1.10,
        totalValue: 5851.5,
        assetClass: "Stock",
    },
    {
        id: "6",
        symbol: "USD",
        name: "US Dollar",
        shares: 5600,
        price: 1,
        change: 0,
        totalValue: 5600,
        assetClass: "Cash",
    },
];
