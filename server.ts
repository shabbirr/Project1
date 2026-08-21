import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { 
  getActiveDataset, 
  filterDataset, 
  computeMetrics, 
  analyzeDrivers, 
  executeSemanticQuery,
  appendLiveTransaction,
  CUBE_SCHEMA 
} from './src/services/semanticEngine.ts';
import { AuditLog, SecurityStatus, SaleRecord, RegionName, ProductCategory, Quarter } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory audit logs store
const auditLogs: AuditLog[] = [
  {
    id: 'LOG-1001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    user: 'admin@metricmind.corp',
    role: 'ADMIN',
    action: 'SECURITY_AUDIT',
    resource: 'KMS_KEY_RING',
    details: 'Verified AES-256 GCM encryption volume checksums and TLS 1.3 cipher suites',
    ipAddress: '10.240.12.84',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-1002',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    user: 'lead.analyst@metricmind.corp',
    role: 'LEAD_ANALYST',
    action: 'SEMANTIC_QUERY',
    resource: 'Cube.dev / European Margin Engine',
    details: 'Executed root cause driver analysis on Q3 European shipping rate divergence',
    ipAddress: '192.168.4.120',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-1003',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    user: 'executive@metricmind.corp',
    role: 'EXECUTIVE',
    action: 'REPORT_EXPORT',
    resource: 'PDF Analytics Pipeline',
    details: 'Exported Executive Summary & Q3 Regional Profitability PDF report',
    ipAddress: '172.16.88.14',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-1004',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    user: 'system@metricmind.corp',
    role: 'ADMIN',
    action: 'KEY_ROTATION_CHECK',
    resource: 'Vault / HSM Key Cluster',
    details: 'Automated 90-day cryptographic key rotation check completed. 76 days remaining.',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
  },
];

// In-memory security state
let securityState: SecurityStatus = {
  dataAtRestEncryption: 'AES-256',
  inTransitEncryption: 'TLS 1.3',
  keyRotationDaysRemaining: 76,
  lastRotatedDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
  activeKeyId: 'KMS-AES256-EU-GCM-8842',
  mfaEnforcement: true,
  complianceScore: 98.4,
};

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'production-ready',
    engine: 'MetricMind Governed Semantic Engine v2.4',
    db: 'PostgreSQL Governed Layer',
  });
});

