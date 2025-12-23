import React, {createContext, useContext} from "react";
import {useAuth} from "../hooks/useAuth";

interface AuthContextType {
    isAuthenticated: boolean;
    role: string | null;
    loading: boolean;
    login: (access: string, refresh: string, role: string) => void;
    logout: () => void;
    isRenter: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const auth = useAuth();

    const normalizedRole = auth.role?.toLowerCase() ?? null;

    const value = {
        ...auth,
        isRenter: normalizedRole === "renter",
        isAdmin: normalizedRole === "admin",
    };

    if (auth.loading) {
        return (
            <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
    return context;
};