import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { getOrderDetails } from '../../redux/actions/orderActions.ts';
import Loader from '../layout/Loader.tsx';
import Message from '../Message.tsx';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { orderDetails: order, loading, error } = useSelector(
    (state: RootState) => state.order
  );

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id]);

  if (loading) return <Loader />;
  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Message variant="danger">{error || 'Order not found'}</Message>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/eats/orders/me/myOrders"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>

        <Link
          to={`/eats/stores/${order.restaurant._id}/menus`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 hover:text-amber-800 transition-colors"
        >
          <span>Visit {order.restaurant.name} Menu</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Order Header Card */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span className="font-mono font-semibold text-stone-900">
                {order._id}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {new Date(order.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h1 className="font-serif-display text-2xl md:text-3xl font-bold text-stone-950">
              {order.restaurant.name}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {order.restaurant.address}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-stone-500">Fulfillment Status</p>
            <p
              className={`text-sm font-semibold mt-0.5 ${
                order.orderStatus === 'Delivered'
                  ? 'text-emerald-700'
                  : 'text-amber-800'
              }`}
            >
              {order.orderStatus}
            </p>
          </div>
        </div>

        {/* Delivery & Payment Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm pb-6 border-b border-stone-200">
          <div>
            <p className="text-xs font-semibold text-stone-500 mb-1">
              Delivery Destination
            </p>
            <p className="font-medium text-stone-900">
              {order.deliveryInfo.address}
            </p>
            <p className="text-stone-600 text-xs mt-0.5">
              {order.deliveryInfo.city}, {order.deliveryInfo.postalCode} ·{' '}
              {order.deliveryInfo.phoneNo}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-500 mb-1">
              Payment & Settlement
            </p>
            <p className="font-medium text-stone-900">
              {order.paymentInfo.status} via {order.paymentInfo.method}
            </p>
            {order.couponApplied && (
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                Coupon Applied: {order.couponApplied} (-$
                {order.discountAmount.toFixed(2)})
              </p>
            )}
          </div>
        </div>

        {/* Ordered Items List */}
        <div>
          <h2 className="font-serif-display text-lg font-bold text-stone-900 mb-4">
            Itemized Kitchen Receipt
          </h2>
          <div className="divide-y divide-stone-100">
            {order.orderItems.map((item) => (
              <div
                key={item.fooditem}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100"
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-500 tabular-nums">
                      Qty {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-stone-950 tabular-nums">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Breakdown */}
        <div className="pt-4 border-t border-stone-200 space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Items Subtotal</span>
            <span className="tabular-nums">${order.itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Kitchen Tax</span>
            <span className="tabular-nums">${order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Delivery Fee</span>
            <span className="tabular-nums">
              {order.deliveryCharge === 0
                ? 'Free'
                : `$${order.deliveryCharge.toFixed(2)}`}
            </span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Discount ({order.couponApplied})</span>
              <span className="tabular-nums">
                -${order.discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
            <span>Final Total</span>
            <span className="tabular-nums">${order.finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
