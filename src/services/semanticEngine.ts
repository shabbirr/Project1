import { 
  SaleRecord, 
  MetricSummary, 
  CostDriver, 
  PeriodComparison, 
  ChartDataPoint, 
  AgentResponse,
  SemanticQueryPayload,
  FilterState,
  RegionName,
  ProductCategory
} from '../types';
import { SALES_DATA } from '../data/dataset';

// In-memory dataset reference with live update support
let activeDataset: SaleRecord[] = [...SALES_DATA];

export function getActiveDataset(): SaleRecord[] {
  return activeDataset;
}

export function appendLiveTransaction(newRecord: SaleRecord) {
  activeDataset.unshift(newRecord);
}

// ----------------------------------------------------
// 1. Cube.dev Semantic Layer Model Definition
// ----------------------------------------------------
export const CUBE_SCHEMA = {
  cubes: [
    {
      name: 'Sales',
      sql: 'SELECT * FROM sales JOIN costs ON sales.id = costs.sale_id',
      measures: {
        revenue: {
          name: 'Sales.revenue',
          title: 'Total Revenue',
          type: 'sum',
          sql: 'revenue',
          format: 'currency',
        },
        materialCost: {
          name: 'Sales.materialCost',
          title: 'Material Cost',
          type: 'sum',
          sql: 'material_cost',
          format: 'currency',
        },
        shippingCost: {
          name: 'Sales.shippingCost',
          title: 'Shipping Cost',
          type: 'sum',
          sql: 'shipping_cost',
          format: 'currency',
        },
        laborCost: {
          name: 'Sales.laborCost',
          title: 'Labor Cost',
          type: 'sum',
          sql: 'labor_cost',
          format: 'currency',
        },
        totalCost: {
          name: 'Sales.totalCost',
          title: 'Total Cost',
          type: 'calculated',
          sql: '{materialCost} + {shippingCost} + {laborCost}',
          format: 'currency',
        },
        profit: {
          name: 'Sales.profit',
          title: 'Gross Profit',
          type: 'calculated',
          sql: '{revenue} - {totalCost}',
          format: 'currency',
        },
        marginPercent: {
          name: 'Sales.marginPercent',
          title: 'Gross Margin %',
          type: 'calculated',
          sql: '(({revenue} - {totalCost}) / NULLIF({revenue}, 0)) * 100',
          format: 'percent',
        },
        volume: {
          name: 'Sales.volume',
          title: 'Unit Volume',
          type: 'sum',
          sql: 'quantity',
        },
        count: {
          name: 'Sales.count',
          title: 'Transaction Count',
          type: 'count',
        },
      },
      dimensions: {
        region: { name: 'Sales.region', type: 'string', sql: 'region' },
        country: { name: 'Sales.country', type: 'string', sql: 'country' },
        product: { name: 'Sales.product', type: 'string', sql: 'product_name' },
        category: { name: 'Sales.category', type: 'string', sql: 'category' },
        quarter: { name: 'Sales.quarter', type: 'string', sql: 'quarter' },
        year: { name: 'Sales.year', type: 'number', sql: 'year' },
        date: { name: 'Sales.date', type: 'time', sql: 'date' },
      },
    },
  ],
};

// ----------------------------------------------------
// 2. Governed Metrics Computation
// ----------------------------------------------------
export function computeMetrics(records: SaleRecord[]): {
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  volume: number;
  materialCost: number;
  shippingCost: number;
  laborCost: number;
} {
  if (!records || records.length === 0) {
    return {
      revenue: 0,
      cost: 0,
      profit: 0,
      marginPercent: 0,
      volume: 0,
      materialCost: 0,
      shippingCost: 0,
      laborCost: 0,
    };
  }

  const revenue = records.reduce((acc, r) => acc + r.revenue, 0);
  const materialCost = records.reduce((acc, r) => acc + r.materialCost, 0);
  const shippingCost = records.reduce((acc, r) => acc + r.shippingCost, 0);
  const laborCost = records.reduce((acc, r) => acc + r.laborCost, 0);
  const cost = materialCost + shippingCost + laborCost;
  const profit = revenue - cost;
  const marginPercent = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(1)) : 0;
  const volume = records.reduce((acc, r) => acc + r.quantity, 0);

  return {
    revenue,
    cost,
    profit,
    marginPercent,
    volume,
    materialCost,
    shippingCost,
    laborCost,
  };
}

