import {
  Trash2,
  PenLine,
  Printer,
  Search,
  ArrowLeft,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Landmark,
  Recycle,
  Globe2,
  Sprout,
} from "lucide-react";
import { apiService } from "../services/apiService";
import { toast } from "react-toastify";
import { useEffect, useState, useRef } from "react";
import NewInvoicePopup from "../Pages/NewInvoicePopup";
import { useNavigate } from "react-router-dom";
import LogoImage from "../assets/Image/Logo.png";
import PaymentQR from "../Pages/Payment/PaymentQR";

// ---- Update these with your real company details ----
const COMPANY = {
  name: "VK & CO",
  tagline: "PLASTIC RECYCLING & TRADING SOLUTIONS",
  address:
    "No. 12/1, Industrial Area, Thoothukudi - 628 001, Tamil Nadu, India",
  phone: "+91 98765 43210",
  email: "vkandco.info@gmail.com",
  website: "www.vkandco.in",
  gstin: "33ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  bank: {
    name: "HDFC BANK",
    accountName: "VK & CO",
    accountNumber: "50200012345678",
    ifsc: "HDFC0001234",
    branch: "Thoothukudi - 628001",
  },
};

const BillTable = ({ BillData }: { BillData?: any[] }) => {
  const [bills, setBills] = useState<any[]>(BillData ?? []);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBill, setViewingBill] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (BillData) {
      setBills(BillData);
      return;
    }

    const fetchBills = async () => {
      setLoading(true);
      try {
        const res = await apiService.get<any[]>("/get-all-bills");
        setBills(res);
      } catch {
        toast.error("Failed to load bills. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [BillData]);

  const filteredBills = filterText.trim()
    ? bills.filter(
        (bill) =>
          bill._id
            ?.slice(-6)
            .toUpperCase()
            .includes(filterText.trim().toUpperCase()) ||
          bill.customerDetails?.customerName
            ?.toLowerCase()
            .includes(filterText.trim().toLowerCase()) ||
          bill.customerDetails?.phone?.includes(filterText.trim()),
      )
    : bills;

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  const DeleteBill = async (billId: string) => {
    try {
      const res = await apiService.delete<{ message: string }>(
        `/delete-bill/${billId}`,
      );
      setBills((currentBills) =>
        currentBills.filter((bill) => bill._id !== billId),
      );
      toast.success(res?.message || "Bill deleted successfully!");
    } catch {
      toast.error("Failed to delete bill. Please try again.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Print Function
  const handlePrint = (bill: any) => {
    setViewingBill(bill);
    setShowViewModal(true);
    setTimeout(() => {
      if (printRef.current) {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
      }
    }, 500);
  };

  // View Function
  const handleView = (bill: any) => {
    setViewingBill(bill);
    setShowViewModal(true);
  };

  // ---------------- Print Preview (VK & CO style tax invoice) ----------------
  const PrintPreview = ({ bill }: { bill: any }) => {
    if (!bill) return null;

    const companyData = COMPANY;
    const [first, second] = companyData.name
      .split("&")
      .map((value) => value.trim());
    const formatDate = (dateValue?: string) => {
      if (!dateValue) return "N/A";
      return new Date(dateValue).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };
    const customerDetails = bill.customerDetails ?? {};
    const billItems = Array.isArray(bill.items) ? bill.items : [];
    const totals = bill.totals ?? {};

    const customerRows = [
      { label: "Choose Company", value: customerDetails.ChooseCompany || "-" },
      {
        label: "Invoice Date",
        value: formatDate(
          bill.invoiceDate || customerDetails.invoiceDate || bill.createdAt,
        ),
      },
      { label: "Customer Name", value: customerDetails.customerName || "-" },
      { label: "Phone", value: customerDetails.phone || "-" },
      { label: "Email", value: customerDetails.email || "-" },
      { label: "GST", value: customerDetails.gst || "-" },
      { label: "Address", value: customerDetails.address || "-" },
      { label: "State", value: customerDetails.state || "-" },
      { label: "Place Of Supply", value: customerDetails.placeOfSupply || "-" },
    ];

    const totalRows = [
      { label: "Sub Total", value: formatCurrency(totals.subTotal || 0) },
      { label: "GST Total", value: formatCurrency(totals.gstTotal || 0) },
      { label: "CGST", value: formatCurrency(totals.cgst || 0) },
      { label: "SGST", value: formatCurrency(totals.sgst || 0) },
      {
        label: "Transportation",
        value: formatCurrency(totals.transportation || 0),
      },
      {
        label: "Other Charges",
        value: formatCurrency(totals.otherCharges || 0),
      },
      { label: "Discount", value: formatCurrency(totals.discount || 0) },
      {
        label: "Grand Total",
        value: formatCurrency(totals.grandTotal || 0),
        highlight: true,
      },
    ];

    return (
      <>
        <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm;
          }

          html,
          body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-print-root {
            min-height: auto !important;
            padding: 0 !important;
          }

          .invoice-print-page {
            width: 202mm !important;
            height: 289mm !important;
            max-width: 202mm !important;
            overflow: hidden !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }

          .invoice-print-fit {
            width: 111% !important;
            transform: scale(0.9);
            transform-origin: top left;
          }

          .invoice-print-fit * {
            line-height: 1.2 !important;
          }
        }
      `}</style>
        <div className="invoice-print-root w-full min-h-screen bg-white flex items-center justify-center p-4">
          <div className="invoice-print-page relative w-full max-w-[900px] bg-white shadow-2xl overflow-hidden font-sans">
            <div className="invoice-print-fit">
              {/* ================= TOP HEADER STRIPES ================= */}
              <div className="relative h-14 bg-black overflow-hidden">
                {/* left red diagonal block */}
                <div className="absolute left-0 top-0 h-full w-64 bg-red-600 [clip-path:polygon(0_0,85%_0,55%_100%,0%_100%)]" />
                <div className="absolute left-0 top-0 h-full w-72 bg-black [clip-path:polygon(0_0,70%_0,40%_100%,0%_100%)] opacity-0" />
                <div className="absolute left-10 top-0 h-full w-56 border-l-4 border-white/70 [clip-path:polygon(0_0,100%_0,70%_100%,0%_100%)]" />
                {/* right stripes */}
                <div className="absolute right-0 top-0 h-full w-72 bg-red-600 [clip-path:polygon(30%_0,100%_0,100%_100%,60%_100%)]" />
                <div className="absolute right-8 top-0 h-full flex gap-2">
                  <div className="w-3 h-full bg-white/80 skew-x-[-25deg]" />
                  <div className="w-3 h-full bg-white/80 skew-x-[-25deg]" />
                  <div className="w-3 h-full bg-white/80 skew-x-[-25deg]" />
                </div>
              </div>

              {/* ================= HEADER CONTENT ================= */}
              <div className="px-8 pt-8 pb-6 flex items-start justify-between gap-6">
                {/* Logo */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-40 h-40 items-center shrink-0">
                    <img
                      src={LogoImage}
                      alt={`${companyData.name} Logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="pl-4 border-l-4 border-red-600">
                    <h1 className="text-4xl font-black leading-none tracking-tight">
                      <span className="text-red-600 italic">{first}</span>{" "}
                      <span className="text-black italic">&amp; {second}</span>
                    </h1>
                    <p className="text-sm font-bold text-black mt-2 leading-tight">
                      {companyData.tagline}
                    </p>
                    <div className="mt-3 space-y-1.5 text-[11px] text-gray-800">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                        <span>{companyData.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="font-semibold">
                          {companyData.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="font-semibold">
                          {companyData.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                        <span className="font-bold text-red-600 text-[11px]">
                          GSTIN
                        </span>
                        <span className="text-[11px]">
                          : {companyData.gstin}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice title + meta */}
                <div className="flex flex-col items-end shrink-0 pt-1">
                  <h2 className="text-5xl font-black tracking-tight leading-none whitespace-nowrap">
                    <span className="text-red-600 italic">TAX</span>{" "}
                    <span className="text-black italic">INVOICE</span>
                  </h2>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="h-1.5 w-24 bg-red-600" />
                    <div className="h-1.5 w-10 bg-black" />
                    <span className="w-1.5 h-1.5 rounded-full bg-black ml-1" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  </div>

                  <div className="mt-2 space-y-2 w-72">
                    {[
                      {
                        icon: FileText,
                        label: "INVOICE NO",
                        value: `#${bill._id?.slice(-6).toUpperCase() || "N/A"}`,
                      },
                      {
                        icon: Calendar,
                        label: "INVOICE DATE",
                        value: formatDate(bill.createdAt),
                      },
                      {
                        icon: Clock,
                        label: "DUE DATE",
                        value: formatDate(bill.dueDate),
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="relative flex items-center bg-gray-100 h-11"
                      >
                        <div className="relative h-11 w-11 bg-red-600 [clip-path:polygon(0_0,100%_0,80%_100%,0%_100%)] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="ml-4 text-[12px] font-bold text-black">
                          {label}
                        </span>
                        <span className="ml-2 text-[12px] font-bold text-black">
                          :
                        </span>
                        <span className="ml-2 text-[12px] font-semibold text-black truncate">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================= BILL TO ================= */}
              <div className="px-8">
                <div className="relative w-52 h-8 bg-red-600 [clip-path:polygon(0_0,90%_0,100%_100%,0%_100%)] flex items-center">
                  <span className="text-white font-black text-sm tracking-wide pl-4">
                    BILL TO
                  </span>
                </div>
              </div>

              {/* ================= BILL TO TABLES ================= */}
              <div className="relative px-8 pt-3 pb-4 h-[320px]">
                <div className="pointer-events-none select-none absolute inset-x-0 top-12 flex justify-center opacity-[0.04]">
                  <img
                    src={LogoImage}
                    alt="VK & Co"
                    className="w-[380px] object-contain"
                  />
                </div>

                <div className="relative grid grid-cols-12 gap-3">
                  <div className="col-span-5 border border-gray-200 rounded-md bg-white/90 overflow-hidden">
                    <div className="bg-gray-100 px-2 py-1.5 text-[11px] font-bold tracking-wide text-gray-700 uppercase">
                      Customer Details
                    </div>
                    <table className="w-full text-[11px]">
                      <tbody>
                        {customerRows.map((row) => (
                          <tr
                            key={row.label}
                            className="border-t border-gray-100 align-top"
                          >
                            <td className="px-2 py-1.5 font-semibold text-gray-700 w-[42%]">
                              {row.label}
                            </td>
                            <td className="px-2 py-1.5 text-gray-900">
                              {row.value || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="col-span-7 flex flex-col gap-3">
                    <div className="border border-gray-200 rounded-md bg-white/90 overflow-hidden">
                      <div className="bg-gray-100 px-2 py-1.5 text-[11px] font-bold tracking-wide text-gray-700 uppercase">
                        Items
                      </div>
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700">
                            <th className="px-2 py-1.5 text-left">#</th>
                            <th className="px-2 py-1.5 text-left">
                              Description
                            </th>
                            <th className="px-2 py-1.5 text-right">Qty</th>
                            <th className="px-2 py-1.5 text-center">Unit</th>
                            <th className="px-2 py-1.5 text-right">Rate</th>
                            <th className="px-2 py-1.5 text-right">Amount</th>
                            <th className="px-2 py-1.5 text-right">GST%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billItems.length > 0 ? (
                            billItems.map((item: any, index: number) => (
                              <tr
                                key={`${item.id || item.description}-${index}`}
                                className="border-t border-gray-100"
                              >
                                <td className="px-2 py-1.5">{index + 1}</td>
                                <td className="px-2 py-1.5 truncate max-w-[140px]">
                                  {item.description || "-"}
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  {item.quantity ?? "-"}
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  {item.unit || "-"}
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  {formatCurrency(item.rate || 0)}
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  {formatCurrency(item.amount || 0)}
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  {item.gstRate ?? 0}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-2 py-2 text-center text-gray-500"
                              >
                                No items
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="border border-gray-200 rounded-md bg-white/90 overflow-hidden">
                      <div className="bg-gray-100 px-2 py-1.5 text-[11px] font-bold tracking-wide text-gray-700 uppercase">
                        Totals
                      </div>
                      <table className="w-full text-[11px]">
                        <tbody>
                          {totalRows.map((row) => (
                            <tr
                              key={row.label}
                              className="border-t border-gray-100"
                            >
                              <td className="px-2 py-1.5 font-semibold text-gray-700">
                                {row.label}
                              </td>
                              <td
                                className={`px-2 py-1.5 text-right ${row.highlight ? "font-bold text-red-600" : "text-gray-900"}`}
                              >
                                {row.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= BANK DETAILS ================= */}
              <div className="px-8 mt-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5 text-white" />
                  </div>
                  <div className="relative flex-1 h-8 bg-gradient-to-r from-red-600 to-black [clip-path:polygon(0_0,96%_0,100%_100%,0%_100%)] flex items-center">
                    <span className="text-white font-black text-sm tracking-wide pl-4">
                      BANK DETAILS
                    </span>
                  </div>
                </div>

                <div className="flex  items-start gap-4 mt-5 pb-3">
                  <div className="space-y-3 text-[13px] font-semibold">
                    <p>
                      <span className="font-bold">Bank Name</span>{" "}
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {companyData.bank.name}
                    </p>
                    <p>
                      <span className="font-bold">Account Name</span> &nbsp;:{" "}
                      {companyData.bank.accountName}
                    </p>
                    <p>
                      <span className="font-bold">Account Number</span> :{" "}
                      {companyData.bank.accountNumber}
                    </p>
                    <p>
                      <span className="font-bold">IFSC CODE</span>{" "}
                      &nbsp;&nbsp;&nbsp;&nbsp;: {companyData.bank.ifsc}
                    </p>
                    <p>
                      <span className="font-bold">Bank Branch</span>{" "}
                      &nbsp;&nbsp;: {companyData.bank.branch}
                    </p>
                  </div>

                  <div className="border-2 border-gray-200 rounded-xl p-1 w-48 shrink-0">
                    <div className="w-full aspect-square grid grid-cols-6 grid-rows-6  p-2">
                      <PaymentQR grandTotal={bill.totals?.grandTotal || 0} />
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="text-[11px] font-black tracking-widest">
                        UPI
                      </span>
                      <span className="w-2 h-2 bg-orange-400 rounded-full" />
                      <span className="w-2 h-2 bg-white border border-gray-300 rounded-full" />
                      <span className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Goods once sold cannot be returned.</li>
                      <li>
                        • Payment to be made within the agreed credit period.
                      </li>
                      <li>
                        • Interest @ 18% p.a. will be charged on delayed
                        payments.
                      </li>
                      <li>• Subject to Thoothukudi Jurisdiction only.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ================= FOOTER ================= */}
             <div className="relative h-24 bg-black overflow-hidden flex items-center justify-between px-8">
          <div className="absolute right-24 top-0 h-full w-40 bg-red-600 [clip-path:polygon(40%_0,100%_0,60%_100%,0%_100%)]" />
          <div className="absolute right-20 top-0 h-full flex gap-2">
            <div className="w-2 h-full bg-white/70 skew-x-[-25deg]" />
            <div className="w-2 h-full bg-white/70 skew-x-[-25deg]" />
          </div>

          <div className="relative z-10">
            <p
              className="text-white text-sm italic"
              style={{ fontFamily: "Georgia, serif" }}
            >
              We value your business
            </p>
            <p className="text-red-600 font-black text-xl italic leading-tight">
              THANK YOU!
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-10">
            <div className="flex flex-col items-center gap-1">
              <Recycle className="w-6 h-6 text-red-600" />
              <span className="text-white text-[10px] font-bold tracking-wide">
                RECYCLE
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Globe2 className="w-6 h-6 text-white" />
              <span className="text-white text-[10px] font-bold tracking-wide">
                REUSE
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sprout className="w-6 h-6 text-red-600" />
              <span className="text-white text-[10px] font-bold tracking-wide">
                SUSTAIN
              </span>
            </div>
          </div>

          <div className="relative z-10 text-right">
            <p className="text-white font-bold text-sm leading-tight">
              TOGETHER FOR
            </p>
            <p className="text-white font-bold text-sm leading-tight">
              A <span className="text-white">CLEANER</span> TOMORROW
            </p>
          </div>
        </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 md:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-white rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                Invoice Management
              </span>
              <span className="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {filteredBills.length} Bills
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              View and manage all your GST invoices
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-gray-500 hover:text-indigo-600">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-gray-500 hover:text-indigo-600">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search by Bill No, Customer Name or Phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-gray-50/50"
              type="text"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
            />
            {filterText && (
              <button
                onClick={() => setFilterText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 whitespace-nowrap">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No bills found
            </h3>
            <p className="text-sm text-gray-500">
              {filterText
                ? "Try adjusting your search terms"
                : "Create your first invoice to get started"}
            </p>
          </div>
        ) : loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-3 text-gray-500">Loading bills...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      Bill No
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                      Description
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">
                      Qty
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider hidden md:table-cell">
                      Unit
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                      Rate
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider hidden xl:table-cell">
                      Amount
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider hidden xl:table-cell">
                      Sub Total
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider hidden xl:table-cell">
                      GST
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider">
                      Grand Total
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentBills.map((bill, billIndex) => {
                    const items = bill.items || [];
                    return items.map((item: any, itemIndex: number) => {
                      const isFirstRow = itemIndex === 0;
                      const rowBg =
                        billIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50";

                      return (
                        <tr
                          key={`${bill._id}-${itemIndex}`}
                          className={`${rowBg} border-b border-gray-100 hover:bg-indigo-50/30 transition-colors group`}
                        >
                          <td className="px-4 py-3 text-gray-500 text-center font-medium">
                            {itemIndex + 1}
                          </td>

                          <td className="px-4 py-3">
                            {isFirstRow ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-mono font-semibold text-xs">
                                #{bill._id?.slice(-6).toUpperCase()}
                              </span>
                            ) : null}
                          </td>

                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                            {isFirstRow
                              ? new Date(bill.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : null}
                          </td>

                          <td className="px-4 py-3">
                            {isFirstRow ? (
                              <div>
                                <p className="font-medium text-gray-800">
                                  {bill.customerDetails?.customerName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {bill.customerDetails?.email || "No email"}
                                </p>
                              </div>
                            ) : null}
                          </td>

                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {isFirstRow ? bill.customerDetails?.phone : null}
                          </td>

                          <td className="px-4 py-3 text-gray-700 hidden lg:table-cell max-w-xs truncate">
                            {item.description}
                          </td>

                          <td className="px-4 py-3 text-center text-gray-700 hidden sm:table-cell">
                            {item.quantity}
                          </td>

                          <td className="px-4 py-3 text-center text-gray-600 hidden md:table-cell">
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                              {item.unit}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right text-gray-700 hidden lg:table-cell">
                            {formatCurrency(item.rate)}
                          </td>

                          <td className="px-4 py-3 text-right text-gray-700 hidden xl:table-cell">
                            {formatCurrency(item.amount)}
                          </td>

                          <td className="px-4 py-3 text-right text-gray-700 hidden xl:table-cell">
                            {isFirstRow
                              ? formatCurrency(bill.totals?.subTotal || 0)
                              : null}
                          </td>

                          <td className="px-4 py-3 text-right text-gray-700 hidden xl:table-cell">
                            {isFirstRow
                              ? formatCurrency(bill.totals?.gstTotal || 0)
                              : null}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {isFirstRow ? (
                              <span className="font-bold text-indigo-600 text-sm">
                                {formatCurrency(bill.totals?.grandTotal || 0)}
                              </span>
                            ) : null}
                          </td>

                          <td className="px-4 py-3">
                            {isFirstRow && (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                  title="View"
                                  onClick={() => handleView(bill)}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                  title="Print"
                                  onClick={() => handlePrint(bill)}
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                                  title="Edit"
                                  onClick={() => {
                                    setSelectedBill(bill);
                                    setShowInvoice(true);
                                  }}
                                >
                                  <PenLine className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                  title="Delete"
                                  onClick={() => DeleteBill(bill._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredBills.length > itemsPerPage && (
              <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredBills.length)} of{" "}
                  {filteredBills.length} bills
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white shadow-md"
                              : "hover:bg-indigo-50 text-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Invoice Modal */}
      {showViewModal && viewingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-bold">Invoice Details</h2>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  #{viewingBill._id?.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Customer Information
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {viewingBill.customerDetails?.customerName}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {viewingBill.customerDetails?.phone}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {viewingBill.customerDetails?.email || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">GST:</span>{" "}
                        {viewingBill.customerDetails?.gst || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {viewingBill.customerDetails?.address}
                      </p>
                      <p>
                        <span className="font-medium">State:</span>{" "}
                        {viewingBill.customerDetails?.state || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Bill Summary
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Bill Date:</span>{" "}
                        {new Date(viewingBill.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Items:</span>{" "}
                        {viewingBill.items?.length || 0}
                      </p>
                      <p>
                        <span className="font-medium">Sub Total:</span>{" "}
                        {formatCurrency(viewingBill.totals?.subTotal || 0)}
                      </p>
                      <p>
                        <span className="font-medium">GST:</span>{" "}
                        {formatCurrency(viewingBill.totals?.gstTotal || 0)}
                      </p>
                      {viewingBill.totals?.transportation > 0 && (
                        <p>
                          <span className="font-medium">Transportation:</span>{" "}
                          {formatCurrency(viewingBill.totals?.transportation)}
                        </p>
                      )}
                      {viewingBill.totals?.otherCharges > 0 && (
                        <p>
                          <span className="font-medium">Other Charges:</span>{" "}
                          {formatCurrency(viewingBill.totals?.otherCharges)}
                        </p>
                      )}
                      <p className="text-lg font-bold text-indigo-600 pt-2 border-t border-gray-200">
                        <span className="font-medium">Grand Total:</span>{" "}
                        {formatCurrency(viewingBill.totals?.grandTotal || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Items
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left">#</th>
                          <th className="px-4 py-3 text-left">Description</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-center">Unit</th>
                          <th className="px-4 py-3 text-right">Rate</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(viewingBill.items || []).map(
                          (item: any, index: number) => (
                            <tr
                              key={index}
                              className="border-t border-gray-100"
                            >
                              <td className="px-4 py-3 text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3">{item.description}</td>
                              <td className="px-4 py-3 text-center">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.unit}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {formatCurrency(item.rate)}
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                {formatCurrency(item.amount)}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => handlePrint(viewingBill)}
                className="px-6 py-2.5 text-white font-medium rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Preview */}
      {viewingBill && (
        <div className="hidden" ref={printRef}>
          <PrintPreview bill={viewingBill} />
        </div>
      )}

      {/* Edit Invoice Popup */}
      {showInvoice && selectedBill && (
        <NewInvoicePopup
          billData={selectedBill}
          onClose={() => {
            setShowInvoice(false);
            setSelectedBill(null);
          }}
        />
      )}
    </div>
  );
};

export default BillTable;
