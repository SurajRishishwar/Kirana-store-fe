import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  Receipt,
  CreditCard,
  Package,
  Users,
  AlertTriangle,
  Calendar,
  Loader2,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";

const Dashboard = () => {
  const { data: dashboardData, isLoading, isError, error } = useDashboard();

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
          <p className="text-destructive font-medium">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // const lowStockItems = dashboardData?.alerts.lowStockProducts || [];
  // const expiringItems = dashboardData?.alerts.expiringProducts || [];
  const lowStockItems = dashboardData?.alerts?.lowStockProducts || [];
  const expiringItems = dashboardData?.alerts?.expiringProducts || [];


  // Helper to calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store's performance today
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Today's Sales"
          value={`₹${dashboardData?.todaySales?.totalAmount.toLocaleString() || 0}`}
          icon={IndianRupee}
          trend={`${dashboardData?.todaySales?.billsCount || 0} transactions`}
          className="lg:col-span-1"
        />
        <StatCard
          title="Bills Count"
          value={`${dashboardData?.todaySales?.billsCount || 0}`}
          icon={Receipt}
          trend={`Cash: ${dashboardData?.todaySales?.cashSales.toLocaleString() || 0}`}
          className="lg:col-span-1"
        />
        <StatCard
          title="Credit Outstanding"
          value={`₹${dashboardData?.creditOutstanding?.totalAmount?.toLocaleString() || 0}`}
          icon={CreditCard}
          trend={`${dashboardData?.creditOutstanding?.customersCount || 0} customers`}
          className="lg:col-span-1"
        />
        <StatCard
          title="Active Products"
          value={`${dashboardData?.inventory?.activeProducts || 0}`}
          icon={Package}
          trend={`${dashboardData?.inventory?.lowStockCount || 0} low stock`}
          className="lg:col-span-1"
        />
        <StatCard
          title="Total Customers"
          value={`${dashboardData?.customers?.total || 0}`}
          icon={Users}
          trend={`${dashboardData?.customers?.newThisWeek || 0} new this month`}
          className="lg:col-span-1"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All items are well stocked
                </p>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.stockQuantity} {item.unit} left (min: {item.minStockLevel})
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                      Low Stock
                    </Badge>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full mt-2">
                View All Products
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-destructive" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items expiring soon
                </p>
              ) : (
                expiringItems.map((item) => {
                  const daysLeft = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : 0;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          daysLeft <= 1
                            ? "bg-destructive/10 text-destructive border-destructive"
                            : "bg-warning/10 text-warning border-warning"
                        }
                      >
                        {daysLeft}d left
                      </Badge>
                    </div>
                  );
                })
              )}
              <Button variant="outline" className="w-full mt-2">
                View Expiring Items
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
