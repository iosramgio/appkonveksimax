import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatCurrency } from '../../utils/formatter';
import OrderItemCard from '../../components/orders/OrderItemCard';
import Pagination from '../../components/common/Pagination';
import { useApi } from '../../hooks/useApi';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const api = useApi();

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/customer?page=${currentPage}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Order Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Pesanan #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {formatCurrency(order.paymentDetails?.total)}
                  </div>
                  <span className={`text-sm ${
                    order.paymentDetails?.isPaid ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentDetails?.isPaid ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4">
              {order.items.map((item, index) => (
                <OrderItemCard key={index} item={item} compact />
              ))}
            </div>

            {/* Order Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-gray-600">Status: </span>
                  <span className="font-medium">{order.status}</span>
                </div>
                <Link
                  to={`/customer/orders/${order._id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada pesanan</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default OrderList; 