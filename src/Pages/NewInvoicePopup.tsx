import { useState, useEffect, useRef } from "react";
import { companies, type Company } from "../Types/company";
import {
  X,
  Plus,
  Trash2,
  Save,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Building2,
  Receipt,
  IndianRupee,
  Package,
  Percent,
  Truck,
  MoreHorizontal,
  AlertCircle,
  FileText,
  Clock,
  Landmark,
  Recycle,
  Globe2,
  Sprout,
} from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../services/apiService";
import LogoImage from "../assets/Image/Logo.png";
import PaymentQR from "./Payment/PaymentQR";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const NewInvoicePopup = ({
  onClose,
  billData,
  RefreshData,
}: {
  onClose: () => void;
  billData: any;
  RefreshData?: () => void;
}) => {
  const [SavedData, setSavedData] = useState(!!billData?._id);
  const [items, setItems] = useState([
    {
      id: "1",
      description: "",
      quantity: 1,
      unit: "Nos",
      rate: 0,
      amount: 0,
      gstRate: 18,
    },
  ]);

  const [customerDetails, setCustomerDetails] = useState({
    ChooseCompany: "comp-1",
    invoiceDate: "",
    customerCompany: "",
    customerName: "",
    phone: "",
    email: "",
    gst: "",
    address: "",
    state: "",
    placeOfSupply: "",
  });

  const DEFAULT_TERMS = [
    "Goods once sold cannot be returned.",
    "Payment to be made within the agreed credit period.",
    "Interest @ 18% p.a. will be charged on delayed payments.",
    "Subject to Thoothukudi Jurisdiction only.",
  ];

  // FIX: Remove unused setTerms - keep only terms
  const terms = DEFAULT_TERMS;
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

  useEffect(() => {
    if (billData?._id) {
      if (billData.customerDetails)
        setCustomerDetails(billData.customerDetails);
      if (billData.items?.length) setItems(billData.items);
      if (billData.totals) setTotals(billData.totals);
      if (billData.terms?.length) setSelectedTerms(billData.terms);
    }
  }, [billData]);

  const toggleTerm = (term: string) => {
    setSelectedTerms((prev) =>
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term],
    );
  };

  const [totals, setTotals] = useState({
    subTotal: 0,
    gstTotal: 0,
    cgst: 0,
    sgst: 0,
    transportation: 0,
    otherCharges: 0,
    discount: 0,
    grandTotal: 0,
  });

  const printRef = useRef<HTMLDivElement>(null);

  const unitOptions = [
    "Nos",
    "Kg",
    "Mtr",
    "Hrs",
    "Box",
    "Set",
    "Pair",
    "Ltr",
    "Pcs",
  ];

  const gstOptions = [0, 5, 12, 18, 28];
  
  // Item handlers
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unit: "Nos",
        rate: 0,
        amount: 0,
        gstRate: 18,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = (updated.quantity || 0) * (updated.rate || 0);
        }
        return updated;
      }
      return item;
    });
    setItems(updatedItems);
    calculateTotals(updatedItems);
  };
  
  const calculateTotals = (updatedItems: any[]) => {
    const subTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const gstTotal = updatedItems.reduce(
      (sum, item) => sum + (item.amount * (item.gstRate || 18)) / 100,
      0,
    );
    const cgst = gstTotal / 2;
    const sgst = gstTotal / 2;
    const grandTotal =
      subTotal +
      gstTotal +
      totals.transportation +
      totals.otherCharges -
      totals.discount;

    setTotals((prev) => ({
      ...prev,
      subTotal,
      gstTotal,
      cgst,
      sgst,
      grandTotal,
    }));
  };

  const handleTotalChange = (field: string, value: number) => {
    const updated = { ...totals, [field]: value };
    setTotals(updated);
    const grandTotal =
      updated.subTotal +
      updated.gstTotal +
      updated.transportation +
      updated.otherCharges -
      updated.discount;
    setTotals((prev) => ({ ...prev, grandTotal }));
  };

  const handleCustomerChange = (field: string, value: string) => {
    setCustomerDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Validate required customer fields
  const validateCustomerDetails = () => {
    if (
      !customerDetails.customerName ||
      !customerDetails.phone ||
      !customerDetails.address ||
      !customerDetails.state ||
      !customerDetails.invoiceDate
    ) {
      toast.error("Please fill all required customer details.");
      return false;
    }
    return true;
  };

  // Generate and download the invoice report as a PDF
  const handlePrint = async () => {
    if (!printRef.current) return;

    try {
      const element = printRef.current;
      element.style.setProperty("display", "block", "important");
      element.style.position = "fixed";
      element.style.left = "-9999px";
      element.style.top = "0";
      element.style.width = "900px";
      element.style.zIndex = "-1";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      element.style.removeProperty("display");
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
      element.style.width = "";
      element.style.zIndex = "";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `invoice-${customerDetails.customerName || "report"}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF report. Please try again.");
    }
  };

  // Save Report: Only generate the report (print/download), no backend save
  const handleSaveReport = () => {
    if (!validateCustomerDetails()) return;
    handlePrint();
    onClose();
  };

  // Save Report & Send: Save to backend, send, and generate the report
  const Savebill = async () => {
    if (!validateCustomerDetails()) return;
    try {
      const res = await (SavedData
        ? apiService.put<{ message: string }>(`/update-bill/${billData._id}`, {
            customerDetails,
            items,
            totals,
            terms: selectedTerms,
          })
        : apiService.post<{ message: string; id?: string }>("/save-bill", {
            customerDetails,
            items,
            totals,
            terms: selectedTerms,
          }));

      const billId = SavedData ? billData?._id : (res as { id?: string })?.id;

      if (!billId) {
        toast.error("Bill saved but could not resolve bill id for sending.");
        return;
      }

      const sendRes = await apiService.post<{ message: string }>(
        `/send-bill/${billId}`,
      );
      toast.success(sendRes?.message || "Bill saved and sent successfully!");

      setSavedData(true);
      RefreshData?.();
      onClose();
    } catch (error) {
      console.error("Failed to save bill:", error);
      toast.error("Failed to save and send bill. Please try again.");
    }
  };

  // ---------------- Print Preview (VK & CO style tax invoice) ----------------
  const PrintPreview = () => {
    const selectedCompany =
      companies.find(
        (c) => (c.tradeName || c.legalName) === customerDetails.ChooseCompany,
      ) || companies[0];

    const companyData = {
      name: selectedCompany.tradeName || selectedCompany.legalName,
      tagline: "PLASTIC RECYCLING & TRADING SOLUTIONS",
      address: selectedCompany.address,
      phone: "+91 98765 43210",
      email: "vkandco.info@gmail.com",
      website: "www.vkandco.in",
      gstin: selectedCompany.gstin,
      pan: selectedCompany.pan,
      bank: {
        name: "HDFC BANK",
        accountName: selectedCompany.legalName,
        accountNumber: "50200012345678",
        ifsc: "HDFC0001234",
        branch: "Thoothukudi - 628001",
      },
    };
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
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    const customerRows = [
      {
        label: "Invoice Date",
        value: formatDate(customerDetails.invoiceDate),
      },
      {
        label: "Customer Company",
        value: customerDetails.customerCompany || "-",
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
                <div className="absolute left-0 top-0 h-full w-64 bg-red-600 [clip-path:polygon(0_0,85%_0,55%_100%,0%_100%)]" />
                <div className="absolute left-0 top-0 h-full w-72 bg-black [clip-path:polygon(0_0,70%_0,40%_100%,0%_100%)] opacity-0" />
                <div className="absolute left-10 top-0 h-full w-56 border-l-4 border-white/70 [clip-path:polygon(0_0,100%_0,70%_100%,0%_100%)]" />
                <div className="absolute right-0 top-0 h-full w-72 bg-red-600 [clip-path:polygon(30%_0,100%_0,100%_100%,60%_100%)]" />
                <div className="absolute right-8 top-0 h-full flex gap-2">
                  <div className="w-3 h-full bg-white/80 skew-x-[-25deg]" />
                  <div className="w-3 h-full bg-white/80 skew-x-[-25deg]" />
                  <div className="w-3 h-full bg-white/80 skew-x-[-25deg]" />
                </div>
              </div>

              {/* ================= HEADER CONTENT ================= */}
              <div className="px-8 pt-8 pb-6 flex items-start justify-between gap-6">
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
                      <span className="text-black italic">& {second}</span>
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
                        value: `#${billData?._id?.slice(-6).toUpperCase() || "NEW"}`,
                      },
                      {
                        icon: CalendarIcon,
                        label: "INVOICE DATE",
                        value: formatDate(customerDetails.invoiceDate),
                      },
                      {
                        icon: Clock,
                        label: "DUE DATE",
                        value: formatDate(customerDetails.invoiceDate),
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
                          {items.length > 0 ? (
                            items.map((item: any, index: number) => (
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
              <div className="px-8 mt-20">
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

                <div className="flex items-start gap-4 mt-5 pb-3">
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
                    <div className="w-full aspect-square grid grid-cols-6 grid-rows-6 p-2">
                      <PaymentQR grandTotal={totals.grandTotal || 0} />
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
                      {selectedTerms.length > 0 ? (
                        selectedTerms.map((term) => (
                          <li key={term}>• {term}</li>
                        ))
                      ) : (
                        <li>• No terms selected</li>
                      )}
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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
        <div className="relative w-full max-w-7xl max-h-[95vh] sm:max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex-none bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-t-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                    Create Invoice
                  </h2>
                  <p className="text-xs text-indigo-100 mt-0.5 hidden sm:block">
                    Generate a GST compliant invoice for your customer
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 sm:flex-none">
                  <select
                    className="cursor-pointer w-full sm:w-56 px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 text-sm"
                    value={customerDetails.ChooseCompany}
                    onChange={(e) => {
                      const company = companies.find(
                        (c) => c.id === e.target.value,
                      );
                      handleCustomerChange(
                        "ChooseCompany",
                        company?.tradeName || company?.legalName || "",
                      );
                    }}
                  >
                    <option value="" className="cursor-pointer bg-blue-50" disabled >Select Company</option>
                    {companies.map((company: Company) => (
                      <option key={company.id} className="cursor-pointer bg-blue-50" value={company.id}>
                        {company.tradeName || company.legalName}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-gray-50/50">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
              <div className="px-4 sm:px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">
                    Customer Information
                  </h3>
                </div>
                <span className="text-xs text-gray-400">* Required fields</span>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Invoice Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      value={customerDetails.invoiceDate}
                      onChange={(e) =>
                        handleCustomerChange("invoiceDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Customer Company <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter customer name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={customerDetails.customerCompany}
                        onChange={(e) =>
                          handleCustomerChange("customerCompany", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter customer name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={customerDetails.customerName}
                        onChange={(e) =>
                          handleCustomerChange("customerName", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={customerDetails.phone}
                        onChange={(e) =>
                          handleCustomerChange("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="customer@email.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={customerDetails.email}
                        onChange={(e) =>
                          handleCustomerChange("email", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      GST Number
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="22ABCDE1234F1Z5"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all uppercase"
                        value={customerDetails.gst}
                        onChange={(e) =>
                          handleCustomerChange("gst", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Select terms & conditions
                    </label>
                    <div className="relative space-y-1.5">
                      {terms.map((term) => (
                        <label
                          key={term}
                          className="flex gap-2 items-start cursor-pointer group"
                        >
                        <div className="w-[10%]">
                           <input
                            type="checkbox"
                            checked={selectedTerms.includes(term)}
                            onChange={() => toggleTerm(term)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            </div> 
                          <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {term}
                          </p>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        rows={2}
                        placeholder="Enter complete address"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                        value={customerDetails.address}
                        onChange={(e) =>
                          handleCustomerChange("address", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                        value={customerDetails.state}
                        onChange={(e) =>
                          handleCustomerChange("state", e.target.value)
                        }
                      >
                        <option value="">Select State</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Place of Supply
                      </label>
                      <select
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                        value={customerDetails.placeOfSupply}
                        onChange={(e) =>
                          handleCustomerChange("placeOfSupply", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="Within State">Within State</option>
                        <option value="Out of State">Out of State</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
              <div className="px-4 sm:px-6 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Invoice Items</h3>
                  <span className="text-xs text-gray-400">
                    ({items.length} items)
                  </span>
                </div>
                <button
                  onClick={addItem}
                  className="cursor-pointer flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="p-2 sm:p-4">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50/80 rounded-lg">
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                          #
                        </th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                          Qty
                        </th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                          Unit
                        </th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                          Rate (₹)
                        </th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                          GST %
                        </th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                          Amount (₹)
                        </th>
                        <th className="p-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="p-2 text-gray-500 font-medium">
                            {index + 1}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Enter item description"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                              value={item.description}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm text-center"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                            />
                          </td>
                          <td className="p-2">
                            <select
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm bg-white"
                              value={item.unit}
                              onChange={(e) =>
                                updateItem(item.id, "unit", e.target.value)
                              }
                            >
                              {unitOptions.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm text-right"
                              value={item.rate || ""}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "rate",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                            />
                          </td>
                          <td className="p-2">
                            <select
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm bg-white"
                              value={item.gstRate}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "gstRate",
                                  parseInt(e.target.value),
                                )
                              }
                            >
                              {gstOptions.map((rate) => (
                                <option key={rate} value={rate}>
                                  {rate}%
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-right"
                              value={`₹${item.amount.toFixed(2)}`}
                              readOnly
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              disabled={items.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Additional Charges & Bill Summary */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 sm:p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h4 className="font-medium text-gray-800">
                    Additional Charges
                  </h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Transportation
                    </label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={totals.transportation}
                        onChange={(e) =>
                          handleTotalChange(
                            "transportation",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Other Charges
                    </label>
                    <div className="relative">
                      <MoreHorizontal className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={totals.otherCharges}
                        onChange={(e) =>
                          handleTotalChange(
                            "otherCharges",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Discount
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={totals.discount}
                        onChange={(e) =>
                          handleTotalChange(
                            "discount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
                <div className="px-4 sm:px-6 py-3.5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2.5">
                    <IndianRupee className="w-4 h-4 text-indigo-600" />
                    Bill Summary
                  </h4>
                </div>
                <div className="p-4 sm:p-6 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Sub Total</span>
                    <span className="font-medium text-gray-800">
                      ₹{totals.subTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">CGST (9%)</span>
                    <span className="font-medium text-gray-800">
                      ₹{totals.cgst.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">SGST (9%)</span>
                    <span className="font-medium text-gray-800">
                      ₹{totals.sgst.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total GST</span>
                    <span className="font-medium text-gray-800">
                      ₹{totals.gstTotal.toFixed(2)}
                    </span>
                  </div>
                  {totals.transportation > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Transportation</span>
                      <span className="font-medium text-gray-800">
                        ₹{totals.transportation.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totals.otherCharges > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Other Charges</span>
                      <span className="font-medium text-gray-800">
                        ₹{totals.otherCharges.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totals.discount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-red-600">
                      <span>Discount</span>
                      <span>-₹{totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-indigo-200">
                    <span className="text-lg font-bold text-gray-900">
                      Grand Total
                    </span>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                      ₹{totals.grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 text-right mt-1">
                    Includes all taxes
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] sm:text-xs text-gray-500">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>* Required fields</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="cursor-pointer px-3 sm:px-5 py-2 text-sm text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReport}
                  className="cursor-pointer px-3 sm:px-5 py-2 text-sm text-white font-medium rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Save className="w-4 h-4 shrink-0 cursor-pointer" />
                  <span className="hidden md:inline">Save Report</span>
                  <span className="md:hidden">Report</span>
                </button>
                <button
                  className="cursor-pointer px-3 sm:px-5 py-2 text-sm text-white font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap"
                  onClick={Savebill}
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span className="md:hidden">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Preview */}
      <div className="hidden" ref={printRef}>
        <PrintPreview />
      </div>
    </>
  );
};

export default NewInvoicePopup;