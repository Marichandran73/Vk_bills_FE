import { useState, useEffect } from "react";
import { useCompany } from "../context/CompanyContext";
import NewInvoicePopup from "../Pages/NewInvoicePopup";
import CompanySelector from "../component/CompanySelector";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FileText,
  Plus,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  Menu,
  X,
  BarChart3,
  RefreshCcw,
} from "lucide-react";
import { apiService } from "../services/apiService";
import { useNavigate } from "react-router-dom";
import LogoImg from "../assets/LogoImg.png";
import LogoutButton from "./UI/LogoutButton";

const DashboardMain = () => {
  const { selectedCompany } = useCompany();
  const [Showpopup, setShowpopup] = useState(false);
  const [callApi, setCallApi] = useState(false);
  const [BillData, setBillData] = useState<any[]>([]);
  const [filterText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    FetchBilldata();
  }, []);

  const FetchBilldata = async () => {
    setCallApi(true);
    try {
      const res = await apiService.get<any[]>("/get-all-bills");
      setBillData(res);
    } catch (error) {
      console.error("Failed to save bill:", error);
      toast.error("Failed to save bill. Please try again.");
    } finally {
      setCallApi(false);
    }
  };

  const filteredBills = filterText.trim()
    ? BillData.filter(
        (bill) =>
          bill._id
            ?.slice(-6)
            .toUpperCase()
            .includes(filterText.trim().toUpperCase()) ||
          bill.customerDetails?.customerName
            ?.toLowerCase()
            .includes(filterText.trim().toLowerCase()),
      )
    : BillData;

  const totalRevenue = BillData.reduce(
    (sum, bill) => sum + Number(bill.totals?.grandTotal || 0),
    0,
  );

  const stats = [
    {
      label: "Total Invoices",
      value: BillData.length.toString(),
      icon: FileText,
      change: "+12%",
      color: "blue",
    },
    {
      label: "Customers",
      value: new Set(
        BillData.map(
          (bill) =>
            bill.customerDetails?.phone || bill.customerDetails?.customerName,
        ).filter(Boolean),
      ).size.toString(),
      icon: Users,
      change: "+5%",
      color: "green",
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      change: "+18%",
      color: "purple",
    },
    {
      label: "Pending Invoices",
      value: "0",
      icon: Calendar,
      change: "-3%",
      color: "orange",
    },
  ];

  const formatCurrency = (value: unknown) => Number(value || 0).toFixed(2);

  const escapeCsvValue = (value: unknown) => {
    const stringValue = String(value ?? "");
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const DownloadReport = () => {
    if (filteredBills.length === 0) {
      toast.error("No bill data available to download.");
      return;
    }

    const headers = [
      "SI",
      "Bill No",
      "Date",
      "Customer",
      "Phone",
      "Description",
      "Qty",
      "Unit",
      "Rate",
      "Amount",
      "Sub Total",
      "GST",
      "Transport",
      "Others",
      "Grand Total",
    ];

    const rows = filteredBills.flatMap((bill) =>
      (bill.items || []).map((item: any, itemIndex: number) => {
        const isFirstRow = itemIndex === 0;

        return [
          itemIndex + 1,
          isFirstRow ? bill._id?.slice(-6).toUpperCase() : "",
          isFirstRow && bill.createdAt
            ? new Date(bill.createdAt).toLocaleDateString("en-IN")
            : "",
          isFirstRow ? bill.customerDetails?.customerName : "",
          isFirstRow ? bill.customerDetails?.phone : "",
          item.description,
          item.quantity,
          item.unit,
          formatCurrency(item.rate),
          formatCurrency(item.amount),
          isFirstRow ? formatCurrency(bill.totals?.subTotal) : "",
          isFirstRow ? formatCurrency(bill.totals?.gstTotal) : "",
          isFirstRow ? formatCurrency(bill.totals?.transportation) : "",
          isFirstRow ? formatCurrency(bill.totals?.otherCharges) : "",
          isFirstRow ? formatCurrency(bill.totals?.grandTotal) : "",
        ];
      }),
    );

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `bill-report-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully!");
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        iconBg: "bg-blue-100",
        border: "border-blue-200",
        hover: "hover:border-blue-300 hover:shadow-blue-100",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        iconBg: "bg-green-100",
        border: "border-green-200",
        hover: "hover:border-green-300 hover:shadow-green-100",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        iconBg: "bg-purple-100",
        border: "border-purple-200",
        hover: "hover:border-purple-300 hover:shadow-purple-100",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        iconBg: "bg-orange-100",
        border: "border-orange-200",
        hover: "hover:border-orange-300 hover:shadow-orange-100",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };
  const RefreshData = ()=> {
    FetchBilldata();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header - Professional Blue Theme */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl shadow-md shadow-red-200">
                {/* <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> */}
                <img
                  src={LogoImg}
                  alt=""
                  className=" sm:w-6 sm:h-6 w-7 h-7 text-white"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                  Vk-GST Billing
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Dashboard
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                onClick={() => setShowpopup(true)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Invoice</span>
                <span className="sm:hidden">Add</span>
              </button>
              <CompanySelector />
              <LogoutButton className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden cursor-pointer p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 space-y-3">
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  setShowpopup(true);
                  setMobileMenuOpen(false);
                }}
              >
                <Plus className="w-4 h-4" />
                New Invoice
              </button>
              <div className="w-full">
                <CompanySelector />
              </div>
              <LogoutButton
                onLoggedOut={() => setMobileMenuOpen(false)}
                className="w-full px-4 py-2.5 rounded-xl text-slate-700 font-medium border border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Company Badge */}
        <div className="mb-6 flex justify-between">
          <div className=" flex flex-wrap items-center gap-2 text-sm cursor-pointer">
            <span className="text-slate-500 font-medium">
              Currently Billing As:
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
              {selectedCompany.tradeName || selectedCompany.legalName}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-mono text-xs border border-slate-200">
              GST: {selectedCompany.gstin}
            </span>
          </div>

          <div className="p-2 border-2 border-blue-200 rounded-sm cursor-pointer">
            {callApi ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              <RefreshCcw
                className="w-4 h-4"
                onClick={RefreshData}
              />
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 cursor-pointer">
          {stats.map((stat) => {
            const colors = getColorClasses(stat.color);
            return (
              <div
                key={stat.label}
                className={`bg-white rounded-xl shadow-sm border ${colors.border} p-4 sm:p-6 ${colors.hover} transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                    <stat.icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      stat.change.startsWith("+")
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-800">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-700 mb-1">
                  Quick Actions
                </h3>
                <p className="text-xs text-blue-600/70">
                  Manage your invoices efficiently
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={DownloadReport}
                className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-500" />
                Download Report
              </button>
              <button
                className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/PreviewTable")}
              >
                <Eye className="w-4 h-4 text-blue-500" />
                View All Bills
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-emerald-700 mb-1">
                  Summary
                </h3>
                <p className="text-xs text-emerald-600/70">
                  Your billing at a glance
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-slate-500">Total Bills</p>
                <p className="text-lg font-bold text-slate-800">
                  {BillData.length}
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-slate-500">Revenue</p>
                <p className="text-lg font-bold text-slate-800">
                  ₹{totalRevenue.toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Invoice Popup */}
      {Showpopup && (
        <NewInvoicePopup billData={null} onClose={() => setShowpopup(false)} RefreshData={RefreshData} />
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default DashboardMain;
