import { useState } from "react";
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

const Sales = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});

  const { data: salesData, isLoading, isError, error } = useSales({
    page: currentPage,
    size: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...dateRange,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive font-medium">Failed to load sales</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  const sales = salesData?.content || [];

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success">
            Paid
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
            Partial
          </Badge>
        );
      case "CREDIT":
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
            Credit
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">
            View and manage all sales transactions
          </p>
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by bill number or customer..." className="pl-9" />
        </div>
        <Button variant="outline">Today</Button>
        <Button variant="outline">This Week</Button>
        <Button variant="outline">This Month</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill Number</TableHead>
              <TableHead>Date & Time</TableHead>
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
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No sales found
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono font-medium">{sale.billNumber}</TableCell>
                  <TableCell className="text-sm">{formatDate(sale.createdAt)}</TableCell>
                  <TableCell>{sale.customer?.name || "Walk-in"}</TableCell>
                  <TableCell className="font-medium">₹{sale.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-success">₹{sale.amountPaid.toFixed(2)}</TableCell>
                  <TableCell className={sale.creditAmount > 0 ? "text-warning font-medium" : "text-muted-foreground"}>
                    ₹{sale.creditAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>{sale.paymentMethod}</TableCell>
                  <TableCell>{getStatusBadge(sale.paymentStatus)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Sales;
