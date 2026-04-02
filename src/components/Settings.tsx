import React, { useState } from 'react';
import type { AppSettings, CurrencyCode, User } from '../types';
import { CURRENCIES } from '../types';
import { CreditCard, Bell, Lock, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  user: User;
  onChangePassword: (oldPass: string, newPass: string) => Promise<boolean>;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, user, onChangePassword }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({
      ...settings,
      currencyCode: e.target.value as CurrencyCode,
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', msg: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: 'error', msg: 'Le mot de passe doit faire au moins 6 caractères.' });
      return;
    }
    
    try {
      const success = await onChangePassword(oldPassword, newPassword);
      if (success) {
        setStatus({ type: 'success', msg: 'Mot de passe modifié avec succès !' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatus({ type: 'error', msg: 'Ancien mot de passe incorrect ou erreur serveur.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Une erreur est survenue.' });
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Paramètres</h1>
        <p>Personnalisez votre expérience StockMaster.</p>
      </header>

      <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>
        <section className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} /> Profil Administrateur
          </h3>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '2rem', fontWeight: 700 }}>
              {user.name[0]}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.name}</p>
              <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              <p style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.6rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>{user.role}</p>
            </div>
          </div>
        </section>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card" 
          style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '10px', background: 'var(--accent-glow)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Préférences Régionales</h2>
              <p style={{ fontSize: '0.875rem' }}>Définissez votre devise et votre langue.</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Devise de l'application</label>
            <select 
              className="input" 
              value={settings.currencyCode} 
              onChange={handleCurrencyChange}
              style={{ paddingRight: '2rem', appearance: 'none', background: 'var(--bg-tertiary) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E") no-repeat right 1rem center' }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label} ({c.symbol})</option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card" 
          style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '10px', background: 'rgba(50, 200, 100, 0.1)', borderRadius: '10px', color: 'var(--success)' }}>
              <Bell size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Notifications</h2>
              <p style={{ fontSize: '0.875rem' }}>Gérez les alertes de stock faible.</p>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Les alertes sont actuellement configurées pour se déclencher automatiquement sous le seuil minimal de chaque produit.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card" 
          style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '10px', background: 'rgba(255, 100, 100, 0.1)', borderRadius: '10px', color: 'var(--error)' }}>
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Sécurité</h2>
              <p style={{ fontSize: '0.875rem' }}>Mettez à jour votre mot de passe administrateur.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'grid', gap: '1.5rem' }}>
            {status && (
              <div style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                background: status.type === 'success' ? 'rgba(50, 200, 100, 0.1)' : 'rgba(255, 100, 100, 0.1)',
                color: status.type === 'success' ? 'var(--success)' : 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '0.9rem'
              }}>
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {status.msg}
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Ancien mot de passe</label>
              <input 
                type="password" 
                className="input" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nouveau mot de passe</label>
                <input 
                  type="password" 
                  className="input" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Confirmer le mot de passe</label>
                <input 
                  type="password" 
                  className="input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
              <Lock size={18} /> Mettre à jour le mot de passe
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
