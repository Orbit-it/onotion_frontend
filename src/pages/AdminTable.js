import React, { useEffect, useState } from "react";
import { FaBox, FaChartLine, FaDatabase, FaSearch, FaAmazon } from "react-icons/fa"; // Importation des icônes
import axios from "axios";
import { io } from "socket.io-client";
import "./AdminTable.css";
import Endpoint from "../links/FetchLink";

const AdminTable = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les données
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(Endpoint.inventory);
      setInventoryData(response.data);
      setFilteredData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = io(Endpoint.websocket, { transports: ["websocket"] });
    fetchData();

    socket.on("inventoryUpdate", (updatedInventory) => {
      setInventoryData(updatedInventory);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filtrer les données en fonction du terme de recherche
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = inventoryData.filter((item) =>
      Object.values(item).some((value) =>
        value && value.toString().toLowerCase().includes(lowercasedTerm)
      )
    );
    setFilteredData(filtered);
  }, [searchTerm, inventoryData]);

  // Réinitialiser les données
  const handleRefresh = () => {
    setSearchTerm("");
    setFilteredData(inventoryData);
  };

  if (loading) {
    return <div><h2>Chargement des données...</h2></div>;
  }

  if (error) {
    return <div><h2>{error}</h2></div>;
  }

  return (
    <div className="admin-table-container">
      <div className="header-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />

          </div>
      </div>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Réf interne</th>
              <th>Désignation</th>
              <th>Fournisseur</th>
              <th>Quantité</th>
              <th>Unité</th>
              <th>Zone</th>
              <th>Allée</th>
              <th>Bloc</th>
              <th>Niveau</th>
              <th>DataBase</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className={item.nouvelle_qte !== undefined && item.nouvelle_qte !== null ? "inventoried" : ""}>
                  <td>{item.ref_interne}</td>
                  <td>{item.designation}</td>
                  <td>{item.fournisseur}</td>
                  <td>{item.nouvelle_qte}</td>
                  <td>{item.unite || "N/A"}</td>
                  <td>{item.zone || "N/A"}</td>
                  <td>{item.allee || "N/A"}</td>
                  <td>{item.bloc || "N/A"}</td>
                  <td>{item.niveau || "N/A"}</td>
                  <td>{item.base_from || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">Aucun résultat trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
