import React, { useState } from 'react';
import type { Product, Category, Supplier } from '../types';
import { Plus, Search, Trash2, AlertTriangle, Barcode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InventoryProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  onAdd: (product: any) => Promise<boolean>;
  onUpdate: (id: string, updates: any, reason: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  formatPrice: (price: number) => string;
}

export const Inventory = ({ products, categories, suppliers, onAdd, onUpdate, onDelete, formatPrice }: InventoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustData, setAdjustData] = useState({ type: 'IN' as 'IN' | 'OUT', quantity: 0, reason: '', reference: '' });
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', categoryId: '', supplierId: '', price: 0, quantity: 0, minQuantity: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const success = await onAdd(newProduct);
      if (success) {
        setIsModalOpen(false);
        setNewProduct({ name: '', sku: '', categoryId: '', supplierId: '', price: 0, quantity: 0, minQuantity: 5 });
      } else {
        setError("Erreur lors de l'ajout. Vérifiez les politiques RLS.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setError(null);
    setIsSubmitting(true);
    try {
      const qtyChange = adjustData.type === 'IN' ? adjustData.quantity : -adjustData.quantity;
      const newQty = selectedProduct.quantity + qtyChange;
      
      const success = await onUpdate(selectedProduct.id, { quantity: newQty }, adjustData.reason);
      if (success) {
        setIsAdjustOpen(false);
        setAdjustData({ type: 'IN', quantity: 0, reason: '', reference: '' });
      } else {
        setError("Erreur lors de la mise à jour.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateScan = () => {
    setIsScannerOpen(true);
    setTimeout(() => {
      setIsScannerOpen(false);
      setSearchTerm('LAP-001'); // Simulates finding a product
    }, 2000);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Inventaire Global</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={simulateScan}>
            <Barcode size={20} /> Scanner
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Ajouter un produit
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: '2.5rem' }} placeholder="Rechercher par nom ou SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.2rem' }}>Produit</th>
              <th style={{ padding: '1.2rem' }}>SKU</th>
              <th style={{ padding: '1.2rem' }}>Catégorie</th>
              <th style={{ padding: '1.2rem' }}>Fournisseur</th>
              <th style={{ padding: '1.2rem' }}>Stock</th>
              <th style={{ padding: '1.2rem' }}>Prix</th>
              <th style={{ padding: '1.2rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.2rem', fontWeight: 600 }}>{product.name}</td>
                  <td style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>{product.sku}</td>
                  <td style={{ padding: '1.2rem' }}>
                    <span style={{ padding: '0.3rem 0.6rem', background: 'var(--bg-tertiary)', borderRadius: '20px', fontSize: '0.8rem' }}>
                      {categories.find(c => c.id === product.categoryId)?.name || 'Inconnue'}
                    </span>
                  </td>
                  <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>
                    {suppliers.find(s => s.id === product.supplierId)?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: product.quantity <= product.minQuantity ? 'var(--error)' : 'var(--text-primary)' }}>
                        {product.quantity}
                      </span>
                      {product.quantity <= product.minQuantity && <AlertTriangle size={14} color="var(--warning)" />}
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem' }}>{formatPrice(product.price)}</td>
                  <td style={{ padding: '1.2rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem', border: '1px solid var(--border)', fontSize: '0.75rem' }} 
                        onClick={() => { setSelectedProduct(product); setIsAdjustOpen(true); }}>
                        Ajuster
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem', border: 'none' }} onClick={() => onDelete(product.id)}>
                        <Trash2 size={16} color="var(--error)" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 101 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Nouveau Produit</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Nom</label>
                  <input required className="input" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>SKU</label>
                  <input required className="input" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Prix</label>
                  <input type="number" required className="input" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Catégorie</label>
                  <select required className="input" value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Fournisseur</label>
                  <select required className="input" value={newProduct.supplierId} onChange={e => setNewProduct({...newProduct, supplierId: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Stock</label>
                  <input type="number" required className="input" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Seuil Alerte</label>
                  <input type="number" required className="input" value={newProduct.minQuantity} onChange={e => setNewProduct({...newProduct, minQuantity: Number(e.target.value)})} />
                </div>
              </div>
              
              {error && (
                <div style={{ padding: '0.8rem', background: 'rgba(255, 50, 50, 0.1)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid rgba(255, 50, 50, 0.2)' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setIsModalOpen(false); setError(null); }} disabled={isSubmitting}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isAdjustOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 101 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Ajuster le Stock : {selectedProduct?.name}</h2>
            <form onSubmit={handleAdjustSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Type de Mouvement</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className={`btn ${adjustData.type === 'IN' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setAdjustData({...adjustData, type: 'IN'})}>ENTRÉE</button>
                  <button type="button" className={`btn ${adjustData.type === 'OUT' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, color: adjustData.type === 'OUT' ? 'white' : 'var(--error)', background: adjustData.type === 'OUT' ? 'var(--error)' : 'transparent' }} onClick={() => setAdjustData({...adjustData, type: 'OUT'})}>SORTIE</button>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Quantité</label>
                <input type="number" required min="1" className="input" value={adjustData.quantity} onChange={e => setAdjustData({...adjustData, quantity: Number(e.target.value)})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Motif / Référence</label>
                <input required className="input" placeholder="Ex: Livraison fournisseur, Vente directe..." value={adjustData.reason} onChange={e => setAdjustData({...adjustData, reason: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsAdjustOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Valider</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isScannerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '300px', height: '300px', border: '2px solid var(--accent-primary)', position: 'relative' }}>
             <motion.div animate={{ top: ['0%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
          </div>
          <h2 style={{ marginTop: '2rem', color: 'white' }}>Scan en cours...</h2>
        </div>
      )}
    </div>
  );
};
