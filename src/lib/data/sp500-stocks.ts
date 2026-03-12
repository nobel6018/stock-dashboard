export interface StockDef {
  symbol: string;
  name: string;
  sector: string;
}

export const SP500_TOP_STOCKS: StockDef[] = [
  // Technology
  { symbol: "AAPL", name: "Apple", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA", sector: "Technology" },
  { symbol: "AVGO", name: "Broadcom", sector: "Technology" },
  { symbol: "ORCL", name: "Oracle", sector: "Technology" },
  { symbol: "CRM", name: "Salesforce", sector: "Technology" },
  { symbol: "AMD", name: "AMD", sector: "Technology" },
  { symbol: "ADBE", name: "Adobe", sector: "Technology" },
  { symbol: "INTC", name: "Intel", sector: "Technology" },
  { symbol: "CSCO", name: "Cisco", sector: "Technology" },
  { symbol: "IBM", name: "IBM", sector: "Technology" },
  { symbol: "QCOM", name: "Qualcomm", sector: "Technology" },
  { symbol: "TXN", name: "Texas Inst.", sector: "Technology" },
  { symbol: "PLTR", name: "Palantir", sector: "Technology" },
  { symbol: "NOW", name: "ServiceNow", sector: "Technology" },
  { symbol: "INTU", name: "Intuit", sector: "Technology" },
  { symbol: "MU", name: "Micron", sector: "Technology" },
  { symbol: "SNPS", name: "Synopsys", sector: "Technology" },

  // Communication Services
  { symbol: "GOOGL", name: "Alphabet", sector: "Communication" },
  { symbol: "META", name: "Meta", sector: "Communication" },
  { symbol: "NFLX", name: "Netflix", sector: "Communication" },
  { symbol: "DIS", name: "Disney", sector: "Communication" },
  { symbol: "TMUS", name: "T-Mobile", sector: "Communication" },
  { symbol: "VZ", name: "Verizon", sector: "Communication" },
  { symbol: "T", name: "AT&T", sector: "Communication" },

  // Consumer Cyclical
  { symbol: "AMZN", name: "Amazon", sector: "Consumer Cyclical" },
  { symbol: "TSLA", name: "Tesla", sector: "Consumer Cyclical" },
  { symbol: "HD", name: "Home Depot", sector: "Consumer Cyclical" },
  { symbol: "MCD", name: "McDonald's", sector: "Consumer Cyclical" },
  { symbol: "NKE", name: "Nike", sector: "Consumer Cyclical" },
  { symbol: "SBUX", name: "Starbucks", sector: "Consumer Cyclical" },
  { symbol: "LOW", name: "Lowe's", sector: "Consumer Cyclical" },
  { symbol: "BKNG", name: "Booking", sector: "Consumer Cyclical" },
  { symbol: "TJX", name: "TJX", sector: "Consumer Cyclical" },

  // Consumer Defensive
  { symbol: "WMT", name: "Walmart", sector: "Consumer Defensive" },
  { symbol: "PG", name: "Procter&G", sector: "Consumer Defensive" },
  { symbol: "COST", name: "Costco", sector: "Consumer Defensive" },
  { symbol: "KO", name: "Coca-Cola", sector: "Consumer Defensive" },
  { symbol: "PEP", name: "PepsiCo", sector: "Consumer Defensive" },
  { symbol: "PM", name: "Philip Morris", sector: "Consumer Defensive" },
  { symbol: "MO", name: "Altria", sector: "Consumer Defensive" },
  { symbol: "CL", name: "Colgate", sector: "Consumer Defensive" },

  // Healthcare
  { symbol: "LLY", name: "Eli Lilly", sector: "Healthcare" },
  { symbol: "UNH", name: "UnitedHealth", sector: "Healthcare" },
  { symbol: "JNJ", name: "J&J", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer", sector: "Healthcare" },
  { symbol: "TMO", name: "Thermo Fisher", sector: "Healthcare" },
  { symbol: "ABT", name: "Abbott", sector: "Healthcare" },
  { symbol: "AMGN", name: "Amgen", sector: "Healthcare" },

  // Financials
  { symbol: "BRK-B", name: "Berkshire", sector: "Financials" },
  { symbol: "JPM", name: "JPMorgan", sector: "Financials" },
  { symbol: "V", name: "Visa", sector: "Financials" },
  { symbol: "MA", name: "Mastercard", sector: "Financials" },
  { symbol: "BAC", name: "BofA", sector: "Financials" },
  { symbol: "WFC", name: "Wells Fargo", sector: "Financials" },
  { symbol: "GS", name: "Goldman", sector: "Financials" },
  { symbol: "MS", name: "Morgan Stan.", sector: "Financials" },
  { symbol: "AXP", name: "AmEx", sector: "Financials" },
  { symbol: "C", name: "Citigroup", sector: "Financials" },

  // Industrials
  { symbol: "GE", name: "GE Aero", sector: "Industrials" },
  { symbol: "CAT", name: "Caterpillar", sector: "Industrials" },
  { symbol: "RTX", name: "RTX", sector: "Industrials" },
  { symbol: "BA", name: "Boeing", sector: "Industrials" },
  { symbol: "HON", name: "Honeywell", sector: "Industrials" },
  { symbol: "DE", name: "Deere", sector: "Industrials" },
  { symbol: "UNP", name: "Union Pacific", sector: "Industrials" },
  { symbol: "LMT", name: "Lockheed", sector: "Industrials" },

  // Energy
  { symbol: "XOM", name: "Exxon", sector: "Energy" },
  { symbol: "CVX", name: "Chevron", sector: "Energy" },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy" },
  { symbol: "SLB", name: "Schlumberger", sector: "Energy" },
  { symbol: "EOG", name: "EOG", sector: "Energy" },

  // Utilities
  { symbol: "NEE", name: "NextEra", sector: "Utilities" },
  { symbol: "SO", name: "Southern Co", sector: "Utilities" },
  { symbol: "DUK", name: "Duke Energy", sector: "Utilities" },

  // Real Estate
  { symbol: "PLD", name: "Prologis", sector: "Real Estate" },
  { symbol: "AMT", name: "AmTower", sector: "Real Estate" },
  { symbol: "EQIX", name: "Equinix", sector: "Real Estate" },

  // Materials
  { symbol: "LIN", name: "Linde", sector: "Materials" },
  { symbol: "APD", name: "Air Products", sector: "Materials" },
  { symbol: "SHW", name: "Sherwin-W", sector: "Materials" },
];