// Overview Metrics with Filter support
app.get('/api/metrics/overview', (req, res) => {
  try {
    const { quarter, year, region, category, searchQuery } = req.query;
    const filters = {
      quarter: quarter ? String(quarter) : 'ALL',
      year: year ? Number(year) : 2026,
      region: region ? String(region) : 'ALL',
      category: category ? String(category) : 'ALL',
      searchQuery: searchQuery ? String(searchQuery) : '',
    };

    const currentRecords = filterDataset(filters);
    const metrics = computeMetrics(currentRecords);

    // Compute previous period baseline (e.g. Q2 if Q3 selected, or prior year/general comparison)
    let prevFilters = { ...filters };
    if (filters.quarter === 'Q3') prevFilters.quarter = 'Q2';
    else if (filters.quarter === 'Q2') prevFilters.quarter = 'Q1';
    else if (filters.quarter === 'Q4') prevFilters.quarter = 'Q3';
    else if (filters.quarter === 'Q1') prevFilters.quarter = 'Q4';

    const prevRecords = filterDataset(prevFilters);
    const prevMetrics = computeMetrics(prevRecords);

    const revenueDelta = prevMetrics.revenue > 0 
      ? Number((((metrics.revenue - prevMetrics.revenue) / prevMetrics.revenue) * 100).toFixed(1))
      : 0;

    const costDelta = prevMetrics.cost > 0 
      ? Number((((metrics.cost - prevMetrics.cost) / prevMetrics.cost) * 100).toFixed(1))
      : 0;

    const profitDelta = prevMetrics.profit > 0 
      ? Number((((metrics.profit - prevMetrics.profit) / prevMetrics.profit) * 100).toFixed(1))
      : 0;

    const marginPointDelta = Number((metrics.marginPercent - prevMetrics.marginPercent).toFixed(1));

    const volumeDelta = prevMetrics.volume > 0 
      ? Number((((metrics.volume - prevMetrics.volume) / prevMetrics.volume) * 100).toFixed(1))
      : 0;

    res.json({
      summary: {
        revenue: Math.round(metrics.revenue),
        previousRevenue: Math.round(prevMetrics.revenue),
        revenueChangePercent: revenueDelta,

        cost: Math.round(metrics.cost),
        previousCost: Math.round(prevMetrics.cost),
        costChangePercent: costDelta,

        profit: Math.round(metrics.profit),
        previousProfit: Math.round(prevMetrics.profit),
        profitChangePercent: profitDelta,

        marginPercent: metrics.marginPercent,
        previousMarginPercent: prevMetrics.marginPercent,
        marginPointDelta,

        totalVolume: metrics.volume,
        previousVolume: prevMetrics.volume,
        volumeChangePercent: volumeDelta,
      },
      counts: {
        totalTransactions: currentRecords.length,
        activeFilters: filters,
      },
      schema: CUBE_SCHEMA,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Timeseries & breakdown data for dynamic charts
app.get('/api/metrics/timeseries', (req, res) => {
  try {
    const { region, category } = req.query;
    const filterRegion = region && region !== 'ALL' ? String(region) : undefined;
    const filterCategory = category && category !== 'ALL' ? String(category) : undefined;

    const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
    const timeseries = quarters.map((q) => {
      const records = filterDataset({
        quarter: q,
        region: filterRegion || 'ALL',
        category: filterCategory || 'ALL',
      });
      const m = computeMetrics(records);
      return {
        quarter: q,
        label: `${q} 2026`,
        revenue: Math.round(m.revenue),
        cost: Math.round(m.cost),
        profit: Math.round(m.profit),
        margin: m.marginPercent,
        shippingCost: Math.round(m.shippingCost),
        materialCost: Math.round(m.materialCost),
        laborCost: Math.round(m.laborCost),
      };
    });

    // Regional breakdown
    const regions: RegionName[] = ['North America', 'Europe', 'Asia', 'South America', 'Middle East'];
    const regionalBreakdown = regions.map((r) => {
      const records = filterDataset({
        region: r,
        category: filterCategory || 'ALL',
      });
      const m = computeMetrics(records);
      return {
        region: r,
        revenue: Math.round(m.revenue),
        cost: Math.round(m.cost),
        profit: Math.round(m.profit),
        margin: m.marginPercent,
      };
    });

    // Category breakdown
    const categories: ProductCategory[] = [
      'Enterprise AI',
      'Cloud Infrastructure',
      'Hardware Enterprise',
      'Logistics Software',
      'Edge Devices',
    ];
    const categoryBreakdown = categories.map((c) => {
      const records = filterDataset({
        category: c,
        region: filterRegion || 'ALL',
      });
      const m = computeMetrics(records);
      return {
        category: c,
        revenue: Math.round(m.revenue),
        cost: Math.round(m.cost),
        profit: Math.round(m.profit),
        margin: m.marginPercent,
      };
    });

    res.json({
      timeseries,
      regionalBreakdown,
      categoryBreakdown,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Root cause driver analysis endpoint
app.get('/api/metrics/drivers', (req, res) => {
  try {
    const region = (req.query.region as RegionName) || 'Europe';
    const period1 = (req.query.period1 as string) || 'Q2';
    const period2 = (req.query.period2 as string) || 'Q3';

    const result = analyzeDrivers(region, period1, period2);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Conversational BI AI Agent with Gemini + Governed Semantic Layer
app.post('/api/agent/query', async (req, res) => {
  const { question, userRole, userName } = req.body;

  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  // Audit log the query
  auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: userName || 'lead.analyst@metricmind.corp',
    role: userRole || 'LEAD_ANALYST',
    action: 'SEMANTIC_AGENT_QUERY',
    resource: 'MetricMind AI Agent',
    details: `User queried: "${question.slice(0, 100)}"`,
    ipAddress: '10.240.14.92',
    status: 'SUCCESS',
  });

  // First generate the governed semantic query & deterministic calculations
  const semanticResult = executeSemanticQuery(question);

  // If Gemini API Key exists, enhance explanation using GoogleGenAI with model gemini-3.7-flash
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are MetricMind, an elite AI Conversational BI reasoning engine connected to a governed Cube.dev semantic layer and PostgreSQL data warehouse.
The user asked: "${question}"

Here is the exact governed data and root-cause analysis computed from the database:
- Metric: ${semanticResult.metric}
- Region: ${semanticResult.region || 'Global'}
- Current Period: ${semanticResult.currentPeriod || 'N/A'} (Value: ${semanticResult.currentValue})
- Previous Period: ${semanticResult.previousPeriod || 'N/A'} (Value: ${semanticResult.previousValue})
- Delta Change: ${semanticResult.change}%
- Drivers Found: ${JSON.stringify(semanticResult.drivers || [])}
- Semantic Measures: ${JSON.stringify(semanticResult.semanticQuery.measures)}
- Calculated Answer: ${semanticResult.answer}
- Calculated Key Takeaway: ${semanticResult.keyTakeaway}

TASK:
Provide a concise, professional executive BI response:
1. State the direct metric finding clearly in 2-3 sentences.
2. If drivers are present (e.g. shipping cost spikes +42%, material costs +8%), explain the operational root cause clearly and highlight actionable mitigation.
3. Keep it factual and strictly aligned with the numbers above.

Respond with JSON:
{
  "answer": "...",
  "keyTakeaway": "..."
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = aiResponse.text?.trim();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.answer) semanticResult.answer = parsed.answer;
          if (parsed.keyTakeaway) semanticResult.keyTakeaway = parsed.keyTakeaway;
        } catch {
          // Keep deterministic calculated answer
        }
      }
    } catch (err: any) {
      console.warn('Gemini API call skipped/failed, using deterministic semantic engine:', err?.message);
    }
  }

  res.json(semanticResult);
});

// Audit logs endpoints
app.get('/api/audit-logs', (req, res) => {
  res.json({ logs: auditLogs });
});

app.post('/api/audit-logs', (req, res) => {
  const { action, resource, details, user, role, status } = req.body;
  const newLog: AuditLog = {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user || 'admin@metricmind.corp',
    role: role || 'ADMIN',
    action: action || 'ADMIN_ACTION',
    resource: resource || 'SYSTEM',
    details: details || 'Administrative event logged',
    ipAddress: '10.240.18.22',
    status: status || 'SUCCESS',
  };
  auditLogs.unshift(newLog);
  res.json({ success: true, log: newLog });
});

// Security & Compliance status endpoints
app.get('/api/security/status', (req, res) => {
  res.json(securityState);
});

app.post('/api/security/rotate-keys', (req, res) => {
  const { user, role } = req.body;
  const newKeyId = `KMS-AES256-EU-GCM-${Math.floor(1000 + Math.random() * 9000)}`;
  securityState = {
    ...securityState,
    keyRotationDaysRemaining: 90,
    lastRotatedDate: new Date().toISOString().split('T')[0],
    activeKeyId: newKeyId,
  };

  auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user || 'admin@metricmind.corp',
    role: role || 'ADMIN',
    action: 'CRYPTO_KEY_ROTATED',
    resource: 'KMS Vault / HSM Cluster',
    details: `Rotated active AES-256 master data key to ${newKeyId}. Reset 90-day compliance cycle.`,
    ipAddress: '10.240.12.84',
    status: 'SUCCESS',
  });

  res.json({ success: true, securityState });
});

// Real-time live data injection endpoint (Simulates incoming stream)
app.post('/api/live/stream-record', (req, res) => {
  const regions: RegionName[] = ['North America', 'Europe', 'Asia', 'South America', 'Middle East'];
  const categories: ProductCategory[] = ['Enterprise AI', 'Cloud Infrastructure', 'Hardware Enterprise', 'Logistics Software', 'Edge Devices'];
  const countries = ['Germany', 'United States', 'Japan', 'United Kingdom', 'Singapore'];

  const randRegion = regions[Math.floor(Math.random() * regions.length)];
  const randCat = categories[Math.floor(Math.random() * categories.length)];
  const randCountry = countries[Math.floor(Math.random() * countries.length)];
  const rev = Math.round(3000 + Math.random() * 9000);
  const qty = Math.floor(1 + Math.random() * 4);

  const matCost = Math.round(rev * (0.35 + Math.random() * 0.05));
  const shipCost = Math.round(rev * (randRegion === 'Europe' ? 0.16 : 0.11));
  const labCost = Math.round(rev * 0.18);
  const totCost = matCost + shipCost + labCost;
  const profit = rev - totCost;
  const marginPercent = Number(((profit / rev) * 100).toFixed(1));

  const newRecord: SaleRecord = {
    id: `TRX-LIVE-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    quarter: 'Q3',
    year: 2026,
    customerId: 'CUST-LIVE',
    customerName: 'Realtime Enterprise Client',
    productId: 'PROD-LIVE',
    productName: `${randCat} Live Node`,
    category: randCat,
    region: randRegion,
    country: randCountry,
    revenue: rev,
    quantity: qty,
    materialCost: matCost,
    shippingCost: shipCost,
    laborCost: labCost,
    totalCost: totCost,
    profit,
    marginPercent,
  };

  appendLiveTransaction(newRecord);

  res.json({ success: true, record: newRecord });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MetricMind Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
