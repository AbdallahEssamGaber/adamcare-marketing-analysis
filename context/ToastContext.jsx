import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);
const DEFAULT_DURATION_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, { tone = "info", duration = DEFAULT_DURATION_MS } = {}) => {
      const id = ++idRef.current;
      setToasts((curr) => [...curr, { id, message, tone }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      toasts,
      dismiss,
      info: (m, opts) => push(m, { ...opts, tone: "info" }),
      success: (m, opts) => push(m, { ...opts, tone: "success" }),
      error: (m, opts) => push(m, { ...opts, tone: "error" }),
    }),
    [toasts, push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>{children}</ToastContext.Provider>
  );
}

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToasts must be used inside <ToastProvider>");
  return ctx;
}
