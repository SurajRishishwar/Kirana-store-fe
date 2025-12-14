import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateProduct } from "@/hooks/useProducts";
import { ProductRequest } from "@/services/productService";

export default function AddProduct() {
  const addProduct=useCreateProduct();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    costPrice: "",
    stockQuantity: "",
    minStockLevel:"",
    unit:"",
    barcode: "",
    expiryDate: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload:ProductRequest={
        name:form.name,
        description:form.description,
        category: form.category,
        price: Number(form.price),
        costPrice: form.costPrice ? Number(form.costPrice) : undefined,
        stockQuantity: Number(form.stockQuantity),
        barcode: form.barcode,
        expiryDate: form.expiryDate,
        unit:form.unit,
        minStockLevel:Number(form.minStockLevel)

    }
    addProduct.mutate(payload);
    console.log(form);

  };

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-4">Add Product</h1>
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Product Name</Label>
              <Input
                name="name"
                placeholder="Enter product name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                name="description"
                placeholder="Short description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Price</Label>
              <Input
                name="price"
                type="number"
                placeholder="30.00"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Cost Price</Label>
              <Input
                name="costPrice"
                type="number"
                placeholder="12"
                value={form.costPrice}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Stock Quantity</Label>
              <Input
                name="stockQuantity"
                type="number"
                placeholder="50"
                value={form.stockQuantity}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Minimum Stock Level</Label>
              <Input
                name="minStockLevel"
                type="number"
                placeholder="50"
                value={form.minStockLevel}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Unit</Label>
              <Input
                name="unit"
                placeholder="50"
                value={form.unit}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Barcode</Label>
              <Input
                name="barcode"
                placeholder="Enter barcode"
                value={form.barcode}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Expiry Date</Label>
              <Input
                name="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="mt-2">Save Product</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}