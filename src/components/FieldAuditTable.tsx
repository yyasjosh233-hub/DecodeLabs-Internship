import React, { useState } from 'react';
import type { ExtractedData } from '../types/schema';
import { EnterpriseDataEngine } from '../services/engine';
import { FileSpreadsheet, CheckCircle, XCircle, Filter } from 'lucide-react';

interface FieldAuditTableProps {
  data: ExtractedData;
}

const FIELD_METADATA: Record<keyof ExtractedData, { label: string; aliases: string }> = {
  customer_name: { label: 'Customer Name', aliases: 'Customer Name, Customer, Client, Buyer, Name' },
  email: { label: 'Email', aliases: 'Email, Mail, E-mail' },
  phone: { label: 'Phone', aliases: 'Phone, Mobile, Telephone, Contact, Contact Mobile, Cell' },
  company: { label: 'Company', aliases: 'Company, Organization, Business, Org' },
  order_number: { label: 'Order Number', aliases: 'Order Number, Order ID, Invoice Number, Transaction ID, Ref ID' },
  product: { label: 'Product', aliases: 'Product, Item, Purchased Item, Product Name' },
  city: { label: 'City', aliases: 'City, Location: City' },
  state: { label: 'State', aliases: 'State, Location: State' },
  country: { label: 'Country', aliases: 'Country, Location: Country' },
  purchase_date: { label: 'Purchase Date', aliases: 'Purchase Date, Order Date, Date of Purchase' },
  delivery_date: { label: 'Delivery Date', aliases: 'Delivery Date, Estimated Delivery, Ship Date' },
  status: { label: 'Status', aliases: 'Pending, Processing, Delivered, Cancelled, Completed' },
  amount: { label: 'Amount', aliases: 'Amount, Total, Price, Total Price, Subtotal' },
  currency: { label: 'Currency', aliases: 'Currency Symbol (€, $, ₹, £) or Code' }
};

export const FieldAuditTable: React.FC<FieldAuditTableProps> = ({ data }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'matched' | 'null'>('all');
  const allKeys = Object.keys(FIELD_METADATA) as (keyof ExtractedData)[];

  const stats = EnterpriseDataEngine.getExtractionStats(data);

  const filteredKeys = allKeys.filter(key => {
    const isPresent = data[key] !== null && data[key] !== undefined;
    if (filterMode === 'matched') return isPresent;
    if (filterMode === 'null') return !isPresent;
    return true;
  });

  return (
    <div className="glass-panel p-6 bg-[#0d101d]/90 border-[#1c233c] rounded-2xl flex flex-col gap-6">
      
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-violet-400" />
            Schema Property Audit & Rule Mapping
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Complete audit breakdown of all 14 mandatory JSON schema keys and rule alias matches.
          </p>
        </div>

        {/* Completion Rate Pill */}
        <div className="flex items-center gap-3 bg-[#070914] px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3 text-gray-300">
              <span className="text-gray-400">Match Accuracy</span>
              <span className="text-emerald-400 font-bold">{stats.matchedFields}/{stats.totalFields} ({stats.completionPercentage}%)</span>
            </div>
            <div className="w-36 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-gray-400 font-mono text-[11px]">Filter Fields:</span>
          <div className="flex items-center gap-1 bg-[#121727] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                filterMode === 'all' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({allKeys.length})
            </button>
            <button
              onClick={() => setFilterMode('matched')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                filterMode === 'matched' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Matched ({stats.matchedFields})
            </button>
            <button
              onClick={() => setFilterMode('null')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                filterMode === 'null' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Null ({stats.totalFields - stats.matchedFields})
            </button>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#080b15]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-[#0f1424] text-gray-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">JSON Key</th>
              <th className="py-3 px-4">Extraction Rule Aliases</th>
              <th className="py-3 px-4">Extracted Value</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filteredKeys.map((key) => {
              const val = data[key];
              const isPresent = val !== null && val !== undefined;
              const meta = FIELD_METADATA[key];

              return (
                <tr key={key} className="hover:bg-white/[0.02] transition-colors">
                  
                  {/* Key */}
                  <td className="py-3 px-4 font-semibold text-cyan-300">
                    "{key}"
                  </td>

                  {/* Rule Aliases */}
                  <td className="py-3 px-4 text-gray-400 font-sans text-xs">
                    {meta.aliases}
                  </td>

                  {/* Value */}
                  <td className="py-3 px-4">
                    {isPresent ? (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                        "{val}"
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">null</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    {isPresent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        MATCHED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-gray-400 border border-white/10">
                        <XCircle className="w-3 h-3 text-gray-500" />
                        NULL
                      </span>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

