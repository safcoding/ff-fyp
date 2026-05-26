import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import type { ReactNode } from "react"

type DeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  pending?: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  pendingLabel?: string
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  children?: ReactNode
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  pending = false,
  title = "Delete item?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  pendingLabel = "Deleting...",
  confirmVariant = "destructive",
  children,
}: DeleteDialogProps) {
  return (
    <Modal open={open} title={title} description={description} onClose={() => onOpenChange(false)}>
      <div className="space-y-4">
        {children}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={confirmVariant}
            disabled={pending}
            onClick={() => {
              onConfirm()
            }}
          >
            {pending ? pendingLabel : confirmLabel}
          </Button>
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
