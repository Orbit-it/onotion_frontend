import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Endpoint from "../links/FetchLink";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(Endpoint.login, { username, password });
      const { token, role } = response.data;
      localStorage.setItem("token", token);

      if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/client-dashboard");
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo512.png" alt="Logo" className="logo-image" />
        <h2>Connexion</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Se connecter</button>
        </form>
        <footer>© 2024 OnotionIventory. All rights reserved.</footer>
      </div>
    </div>
  );
};

export default LoginPage;
