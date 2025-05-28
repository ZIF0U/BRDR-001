"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Cheque {
  id: string
  emetteur: string
  codeBanque: string
  numCheque: string
  montant: number
  numFacture: string
  client: string
}

interface Bordereau {
  id: string
  destination: string
  sendingDate: string
  createdDate: string
  user: string
  cheques: Cheque[]
}

export default function HistoryInterface() {
  const [bordereaux, setBordereaux] = useState<Bordereau[]>([])
  const [filteredBordereaux, setFilteredBordereaux] = useState<Bordereau[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("bordereau")
  const [selectedBordereau, setSelectedBordereau] = useState<Bordereau | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    // Load bordereaux from localStorage
    const savedBordereaux = JSON.parse(localStorage.getItem("bordereaux") || "[]")
    setBordereaux(savedBordereaux)
    setFilteredBordereaux(savedBordereaux)
  }, [])

  useEffect(() => {
    // Filter bordereaux based on search
    if (!searchTerm) {
      setFilteredBordereaux(bordereaux)
      return
    }

    const filtered = bordereaux.filter((bordereau) => {
      if (searchType === "bordereau") {
        return (
          bordereau.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bordereau.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bordereau.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bordereau.createdDate.includes(searchTerm) ||
          bordereau.sendingDate.includes(searchTerm)
        )
      } else {
        // Search in cheques
        return bordereau.cheques.some(
          (cheque) =>
            cheque.emetteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cheque.codeBanque.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cheque.numCheque.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cheque.montant.toString().includes(searchTerm) ||
            cheque.numFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cheque.client.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }
    })

    setFilteredBordereaux(filtered)
  }, [searchTerm, searchType, bordereaux])

  const exportToPDF = (bordereau: Bordereau) => {
    // In a real app, this would generate a PDF
    toast({
      title: "Exportation",
      description: `L'exportation PDF pour ${bordereau.id} serait générée ici`,
    })
  }

  const exportToExcel = (bordereau: Bordereau) => {
    // In a real app, this would generate an Excel file
    toast({
      title: "Exportation",
      description: `L'exportation Excel pour ${bordereau.id} serait générée ici`,
    })
  }

  const viewDetails = (bordereau: Bordereau) => {
    setSelectedBordereau(bordereau)
    setIsDetailOpen(true)
  }

  const getTotalMontant = (bordereau: Bordereau) => {
    return bordereau.cheques.reduce((sum, cheque) => sum + cheque.montant, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Historique</h2>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Recherche & Filtrage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Saisissez un terme de recherche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bordereau">Rechercher Bordereau</SelectItem>
                <SelectItem value="cheque">Rechercher Chèques</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Bordereaux ({filteredBordereaux.length} trouvés)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBordereaux.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Date d'envoi</TableHead>
                  <TableHead>Nombre de chèques</TableHead>
                  <TableHead>Montant total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBordereaux.map((bordereau) => (
                  <TableRow key={bordereau.id}>
                    <TableCell className="font-medium">{bordereau.id}</TableCell>
                    <TableCell>{bordereau.user}</TableCell>
                    <TableCell>{bordereau.destination}</TableCell>
                    <TableCell>{bordereau.createdDate}</TableCell>
                    <TableCell>{bordereau.sendingDate}</TableCell>
                    <TableCell>{bordereau.cheques.length}</TableCell>
                    <TableCell>{getTotalMontant(bordereau).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => viewDetails(bordereau)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => exportToPDF(bordereau)}>
                          PDF
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => exportToExcel(bordereau)}>
                          XLS
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {bordereaux.length === 0
                ? "Aucun bordereau trouvé. Créez d'abord des bordereaux."
                : "Aucun résultat trouvé pour votre recherche."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails du Bordereau: {selectedBordereau?.id}</DialogTitle>
          </DialogHeader>
          {selectedBordereau && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Utilisateur:</strong> {selectedBordereau.user}
                </div>
                <div>
                  <strong>Destination:</strong> {selectedBordereau.destination}
                </div>
                <div>
                  <strong>Créé le:</strong> {selectedBordereau.createdDate}
                </div>
                <div>
                  <strong>Date d'envoi:</strong> {selectedBordereau.sendingDate}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Chèques</h4>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBordereau.cheques.map((cheque) => (
                      <TableRow key={cheque.id}>
                        <TableCell>{cheque.id}</TableCell>
                        <TableCell>{cheque.emetteur}</TableCell>
                        <TableCell>{cheque.codeBanque}</TableCell>
                        <TableCell>{cheque.numCheque}</TableCell>
                        <TableCell>{cheque.montant.toFixed(2)}</TableCell>
                        <TableCell>{cheque.numFacture}</TableCell>
                        <TableCell>{cheque.client}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end mt-4">
                  <div className="text-lg font-semibold">Total: {getTotalMontant(selectedBordereau).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
