import React, { useState } from 'react';
import type { Supplier } from '../types';
import { Plus, User, Mail, Phone, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuppliersProps {
  suppliers: Supplier[];
  onAdd: (supplier: any) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const Suppliers: React.FC<SuppliersProps> = ({ suppliers, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSup, setNewSup] = useState({ name: '', contact: '', email: '', phone: '' });

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newSup);
    setIsModalOpen(false);
    setNewSup({ name: '', contact: '', email: '', phone: '' });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Fournisseurs</h1>
          <p>Gérez vos relations commerciales et contacts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Nouveau Fournisseur
        </button>
      </header>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            className="input" 
            style={{ paddingLeft: '2.5rem' }} 
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-dashboard">
        <AnimatePresence>
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card"
              style={{ padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{s.name}</h3>
                <button onClick={() => onDelete(s.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} /> {s.contact}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} /> {s.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} /> {s.phone}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Nouveau Fournisseur</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Nom de l'entreprise</label>
                <input required className="input" value={newSup.name} onChange={e => setNewSup({...newSup, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Contact Principal</label>
                <input required className="input" value={newSup.contact} onChange={e => setNewSup({...newSup, contact: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Email</label>
                <input type="email" required className="input" value={newSup.email} onChange={e => setNewSup({...newSup, email: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Téléphone</label>
                <input required className="input" value={newSup.phone} onChange={e => setNewSup({...newSup, phone: e.target.value})} />
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
