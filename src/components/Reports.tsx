import type { Product, Movement } from '../types';
import { FileText, Download, Table as TableIcon, FileCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';

interface ReportsProps {
  products: Product[];
  movements: Movement[];
  formatPrice: (price: number) => string;
}

export const Reports = ({ products, formatPrice }: ReportsProps) => {
  const exportCSV = () => {
    const headers = ['Nom', 'SKU', 'Prix', 'Quantité', 'Valeur Totale'];
    const rows = products.map(p => [
      p.name,
      p.sku,
      p.price.toString(),
      p.quantity.toString(),
      (p.price * p.quantity).toString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stock_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Rapport d\'Inventaire StockMaster', 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    let y = 45;
    doc.text('Produit', 20, y);
    doc.text('SKU', 80, y);
    doc.text('Stock', 130, y);
    doc.text('Prix', 160, y);
    doc.line(20, y + 2, 190, y + 2);
    
    y += 10;
    products.forEach(p => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(p.name.substring(0, 25), 20, y);
      doc.text(p.sku, 80, y);
      doc.text(p.quantity.toString(), 130, y);
      doc.text(formatPrice(p.price), 160, y);
      y += 8;
    });

    doc.save(`stock_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Rapports et Exportations</h1>
      <p>Générez des documents officiels pour votre comptabilité ou logistique.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
        <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(50, 150, 255, 0.1)', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <TableIcon size={32} />
          </div>
          <h3>Export CSV (Excel)</h3>
          <p style={{ margin: '1rem 0 1.5rem' }}>Téléchargez votre liste de produits au format tableur pour un traitement de données avancé.</p>
          <button className="btn btn-primary" onClick={exportCSV} style={{ width: '100%' }}>
            <Download size={18} /> Télécharger CSV
          </button>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(255, 50, 100, 0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <FileText size={32} />
          </div>
          <h3>Rapport PDF</h3>
          <p style={{ margin: '1rem 0 1.5rem' }}>Générez un document PDF professionnel prêt à être imprimé ou partagé par email.</p>
          <button className="btn btn-primary" onClick={exportPDF} style={{ width: '100%', background: '#ef4444' }}>
            <FileCheck size={18} /> Générer PDF
          </button>
        </motion.div>
      </div>
    </div>
  );
};
