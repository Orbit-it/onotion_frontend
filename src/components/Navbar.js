import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Endpoint from "../config/Endpoint";
import "./Navbar.css";
import { FaBox, FaChartLine, FaDatabase, FaAdjust, FaBook } from "react-icons/fa";
import { io } from "socket.io-client";

const Navbar = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(Endpoint.websocket, { transports: ["websocket"], 
    reconnection: true, // Active la reconnexion automatique
    reconnectionAttempts: 15, // Nombre de tentatives
    reconnectionDelay: 2000 // Temps avant de réessayer (2 sec)
  });

    const connectWebSocket = () => {
      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));
      socket.on("error", () => setIsConnected(false));

      socket.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000); // Tentative de reconnexion après 5 sec
      };
    };

    connectWebSocket();

    return () => {
      socket.close();
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <NavLink to="/">
          <img src="/logo-transparent.png" alt="Logo" className="logo-image" />
        </NavLink>
      </div>
      
      {/* Indicateur de connexion */}
      <div className="connection-container">
        <div className={`connection-status ${isConnected ? "connected" : "disconnected"}`}></div>
        <span className="connection-text">{isConnected ? "Connecté" : "Déconnecté"}</span>
      </div>

      <div className="navbar-links">
        <NavLink to="/superviseur" className={({ isActive }) => (isActive ? "active" : "")}>
          <FaAdjust className="icon" /> Superviseurs
        </NavLink>
        <NavLink to="/gestion" className={({ isActive }) => (isActive ? "active" : "")}>
          <FaBook className="icon" /> Gestion des demandes
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => (isActive ? "active" : "")}>
          <FaBox className="icon" /> Inventaire
        </NavLink>
        <NavLink to="/admin-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          <FaChartLine className="icon" /> Statistiques
        </NavLink>
        <NavLink to="/admin-table" className={({ isActive }) => (isActive ? "active" : "")}>
          <FaDatabase className="icon" /> Base inventaire
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
