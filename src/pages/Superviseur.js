import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";
import {
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  MenuItem,
  FormControl
} from '@mui/material';
import axios from "axios";
import "./Superviseur.css";
import Endpoint from "../config/Endpoint";
import Modal from "react-modal";
import { FixedSizeList as List } from 'react-window';

Modal.setAppElement('#root');

const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

// Composant mémoïsé pour les lignes du tableau
const TableRow = React.memo(({ item, selectedItems, handleItemSelection, style }) => {
  return (
    <div style={style} className="superviseur-table-row">
      <div className="superviseur-table-cell superviseur-selection-cell">
        <input
          type="checkbox"
          checked={selectedItems.some(i => i.id === item.id)}
          onChange={() => handleItemSelection(item)}
        />
      </div>
      <div className="superviseur-ref-interne">{item.ref_interne}</div>
      <div className="superviseur-table-cell">{item.designation}</div>
      <div className="superviseur-table-cell">{item.fournisseur}</div>
      <div className="superviseur-table-cell">{item.unite || '--'}</div>
    </div>
  );
});

// Validation des Données
const validateField = (fieldName, value) => {
  switch (fieldName) {
    case 'project':
      return value ? '' : 'Projet requis';
    case 'post':
      return value ? '' : 'Post requis';
    case 'boat_name':
      return value ? '' : 'Nom du bateau requis';
    default:
      return '';
  }
};

const validateDemande = (demande) => {
  const errors = {};
  
  errors.project = validateField('project', demande.project);
  errors.post = validateField('post', demande.post);
  errors.boat_name = validateField('boat_name', demande.boat_name);
  
  return errors;
};

