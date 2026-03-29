import React from 'react';
import type { InventoryStats, Movement, Product, Category } from '../types';
import { TrendingUp, AlertTriangle, DollarSign, Layers, Users, PieChart as PieIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  stats: InventoryStats;
  recentMovements: Movement[];
  products: Product[];
  categories: Category[];
  formatPrice: (price: number) => string;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, recentMovements, products, categories, formatPrice }) => {
  const cards = [
    { label: 'Valeur Totale', value: formatPrice(stats.totalValue), icon: DollarSign, color: 'var(--accent-primary)' },
    { label: 'Produits', value: stats.totalProducts, icon: Layers, color: 'var(--success)' },
    { label: 'Alertes Stock', value: stats.lowStockCount, icon: AlertTriangle, color: 'var(--warning)' },
    { label: 'Fournisseurs', value: stats.suppliersCount, icon: Users, color: 'var(--accent-secondary)' },
  ];

  // Data for Charts
  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: products.filter(p => p.categoryId === cat.id).length
  })).filter(d => d.value > 0);

  const stockData = products.slice(0, 6).map(p => ({
    name: p.name.substring(0, 10),
    stock: p.quantity,
    min: p.minQuantity
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Vue d'ensemble</h1>
        <p>Analyse de la performance de votre stock en temps réel.</p>
      </header>

      <div className="grid-dashboard">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card"
            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
          >
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '12px', 
              background: `${card.color}20`, color: card.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <card.icon size={28} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{card.label}</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{card.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Niveaux de Stock (Top 6)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="stock" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Répartition par Catégorie</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: '2.5rem' }} className="glass-card">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3>Flux Récent de Stock</h3>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {recentMovements.slice(0, 5).map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontWeight: 600, color: m.type === 'IN' ? 'var(--success)' : 'var(--error)' }}>
                  {m.type === 'IN' ? 'Entrée' : 'Sortie'}
                </span>
                <span style={{ margin: '0 1rem' }}>{m.productName}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.reason}</span>
              </div>
              <span style={{ fontWeight: 700 }}>{m.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
