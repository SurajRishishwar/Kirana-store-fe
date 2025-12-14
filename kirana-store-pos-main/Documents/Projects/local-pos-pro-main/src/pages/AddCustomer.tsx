import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { CustomerRequest } from "@/services/customerService";

export default function AddCustomer() {
  const addCustomer = useCreateCustomer();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    creditLimit: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const payload: CustomerRequest = {
      name: form.name,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      creditLimit: form.creditLimit
        ? Number(form.creditLimit)
        : undefined,
    };

    addCustomer.mutate(payload);
    console.log("Customer Payload:", payload);
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-4">Add Customer</h1>

      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            <div>
              <Label>Customer Name</Label>
              <Input
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                name="phone"
                placeholder="9876543210"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="customer@mail.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                name="address"
                placeholder="Street address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Credit Limit</Label>
              <Input
                name="creditLimit"
                type="number"
                placeholder="1000"
                value={form.creditLimit}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="mt-2">
              Save Customer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
