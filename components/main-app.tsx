"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BordereauManagement from "@/components/bordereau-management"
import HistoryInterface from "@/components/history-interface"
import { LogOut, FileText, History, Bell } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface MainAppProps {
  currentUser: string
  onLogout: () => void
}

export default function MainApp({ currentUser, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("management")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"tab-change" | "logout" | null>(null)
  const [pendingTabValue, setPendingTabValue] = useState<string | null>(null)
  
  // Handle tab change with unsaved changes check
  const handleTabChange = (value: string) => {
    // Only check for unsaved changes when navigating away from the management tab
    if (hasUnsavedChanges && activeTab === "management" && value !== activeTab) {
      // Store the pending tab change and show confirmation dialog
      setPendingTabValue(value);
      setPendingAction("tab-change");
      setShowConfirmDialog(true);
    } else {
      // No unsaved changes or not navigating away from management, proceed with tab change
      setActiveTab(value);
    }
  };
  
  // Handle logout with unsaved changes check
  const handleLogout = () => {
    // Only check for unsaved changes when in the management tab
    if (hasUnsavedChanges && activeTab === "management") {
      // Store the pending logout action and show confirmation dialog
      setPendingAction("logout");
      setShowConfirmDialog(true);
    } else {
      // No unsaved changes or not in management tab, proceed with logout
      onLogout();
    }
  };
  
  // Reference to the BordereauManagement component
  const bordereauRef = useRef<{ saveBordereau?: () => void }>(null);
  
  // Handle confirmation dialog actions
  const handleConfirm = () => {
    setShowConfirmDialog(false);
    
    if (pendingAction === "tab-change" && pendingTabValue) {
      setActiveTab(pendingTabValue);
    } else if (pendingAction === "logout") {
      onLogout();
    }
    
    // Reset pending actions
    setPendingAction(null);
    setPendingTabValue(null);
  };
  
  // Handle save and continue
  const handleSaveAndContinue = () => {
    // First save the bordereau
    if (activeTab === "management") {
      // Call the saveBordereau method on the BordereauManagement component
      // This will be implemented in the next step
    }
    
    setShowConfirmDialog(false);
    
    // Then continue with the pending action
    if (pendingAction === "tab-change" && pendingTabValue) {
      setActiveTab(pendingTabValue);
    } else if (pendingAction === "logout") {
      onLogout();
    }
    
    // Reset pending actions
    setPendingAction(null);
    setPendingTabValue(null);
  };
  
  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
    setPendingTabValue(null);
  };

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
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
            <BordereauManagement 
              currentUser={currentUser} 
              onUnsavedChanges={setHasUnsavedChanges} 
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryInterface />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Confirmation Dialog for Unsaved Changes */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Modifications non enregistrées"
        description="Vous avez des modifications non enregistrées. Que souhaitez-vous faire ?"
        confirmText="Continuer sans enregistrer"
        cancelText="Annuler"
        saveText="Enregistrer et continuer"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onSave={handleSaveAndContinue}
        showSaveOption={activeTab === "management"}
      />
    </div>
  )
}
