"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Shield, Users, Activity, AlertTriangle, Search, Ban, CheckCircle, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"

interface User {
  id: number
  name: string
  role: string
  location: string
  status: "active" | "suspended" | "pending"
  lastLogin: string
  joinDate: string
  businessType?: string
}

interface SecurityAlert {
  id: number
  type: "spam" | "fraud" | "suspicious" | "violation"
  user: string
  description: string
  severity: "high" | "medium" | "low"
  timestamp: string
  status: "open" | "resolved"
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Raj Wholesale Supplies",
      role: "supplier",
      location: "Crawford Market, Mumbai",
      status: "active",
      lastLogin: "2 hours ago",
      joinDate: "2024-01-15",
      businessType: "Wholesale Vegetables & Spices",
    },
    {
      id: 2,
      name: "Ramesh Street Food",
      role: "vendor",
      location: "Juhu Beach, Mumbai",
      status: "active",
      lastLogin: "30 minutes ago",
      joinDate: "2024-01-20",
      businessType: "Pav Bhaji & Vada Pav",
    },
    {
      id: 3,
      name: "Sharma Provisions",
      role: "supplier",
      location: "Dadar Market, Mumbai",
      status: "pending",
      lastLogin: "Never",
      joinDate: "2024-01-25",
      businessType: "Grains & Pulses",
    },
    {
      id: 4,
      name: "Mumbai Chaat Corner",
      role: "vendor",
      location: "Marine Drive, Mumbai",
      status: "suspended",
      lastLogin: "1 week ago",
      joinDate: "2024-01-10",
      businessType: "Chaat & Bhel Puri",
    },
  ])

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: 1,
      type: "spam",
      user: "Mumbai Chaat Corner",
      description: "Multiple fake orders placed to manipulate supplier stock",
      severity: "high",
      timestamp: "2 hours ago",
      status: "open",
    },
    {
      id: 2,
      type: "suspicious",
      user: "Unknown User",
      description: "Multiple failed login attempts from same IP",
      severity: "medium",
      timestamp: "4 hours ago",
      status: "open",
    },
    {
      id: 3,
      type: "fraud",
      user: "Fake Supplier XYZ",
      description: "Attempting to register with fake documents",
      severity: "high",
      timestamp: "1 day ago",
      status: "resolved",
    },
  ])

  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      if (userData.role !== "admin") {
        router.push("/")
        return
      }
      setUser(userData)
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const handleUserAction = (userId: number, action: "suspend" | "activate" | "approve") => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: action === "suspend" ? "suspended" : action === "approve" ? "active" : "active",
            }
          : user,
      ),
    )
  }

  const handleAlertAction = (alertId: number, action: "resolve" | "dismiss") => {
    setSecurityAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status: "resolved" } : alert)))
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.businessType?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    pendingApprovals: users.filter((u) => u.status === "pending").length,
    securityAlerts: securityAlerts.filter((a) => a.status === "open").length,
    suppliers: users.filter((u) => u.role === "supplier").length,
    vendors: users.filter((u) => u.role === "vendor").length,
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={handleLogout} />

      <div className="container mx-auto p-4 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">प्लेटफॉर्म सुरक्षा और उपयोगकर्ता प्रबंधन / Platform security and user management</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold">{stats.securityAlerts}</p>
                <p className="text-sm text-gray-600">Alerts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{stats.suppliers}</p>
                <p className="text-sm text-gray-600">Suppliers</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{stats.vendors}</p>
                <p className="text-sm text-gray-600">Vendors</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="security" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>सुरक्षा चेतावनियां और स्पैम रोकथाम / Security alerts and spam prevention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            alert.severity === "high"
                              ? "destructive"
                              : alert.severity === "medium"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{alert.type}</Badge>
                        <span className="text-sm text-gray-500">{alert.timestamp}</span>
                      </div>
                      <p className="font-medium">{alert.user}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {alert.status === "open" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleAlertAction(alert.id, "resolve")}>
                            Resolve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAlertAction(alert.id, "dismiss")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {alert.status === "resolved" && <Badge variant="default">Resolved</Badge>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      उपयोगकर्ता खाते और अनुमतियां प्रबंधित करें / Manage user accounts and permissions
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge variant="outline" className="w-fit">
                            {user.role}
                          </Badge>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : user.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="w-fit"
                          >
                            {user.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Location:</strong> {user.location}
                          </p>
                          <p>
                            <strong>Business:</strong> {user.businessType}
                          </p>
                          <p>
                            <strong>Last Login:</strong> {user.lastLogin} • <strong>Joined:</strong> {user.joinDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {user.status === "pending" && (
                          <Button size="sm" onClick={() => handleUserAction(user.id, "approve")}>
                            Approve
                          </Button>
                        )}
                        {user.status === "active" && (
                          <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, "suspend")}>
                            <Ban className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                        {user.status === "suspended" && (
                          <Button size="sm" onClick={() => handleUserAction(user.id, "activate")}>
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>
                    प्लेटफॉर्म उपयोग और प्रदर्शन मेट्रिक्स / Platform usage and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">User Growth</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">This Month</span>
                          <span className="text-sm font-medium">+12 users</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Transaction Volume</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Daily Average</span>
                          <span className="text-sm font-medium">₹45,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Popular Categories</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Vegetables & Spices</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Grains & Pulses</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Oil & Condiments</span>
                          <span className="font-medium">25%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Regional Distribution</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Mumbai</span>
                          <span className="font-medium">60%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delhi</span>
                          <span className="font-medium">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bangalore</span>
                          <span className="font-medium">15%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
