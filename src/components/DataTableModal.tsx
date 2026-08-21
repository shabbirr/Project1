import React, { useState } from 'react';
import { X, Download, Search, Table, Filter, ArrowUpDown } from 'lucide-react';
import { SaleRecord } from '../types';
import { SALES_DATA } from '../data/dataset';

interface DataTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleData?: Partial<SaleRecord>[];
}

export const DataTableModal: React.FC<DataTableModalProps> = ({
  isOpen,
  onClose,
  sampleData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!isOpen) return null;

  const dataset: SaleRecord[] = (sampleData && sampleData.length > 0 ? (sampleData as SaleRecord[]) : SALES_DATA);

  const filtered = dataset.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.customerName?.toLowerCase().includes(q) ||
      r.productName?.toLowerCase().includes(q) ||
      r.region?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.country?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Quarter', 'Region', 'Country', 'Customer', 'Product', 'Category', 'Revenue', 'Total Cost', 'Profit', 'Margin %'];
    const rows = filtered.map((r) => [
      r.id,
      r.date,
      r.quarter,
      r.region,
      r.country,
      `"${r.customerName}"`,
      `"${r.productName}"`,
      `"${r.category}"`,
      r.revenue,
      r.totalCost,
      r.profit,
      `${r.marginPercent}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MetricMind_Data_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Table className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Underlying Governed Transactional Data
              </h3>
              <p className="text-xs text-slate-400">
                PostgreSQL Normalized Fact & Dimension Tables • {filtered.length} matching rows
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, product, region..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing Page {currentPage} of {totalPages || 1}
          </span>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-3 py-2.5">Trx ID</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Qtr</th>
                <th className="px-3 py-2.5">Region</th>
                <th className="px-3 py-2.5">Customer Account</th>
                <th className="px-3 py-2.5">Product Name</th>
                <th className="px-3 py-2.5 text-right">Revenue</th>
                <th className="px-3 py-2.5 text-right">Material</th>
                <th className="px-3 py-2.5 text-right">Shipping</th>
                <th className="px-3 py-2.5 text-right">Labor</th>
                <th className="px-3 py-2.5 text-right">Profit</th>
                <th className="px-3 py-2.5 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {paginated.map((row, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                  <td className="px-3 py-2 text-slate-500">{row.id}</td>
                  <td className="px-3 py-2 text-slate-700">{row.date}</td>
                  <td className="px-3 py-2 font-bold text-slate-800">{row.quarter}</td>
                  <td className="px-3 py-2 text-slate-800">{row.region}</td>
                  <td className="px-3 py-2 font-sans font-medium text-slate-900">{row.customerName}</td>
                  <td className="px-3 py-2 font-sans text-slate-700">{row.productName}</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900">${row.revenue?.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-slate-600">${row.materialCost?.toLocaleString()}</td>
                  <td className={`px-3 py-2 text-right ${row.region === 'Europe' && row.quarter === 'Q3' ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-600'}`}>
                    ${row.shippingCost?.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-600">${row.laborCost?.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-bold text-emerald-600">${row.profit?.toLocaleString()}</td>
                  <td className={`px-3 py-2 text-right font-bold ${(row.marginPercent || 0) < 28 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {row.marginPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Pagination Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total records: <strong>{filtered.length}</strong>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-slate-600">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
