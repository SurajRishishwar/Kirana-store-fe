import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Printer, Calendar, Loader2 } from "lucide-react";
import { useSales } from "@/hooks/useSales";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const Sales = () => {
  /* ===================== STATE & REFS ===================== */
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const billRef = useRef<HTMLDivElement>(null);

  /* ===================== DATA ===================== */
  const { data: salesData, isLoading, isError, error } = useSales({
    page: currentPage,
    size: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...dateRange,
  });

  const sales = salesData?.content || [];

  /* ===================== HELPERS ===================== */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
      case "PARTIAL":
        return <Badge className="bg-yellow-100 text-yellow-700">Partial</Badge>;
      case "CREDIT":
      case "PENDING":
        return <Badge className="bg-red-100 text-red-700">Credit</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  /* ===================== PRINT HANDLER ===================== */
  const handlePrint = async (sale: any) => {
    setSelectedSale(sale);

    // wait for DOM render
    setTimeout(async () => {
      if (!billRef.current) return;

      const canvas = await html2canvas(billRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill-${sale.billNumber}.pdf`);
    }, 1000);
  };

  /* ===================== LOADING / ERROR ===================== */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600">
        {error instanceof Error ? error.message : "Failed to load sales"}
      </div>
    );
  }

  /* ===================== RENDER ===================== */
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Sales</h1>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input className="pl-9" placeholder="Search..." />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Credit</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sales.map((sale: any) => (
              <TableRow key={sale.id}>
                <TableCell className="font-mono">{sale.billNumber}</TableCell>
                <TableCell>{formatDate(sale.createdAt)}</TableCell>
                <TableCell>{sale.customer?.name || "Walk-in"}</TableCell>
                <TableCell>₹{sale.totalAmount.toFixed(2)}</TableCell>
                <TableCell className="text-green-600">₹{sale.amountPaid.toFixed(2)}</TableCell>
                <TableCell className="text-yellow-600">₹{sale.creditAmount.toFixed(2)}</TableCell>
                <TableCell>{sale.paymentMethod}</TableCell>
                <TableCell>{getStatusBadge(sale.paymentStatus)}</TableCell>

                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePrint(sale)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    <div style={{ position: "absolute", left: "-9999px" }}>
  {selectedSale && (
    <div
      ref={billRef}
      style={{
        width: "420px",
        background: "#ffffff",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        color: "#333",
        border: "2px solid #0f766e",
      }}
    >
      {/* ===== HEADER ===== */}
      <div style={{ textAlign: "center", borderBottom: "2px dashed #0f766e", paddingBottom: 10 }}>
        <img
          src="/logo.png"   // <-- put your logo here
          alt="Store Logo"
          style={{ height: 50, marginBottom: 8 }}
        />
        <h1 style={{ margin: 0, color: "#0f766e" }}>MY LOCAL STORE</h1>
        <p style={{ margin: "4px 0", fontSize: 12 }}>
          Main Road, City • 📞 9876543210
        </p>
        <p style={{ fontSize: 11 }}>GSTIN: 29ABCDE1234F1Z5</p>
      </div>

      {/* ===== BILL INFO ===== */}
      <div style={{ marginTop: 10, fontSize: 12 }}>
        <p><strong>Bill No:</strong> {selectedSale.billNumber}</p>
        <p><strong>Date:</strong> {formatDate(selectedSale.createdAt)}</p>
        <p><strong>Customer:</strong> {selectedSale.customer?.name || "Walk-in Customer"}</p>
      </div>

      {/* ===== ITEMS TABLE ===== */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 12,
          fontSize: 12,
        }}
      >
        <thead>
          <tr style={{ background: "#0f766e", color: "#fff" }}>
            <th style={{ padding: 6, textAlign: "left" }}>Item</th>
            <th style={{ padding: 6 }}>Qty</th>
            <th style={{ padding: 6 }}>Rate</th>
            <th style={{ padding: 6 }}>Disc</th>
            <th style={{ padding: 6 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {selectedSale.items.map((item: any) => (
            <tr key={item.productId} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: 6 }}>{item.productName}</td>
              <td style={{ padding: 6, textAlign: "center" }}>{item.quantity}</td>
              <td style={{ padding: 6, textAlign: "right" }}>₹{item.unitPrice}</td>
              <td style={{ padding: 6, textAlign: "right" }}>₹{item.discount}</td>
              <td style={{ padding: 6, textAlign: "right", fontWeight: 600 }}>
                ₹{item.lineTotal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== TOTALS ===== */}
      <div style={{ marginTop: 12, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span>₹{selectedSale.subtotal}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Discount</span>
          <span>- ₹{selectedSale.discountAmount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Tax</span>
          <span>₹{selectedSale.taxAmount}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            padding: 8,
            background: "#ecfeff",
            fontWeight: "bold",
            borderTop: "2px solid #0f766e",
          }}
        >
          <span>GRAND TOTAL</span>
          <span>₹{selectedSale.totalAmount}</span>
        </div>

        <div style={{ marginTop: 6 }}>
          <p><strong>Paid:</strong> ₹{selectedSale.amountPaid}</p>
          <p><strong>Credit:</strong> ₹{selectedSale.creditAmount}</p>
          <p><strong>Payment Mode:</strong> {selectedSale.paymentMethod}</p>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div
        style={{
          marginTop: 16,
          textAlign: "center",
          borderTop: "2px dashed #0f766e",
          paddingTop: 10,
          fontSize: 12,
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold" }}>
          🙏 Thank you for shopping with us!
        </p>
        <p style={{ margin: 0 }}>Visit Again</p>
        <p style={{ fontSize: 10, marginTop: 4 }}>
          * Goods once sold cannot be returned *
        </p>
      </div>
    </div>
  )}
</div>

    </div>
  );
};

export default Sales;
