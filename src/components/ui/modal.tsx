import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

type ModalProps = {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}

export function Modal({ open, title, description, children, footer, onClose }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-2xl rounded-lg border bg-background shadow-lg"
      >
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>

        {footer ? <div className="flex justify-end gap-2 border-t p-4">{footer}</div> : null}
      </div>
    </div>
  )
}
