"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BordereauManagement from "@/components/bordereau-management"
import HistoryInterface from "@/components/history-interface"
import { LogOut, FileText, History, Bell } from "lucide-react"

interface MainAppProps {
  currentUser: string
  onLogout: () => void
}

export default function MainApp({ currentUser, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("management")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestionnaire de Bordereaux</h1>
              <p className="text-sm text-gray-500">Bienvenue, {currentUser}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="management" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Gestion des Bordereaux</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Historique</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="mt-6">
            <BordereauManagement currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryInterface />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
