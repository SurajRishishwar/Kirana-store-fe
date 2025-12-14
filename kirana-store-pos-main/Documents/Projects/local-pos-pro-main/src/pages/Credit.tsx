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
import { Search, CreditCard, Phone, Calendar, Loader2 } from "lucide-react";
import { useOutstandingAccounts, useTotalOutstanding } from "@/hooks/useCredit";

const Credit = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: creditAccounts = [], isLoading, isError, error } = useOutstandingAccounts();
  const { data: totalCredit = 0 } = useTotalOutstanding();

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
          <p className="text-destructive font-medium">Failed to load credit accounts</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // Filter credit accounts based on search query
  const filteredAccounts = searchQuery
    ? creditAccounts.filter((account) =>
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : creditAccounts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit Management</h1>
          <p className="text-muted-foreground">
            Track and manage outstanding credit (udhaar)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Outstanding</p>
          <p className="text-3xl font-bold text-warning">₹{totalCredit.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Sort by Date
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No customers found" : "No outstanding credit"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {account.phone || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning font-medium">
                      ₹{account.creditBalance.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {account.updatedAt ? new Date(account.updatedAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{account.totalPurchases} txns</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                      <Button variant="ghost" size="sm">
                        View History
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

export default Credit;
