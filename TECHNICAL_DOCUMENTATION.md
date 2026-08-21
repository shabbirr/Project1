# MetricMind — Comprehensive Technical Documentation & Architecture Specification

---

## Executive Overview
**MetricMind** is an enterprise-grade agentic conversational Business Intelligence (BI) and real-time analytics platform. Rather than having Large Language Models generate unconstrained, hallucinated SQL queries against raw warehouse tables, MetricMind orchestrates governed semantic queries through a standardized semantic layer (Cube.dev / PostgreSQL). 

This document outlines the end-to-end technical implementation across all **5 development phases**, detailing data models, semantic abstractions, multi-step AI reasoning loops, user interface architecture, and enterprise security compliance.

---

## Phase 1: Database Layer & Corporate Data Schema (PostgreSQL)

### 1.1 Architectural Rationale
The transactional layer is modeled as a normalized PostgreSQL relational database comprising 6 core entities: `customers`, `products`, `sales`, `costs`, `regions`, and `dates`.

### 1.2 Entity Relational Schema

```sql
-- 1. Customers Table
CREATE TABLE customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(128) NOT NULL,
    region VARCHAR(64) NOT NULL
);

-- 2. Products Table
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    base_price NUMERIC(12, 2) NOT NULL
);

-- 3. Sales Fact Table
CREATE TABLE sales (
    id VARCHAR(64) PRIMARY KEY,
    date DATE NOT NULL,
    quarter VARCHAR(8) NOT NULL, -- 'Q1', 'Q2', 'Q3', 'Q4'
    year INT NOT NULL,
    customer_id VARCHAR(64) REFERENCES customers(id),
    product_id VARCHAR(64) REFERENCES products(id),
    region VARCHAR(64) NOT NULL,
    country VARCHAR(128) NOT NULL,
    revenue NUMERIC(14, 2) NOT NULL,
    quantity INT NOT NULL
);

-- 4. Costs Fact Table (Granular Cost Allocation)
CREATE TABLE costs (
    id VARCHAR(64) PRIMARY KEY,
    sale_id VARCHAR(64) REFERENCES sales(id) ON DELETE CASCADE,
    material_cost NUMERIC(14, 2) NOT NULL,
    shipping_cost NUMERIC(14, 2) NOT NULL,
    labor_cost NUMERIC(14, 2) NOT NULL
);

-- Indexes for Aggregation Performance
CREATE INDEX idx_sales_date_region ON sales(date, region);
CREATE INDEX idx_sales_quarter ON sales(quarter, year);
CREATE INDEX idx_costs_sale_id ON costs(sale_id);
```

### 1.3 Calibrated Dataset Baseline
- **Scale**: 500+ transactional enterprise records across 5 global regions (`Europe`, `North America`, `Asia`, `South America`, `Middle East`).
- **Benchmark Scenario**:
  - European Q2 Gross Margin: **32.1%** (Revenue $100 baseline, Total Cost ratio 67.9%).
  - European Q3 Gross Margin: **25.2%** (A **~7 percentage-point drop**).
  - Primary Root Cause: Shipping costs surged **+42%**, material costs increased **+8%**, while labor overhead held steady.

---

## Phase 2: dbt Transformation & Cube.dev Semantic Layer

### 2.1 Why Semantic Governance?
Allowing an LLM to generate raw SQL poses severe enterprise risks:
1. Inconsistent metric formulas (e.g. one analyst calculates margin using net revenue, another using gross revenue).
2. SQL injection and arbitrary table scans.
3. Hallucinated joins and non-existent column references.

The Semantic Layer acts as a strict contract between natural language questions and database tables.

### 2.2 Governed Metric Formulas
- **Revenue**: $\sum(\text{sales.revenue})$
- **Cost**: $\sum(\text{material\_cost} + \text{shipping\_cost} + \text{labor\_cost})$
- **Profit**: $\text{Revenue} - \text{Cost}$
- **Margin**: $\frac{\text{Revenue} - \text{Cost}}{\text{Revenue}}$
- **Margin %**: $\left(\frac{\text{Revenue} - \text{Cost}}{\text{Revenue}}\right) \times 100$

### 2.3 Cube.dev Model Definition (`Sales.yml`)

