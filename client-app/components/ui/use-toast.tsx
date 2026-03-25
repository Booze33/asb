// Inspired by react-hot-toast library
import { useState, useEffect } from "react";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

type ToastId = string;

export interface Toast {
  id: ToastId;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  [key: string]: unknown; // allows arbitrary props like title, description, variant
}

interface State {
  toasts: Toast[];
}

type Action =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "UPDATE_TOAST"; toast: Partial<Toast> & { id: ToastId } }
  | { type: "DISMISS_TOAST"; toastId?: ToastId }
  | { type: "REMOVE_TOAST"; toastId?: ToastId };

const toastTimeouts = new Map<ToastId, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: ToastId): void => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const _clearFromRemoveQueue = (toastId: ToastId): void => {
  const timeout = toastTimeouts.get(toastId);
  if (timeout) {
    clearTimeout(timeout);
    toastTimeouts.delete(toastId);
  }
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

type Listener = (state: State) => void;
const listeners: Listener[] = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action): void {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

let count = 0;
function genId(): ToastId {
  count = (count + 1) % Number.MAX_SAFE_INTEGER; // ✅ MAX_SAFE_INTEGER over MAX_VALUE — avoids float precision loss
  return count.toString();
}

type ToastInput = Omit<Toast, "id" | "open" | "onOpenChange">;

interface ToastHandle {
  id: ToastId;
  dismiss: () => void;
  update: (props: Partial<ToastInput>) => void;
}

function toast(props: ToastInput): ToastHandle {
  const id = genId();

  const update = (updatedProps: Partial<ToastInput>): void =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...updatedProps, id },
    });

  const dismiss = (): void =>
    dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return { id, dismiss, update };
}

interface UseToastReturn extends State {
  toast: (props: ToastInput) => ToastHandle;
  dismiss: (toastId?: ToastId) => void;
}

function useToast(): UseToastReturn {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: ToastId) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };