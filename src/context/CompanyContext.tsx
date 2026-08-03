import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Company } from "../Types/company";
import { companies } from "../Types/company";

interface CompanyContextType {
  selectedCompany: Company;
  setSelectedCompany: (company: Company) => void;
  companies: Company[];
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const defaultCompany = companies.find((c) => c.isDefault) || companies[0];
  const [selectedCompany, setSelectedCompany] =
    useState<Company>(defaultCompany);

  return (
    <CompanyContext.Provider
      value={{ selectedCompany, setSelectedCompany, companies }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
