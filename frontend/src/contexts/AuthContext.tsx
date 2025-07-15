"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"

interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  profilePicture?: string
  bio?: string
  location?: string
  skills?: string[]
  interests?: string[]
  socialLinks?: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
  userType?: string // Added userType
  isVerified: boolean
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    userType?: string
  }) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const API_BASE_URL = "http://localhost:8000/api"

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
      fetchUser(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const response = await axios.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.data.user) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      localStorage.removeItem("token")
      setToken(null)
      delete axios.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/auth/login", { email, password })

      if (response.data.token && response.data.user) {
        setToken(response.data.token)
        setUser(response.data.user)
        localStorage.setItem("token", response.data.token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed")
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    userType?: string
  }) => {
    try {
      const response = await axios.post("/auth/register", userData)

      if (response.data.token && response.data.user) {
        setToken(response.data.token)
        setUser(response.data.user)
        localStorage.setItem("token", response.data.token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed")
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
