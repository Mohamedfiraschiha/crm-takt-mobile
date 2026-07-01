import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getMe, signin as signinRequest } from "../api/auth";
import { setUnauthorizedHandler, tokenStorage } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    (async () => {
      const token = await tokenStorage.get();
      if (token) {
        try {
          setUser(await getMe());
        } catch {
          await tokenStorage.clear();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const signin = async (email, password) => {
    const result = await signinRequest(email, password);
    if (result.requiresTwoFactor) {
      return { requiresTwoFactor: true, userId: result.data.userId };
    }
    await tokenStorage.set(result.data.token);
    setUser(result.data.user);
    return { requiresTwoFactor: false };
  };

  const completeLogin = async (user, token) => {
    await tokenStorage.set(token);
    setUser(user);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signin, completeLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
