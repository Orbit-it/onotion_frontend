import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminTable.css";

const AdminTable = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/inventory");
        setInventoryData(response.data);
        setFilteredData(response.data); // Initialement, toutes les données sont affichées
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrer les données en fonction du terme de recherche
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = inventoryData.filter((item) =>
      Object.values(item)
        .some((value) => value && value.toString().toLowerCase().includes(lowercasedTerm))
    );
    setFilteredData(filtered);
  }, [searchTerm, inventoryData]);

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="admin-table-container">
      <h1>Liste des Articles</h1>
      <input
        type="text"
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <table className="admin-table">
        <thead>
          <tr>
            <th>Réf interne</th>
            <th>Désignation</th>
            <th>qté pré-inventaire</th>
            <th>Nouvelle qté</th>
            <th>Unité</th>
            <th>Code emplacement</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item.id} className={item.nouvelle_qte ? "inventoried" : ""}>
                <td>{item.ref_interne}</td>
                <td>{item.designation}</td>
                <td>{item.qte_pre_inventaire}</td>
                <td>{item.nouvelle_qte || "N/A"}</td>
                <td>{item.unite || "N/A"}</td>
                <td>{item.code_emplacement || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Aucun résultat trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
