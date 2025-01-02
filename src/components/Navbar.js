import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import CSS du Navbar

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img 
            src="/logo512.png" 
            alt="Logo" 
            className="logo-image" 
          />
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/inventory">Inventaire</Link>
        <Link to="/admin-dashboard">Progression</Link>
        <Link to="/admin-table">Base inventaire</Link>
      </div>
    </nav>
  );
};

export default Navbar;
