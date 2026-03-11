'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import toast from 'react-hot-toast';
import MediaUpload from '@/components/MediaUpload';

export default function AdminAboutShopPage() {
    const [data, setData] = useState({
        shopDescription: '',
        ownerName: '',
        ownerPhoto: '',
        ownerBio: '',
        instagramLink: '',
        whatsappLink: '',
        yearsInBusiness: '',
        customersServed: '',
        showOwnerSection: true,
        promiseText: '',
        shippingNote: '',
        proofImages: '[]',
        proofVideos: '[]',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { token } = useAdminAuth();

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        fetch('/api/admin/about-shop', { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((res) => {
                if (!res.error && res.id) {
                    setData({
                        shopDescription: res.shopDescription || '',
                        ownerName: res.ownerName || '',
                        ownerPhoto: res.ownerPhoto || '',
                        ownerBio: res.ownerBio || '',
                        instagramLink: res.instagramLink || '',
                        whatsappLink: res.whatsappLink || '',
                        yearsInBusiness: res.yearsInBusiness || '',
                        customersServed: res.customersServed || '',
                        showOwnerSection: res.showOwnerSection ?? true,
                        promiseText: res.promiseText || '',
                        shippingNote: res.shippingNote || '',
                        proofImages: res.proofImages || '[]',
                        proofVideos: res.proofVideos || '[]',
                    });
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/about-shop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error();
            toast.success('About Shop details saved');
        } catch {
            toast.error('Failed to save details');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">About Shop Management</h1>
            <form onSubmit={save} className="card p-6 space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
                        <textarea
                            name="shopDescription"
                            value={data.shopDescription}
                            onChange={handleChange}
                            className="input h-24"
                            placeholder="Short story about the shop..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                        <input name="ownerName" value={data.ownerName} onChange={handleChange} className="input" placeholder="Owner Name" />
                    </div>

                    <div className="md:col-span-2">
                        <MediaUpload
                            label="Owner Photo"
                            value={data.ownerPhoto}
                            onChange={(val) => setData(prev => ({ ...prev, ownerPhoto: val }))}
                            multiple={false}
                            accept="image/*"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Bio</label>
                        <textarea
                            name="ownerBio"
                            value={data.ownerBio}
                            onChange={handleChange}
                            className="input h-16"
                            placeholder="Started the store to provide affordable branded products..."
                        />
                    </div>

                    <div className="flex items-center space-x-2 md:col-span-2">
                        <input
                            type="checkbox"
                            name="showOwnerSection"
                            id="showOwnerSection"
                            checked={data.showOwnerSection}
                            onChange={handleChange}
                            className="w-4 h-4 text-accent rounded focus:ring-accent"
                        />
                        <label htmlFor="showOwnerSection" className="text-sm font-medium text-gray-700">
                            Show Owner Section on Public Page
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Link</label>
                        <input name="instagramLink" value={data.instagramLink} onChange={handleChange} className="input" placeholder="https://instagram.com/..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Link</label>
                        <input name="whatsappLink" value={data.whatsappLink} onChange={handleChange} className="input" placeholder="https://wa.me/..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
                        <input name="yearsInBusiness" value={data.yearsInBusiness} onChange={handleChange} className="input" placeholder="5" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customers Served</label>
                        <input name="customersServed" value={data.customersServed} onChange={handleChange} className="input" placeholder="10k+" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Promise Text</label>
                        <input name="promiseText" value={data.promiseText} onChange={handleChange} className="input" placeholder="Genuine product promise" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Note</label>
                        <input name="shippingNote" value={data.shippingNote} onChange={handleChange} className="input" placeholder="Fast response / fast shipping note" />
                    </div>

                    <div className="md:col-span-2">
                        <MediaUpload
                            label="Behind the Scenes & Proof Images"
                            value={(() => {
                                try {
                                    const parsed = JSON.parse(data.proofImages);
                                    return Array.isArray(parsed) ? parsed.join(',') : '';
                                } catch {
                                    return '';
                                }
                            })()}
                            onChange={(val) => {
                                const urls = val.split(',').map(s => s.trim()).filter(Boolean);
                                setData(prev => ({ ...prev, proofImages: JSON.stringify(urls) }));
                            }}
                            multiple={true}
                            accept="image/*"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <MediaUpload
                            label="Shop Videos & Proof Videos"
                            value={(() => {
                                try {
                                    const parsed = JSON.parse(data.proofVideos);
                                    return Array.isArray(parsed) ? parsed.join(',') : '';
                                } catch {
                                    return '';
                                }
                            })()}
                            onChange={(val) => {
                                const urls = val.split(',').map(s => s.trim()).filter(Boolean);
                                setData(prev => ({ ...prev, proofVideos: JSON.stringify(urls) }));
                            }}
                            multiple={true}
                            accept="video/*"
                        />
                    </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto px-8">
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}
