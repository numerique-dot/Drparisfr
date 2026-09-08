import React, { useState, useMemo, useRef } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Clock, 
  Sparkles, 
  Check, 
  X, 
  RefreshCw, 
  Download, 
  Upload, 
  LayoutGrid, 
  List, 
  FolderPlus, 
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowUpDown,
  Image as ImageIcon
} from 'lucide-react';
import { ServiceItem } from '../types';
import { 
  useServices, 
  PRESET_SERVICE_IMAGES, 
  addCustomCategory, 
  getAvailableCategories, 
  saveStoredServices,
  getResolvedImageUrl
} from '../lib/adminUtils';

interface AdminTarifsManagerProps {
  triggerAlert: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminTarifsManager: React.FC<AdminTarifsManagerProps> = ({ triggerAlert }) => {
  const { 
    services, 
    categories: serviceCategories, 
    addService, 
    updateService, 
    deleteService, 
    resetServices 
  } = useServices();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  // Modal: Add / Edit Service
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('⭐ SOIN SIGNATURE');
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('45 min');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState(PRESET_SERVICE_IMAGES[0].url);

  // Quick inline price editing state
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlinePriceVal, setInlinePriceVal] = useState('');

  // Confirmation modals
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Available categories list including standard & custom
  const allAvailableCategories = useMemo(() => {
    return getAvailableCategories();
  }, [services]);

  // Statistics calculation
  const stats = useMemo(() => {
    const prices = services
      .map(s => {
        const num = parseFloat((s.price || '').replace(/[^0-9.]/g, ''));
        return isNaN(num) ? null : num;
      })
      .filter((n): n is number => n !== null);

    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

    return {
      total: services.length,
      categoriesCount: serviceCategories.filter(c => c !== 'Tous').length,
      minPrice,
      maxPrice,
      avgPrice
    };
  }, [services, serviceCategories]);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let list = [...services];

    if (selectedCategory !== 'Tous') {
      list = list.filter(s => s.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.price && s.price.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => {
        const pA = parseFloat((a.price || '').replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0;
        return pA - pB;
      });
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => {
        const pA = parseFloat((a.price || '').replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [services, selectedCategory, searchQuery, sortBy]);

  // Open modal to add a new service
  const handleOpenAdd = () => {
    setEditingServiceId(null);
    setFormName('');
    setFormCategory(selectedCategory !== 'Tous' ? selectedCategory : '⭐ SOIN SIGNATURE');
    setIsNewCategoryMode(false);
    setFormCustomCategory('');
    setFormPrice('');
    setFormDuration('45 min');
    setFormDescription('');
    setFormImage(PRESET_SERVICE_IMAGES[0].url);
    setIsModalOpen(true);
  };

  // Open modal to edit existing service
  const handleOpenEdit = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setFormName(service.name);
    setFormCategory(service.category || '⭐ SOIN SIGNATURE');
    setIsNewCategoryMode(false);
    setFormCustomCategory('');
    setFormPrice(service.price || '');
    setFormDuration(service.duration || '45 min');
    setFormDescription(service.description || '');
    setFormImage(service.image || PRESET_SERVICE_IMAGES[0].url);
    setIsModalOpen(true);
  };

  // Save Service (Create or Update)
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      triggerAlert('Veuillez renseigner le nom de la prestation.', 'error');
      return;
    }

    let finalCategory = formCategory;
    if (isNewCategoryMode) {
      if (!formCustomCategory.trim()) {
        triggerAlert('Veuillez indiquer le nom de la nouvelle catégorie.', 'error');
        return;
      }
      finalCategory = formCustomCategory.trim();
      addCustomCategory(finalCategory);
    }

    let formattedPrice = formPrice.trim();
    if (!formattedPrice) {
      formattedPrice = '0 €';
    } else if (/^\d+(\.\d+)?$/.test(formattedPrice)) {
      formattedPrice = `${formattedPrice} €`;
    }

    if (editingServiceId) {
      // Update
      const success = updateService(editingServiceId, {
        name: formName.trim(),
        category: finalCategory,
        price: formattedPrice,
        duration: formDuration.trim() || '30 min',
        description: formDescription.trim() || "Soin d'excellence dispensé au salon.",
        image: formImage
      });

      if (success) {
        triggerAlert(`La prestation "${formName}" a été mise à jour avec succès.`, 'success');
      } else {
        triggerAlert('Erreur lors de la mise à jour de la prestation.', 'error');
      }
    } else {
      // Add
      addService({
        name: formName.trim(),
        category: finalCategory,
        price: formattedPrice,
        duration: formDuration.trim() || '30 min',
        description: formDescription.trim() || "Soin d'excellence dispensé au salon.",
        image: formImage
      });

      triggerAlert(`Nouvelle prestation "${formName}" ajoutée au catalogue et synchronisée !`, 'success');
    }

    setIsModalOpen(false);
  };

