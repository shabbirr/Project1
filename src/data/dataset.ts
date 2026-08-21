import { SaleRecord, RegionName, ProductCategory, Quarter } from '../types';

export const REGIONS: RegionName[] = [
  'Europe',
  'North America',
  'Asia',
  'South America',
  'Middle East',
];

export const CATEGORIES: ProductCategory[] = [
  'Enterprise AI',
  'Cloud Infrastructure',
  'Hardware Enterprise',
  'Logistics Software',
  'Edge Devices',
];

export const COUNTRIES_BY_REGION: Record<RegionName, string[]> = {
  Europe: ['Germany', 'United Kingdom', 'France', 'Netherlands', 'Sweden'],
  'North America': ['United States', 'Canada', 'Mexico'],
  Asia: ['Japan', 'Singapore', 'South Korea', 'India', 'Australia'],
  'South America': ['Brazil', 'Chile', 'Argentina', 'Colombia'],
  'Middle East': ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Israel'],
};

export const PRODUCTS: { id: string; name: string; category: ProductCategory; basePrice: number }[] = [
  { id: 'PROD-101', name: 'Gemini Enterprise Suite', category: 'Enterprise AI', basePrice: 4200 },
  { id: 'PROD-102', name: 'Cognitive Engine Pro', category: 'Enterprise AI', basePrice: 3800 },
  { id: 'PROD-103', name: 'Autonomous Analytics Core', category: 'Enterprise AI', basePrice: 5100 },
  { id: 'PROD-201', name: 'Hyperscale Kubernetes Mesh', category: 'Cloud Infrastructure', basePrice: 6500 },
  { id: 'PROD-202', name: 'Zero-Trust Gateway 9000', category: 'Cloud Infrastructure', basePrice: 4900 },
  { id: 'PROD-203', name: 'Distributed Storage Fabric', category: 'Cloud Infrastructure', basePrice: 3200 },
  { id: 'PROD-301', name: 'Titan Edge Server Gen4', category: 'Hardware Enterprise', basePrice: 12500 },
  { id: 'PROD-302', name: 'Rackmount Accelerator Blade', category: 'Hardware Enterprise', basePrice: 15400 },
  { id: 'PROD-401', name: 'SupplyChain Dynamic Router', category: 'Logistics Software', basePrice: 2800 },
  { id: 'PROD-402', name: 'Freight Optimizer AI', category: 'Logistics Software', basePrice: 3400 },
  { id: 'PROD-501', name: 'Smart IoT Gateway Pro', category: 'Edge Devices', basePrice: 1600 },
  { id: 'PROD-502', name: 'Industrial Sensor Matrix', category: 'Edge Devices', basePrice: 2200 },
];

export const CUSTOMERS = [
  { id: 'CUST-01', name: 'Siemens Industrial AG', country: 'Germany', region: 'Europe' as RegionName },
  { id: 'CUST-02', name: 'Airbus Aerospace', country: 'France', region: 'Europe' as RegionName },
  { id: 'CUST-03', name: 'Barclays Global Corp', country: 'United Kingdom', region: 'Europe' as RegionName },
  { id: 'CUST-04', name: 'ASML Systems', country: 'Netherlands', region: 'Europe' as RegionName },
  { id: 'CUST-05', name: 'Volvo Group Tech', country: 'Sweden', region: 'Europe' as RegionName },
  { id: 'CUST-06', name: 'Lockheed Tech Systems', country: 'United States', region: 'North America' as RegionName },
  { id: 'CUST-07', name: 'JPMorgan Chase & Co', country: 'United States', region: 'North America' as RegionName },
  { id: 'CUST-08', name: 'Royal Bank of Canada', country: 'Canada', region: 'North America' as RegionName },
  { id: 'CUST-09', name: 'Sony Interactive Corp', country: 'Japan', region: 'Asia' as RegionName },
  { id: 'CUST-10', name: 'Samsung Electronics', country: 'South Korea', region: 'Asia' as RegionName },
  { id: 'CUST-11', name: 'Singapore Airlines Tech', country: 'Singapore', region: 'Asia' as RegionName },
  { id: 'CUST-12', name: 'Tata Consultancy Group', country: 'India', region: 'Asia' as RegionName },
  { id: 'CUST-13', name: 'Embraer Aviation Labs', country: 'Brazil', region: 'South America' as RegionName },
  { id: 'CUST-14', name: 'Petrobras Energy Digital', country: 'Brazil', region: 'South America' as RegionName },
  { id: 'CUST-15', name: 'Dubai Future Holdings', country: 'United Arab Emirates', region: 'Middle East' as RegionName },
  { id: 'CUST-16', name: 'Aramco Innovation Tech', country: 'Saudi Arabia', region: 'Middle East' as RegionName },
];

