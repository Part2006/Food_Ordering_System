import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Ban, CheckCircle2, User, RefreshCw, UserCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const CustomerList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'customer', 'restaurant'

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = `${API_URL}/admin/users?`;
      if (roleFilter !== 'all') {
        query += `role=${roleFilter}&`;
      }
      const res = await axios.get(query);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user listing');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id, currentBlockedState) => {
    try {
      const targetState = !currentBlockedState;
      const res = await axios.put(`${API_URL}/admin/users/${id}/block`, { isBlocked: targetState });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: res.data.user.isBlocked } : u));
      toast.success(targetState ? 'User access blocked' : 'User access restored');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">User Control Center</h1>
          <p className="text-sm text-gray-500 mt-1">Audit customer profiles and toggle login suspensions.</p>
        </div>

        {/* Tab filters */}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl text-xs font-bold border border-gray-200">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              roleFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              roleFilter === 'customer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setRoleFilter('restaurant')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              roleFilter === 'restaurant' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Restaurant Owners
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm flex items-center space-x-2 mb-6 max-w-md">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by user name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full focus:outline-none text-sm font-semibold bg-white text-gray-800"
        />
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="h-6 w-6 text-brand-500 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-sm text-gray-400">
            No registered users found matching the search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-xs font-semibold text-gray-600">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-150">
                <tr>
                  <th className="py-4 px-6">User details</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Saved Addresses</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-bold text-gray-900">
                      <div className="flex items-center space-x-2.5">
                        <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                          <User className="h-4 w-4" />
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{u.email}</td>
                    <td className="py-4 px-6 capitalize">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                        u.role === 'restaurant' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {u.addresses?.length || 0} locations saved
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${
                        u.isBlocked ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {u.isBlocked ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                        className={`p-1.5 rounded-xl border text-[10px] font-bold inline-flex items-center space-x-1.5 transition-colors ${
                          u.isBlocked
                            ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-700'
                            : 'bg-red-50 border-red-100 hover:bg-red-100 text-red-700'
                        }`}
                      >
                        {u.isBlocked ? (
                          <>
                            <UserCheck className="h-4 w-4" />
                            <span>Unban User</span>
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4" />
                            <span>Suspend Access</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerList;
