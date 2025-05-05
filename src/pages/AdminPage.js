import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./AdminPage.css";
import { FaBox, FaCheckCircle, FaClock, FaChartBar, FaUncharted, FaCheckDouble, FaCross } from "react-icons/fa";
import Endpoint from "../config/Endpoint";


const AdminPage = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const socket = io(Endpoint.websocket, { transports: ["websocket"] });

    const fetchData = async () => {
      try {
        const response = await axios.get(Endpoint.inventory);
        setInventoryData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        setLoading(false);
      }
    };

    fetchData();

    socket.on("inventoryUpdate", (updatedInventory) => {
      setInventoryData(updatedInventory);
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  if (loading) {
    return <div className="loading"><h2>Chargement des données...</h2></div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const totalArticles = inventoryData.length;
  const articlesInventoried = inventoryData.filter((item) => item.nouvelle_qte).length;
  const articlesRemaining = totalArticles - articlesInventoried;
  const progressPercentage = ((articlesInventoried / totalArticles) * 100).toFixed(2);

  // Calculer les dispatchs
  const dispatchData = inventoryData.reduce(
    (acc, item) => {
      if (item.base_from === "Aventura") {
        acc.total.aventura++;
        if (item.nouvelle_qte) acc.inventoried.aventura++;
      } else if (item.base_from === "STGI") {
        acc.total.stgi++;
        if (item.nouvelle_qte) acc.inventoried.stgi++;
      } else {
        acc.total.preInventaire++;
        if (item.nouvelle_qte) acc.inventoried.preInventaire++;
      }
      return acc;
    },
    {
      total: { aventura: 0, stgi: 0, preInventaire: 0 },
      inventoried: { aventura: 0, stgi: 0, preInventaire: 0 },
    }
  );

  const dispatchRemaining = {
    aventura: dispatchData.total.aventura - dispatchData.inventoried.aventura,
    stgi: dispatchData.total.stgi - dispatchData.inventoried.stgi,
    preInventaire: dispatchData.total.preInventaire - dispatchData.inventoried.preInventaire,
  };

  return (
    <div className="admin-container">
      <h2 className="title">Statistique</h2>
      <div className="dashboard">
        <div className="dashboard-item">
          <FaBox className="icon" />
          <p>Total des articles</p>
          <h2>{totalArticles}</h2>
        </div>
        <div className="dashboard-item">
          <FaCheckCircle className="icon" />
          <p>Articles inventoriés</p>
          <h2>{articlesInventoried}</h2>
        </div>
        <div className="dashboard-item">
          <FaClock className="icon" />
          <p>Articles restants</p>
          <h2>{articlesRemaining}</h2>
        </div>
        <div className="dashboard-item">
          <FaChartBar className="icon" />
          <p>Progression</p>
          <h2>{progressPercentage} %</h2>
        </div>
      </div>
      <div className="progress-section">
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      <div className="dashboard">
        <div className="dashboard-item">  
          <h3>TOTAL</h3>
          <ul className="dispatch-list">
            <li>
              <strong>Aventura</strong>: {dispatchData.total.aventura}
            </li>
            <li>
              <strong>STGI</strong>: {dispatchData.total.stgi}
            </li>
            <li>
              <strong>Pré-Inventaire</strong>: {dispatchData.total.preInventaire}
            </li>
          </ul>
        </div>

        <div className="dashboard-inventoried">
          <h3>INVENTORIES</h3>
          <ul className="dispatch-list">
            <li>
              <strong>Aventura</strong>: {dispatchData.inventoried.aventura}
            </li>
            <li>
              <strong>STGI</strong>: {dispatchData.inventoried.stgi}
            </li>
            <li>
              <strong>Pré-Inventaire</strong>: {dispatchData.inventoried.preInventaire}
            </li>
          </ul>
        </div>
        <div className="dashboard-remind" >
          <h3>RESTANTS</h3>
          <ul className="dispatch-list">
            <li>
              <strong>Aventura</strong>: {dispatchRemaining.aventura}
            </li>
            <li>
              <strong>STGI</strong>: {dispatchRemaining.stgi}
            </li>
            <li>
              <strong>Pré-Inventaire</strong>: {dispatchRemaining.preInventaire}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
