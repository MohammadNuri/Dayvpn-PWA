import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

const SESSION_KEY = "dayvpn_session";
const SESSION_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

interface AuthSession {
  expiryTime: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAuthLoading: boolean; // To prevent redirects before auth is checked
  expiryTime: number | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAuthLoading: true,
  expiryTime: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const navigate = useNavigate(); // Get navigate hook for use in logout

  // Check localStorage for a valid session on initial app load
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        const session: AuthSession = JSON.parse(storedSession);
        if (session.expiryTime && session.expiryTime > Date.now()) {
          // Session is valid
          setIsLoggedIn(true);
          setExpiryTime(session.expiryTime);
        } else {
          // Session expired
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to parse auth session", error);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const login = () => {
    const newExpiryTime = Date.now() + SESSION_DURATION;
    const session: AuthSession = { expiryTime: newExpiryTime };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setIsLoggedIn(true);
      setExpiryTime(newExpiryTime);
    } catch (error) {
      console.error("Failed to set auth session", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error("Failed to remove auth session", error);
    }
    setIsLoggedIn(false);
    setExpiryTime(null);
    // Navigate back to login page on logout
    navigate("/", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isAuthLoading, expiryTime, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};