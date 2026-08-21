export type RegionName = 'Europe' | 'Asia' | 'North America' | 'South America' | 'Middle East';

export type ProductCategory = 
  | 'Cloud Infrastructure' 
  | 'Enterprise AI' 
  | 'Hardware Enterprise' 
  | 'Edge Devices' 
  | 'Logistics Software';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface SaleRecord {
  id: string;
  date: string;
  quarter: Quarter;
  year: number;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  region: RegionName;
  country: string;
  revenue: number;
  quantity: number;
  materialCost: number;
  shippingCost: number;
  laborCost: number;
  totalCost: number;
  profit: number;
  marginPercent: number;
}

export interface MetricSummary {
  revenue: number;
  previousRevenue: number;
  revenueChangePercent: number;
  
  cost: number;
  previousCost: number;
  costChangePercent: number;
  
  profit: number;
  previousProfit: number;
  profitChangePercent: number;
  
  marginPercent: number;
  previousMarginPercent: number;
  marginPointDelta: number; // e.g. -7%
  
  totalVolume: number;
  previousVolume: number;
  volumeChangePercent: number;
}

export interface PeriodComparison {
  metric: string;
  dimension: string;
  dimensionValue: string;
  period1: string;
  period2: string;
  value1: number;
  value2: number;
  absoluteChange: number;
  percentChange: number;
  unit: string;
}

export interface CostDriver {
  name: string;
  type: 'shipping' | 'material' | 'labor' | 'revenue';
  period1Value: number;
  period2Value: number;
  absoluteChange: number;
  percentChange: number;
  contributionToMarginDropPercent: number;
  description: string;
}

export interface ChartDataPoint {
  label: string;
  quarter?: string;
  revenue?: number;
  cost?: number;
  profit?: number;
  margin?: number;
  shippingCost?: number;
  materialCost?: number;
  laborCost?: number;
  [key: string]: string | number | undefined;
}

export interface SemanticQueryPayload {
  measures: string[];
  dimensions?: string[];
  timeDimensions?: {
    dimension: string;
    granularity?: string;
    dateRange?: string | [string, string];
  }[];
  filters?: {
    member: string;
    operator: 'equals' | 'contains' | 'in' | 'gt' | 'lt';
    values: string[];
  }[];
  generatedSql?: string;
}

export interface AgentResponse {
  id: string;
  timestamp: string;
  question: string;
  answer: string;
  keyTakeaway: string;
  metric: string;
  region?: string;
  currentPeriod?: string;
  previousPeriod?: string;
  currentValue?: number;
  previousValue?: number;
  change?: number;
  chart?: {
    type: 'line' | 'bar' | 'donut' | 'waterfall' | 'area';
    title: string;
    xAxisKey: string;
    series: { key: string; name: string; color: string; unit?: string }[];
    data: ChartDataPoint[];
  };
  drivers?: CostDriver[];
  semanticQuery: SemanticQueryPayload;
  sqlQuery: string;
  rawSampleData?: Partial<SaleRecord>[];
}

export type UserRole = 'ADMIN' | 'LEAD_ANALYST' | 'EXECUTIVE' | 'VIEWER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  mfaEnabled: boolean;
  mfaVerified: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface FilterState {
  quarter: string; // 'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: number;
  region: string; // 'ALL' | RegionName
  category: string; // 'ALL' | ProductCategory
  searchQuery: string;
}

export interface SecurityStatus {
  dataAtRestEncryption: 'AES-256';
  inTransitEncryption: 'TLS 1.3';
  keyRotationDaysRemaining: number;
  lastRotatedDate: string;
  activeKeyId: string;
  mfaEnforcement: boolean;
  complianceScore: number;
}
