import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { myOrders } from '../../redux/actions/orderActions.ts';
import Loader from '../layout/Loader.tsx';
import Message from '../Message.tsx';
import { ArrowUpRight } from 'lucide-react';

export default function ListOrders() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.order
  );

  useEffect(() => {
    dispatch(myOrders());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-stone-500">
            Verified Order Ledger
          </p>
          <h1 className="font-serif-display text-3xl font-bold text-stone-950">
            My Culinary Orders
          </h1>
        </div>

        <Link
          to="/"
          className="text-xs font-semibold text-stone-900 hover:text-amber-800 underline underline-offset-4"
        >
          Browse Partner Kitchens
        </Link>
      </div>

      {error && <Message variant="danger">{error}</Message>}

      {orders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <p className="font-serif-display text-xl font-semibold text-stone-900">
            No orders placed yet
          </p>
          <p className="text-sm text-stone-500 mt-1">
            When you place an order from our partner kitchens, your itemized receipts and tracking will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200/90 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-[#FAF8F5] text-xs font-semibold text-stone-600">
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Partner Kitchen</th>
                  <th className="py-3.5 px-5">Dishes Ordered</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {orders.map((order) => {
                  const totalQty = order.orderItems.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                  );
                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-stone-50/80 transition-colors"
                    >
                      <td className="py-4 px-5 font-mono text-xs font-semibold text-stone-900 whitespace-nowrap">
                        {order._id}
                      </td>
                      <td className="py-4 px-5 font-semibold text-stone-900 whitespace-nowrap">
                        {order.restaurant?.name || 'Partner Kitchen'}
                      </td>
                      <td className="py-4 px-5 text-xs text-stone-600 max-w-xs truncate">
                        <span className="font-medium text-stone-900 tabular-nums">
                          {totalQty} {totalQty === 1 ? 'item' : 'items'}
                        </span>{' '}
                        · {order.orderItems.map((i) => i.name).join(', ')}
                      </td>
                      <td className="py-4 px-5 text-xs text-stone-500 tabular-nums whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-5 font-semibold text-stone-950 tabular-nums text-right whitespace-nowrap">
                        ${order.finalTotal.toFixed(2)}
                      </td>
                      <td className="py-4 px-5 text-xs font-medium whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 ${
                            order.orderStatus === 'Delivered'
                              ? 'text-emerald-700 font-semibold'
                              : 'text-stone-900 font-medium'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Link
                          to={`/eats/orders/${order._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 hover:text-[#D94E1F] transition-colors"
                        >
                          <span>Receipt</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
