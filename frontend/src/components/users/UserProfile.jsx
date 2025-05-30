import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatter';

const UserProfile = ({ user }) => {
  if (!user) {
    return <div className="p-6">Loading user profile...</div>;
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'cashier':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'customer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'cashier':
        return 'Kasir';
      case 'staff':
        return 'Staf';
      case 'owner':
        return 'Owner';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Profil User</h2>
          <div className="flex gap-2">
            <Link to={`/admin/users/edit/${user._id}`}>
              <Button
                label="Edit Profile"
                variant="outline"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                }
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="ml-6">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-2">
              <span className={`px-3 py-1 rounded-full text-sm ${getRoleBadgeClass(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Nomor Telepon</h4>
            <p className="mt-1">{user.phone || '-'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Terdaftar Sejak</h4>
            <p className="mt-1">{formatDate(user.createdAt)}</p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-500">Alamat</h4>
            <p className="mt-1">{user.address || '-'}</p>
          </div>
        </div>

        {user.role === 'customer' && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Riwayat Pesanan</h4>
            {user.orders && user.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Pesanan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/cashier/orders/${order._id}`} className="text-blue-600 hover:underline">
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          Rp {order.totalAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Belum ada riwayat pesanan.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;