"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Save, Trash2, FileText, FolderOpen, Check, Edit2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Cheque {
  id: string
  emetteur: string
  codeBanque: string
  numCheque: string
  montant: number
  numFacture: string
  client: string
  editing?: boolean
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
  const [isOpenBordereauOpen, setIsOpenBordereauOpen] = useState(false)
  const [destination, setDestination] = useState("")
  const [sendingDate, setSendingDate] = useState("")
  const [bordereauIdToOpen, setBordereauIdToOpen] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const createNewBordereau = () => {
    if (!destination || !sendingDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
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
    setIsEditing(false)

    toast({
      title: "Succès",
      description: "Nouveau bordereau créé avec succès",
    })
  }

  const addNewCheque = () => {
    if (!currentBordereau) return

    const newCheque: Cheque = {
      id: String(currentBordereau.cheques.length + 1).padStart(2, "0"),
      emetteur: "",
      codeBanque: "",
      numCheque: "",
      montant: 0,
      numFacture: "",
      client: "",
      editing: true // Mark as editing when first added
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
            title: "Saisie invalide",
            description: `Veuillez saisir uniquement des chiffres pour ${field === "codeBanque" ? "Code Banque" : "N° Chèque"}`,
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
            title: "Saisie invalide",
            description: "Veuillez saisir un nombre valide pour le Montant",
            variant: "destructive",
          });
          return;
        }
        
        // Convert directly to number without any additional processing
        value = Number(cleanValue);
      }
      // Other fields (emetteur, numFacture, client) don't need special validation
    }

    setCurrentBordereau({
      ...currentBordereau,
      cheques: currentBordereau.cheques.map((cheque) => {
        if (cheque.id === chequeId) {
          // Create a complete cheque object with default values for any missing properties
          const updatedCheque = {
            id: cheque.id || '',
            emetteur: cheque.emetteur || '',
            codeBanque: cheque.codeBanque || '',
            numCheque: cheque.numCheque || '',
            montant: typeof cheque.montant === 'number' ? cheque.montant : 0,
            numFacture: cheque.numFacture || '',
            client: cheque.client || '',
            // Mark as editing when modified
            editing: true,
            // Update the specific field
            [field]: value
          };
          return updatedCheque;
        }
        return cheque;
      }),
    })
  }

  const deleteCheque = (chequeId: string) => {
    if (!currentBordereau) return

    setCurrentBordereau({
      ...currentBordereau,
      cheques: currentBordereau.cheques.filter((cheque) => cheque.id !== chequeId),
    })
  }
  
  const editCheque = (chequeId: string) => {
    if (!currentBordereau) return
    
    // Update the cheque to enable editing mode
    setCurrentBordereau({
      ...currentBordereau,
      cheques: currentBordereau.cheques.map((cheque) => {
        if (cheque.id === chequeId) {
          return {
            ...cheque,
            editing: true
          }
        }
        return cheque
      }),
    })
  }

  const confirmCheque = (chequeId: string) => {
    if (!currentBordereau) return
    
    // Validate the cheque data before confirming
    const chequeToConfirm = currentBordereau.cheques.find(cheque => cheque.id === chequeId)
    
    if (!chequeToConfirm) return
    
    // Check if required fields are filled
    if (!chequeToConfirm.emetteur || !chequeToConfirm.codeBanque || 
        !chequeToConfirm.numCheque || chequeToConfirm.montant <= 0) {
      toast({
        title: "Validation échouée",
        description: "Veuillez remplir tous les champs obligatoires (émetteur, code banque, numéro de chèque, montant)",
        variant: "destructive",
      })
      return
    }
    
    // Update the cheque to remove editing mode
    setCurrentBordereau({
      ...currentBordereau,
      cheques: currentBordereau.cheques.map((cheque) => {
        if (cheque.id === chequeId) {
          return {
            ...cheque,
            editing: false
          }
        }
        return cheque
      }),
    })
    
    toast({
      title: "Succès",
      description: "Chèque confirmé avec succès",
    })
  }

  const openBordereau = () => {
    if (!bordereauIdToOpen.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir l'identifiant du bordereau",
        variant: "destructive",
      })
      return
    }

    // Load from localStorage (in a real app, this would be loaded from SQLite database)
    const savedBordereaux = JSON.parse(localStorage.getItem("bordereaux") || "[]")
    const bordereau = savedBordereaux.find((b: Bordereau) => b.id === bordereauIdToOpen.trim())

    if (!bordereau) {
      toast({
        title: "Erreur",
        description: "Bordereau non trouvé",
        variant: "destructive",
      })
      return
    }

    // Ensure all bordereau and cheque properties have defined values
    const processedBordereau: Bordereau = {
      id: bordereau.id || '',
      destination: bordereau.destination || '',
      sendingDate: bordereau.sendingDate || '',
      createdDate: bordereau.createdDate || '',
      user: bordereau.user || '',
      cheques: Array.isArray(bordereau.cheques) 
        ? bordereau.cheques.map((cheque: { id: any; emetteur: any; codeBanque: any; numCheque: any; montant: any; numFacture: any; client: any }) => ({
            id: cheque?.id || '',
            emetteur: cheque?.emetteur || '',
            codeBanque: cheque?.codeBanque || '',
            numCheque: cheque?.numCheque || '',
            montant: typeof cheque?.montant === 'number' ? cheque.montant : 0,
            numFacture: cheque?.numFacture || '',
            client: cheque?.client || '',
            editing: false // Ensure existing cheques are not in editing mode when opened
          }))
        : []
    }
    
    setCurrentBordereau(processedBordereau)
    setIsOpenBordereauOpen(false)
    setBordereauIdToOpen("")
    setIsEditing(true)

    toast({
      title: "Succès",
      description: "Bordereau ouvert avec succès",
    })
  }

  const saveBordereau = () => {
    if (!currentBordereau) return

    // Ensure all properties are properly defined before saving
    // Check if any cheques are still in editing mode
    const hasEditingCheques = currentBordereau.cheques.some(cheque => cheque.editing);
    
    if (hasEditingCheques) {
      toast({
        title: "Attention",
        description: "Certains chèques sont en cours d'édition. Veuillez les confirmer avant d'enregistrer.",
        variant: "destructive",
      })
      return;
    }
    
    const processedBordereau: Bordereau = {
      id: currentBordereau.id || '',
      destination: currentBordereau.destination || '',
      sendingDate: currentBordereau.sendingDate || '',
      createdDate: currentBordereau.createdDate || '',
      user: currentBordereau.user || '',
      cheques: Array.isArray(currentBordereau.cheques) 
        ? currentBordereau.cheques.map(cheque => ({
            id: cheque?.id || '',
            emetteur: cheque?.emetteur || '',
            codeBanque: cheque?.codeBanque || '',
            numCheque: cheque?.numCheque || '',
            montant: typeof cheque?.montant === 'number' ? cheque.montant : 0,
            numFacture: cheque?.numFacture || '',
            client: cheque?.client || ''
            // We don't save the editing state to storage
          }))
        : []
    }

    // Save to localStorage (in a real app, this would be saved to SQLite database)
    const savedBordereaux = JSON.parse(localStorage.getItem("bordereaux") || "[]")
    
    if (isEditing) {
      // Update existing bordereau
      const updatedBordereaux = savedBordereaux.map((b: Bordereau) => 
        b.id === processedBordereau.id ? processedBordereau : b
      )
      localStorage.setItem("bordereaux", JSON.stringify(updatedBordereaux))
      
      toast({
        title: "Succès",
        description: "Bordereau mis à jour avec succès",
      })
    } else {
      // Add new bordereau
      savedBordereaux.push(processedBordereau)
      localStorage.setItem("bordereaux", JSON.stringify(savedBordereaux))
      
      toast({
        title: "Succès",
        description: "Bordereau enregistré avec succès",
      })
    }

    setCurrentBordereau(null)
    setIsEditing(false)
  }

  const totalMontant = currentBordereau && Array.isArray(currentBordereau.cheques) 
    ? currentBordereau.cheques.reduce((sum, cheque) => {
        if (!cheque) return sum;
        return sum + (typeof cheque.montant === 'number' ? cheque.montant : 0);
      }, 0) 
    : 0

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Bordereaux</h2>
        <div className="flex space-x-2">
          {/* Dialog for creating a new bordereau */}
          <Dialog open={isNewBordereauOpen} onOpenChange={setIsNewBordereauOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsNewBordereauOpen(true)} className="hidden">
                Créer un Nouveau Bordereau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un Nouveau Bordereau</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Saisir la destination"
                  />
                </div>
                <div>
                  <Label htmlFor="sendingDate">Date d'envoi</Label>
                  <Input
                    id="sendingDate"
                    type="date"
                    value={sendingDate}
                    onChange={(e) => setSendingDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={createNewBordereau}>Créer le Bordereau</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog for opening an existing bordereau */}
          <Dialog open={isOpenBordereauOpen} onOpenChange={setIsOpenBordereauOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ouvrir un Bordereau Existant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bordereauId">Identifiant du Bordereau</Label>
                  <Input
                    id="bordereauId"
                    value={bordereauIdToOpen}
                    onChange={(e) => setBordereauIdToOpen(e.target.value)}
                    placeholder="Saisir l'identifiant du bordereau (ex: BDR-1234567890)"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={openBordereau}>Ouvrir le Bordereau</Button>
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
                {isEditing ? "Mettre à jour le Bordereau" : "Enregistrer le Bordereau"}
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
                    <TableHead>Nom de l'émetteur</TableHead>
                    <TableHead>Code Banque</TableHead>
                    <TableHead>N° Chèque</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Client</TableHead>
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
                          value={cheque.emetteur || ''}
                          onChange={(e) => updateCheque(cheque.id, "emetteur", e.target.value)}
                          placeholder="Nom de l'émetteur"
                          readOnly={!cheque.editing}
                          className={!cheque.editing ? "bg-gray-50" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={cheque.codeBanque || ''}
                          onChange={(e) => updateCheque(cheque.id, "codeBanque", e.target.value)}
                          placeholder="Code Banque"
                          readOnly={!cheque.editing}
                          className={!cheque.editing ? "bg-gray-50" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={cheque.numCheque || ''}
                          onChange={(e) => updateCheque(cheque.id, "numCheque", e.target.value)}
                          placeholder="N° Chèque"
                          readOnly={!cheque.editing}
                          className={!cheque.editing ? "bg-gray-50" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={typeof cheque.montant === 'number' ? String(cheque.montant) : '0'}
                          onChange={(e) => updateCheque(cheque.id, "montant", e.target.value)}
                          placeholder="Montant"
                          inputMode="decimal"
                          readOnly={!cheque.editing}
                          className={!cheque.editing ? "bg-gray-50" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={cheque.numFacture || ''}
                          onChange={(e) => updateCheque(cheque.id, "numFacture", e.target.value)}
                          placeholder="N° Facture"
                          readOnly={!cheque.editing}
                          className={!cheque.editing ? "bg-gray-50" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={cheque.client || ''}
                          onChange={(e) => updateCheque(cheque.id, "client", e.target.value)}
                          placeholder="Client"
                          readOnly={!cheque.editing}
                          className={!cheque.editing ? "bg-gray-50" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!cheque.editing ? (
                            <Button size="sm" variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => editCheque(cheque.id)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => confirmCheque(cheque.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => deleteCheque(cheque.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {currentBordereau.cheques.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun chèque ajouté. Cliquez sur le bouton + pour ajouter un nouveau chèque.
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun Bordereau Sélectionné</h3>
              <p className="text-gray-500 mb-4">Créez un nouveau bordereau ou ouvrez un bordereau existant</p>
              <div className="flex justify-center space-x-4">
                <Dialog open={isNewBordereauOpen} onOpenChange={setIsNewBordereauOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un Nouveau Bordereau
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Dialog open={isOpenBordereauOpen} onOpenChange={setIsOpenBordereauOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Ouvrir un Bordereau
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
