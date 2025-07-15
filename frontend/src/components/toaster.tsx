"use client"

import {
  Toast as ToastPrimitive,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "./ui/toast"
import { useToast } from "../hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(({ id, title, description, action, ...props }: any) => (
        <ToastPrimitive key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </ToastPrimitive>
      ))}
    </div>
  )
}
