import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPage.css";

const AdminPage = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/inventory");
        setInventoryData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const totalArticles = inventoryData.length;
  const articlesInventoried = inventoryData.filter((item) => item.nouvelle_qte).length;
  const articlesRemaining = totalArticles - articlesInventoried;
  const progressPercentage = ((articlesInventoried / totalArticles) * 100).toFixed(2);

  return (
    <div className="admin-container">
      <h1>Supervision de l'Inventaire</h1>
      <p>Total des articles : {totalArticles}</p>
      <p>Articles inventoriés : {articlesInventoried}</p>
      <p>Articles restants : {articlesRemaining}</p>
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progressPercentage}%` }}
        >
        </div>
      </div>
      <p>Inventaire Effectué : {progressPercentage} %</p>
    </div>
  );
};

export default AdminPage;
