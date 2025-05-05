import React, { createContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // Import de RegisterPage
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import CreateClient from "./pages/CreateClient";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import ViewClients from "./pages/ViewClients";
import InventoryPage from "./pages/InventoryPage";
import AdminPage from "./pages/AdminPage";
import AdminTable from "./pages/AdminTable";
import Superviseur from "./pages/Superviseur";
import GestionPage from "./pages/GestionPage";
import { AppProvider } from "./context/AppContext";


function App() {
  
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/superviseur" element={<Superviseur />} />
          <Route path="/gestion" element={<GestionPage />} />
          <Route path="/admin-dashboard" element={<AdminPage />} />
          <Route path="/admin-table" element={<AdminTable />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/create-client" element={<CreateClient />} />
          <Route path="/view-client" element={<ViewClients />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}


export default App;
