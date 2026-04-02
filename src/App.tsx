import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Categories } from './components/Categories';
import { Suppliers } from './components/Suppliers';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { useInventory } from './hooks/useInventory';
import { Menu } from 'lucide-react';
import { Login } from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    products, movements, categories, suppliers, stats, settings, user, loading,
    setSettings, login, logout, changePassword, addProduct, updateProduct, deleteProduct, 
    addCategory, deleteCategory, addSupplier, deleteSupplier,
    formatPrice 
  } = useInventory();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Chargement de StockMaster...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45, backdropFilter: 'blur(2px)' }} 
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
        onLogout={logout} 
        user={user} 
        isOpen={isSidebarOpen}
      />
      
      <main style={{ 
        flex: 1, 
        marginLeft: window.innerWidth > 1024 ? '280px' : '0', 
        minHeight: '100vh', 
        background: 'var(--bg-primary)',
        transition: 'margin 0.3s ease'
      }}>
        {/* Mobile Header */}
        <header style={{ 
          display: window.innerWidth <= 1024 ? 'flex' : 'none', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '1rem', 
          background: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>StockMaster</h2>
          <div style={{ width: '40px' }} /> {/* Spacer */}
        </header>
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            recentMovements={movements} 
            products={products}
            categories={categories}
            formatPrice={formatPrice} 
          />
        )}
        
        {activeTab === 'inventory' && (
          <Inventory 
            products={products} 
            categories={categories}
            suppliers={suppliers}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
            formatPrice={formatPrice}
          />
        )}

        {activeTab === 'categories' && (
          <Categories 
            categories={categories}
            onAdd={addCategory}
            onDelete={deleteCategory}
          />
        )}

        {activeTab === 'suppliers' && (
          <Suppliers 
            suppliers={suppliers}
            onAdd={addSupplier}
            onDelete={deleteSupplier}
          />
        )}

        {activeTab === 'history' && (
          <div style={{ padding: '2rem' }}>
            <h1>Historique Complet</h1>
            <p>Suivi détaillé des mouvements de stock.</p>
            <div className="glass-card" style={{ marginTop: '2rem', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1.2rem' }}>Date</th>
                    <th style={{ padding: '1.2rem' }}>Produit</th>
                    <th style={{ padding: '1.2rem' }}>Opération</th>
                    <th style={{ padding: '1.2rem' }}>Quantité</th>
                    <th style={{ padding: '1.2rem' }}>Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(m.date).toLocaleString()}</td>
                      <td style={{ padding: '1.2rem', fontWeight: 600 }}>{m.productName}</td>
                      <td style={{ padding: '1.2rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem',
                          background: m.type === 'IN' ? 'rgba(50, 200, 100, 0.1)' : 'rgba(255, 50, 50, 0.1)',
                          color: m.type === 'IN' ? 'var(--success)' : 'var(--error)'
                        }}>
                          {m.type === 'IN' ? 'ARRIVAGE' : 'SORTIE'}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem', fontWeight: 700 }}>{m.quantity}</td>
                      <td style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{m.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <Reports 
            products={products}
            movements={movements}
            formatPrice={formatPrice}
          />
        )}

        {activeTab === 'settings' && (
          <Settings 
            settings={settings} 
            onSettingsChange={setSettings} 
            user={user}
            onChangePassword={changePassword}
          />
        )}
      </main>
    </div>
  );
}

export default App;
