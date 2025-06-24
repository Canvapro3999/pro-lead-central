
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Download, 
  Calendar,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Purchase {
  id: number;
  leadBundleId: number;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
  leadBundle: {
    id: number;
    title: string;
    description: string;
    industry: string;
  };
}

const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const data = await api.getPurchaseHistory();
      setPurchases(data);
    } catch (error) {
      toast.error('Failed to fetch purchase history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchaseId: number, title: string) => {
    try {
      const blob = await api.downloadPurchase(purchaseId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_leads.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started successfully');
    } catch (error) {
      toast.error('Failed to download leads');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
          <p className="text-gray-600 mt-1">View and download your purchased lead data</p>
        </div>
      </div>

      {/* Summary Cards */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Purchases</dt>
                    <dd className="text-lg font-medium text-gray-900">{purchases.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {purchases.reduce((sum, purchase) => sum + purchase.quantity, 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(purchases.reduce((sum, purchase) => sum + purchase.amount, 0))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchases List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(purchase.status)}
                        <h3 className="text-lg font-medium text-gray-900">{purchase.leadBundle.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                          {purchase.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{purchase.leadBundle.description}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Industry:</span>
                          <p className="font-medium text-gray-900">{purchase.leadBundle.industry}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className="font-medium text-gray-900">{purchase.quantity.toLocaleString()} leads</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-medium text-gray-900">{formatCurrency(purchase.amount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            <p className="font-medium text-gray-900">{formatDate(purchase.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => handleDownload(purchase.id, purchase.leadBundle.title)}
                        disabled={purchase.status.toLowerCase() !== 'completed'}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No purchases yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start by browsing our lead packages and make your first purchase.</p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.href = '/leads'}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Browse Leads
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Purchases;