// Composant mémoïsé pour le modal de demande
const RequestModal = React.memo(({ 
  isOpen, 
  onClose, 
  projects, 
  posts, 
  selectedItems, 
  onSubmit, 
  onQuantityChange,
  formData,
  handleFieldChange,
  validationErrors = {}
}) => {
  // Fonction pour déterminer si un champ est valide
  const isFieldValid = (fieldName) => {
    return formData[fieldName] && !validationErrors[fieldName];
  };

  // Validations des lignes
  const areValidesLines = () => {
    return selectedItems.every(item => 
        item.quantity > 0 && 
        item.quantity_bateau !== '' && 
        item.quantity_pose !== ''
    );
};

  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Créer une demande"
      className="superviseur-modal"
      overlayClassName="superviseur-modal-overlay"
    >
      <h2>Créer une nouvelle demande</h2>
      
      <FormControl fullWidth margin="normal" size="small">
        <TextField
          fullWidth
          select
          required
          label="Projet"
          size="small"
          value={formData.project}
          onChange={(e) => handleFieldChange('project', e.target.value)}
          error={!!validationErrors.project}
          helperText={validationErrors.project}
          className={isFieldValid('project') ? 'superviseur-valid-field' : ''}
          sx={{
                '& .MuiOutlinedInput-root': {
                '&.superviseur-valid-field fieldset': {
                    borderColor: 'green',
                },
                },
            }}
        >
          <MenuItem value="">Sélectionner un projet</MenuItem>
          {projects.map(project => (
            <MenuItem key={project.id} value={project.code}>
              {project.description}
            </MenuItem>
          ))}
        </TextField>
      </FormControl> 
      
      <FormControl fullWidth margin="normal" size="small">
        <TextField
          fullWidth
          select
          size="small"
          value={formData.post}
          onChange={(e) => handleFieldChange('post', e.target.value)}
          label="Poste"
          required
          error={!!validationErrors.post}
          helperText={validationErrors.post}
          className={isFieldValid('post') ? 'superviseur-valid-field' : ''}
          sx={{
                '& .MuiOutlinedInput-root': {
                '&.superviseur-valid-field fieldset': {
                    borderColor: 'green',
                },
                },
            }}
        >
          <MenuItem value="">Sélectionner un poste</MenuItem>
          {posts.map(post => (
            <MenuItem key={post.id} value={post.code}>
              {post.description}
            </MenuItem>
          ))}
        </TextField>
      </FormControl>

      <TextField
        label="Nom du Bateau"
        required
        size="small"
        fullWidth
        margin="normal"
        value={formData.boat_name}
        onChange={(e) => handleFieldChange('boat_name', e.target.value)}
        error={!!validationErrors.boat_name}
        helperText={validationErrors.boat_name}
        className={isFieldValid('boat_name') ? 'superviseur-valid-field' : ''}
        sx={{
            '& .MuiOutlinedInput-root': {
            '&.superviseur-valid-field fieldset': {
                borderColor: 'green',
            },
            },
        }}
      />
      
      <TextField
        label="Commentaire"
        multiline
        rows={1}
        fullWidth
        margin="normal"
        value={formData.comment}
        onChange={(e) => handleFieldChange('comment', e.target.value)}
      />
      
      <h3>Articles sélectionnés</h3>

      {selectedItems.length > 0 ? (
        <div className="superviseur-selected-items-container">
          {selectedItems.map(item => (
            <div key={item.id} className="superviseur-selected-item">
              <div className="superviseur-item-info">
                <span className="superviseur-item-ref">{item.ref_interne}</span>
                <span className="superviseur-item-designation">{item.designation}</span>
                <span className="superviseur-item-unit">({item.unite || '--'})</span>
              </div>
              <div className="superviseur-item-quantities">
                 
                <TextField
                    type="number"
                    label="Quantité demandée"
                    size="small"
                    value={item.quantity ?? ''}  // Using nullish coalescing instead of logical OR
                    onChange={(e) => {
                        const value = e.target.value;
                        // Convert to number or keep as empty string
                        const numValue = value === '' ? null : Number(value);
                        onQuantityChange(item.id, 'quantity', numValue);
                    }}
                    sx={{ width: 120, marginRight: 1 }}
                    inputProps={{ 
                        min: 0,
                        step: "any" // Allows decimal numbers if needed
                    }}
                    helperText="Quantité demandée"
                    required
                    error={item.quantity !== null && item.quantity < 0} // Example validation
                    />  
                <TextField
                    type="number"
                    label="Quantité posée"
                    size="small"
                    value={item.quantity_pose ?? ''}  // Using nullish coalescing instead of logical OR
                    onChange={(e) => {
                        const value = e.target.value;
                        // Convert to number or keep as empty string
                        const numValue = value === '' ? null : Number(value);
                        onQuantityChange(item.id, 'quantity_pose', numValue);
                    }}
                    sx={{ width: 120, marginRight: 1 }}
                    inputProps={{ 
                        min: 0,
                        step: "any" // Allows decimal numbers if needed
                    }}
                    helperText="Quantité déjà posée"
                    required
                    error={item.quantity_pose !== null && item.quantity_pose < 0} 
                    />
                <TextField
                    type="number"
                    label="Quantité nécessaire par Bateau"
                    size="small"
                    value={item.quantity_bateau ?? ''}  // Using nullish coalescing instead of logical OR
                    onChange={(e) => {
                        const value = e.target.value;
                        // Convert to number or keep as empty string
                        const numValue = value === '' ? null : Number(value);
                        onQuantityChange(item.id, 'quantity_bateau', numValue);
                    }}
                    sx={{ width: 120, marginRight: 1 }}
                    inputProps={{ 
                        min: 0,
                        step: "any" // Allows decimal numbers if needed
                    }}
                    helperText="Quantité requise par bateau"
                    required
                    error={item.quantity_bateau !== null && item.quantity_bateau < 0}
                    />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="superviseur-no-items">Aucun article sélectionné</p>
      )}
      
      <div className="superviseur-modal-actions">
        <button 
          className="superviseur-cancel-demande-btn"
          onClick={onClose}
        >
          Annuler
        </button>
        <button 
          className="superviseur-submit-demande-btn"
          onClick={onSubmit}
          disabled={!formData.project || !formData.post || !formData.boat_name || !areValidesLines() || selectedItems.length === 0 }
        >
          Envoyer la demande
        </button>
      </div>
    </Modal>
  );
});

const Superviseur = () => {
  const { cache, setCache } = useAppContext();
  
  // États initiaux
  const [inventoryData, setInventoryData] = useState(cache.inventoryData || []);
  const [projects, setProjects] = useState(cache.projects || []);
  const [posts, setPosts] = useState(cache.posts || []);
  const [loading, setLoading] = useState(!cache.lastUpdated);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedFournisseur, setSelectedFournisseur] = useState("Tous");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    project: "",
    post: "",
    boat_name: "",
    comment: ""
  });

  //validation en temps réel lorsque les champs changent
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({...prev, [fieldName]: value}));
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: validateField(fieldName, value)
    }));
  }, []);

  // Debounce la recherche
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Mémoïsation des fournisseurs
  const fournisseurOptions = useMemo(() => 
    ["Tous", ...new Set(inventoryData.map(item => item.fournisseur))],
    [inventoryData]
  );

  // Chargement des données avec cache optimisé
  const fetchData = useCallback(async () => {
    const now = Date.now();
    
    // Utiliser le cache si valide
    if (cache.lastUpdated && now - cache.lastUpdated < CACHE_EXPIRATION_TIME) {
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Vérifier d'abord quelles données doivent être rafraîchies
      const shouldFetchInventory = !cache.inventoryData || now - cache.lastUpdated >= CACHE_EXPIRATION_TIME;
      const shouldFetchProjects = !cache.projects || now - cache.lastUpdated >= CACHE_EXPIRATION_TIME;
      const shouldFetchPosts = !cache.posts || now - cache.lastUpdated >= CACHE_EXPIRATION_TIME;

      const promises = [];
      
      if (shouldFetchInventory) promises.push(axios.get(Endpoint.inventory));
      if (shouldFetchProjects) promises.push(axios.get(Endpoint.affaires));
      if (shouldFetchPosts) promises.push(axios.get(Endpoint.postes));

      if (promises.length > 0) {
        const results = await Promise.all(promises);
        
        const newCache = {
          ...cache,
          lastUpdated: now
        };
        
        let resultIndex = 0;
        if (shouldFetchInventory) {
          newCache.inventoryData = results[resultIndex++].data;
          setInventoryData(newCache.inventoryData);
        }
        if (shouldFetchProjects) {
          newCache.projects = results[resultIndex++].data;
          setProjects(newCache.projects);
        }
        if (shouldFetchPosts) {
          newCache.posts = results[resultIndex].data;
          setPosts(newCache.posts);
        }
        
        setCache(newCache);
      }
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [cache, setCache]);

  // Synchronisation avec le cache
  useEffect(() => {
    if (cache.lastUpdated) {
      if (cache.inventoryData) setInventoryData(cache.inventoryData);
      if (cache.projects) setProjects(cache.projects);
      if (cache.posts) setPosts(cache.posts);
    }
  }, [cache]);

  // Chargement initial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrage optimisé des données
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm && selectedFournisseur === "Tous") {
      return inventoryData; // Retourne directement si pas de filtrage
    }

    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    
    return inventoryData.filter(item => {
      // Filtre fournisseur d'abord (moins coûteux)
      if (selectedFournisseur !== "Tous" && item.fournisseur !== selectedFournisseur) {
        return false;
      }
      
      // Filtre recherche seulement si terme saisi
      if (debouncedSearchTerm) {
        return (
          item.ref_interne?.toLowerCase().includes(lowercasedTerm) ||
          item.designation?.toLowerCase().includes(lowercasedTerm) ||
          item.fournisseur?.toLowerCase().includes(lowercasedTerm)
        );
      }
      
      return true;
    });
  }, [debouncedSearchTerm, inventoryData, selectedFournisseur]);

  // Gestion des sélections d'items
  const handleItemSelection = useCallback((item) => {
    setSelectedItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, { 
          ...item, 
          quantity: 0,
          quantity_pose: '',
          quantity_bateau: ''
        }];
      }
    });
  }, []);

  // Gestion des quantités
  const handleQuantityChange = useCallback((id, field, value) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === id ? { 
          ...item, 
          [field]: value === '' ? '--' : Math.max(0, parseInt(value) || 0)
        } : item
      )
    );
  }, []);

  // Handlers stables pour les événements
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFournisseurChange = useCallback((event, newValue) => {
    setSelectedFournisseur(newValue || "Tous");
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsRequestModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsRequestModalOpen(false);
    setValidationErrors({});
  }, []);

  // Soumission de la demande
  const handleSubmitRequest = useCallback(async () => {
    // Valider les champs avant soumission
    const errors = validateDemande(formData);
    setValidationErrors(errors);
  
    // Vérifier s'il y a des erreurs ou si aucun article n'est sélectionné
    if (Object.values(errors).some(error => error) || selectedItems.length === 0) {
      setSnackbarMessage("Veuillez corriger les erreurs avant de soumettre");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    try {
      const requestData = {
        project: formData.project,
        post: formData.post,
        boat_name: formData.boat_name,
        comment: formData.comment,
        items: selectedItems.map(item => ({
          itemId: item.id,
          ref_interne: item.ref_interne,
          quantity: item.quantity === '--' ? 0 : item.quantity,
          quantity_pose: item.quantity_pose === '--' ? 0 : item.quantity_pose,
          quantity_bateau: item.quantity_bateau === '--' ? 0 : item.quantity_bateau,
          unite: item.unite || '--'
        }))
      };
  
      await axios.post(Endpoint.request, requestData);
      handleCloseModal();
      setSelectedItems([]);
      setFormData({ project: "", post: "", boat_name: "", comment: "" });
      
      setSnackbarMessage("Demande créée avec succès!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Submit error:", err);
      setSnackbarMessage("Erreur lors de la création de la demande");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [formData, selectedItems, handleCloseModal]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // Composant de ligne virtualisé
  const TableBody = React.memo(({ data }) => {
    const Row = React.memo(({ index, style }) => {
      const item = data[index];
      return (
        <TableRow 
          item={item} 
          selectedItems={selectedItems} 
          handleItemSelection={handleItemSelection}
          style={style}
        />
      );
    });

    return (
      <List
        height={600}
        itemCount={data.length}
        itemSize={50}
        width="100%"
      >
        {Row}
      </List>
    );
  });

  return (
    <div className="superviseur-page-container">
      <div className="superviseur-header-bar">
        <div className="superviseur-search-container">
          <TextField
            type="text"
            placeholder="Rechercher..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: 300, marginRight: 2 }}
          />

          <Autocomplete
            options={fournisseurOptions}
            value={selectedFournisseur}
            onChange={handleFournisseurChange}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Fournisseur" 
                size="small" 
                sx={{ width: 250 }} 
              />
            )}
          />
        </div>
        
        <button 
          className="superviseur-create-request-btn"
          onClick={handleOpenModal}
          disabled={loading || selectedItems.length === 0}
        >
          <FaPlus /> Créer une demande
        </button>
      </div>
      
      {loading ? (
        <div className="superviseur-loading-container">
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <div className="superviseur-table-wrapper">
          <div className="superviseur-virtualized-table">
            <div className="superviseur-table-header">
              <div className="superviseur-header-cell superviseur-selection-cell">Sélection</div>
              <div className="superviseur-header-cell">Réf interne</div>
              <div className="superviseur-header-cell">Désignation</div>
              <div className="superviseur-header-cell">Fournisseur</div>
              <div className="superviseur-header-cell">Unité</div>
            </div>
            
            {filteredData.length > 0 ? (
              <TableBody data={filteredData} />
            ) : (
              <div className="superviseur-no-results">
                Aucun résultat trouvé
              </div>
            )}
          </div>
        </div>
      )}

      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={handleCloseModal}
        projects={projects}
        posts={posts}
        selectedItems={selectedItems}
        onSubmit={handleSubmitRequest}
        onQuantityChange={handleQuantityChange}
        formData={formData}
        handleFieldChange={handleFieldChange}
        validationErrors={validationErrors}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Superviseur;