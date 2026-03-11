'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, calcDiscount } from '@/lib/utils';
import toast from 'react-hot-toast';
import { fetchJson } from '@/lib/fetchJson';

type Address = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'phonepe' | 'cod'>('phonepe');
  const [codEnabled, setCodEnabled] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState(49);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJson<Record<string, string>>('/api/settings').then((s) => {
      setCodEnabled(s.cod_enabled === 'true');
      setDeliveryCharge(parseFloat(s.delivery_charge || '49'));
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (token) {
      fetchJson<Address[]>('/api/user/addresses', { headers: { Authorization: `Bearer ${token}` } })
        .then((a) => {
          setAddresses(a);
          const def = a[0];
          if (def && !selectedAddress) setSelectedAddress(def.id);
        })
        .catch(() => { });
    }
  }, [token]);

  const total = Math.max(0, subtotal - couponDiscount + deliveryCharge);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const data = await fetchJson<any>('/api/coupon/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      if (data.valid) {
        setCouponDiscount(data.discount);
        toast.success(`Coupon applied! Saved ₹${data.discount}`);
      } else {
        toast.error(data.error || 'Invalid coupon');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to validate coupon');
    }
  };

  const placeOrder = async (useNewAddress?: boolean, newAddr?: Record<string, string>) => {
    if (!user || !token) {
      toast.error('Please login to checkout');
      router.push('/login');
      return;
    }
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    const addressId = useNewAddress ? undefined : selectedAddress;
    const address = useNewAddress ? newAddr : undefined;
    if (!addressId && !address) {
      toast.error('Please add or select an address');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: calcDiscount(i.price, i.discount),
      }));

      const data = await fetchJson<any>('/api/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: orderItems,
          addressId: addressId || undefined,
          address,
          paymentMethod,
          couponCode: couponCode || undefined,
        }),
      });

      if (data.paymentRequired && paymentMethod === 'phonepe') {
        const payData = await fetchJson<any>('/api/payment/create', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId: data.order.orderId, amount: data.amount }),
        });

        if (payData.redirectUrl) {
          window.location.href = payData.redirectUrl;
          return;
        }
        throw new Error('Payment initialization failed');
      } else {
        clear();
        toast.success('Order placed!');
        router.push(`/account/orders?success=${data.order.orderId}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <button onClick={() => router.push('/shop')} className="btn-primary">
          Shop Now
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-6">Please login to checkout.</p>
        <button onClick={() => router.push('/login')} className="btn-primary">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold mb-4">Delivery Address</h3>
            {addresses.length > 0 && (
              <div className="space-y-2 mb-4">
                {addresses.map((a) => (
                  <label key={a.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="addr"
                      checked={selectedAddress === a.id}
                      onChange={() => setSelectedAddress(a.id)}
                    />
                    <div>
                      <div className="font-medium">{a.name} · {a.phone}</div>
                      <div className="text-sm text-gray-600">{a.address}, {a.city}, {a.state} - {a.pincode}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {addresses.length === 0 && (
              <p className="text-sm text-gray-500 mb-4">Add your delivery address below, then click &quot;Save &amp; Place Order&quot; to proceed.</p>
            )}
            <AddAddressForm onAdded={(addr) => { setAddresses((prev) => [...prev, addr]); setSelectedAddress(addr.id); }} onUseAndPlace={placeOrder} />
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-4">Payment</h3>
            <label
              onClick={() => setPaymentMethod('phonepe')}
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer mb-3 transition-all ${paymentMethod === 'phonepe' ? 'border-accent bg-orange-50 ring-1 ring-accent' : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === 'phonepe'}
                onChange={() => setPaymentMethod('phonepe')}
                className="w-4 h-4 text-accent focus:ring-accent"
              />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm p-1">
                  <Image
                    src="/phonepe.png"
                    alt="PhonePe"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">PhonePe</div>
                  <div className="text-xs text-gray-500">UPI / Card / Net Banking</div>
                </div>
              </div>
            </label>

            {codEnabled && (
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-accent bg-orange-50 ring-1 ring-accent' : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  name="pay"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-4 h-4 text-accent focus:ring-accent"
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-lg">
                    💵
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Cash on Delivery</div>
                    <div className="text-xs text-gray-500">Pay when you receive</div>
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>

        <div>
          <div className="card p-6 sticky top-24">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((i) => (
                <div key={i.productId} className="flex gap-3">
                  <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={i.image} alt={i.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{i.name}</div>
                    <div className="text-xs text-gray-500">Qty: {i.quantity} × {formatPrice(calcDiscount(i.price, i.discount))}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="input flex-1"
              />
              <button onClick={applyCoupon} className="btn-outline">Apply</button>
            </div>
            <div className="mt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => placeOrder()}
              disabled={loading || (addresses.length > 0 ? !selectedAddress : true)}
              className="btn-primary w-full mt-6"
            >
              {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddAddressForm({
  onAdded,
  onUseAndPlace,
}: {
  onAdded: (a: Address) => void;
  onUseAndPlace: (useNew: boolean, addr?: Record<string, string>) => void;
}) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const submit = async (useAndPlace = false) => {
    if (!form.name || !form.phone || !form.address) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchJson<any>('/api/user/addresses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      onAdded(data);
      setShow(false);
      setForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
      if (useAndPlace) onUseAndPlace(true, form);
      toast.success('Address added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return (
      <button onClick={() => setShow(true)} className="mt-4 text-accent font-medium text-sm">
        + Add new address
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 border rounded-lg space-y-3">
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="input"
      />
      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        className="input"
      />
      <textarea
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        className="input"
        rows={2}
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          className="input"
        />
        <input
          placeholder="State"
          value={form.state}
          onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
          className="input"
        />
        <input
          placeholder="Pincode"
          value={form.pincode}
          onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
          className="input"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={() => submit(false)} disabled={loading} className="btn-outline flex-1">
          Save
        </button>
        <button onClick={() => submit(true)} disabled={loading} className="btn-primary flex-1">
          Save & Place Order
        </button>
      </div>
    </div>
  );
}
