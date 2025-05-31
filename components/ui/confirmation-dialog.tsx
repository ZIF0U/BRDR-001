"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  saveText?: string
  onConfirm: () => void
  onCancel?: () => void
  onSave?: () => void
  showSaveOption?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Continuer sans enregistrer",
  cancelText = "Annuler",
  saveText = "Enregistrer et continuer",
  onConfirm,
  onCancel,
  onSave,
  showSaveOption = true,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center gap-2">
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <div className="flex gap-2">
            <AlertDialogAction onClick={onConfirm} className="bg-yellow-600 hover:bg-yellow-700">
              {confirmText}
            </AlertDialogAction>
            {showSaveOption && onSave && (
              <AlertDialogAction onClick={onSave} className="bg-green-600 hover:bg-green-700">
                {saveText}
              </AlertDialogAction>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}