import React from 'react';
import { useCompany } from '../context/CompanyContext';
import { FileText, Download, Mail, Printer } from 'lucide-react';

const InvoicePreview: React.FC = () => {
  const { selectedCompany } = useCompany();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoice Preview</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Mail className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Invoice Header with Company Details */}
        <div className="flex justify-between items-start pb-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {selectedCompany.legalName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{selectedCompany.address}</p>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">GSTIN:</span> {selectedCompany.gstin}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">PAN:</span> {selectedCompany.pan}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">State:</span> {selectedCompany.state} (Code: {selectedCompany.stateCode})
              </p>
              {selectedCompany.cin && (
                <p className="text-gray-600">
                  <span className="font-medium">CIN:</span> {selectedCompany.cin}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">INV-2026-001</p>
            <p className="text-sm text-gray-500 mt-1">Date: 25 Jul 2026</p>
            <p className="text-sm text-gray-500">Due: 24 Aug 2026</p>
          </div>
        </div>

        {/* Sample Invoice Items */}
        <div className="mt-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Item</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Rate</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">GST</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-700">Software Development Services</td>
                <td className="px-4 py-3 text-right text-gray-700">2</td>
                <td className="px-4 py-3 text-right text-gray-700">₹45,000</td>
                <td className="px-4 py-3 text-right text-gray-700">18%</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">₹1,06,200</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-700">Cloud Infrastructure</td>
                <td className="px-4 py-3 text-right text-gray-700">1</td>
                <td className="px-4 py-3 text-right text-gray-700">₹32,000</td>
                <td className="px-4 py-3 text-right text-gray-700">18%</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">₹37,760</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-600">Subtotal</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">₹1,22,000</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-600">Total GST (18%)</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">₹21,960</td>
              </tr>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900 text-lg">Grand Total</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-600 text-lg">₹1,43,960</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* GST Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>This is a system generated invoice</span>
          <span>GST Tax Invoice (B2B)</span>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;