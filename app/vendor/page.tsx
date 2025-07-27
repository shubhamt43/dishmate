"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ShoppingCart,
  Clock,
  Plus,
  IndianRupee,
  Package,
  Search,
  Loader2,
  CheckCircle,
  Truck,
  AlertCircle,
  ChefHat,
  Calculator,
  Sparkles,
  TrendingUp,
  Star,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { searchMaterialsByName, getAllMaterials, createOrder, getOrdersByVendor } from "@/lib/database"

interface Material {
  id: number
  name: string
  nameHindi: string
  category: string
  price: number
  available: number
  unit: string
  supplierId: number
  supplierName: string
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
  items: {
    materialId: number
    materialName: string
    quantity: number
    price: number
    total: number
  }[]
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

interface RecipeIngredient {
  name: string
  nameHindi: string
  quantity: number
  unit: string
  materialId?: number
  price?: number
  available?: number
  totalCost?: number
  canFulfill?: boolean
  supplierId?: number
  supplierName?: string
}

interface RecipeEstimate {
  recipeName: string
  recipeNameHindi: string
  desiredServings: number
  ingredients: RecipeIngredient[]
  totalCost: number
  canMakeAll: boolean
  profitMargin?: number
  suggestedPrice?: number
}

export default function VendorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [materials, setMaterials] = useState<Material[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Enhanced Recipe Estimator States
  const [recipeName, setRecipeName] = useState("")
  const [recipeNameHindi, setRecipeNameHindi] = useState("")
  const [desiredServings, setDesiredServings] = useState(10)
  const [profitMargin, setProfitMargin] = useState(50) // 50% profit margin
  const [ingredientInputs, setIngredientInputs] = useState([{ name: "", nameHindi: "", quantity: 0, unit: "kg" }])
  const [recipeEstimate, setRecipeEstimate] = useState<RecipeEstimate | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false)

