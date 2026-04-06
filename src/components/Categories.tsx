import { useState } from 'react';
import type { Category } from '../types';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoriesProps {
  categories: Category[];
  onAdd: (name: string, description?: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const Categories = ({ categories, onAdd, onDelete }: CategoriesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    onAdd(newName, newDesc);
    setIsModalOpen(false);
    setNewName('');
    setNewDesc('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Catégories</h1>
          <p>Organisez vos produits par groupes logiques.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Nouvelle Catégorie
        </button>
      </header>

      <div className="grid-dashboard">
        <AnimatePresence>
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}
            >
              <div style={{ padding: '10px', background: 'var(--accent-glow)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                <Tag size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{c.name}</h3>
                  <button onClick={() => onDelete(c.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{c.description || 'Aucune description.'}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Nouvelle Catégorie</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Nom de la catégorie</label>
                <input required className="input" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Description (Optionnel)</label>
                <textarea className="input" style={{ height: '80px', resize: 'none' }} value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
