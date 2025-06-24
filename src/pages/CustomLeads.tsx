
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Eye, 
  Download, 
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Building,
  FileText,
  Loader2
} from 'lucide-react';

interface CustomLead {
  id: number;
  industry: string;
  location: string;
  quantity: number;
  additionalNotes: string;
  status: string;
  createdAt: string;
  estimatedPrice: number;
  sampleData?: any[];
}

const CustomLeads = () => {
  const [customLeads, setCustomLeads] = useState<CustomLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sampleModal, setSampleModal] = useState<{ show: boolean; data: any[] }>({ show: false, data: [] });
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    industry: '',
    location: '',
    quantity: 100,
    additionalNotes: ''
  });

  useEffect(() => {
    fetchCustomLeads();
  }, []);

  const fetchCustomLeads = async () => {
    try {
      const data = await api.getCustomLeads();
      setCustomLeads(data);
    } catch (error) {
      toast.error('Failed to fetch custom leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.industry || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.createCustomLead(formData);
      toast.success('Custom lead request submitted successfully!');
      setShowCreateForm(false);
      setFormData({
        industry: '',
        location: '',
        quantity: 100,
        additionalNotes: ''
      });
      fetchCustomLeads();
    } catch (error) {
      toast.error('Failed to submit custom lead request');
    } finally {
      setSubmitting(false);
    }
  };

  const viewSample = async (id: number) => {
    try {
      const sampleData = await api.getCustomLeadSample(id);
      setSampleModal({ show: true, data: sampleData });
    } catch (error) {
      toast.error('Failed to fetch sample data');
    }
  };

  const confirmLead = async (id: number) => {
    try {
      await api.confirmCustomLead(id);
      toast.success('Custom lead confirmed successfully!');
      fetchCustomLeads();
    } catch (error) {
      toast.error('Failed to confirm custom lead');
    }
  };

  const downloadLead = async (id: number, industry: string) => {
    try {
      const blob = await api.downloadCustomLead(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${industry.replace(/\s+/g, '_')}_custom_leads.xlsx`;
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
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'ready':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
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
          <h1 className="text-2xl font-bold text-gray-900">Custom Lead Requests</h1>
          <p className="text-gray-600 mt-1">Request custom lead data tailored to your specific needs</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Custom Request
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Custom Lead Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry *
                </label>
                <input
                  type="text"
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Technology, Healthcare, Finance"
                  required
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., New York, California, United States"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Quantity
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Requirements
              </label>
              <textarea
                id="additionalNotes"
                rows={3}
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Specify any additional requirements, target company size, specific criteria, etc."
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

      {/* Custom Leads List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {customLeads.length > 0 ? (
            <div className="space-y-4">
              {customLeads.map((lead) => (
                <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(lead.status)}
                      <h3 className="text-lg font-medium text-gray-900">
                        {lead.industry} - {lead.location}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(lead.createdAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2" />
                      <span>Industry: {lead.industry}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Location: {lead.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Quantity: {lead.quantity.toLocaleString()}</span>
                    </div>
                  </div>

                  {lead.additionalNotes && (
                    <div className="mb-4">
                      <div className="flex items-start text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{lead.additionalNotes}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Estimated Price: </span>
                      <span className="font-medium text-gray-900">{formatCurrency(lead.estimatedPrice)}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {lead.status.toLowerCase() === 'ready' && (
                        <>
                          <button
                            onClick={() => viewSample(lead.id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View Sample
                          </button>
                          <button
                            onClick={() => confirmLead(lead.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Confirm
                          </button>
                        </>
                      )}
                      
                      {lead.status.toLowerCase() === 'completed' && (
                        <button
                          onClick={() => downloadLead(lead.id, lead.industry)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No custom requests yet</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first custom lead request to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sample Modal */}
      {sampleModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSampleModal({ show: false, data: [] })} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Sample Custom Lead Data</h3>
                <div className="space-y-3">
                  {sampleModal.data.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setSampleModal({ show: false, data: [] })}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomLeads;