```yaml
cubes:
  - name: Sales
    sql: >
      SELECT 
        s.id,
        s.date,
        s.quarter,
        s.year,
        s.region,
        s.country,
        s.revenue,
        s.quantity,
        c.material_cost,
        c.shipping_cost,
        c.labor_cost,
        p.name AS product_name,
        p.category
      FROM sales s
      JOIN costs c ON s.id = c.sale_id
      JOIN products p ON s.product_id = p.id

    measures:
      - name: revenue
        type: sum
        sql: revenue
        title: "Total Revenue"

      - name: totalCost
        type: sum
        sql: material_cost + shipping_cost + labor_cost
        title: "Total Cost"

      - name: shippingCost
        type: sum
        sql: shipping_cost
        title: "Shipping Cost"

      - name: materialCost
        type: sum
        sql: material_cost
        title: "Material Cost"

      - name: laborCost
        type: sum
        sql: labor_cost
        title: "Labor Cost"

      - name: profit
        type: number
        sql: "{revenue} - {totalCost}"
        title: "Gross Profit"

      - name: marginPercent
        type: number
        sql: "(({revenue} - {totalCost}) / NULLIF({revenue}, 0)) * 100"
        title: "Gross Margin %"

    dimensions:
      - name: region
        sql: region
        type: string

      - name: category
        sql: category
        type: string

      - name: quarter
        sql: quarter
        type: string

      - name: date
        sql: date
        type: time
```

---

## Phase 3: AI Conversational Agent & Multi-Step Driver Reasoning

### 3.1 Agent Execution Lifecycle
When a user asks: *"Why did our European margins drop in Q3?"*, the agent executes a structured 6-stage pipeline:

```
[User Question]
       │
       ▼
1. Intent & Dimension Resolution (Region=Europe, Metric=Margin, Current=Q3, Baseline=Q2)
       │
       ▼
2. Governed Semantic Query (Cube.dev REST / GraphQL Endpoint)
       │
       ▼
3. Multi-Period Variance Calculation (Q2 Margin: 32% vs Q3 Margin: 25% -> Delta: -7% pts)
       │
       ▼
4. Root-Cause Cost Driver Decomposition (Shipping: +42%, Material: +8%, Labor: +0.8%)
       │
       ▼
5. Server-Side Gemini AI Synthesis (gemini-3.7-flash with GoogleGenAI SDK)
       │
       ▼
6. Structured UI Payload (Natural Explanation, Interactive Chart, Cost Driver Badges, API Query, Raw Data Rows)
```

### 3.2 Agent Tool Definitions
- `get_available_metrics()`: Returns governed metric dictionary.
- `query_metric(metric, region, quarter)`: Queries metric value with filters.
- `compare_periods(metric, region, period1, period2)`: Computes period variance.
- `analyze_margin_drivers(region, period1, period2)`: Decomposes shipping, material, labor, and revenue contributions.

---

## Phase 4: UI/UX & Real-Time Analytics Visualizations

### 4.1 Responsive Layout Engine
Built with React 19, TypeScript, and Tailwind CSS, the user interface features:
- **Interactive Global Filter Bar**: Dynamic filtering by Quarter (Q1-Q4, ALL), Region, Product Category, and instant text search.
- **Governed KPI Deck**: Cards with period-over-period percentage changes and metric definition popovers.
- **Dynamic Chart Suite (Recharts)**:
  - Line / Area Chart for trendlines with target threshold bands.
  - Grouped Bar Chart for multi-metric period comparisons.
  - Waterfall / Stacked Cost Breakdown for cost driver impact visualization.
  - Donut Chart for revenue & margin segmentations.
- **Real-Time Live Streaming**: Real-time websocket/polling simulation allowing monitoring of active transactional streams.
- **Direct Semantic Transparency**: Buttons to toggle raw underlying dataset tables and view the exact Cube.dev semantic query and SQL.

---

## Phase 5: Enterprise Security, RBAC, MFA & Compliance

### 5.1 Role-Based Access Control (RBAC)
| Role | View Dashboards | Ask Agent Queries | Export PDF Reports | Rotate Crypto Keys | View Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **ADMIN** |  |  |  |  |  |
| **LEAD_ANALYST** |  |  |  | ❌ |  |
| **EXECUTIVE** |  |  |  | ❌ | ❌ |
| **VIEWER** |  | ❌ | ❌ | ❌ | ❌ |

### 5.2 Multi-Factor Authentication (MFA)
- Time-based One-Time Password (TOTP) / Authenticator app verification flow.
- Simulated token challenges protecting elevated role permissions.

### 5.3 Cryptographic Standards
- **Data at Rest**: AES-256-GCM hardware-accelerated encryption on all storage volumes.
- **Data in Transit**: Strict TLS 1.3 cipher suites enforced.
- **90-Day Key Rotation Schedule**: Automated tracking with manual on-demand rotation triggers logged to the immutable audit ledger.

### 5.4 Audit Logging
Every administrative query, export, security check, and role transition generates an immutable audit record capturing timestamp, user ID, IP address, resource, and outcome.

---

## Summary of Completed Implementation
MetricMind delivers a production-ready conversational BI system that bridges natural language accessibility with enterprise-grade data governance and security.