// Deterministic seed generation with accurate European Q3 margin drop
function generateSalesDataset(): SaleRecord[] {
  const records: SaleRecord[] = [];
  let recordId = 1000;

  const quarters: { quarter: Quarter; year: number; startMonth: number }[] = [
    { quarter: 'Q1', year: 2026, startMonth: 1 },
    { quarter: 'Q2', year: 2026, startMonth: 4 },
    { quarter: 'Q3', year: 2026, startMonth: 7 },
    { quarter: 'Q4', year: 2026, startMonth: 10 },
  ];

  // Base patterns per region and quarter
  quarters.forEach(({ quarter, year, startMonth }) => {
    REGIONS.forEach((region) => {
      const customersInRegion = CUSTOMERS.filter((c) => c.region === region);
      const countries = COUNTRIES_BY_REGION[region];

      // Number of transactions per region/quarter
      const transactionCount = region === 'Europe' ? 45 : region === 'North America' ? 50 : 35;

      for (let i = 0; i < transactionCount; i++) {
        recordId++;
        const customer = customersInRegion[i % customersInRegion.length] || customersInRegion[0];
        const product = PRODUCTS[(i * 3 + recordId) % PRODUCTS.length];
        const country = countries[i % countries.length];

        const day = ((i * 7 + 3) % 28) + 1;
        const monthOffset = (i % 3);
        const month = startMonth + monthOffset;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const quantity = ((i * 2 + recordId) % 5) + 1;
        const revenue = product.basePrice * quantity;

        // Realistic Cost Modeling
        // Standard cost ratios: Material ~35-42%, Shipping ~10-14%, Labor ~18-22%
        let materialRatio = 0.38;
        let shippingRatio = 0.12;
        let laborRatio = 0.18;

        // Specific business anomaly calibration:
        // European Q2: Total Margin ~32% (Total Cost ratio ~68%) -> Revenue $100 -> Cost $68 -> Profit $32
        // European Q3: Total Margin ~25% (Total Cost ratio ~75%) -> Shipping increases +42%, Material increases +8%, Labor flat
        if (region === 'Europe') {
          if (quarter === 'Q1') {
            materialRatio = 0.36;
            shippingRatio = 0.11;
            laborRatio = 0.19; // Total Cost: 66% => Margin 34%
          } else if (quarter === 'Q2') {
            materialRatio = 0.37;
            shippingRatio = 0.12;
            laborRatio = 0.19; // Total Cost: 68% => Margin 32%
          } else if (quarter === 'Q3') {
            // THE EUROPEAN Q3 SHIFT:
            // Shipping +42% (from 0.12 to 0.1704)
            // Material +8% (from 0.37 to 0.3996)
            // Labor steady (0.18)
            // Total Cost = 0.1704 + 0.3996 + 0.18 = 0.75 (75% cost) => Exactly 25% margin!
            materialRatio = 0.40;
            shippingRatio = 0.17;
            laborRatio = 0.18;
          } else if (quarter === 'Q4') {
            materialRatio = 0.38;
            shippingRatio = 0.14;
            laborRatio = 0.18; // 70% cost => Margin 30%
          }
        } else if (region === 'North America') {
          materialRatio = 0.35;
          shippingRatio = 0.10;
          laborRatio = 0.17; // 62% cost => Margin ~38%
        } else if (region === 'Asia') {
          materialRatio = 0.39;
          shippingRatio = 0.11;
          laborRatio = 0.16; // 66% cost => Margin ~34%
        } else {
          materialRatio = 0.41;
          shippingRatio = 0.13;
          laborRatio = 0.17; // 71% cost => Margin ~29%
        }

        // Slight micro-variation per transaction for organic realism
        const variance = ((i % 5) - 2) * 0.008;
        const finalMaterialRatio = Math.max(0.2, materialRatio + variance);
        const finalShippingRatio = Math.max(0.05, shippingRatio + (variance / 2));
        const finalLaborRatio = Math.max(0.1, laborRatio + (variance / 3));

        const materialCost = Math.round(revenue * finalMaterialRatio);
        const shippingCost = Math.round(revenue * finalShippingRatio);
        const laborCost = Math.round(revenue * finalLaborRatio);
        const totalCost = materialCost + shippingCost + laborCost;
        const profit = revenue - totalCost;
        const marginPercent = Number(((profit / revenue) * 100).toFixed(1));

        records.push({
          id: `TRX-${recordId}`,
          date: dateStr,
          quarter,
          year,
          customerId: customer.id,
          customerName: customer.name,
          productId: product.id,
          productName: product.name,
          category: product.category,
          region,
          country,
          revenue,
          quantity,
          materialCost,
          shippingCost,
          laborCost,
          totalCost,
          profit,
          marginPercent,
        });
      }
    });
  });

  return records;
}

export const SALES_DATA: SaleRecord[] = generateSalesDataset();
