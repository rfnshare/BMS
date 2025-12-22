import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

type ToastType = "success" | "danger" | "info" | "warning";

interface Notification {
  id: number;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  notify: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  // Shorthand helpers
  const success = (msg: string) => notify(msg, "success");
  const error = (msg: string) => notify(msg, "danger");

  return (
    <NotificationContext.Provider value={{ notify, success, error }}>
      {children}

      {/* TOAST UI RENDERER */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {notifications.map((n) => (
          <Toast key={n.id} bg={n.type} autohide delay={3000} className="border-0 shadow-lg mb-2">
            <Toast.Body className={n.type === "success" || n.type === "danger" ? "text-white" : "text-dark"}>
              <div className="d-flex align-items-center">
                <i className={`bi bi-${n.type === "success" ? "check-circle" : "exclamation-circle"} me-2 fs-5`}></i>
                <span className="fw-bold">{n.message}</span>
              </div>
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotify must be used within a NotificationProvider");
  return context;
};