  // Duplicate a service
  const handleDuplicate = (service: ServiceItem) => {
    const newName = `${service.name} (Copie)`;
    addService({
      name: newName,
      category: service.category,
      price: service.price,
      duration: service.duration,
      description: service.description,
      image: service.image
    });
    triggerAlert(`Prestation "${newName}" dupliquée avec succès.`, 'success');
  };

  // Delete service confirmation
  const handleConfirmDelete = () => {
    if (!serviceToDelete) return;
    const name = serviceToDelete.name;
    const success = deleteService(serviceToDelete.id);
    if (success) {
      triggerAlert(`La prestation "${name}" a été supprimée du catalogue.`, 'success');
    }
    setServiceToDelete(null);
  };

  // Inline Fast Price Edit
  const handleStartInlineEdit = (service: ServiceItem) => {
    setInlineEditId(service.id);
    setInlinePriceVal(service.price ? service.price.replace('€', '').trim() : '');
  };

  const handleSaveInlinePrice = (service: ServiceItem) => {
    let newVal = inlinePriceVal.trim();
    if (!newVal) {
      setInlineEditId(null);
      return;
    }
    if (/^\d+(\.\d+)?$/.test(newVal)) {
      newVal = `${newVal} €`;
    } else if (!newVal.includes('€')) {
      newVal = `${newVal} €`;
    }

    updateService(service.id, { price: newVal });
    triggerAlert(`Prix du soin "${service.name}" modifié en : ${newVal}`, 'success');
    setInlineEditId(null);
  };

