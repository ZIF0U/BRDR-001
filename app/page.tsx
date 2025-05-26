"use client"

import { useState, useEffect } from "react"
import LoginScreen from "@/components/login-screen"
import MainApp from "@/components/main-app"

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>("")

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setCurrentUser(savedUser)
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (username: string) => {
    setCurrentUser(username)
    setIsLoggedIn(true)
    localStorage.setItem("currentUser", username)
  }

  const handleLogout = () => {
    setCurrentUser("")
    setIsLoggedIn(false)
    localStorage.removeItem("currentUser")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <MainApp currentUser={currentUser} onLogout={handleLogout} />
      )}
    </div>
  )
}
