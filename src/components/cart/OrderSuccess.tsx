import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store.ts';
import { CheckCircle2, ArrowRight, Receipt } from 'lucide-react';

export default function OrderSuccess() {
  const { latestCreatedOrder } = useSelector((state: RootState) => state.order);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white border border-stone-200/90 rounded-2xl p-8 md:p-10 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Payment & Order Confirmed
          </p>
          <h1 className="font-serif-display text-3xl font-bold text-stone-950">
            Thank you for dining with FoodGenie!
          </h1>
          <p className="text-sm text-stone-600">
            {latestCreatedOrder
              ? `Order ${latestCreatedOrder._id} at ${latestCreatedOrder.restaurant.name} has been processed successfully.`
              : 'Your artisanal meal has been confirmed and submitted to the partner kitchen.'}
          </p>
        </div>

        {latestCreatedOrder && (
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-5 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-stone-200 pb-2.5">
              <span className="text-stone-500">Order Reference</span>
              <span className="font-mono font-semibold text-stone-950">
                {latestCreatedOrder._id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Partner Kitchen</span>
              <span className="font-semibold text-stone-900">
                {latestCreatedOrder.restaurant.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Payment Status</span>
              <span className="font-medium text-stone-900">
                {latestCreatedOrder.paymentInfo.status} ({latestCreatedOrder.paymentInfo.method})
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-200 text-sm">
              <span className="font-semibold text-stone-900">Total Charged</span>
              <span className="font-bold text-stone-950 tabular-nums">
                ${latestCreatedOrder.finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {latestCreatedOrder && (
            <Link
              to={`/eats/orders/${latestCreatedOrder._id}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-[#D94E1F] hover:bg-stone-900 rounded-lg transition-colors shadow-sm"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>View Order Receipt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            to="/eats/orders/me/myOrders"
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <span>My Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
