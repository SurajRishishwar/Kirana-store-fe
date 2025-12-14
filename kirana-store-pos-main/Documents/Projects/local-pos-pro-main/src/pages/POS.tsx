import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Minus, Trash2, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useCreateSale } from "@/hooks/useSales";
import type { Product } from "@/services/productService";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}
const WALK_IN = "WALK_IN";


const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "CREDIT" | "PARTIAL">("CASH");
  const [amountPaid, setAmountPaid] = useState("");

  // Fetch products and customers
  const { data: productsData } = useProducts({ search: searchQuery || undefined, size: 50 });
  const { data: customersData } = useCustomers({ size: 100 });
  const createSale = useCreateSale();

  const products = productsData?.content || [];
  const customers = customersData?.content || [];

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = cart.reduce(
    (sum, item) => sum + (item.discount || 0) * item.quantity,
    0
  );
  const tax = 0; // No tax calculation in API
  const total = subtotal - totalDiscount;

  // Quick products (first 6 products)
  const quickProducts = products.slice(0, 6);

  // Cart operations
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          discount: 0,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId(undefined);
    setPaymentMethod("CASH");
    setAmountPaid("");
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      return;
    }

    const saleData = {
      customerId: selectedCustomerId,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        discount: item.discount,
      })),
      paymentMethod,
      amountPaid: parseFloat(amountPaid) || total,
    };

    await createSale.mutateAsync(saleData);
    clearCart();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">Quick checkout and billing</p>
        </div>
        <Select
  value={selectedCustomerId ?? WALK_IN}
  onValueChange={(value) => {
    if (value === WALK_IN) {
      setSelectedCustomerId(undefined);
    } else {
      setSelectedCustomerId(value);
    }
  }}
>
  <SelectTrigger className="w-[250px]">
    <SelectValue placeholder="Select Customer (Optional)" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value={WALK_IN}>Walk-in Customer</SelectItem>

    {customers.map((customer) => (
      <SelectItem key={customer.id} value={customer.id}>
        {customer.name} - {customer.phone}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: Product Search & Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Scan barcode or search by name..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              {searchQuery && products.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                  {products.slice(0, 10).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stockQuantity}</p>
                      </div>
                      <span className="font-medium">₹{product.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Add</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {quickProducts.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => addToCart(product)}
                  >
                    <span className="font-medium text-sm">{product.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ₹{product.price}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Cart & Checkout */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Current Bill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Cart is empty
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <Separator />

            {/* Bill Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-₹{totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="CREDIT">Credit (Udhaar)</SelectItem>
                  <SelectItem value="PARTIAL">Partial Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount Paid</label>
              <Input
                type="number"
                placeholder={total.toFixed(2)}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={clearCart}>
                Clear Cart
              </Button>
              <Button
                className="flex-1"
                onClick={handleCheckout}
                disabled={cart.length === 0 || createSale.isPending}
              >
                {createSale.isPending ? "Processing..." : "Complete Sale"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POS;