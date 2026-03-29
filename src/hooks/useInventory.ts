import { useState, useEffect } from 'react';
import type { Product, Movement, InventoryStats, AppSettings, Category, Supplier, User } from '../types';
import { CURRENCIES } from '../types';

export const useInventory = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('inventory_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [storedPassword, setStoredPassword] = useState<string>(() => {
    return localStorage.getItem('inventory_pass') || 'admin123';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('inventory_settings');
    return saved ? JSON.parse(saved) : { currencyCode: 'EUR' };
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('inventory_categories');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'cat-1', name: 'Électronique', description: 'Gadgets et ordinateurs' },
      { id: 'cat-2', name: 'Accessoires', description: 'Périphériques divers' },
    ];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('inventory_suppliers');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'sup-1', name: 'TechGlobal Inc', contact: 'John Doe', email: 'john@techglobal.com', phone: '+123456789' },
      { id: 'sup-2', name: 'Accessories Hub', contact: 'Jane Smith', email: 'jane@acc-hub.com', phone: '+987654321' },
    ];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory_products');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Ordinateur Portable Pro', sku: 'LAP-001', categoryId: 'cat-1', supplierId: 'sup-1', price: 1200, quantity: 15, minQuantity: 5, lastUpdated: new Date().toISOString() },
      { id: '2', name: 'Clavier Mécanique RGB', sku: 'KB-002', categoryId: 'cat-2', supplierId: 'sup-2', price: 89, quantity: 3, minQuantity: 10, lastUpdated: new Date().toISOString() },
      { id: '3', name: 'Moniteur 27" 4K', sku: 'MON-003', categoryId: 'cat-1', supplierId: 'sup-1', price: 450, quantity: 8, minQuantity: 2, lastUpdated: new Date().toISOString() },
    ];
  });

  const [movements, setMovements] = useState<Movement[]>(() => {
    const saved = localStorage.getItem('inventory_movements');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('inventory_settings', JSON.stringify(settings));
    localStorage.setItem('inventory_products', JSON.stringify(products));
    localStorage.setItem('inventory_movements', JSON.stringify(movements));
    localStorage.setItem('inventory_categories', JSON.stringify(categories));
    localStorage.setItem('inventory_suppliers', JSON.stringify(suppliers));
    if (user) localStorage.setItem('inventory_user', JSON.stringify(user));
    else localStorage.removeItem('inventory_user');
    localStorage.setItem('inventory_pass', storedPassword);
  }, [settings, products, movements, categories, suppliers, user, storedPassword]);

  const login = (email: string, password: string) => {
    // Check against stored password
    if (email === 'admin@stockmaster.com' && password === storedPassword) {
      setUser({
        id: '1',
        name: 'Administrateur',
        email: 'admin@stockmaster.com',
        role: 'ADMIN'
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (oldPass === storedPassword) {
      setStoredPassword(newPass);
      return true;
    }
    return false;
  };

  const addProduct = (product: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };
    setProducts([...products, newProduct]);
    if (newProduct.quantity > 0) {
      addMovement(newProduct.id, newProduct.name, 'IN', newProduct.quantity, 'Initialisation du stock');
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>, movementReason?: string) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates, lastUpdated: new Date().toISOString() };
        if (updates.quantity !== undefined && updates.quantity !== p.quantity) {
          const diff = updates.quantity - p.quantity;
          addMovement(id, p.name, diff > 0 ? 'IN' : 'OUT', Math.abs(diff), movementReason || 'Mise à jour manuelle');
        }
        return updated;
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    setMovements(movements.filter(m => m.productId !== id));
  };

  const addMovement = (productId: string, productName: string, type: 'IN' | 'OUT', quantity: number, reason: string, reference?: string) => {
    const newMovement: Movement = {
      id: crypto.randomUUID(),
      productId,
      productName,
      type,
      quantity,
      reason,
      reference,
      date: new Date().toISOString(),
    };
    setMovements([newMovement, ...movements].slice(0, 100));
  };

  // Category CRUD
  const addCategory = (name: string, description?: string) => {
    setCategories([...categories, { id: crypto.randomUUID(), name, description }]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  // Supplier CRUD
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    setSuppliers([...suppliers, { ...supplier, id: crypto.randomUUID() }]);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const currentCurrency = CURRENCIES.find(c => c.code === settings.currencyCode) || CURRENCIES[0];

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ${currentCurrency.symbol}`;
  };

  const stats: InventoryStats = {
    totalProducts: products.length,
    totalValue: products.reduce((acc, p) => acc + (p.price * p.quantity), 0),
    lowStockCount: products.filter(p => p.quantity <= p.minQuantity).length,
    categoriesCount: categories.length,
    suppliersCount: suppliers.length,
  };

  return {
    products,
    movements,
    categories,
    suppliers,
    stats,
    settings,
    user,
    currentCurrency,
    setSettings,
    login,
    logout,
    changePassword,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    addSupplier,
    deleteSupplier,
    formatPrice
  };
};
