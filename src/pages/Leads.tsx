
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { 
  Package, 
  Filter, 
  Eye, 
  ShoppingCart, 
  Search,
  MapPin,
  Building,
  Users as UsersIcon,
  Loader2
} from 'lucide-react';

interface LeadBundle {
  id: number;
  title: string;
  description: string;
  industry: string;
  region: string;
  totalLeads: number;
  pricePerLead: number;
  sampleData: any[];
  quality: number;
  lastUpdated: string;
}

const Leads = () => {
  const [leads, setLeads] = useState<LeadBundle[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sampleModal, setSampleModal] = useState<{ show: boolean; data: any[] }>({ show: false, data: [] });
  const [purchaseModal, setPurchaseModal] = useState<{ show: boolean; leadBundle: LeadBundle | null }>({ show: false, leadBundle: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, industryFilter, regionFilter]);

  const fetchLeads = async () => {
    try {
      const data = await api.getLeads();
      setLeads(data);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (industryFilter) {
      filtered = filtered.filter(lead => lead.industry === industryFilter);
    }

    if (regionFilter) {
      filtered = filtered.filter(lead => lead.region === regionFilter);
    }

    setFilteredLeads(filtered);
  };

  const viewSample = async (leadId: number) => {
    try {
      const sampleData = await api.getLeadSample(leadId);
      setSampleModal({ show: true, data: sampleData });
    } catch (error) {
      toast.error('Failed to fetch sample data');
    }
  };

  const handlePurchase = async () => {
    if (!purchaseModal.leadBundle) return;

    try {
      setPurchasing(true);
      await api.createPurchase(purchaseModal.leadBundle.id, quantity);
      toast.success('Purchase successful! Check your purchases page to download.');
      setPurchaseModal({ show: false, leadBundle: null });
      setQuantity(10);
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const industries = [...new Set(leads.map(lead => lead.industry))];
  const regions = [...new Set(leads.map(lead => lead.region))];

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
          <h1 className="text-2xl font-bold text-gray-900">Lead Packages</h1>
          <p className="text-gray-600 mt-1">Browse and purchase high-quality lead data</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Industries</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setIndustryFilter('');
              setRegionFilter('');
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Lead Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">{lead.industry}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full mr-1 ${
                          i < Math.floor(lead.quality / 20) ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{lead.quality}%</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{lead.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{lead.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {lead.region}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  {lead.totalLeads.toLocaleString()} leads available
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Building className="h-4 w-4 mr-2" />
                  ${lead.pricePerLead} per lead
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => viewSample(lead.id)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Sample
                </button>
                <button
                  onClick={() => setPurchaseModal({ show: true, leadBundle: lead })}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Purchase
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Sample Modal */}
      {sampleModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSampleModal({ show: false, data: [] })} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Sample Lead Data</h3>
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

      {/* Purchase Modal */}
      {purchaseModal.show && purchaseModal.leadBundle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setPurchaseModal({ show: false, leadBundle: null })} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Purchase Leads</h3>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">{purchaseModal.leadBundle.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{purchaseModal.leadBundle.description}</p>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of leads
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={purchaseModal.leadBundle.totalLeads}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Price per lead:</span>
                    <span>${purchaseModal.leadBundle.pricePerLead}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Quantity:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span>${(purchaseModal.leadBundle.pricePerLead * quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {purchasing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  )}
                  {purchasing ? 'Processing...' : 'Confirm Purchase'}
                </button>
                <button
                  onClick={() => setPurchaseModal({ show: false, leadBundle: null })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
