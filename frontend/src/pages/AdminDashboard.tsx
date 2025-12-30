import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, FolderGit2, FileText, TrendingUp, DollarSign, Download, RefreshCw, Lock, Unlock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [repos, setRepos] = useState<any[]>([]);
  const [docDistribution, setDocDistribution] = useState<any>({});
  const [coupons, setCoupons] = useState<any[]>([]);
  const [userFilter, setUserFilter] = useState<string>('all');
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    max_uses: '',
    valid_until: '',
    description: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();

      const [overviewRes, recentRes, usersRes, reposRes, docsRes, couponsRes] = await Promise.all([
        fetch(`${API_URL}/internal/admin/overview`, { headers }),
        fetch(`${API_URL}/internal/admin/recent`, { headers }),
        fetch(`${API_URL}/internal/admin/users`, { headers }),
        fetch(`${API_URL}/internal/admin/repositories`, { headers }),
        fetch(`${API_URL}/internal/admin/documents/distribution`, { headers }),
        fetch(`${API_URL}/internal/admin/coupons`, { headers })
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (recentRes.ok) setRecentActivity(await recentRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (reposRes.ok) setRepos(await reposRes.json());
      if (docsRes.ok) setDocDistribution(await docsRes.json());
      if (couponsRes.ok) setCoupons(await couponsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (plan?: string) => {
    try {
      const headers = await getAuthHeaders();
      const url = plan && plan !== 'all' 
        ? `${API_URL}/internal/admin/users?plan=${plan}`
        : `${API_URL}/internal/admin/users`;
      const res = await fetch(url, { headers });
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const headers = await getAuthHeaders();
      const payload = {
        code: couponForm.code.toUpperCase(),
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
        valid_until: couponForm.valid_until || null,
        description: couponForm.description || null
      };

      const res = await fetch(`${API_URL}/internal/admin/coupons`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Coupon created successfully!');
        setShowCreateCoupon(false);
        setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', valid_until: '', description: '' });
        const couponsRes = await fetch(`${API_URL}/internal/admin/coupons`, { headers });
        if (couponsRes.ok) setCoupons(await couponsRes.json());
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to create coupon');
      }
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  const exportCSV = (type: string) => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'users':
        csvContent = 'Email,Subscribed,Repos,Joined\n';
        users.forEach(u => csvContent += `${u.email},${u.is_subscribed},${u.repo_count || 0},${u.created_at}\n`);
        filename = 'users.csv';
        break;
      case 'repos':
        csvContent = 'Repository URL,Owner,Private,Status,Created\n';
        repos.forEach(r => csvContent += `${r.repo_url},${r.user_email},${r.is_private},${r.clone_status},${r.created_at}\n`);
        filename = 'repositories.csv';
        break;
      case 'coupons':
        csvContent = 'Code,Type,Value,Uses,Max Uses,Active,Expires\n';
        coupons.forEach(c => csvContent += `${c.code},${c.discount_type},${c.discount_value},${c.current_uses},${c.max_uses || 'Unlimited'},${c.is_active},${c.valid_until || 'Never'}\n`);
        filename = 'coupons.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Export completed!');
  };

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your platform's performance</p>
        </div>
        <Button onClick={fetchAllData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="repos">Repositories</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overview && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.total_users?.toLocaleString()}</div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{overview.growth_rate?.toFixed(1)}% this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Repositories</CardTitle>
                    <FolderGit2 className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.total_repos?.toLocaleString()}</div>
                    <p className="text-xs text-gray-600 mt-1">Tracked repositories</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Documents Generated</CardTitle>
                    <FileText className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.total_docs?.toLocaleString()}</div>
                    <p className="text-xs text-gray-600 mt-1">All time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${overview.mrr?.toFixed(2)}</div>
                    <p className="text-xs text-gray-600 mt-1">{overview.active_subscriptions} active subs</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Document Type Distribution</CardTitle>
                  <CardDescription>Breakdown of generated documentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(docDistribution).map(([type, stats]: [string, any]) => (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{type}</span>
                          <span className="text-sm text-gray-600">{stats.count?.toLocaleString()} ({stats.percentage?.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${stats.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {recentActivity && (
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivity.recent_users?.map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{user.email}</p>
                              <p className="text-xs text-gray-600">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.is_subscribed ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                {user.is_subscribed ? 'Pro' : 'Free'}
                              </span>
                              <p className="text-xs text-gray-600 mt-1">{user.repo_count} repos</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Recent Repositories</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivity.recent_repos?.map((repo: any) => (
                          <div key={repo.id} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{repo.repo_url?.split('/').pop()}</p>
                              <p className="text-xs text-gray-600 truncate">{repo.user_email}</p>
                            </div>
                            <div className="ml-2">
                              {repo.is_private ? <Lock className="h-3 w-3 text-red-600" /> : <Unlock className="h-3 w-3 text-green-600" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View all registered users</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={userFilter} onValueChange={(val) => { setUserFilter(val); fetchUsers(val); }}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="free">Free Plan</SelectItem>
                      <SelectItem value="pro">Pro Plan</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => exportCSV('users')}>
                    <Download className="h-4 w-4 mr-2" />Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Repos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.is_subscribed ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                            {user.is_subscribed ? 'Pro' : 'Free'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{user.repo_count || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Repository Tracking</CardTitle>
                  <CardDescription>All connected repositories</CardDescription>
                </div>
                <Button variant="outline" onClick={() => exportCSV('repos')}>
                  <Download className="h-4 w-4 mr-2" />Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Repository</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Visibility</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {repos.map((repo) => (
                      <tr key={repo.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium truncate max-w-xs">{repo.repo_url?.split('/').slice(-2).join('/')}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{repo.user_email}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {repo.is_private ? (
                              <>
                                <Lock className="h-3 w-3 text-red-600" />
                                <span className="text-xs text-red-700">Private</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-green-700">Public</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            repo.clone_status === 'completed' ? 'bg-green-100 text-green-700' :
                            repo.clone_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {repo.clone_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(repo.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Document Analytics</CardTitle>
              <CardDescription>Generated documentation statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(docDistribution).map(([type, stats]: [string, any]) => (
                  <Card key={type}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{type}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.count?.toLocaleString()}</div>
                      <p className="text-xs text-gray-600 mt-1">{stats.percentage?.toFixed(1)}% of total</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Coupon Management</CardTitle>
                  <CardDescription>Track and create coupons</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportCSV('coupons')}>
                    <Download className="h-4 w-4 mr-2" />Export
                  </Button>
                  <Dialog open={showCreateCoupon} onOpenChange={setShowCreateCoupon}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />Create Coupon
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Coupon</DialogTitle>
                        <DialogDescription>Add a new discount coupon for users</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="code">Coupon Code</Label>
                          <Input id="code" placeholder="SAVE50" value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="type">Discount Type</Label>
                            <Select value={couponForm.discount_type} onValueChange={(val) => setCouponForm({...couponForm, discount_type: val})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="value">Discount Value</Label>
                            <Input id="value" type="number" placeholder={couponForm.discount_type === 'percentage' ? '50' : '500'} value={couponForm.discount_value} onChange={(e) => setCouponForm({...couponForm, discount_value: e.target.value})} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="max_uses">Max Uses (optional)</Label>
                            <Input id="max_uses" type="number" placeholder="100" value={couponForm.max_uses} onChange={(e) => setCouponForm({...couponForm, max_uses: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="valid_until">Expires (optional)</Label>
                            <Input id="valid_until" type="date" value={couponForm.valid_until} onChange={(e) => setCouponForm({...couponForm, valid_until: e.target.value})} />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description (optional)</Label>
                          <Input id="description" placeholder="Holiday sale discount" value={couponForm.description} onChange={(e) => setCouponForm({...couponForm, description: e.target.value})} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateCoupon(false)}>Cancel</Button>
                        <Button onClick={handleCreateCoupon} className="bg-orange-500 hover:bg-orange-600">Create Coupon</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Total Coupons</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{coupons.length}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Active Coupons</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{coupons.filter(c => c.is_active).length}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Total Redemptions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + (c.current_uses || 0), 0)}</div></CardContent>
                  </Card>
                </div>

                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Discount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Usage</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Expires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {coupons.map((coupon) => (
                        <tr key={coupon.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono font-medium">{coupon.code}</td>
                          <td className="px-4 py-3 text-sm">
                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`} off
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {coupon.current_uses} / {coupon.max_uses || '∞'}
                            {coupon.max_uses && (
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(coupon.current_uses / coupon.max_uses) * 100}%` }} />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {coupon.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminDashboard;