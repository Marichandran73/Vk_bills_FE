import React, { useState } from "react";
import { useCompany } from "../context/CompanyContext";
import type { Company } from "../Types/company";
import {
  ChevronDown,
  Check,
  Building2,
  MapPin,
  Hash,
  Briefcase,
} from "lucide-react";

const CompanySelector: React.FC = () => {
  const { selectedCompany, setSelectedCompany, companies } = useCompany();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (company: Company) => {
    setSelectedCompany(company);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selected Company Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-96 flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {selectedCompany.tradeName || selectedCompany.legalName}
            </p>
            <p className="text-xs text-gray-500">
              GST: {selectedCompany.gstin}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Select Company
              </p>
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleSelect(company)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                    selectedCompany.id === company.id
                      ? "bg-indigo-50 border-2 border-indigo-500"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {company.tradeName || company.legalName}
                        </p>
                        {company.isDefault && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <Hash className="w-3 h-3" />
                          <span>GST: {company.gstin}</span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {company.state} (Code: {company.stateCode})
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <Briefcase className="w-3 h-3" />
                          <span>PAN: {company.pan}</span>
                        </p>
                      </div>
                    </div>
                    {selectedCompany.id === company.id && (
                      <Check className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanySelector;
