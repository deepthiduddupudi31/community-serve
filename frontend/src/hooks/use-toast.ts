import * as React from "react"
import type { ToastActionElement, ToastProps } from "../components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0
function genId() {
  count++
  return `${Date.now()}-${count}`
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

const reducer = (
  state: ToasterToast[],
  action: {
    type: keyof typeof actionTypes
    toast?: ToasterToast
    toastId?: string
  }
): ToasterToast[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast!, ...state].slice(0, TOAST_LIMIT)
    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast!.id ? { ...t, ...action.toast } : t
      )
    case "DISMISS_TOAST":
      addToRemoveQueue(action.toastId!)
      return state.map((t) =>
        t.id === action.toastId || action.toastId === undefined
          ? { ...t, open: false }
          : t
      )
    case "REMOVE_TOAST":
      return state.filter((t) => t.id !== action.toastId)
    default:
      return state
  }
}

const listeners: Array<(state: ToasterToast[]) => void> = []
let memoryState: ToasterToast[] = []

function dispatch(action: {
  type: keyof typeof actionTypes
  toast?: ToasterToast
  toastId?: string
}) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

function useToast() {
  const [state, setState] = React.useState<ToasterToast[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index !== -1) listeners.splice(index, 1)
    }
  }, [])

  const toast = React.useCallback((props: ToastProps) => {
    const id = genId()
    const toastWithDefaults: ToasterToast = {
      ...props,
      id,
    }

    dispatch({
      type: "ADD_TOAST",
      toast: toastWithDefaults,
    })

    return {
      id,
      dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
      update: (newProps: ToastProps) =>
        dispatch({
          type: "UPDATE_TOAST",
          toast: { ...newProps, id },
        }),
    }
  }, [])

  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId })
  }, [])

  return {
    toasts: state,
    toast,
    dismiss,
  }
}

export { useToast }
