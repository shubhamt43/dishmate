"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Shield, Package, ChefHat, Users, Star } from "lucide-react"
import { authenticateUser } from "@/lib/database"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const user = await authenticateUser(username, password, selectedRole)

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        router.push(`/${user.role}`)
      } else {
        setError("गलत लॉगिन जानकारी या भूमिका मेल नहीं खाती / Invalid credentials or role mismatch")
      }
    } catch (error) {
      setError("लॉगिन में त्रुटि / Login error")
    } finally {
      setIsLoading(false)
    }
  }

  const roleData = {
    admin: {
      icon: Shield,
      title: "Admin",
      subtitle: "प्रशासक",
      description: "Platform security & management",
      color: "bg-red-50 border-red-200 text-red-700",
      users: "1 admin user",
    },
    supplier: {
      icon: Package,
      title: "Supplier",
      subtitle: "आपूर्तिकर्ता",
      description: "Wholesale raw materials",
      color: "bg-blue-50 border-blue-200 text-blue-700",
      users: "2 supplier accounts",
    },
    vendor: {
      icon: ChefHat,
      title: "Street Food Vendor",
      subtitle: "स्ट्रीट फूड विक्रेता",
      description: "Street food business",
      color: "bg-green-50 border-green-200 text-green-700",
      users: "3 vendor accounts",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Street Food Connect</CardTitle>
          <CardDescription className="text-base">
            स्ट्रीट फूड कनेक्ट - विश्वसनीय कच्चे माल के लिए
            <br />
            <span className="text-sm text-gray-500">Connecting street food vendors with trusted suppliers</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">अपनी भूमिका चुनें / Select Your Role</Label>
            <div className="grid gap-3">
              {Object.entries(roleData).map(([key, data]) => {
                const Icon = data.icon
                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                      selectedRole === key ? data.color + " shadow-md" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedRole(key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6" />
                        <div className="flex-1">
                          <p className="font-medium">{data.title}</p>
                          <p className="text-sm text-gray-600">{data.subtitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{data.description}</p>
                          <p className="text-xs text-blue-600 font-medium">{data.users}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">उपयोगकर्ता नाम / Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">पासवर्ड / Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={!username || !password || !selectedRole || isLoading}
            >
              {isLoading ? "लॉग इन हो रहे हैं... / Signing In..." : "लॉग इन करें / Sign In"}
            </Button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-600" />
              <p className="text-sm font-medium text-gray-700">डेमो अकाउंट्स / Demo Accounts:</p>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-red-700 mb-1">Admin:</p>
                <p>admin / admin123</p>
              </div>
              <div>
                <p className="font-medium text-blue-700 mb-1">Suppliers:</p>
                <p>supplier1 / supplier123 (Raj Wholesale)</p>
                <p>supplier2 / supplier123 (Mumbai Fresh Mart)</p>
              </div>
              <div>
                <p className="font-medium text-green-700 mb-1">Vendors:</p>
                <p>vendor1 / vendor123 (Ramesh Street Food)</p>
                <p>vendor2 / vendor123 (Priya's Chaat Corner)</p>
                <p>vendor3 / vendor123 (Arjun's Biryani Hub)</p>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <Shield className="h-6 w-6 mx-auto text-red-500" />
                <p className="text-xs text-gray-600">Multi-User Platform</p>
              </div>
              <div className="space-y-1">
                <Package className="h-6 w-6 mx-auto text-blue-500" />
                <p className="text-xs text-gray-600">Real-time Orders</p>
              </div>
              <div className="space-y-1">
                <Star className="h-6 w-6 mx-auto text-yellow-500" />
                <p className="text-xs text-gray-600">Recipe Calculator</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