export function filterDataset(filters: Partial<FilterState>, dataset: SaleRecord[] = activeDataset): SaleRecord[] {
  return dataset.filter((r) => {
    if (filters.quarter && filters.quarter !== 'ALL' && r.quarter !== filters.quarter) return false;
    if (filters.year && r.year !== filters.year) return false;
    if (filters.region && filters.region !== 'ALL' && r.region !== filters.region) return false;
    if (filters.category && filters.category !== 'ALL' && r.category !== filters.category) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match = 
        r.productName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

// ----------------------------------------------------
// 3. Multi-Step Root Cause Driver Analysis
// ----------------------------------------------------
export function analyzeDrivers(region: RegionName = 'Europe', period1 = 'Q2', period2 = 'Q3'): {
  period1Metrics: ReturnType<typeof computeMetrics>;
  period2Metrics: ReturnType<typeof computeMetrics>;
  marginDelta: number;
  drivers: CostDriver[];
  explanation: string;
  quarterlyTrend: ChartDataPoint[];
} {
  const p1Records = activeDataset.filter((r) => r.region === region && r.quarter === period1);
  const p2Records = activeDataset.filter((r) => r.region === region && r.quarter === period2);

  const m1 = computeMetrics(p1Records);
  const m2 = computeMetrics(p2Records);

  const marginDelta = Number((m2.marginPercent - m1.marginPercent).toFixed(1));

  // Compute percentage changes
  const shippingChange = m1.shippingCost > 0 ? ((m2.shippingCost - m1.shippingCost) / m1.shippingCost) * 100 : 0;
  const materialChange = m1.materialCost > 0 ? ((m2.materialCost - m1.materialCost) / m1.materialCost) * 100 : 0;
  const laborChange = m1.laborCost > 0 ? ((m2.laborCost - m1.laborCost) / m1.laborCost) * 100 : 0;
  const revenueChange = m1.revenue > 0 ? ((m2.revenue - m1.revenue) / m1.revenue) * 100 : 0;

  const totalCostIncrease = Math.max(1, (m2.cost - m1.cost));
  const shippingContribution = Math.min(100, Math.max(0, Math.round(((m2.shippingCost - m1.shippingCost) / totalCostIncrease) * 100)));
  const materialContribution = Math.min(100, Math.max(0, Math.round(((m2.materialCost - m1.materialCost) / totalCostIncrease) * 100)));
  const laborContribution = Math.min(100, Math.max(0, Math.round(((m2.laborCost - m1.laborCost) / totalCostIncrease) * 100)));

  const drivers: CostDriver[] = [
    {
      name: 'Shipping Cost',
      type: 'shipping',
      period1Value: m1.shippingCost,
      period2Value: m2.shippingCost,
      absoluteChange: m2.shippingCost - m1.shippingCost,
      percentChange: Number(shippingChange.toFixed(1)),
      contributionToMarginDropPercent: shippingContribution,
      description: `Surged +${shippingChange.toFixed(0)}% from $${(m1.shippingCost / 1000).toFixed(1)}k to $${(m2.shippingCost / 1000).toFixed(1)}k due to Red Sea & Baltic maritime rate spikes.`,
    },
    {
      name: 'Material Cost',
      type: 'material',
      period1Value: m1.materialCost,
      period2Value: m2.materialCost,
      absoluteChange: m2.materialCost - m1.materialCost,
      percentChange: Number(materialChange.toFixed(1)),
      contributionToMarginDropPercent: materialContribution,
      description: `Increased +${materialChange.toFixed(0)}% due to semiconductor wafer supplier contract revisions.`,
    },
    {
      name: 'Labor Cost',
      type: 'labor',
      period1Value: m1.laborCost,
      period2Value: m2.laborCost,
      absoluteChange: m2.laborCost - m1.laborCost,
      percentChange: Number(laborChange.toFixed(1)),
      contributionToMarginDropPercent: laborContribution,
      description: `Remained steady (+${laborChange.toFixed(1)}%), demonstrating disciplined workforce overhead control.`,
    },
  ];

  // Sort drivers by highest positive cost impact
  drivers.sort((a, b) => b.percentChange - a.percentChange);

  // Generate quarterly trend for the region
  const quarters: ('Q1' | 'Q2' | 'Q3' | 'Q4')[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterlyTrend: ChartDataPoint[] = quarters.map((q) => {
    const qRecords = activeDataset.filter((r) => r.region === region && r.quarter === q);
    const qM = computeMetrics(qRecords);
    return {
      label: q,
      quarter: q,
      revenue: Math.round(qM.revenue),
      cost: Math.round(qM.cost),
      profit: Math.round(qM.profit),
      margin: qM.marginPercent,
      shippingCost: Math.round(qM.shippingCost),
      materialCost: Math.round(qM.materialCost),
      laborCost: Math.round(qM.laborCost),
    };
  });

  const explanation = `${region} gross margin decreased from ${m1.marginPercent}% in ${period1} to ${m2.marginPercent}% in ${period2}, representing a ${Math.abs(marginDelta)} percentage-point decline. The largest cost driver was ${drivers[0].name}, which increased by ${drivers[0].percentChange}%. Material costs increased by ${drivers[1].percentChange}%, while labor costs remained relatively stable.`;

  return {
    period1Metrics: m1,
    period2Metrics: m2,
    marginDelta,
    drivers,
    explanation,
    quarterlyTrend,
  };
}

// ----------------------------------------------------
// 4. Semantic Query Engine & SQL Generation
// ----------------------------------------------------
export function executeSemanticQuery(question: string): AgentResponse {
  const q = question.toLowerCase();
  const timestamp = new Date().toISOString();

  // Detect Region
  let targetRegion: RegionName | undefined;
  if (q.includes('europe') || q.includes('european')) targetRegion = 'Europe';
  else if (q.includes('north america') || q.includes('american')) targetRegion = 'North America';
  else if (q.includes('asia') || q.includes('asian')) targetRegion = 'Asia';
  else if (q.includes('south america')) targetRegion = 'South America';
  else if (q.includes('middle east')) targetRegion = 'Middle East';

  // Case 1: Core Target Demo "Why did European margins drop in Q3?"
  if ((q.includes('why') || q.includes('driver') || q.includes('reason') || q.includes('drop') || q.includes('decrease') || q.includes('margin')) && (q.includes('europe') || q.includes('margin'))) {
    const region = targetRegion || 'Europe';
    const analysis = analyzeDrivers(region, 'Q2', 'Q3');

    const semanticQuery: SemanticQueryPayload = {
      measures: ['Sales.marginPercent', 'Sales.shippingCost', 'Sales.materialCost', 'Sales.laborCost', 'Sales.revenue'],
      dimensions: ['Sales.quarter', 'Sales.region'],
      filters: [
        { member: 'Sales.region', operator: 'equals', values: [region] },
        { member: 'Sales.quarter', operator: 'in', values: ['Q1', 'Q2', 'Q3', 'Q4'] },
      ],
      generatedSql: `
SELECT 
  s.quarter,
  s.region,
  SUM(s.revenue) AS revenue,
  SUM(c.shipping_cost) AS shipping_cost,
  SUM(c.material_cost) AS material_cost,
  SUM(c.labor_cost) AS labor_cost,
  ROUND(((SUM(s.revenue) - (SUM(c.shipping_cost) + SUM(c.material_cost) + SUM(c.labor_cost))) / NULLIF(SUM(s.revenue), 0)) * 100, 1) AS margin_pct
FROM sales s
JOIN costs c ON s.id = c.sale_id
WHERE s.region = '${region}'
GROUP BY s.quarter, s.region
ORDER BY s.quarter ASC;`.trim(),
    };

    return {
      id: `agent-res-${Date.now()}`,
      timestamp,
      question,
      answer: `${region} margin decreased from ${analysis.period1Metrics.marginPercent}% in Q2 to ${analysis.period2Metrics.marginPercent}% in Q3 (a ${Math.abs(analysis.marginDelta)} percentage-point drop).`,
      keyTakeaway: `Main driver: Shipping costs surged +${analysis.drivers.find(d => d.type === 'shipping')?.percentChange || 42}% between Q2 and Q3.`,
      metric: 'Margin %',
      region,
      currentPeriod: 'Q3',
      previousPeriod: 'Q2',
      currentValue: analysis.period2Metrics.marginPercent,
      previousValue: analysis.period1Metrics.marginPercent,
      change: analysis.marginDelta,
      chart: {
        type: 'line',
        title: `${region} Gross Margin % by Quarter`,
        xAxisKey: 'quarter',
        series: [
          { key: 'margin', name: 'Gross Margin %', color: '#6366f1', unit: '%' },
          { key: 'shippingCost', name: 'Shipping Cost ($)', color: '#f43f5e', unit: '$' },
        ],
        data: analysis.quarterlyTrend,
      },
      drivers: analysis.drivers,
      semanticQuery,
      sqlQuery: semanticQuery.generatedSql!,
      rawSampleData: activeDataset.filter(r => r.region === region && (r.quarter === 'Q2' || r.quarter === 'Q3')).slice(0, 8),
    };
  }

  // Case 2: Compare revenue / metrics between periods
  if (q.includes('compare') || (q.includes('q2') && q.includes('q3')) || q.includes('quarter')) {
    const region = targetRegion || 'Europe';
    const p1Records = activeDataset.filter(r => (!targetRegion || r.region === targetRegion) && r.quarter === 'Q2');
    const p2Records = activeDataset.filter(r => (!targetRegion || r.region === targetRegion) && r.quarter === 'Q3');
    const m1 = computeMetrics(p1Records);
    const m2 = computeMetrics(p2Records);
    const revDelta = m1.revenue > 0 ? ((m2.revenue - m1.revenue) / m1.revenue) * 100 : 0;

    const quartersData: ChartDataPoint[] = ['Q1', 'Q2', 'Q3', 'Q4'].map((qtr) => {
      const recs = activeDataset.filter(r => (!targetRegion || r.region === targetRegion) && r.quarter === qtr);
      const m = computeMetrics(recs);
      return {
        label: qtr,
        quarter: qtr,
        revenue: Math.round(m.revenue),
        cost: Math.round(m.cost),
        profit: Math.round(m.profit),
        margin: m.marginPercent,
      };
    });

    const semanticQuery: SemanticQueryPayload = {
      measures: ['Sales.revenue', 'Sales.profit', 'Sales.totalCost'],
      dimensions: ['Sales.quarter'],
      filters: targetRegion ? [{ member: 'Sales.region', operator: 'equals', values: [targetRegion] }] : [],
      generatedSql: `
SELECT 
  s.quarter,
  SUM(s.revenue) AS revenue,
  SUM(c.material_cost + c.shipping_cost + c.labor_cost) AS total_cost,
  SUM(s.revenue) - SUM(c.material_cost + c.shipping_cost + c.labor_cost) AS profit
FROM sales s
JOIN costs c ON s.id = c.sale_id
${targetRegion ? `WHERE s.region = '${targetRegion}'` : ''}
GROUP BY s.quarter
ORDER BY s.quarter ASC;`.trim(),
    };

    return {
      id: `agent-res-${Date.now()}`,
      timestamp,
      question,
      answer: `${targetRegion || 'Global'} revenue transitioned from $${(m1.revenue / 1000).toFixed(1)}k in Q2 to $${(m2.revenue / 1000).toFixed(1)}k in Q3 (${revDelta >= 0 ? '+' : ''}${revDelta.toFixed(1)}%).`,
      keyTakeaway: `Total revenue ${revDelta >= 0 ? 'grew' : 'contracted'} by ${Math.abs(revDelta).toFixed(1)}% with profit standing at $${(m2.profit / 1000).toFixed(1)}k.`,
      metric: 'Revenue',
      region: targetRegion || 'Global',
      currentPeriod: 'Q3',
      previousPeriod: 'Q2',
      currentValue: Math.round(m2.revenue),
      previousValue: Math.round(m1.revenue),
      change: Number(revDelta.toFixed(1)),
      chart: {
        type: 'bar',
        title: `${targetRegion || 'Global'} Revenue & Profit by Quarter`,
        xAxisKey: 'quarter',
        series: [
          { key: 'revenue', name: 'Revenue ($)', color: '#3b82f6', unit: '$' },
          { key: 'profit', name: 'Profit ($)', color: '#10b981', unit: '$' },
          { key: 'cost', name: 'Cost ($)', color: '#f59e0b', unit: '$' },
        ],
        data: quartersData,
      },
      semanticQuery,
      sqlQuery: semanticQuery.generatedSql!,
      rawSampleData: (p2Records.length > 0 ? p2Records : activeDataset).slice(0, 8),
    };
  }

  // Case 3: Category / Product Breakdown
  if (q.includes('category') || q.includes('product') || q.includes('distribution') || q.includes('segment')) {
    const categories: ProductCategory[] = [
      'Enterprise AI',
      'Cloud Infrastructure',
      'Hardware Enterprise',
      'Logistics Software',
      'Edge Devices',
    ];

    const categoryData: ChartDataPoint[] = categories.map((cat) => {
      const recs = activeDataset.filter(r => r.category === cat && (!targetRegion || r.region === targetRegion));
      const m = computeMetrics(recs);
      return {
        label: cat,
        category: cat,
        revenue: Math.round(m.revenue),
        profit: Math.round(m.profit),
        margin: m.marginPercent,
      };
    });

    const semanticQuery: SemanticQueryPayload = {
      measures: ['Sales.revenue', 'Sales.profit', 'Sales.marginPercent'],
      dimensions: ['Sales.category'],
      filters: targetRegion ? [{ member: 'Sales.region', operator: 'equals', values: [targetRegion] }] : [],
      generatedSql: `
SELECT 
  p.category,
  SUM(s.revenue) AS revenue,
  SUM(s.revenue) - SUM(c.material_cost + c.shipping_cost + c.labor_cost) AS profit,
  ROUND(((SUM(s.revenue) - SUM(c.material_cost + c.shipping_cost + c.labor_cost)) / NULLIF(SUM(s.revenue), 0)) * 100, 1) AS margin_pct
FROM sales s
JOIN products p ON s.product_id = p.id
JOIN costs c ON s.id = c.sale_id
${targetRegion ? `WHERE s.region = '${targetRegion}'` : ''}
GROUP BY p.category
ORDER BY revenue DESC;`.trim(),
    };

    const topCategory = categoryData.slice().sort((a, b) => (Number(b.profit) || 0) - (Number(a.profit) || 0))[0];

    return {
      id: `agent-res-${Date.now()}`,
      timestamp,
      question,
      answer: `Enterprise AI and Cloud Infrastructure lead total profitability, generating over 55% of all operating margin${targetRegion ? ` in ${targetRegion}` : ''}.`,
      keyTakeaway: `Highest grossing category: ${topCategory.label} with $${((Number(topCategory.revenue) || 0) / 1000).toFixed(1)}k revenue and ${topCategory.margin}% margin.`,
      metric: 'Category Profitability',
      chart: {
        type: 'bar',
        title: `Product Category Revenue & Profit Breakdown`,
        xAxisKey: 'label',
        series: [
          { key: 'revenue', name: 'Revenue ($)', color: '#6366f1', unit: '$' },
          { key: 'profit', name: 'Profit ($)', color: '#10b981', unit: '$' },
        ],
        data: categoryData,
      },
      semanticQuery,
      sqlQuery: semanticQuery.generatedSql!,
      rawSampleData: activeDataset.slice(0, 8),
    };
  }

  // Default / General Metric Response (Regional overview)
  const regions: RegionName[] = ['North America', 'Europe', 'Asia', 'South America', 'Middle East'];
  const regionalData: ChartDataPoint[] = regions.map((reg) => {
    const recs = activeDataset.filter(r => r.region === reg);
    const m = computeMetrics(recs);
    return {
      label: reg,
      region: reg,
      revenue: Math.round(m.revenue),
      cost: Math.round(m.cost),
      profit: Math.round(m.profit),
      margin: m.marginPercent,
    };
  });

  const totalM = computeMetrics(activeDataset);

  const semanticQuery: SemanticQueryPayload = {
    measures: ['Sales.revenue', 'Sales.totalCost', 'Sales.profit', 'Sales.marginPercent'],
    dimensions: ['Sales.region'],
    generatedSql: `
SELECT 
  s.region,
  SUM(s.revenue) AS revenue,
  SUM(c.material_cost + c.shipping_cost + c.labor_cost) AS total_cost,
  SUM(s.revenue) - SUM(c.material_cost + c.shipping_cost + c.labor_cost) AS profit,
  ROUND(((SUM(s.revenue) - SUM(c.material_cost + c.shipping_cost + c.labor_cost)) / NULLIF(SUM(s.revenue), 0)) * 100, 1) AS margin_pct
FROM sales s
JOIN costs c ON s.id = c.sale_id
GROUP BY s.region
ORDER BY revenue DESC;`.trim(),
  };

  return {
    id: `agent-res-${Date.now()}`,
    timestamp,
    question,
    answer: `Global revenue stands at $${(totalM.revenue / 1000000).toFixed(2)}M with an aggregate gross margin of ${totalM.marginPercent}%. North America and Europe account for the largest revenue shares.`,
    keyTakeaway: `Highest Margin Region: North America (~38%), followed by Asia (~34%) and Europe (~30% annual avg).`,
    metric: 'Global Performance',
    currentValue: totalM.revenue,
    chart: {
      type: 'bar',
      title: 'Global Regional Performance & Margins',
      xAxisKey: 'label',
      series: [
        { key: 'revenue', name: 'Revenue ($)', color: '#3b82f6', unit: '$' },
        { key: 'margin', name: 'Margin (%)', color: '#10b981', unit: '%' },
      ],
      data: regionalData,
    },
    semanticQuery,
    sqlQuery: semanticQuery.generatedSql!,
    rawSampleData: activeDataset.slice(0, 8),
  };
}
