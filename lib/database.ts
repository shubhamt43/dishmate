// Enhanced database with multiple users and proper order flow
interface DatabaseUser {
  id: number
  username: string
  password: string
  role: "admin" | "supplier" | "vendor"
  name: string
  location: string
  email?: string
  phone?: string
  businessType?: string
  joinDate: string
  status: "active" | "suspended" | "pending"
}

interface DatabaseItem {
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

interface DatabaseOrder {
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

// Mock database with multiple users
const mockDatabase = {
  users: [
    {
      id: 1,
      username: "admin",
      password: "admin123",
      role: "admin",
      name: "Platform Administrator",
      location: "Mumbai, Maharashtra",
      email: "admin@streetfoodconnect.com",
      joinDate: "2024-01-01",
      status: "active",
    },
    {
      id: 2,
      username: "supplier1",
      password: "supplier123",
      role: "supplier",
      name: "Raj Wholesale Supplies",
      location: "Crawford Market, Mumbai",
      email: "raj@rajwholesale.com",
      phone: "+91 98765 43210",
      businessType: "Wholesale Vegetables & Spices",
      joinDate: "2024-01-15",
      status: "active",
    },
    {
      id: 3,
      username: "supplier2",
      password: "supplier123",
      role: "supplier",
      name: "Mumbai Fresh Mart",
      location: "Dadar Market, Mumbai",
      email: "info@mumbaifresh.com",
      phone: "+91 98765 43211",
      businessType: "Fresh Produce & Grains",
      joinDate: "2024-01-10",
      status: "active",
    },
    {
      id: 4,
      username: "vendor1",
      password: "vendor123",
      role: "vendor",
      name: "Ramesh Street Food",
      location: "Juhu Beach, Mumbai",
      email: "ramesh@streetfood.com",
      phone: "+91 98765 43212",
      businessType: "Pav Bhaji & Vada Pav",
      joinDate: "2024-01-20",
      status: "active",
    },
    {
      id: 5,
      username: "vendor2",
      password: "vendor123",
      role: "vendor",
      name: "Priya's Chaat Corner",
      location: "Marine Drive, Mumbai",
      email: "priya@chaatcorner.com",
      phone: "+91 98765 43213",
      businessType: "Chaat & Bhel Puri",
      joinDate: "2024-01-22",
      status: "active",
    },
    {
      id: 6,
      username: "vendor3",
      password: "vendor123",
      role: "vendor",
      name: "Arjun's Biryani Hub",
      location: "Bandra West, Mumbai",
      email: "arjun@biryanihub.com",
      phone: "+91 98765 43214",
      businessType: "Biryani & Rice Dishes",
      joinDate: "2024-01-25",
      status: "active",
    },
  ] as DatabaseUser[],

  materials: [
    {
      id: 1,
      name: "Onions",
      nameHindi: "प्याज",
      category: "Vegetables",
      price: 25,
      available: 500,
      unit: "kg",
      supplierId: 2,
      supplierName: "Raj Wholesale Supplies",
      description: "Fresh red onions from Nashik",
      lastUpdated: "2024-01-27",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      name: "Tomatoes",
      nameHindi: "टमाटर",
      category: "Vegetables",
      price: 40,
      available: 80,
      unit: "kg",
      supplierId: 2,
      supplierName: "Raj Wholesale Supplies",
      description: "Fresh tomatoes from Pune",
      lastUpdated: "2024-01-27",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 3,
      name: "Potatoes",
      nameHindi: "आलू",
      category: "Vegetables",
      price: 20,
      available: 300,
      unit: "kg",
      supplierId: 3,
      supplierName: "Mumbai Fresh Mart",
      description: "Quality potatoes from Maharashtra",
      lastUpdated: "2024-01-26",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 4,
      name: "Basmati Rice",
      nameHindi: "बासमती चावल",
      category: "Grains",
      price: 80,
      available: 200,
      unit: "kg",
      supplierId: 3,
      supplierName: "Mumbai Fresh Mart",
      description: "Premium basmati rice",
      lastUpdated: "2024-01-27",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 5,
      name: "Turmeric Powder",
      nameHindi: "हल्दी पाउडर",
      category: "Spices",
      price: 200,
      available: 30,
      unit: "kg",
      supplierId: 2,
      supplierName: "Raj Wholesale Supplies",
      description: "Pure turmeric powder from Karnataka",
      lastUpdated: "2024-01-27",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 6,
      name: "Cooking Oil",
      nameHindi: "खाना पकाने का तेल",
      category: "Oil & Condiments",
      price: 120,
      available: 50,
      unit: "liters",
      supplierId: 3,
      supplierName: "Mumbai Fresh Mart",
      description: "Refined sunflower oil",
      lastUpdated: "2024-01-27",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 7,
      name: "Green Chilies",
      nameHindi: "हरी मिर्च",
      category: "Vegetables",
      price: 60,
      available: 25,
      unit: "kg",
      supplierId: 2,
      supplierName: "Raj Wholesale Supplies",
      description: "Fresh green chilies",
      lastUpdated: "2024-01-27",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 8,
      name: "Ginger",
      nameHindi: "अदरक",
      category: "Spices",
      price: 80,
      available: 40,
      unit: "kg",
      supplierId: 2,
      supplierName: "Raj Wholesale Supplies",
      description: "Fresh ginger root",
      lastUpdated: "2024-01-27",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 9,
      name: "Garlic",
      nameHindi: "लहसुन",
      category: "Spices",
      price: 100,
      available: 35,
      unit: "kg",
      supplierId: 3,
      supplierName: "Mumbai Fresh Mart",
      description: "Fresh garlic cloves",
      lastUpdated: "2024-01-27",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 10,
      name: "Bread",
      nameHindi: "ब्रेड",
      category: "Bakery",
      price: 25,
      available: 100,
      unit: "packets",
      supplierId: 2,
      supplierName: "Raj Wholesale Supplies",
      description: "Fresh bread packets",
      lastUpdated: "2024-01-27",
      image: "/placeholder.svg?height=100&width=100",
    },
  ] as DatabaseItem[],

  orders: [] as DatabaseOrder[],
}

// Database functions
export const authenticateUser = async (
  username: string,
  password: string,
  role: string,
): Promise<DatabaseUser | null> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockDatabase.users.find((u) => u.username === username && u.password === password && u.role === role) || null
}

export const getAllUsers = async (): Promise<DatabaseUser[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockDatabase.users
}

export const searchMaterialsByName = async (searchTerm: string): Promise<DatabaseItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const results = mockDatabase.materials.filter(
    (item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.nameHindi.includes(searchTerm),
  )
  return results
}

export const getMaterialById = async (id: number): Promise<DatabaseItem | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockDatabase.materials.find((item) => item.id === id) || null
}

