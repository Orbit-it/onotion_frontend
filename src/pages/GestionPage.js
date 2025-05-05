import React, { useEffect, useState } from "react";
import { FaSearch, FaCheck, FaTimes, FaEye, FaPrint, FaFilter, FaSync } from "react-icons/fa";
import axios from "axios";
import { io } from "socket.io-client";
import "./GestionPage.css";
import Endpoint from "../config/Endpoint";
import Modal from "react-modal";

Modal.setAppElement('#root');

const DemandesGestion = () => {
  const [demandes, setDemandes] = useState([]);
  const [filteredDemandes, setFilteredDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    project: "all",
    post: "all",
    dateFrom: "",
    dateTo: ""
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);

  // Charger les données
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [demandesRes, projectsRes, postsRes] = await Promise.all([
        axios.get(Endpoint.request),
        axios.get(Endpoint.affaires),
        axios.get(Endpoint.postes)
      ]);
  
      // Transform the data to ensure consistency
      const projectsData = Array.isArray(projectsRes.data) 
        ? projectsRes.data.map(p => ({
            id: p.id,
            code: p.code,
            description: p.description
          }))
        : [];
  
      const postsData = Array.isArray(postsRes.data)
        ? postsRes.data.map(p => ({
            id: p.id,
            code: p.code,
            description: p.description
          }))
        : [];
  
      // Ensure demandes is an array and has the correct structure
      const demandesData = Array.isArray(demandesRes.data?.demandes) 
        ? demandesRes.data.demandes.map(d => ({
            ...d,
            project: typeof d.project === 'object' ? d.project.code : d.project,
            post: typeof d.post === 'object' ? d.post.code : d.post
          }))
        : [];
  
      setDemandes(demandesData);
      setFilteredDemandes(demandesData);
      setProjects(projectsData);
      setPosts(postsData);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Erreur lors du chargement des données");
      setLoading(false);
      setDemandes([]);
      setFilteredDemandes([]);
    }
  };

  useEffect(() => {
    const socket = io(Endpoint.websocket, { transports: ["websocket"] });
    fetchData();

    socket.on("requestUpdate", (updatedRequests) => {
      setDemandes(updatedRequests);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filtrer les demandes
  useEffect(() => {
    let filtered = demandes;

    // Filtre par terme de recherche
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(demande =>
        Object.values(demande).some(value =>
          value && value.toString().toLowerCase().includes(lowercasedTerm)
      ));
    }

    // Filtres avancés
    if (filters.status !== "all") {
      filtered = filtered.filter(d => d.status === filters.status);
    }
    if (filters.project !== "all") {
      filtered = filtered.filter(d => d.project === filters.project);
    }
    if (filters.post !== "all") {
      filtered = filtered.filter(d => d.post === filters.post);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(d => new Date(d.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59);
      filtered = filtered.filter(d => new Date(d.createdAt) <= toDate);
    }

    setFilteredDemandes(filtered);
  }, [searchTerm, demandes, filters]);

  // Gestion du statut des demandes
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${Endpoint.requests}/${id}/status`, { status: newStatus });
      fetchData(); // Rafraîchir les données
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  // Voir les détails d'une demande
  const viewDemandeDetails = (demande) => {
    setSelectedDemande(demande);
    setIsDetailModalOpen(true);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: "all",
      project: "all",
      post: "all",
      dateFrom: "",
      dateTo: ""
    });
    setSearchTerm("");
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('fr-FR', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} à ${hours}h${minutes}`;
  };

  if (loading) {
    return <div className="loading"><h2>Chargement des données...</h2></div>;
  }

  if (error) {
    return <div className="error"><h2>{error}</h2></div>;
  }

  return (
    <div className="demandes-container">
      <div className="header-bar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une demande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>
        <div className="actions-container">
          <button 
            className={`filter-btn ${isFilterOpen ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FaFilter /> Filtres
          </button>
          <button className="refresh-btn" onClick={fetchData}>
            <FaSync /> Actualiser
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Statut:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
              <option value="completed">Terminé</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Projet:</label>
            <select
              value={filters.project}
              onChange={(e) => setFilters({...filters, project: e.target.value})}
            >
              <option value="all">Tous les projets</option>
              {projects.map(project => (
                <option key={project.code} value={project.code}>{project.description}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Poste:</label>
            <select
              value={filters.post}
              onChange={(e) => setFilters({...filters, post: e.target.value})}
            >
              <option value="all">Tous les postes</option>
              {posts.map(post => (
                <option key={post.code} value={post.code}>{post.description}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date de début:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
          </div>

          <div className="filter-group">
            <label>Date de fin:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>

          <button className="reset-filters" onClick={resetFilters}>
            Réinitialiser
          </button>
        </div>
      )}

      <div className="stats-bar">
        <div className="stat-card total">
          <h3>Total</h3>
          <p>{demandes.length}</p>
        </div>
        <div className="stat-card pending">
          <h3>En attente</h3>
          <p>{demandes.filter(d => d.status === 'pending').length}</p>
        </div>
        <div className="stat-card approved">
          <h3>Approuvées</h3>
          <p>{demandes.filter(d => d.status === 'approved').length}</p>
        </div>
        <div className="stat-card completed">
          <h3>Terminées</h3>
          <p>{demandes.filter(d => d.status === 'completed').length}</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="demandes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Projet</th>
              <th>Poste</th>
              <th>Nom du Bateau</th>
              <th>Créée le</th>
              <th>Statut</th>
              <th>Articles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDemandes.length > 0 ? (
              filteredDemandes.map((demande) => (
                <tr key={demande.id} className={`status-${demande.status}`}>
                  <td>#{demande.id}</td>
                  <td>
                    {projects.find(p => p.code === demande.project)?.description || demande.project}
                  </td>
                  <td>
                    {posts.find(p => p.code === demande.post)?.description || demande.post}
                  </td>
                  <td>{demande.boat_name}</td>
                  <td>{formatDate(demande.created_at)}</td>
                  <td>
                    <span className={`status-badge ${demande.status}`}>
                      {demande.status === 'pending' && 'En attente'}
                      {demande.status === 'approved' && 'Approuvé'}
                      {demande.status === 'rejected' && 'Rejeté'}
                      {demande.status === 'completed' && 'Terminé'}
                    </span>
                  </td>
                  <td>{demande.items.length} articles</td>
                  <td className="actions">
                    <button 
                      className="view-btn"
                      onClick={() => viewDemandeDetails(demande)}
                    >
                      <FaEye /> Détails
                    </button>
                    {demande.status === 'pending' && (
                      <>
                        <button 
                          className="approve-btn"
                          onClick={() => handleStatusChange(demande.id, 'approved')}
                        >
                          <FaCheck /> Approuver
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleStatusChange(demande.id, 'rejected')}
                        >
                          <FaTimes /> Rejeter
                        </button>
                      </>
                    )}
                    {demande.status === 'approved' && (
                      <button 
                        className="complete-btn"
                        onClick={() => handleStatusChange(demande.id, 'completed')}
                      >
                        <FaCheck /> Terminer
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Aucune demande trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de détails de la demande */}
      <Modal
        isOpen={isDetailModalOpen}
        onRequestClose={() => setIsDetailModalOpen(false)}
        contentLabel="Détails de la demande"
        className="detail-modal"
        overlayClassName="detail-modal-overlay"
      >
        {selectedDemande && (
          <>
            <div className="modal-header">
              <h2>Détails de la demande #{selectedDemande.id}</h2>
              <button className="print-btn">
                <FaPrint /> Imprimer
              </button>
            </div>

            <div className="demande-info">
              <div className="info-row">
                <span className="info-label">Projet:</span>
                <span className="info-value">
                  {projects.find(p => p.code === selectedDemande.project)?.description || selectedDemande.project}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Poste:</span>
                <span className="info-value">
                  {posts.find(p => p.code === selectedDemande.post)?.description || selectedDemande.post}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Statut:</span>
                <span className={`info-value status-badge ${selectedDemande.status}`}>
                  {selectedDemande.status === 'pending' && 'En attente'}
                  {selectedDemande.status === 'approved' && 'En cours de Traitement'}
                  {selectedDemande.status === 'rejected' && 'Rejeté'}
                  {selectedDemande.status === 'completed' && 'Traitée'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Créée le:</span>
                <span className="info-value">{formatDate(selectedDemande.created_at)}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Nom du Bateau:</span>
                <span className="info-value">{selectedDemande.boat_name}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Commentaire:</span>
                <span className="info-value">{selectedDemande.comment || "Aucun commentaire"}</span>
              </div>
            </div>

            <h3>Articles demandés</h3>
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Désignation</th>
                    <th>Quantité</th>
                    <th>Unité</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDemande.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.ref_interne}</td>
                      <td>{item.designation}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unite || "unités"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button onClick={() => setIsDetailModalOpen(false)}>Fermer</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default DemandesGestion;