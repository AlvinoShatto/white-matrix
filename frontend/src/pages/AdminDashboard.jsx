import { useState, useEffect } from 'react';
import api from '../utils/api';

function AdminDashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [newCandidate, setNewCandidate] = useState({ name: '', profile_description: '', linkedin_url: '' });
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'stats') {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } else if (activeTab === 'candidates') {
        const res = await api.get('/admin/candidates');
        setCandidates(res.data.candidates);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/candidates', newCandidate);
      setSuccess('Candidate added successfully!');
      setNewCandidate({ name: '', profile_description: '', linkedin_url: '' });
      setShowAddForm(false);
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add candidate');
    }
  };

  const handleUpdateCandidate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put(`/admin/candidates/${editingCandidate.id}`, editingCandidate);
      setSuccess('Candidate updated successfully!');
      setEditingCandidate(null);
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await api.delete(`/admin/candidates/${id}`);
        setSuccess('Candidate deleted successfully!');
        loadDashboardData();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete candidate');
      }
    }
  };

  const handleToggleAdmin = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-admin`);
      setSuccess('User admin status updated!');
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        setSuccess('User deleted successfully!');
        loadDashboardData();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const handleResetVotes = async () => {
    if (window.confirm('This will permanently delete all votes. Are you sure?')) {
      try {
        await api.post('/admin/reset-votes');
        setSuccess('All votes have been reset successfully!');
        loadDashboardData();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to reset votes');
      }
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/create-admin', { email: newAdminEmail });
      setSuccess('User promoted to admin successfully!');
      setNewAdminEmail('');
      setShowAddAdminForm(false);
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin');
    }
  };

  const tabConfig = [
    { id: 'stats', label: 'Dashboard', icon: '📊' },
    { id: 'candidates', label: 'Candidates', icon: '🎤' },
    { id: 'users', label: 'Users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300 fixed h-screen overflow-y-auto`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold">A</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">Admin</h1>
                <p className="text-xs text-gray-500">Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-purple-100">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold hover:bg-white rounded transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {tabConfig.find((t) => t.id === activeTab)?.label}
              </h2>
            </div>
            {!sidebarOpen && (
              <button
                onClick={onLogout}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-emerald-700 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Content Area */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading data...</p>
            </div>
          ) : (
            <>
              {/* Stats Tab */}
              {activeTab === 'stats' && stats && (
                <div className="space-y-8 animate-fade-in">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Votes', value: stats.summary.totalVotes, icon: '📬', color: 'from-red-600 to-red-500' },
                      { label: 'Total Users', value: stats.summary.totalUsers, icon: '👥', color: 'from-red-700 to-red-600' },
                      { label: 'Voting %', value: `${stats.summary.votingPercentage}%`, icon: '📊', color: 'from-emerald-600 to-emerald-500' },
                      { label: 'Remaining', value: stats.summary.remainingVoters, icon: '⏳', color: 'from-amber-600 to-amber-500' },
                    ].map((card, index) => (
                      <div key={index} className="card-elevated p-6 hover-lift">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                          {card.icon}
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-1">{card.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Votes by Candidate */}
                  <div className="card-elevated p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Votes by Candidate</h3>
                    <div className="space-y-6">
                      {stats.votesByCandidate.map((candidate) => {
                        const percentage = stats.summary.totalVotes > 0
                          ? (candidate.vote_count / stats.summary.totalVotes) * 100
                          : 0;
                        return (
                          <div key={candidate.id}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-900 font-semibold">{candidate.name}</span>
                              <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                {candidate.vote_count} vote{candidate.vote_count !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-red-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 block">{percentage.toFixed(1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Voters Table */}
                  <div className="card-elevated p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Voters</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Voted For</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.voters.map((voter, idx) => (
                            <tr key={voter.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{voter.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{voter.email}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="badge badge-primary">{voter.candidate_voted_for}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(voter.vote_time).toLocaleDateString()} {new Date(voter.vote_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidates Tab */}
              {activeTab === 'candidates' && (
                <div className="space-y-8 animate-fade-in">
                  {!showAddForm ? (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Add Candidate
                    </button>
                  ) : (
                    <div className="card-elevated p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Candidate</h3>
                      <form onSubmit={handleAddCandidate} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={newCandidate.name}
                            onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                            placeholder="John Doe"
                            required
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Description</label>
                          <textarea
                            value={newCandidate.profile_description}
                            onChange={(e) => setNewCandidate({ ...newCandidate, profile_description: e.target.value })}
                            placeholder="Brief profile or campaign description..."
                            rows="4"
                            className="input-field"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL (Optional)</label>
                          <input
                            type="url"
                            value={newCandidate.linkedin_url}
                            onChange={(e) => setNewCandidate({ ...newCandidate, linkedin_url: e.target.value })}
                            placeholder="https://linkedin.com/in/..."
                            className="input-field"
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" className="btn-primary btn-success">
                            Add Candidate
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {editingCandidate && (
                    <div className="card-elevated p-8 border-l-4 border-blue-600">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Candidate</h3>
                      <form onSubmit={handleUpdateCandidate} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={editingCandidate.name}
                            onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}
                            required
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Description</label>
                          <textarea
                            value={editingCandidate.profile_description || ''}
                            onChange={(e) => setEditingCandidate({ ...editingCandidate, profile_description: e.target.value })}
                            rows="4"
                            className="input-field"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                          <input
                            type="url"
                            value={editingCandidate.linkedin_url || ''}
                            onChange={(e) => setEditingCandidate({ ...editingCandidate, linkedin_url: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" className="btn-primary">
                            Update Candidate
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCandidate(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {candidates.map((candidate) => (
                      <div key={candidate.id} className="card-elevated p-6 hover-lift flex flex-col">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg mb-4">
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{candidate.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                          {candidate.profile_description}
                        </p>
                        {candidate.linkedin_url && (
                          <a
                            href={candidate.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold mb-4 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065z"/>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setEditingCandidate(candidate)}
                            className="btn-sm btn-primary flex-1 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCandidate(candidate.id)}
                            className="btn-sm btn-danger flex-1 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-8 animate-fade-in">
                  {!showAddAdminForm ? (
                    <button
                      onClick={() => setShowAddAdminForm(true)}
                      className="btn-primary inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0015.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                      Promote to Admin
                    </button>
                  ) : (
                    <div className="card-elevated p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Promote User to Admin</h3>
                      <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">User Email</label>
                          <input
                            type="email"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                            className="input-field"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Note: User must have signed up first before promotion
                          </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" className="btn-primary btn-success">
                            Promote to Admin
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddAdminForm(false);
                              setNewAdminEmail('');
                            }}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Danger Zone */}
                  <div className="card-elevated p-8 border-l-4 border-red-600 bg-gradient-to-r from-red-50 to-transparent">
                    <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Danger Zone: Reset All Votes
                    </h3>
                    <p className="text-sm text-red-700 mb-4">This action will permanently delete all voting data and cannot be undone.</p>
                    <button
                      onClick={handleResetVotes}
                      className="btn-danger"
                    >
                      Reset All Votes
                    </button>
                  </div>

                  {/* Users Table */}
                  <div className="card-elevated p-8 overflow-hidden">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Users Management</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Voted</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, idx) => (
                            <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`badge ${user.has_voted ? 'badge-success' : 'badge-warning'}`}>
                                  {user.has_voted ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`badge ${user.is_admin ? 'badge-primary' : 'bg-gray-100 text-gray-800'}`}>
                                  {user.is_admin ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm space-x-2">
                                <button
                                  onClick={() => handleToggleAdmin(user.id)}
                                  className={`btn-sm ${user.is_admin ? 'bg-gray-600 text-white hover:bg-gray-700' : 'btn-primary'}`}
                                >
                                  {user.is_admin ? 'Demote' : 'Promote'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="btn-sm btn-danger"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
