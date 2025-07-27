"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, LogOut, Shield, Package, ChefHat, MapPin } from "lucide-react"

interface NavigationProps {
  user: {
    name: string
    role: string
    location?: string
  }
  onLogout: () => void
}

export default function Navigation({ user, onLogout }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Shield
      case "supplier":
        return Package
      case "vendor":
        return ChefHat
      default:
        return Shield
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "supplier":
        return "default"
      case "vendor":
        return "secondary"
      default:
        return "default"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "supplier":
        return "Supplier"
      case "vendor":
        return "Vendor"
      default:
        return role
    }
  }

  const Icon = getRoleIcon(user.role)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-gray-900">Street Food Connect</h1>
                <p className="text-xs text-gray-500">स्ट्रीट फूड कनेक्ट</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-gray-600" />
              <div className="text-right">
                <p className="font-medium text-sm">{user.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleColor(user.role)} className="text-xs">
                    {getRoleDisplayName(user.role)}
                  </Badge>
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{user.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <Badge variant={getRoleColor(user.role)} className="text-xs">
                        {getRoleDisplayName(user.role)}
                      </Badge>
                      {user.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 py-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">
                          Role: {getRoleDisplayName(user.role)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.role === "admin" &&
                            "प्लेटफॉर्म सुरक्षा और उपयोगकर्ता प्रबंधन / Platform security and user management"}
                          {user.role === "supplier" && "स्टॉक और मूल्य प्रबंधन / Stock and price management"}
                          {user.role === "vendor" && "कच्चे माल ब्राउज़ करें और ऑर्डर दें / Browse materials and place orders"}
                        </p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-medium text-sm mb-2">Platform Features</h4>
                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3" />
                            <span>Secure transactions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3" />
                            <span>Real-time inventory</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChefHat className="h-3 w-3" />
                            <span>Trusted suppliers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <Button variant="outline" className="w-full bg-transparent" onClick={onLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
