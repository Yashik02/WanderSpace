import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useLanguage } from "./useLanguage";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextValue {
    notify: (message: string, type?: NotificationType) => void;
    dismiss: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
    null,
);

export const NotificationProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const dismiss = useCallback((id: number) => {
        setNotifications((current) =>
            current.filter((notification) => notification.id !== id),
        );
    }, []);

    const notify = useCallback(
        (message: string, type: NotificationType = "info") => {
            const notification = {
                id: Date.now() + Math.random(),
                message,
                type,
            };
            setNotifications((current) => [...current, notification]);
        },
        [],
    );

    const contextValue = useMemo(
        () => ({ notify, dismiss }),
        [notify, dismiss],
    );

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <div
                className="notification-stack"
                aria-live="polite"
                aria-atomic="true"
            >
                {notifications.map((notification) => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        onDismiss={dismiss}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

function NotificationToast({
    notification,
    onDismiss,
}: {
    notification: Notification;
    onDismiss: (id: number) => void;
}) {
    const { t } = useLanguage();
    const [isExiting, setIsExiting] = useState(false);
    const Icon =
        notification.type === "success"
            ? CheckCircle2
            : notification.type === "error"
              ? XCircle
              : Info;

    React.useEffect(() => {
        const exitTimer = window.setTimeout(() => setIsExiting(true), 3500);
        const dismissTimer = window.setTimeout(() => {
            onDismiss(notification.id);
        }, 4000);

        return () => {
            window.clearTimeout(exitTimer);
            window.clearTimeout(dismissTimer);
        };
    }, [notification.id, onDismiss]);

    return (
        <div
            className={`notification-toast notification-${notification.type}${isExiting ? " notification-exiting" : ""}`}
            role={notification.type === "error" ? "alert" : "status"}
        >
            <Icon size={20} aria-hidden="true" />
            <span>{notification.message}</span>
            <button
                type="button"
                className="notification-close"
                aria-label={t("dismissNotification")}
                onClick={() => onDismiss(notification.id)}
            >
                <X size={17} />
            </button>
        </div>
    );
}

export function useNotifications(): NotificationContextValue {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotifications must be used within NotificationProvider",
        );
    }
    return context;
}
