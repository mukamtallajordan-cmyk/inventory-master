import React, { useState } from 'react';
import { Lock, Mail, Package, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@stockmaster.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Identifiants invalides. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at top right, var(--accent-glow), var(--bg-primary))',
      padding: '1.5rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}
      >
        <div style={{ 
          width: '64px', height: '64px', background: 'var(--accent-primary)', 
          borderRadius: '16px', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', margin: '0 auto 1.5rem',
          boxShadow: '0 0 30px var(--accent-glow)'
        }}>
          <Package size={32} color="white" />
        </div>
        
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>StockMaster</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Espace Administration</p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <Mail size={16} /> Email Professional
            </label>
            <input 
              type="email" 
              className="input" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <Lock size={16} /> Mot de passe
            </label>
            <input 
              type="password" 
              className="input" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ color: 'var(--error)', background: 'rgba(255, 50, 50, 0.1)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(255, 50, 50, 0.2)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', opacity: isSubmitting ? 0.7 : 1 }}>
            <ShieldCheck size={20} />
            {isSubmitting ? 'Connexion...' : 'Se Connecter'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Accès réservé au personnel autorisé. <br/>
          © 2026 StockMaster Enterprise
        </p>
      </motion.div>
    </div>
  );
};
