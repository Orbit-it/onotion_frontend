import React, { useState, useEffect } from "react";
import "./InventoryPage.css";

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [article, setArticle] = useState(null);

  // Récupérer les données de la base de données via une API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/inventory"); // Remplacez par l'URL de votre API
        if (!response.ok) throw new Error("Erreur lors du chargement des articles.");
        const data = await response.json();
        setInventoryData(data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchInventory();
  }, []);

  // Gestion de la recherche
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);

    const foundArticle = inventoryData.find(
      (item) =>
        item.ref_interne.toLowerCase().includes(query) ||
        item.designation.toLowerCase().includes(query)
    );

    setArticle(foundArticle || null);
  };

  // Gestion des mises à jour d'un champ
  const handleUpdate = async (field, value) => {
    if (!article) return;
  
    const updatedArticle = { ...article, [field]: value };
    setArticle(updatedArticle);
  
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/update/${article.id}`, {
        method: "PUT", // Méthode HTTP pour mettre à jour
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });
  
      if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'article.");
  
      const updatedData = await response.json();
  
      // Mettre à jour les données localement
      setInventoryData((prevData) =>
        prevData.map((item) =>
          item.id === article.id ? updatedData : item
        )
      );
    } catch (error) {
      console.error("Erreur:", error);
    }
  };
  

  // Validation de la nouvelle quantité
  const handleValidation = () => {
    if (!article) return;

    if (!article.nouvelle_qte) {
      const confirmUsePreInventory = window.confirm(
        "La nouvelle quantité n'est pas définie. Voulez-vous utiliser la quantité du pré-inventaire ?"
      );

      if (confirmUsePreInventory) {
        handleUpdate("nouvelle_qte", article.qte_pre_inventaire);
      }
    } else {
      alert("Nouvelle valeur validée !");
    }
  };

  return (
    <div className="inventory-page">
      <h2>STGI: Inventaire Janvier 2025</h2>
      <input
        type="text"
        placeholder="Scanner le code-barres..."
        value={search}
        onChange={handleSearch}
        className="search-bar"
      />
      {article ? (
        <div className="article-details">
          <p><strong>Réf. Interne :</strong> {article.ref_interne}</p>
          <p><strong>Réf. Fournisseur :</strong> {article.ref_fourn}</p>
          <p><strong>Désignation :</strong> {article.designation}</p>
          <p><strong>Fournisseur :</strong> {article.fournisseur}</p>
          <p><strong>Prix :</strong> {article.prix} €</p>
          <p><strong>Unité :</strong>
            <input
              type="text"
              value={article.unite}
              onChange={(e) => handleUpdate("unite", e.target.value)}
            />
          </p>
          <p><strong>Qté Pré-Inventaire :</strong> {article.qte_pre_inventaire}</p>
          <p><strong>Nouvelle Qté :</strong>
            <input
              type="number"
              value={article.nouvelle_qte || ""}
              onChange={(e) => handleUpdate("nouvelle_qte", parseInt(e.target.value))}
            />
          </p>
          <p><strong>Code Emplacement :</strong>
            <input
              type="text"
              value={article.code_emplacement}
              onChange={(e) => handleUpdate("code_emplacement", e.target.value)}
            />
          </p>
          <button className="validate-button" onClick={handleValidation}>
            Valider
          </button>
        </div>
      ) : (
        <p>Aucun article trouvé pour : {search}</p>
      )}
    </div>
  );
};

export default InventoryPage;
