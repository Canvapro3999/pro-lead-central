
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Package,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

interface DashboardStats {
  totalLeadsPurchased: number;
  totalSpent: number;
  activeRequests: number;
  completedPurchases: number;
}

interface RecentActivity {
  id: number;
  type: 'purchase' | 'custom_lead' | 'refund';
  description: string;
  date: string;
  amount?: number;
  status: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeadsPurchased: 0,
    totalSpent: 0,
    activeRequests: 0,
    completedPurchases: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [purchases, customLeads, refunds] = await Promise.all([
        api.getPurchaseHistory(),
        api.getCustomLeads(),
        api.getRefunds()
      ]);

      // Calculate stats
      const totalLeadsPurchased = purchases.reduce((sum: number, purchase: any) => sum + purchase.quantity, 0);
      const totalSpent = purchases.reduce((sum: number, purchase: any) => sum + purchase.amount, 0);
      const activeRequests = customLeads.filter((lead: any) => lead.status === 'pending').length;
      const completedPurchases = purchases.length;

      setStats({
        totalLeadsPurchased,
        totalSpent,
        activeRequests,
        completedPurchases
      });

      // Combine and format recent activity
      const activities: RecentActivity[] = [
        ...purchases.slice(0, 3).map((purchase: any) => ({
          id: purchase.id,
          type: 'purchase' as const,
          description: `Purchased ${purchase.quantity} leads from ${purchase.leadBundle?.title || 'Lead Bundle'}`,
          date: purchase.createdAt,
          amount: purchase.amount,
          status: purchase.status
        })),
        ...customLeads.slice(0, 2).map((lead: any) => ({
          id: lead.id,
          type: 'custom_lead' as const,
          description: `Custom lead request for ${lead.industry} industry`,
          date: lead.createdAt,
          status: lead.status
        })),
        ...refunds.slice(0, 2).map((refund: any) => ({
          id: refund.id,
          type: 'refund' as const,
          description: `Refund request for purchase #${refund.purchaseId}`,
          date: refund.createdAt,
          amount: refund.amount,
          status: refund.status
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your leads.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => navigate('/leads')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Package className="mr-2 h-4 w-4" />
            Browse Leads
          </button>
          <button
            onClick={() => navigate('/custom-leads')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Users className="mr-2 h-4 w-4" />
            Request Custom Lead
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Leads Purchased</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalLeadsPurchased.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12% from last month
              </span>
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
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalSpent)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                8% from last month
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeRequests}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-blue-600 font-medium">Custom lead requests</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Purchases</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.completedPurchases}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-600 font-medium">All time total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            <button
              onClick={() => navigate('/purchases')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </button>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === 'purchase' ? 'bg-green-500' :
                            activity.type === 'custom_lead' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}>
                            {activity.type === 'purchase' && <ShoppingCart className="h-4 w-4 text-white" />}
                            {activity.type === 'custom_lead' && <Users className="h-4 w-4 text-white" />}
                            {activity.type === 'refund' && <DollarSign className="h-4 w-4 text-white" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                              {activity.amount && (
                                <span className="text-sm text-gray-500">{formatCurrency(activity.amount)}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(activity.date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by browsing our lead packages or requesting custom leads.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
