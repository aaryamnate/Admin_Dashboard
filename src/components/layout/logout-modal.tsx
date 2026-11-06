'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogOut, AlertTriangle } from 'lucide-react'

interface LogoutConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function LogoutConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/80 shadow-2xl p-6">
        <DialogHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="h-11 w-11 rounded-full bg-destructive/15 text-destructive border border-destructive/25 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold text-foreground">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-foreground/90">
              Are you sure you want to log out?
            </DialogDescription>
          </div>
        </DialogHeader>

        <p className="text-xs text-muted-foreground mt-2">
          Your active gym management session will be safely ended on this device.
        </p>

        <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