export const getAllMaterials = async (): Promise<DatabaseItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockDatabase.materials
}

export const getMaterialsBySupplier = async (supplierId: number): Promise<DatabaseItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockDatabase.materials.filter((item) => item.supplierId === supplierId)
}

export const createOrder = async (
  orderData: Omit<DatabaseOrder, "id" | "orderDate" | "estimatedDelivery">,
): Promise<DatabaseOrder> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newOrder: DatabaseOrder = {
    ...orderData,
    id: Math.max(...mockDatabase.orders.map((o) => o.id), 0) + 1,
    orderDate: new Date().toISOString().split("T")[0],
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }

  mockDatabase.orders.push(newOrder)

  // Update stock quantities
  newOrder.items.forEach((item) => {
    const material = mockDatabase.materials.find((m) => m.id === item.materialId)
    if (material) {
      material.available = Math.max(0, material.available - item.quantity)
    }
  })

  return newOrder
}

export const getOrdersByVendor = async (vendorId: number): Promise<DatabaseOrder[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockDatabase.orders.filter((order) => order.vendorId === vendorId)
}

export const getOrdersBySupplier = async (supplierId: number): Promise<DatabaseOrder[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockDatabase.orders.filter((order) => order.supplierId === supplierId)
}

export const updateOrderStatus = async (orderId: number, status: DatabaseOrder["status"]): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const order = mockDatabase.orders.find((o) => o.id === orderId)
  if (order) {
    order.status = status
    return true
  }
  return false
}

export const updateMaterial = async (materialId: number, updates: Partial<DatabaseItem>): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const materialIndex = mockDatabase.materials.findIndex((m) => m.id === materialId)
  if (materialIndex !== -1) {
    mockDatabase.materials[materialIndex] = { ...mockDatabase.materials[materialIndex], ...updates }
    return true
  }
  return false
}
