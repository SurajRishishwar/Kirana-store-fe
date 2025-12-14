import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store preferences and configuration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            Basic information about your store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" placeholder="My Kirana Store" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-phone">Contact Number</Label>
            <Input id="store-phone" placeholder="9876543210" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-address">Address</Label>
            <Input id="store-address" placeholder="Street address" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Preferences</CardTitle>
          <CardDescription>
            Configure default billing settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency Symbol</Label>
            <Input id="currency" defaultValue="₹" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax">Default Tax Rate (%)</Label>
            <Input id="tax" type="number" defaultValue="5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-stock">Default Minimum Stock Level</Label>
            <Input id="min-stock" type="number" defaultValue="10" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Settings</CardTitle>
          <CardDescription>
            Configure printed receipt preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receipt-header">Receipt Header Text</Label>
            <Input id="receipt-header" placeholder="Thank you for shopping with us!" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt-footer">Receipt Footer Text</Label>
            <Input id="receipt-footer" placeholder="Visit again!" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