  // Order States
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      if (userData.role !== "vendor") {
        router.push("/")
        return
      }
      setUser(userData)
      loadData(userData.id)
    } else {
      router.push("/")
    }
  }, [router])

  const loadData = async (vendorId: number) => {
    try {
      setLoading(true)
      const [materialsData, ordersData] = await Promise.all([getAllMaterials(), getOrdersByVendor(vendorId)])
      setMaterials(materialsData)
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

  const addIngredientInput = () => {
    setIngredientInputs([...ingredientInputs, { name: "", nameHindi: "", quantity: 0, unit: "kg" }])
  }

  const removeIngredientInput = (index: number) => {
    if (ingredientInputs.length > 1) {
      setIngredientInputs(ingredientInputs.filter((_, i) => i !== index))
    }
  }

  const updateIngredientInput = (index: number, field: string, value: any) => {
    const updated = [...ingredientInputs]
    updated[index] = { ...updated[index], [field]: value }
    setIngredientInputs(updated)
  }

  const calculateRecipeRequirements = async () => {
    if (!recipeName || ingredientInputs.some((ing) => !ing.name || ing.quantity <= 0)) {
      alert("कृपया रेसिपी का नाम और सभी सामग्री भरें / Please fill recipe name and all ingredients")
      return
    }

    setIsCalculating(true)
    try {
      const ingredientsWithPrices: RecipeIngredient[] = []

      for (const ingredient of ingredientInputs) {
        const searchResults = await searchMaterialsByName(ingredient.name)
        const material = searchResults.find(
          (m) => m.name.toLowerCase().includes(ingredient.name.toLowerCase()) || m.nameHindi.includes(ingredient.name),
        )

        const ingredientWithPrice: RecipeIngredient = {
          ...ingredient,
          materialId: material?.id,
          price: material?.price || 0,
          available: material?.available || 0,
          totalCost: material ? ingredient.quantity * material.price : 0,
          canFulfill: material ? material.available >= ingredient.quantity : false,
          supplierId: material?.supplierId,
          supplierName: material?.supplierName,
        }

        ingredientsWithPrices.push(ingredientWithPrice)
      }

      const totalCost = ingredientsWithPrices.reduce((sum, ing) => sum + (ing.totalCost || 0), 0)
      const canMakeAll = ingredientsWithPrices.every((ing) => ing.canFulfill)
      const suggestedPrice = totalCost * (1 + profitMargin / 100)

      const estimate: RecipeEstimate = {
        recipeName,
        recipeNameHindi,
        desiredServings,
        ingredients: ingredientsWithPrices,
        totalCost,
        canMakeAll,
        profitMargin,
        suggestedPrice,
      }

      setRecipeEstimate(estimate)
    } catch (error) {
      console.error("Error calculating recipe:", error)
      alert("गणना में त्रुटि / Error in calculation")
    } finally {
      setIsCalculating(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedMaterial || orderQuantity <= 0) return

    setIsPlacingOrder(true)
    try {
      const orderData = {
        vendorId: user.id,
        vendorName: user.name,
        supplierId: selectedMaterial.supplierId,
        supplierName: selectedMaterial.supplierName,
        items: [
          {
            materialId: selectedMaterial.id,
            materialName: `${selectedMaterial.name} (${selectedMaterial.nameHindi})`,
            quantity: orderQuantity,
            price: selectedMaterial.price,
            total: orderQuantity * selectedMaterial.price,
          },
        ],
        totalAmount: orderQuantity * selectedMaterial.price,
        status: "pending" as const,
        orderType: "individual" as const,
      }

      const newOrder = await createOrder(orderData)
      setOrders((prev) => [newOrder, ...prev])

      setMaterials((prev) =>
        prev.map((material) =>
          material.id === selectedMaterial.id
            ? { ...material, available: Math.max(0, material.available - orderQuantity) }
            : material,
        ),
      )

      setSelectedMaterial(null)
      setOrderQuantity(1)
      setIsOrderDialogOpen(false)

      alert("ऑर्डर सफलतापूर्वक दिया गया! / Order placed successfully!")
    } catch (error) {
      console.error("Error placing order:", error)
      alert("ऑर्डर देने में त्रुटि / Error placing order")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const handleOrderFromRecipe = async () => {
    if (!recipeEstimate || !recipeEstimate.canMakeAll) return

    setIsPlacingOrder(true)
    try {
      // Group items by supplier
      const supplierGroups = recipeEstimate.ingredients
        .filter((ing) => ing.materialId && ing.canFulfill)
        .reduce((groups, ing) => {
          const supplierId = ing.supplierId!
          if (!groups[supplierId]) {
            groups[supplierId] = {
              supplierId,
              supplierName: ing.supplierName!,
              items: [],
            }
          }
          groups[supplierId].items.push({
            materialId: ing.materialId!,
            materialName: `${ing.name} (${ing.nameHindi})`,
            quantity: ing.quantity,
            price: ing.price!,
            total: ing.totalCost!,
          })
          return groups
        }, {} as any)

      // Create separate orders for each supplier
      for (const group of Object.values(supplierGroups) as any[]) {
        const orderData = {
          vendorId: user.id,
          vendorName: user.name,
          supplierId: group.supplierId,
          supplierName: group.supplierName,
          items: group.items,
          totalAmount: group.items.reduce((sum: number, item: any) => sum + item.total, 0),
          status: "pending" as const,
          orderType: "recipe" as const,
          recipeInfo: {
            recipeName: recipeEstimate.recipeName,
            servings: recipeEstimate.desiredServings,
          },
        }

        const newOrder = await createOrder(orderData)
        setOrders((prev) => [newOrder, ...prev])
      }

      // Update local materials
      setMaterials((prev) =>
        prev.map((material) => {
          const ingredient = recipeEstimate.ingredients.find((ing) => ing.materialId === material.id)
          if (ingredient) {
            return { ...material, available: Math.max(0, material.available - ingredient.quantity) }
          }
          return material
        }),
      )

      // Reset recipe form
      setRecipeEstimate(null)
      setRecipeName("")
      setRecipeNameHindi("")
      setIngredientInputs([{ name: "", nameHindi: "", quantity: 0, unit: "kg" }])
      setIsRecipeDialogOpen(false)

      alert("रेसिपी का ऑर्डर सफलतापूर्वक दिया गया! / Recipe order placed successfully!")
    } catch (error) {
      console.error("Error placing recipe order:", error)
      alert("ऑर्डर देने में त्रुटि / Error placing order")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const getStatusColor = (status: string) => {
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
      case "cancelled":
        return "destructive"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      case "rejected":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const categories = ["all", ...Array.from(new Set(materials.map((m) => m.category)))]

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.nameHindi.includes(searchTerm) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    availableMaterials: materials.filter((material) => material.available > 0).length,
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600">कच्चे माल ब्राउज़ करें और ऑर्डर दें / Browse materials and place orders - {user.name}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <IndianRupee className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{stats.availableMaterials}</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="materials" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="recipes">Recipe Estimator</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Raw Materials Catalog</CardTitle>
                    <CardDescription>
                      उपलब्ध सामग्री और वर्तमान कीमतें ब्राउज़ करें / Browse available materials and current prices
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search materials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        {material.image && (
                          <img
                            src={material.image || "/placeholder.svg"}
                            alt={material.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 className="font-medium">{material.name}</h4>
                            <span className="text-sm text-gray-500">({material.nameHindi})</span>
                            <Badge variant="outline" className="w-fit">
                              {material.category}
                            </Badge>
                            {material.available === 0 && (
                              <Badge variant="destructive" className="w-fit">
                                Out of Stock
                              </Badge>
                            )}
                            {material.available > 0 && material.available <= 50 && (
                              <Badge variant="secondary" className="w-fit">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 mb-2">
                            <span>
                              <strong>Price:</strong> ₹{material.price.toFixed(2)}/{material.unit}
                            </span>
                            <span>
                              <strong>Available:</strong> {material.available} {material.unit}
                            </span>
                            <span>
                              <strong>Supplier:</strong> {material.supplierName}
                            </span>
                            <span>
                              <strong>Updated:</strong> {material.lastUpdated}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{material.description}</p>
                        </div>
                      </div>
                      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            disabled={material.available === 0}
                            onClick={() => setSelectedMaterial(material)}
                            className="ml-4"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Order
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Place Order</DialogTitle>
                            <DialogDescription>
                              ऑर्डर दें / Order {selectedMaterial?.name} ({selectedMaterial?.nameHindi}) from{" "}
                              {selectedMaterial?.supplierName}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedMaterial && (
                            <div className="space-y-4">
                              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-3 mb-3">
                                  {selectedMaterial.image && (
                                    <img
                                      src={selectedMaterial.image || "/placeholder.svg"}
                                      alt={selectedMaterial.name}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                  )}
                                  <div>
                                    <h4 className="font-medium">
                                      {selectedMaterial.name} ({selectedMaterial.nameHindi})
                                    </h4>
                                    <p className="text-sm text-gray-600">From: {selectedMaterial.supplierName}</p>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>
                                    <strong>Price:</strong> ₹{selectedMaterial.price.toFixed(2)} per{" "}
                                    {selectedMaterial.unit}
                                  </p>
                                  <p>
                                    <strong>Available:</strong> {selectedMaterial.available} {selectedMaterial.unit}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">{selectedMaterial.description}</p>
                              </div>
                              <div>
                                <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                                  मात्रा / Quantity ({selectedMaterial.unit})
                                </label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  min="1"
                                  max={selectedMaterial.available}
                                  value={orderQuantity}
                                  onChange={(e) => setOrderQuantity(Number.parseInt(e.target.value) || 1)}
                                />
                              </div>
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Order Total:</span>
                                  <span className="text-xl font-bold">
                                    ₹{(orderQuantity * selectedMaterial.price).toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {orderQuantity} {selectedMaterial.unit} × ₹{selectedMaterial.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handlePlaceOrder}
                              className="bg-orange-600 hover:bg-orange-700"
                              disabled={isPlacingOrder}
                            >
                              {isPlacingOrder ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Placing Order...
                                </>
                              ) : (
                                "Place Order"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                  {filteredMaterials.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No materials found matching your search.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes">
            <div className="space-y-6">
              {/* Enhanced Recipe Estimator Header */}
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <ChefHat className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-orange-800">Smart Recipe Calculator</CardTitle>
                      <CardDescription className="text-orange-700">
                        अपनी रेसिपी डालें और स्मार्ट गणना करें / Enter your recipe for intelligent cost calculation
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                      <Calculator className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Auto Price Discovery</p>
                        <p className="text-xs text-gray-600">Real-time market prices</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Profit Calculator</p>
                        <p className="text-xs text-gray-600">Smart pricing suggestions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Multi-Supplier Orders</p>
                        <p className="text-xs text-gray-600">Best price optimization</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recipe Calculator */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Recipe Calculator
                      </CardTitle>
                      <CardDescription>Create detailed cost estimates for your street food recipes</CardDescription>
                    </div>
                    <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                          <Plus className="h-4 w-4 mr-2" />
                          New Recipe
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <ChefHat className="h-6 w-6 text-orange-600" />
                            Smart Recipe Calculator
                          </DialogTitle>
                          <DialogDescription>
                            अपनी रेसिपी की जानकारी भरें और स्मार्ट गणना करें / Fill in your recipe details for smart
                            calculation
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Recipe Basic Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div>
                              <label className="block text-sm font-medium mb-2">Recipe Name (English)</label>
                              <Input
                                value={recipeName}
                                onChange={(e) => setRecipeName(e.target.value)}
                                placeholder="e.g., Pav Bhaji"
                                className="bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Recipe Name (Hindi)</label>
                              <Input
                                value={recipeNameHindi}
                                onChange={(e) => setRecipeNameHindi(e.target.value)}
                                placeholder="e.g., पाव भाजी"
                                className="bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                कितनी मात्रा बनाना चाहते हैं? / How many servings?
                              </label>
                              <Input
                                type="number"
                                min="1"
                                value={desiredServings}
                                onChange={(e) => setDesiredServings(Number.parseInt(e.target.value) || 1)}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">मुनाफा मार्जिन / Profit Margin (%)</label>
                              <Input
                                type="number"
                                min="0"
                                max="200"
                                value={profitMargin}
                                onChange={(e) => setProfitMargin(Number.parseInt(e.target.value) || 50)}
                                className="w-full"
                              />
                            </div>
                          </div>

                          {/* Ingredients */}
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                सामग्री / Ingredients
                              </h4>
                              <Button type="button" onClick={addIngredientInput} size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Ingredient
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {ingredientInputs.map((ingredient, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 border rounded-lg bg-gray-50"
                                >
                                  <Input
                                    placeholder="Item name (English)"
                                    value={ingredient.name}
                                    onChange={(e) => updateIngredientInput(index, "name", e.target.value)}
                                    className="bg-white"
                                  />
                                  <Input
                                    placeholder="नाम (Hindi)"
                                    value={ingredient.nameHindi}
                                    onChange={(e) => updateIngredientInput(index, "nameHindi", e.target.value)}
                                    className="bg-white"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Quantity"
                                    value={ingredient.quantity}
                                    onChange={(e) =>
                                      updateIngredientInput(index, "quantity", Number.parseFloat(e.target.value) || 0)
                                    }
                                    className="bg-white"
                                  />
                                  <select
                                    value={ingredient.unit}
                                    onChange={(e) => updateIngredientInput(index, "unit", e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                                  >
                                    <option value="kg">kg</option>
                                    <option value="liters">liters</option>
                                    <option value="pieces">pieces</option>
                                    <option value="packets">packets</option>
                                  </select>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeIngredientInput(index)}
                                    disabled={ingredientInputs.length === 1}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Calculate Button */}
                          <Button
                            onClick={calculateRecipeRequirements}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            disabled={isCalculating}
                          >
                            {isCalculating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Calculating Smart Estimates...
                              </>
                            ) : (
                              <>
                                <Calculator className="h-4 w-4 mr-2" />
                                Calculate Smart Estimate
                              </>
                            )}
                          </Button>

                          {/* Enhanced Results */}
                          {recipeEstimate && (
                            <div className="space-y-4">
                              {/* Recipe Summary */}
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Star className="h-5 w-5 text-yellow-500" />
                                  {recipeEstimate.recipeName} ({recipeEstimate.recipeNameHindi}) -{" "}
                                  {recipeEstimate.desiredServings} servings
                                </h4>

                                {/* Cost Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div className="text-center p-3 bg-white rounded-lg border">
                                    <p className="text-2xl font-bold text-red-600">
                                      ₹{recipeEstimate.totalCost.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">Total Cost</p>
                                  </div>
                                  <div className="text-center p-3 bg-white rounded-lg border">
                                    <p className="text-2xl font-bold text-green-600">
                                      ₹{recipeEstimate.suggestedPrice?.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">Suggested Price</p>
                                  </div>
                                  <div className="text-center p-3 bg-white rounded-lg border">
                                    <p className="text-2xl font-bold text-blue-600">
                                      ₹
                                      {((recipeEstimate.suggestedPrice || 0) / recipeEstimate.desiredServings).toFixed(
                                        2,
                                      )}
                                    </p>
                                    <p className="text-sm text-gray-600">Per Serving</p>
                                  </div>
                                </div>

                                {/* Ingredients Breakdown */}
                                <div className="space-y-3">
                                  {recipeEstimate.ingredients.map((ingredient, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-3 bg-white rounded border"
                                    >
                                      <div className="flex-1">
                                        <p className="font-medium">
                                          {ingredient.name} ({ingredient.nameHindi})
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Need: {ingredient.quantity} {ingredient.unit}
                                          {ingredient.materialId && (
                                            <>
                                              {" • Available: "}
                                              {ingredient.available} {ingredient.unit}
                                              {" • Price: ₹"}
                                              {ingredient.price}/{ingredient.unit}
                                              {" • From: "}
                                              {ingredient.supplierName}
                                            </>
                                          )}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        {ingredient.materialId ? (
                                          <>
                                            <p className="font-medium">₹{ingredient.totalCost?.toFixed(2)}</p>
                                            <Badge
                                              variant={ingredient.canFulfill ? "default" : "destructive"}
                                              className="text-xs"
                                            >
                                              {ingredient.canFulfill ? "Available" : "Insufficient"}
                                            </Badge>
                                          </>
                                        ) : (
                                          <Badge variant="secondary" className="text-xs">
                                            Not Found in Database
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Business Intelligence */}
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <h5 className="font-medium mb-2 flex items-center gap-2">
                                  <TrendingUp className="h-5 w-5 text-green-600" />
                                  Business Intelligence
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p>
                                      <strong>Cost per serving:</strong> ₹
                                      {(recipeEstimate.totalCost / recipeEstimate.desiredServings).toFixed(2)}
                                    </p>
                                    <p>
                                      <strong>Profit per serving:</strong> ₹
                                      {(
                                        ((recipeEstimate.suggestedPrice || 0) - recipeEstimate.totalCost) /
                                        recipeEstimate.desiredServings
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p>
                                      <strong>Profit margin:</strong> {recipeEstimate.profitMargin}%
                                    </p>
                                    <p>
                                      <strong>Total profit:</strong> ₹
                                      {((recipeEstimate.suggestedPrice || 0) - recipeEstimate.totalCost).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                {recipeEstimate.canMakeAll ? (
                                  <Button
                                    onClick={handleOrderFromRecipe}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                    disabled={isPlacingOrder}
                                  >
                                    {isPlacingOrder ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Placing Orders...
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Order All Materials
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button disabled className="flex-1">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Some Materials Unavailable
                                  </Button>
                                )}
                                <Button variant="outline" onClick={() => setRecipeEstimate(null)}>
                                  Recalculate
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsRecipeDialogOpen(false)
                              setRecipeEstimate(null)
                              setRecipeName("")
                              setRecipeNameHindi("")
                              setIngredientInputs([{ name: "", nameHindi: "", quantity: 0, unit: "kg" }])
                            }}
                          >
                            Close
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Popular Recipe Templates */}
                  <div className="grid gap-4">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Popular Street Food Templates
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          name: "Pav Bhaji",
                          nameHindi: "पाव भाजी",
                          image: "/placeholder.svg?height=120&width=200",
                          ingredients: [
                            { name: "Onions", nameHindi: "प्याज", quantity: 2, unit: "kg" },
                            { name: "Tomatoes", nameHindi: "टमाटर", quantity: 1.5, unit: "kg" },
                            { name: "Potatoes", nameHindi: "आलू", quantity: 1, unit: "kg" },
                            { name: "Cooking Oil", nameHindi: "खाना पकाने का तेल", quantity: 0.5, unit: "liters" },
                            { name: "Bread", nameHindi: "ब्रेड", quantity: 2, unit: "packets" },
                          ],
                          description: "Mumbai's iconic mixed vegetable curry with bread",
                          estimatedCost: "₹180-220",
                        },
                        {
                          name: "Vada Pav",
                          nameHindi: "वड़ा पाव",
                          image: "/placeholder.svg?height=120&width=200",
                          ingredients: [
                            { name: "Potatoes", nameHindi: "आलू", quantity: 2, unit: "kg" },
                            { name: "Onions", nameHindi: "प्याज", quantity: 0.5, unit: "kg" },
                            { name: "Cooking Oil", nameHindi: "खाना पकाने का तेल", quantity: 1, unit: "liters" },
                            { name: "Bread", nameHindi: "ब्रेड", quantity: 2, unit: "packets" },
                            { name: "Green Chilies", nameHindi: "हरी मिर्च", quantity: 0.2, unit: "kg" },
                          ],
                          description: "Mumbai's favorite potato fritter sandwich",
                          estimatedCost: "₹120-160",
                        },
                        {
                          name: "Biryani",
                          nameHindi: "बिरयानी",
                          image: "/placeholder.svg?height=120&width=200",
                          ingredients: [
                            { name: "Basmati Rice", nameHindi: "बासमती चावल", quantity: 2, unit: "kg" },
                            { name: "Onions", nameHindi: "प्याज", quantity: 1, unit: "kg" },
                            { name: "Cooking Oil", nameHindi: "खाना पकाने का तेल", quantity: 0.5, unit: "liters" },
                            { name: "Turmeric Powder", nameHindi: "हल्दी पाउडर", quantity: 0.1, unit: "kg" },
                            { name: "Ginger", nameHindi: "अदरक", quantity: 0.2, unit: "kg" },
                            { name: "Garlic", nameHindi: "लहसुन", quantity: 0.2, unit: "kg" },
                          ],
                          description: "Aromatic rice dish with spices and vegetables",
                          estimatedCost: "₹280-350",
                        },
                      ].map((template, index) => (
                        <Card
                          key={index}
                          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-200"
                        >
                          <CardContent className="p-4">
                            <img
                              src={template.image || "/placeholder.svg"}
                              alt={template.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium">
                                    {template.name} ({template.nameHindi})
                                  </h5>
                                  <p className="text-sm text-gray-600">{template.description}</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm text-gray-500">{template.ingredients.length} ingredients</p>
                                  <p className="text-sm font-medium text-green-600">{template.estimatedCost}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRecipeName(template.name)
                                    setRecipeNameHindi(template.nameHindi)
                                    setIngredientInputs(template.ingredients)
                                    setIsRecipeDialogOpen(true)
                                  }}
                                  className="hover:bg-orange-50 hover:border-orange-300"
                                >
                                  Use Template
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>अपने खरीदारी ऑर्डर ट्रैक करें / Track your purchase orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">Order #{order.id}</h4>
                            <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.toUpperCase()}
                            </Badge>
                            {order.orderType === "recipe" && <Badge variant="outline">Recipe Order</Badge>}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <strong>Order Date:</strong> {order.orderDate}
                            </p>
                            <p>
                              <strong>Estimated Delivery:</strong> {order.estimatedDelivery}
                            </p>
                            <p>
                              <strong>Supplier:</strong> {order.supplierName}
                            </p>
                            {order.recipeInfo && (
                              <p>
                                <strong>Recipe:</strong> {order.recipeInfo.recipeName} ({order.recipeInfo.servings}{" "}
                                servings)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{order.totalAmount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{order.items.length} items</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Order Items:</h5>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <span>
                              {item.materialName} × {item.quantity}
                            </span>
                            <span>₹{item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No orders placed yet.</p>
                      <p className="text-sm text-gray-400">Start browsing materials or use the recipe estimator!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
