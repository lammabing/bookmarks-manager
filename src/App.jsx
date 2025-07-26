import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FolderProvider } from "./contexts/FolderContext";
import { BookmarkProvider } from "./contexts/BookmarkContext";
import { TagProvider } from "./contexts/TagContext";
import { FontProvider } from "./contexts/FontContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <FolderProvider>
        <BookmarkProvider>
          <TagProvider>
            <FontProvider>
              <Router>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </div>
              </Router>
            </FontProvider>
          </TagProvider>
        </BookmarkProvider>
      </FolderProvider>
    </AuthProvider>
  );
}

export default App;
