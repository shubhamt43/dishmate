"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit,
  IndianRupee,
  ShoppingCart,
  CheckCircle,
  X,
  Clock,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { getMaterialsBySupplier, getOrdersBySupplier, updateOrderStatus, updateMaterial } from "@/lib/database"

interface StockItem {
  id: number
  name: string
  nameHindi: string
  category: string
  quantity: number
  unit: string
  price: number
  minStock: number
  status: "in-stock" | "low-stock" | "out-of-stock"
  description: string
  lastUpdated: string
  image?: string
}

interface Order {
  id: number
  vendorId: number
  vendorName: string
  supplierId: number
  supplierName: string
  items: { materialId: number; materialName: string; quantity: number; price: number; total: number }[]
  totalAmount: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "rejected"
  orderDate: string
  estimatedDelivery: string
  orderType: "individual" | "recipe"
  recipeInfo?: {
    recipeName: string
    servings: number
  }
  notes?: string
}

export default function SupplierDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      if (userData.role !== "supplier") {
        router.push("/")
        return
      }
      setUser(userData)
      loadData(userData.id)
    } else {
      router.push("/")
    }
  }, [router])

  const loadData = async (supplierId: number) => {
    try {
      setLoading(true)
      const [materialsData, ordersData] = await Promise.all([
        getMaterialsBySupplier(supplierId),
        getOrdersBySupplier(supplierId),
      ])

      // Convert materials to stock items format
      const stockData = materialsData.map((material) => ({
        id: material.id,
        name: material.name,
        nameHindi: material.nameHindi,
        category: material.category,
        quantity: material.available,
        unit: material.unit,
        price: material.price,
        minStock: 50, // Default min stock
        status: material.available > 50 ? "in-stock" : material.available > 0 ? "low-stock" : "out-of-stock",
        description: material.description,
        lastUpdated: material.lastUpdated,
        image: material.image,
      })) as StockItem[]

      setStockItems(stockData)
      setOrders(ordersData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const handleSaveItem = async () => {
    if (editingItem) {
      try {
        if (editingItem.id === 0) {
          // Add new item logic would go here
          const newItem = {
            ...editingItem,
            id: Math.max(...stockItems.map((item) => item.id)) + 1,
            status:
              editingItem.quantity > editingItem.minStock
                ? "in-stock"
                : editingItem.quantity > 0
                  ? "low-stock"
                  : "out-of-stock",
            lastUpdated: new Date().toISOString().split("T")[0],
          } as StockItem
          setStockItems((prev) => [...prev, newItem])
        } else {
          // Update existing item
          const success = await updateMaterial(editingItem.id, {
            price: editingItem.price,
            available: editingItem.quantity,
            description: editingItem.description,
            lastUpdated: new Date().toISOString().split("T")[0],
          })

          if (success) {
            setStockItems((prev) =>
              prev.map((item) =>
                item.id === editingItem.id
                  ? {
                      ...editingItem,
                      status:
                        editingItem.quantity > editingItem.minStock
                          ? "in-stock"
                          : editingItem.quantity > 0
                            ? "low-stock"
                            : "out-of-stock",
                      lastUpdated: new Date().toISOString().split("T")[0],
                    }
                  : item,
              ),
            )
          }
        }
        setEditingItem(null)
        setIsDialogOpen(false)
      } catch (error) {
        console.error("Error saving item:", error)
      }
    }
  }

  const handleOrderAction = async (orderId: number, action: "confirm" | "reject") => {
    setProcessingOrderId(orderId)
    try {
      const newStatus = action === "confirm" ? "confirmed" : "rejected"
      const success = await updateOrderStatus(orderId, newStatus)

      if (success) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
      }
    } catch (error) {
      console.error("Error updating order:", error)
    } finally {
      setProcessingOrderId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "default"
      case "low-stock":
        return "secondary"
      case "out-of-stock":
        return "destructive"
      default:
        return "default"
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "processing":
        return "default"
      case "shipped":
        return "default"
      case "delivered":
        return "default"
      case "rejected":
        return "destructive"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const stats = {
    totalItems: stockItems.length,
    lowStock: stockItems.filter((item) => item.status === "low-stock").length,
    outOfStock: stockItems.filter((item) => item.status === "out-of-stock").length,
    totalValue: stockItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    totalOrders: orders.length,
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={handleLogout} />

      <div className="container mx-auto p-4 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600">स्टॉक और ऑर्डर प्रबंधन / Stock and order management - {user.name}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-sm text-gray-600">Total Items</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{stats.lowStock}</p>
                <p className="text-sm text-gray-600">Low Stock</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
                <p className="text-sm text-gray-600">Out of Stock</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <IndianRupee className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                <p className="text-sm text-gray-600">Pending Orders</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">New Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Orders</CardTitle>
                <CardDescription>आने वाले ऑर्डर प्रबंधित करें / Manage incoming orders from vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders
                    .filter((order) => order.status === "pending")
                    .map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">Order #{order.id}</h4>
                              <Badge variant="secondary">NEW ORDER</Badge>
                              {order.orderType === "recipe" && <Badge variant="outline">Recipe Order</Badge>}
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>From:</strong> {order.vendorName}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Order Date:</strong> {order.orderDate}
                            </p>
                            {order.recipeInfo && (
                              <p className="text-sm text-blue-600">
                                <strong>Recipe:</strong> {order.recipeInfo.recipeName} ({order.recipeInfo.servings}{" "}
                                servings)
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <h5 className="font-medium text-sm">Order Items:</h5>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm bg-white p-2 rounded">
                              <span>
                                {item.materialName} × {item.quantity}
                              </span>
                              <span>₹{item.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOrderAction(order.id, "confirm")}
                            disabled={processingOrderId === order.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingOrderId === order.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Confirm Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOrderAction(order.id, "reject")}
                            disabled={processingOrderId === order.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}

                  {/* All Orders History */}
                  <div className="mt-8">
                    <h4 className="font-medium mb-4">Order History</h4>
                    <div className="space-y-3">
                      {orders
                        .filter((order) => order.status !== "pending")
                        .map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">Order #{order.id}</h4>
                                  <Badge variant={getOrderStatusColor(order.status)}>
                                    {order.status.toUpperCase()}
                                  </Badge>
                                  {order.orderType === "recipe" && <Badge variant="outline">Recipe</Badge>}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {order.vendorName} • {order.orderDate}
                                </p>
                              </div>
                              <span className="font-medium">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No orders received yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Stock Management</CardTitle>
                    <CardDescription>
                      इन्वेंटरी स्तर की निगरानी और अपडेट करें / Monitor and update inventory levels
                    </CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingItem({
                            id: 0,
                            name: "",
                            nameHindi: "",
                            category: "",
                            quantity: 0,
                            unit: "kg",
                            price: 0,
                            minStock: 0,
                            status: "out-of-stock",
                            description: "",
                            lastUpdated: new Date().toISOString().split("T")[0],
                          })
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingItem?.id === 0 ? "Add New Item" : "Edit Item"}</DialogTitle>
                        <DialogDescription>
                          {editingItem?.id === 0
                            ? "नया आइटम जोड़ें / Add a new item to inventory"
                            : "आइटम विवरण अपडेट करें / Update item details"}
                        </DialogDescription>
                      </DialogHeader>
                      {editingItem && (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Item Name (English)</Label>
                              <Input
                                id="name"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="nameHindi">Name (Hindi)</Label>
                              <Input
                                id="nameHindi"
                                value={editingItem.nameHindi}
                                onChange={(e) => setEditingItem({ ...editingItem, nameHindi: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={editingItem.category}
                              onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Vegetables">Vegetables</SelectItem>
                                <SelectItem value="Grains">Grains</SelectItem>
                                <SelectItem value="Spices">Spices</SelectItem>
                                <SelectItem value="Oil & Condiments">Oil & Condiments</SelectItem>
                                <SelectItem value="Dairy">Dairy</SelectItem>
                                <SelectItem value="Bakery">Bakery</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                type="number"
                                value={editingItem.quantity}
                                onChange={(e) =>
                                  setEditingItem({ ...editingItem, quantity: Number.parseInt(e.target.value) || 0 })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="unit">Unit</Label>
                              <Select
                                value={editingItem.unit}
                                onValueChange={(value) => setEditingItem({ ...editingItem, unit: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="liters">liters</SelectItem>
                                  <SelectItem value="pieces">pieces</SelectItem>
                                  <SelectItem value="packets">packets</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="minStock">Min Stock</Label>
                              <Input
                                id="minStock"
                                type="number"
                                value={editingItem.minStock}
                                onChange={(e) =>
                                  setEditingItem({ ...editingItem, minStock: Number.parseInt(e.target.value) || 0 })
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="price">Price (₹ per {editingItem.unit})</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={editingItem.price}
                              onChange={(e) =>
                                setEditingItem({ ...editingItem, price: Number.parseFloat(e.target.value) || 0 })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editingItem.description}
                              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                              placeholder="Brief description of the item"
                            />
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveItem}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="text-sm text-gray-500">({item.nameHindi})</span>
                            <Badge variant="outline" className="w-fit">
                              {item.category}
                            </Badge>
                            <Badge variant={getStatusColor(item.status)} className="w-fit">
                              {item.status.replace("-", " ")}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                            <span>
                              <strong>Qty:</strong> {item.quantity} {item.unit}
                            </span>
                            <span>
                              <strong>Min:</strong> {item.minStock} {item.unit}
                            </span>
                            <span>
                              <strong>Price:</strong> ₹{item.price}/{item.unit}
                            </span>
                            <span>
                              <strong>Updated:</strong> {item.lastUpdated}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Price Management</CardTitle>
                <CardDescription>कच्चे माल के लिए मूल्य निर्धारण अपडेट करें / Update pricing for raw materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {item.name} ({item.nameHindi})
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.category} • Stock: {item.quantity} {item.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">₹{item.price}</p>
                          <p className="text-sm text-gray-600">per {item.unit}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item)
                            setIsDialogOpen(true)
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
