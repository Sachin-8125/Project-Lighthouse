import React, {createContext, useCallback, useEffect, useState} from 'react';
import apiClient from '../api/apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user,setUser] = useState(null);
    const [token,setToken] = useState(localStorage.getItem('token'));
    const [isLoading,setIsLoading] = useState(true);

    const fetchUserProfile = useCallback(async () => { 
        if(token){
            try {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await apiClient.get('/auth/profile');
                setUser(response.data.data);
            } catch (error) {
                console.error("failed to fetch user profile", error);
                logout();
            }
        }
        setIsLoading(false);
    },[token]);

    useEffect(()=> {
        fetchUserProfile();
    },[fetchUserProfile]);

    const login = (userData, authToken) => {
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUser(userData);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
    };

    const value = {
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
