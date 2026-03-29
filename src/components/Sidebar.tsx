import React from 'react';
import { LayoutDashboard, Package, History, Settings, LogOut, Users, Tags, FileBarChart, User as UserIcon } from 'lucide-react';
import type { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, user, isOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventaire', icon: Package },
    { id: 'categories', label: 'Catégories', icon: Tags },
    { id: 'suppliers', label: 'Fournisseurs', icon: Users },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'reports', label: 'Rapports', icon: FileBarChart },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <aside 
      className="glass" 
      style={{ 
        width: '280px', 
        height: '100vh', 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        zIndex: 50,
        transform: window.innerWidth <= 1024 && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isOpen ? '20px 0 50px rgba(0,0,0,0.5)' : 'none'
      }}
    >
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent-glow)' }}>
            <Package size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>StockMaster</h2>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem', border: '1px solid var(--border)' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserIcon size={16} />
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</p>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        <ul style={{ listStyle: 'none' }}>
          {menuItems.map((item) => (
            <li key={item.id} style={{ marginBottom: '0.4rem' }}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`btn ${activeTab === item.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: 'none' }}
              >
                <item.icon size={20} style={{ opacity: activeTab === item.id ? 1 : 0.7 }} />
                <span style={{ fontSize: '0.925rem' }}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={onLogout} style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--error)', border: 'none' }}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
