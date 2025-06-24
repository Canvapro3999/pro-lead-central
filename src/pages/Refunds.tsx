
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { 
  DollarSign, 
  Plus, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Loader2
} from 'lucide-react';

interface Refund {
  id: number;
  purchaseId: number;
  reason: string;
  sampleData: string;
  status: string;
  createdAt: string;
  amount: number;
  purchase: {
    id: number;
    leadBundle: {
      title: string;
      industry: string;
    };
    quantity: number;
    amount: number;
    createdAt: string;
  };
}

interface Purchase {
  id: number;
  leadBundle: {
    title: string;
    industry: string;
  };
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
}

const Refunds = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    purchaseId: '',
    reason: '',
    sampleData: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [refundData, purchaseData] = await Promise.all([
        api.getRefunds(),
        api.getPurchaseHistory()
      ]);
      setRefunds(refundData);
      setPurchases(purchaseData.filter((p: Purchase) => p.status.toLowerCase() === 'completed'));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.purchaseId || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.createRefund({
        purchaseId: parseInt(formData.purchaseId),
        reason: formData.reason,
        sampleData: formData.sampleData
      });
      toast.success('Refund request submitted successfully!');
      setShowCreateForm(false);
      setFormData({
        purchaseId: '',
        reason: '',
        sampleData: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to submit refund request');
    } finally {
      setSubmitting(false);
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
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Filter purchases that don't already have refund requests
  const eligiblePurchases = purchases.filter(purchase => 
    !refunds.some(refund => refund.purchaseId === purchase.id)
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Refund Requests</h1>
          <p className="text-gray-600 mt-1">Manage your refund requests for purchased leads</p>
        </div>
        {eligiblePurchases.length > 0 && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Request Refund
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Refund Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="purchaseId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Purchase *
              </label>
              <select
                id="purchaseId"
                value={formData.purchaseId}
                onChange={(e) => setFormData({ ...formData, purchaseId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a purchase</option>
                {eligiblePurchases.map((purchase) => (
                  <option key={purchase.id} value={purchase.id}>
                    #{purchase.id} - {purchase.leadBundle.title} ({purchase.quantity} leads - {formatCurrency(purchase.amount)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Refund *
              </label>
              <select
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a reason</option>
                <option value="data_quality">Data Quality Issues</option>
                <option value="duplicate_data">Duplicate Data</option>
                <option value="incorrect_targeting">Incorrect Targeting</option>
                <option value="technical_issues">Technical Issues</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="sampleData" className="block text-sm font-medium text-gray-700 mb-1">
                Sample Data or Additional Details
              </label>
              <textarea
                id="sampleData"
                rows={4}
                value={formData.sampleData}
                onChange={(e) => setFormData({ ...formData, sampleData: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide specific examples or additional details about the issue..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Refunds List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {refunds.length > 0 ? (
            <div className="space-y-4">
              {refunds.map((refund) => (
                <div key={refund.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(refund.status)}
                      <h3 className="text-lg font-medium text-gray-900">
                        Refund Request #{refund.id}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                        {refund.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {formatDate(refund.createdAt)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Original Purchase</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>Purchase #{refund.purchase.id}</div>
                      <div>{refund.purchase.leadBundle.title}</div>
                      <div>{refund.purchase.quantity} leads - {formatCurrency(refund.purchase.amount)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Reason: </span>
                      <span className="text-sm text-gray-900">{refund.reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    
                    {refund.sampleData && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Details: </span>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {refund.sampleData}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Refund Amount: </span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(refund.amount)}</span>
                      </div>
                      
                      {refund.status.toLowerCase() === 'approved' && (
                        <div className="text-sm text-green-600 font-medium">
                          ✓ Refund approved and processed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No refund requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                {eligiblePurchases.length > 0 
                  ? "If you have issues with purchased leads, you can request a refund."
                  : "You need to have completed purchases to request refunds."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Refunds;
