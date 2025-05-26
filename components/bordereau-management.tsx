"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Save, Trash2, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Cheque {
  id: string
  codeBanque: string
  numCheque: string
  info: string
  montant: number
}

interface Bordereau {
  id: string
  destination: string
  sendingDate: string
  createdDate: string
  user: string
  cheques: Cheque[]
}

interface BordereauManagementProps {
  currentUser: string
}

export default function BordereauManagement({ currentUser }: BordereauManagementProps) {
  const [currentBordereau, setCurrentBordereau] = useState<Bordereau | null>(null)
  const [isNewBordereauOpen, setIsNewBordereauOpen] = useState(false)
  const [destination, setDestination] = useState("")
  const [sendingDate, setSendingDate] = useState("")
  const [editingCheque, setEditingCheque] = useState<string | null>(null)

  const createNewBordereau = () => {
    if (!destination || !sendingDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const newBordereau: Bordereau = {
      id: `BDR-${Date.now()}`,
      destination,
      sendingDate,
      createdDate: new Date().toISOString().split("T")[0],
      user: currentUser,
      cheques: [],
    }

    setCurrentBordereau(newBordereau)
    setIsNewBordereauOpen(false)
    setDestination("")
    setSendingDate("")

    toast({
      title: "Success",
      description: "New Bordereau created successfully",
    })
  }

  const addNewCheque = () => {
    if (!currentBordereau) return

    const newCheque: Cheque = {
      id: String(currentBordereau.cheques.length + 1).padStart(2, "0"),
      codeBanque: "",
      numCheque: "",
      info: "",
      montant: 0,
    }

    setCurrentBordereau({
      ...currentBordereau,
      cheques: [...currentBordereau.cheques, newCheque],
    })
  }

  const updateCheque = (chequeId: string, field: keyof Cheque, value: string | number) => {
    if (!currentBordereau) return

    // Handle different field validations
    if (typeof value === "string") {
      if (field === "codeBanque" || field === "numCheque") {
        // For code banque and num cheque, only allow numbers
        const numericValue = value.replace(/[^0-9]/g, "");
        
        if (value !== numericValue) {
          toast({
            title: "Invalid Input",
            description: `Please enter only numbers for ${field === "codeBanque" ? "Code Banque" : "Num Cheque"}`,
            variant: "destructive",
          });
        }
        
        value = numericValue;
      } 
      else if (field === "montant") {
        // For montant field, validate that it's a number with possible decimal places
        // First, clean the input by removing any non-numeric characters except decimal point
        // Also replace comma with dot for decimal handling
        const cleanValue = value.replace(/[^0-9.,]/g, "").replace(",", ".");
        
        // If the value is not a valid number, don't update
        if (isNaN(Number(cleanValue))) {
          toast({
            title: "Invalid Input",
            description: "Please enter a valid number for Montant",
            variant: "destructive",
          });
          return;
        }
        
        // Convert directly to number without any additional processing
        value = Number(cleanValue);
      }
    }

    setCurrentBordereau({
      ...currentBordereau,
      cheques: currentBordereau.cheques.map((cheque) =>
        cheque.id === chequeId ? { ...cheque, [field]: value } : cheque,
      ),
    })
  }

  const deleteCheque = (chequeId: string) => {
    if (!currentBordereau) return

    setCurrentBordereau({
      ...currentBordereau,
      cheques: currentBordereau.cheques.filter((cheque) => cheque.id !== chequeId),
    })
  }

  const saveBordereau = () => {
    if (!currentBordereau) return

    // Save to localStorage (in a real app, this would be saved to SQLite database)
    const savedBordereaux = JSON.parse(localStorage.getItem("bordereaux") || "[]")
    savedBordereaux.push(currentBordereau)
    localStorage.setItem("bordereaux", JSON.stringify(savedBordereaux))

    toast({
      title: "Success",
      description: "Bordereau saved successfully",
    })

    setCurrentBordereau(null)
  }

  const totalMontant = currentBordereau?.cheques.reduce((sum, cheque) => sum + cheque.montant, 0) || 0

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bordereau Management</h2>
        <div className="flex space-x-2">
          <Dialog open={isNewBordereauOpen} onOpenChange={setIsNewBordereauOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsNewBordereauOpen(true)} className="hidden">
                Create New Bordereau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Bordereau</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter destination"
                  />
                </div>
                <div>
                  <Label htmlFor="sendingDate">Sending Date</Label>
                  <Input
                    id="sendingDate"
                    type="date"
                    value={sendingDate}
                    onChange={(e) => setSendingDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={createNewBordereau}>Create Bordereau</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {currentBordereau && (
            <>
              <Button size="sm" onClick={addNewCheque} className="rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={saveBordereau} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Bordereau
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Current Bordereau */}
      {currentBordereau ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Bordereau: {currentBordereau.id}</span>
              <div className="text-sm font-normal text-gray-600">
                Destination: {currentBordereau.destination} | Date: {currentBordereau.sendingDate}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Code Banque</TableHead>
                    <TableHead>Num Cheque</TableHead>
                    <TableHead>Info</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBordereau.cheques.map((cheque) => (
                    <TableRow key={cheque.id}>
                      <TableCell>{cheque.id}</TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={cheque.codeBanque}
                          onChange={(e) => updateCheque(cheque.id, "codeBanque", e.target.value)}
                          placeholder="Code Banque"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={cheque.numCheque}
                          onChange={(e) => updateCheque(cheque.id, "numCheque", e.target.value)}
                          placeholder="Num Cheque"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={cheque.info}
                          onChange={(e) => updateCheque(cheque.id, "info", e.target.value)}
                          placeholder="Info"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={String(cheque.montant)}
                          onChange={(e) => updateCheque(cheque.id, "montant", e.target.value)}
                          placeholder="Montant"
                          inputMode="decimal"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => deleteCheque(cheque.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {currentBordereau.cheques.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No cheques added yet. Click the + button to add a new cheque.
                </div>
              )}

              {currentBordereau.cheques.length > 0 && (
                <div className="flex justify-end">
                  <div className="text-lg font-semibold">Total: {totalMontant}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bordereau Selected</h3>
              <p className="text-gray-500 mb-4">Create a new Bordereau to get started</p>
              <Dialog open={isNewBordereauOpen} onOpenChange={setIsNewBordereauOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Bordereau
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
