import { useState, useEffect } from "react";
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
  Hash,
  Calendar as CalendarIcon,
  Building2,
  Receipt,
  IndianRupee,
  Package,
  Percent,
  Truck,
  MoreHorizontal,
  AlertCircle,
  // Printer,
} from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../services/apiService";
// import { PrintPreview } from "../component/BillTable";

const NewInvoicePopup = ({
  onClose,
  billData,
}: {
  onClose: () => void;
  billData: any;
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
    ChooseCompany: "",
    invoiceDate: "",
    customerName: "",
    phone: "",
    email: "",
    gst: "",
    address: "",
    state: "",
    placeOfSupply: "",
  });

  useEffect(() => {
    if (billData?._id) {
      if (billData.customerDetails)
        setCustomerDetails(billData.customerDetails);
      if (billData.items?.length) setItems(billData.items);
      if (billData.totals) setTotals(billData.totals);
    }
  }, [billData]);

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
  const Savebill = async (sendAfterSave = false) => {
    if (
      !customerDetails.customerName ||
      !customerDetails.phone ||
      !customerDetails.address ||
      !customerDetails.state ||
      !customerDetails.invoiceDate
    ) {
      toast.error("Please fill all required customer details.");
      return;
    }
    try {
      const res = await (SavedData
        ? apiService.put<{ message: string }>(`/update-bill/${billData._id}`, {
            customerDetails,
            items,
            totals,
          })
        : apiService.post<{ message: string; id?: string }>("/save-bill", {
            customerDetails,
            items,
            totals,
          }));

      const billId = SavedData ? billData?._id : (res as { id?: string })?.id;

      if (sendAfterSave) {
        if (!billId) {
          toast.error("Bill saved but could not resolve bill id for sending.");
          return;
        }

        const sendRes = await apiService.post<{ message: string }>(
          `/send-bill/${billId}`,
        );
        toast.success(sendRes?.message || "Bill saved and sent successfully!");
      } else {
        toast.success(res?.message || "Bill saved successfully!");
      }

      setSavedData(true);
      onClose();
    } catch (error) {
      console.error("Failed to save bill:", error);
      toast.error(
        sendAfterSave
          ? "Failed to save and send bill. Please try again."
          : "Failed to save bill. Please try again.",
      );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="relative w-full max-w-7xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex-none bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-8 py-5 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Create Invoice
                  </h2>
                  <p className="text-sm text-indigo-100 mt-0.5">
                    Generate a GST compliant invoice for your customer
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-indigo-200/80">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                      Draft
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {new Date().toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      INV-2026-001
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <label className="block text-sm font-medium text-white mb-1.5">
                    Select Company <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white">
                    {companies.map((company: Company) => (
                      <option
                        key={company.id}
                        value={company.id}
                        onClick={() =>
                          handleCustomerChange(
                            "ChooseCompany",
                            company.tradeName || company.legalName,
                          )
                        }
                      >
                        {company.tradeName || company.legalName}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <button className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  <Printer className="w-5 h-5" />
                </button> */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
              <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">
                    Customer Information
                  </h3>
                </div>
                <span className="text-xs text-gray-400">* Required fields</span>
              </div>

              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
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
                  <div className="grid gap-4 grid-cols-2">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
              <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50/50 to-emerald-50/50">
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Invoice Items</h3>
                  <span className="text-xs text-gray-400">
                    ({items.length} items)
                  </span>
                </div>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
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

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
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
                <div className="px-6 py-3.5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2.5">
                    <IndianRupee className="w-4 h-4 text-indigo-600" />
                    Bill Summary
                  </h4>
                </div>
                <div className="p-6 space-y-3">
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
          <div className="flex-none px-8 py-5 border-t border-gray-200 bg-white rounded-b-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                All fields marked with * are required
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => Savebill(false)}
                className="px-6 py-2.5 text-white font-medium rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Report
              </button>
              <button
                className="px-6 py-2.5 text-white font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                onClick={() => Savebill(true)}
              >
                <Send className="w-4 h-4" />
                Save Report & Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewInvoicePopup;