  // Add custom category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    addCustomCategory(newCatInput.trim());
    setSelectedCategory(newCatInput.trim());
    triggerAlert(`Nouvelle catégorie "${newCatInput.trim()}" créée avec succès.`, 'success');
    setNewCatInput('');
    setIsCategoryModalOpen(false);
  };

  // Reset to default catalog
  const handleConfirmReset = () => {
    resetServices();
    triggerAlert('Le catalogue a été restauré avec succès aux 77 prestations d\'origine.', 'success');
    setIsResetConfirmOpen(false);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(services, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dr_sante_tarifs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerAlert('Catalogue de tarifs exporté en fichier JSON.', 'info');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveStoredServices(parsed);
          triggerAlert(`Importation réussie : ${parsed.length} prestations chargées et appliquées en direct !`, 'success');
        } else {
          triggerAlert('Le fichier JSON ne contient pas de catalogue valide.', 'error');
        }
      } catch (err) {
        triggerAlert('Erreur lors de la lecture du fichier JSON.', 'error');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Duration presets for quick selection
  const durationPresets = ['15 min', '20 min', '30 min', '45 min', '60 min', '75 min', '90 min', '1h30', '2h'];

  return (
    <div className="bg-slate-950/40 border border-purple-950/40 rounded-3xl p-6 sm:p-8 space-y-6 animate-scale-up">
      {/* Hidden file input for JSON import */}
      <input 
        type="file" 
        ref={jsonFileInputRef} 
        onChange={handleImportJSON} 
        accept=".json" 
        className="hidden" 
      />

      {/* TOP HEADER & ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-purple-300 rounded border border-primary/30 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Éditeur Tarifaire & Prestations en Ligne
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
              ● Synchro Directe
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-7 h-7 text-primary" /> Catalogue des Soins & Tarifs
            <span className="text-xs text-accent font-normal hidden sm:inline">(价目表与项目增删改)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Ajoutez de nouveaux soins, modifiez les prix en 1 clic, ajustez les descriptions ou supprimez des prestations.
            Tous les changements sont répercutés instantanément sur la page <strong>Prestations</strong>, la <strong>Réservation</strong> et l'<strong>Accueil</strong>.
          </p>
        </div>

        {/* Global CTA actions */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-900/30 transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Ajouter une Prestation
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
            title="Créer une nouvelle catégorie"
          >
            <FolderPlus className="w-4 h-4 text-purple-400" /> Nouvelle Catégorie
          </button>

          <button
            onClick={handleExportJSON}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            title="Exporter le catalogue au format JSON (Sauvegarde)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => jsonFileInputRef.current?.click()}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            title="Importer un fichier catalogue JSON"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="p-3 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 text-rose-300 rounded-xl transition cursor-pointer"
            title="Restaurer le catalogue aux 77 soins par défaut"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Total Prestations</span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">{stats.total}</div>
          <div className="text-[10px] text-purple-300 mt-0.5">Soins actifs au menu</div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Catégories</span>
            <Layers className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">{stats.categoriesCount}</div>
          <div className="text-[10px] text-accent mt-0.5">Rayons esthétiques</div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Tarif Moyen</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats.avgPrice} €</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Moyenne du salon</div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Fourchette Prix</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-black text-white font-mono mt-1.5">{stats.minPrice} € — {stats.maxPrice} €</div>
          <div className="text-[10px] text-slate-400 mt-0.5">De l'option au rituel</div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par soin, tarif, zone (ex: Russe, 45€, Cils, Visage)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort and View Mode */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="default">Ordre d'origine</option>
              <option value="name">Trier par Nom (A-Z)</option>
              <option value="price-asc">Prix croissant (€ → €€€)</option>
              <option value="price-desc">Prix décroissant (€€€ → €)</option>
            </select>

            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'cards' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                title="Vue Cartes"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                title="Vue Tableau Liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills (horizontal scrollable) */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {serviceCategories.map((cat) => {
            const count = cat === 'Tous' 
              ? services.length 
              : services.filter(s => s.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected 
                    ? 'bg-primary text-white shadow-md shadow-purple-900/50 ring-1 ring-primary' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ZERO RESULTS EMPTY STATE */}
      {filteredServices.length === 0 && (
        <div className="text-center py-16 bg-slate-950/60 rounded-3xl border border-slate-800">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">Aucune prestation ne correspond à vos critères</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Essayez de modifier votre terme de recherche ou sélectionnez une autre catégorie.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('Tous'); }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-bold"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* ========================================================
          1. CARDS GRID VIEW
          ======================================================== */}
      {viewMode === 'cards' && filteredServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const isEditingPrice = inlineEditId === service.id;

            return (
              <div 
                key={service.id}
                className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all group"
              >
                <div>
                  {/* Top image & Category Badge */}
                  <div className="flex gap-3.5 mb-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-800 relative bg-slate-900">
                      <img 
                        src={getResolvedImageUrl(service.image || PRESET_SERVICE_IMAGES[0].url)} 
                        alt={service.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // fallback
                          (e.target as HTMLElement).setAttribute('src', PRESET_SERVICE_IMAGES[0].url);
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider bg-purple-950/70 border border-purple-500/20 text-purple-300 rounded-md mb-1 truncate max-w-full">
                        {service.category}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {service.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{service.duration || '30 min'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed bg-slate-900/50 p-2 rounded-xl border border-slate-800/40">
                    {service.description || "Aucune description renseignée."}
                  </p>
                </div>

                {/* Bottom Price & Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {/* Price Section with Inline Fast-Edit */}
                  <div className="flex items-center gap-1.5">
                    {isEditingPrice ? (
                      <div className="flex items-center gap-1 bg-slate-900 border border-primary rounded-lg p-0.5 animate-scale-up">
                        <input
                          type="text"
                          value={inlinePriceVal}
                          onChange={(e) => setInlinePriceVal(e.target.value)}
                          placeholder="45 €"
                          className="w-16 bg-slate-950 text-white font-mono font-bold text-xs px-2 py-1 rounded focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveInlinePrice(service);
                            if (e.key === 'Escape') setInlineEditId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveInlinePrice(service)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                          title="Enregistrer le prix"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setInlineEditId(null)}
                          className="p-1 text-slate-400 hover:text-white cursor-pointer"
                          title="Annuler"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleStartInlineEdit(service)}
                        className="flex items-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 px-2.5 py-1 rounded-xl cursor-pointer transition group/price"
                        title="Cliquez pour modifier le prix rapidement"
                      >
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          {service.price || '0 €'}
                        </span>
                        <Edit3 className="w-3 h-3 text-emerald-500/70 group-hover/price:text-emerald-300 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                      title="Modifier tous les détails du soin"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(service)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                      title="Dupliquer ce soin"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setServiceToDelete(service)}
                      className="p-2 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/20 text-rose-400 hover:text-rose-200 rounded-xl transition cursor-pointer"
                      title="Supprimer cette prestation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          2. COMPACT TABLE VIEW
          ======================================================== */}
      {viewMode === 'table' && filteredServices.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Aperçu</th>
                <th className="p-3.5">Nom de la Prestation</th>
                <th className="p-3.5">Catégorie</th>
                <th className="p-3.5">Durée</th>
                <th className="p-3.5">Tarif</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredServices.map((service) => {
                const isEditingPrice = inlineEditId === service.id;

                return (
                  <tr key={service.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3">
                      <img 
                        src={getResolvedImageUrl(service.image || PRESET_SERVICE_IMAGES[0].url)} 
                        alt={service.name} 
                        className="w-12 h-12 rounded-lg object-cover border border-slate-800"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', PRESET_SERVICE_IMAGES[0].url);
                        }}
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{service.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{service.description}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/70 text-purple-300 border border-purple-500/20">
                        {service.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {service.duration || '30 min'}
                    </td>
                    <td className="p-3 font-mono">
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={inlinePriceVal}
                            onChange={(e) => setInlinePriceVal(e.target.value)}
                            className="w-16 bg-slate-900 text-white font-bold text-xs px-2 py-1 rounded border border-primary"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlinePrice(service);
                              if (e.key === 'Escape') setInlineEditId(null);
                            }}
                          />
                          <button
                            onClick={() => handleSaveInlinePrice(service)}
                            className="p-1 bg-emerald-600 text-white rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span 
                          onClick={() => handleStartInlineEdit(service)}
                          className="font-extrabold text-emerald-400 cursor-pointer hover:underline text-sm"
                          title="Modifier le prix"
                        >
                          {service.price || '0 €'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(service)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(service)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setServiceToDelete(service)}
                          className="p-1.5 bg-rose-950/40 text-rose-400 hover:text-rose-200 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT SERVICE
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-scale-up text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                {editingServiceId ? 'Modifier la Prestation' : 'Ajouter une Nouvelle Prestation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-base">✕</button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-5">
              {/* Service Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  Nom de la Prestation / Soin *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Manucure Russe Signature avec Gel Semi-Permanent"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary text-sm font-semibold"
                />
              </div>

              {/* Category selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">
                    Catégorie / Rayon *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewCategoryMode(!isNewCategoryMode)}
                    className="text-[10px] text-primary hover:text-accent font-bold"
                  >
                    {isNewCategoryMode ? 'Choisir une catégorie existante' : '+ Créer une nouvelle catégorie'}
                  </button>
                </div>

                {isNewCategoryMode ? (
                  <input
                    type="text"
                    required
                    placeholder="Tapez le nom de la nouvelle catégorie (ex : Soins Mariage & VIP)..."
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                ) : (
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  >
                    {allAvailableCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Price & Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Tarif / Prix (€) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : 45 € ou 45"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Le symbole € sera ajouté automatiquement si omis.</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Durée Estimée
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : 45 min"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {durationPresets.slice(0, 6).map((dp) => (
                      <button
                        type="button"
                        key={dp}
                        onClick={() => setFormDuration(dp)}
                        className={`text-[9.5px] px-2 py-0.5 rounded border transition ${
                          formDuration === dp 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {dp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  Description Détaillée du Soin
                </label>
                <textarea
                  rows={3}
                  placeholder="Décrivez les étapes du soin, les bienfaits pour la peau ou les ongles, les protocoles utilisés..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary text-xs leading-relaxed"
                />
              </div>

              {/* Image Selection */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  Photo Illustrative du Soin
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="URL de l'image (https://...)"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-mono"
                  />

                  {/* Preset Photos Thumbnails Picker */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1.5">Ou choisissez parmi nos visuels salon haute définition :</span>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_SERVICE_IMAGES.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => setFormImage(p.url)}
                          className={`relative rounded-xl overflow-hidden h-14 border cursor-pointer group transition ${
                            formImage === p.url 
                              ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-slate-950' 
                              : 'border-slate-800 opacity-70 hover:opacity-100'
                          }`}
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                          {formImage === p.url && (
                            <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 font-bold text-xs uppercase">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer"
                >
                  {editingServiceId ? 'Enregistrer les Modifications' : 'Créer et Publier le Soin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRM DELETE
          ======================================================== */}
      {serviceToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-950 border border-rose-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 animate-scale-up text-xs">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="h-10 w-10 bg-rose-950/60 border border-rose-500/30 rounded-2xl flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Supprimer cette prestation ?</h3>
                <p className="text-[11px] text-slate-400">Cette action retirera le soin de la carte et du système de réservation.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="font-bold text-white text-sm">{serviceToDelete.name}</div>
              <div className="text-xs text-purple-300 mt-0.5">{serviceToDelete.category} — {serviceToDelete.price}</div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800 font-bold uppercase text-xs">
              <button
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow cursor-pointer"
              >
                Confirmer la Suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRM RESTORE DEFAULT CATALOG
          ======================================================== */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-950 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-4 animate-scale-up text-xs">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="h-10 w-10 bg-amber-950/60 border border-amber-500/30 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Restaurer le catalogue par défaut ?</h3>
                <p className="text-[11px] text-slate-400">Les 77 prestations d'origine et tarifs standard seront réinitialisés.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
              ⚠️ Attention : les prestations ajoutées manuellement seront remplacées par le menu officiel d'origine.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800 font-bold uppercase text-xs">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow cursor-pointer"
              >
                Restaurer le Catalogue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW CATEGORY
          ======================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-primary" /> Nouvelle Catégorie
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  Nom de la Catégorie / Rayon
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Soins Mariage & Événements, Spa VIP..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800 font-bold uppercase text-xs">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-accent text-white rounded-xl shadow cursor-pointer"
                >
                  Créer la Catégorie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
