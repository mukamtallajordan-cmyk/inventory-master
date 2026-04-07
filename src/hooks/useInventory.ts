import { useState, useEffect } from 'react';
import type { Product, Movement, InventoryStats, AppSettings, Category, Supplier, User } from '../types';
import { CURRENCIES } from '../types';
import { supabase } from '../lib/supabase';

export const useInventory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('inventory_settings');
    return saved ? JSON.parse(saved) : { currencyCode: 'EUR' };
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || 'Utilisateur',
          role: 'ADMIN' // Default for now
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata.full_name || 'Utilisateur',
          role: 'ADMIN'
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Synchronize Settings to LocalStorage as they are lightweight
  useEffect(() => {
    localStorage.setItem('inventory_settings', JSON.stringify(settings));
  }, [settings]);

  // Fetch Data when user is logged in
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [
        { data: categoriesData },
        { data: suppliersData },
        { data: productsData },
        { data: movementsData }
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('products').select('*'),
        supabase.from('movements').select('*').order('date', { ascending: false }).limit(100)
      ]);

      if (categoriesData) setCategories(categoriesData);
      if (suppliersData) setSuppliers(suppliersData);
      
      if (productsData) {
        setProducts(productsData.map((p: any) => ({
          ...p,
          categoryId: p.category_id,
          supplierId: p.supplier_id,
          minQuantity: p.min_quantity,
          lastUpdated: p.last_updated
        })));
      }
      
      if (movementsData) {
        setMovements(movementsData.map((m: any) => ({
          ...m,
          productId: m.product_id,
          productName: m.product_name
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const changePassword = async (_oldPass: string, newPass: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    return !error;
  };

  const addProduct = async (product: Omit<Product, 'id' | 'lastUpdated'>) => {
    const { data, error } = await supabase.from('products').insert([{
      name: product.name,
      sku: product.sku,
      category_id: product.categoryId,
      supplier_id: product.supplierId,
      price: product.price,
      quantity: product.quantity,
      min_quantity: product.minQuantity,
      last_updated: new Date().toISOString()
    }]).select().single();

    if (error) {
      console.error('Error adding product:', error);
      return false;
    }

    if (data) {
      const newProd = {
        ...data,
        categoryId: data.category_id,
        supplierId: data.supplier_id,
        minQuantity: data.min_quantity,
        lastUpdated: data.last_updated
      };
      setProducts([newProd, ...products]);
      if (newProd.quantity > 0) {
        await addMovement(newProd.id, newProd.name, 'IN', newProd.quantity, 'Initialisation du stock');
      }
    }
    return true;
  };

  const updateProduct = async (id: string, updates: Partial<Product>, movementReason?: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return false;

    const mappedUpdates: any = { ...updates };
    if (updates.categoryId) mappedUpdates.category_id = updates.categoryId;
    if (updates.supplierId) mappedUpdates.supplier_id = updates.supplierId;
    if (updates.minQuantity !== undefined) mappedUpdates.min_quantity = updates.minQuantity;
    delete mappedUpdates.categoryId;
    delete mappedUpdates.supplierId;
    delete mappedUpdates.minQuantity;

    const { data, error } = await supabase.from('products').update({
      ...mappedUpdates,
      last_updated: new Date().toISOString()
    }).eq('id', id).select().single();

    if (error) {
      console.error('Error updating product:', error);
      return false;
    }
    if (data) {
      const updatedProd = {
        ...data,
        categoryId: data.category_id,
        supplierId: data.supplier_id,
        minQuantity: data.min_quantity,
        lastUpdated: data.last_updated
      };
      setProducts(products.map(p => p.id === id ? updatedProd : p));
      if (updates.quantity !== undefined && updates.quantity !== product.quantity) {
        const diff = updates.quantity - product.quantity;
        await addMovement(id, product.name, diff > 0 ? 'IN' : 'OUT', Math.abs(diff), movementReason || 'Mise à jour manuelle');
      }
    }
    return true;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    setProducts(products.filter(p => p.id !== id));
    setMovements(movements.filter(m => m.productId !== id));
    return true;
  };

  const addMovement = async (productId: string, productName: string, type: 'IN' | 'OUT', quantity: number, reason: string, reference?: string) => {
    const newMovement = {
      product_id: productId,
      product_name: productName,
      type,
      quantity,
      reason,
      reference,
      date: new Date().toISOString()
    };

    const { data, error } = await supabase.from('movements').insert([newMovement]).select().single();
    if (error) {
      console.error('Error adding movement:', error);
      return false;
    }
    if (data) {
      const mappedMovement = {
        ...data,
        productId: data.product_id,
        productName: data.product_name
      };
      setMovements([mappedMovement, ...movements].slice(0, 100));
    }
    return true;
  };

  const addCategory = async (name: string, description?: string) => {
    const { data, error } = await supabase.from('categories').insert([{ name, description }]).select().single();
    if (data && !error) {
      setCategories([...categories, data]);
    }
    return !error;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
    }
    return !error;
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const { data, error } = await supabase.from('suppliers').insert([supplier]).select().single();
    if (data && !error) {
      setSuppliers([...suppliers, data]);
    }
    return !error;
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (!error) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
    return !error;
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
    loading,
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

