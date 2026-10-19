import React, { useState, useEffect } from 'react';
import { 
  X, Lock, ShieldCheck, RefreshCw, Download, Upload, Plus, Edit2, Trash2, 
  CheckCircle, AlertCircle, Train, Utensils, Image as ImageIcon, Settings, ShoppingBag, 
  Key, LogOut, ChevronRight, FileSpreadsheet, Eye, Save, Sparkles, Phone, MessageCircle,
  Clock, MapPin, Check, AlertTriangle, FileText, Building2, CreditCard, ChevronDown, Filter,
  TrendingUp, Users, ArrowUpRight, DollarSign, ExternalLink
} from 'lucide-react';
import { TrainRecord, Restaurant, FoodItem, SliderBanner, SiteSettings, OrderRecord } from '../types';
import { FOOD_CATEGORIES } from './CategoryIconBar';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trains: TrainRecord[];
  restaurants: Restaurant[];
  foodItems: FoodItem[];
  banners: SliderBanner[];
  settings: SiteSettings;
  orders: OrderRecord[];
  onRefreshData: () => void;
  token: string | null;
  onLoginSuccess: (token: string, user: any) => void;
  onLogout: () => void;
  standalone?: boolean;
  onNavigateHome?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  trains,
  restaurants,
  foodItems,
  banners,
  settings,
  orders,
  onRefreshData,
  token,
  onLoginSuccess,
  onLogout,
  standalone = false,
  onNavigateHome
}) => {
  // Login credentials state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab inside Admin Dashboard
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'restaurants' | 'foods' | 'trains' | 'banners' | 'settings' | 'backup' | 'password'
  >('overview');

  // Orders filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [orderDeliveryFilter, setOrderDeliveryFilter] = useState<'ALL' | 'train' | 'local'>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Restaurants filters & state
  const [restaurantApprovalFilter, setRestaurantApprovalFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [viewingDocumentsRestaurant, setViewingDocumentsRestaurant] = useState<Restaurant | null>(null);

  // Editing state for Restaurant
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isNewRestaurant, setIsNewRestaurant] = useState(false);
  const [uploadingRestImage, setUploadingRestImage] = useState(false);

  // Editing state for Food Item
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [isNewFood, setIsNewFood] = useState(false);
  const [uploadingFoodImage, setUploadingFoodImage] = useState(false);
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<string>('ALL');
  const [foodRestaurantFilter, setFoodRestaurantFilter] = useState<string>('ALL');

  // Editing state for Train
  const [editingTrain, setEditingTrain] = useState<TrainRecord | null>(null);
  const [isNewTrain, setIsNewTrain] = useState(false);

  // Editing state for Banners & Settings
  const [editableBanners, setEditableBanners] = useState<SliderBanner[]>(banners);
  const [editableSettings, setEditableSettings] = useState<SiteSettings>(settings);

  // Security & Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // CSV Import state
  const [csvInput, setCsvInput] = useState('');
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setEditableBanners(banners);
  }, [banners]);

  useEffect(() => {
    setEditableSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4500);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4500);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      onLoginSuccess(data.token, data.user);
      setPasswordInput('');
      showNotification('Successfully authenticated. Welcome to Railfoody Control Panel.');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update order status');
      showNotification(`Order status updated to "${newStatus}"`);
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Send WhatsApp Status Notification to Customer
  const sendWhatsAppUpdate = (order: OrderRecord) => {
    const cleanPhone = order.customer.mobileNumber.replace(/\D/g, '');
    let detailLine = '';
    if (order.customer.deliveryType === 'local') {
      detailLine = `🛵 Local Delivery: ${order.customer.localAddress || ''}`;
    } else {
      detailLine = `🚆 Train: ${order.customer.trainNumber || ''} (${order.customer.trainName || ''})\n📍 Coach: ${order.customer.coachNumber || ''}, Seat/Berth: ${order.customer.seatNumber || ''}\n🚉 Station: ${order.customer.boardingStation || 'JBP'}`;
    }

    const message = `*RAILFOODY ORDER UPDATE* 🚆\n\nDear *${order.customer.passengerName}*,\n\nYour order *#${order.orderNumber}* status is now: *${order.status.toUpperCase()}*.\n\n${detailLine}\n🍳 Kitchen: ${order.restaurantName}\n💰 Total Amount: ₹${order.totalAmount} (Cash / UPI on delivery)\n\nThank you for choosing Railfoody!\n📞 Helpline: ${settings.phone || '9752693979'}`;

    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Handle Restaurant Approval Status Change
  const handleSetRestaurantApproval = async (restaurantId: string, newApproval: 'APPROVED' | 'PENDING' | 'REJECTED') => {
    try {
      const existing = restaurants.find(r => r.id === restaurantId);
      if (!existing) return;

      const updated = {
        ...existing,
        approvalStatus: newApproval,
        isOpen: newApproval === 'APPROVED' ? true : false
      };

      const res = await fetch(`/api/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });

      if (!res.ok) throw new Error('Failed to update restaurant status');
      showNotification(`Restaurant is now ${newApproval}`);
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Toggle Restaurant Open/Closed
  const handleToggleRestaurantOpen = async (restaurant: Restaurant) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...restaurant, isOpen: !restaurant.isOpen })
      });
      if (!res.ok) throw new Error('Failed to toggle open status');
      showNotification(`${restaurant.name} is now ${!restaurant.isOpen ? 'ONLINE / OPEN' : 'OFFLINE / CLOSED'}`);
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Restaurant Image Upload
  const handleRestaurantImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingRestaurant) return;

    setUploadingRestImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            dataUrl: base64Data,
            filename: file.name
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setEditingRestaurant(prev => prev ? { ...prev, image: data.url, kitchenImage: data.url } : null);
        showNotification('Restaurant / Kitchen image uploaded successfully');
      } catch (err: any) {
        showNotification(err.message, true);
      } finally {
        setUploadingRestImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Restaurant Save
  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;

    try {
      const url = isNewRestaurant ? '/api/vendor-register' : `/api/restaurants/${editingRestaurant.id}`;
      const method = isNewRestaurant ? 'POST' : 'PUT';

      const payload = isNewRestaurant ? {
        restaurantName: editingRestaurant.name,
        stationName: editingRestaurant.stationName,
        ownerName: editingRestaurant.ownerName || 'Restaurant Partner',
        phone: editingRestaurant.phone,
        fssaiLicense: editingRestaurant.fssaiLicense,
        gstNumber: editingRestaurant.gstNumber,
        vegOnly: editingRestaurant.vegOnly,
        address: editingRestaurant.address,
        cuisines: editingRestaurant.cuisines,
        bankDetails: editingRestaurant.bankDetails
      } : editingRestaurant;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save restaurant details');
      showNotification(`Restaurant "${editingRestaurant.name}" saved successfully`);
      setEditingRestaurant(null);
      setIsNewRestaurant(false);
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Restaurant Delete
  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to remove this restaurant and its menu items?')) return;
    try {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete restaurant');
      showNotification('Restaurant deleted successfully');
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Food Image Upload
  const handleFoodImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingFood) return;

    setUploadingFoodImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            dataUrl: base64Data,
            filename: file.name
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setEditingFood(prev => prev ? { ...prev, image: data.url } : null);
        showNotification('Food dish image uploaded successfully');
      } catch (err: any) {
        showNotification(err.message, true);
      } finally {
        setUploadingFoodImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Food Save
  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood) return;

    try {
      const url = isNewFood ? '/api/foods' : `/api/foods/${editingFood.id}`;
      const method = isNewFood ? 'POST' : 'PUT';

      const rest = restaurants.find(r => r.id === editingFood.restaurantId);
      const foodPayload = {
        ...editingFood,
        restaurantName: rest ? rest.name : editingFood.restaurantName
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(foodPayload)
      });

      if (!res.ok) throw new Error('Failed to save food item');
      showNotification(`Menu dish "${editingFood.name}" saved`);
      setEditingFood(null);
      setIsNewFood(false);
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Food Delete
  const handleDeleteFood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu dish?')) return;
    try {
      const res = await fetch(`/api/foods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete food item');
      showNotification('Menu dish deleted');
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Train Sync
  const handleSyncTrains = async () => {
    try {
      const res = await fetch('/api/trains/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync');
      showNotification(data.message || 'Train schedules synchronized with Jabalpur timetable!');
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Train Save
  const handleSaveTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrain) return;

    try {
      const url = isNewTrain ? '/api/trains' : `/api/trains/${editingTrain.id}`;
      const method = isNewTrain ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingTrain)
      });

      if (!res.ok) throw new Error('Failed to save train record');
      showNotification(`Train ${editingTrain.trainNumber} saved`);
      setEditingTrain(null);
      setIsNewTrain(false);
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Train Delete
  const handleDeleteTrain = async (id: string) => {
    if (!confirm('Are you sure you want to delete this train timetable?')) return;
    try {
      const res = await fetch(`/api/trains/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete train');
      showNotification('Train record deleted');
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Banners Save
  const handleSaveBanners = async () => {
    try {
      const res = await fetch('/api/banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editableBanners)
      });
      if (!res.ok) throw new Error('Failed to save banners');
      showNotification('Promotional slider banners updated');
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editableSettings)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      showNotification('Site settings & announcements saved successfully');
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('New password and confirmation do not match', true);
      return;
    }
    if (newPassword.length < 6) {
      showNotification('Password must be at least 6 characters long', true);
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      showNotification('Admin password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Computed metrics for Overview
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending WhatsApp Confirmation' || (o.status as string) === 'Pending').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'Preparing').length;
  const outForDeliveryCount = orders.filter(o => o.status === 'Out for Delivery').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;

  const approvedKitchensCount = restaurants.filter(r => r.approvalStatus !== 'PENDING' && r.approvalStatus !== 'REJECTED').length;
  const pendingApprovalKitchensCount = restaurants.filter(r => r.approvalStatus === 'PENDING').length;

  // Filtered orders list
  const filteredOrders = orders.filter(ord => {
    // Status filter
    if (orderStatusFilter !== 'ALL') {
      if (orderStatusFilter === 'PENDING' && ord.status !== 'Pending WhatsApp Confirmation' && (ord.status as string) !== 'Pending') {
        return false;
      }
      if (orderStatusFilter === 'ACCEPTED' && ord.status !== 'Confirmed' && (ord.status as string) !== 'Accepted') {
        return false;
      }
      if (orderStatusFilter === 'PREPARING' && ord.status !== 'Preparing') return false;
      if (orderStatusFilter === 'OUT_FOR_DELIVERY' && ord.status !== 'Out for Delivery') return false;
      if (orderStatusFilter === 'DELIVERED' && ord.status !== 'Delivered') return false;
      if (orderStatusFilter === 'CANCELLED' && ord.status !== 'Cancelled') return false;
    }

    // Delivery type filter
    if (orderDeliveryFilter !== 'ALL') {
      if (orderDeliveryFilter === 'train' && ord.customer.deliveryType === 'local') return false;
      if (orderDeliveryFilter === 'local' && ord.customer.deliveryType !== 'local') return false;
    }

    // Search query filter
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchNum = ord.orderNumber.toLowerCase().includes(q);
      const matchName = ord.customer.passengerName.toLowerCase().includes(q);
      const matchPhone = ord.customer.mobileNumber.includes(q);
      const matchTrain = (ord.customer.trainNumber || '').toLowerCase().includes(q);
      const matchPnr = (ord.customer.pnrNumber || '').toLowerCase().includes(q);
      return matchNum || matchName || matchPhone || matchTrain || matchPnr;
    }

    return true;
  });

  // Filtered restaurants
  const filteredRestaurants = restaurants.filter(r => {
    if (restaurantApprovalFilter === 'APPROVED') {
      return r.approvalStatus === 'APPROVED' || !r.approvalStatus;
    }
    if (restaurantApprovalFilter === 'PENDING') {
      return r.approvalStatus === 'PENDING';
    }
    if (restaurantApprovalFilter === 'REJECTED') {
      return r.approvalStatus === 'REJECTED';
    }
    return true;
  });

  // Filtered foods
  const filteredFoods = foodItems.filter(f => {
    if (foodCategoryFilter !== 'ALL' && f.category.toLowerCase() !== foodCategoryFilter.toLowerCase()) {
      return false;
    }
    if (foodRestaurantFilter !== 'ALL' && f.restaurantId !== foodRestaurantFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className={standalone ? "min-h-screen bg-stone-900 flex flex-col font-sans" : "fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"}>
      <div className={standalone ? "flex-1 flex flex-col bg-white overflow-hidden min-h-screen" : "bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200"}>
        
        {/* Top Header Bar */}
        <header className="bg-stone-900 text-white px-4 sm:px-6 py-3.5 border-b-2 border-amber-400 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-black shadow-xs">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-base sm:text-lg font-black tracking-tight text-white">
                  RailFoody <span className="text-amber-400">Admin</span>
                </h1>
                {token ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-stone-950 uppercase tracking-wider">
                    <CheckCircle className="w-2.5 h-2.5" /> Authenticated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300">
                    <Lock className="w-2.5 h-2.5" /> Secure Gate
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Station Operations & Catering Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-stone-700 cursor-pointer"
                title="Return to Customer Public Website"
              >
                <span>← Customer Site</span>
              </button>
            )}

            {token && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-rose-800 cursor-pointer"
                title="Log Out of Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            
            {!standalone && (
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Global Notifications */}
        {successMsg && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 flex items-center justify-between shadow-md shrink-0">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
            </span>
            <button onClick={() => setSuccessMsg('')} className="cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-600 text-white text-xs px-4 py-2.5 flex items-center justify-between shadow-md shrink-0">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </span>
            <button onClick={() => setErrorMsg('')} className="cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* SCREEN 1: UN-AUTHENTICATED LOGIN SCREEN */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-stone-100 overflow-y-auto">
            <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-stone-950 mx-auto flex items-center justify-center mb-4 shadow-md">
                <Lock className="w-7 h-7 text-stone-950" />
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-stone-900 text-center mb-1">
                Admin Authentication
              </h2>
              <p className="text-xs text-stone-500 text-center mb-6 leading-relaxed">
                Enter your authorized RailFoody administrator credentials to access orders, kitchens, and configuration.
              </p>

              {loginError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin or railfoody@gmail.com"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameInput('9752693979');
                      setPasswordInput('admin');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition-all cursor-pointer border border-amber-300"
                    title="Auto-fill phone 9752693979"
                  >
                    <span>⚡ Quick Fill: 9752693979</span>
                  </button>
                  {onNavigateHome && (
                    <button
                      type="button"
                      onClick={onNavigateHome}
                      className="text-amber-700 font-bold hover:underline cursor-pointer"
                    >
                      ← Back to Site
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>{loginLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* SCREEN 2: AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-stone-50">
            
            {/* Sidebar Navigation (Desktop) & Top Tabs (Mobile) */}
            <aside className="w-full md:w-64 bg-stone-900 text-stone-300 p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 border-r border-stone-800 scrollbar-none">
              {[
                { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
                { id: 'orders', label: 'All & New Orders', icon: ShoppingBag, count: orders.length, alert: pendingOrdersCount > 0 },
                { id: 'restaurants', label: 'Kitchens & Approvals', icon: Utensils, count: restaurants.length, alert: pendingApprovalKitchensCount > 0 },
                { id: 'foods', label: 'Menu & Prices', icon: Sparkles, count: foodItems.length },
                { id: 'trains', label: 'Train Database', icon: Train, count: trains.length },
                { id: 'banners', label: 'Slider Banners', icon: ImageIcon, count: banners.length },
                { id: 'settings', label: 'Site Settings & SEO', icon: Settings },
                { id: 'backup', label: 'Backup & Migrate', icon: Download },
                { id: 'password', label: 'Security & Auth', icon: Key }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setEditingTrain(null);
                      setEditingRestaurant(null);
                      setEditingFood(null);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                      <span>{tab.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      {tab.alert && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                      {tab.count !== undefined && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                          isActive ? 'bg-stone-950 text-amber-300' : 'bg-stone-800 text-stone-300'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-3 sm:p-6 overflow-y-auto bg-stone-50">
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                  
                  {/* Top Welcome & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl font-black text-stone-900">
                        RailFoody Operations Hub
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Real-time station monitoring, order dispatch & kitchen vendor management.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={onRefreshData}
                        className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('orders');
                          setOrderStatusFilter('PENDING');
                        }}
                        className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>New Orders ({pendingOrdersCount})</span>
                      </button>
                    </div>
                  </div>

                  {/* 6 Key Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    
                    {/* Card 1: Total Orders */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div className="flex items-center justify-between text-stone-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Orders</span>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-heading text-2xl sm:text-3xl font-black text-stone-900">
                        {orders.length}
                      </div>
                      <span className="text-[11px] text-stone-400 mt-1 block">Lifetime passenger orders</span>
                    </div>

                    {/* Card 2: New Pending Orders */}
                    <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-colors ${
                      pendingOrdersCount > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200'
                    }`}>
                      <div className="flex items-center justify-between text-stone-400 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          pendingOrdersCount > 0 ? 'text-amber-800' : 'text-stone-500'
                        }`}>
                          Action Required
                        </span>
                        <div className={`p-2 rounded-xl ${
                          pendingOrdersCount > 0 ? 'bg-amber-200 text-amber-900' : 'bg-stone-100 text-stone-600'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div className={`font-heading text-2xl sm:text-3xl font-black ${
                        pendingOrdersCount > 0 ? 'text-amber-950' : 'text-stone-900'
                      }`}>
                        {pendingOrdersCount}
                      </div>
                      <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                        {pendingOrdersCount > 0 ? '⚡ Needs Immediate Confirmation' : 'All orders processed'}
                      </span>
                    </div>

                    {/* Card 3: Total Revenue */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div className="flex items-center justify-between text-stone-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Gross Sales</span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-heading text-2xl sm:text-3xl font-black text-emerald-800">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-stone-400 mt-1 block">COD + UPI deliveries</span>
                    </div>

                    {/* Card 4: Verified Kitchens */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div className="flex items-center justify-between text-stone-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Active Kitchens</span>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                          <Utensils className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-heading text-2xl sm:text-3xl font-black text-stone-900">
                        {approvedKitchensCount}
                      </div>
                      <span className="text-[11px] text-stone-400 mt-1 block">
                        {pendingApprovalKitchensCount > 0 ? `⚠️ ${pendingApprovalKitchensCount} pending approval` : '100% verified FSSAI'}
                      </span>
                    </div>

                    {/* Card 5: Trains Mapped */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div className="flex items-center justify-between text-stone-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Train Routes</span>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                          <Train className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-heading text-2xl sm:text-3xl font-black text-stone-900">
                        {trains.length}
                      </div>
                      <span className="text-[11px] text-stone-400 mt-1 block">Jabalpur hub + enroute</span>
                    </div>

                    {/* Card 6: Menu Dishes */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
                      <div className="flex items-center justify-between text-stone-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Menu Items</span>
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="font-heading text-2xl sm:text-3xl font-black text-stone-900">
                        {foodItems.length}
                      </div>
                      <span className="text-[11px] text-stone-400 mt-1 block">Across 15 food categories</span>
                    </div>

                  </div>

                  {/* Order Status Pipeline */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-sm font-black text-stone-900 uppercase tracking-wider">
                        Live Order Fulfillment Pipeline
                      </h3>
                      <span className="text-xs text-stone-400">Click to filter orders</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {[
                        { label: 'Pending', count: pendingOrdersCount, color: 'bg-amber-100 text-amber-900 border-amber-300', filter: 'PENDING' },
                        { label: 'Accepted', count: orders.filter(o => o.status === 'Confirmed').length, color: 'bg-blue-100 text-blue-900 border-blue-300', filter: 'ACCEPTED' },
                        { label: 'Preparing', count: preparingOrdersCount, color: 'bg-orange-100 text-orange-900 border-orange-300', filter: 'PREPARING' },
                        { label: 'Out for Delivery', count: outForDeliveryCount, color: 'bg-indigo-100 text-indigo-900 border-indigo-300', filter: 'OUT_FOR_DELIVERY' },
                        { label: 'Delivered', count: deliveredOrdersCount, color: 'bg-emerald-100 text-emerald-900 border-emerald-300', filter: 'DELIVERED' },
                        { label: 'Cancelled', count: cancelledOrdersCount, color: 'bg-stone-100 text-stone-600 border-stone-300', filter: 'CANCELLED' }
                      ].map(pipe => (
                        <button
                          key={pipe.label}
                          onClick={() => {
                            setActiveTab('orders');
                            setOrderStatusFilter(pipe.filter);
                          }}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer hover:shadow-xs ${pipe.color}`}
                        >
                          <span className="block text-xl font-black">{pipe.count}</span>
                          <span className="text-[11px] font-bold block truncate">{pipe.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent 5 Orders Table */}
                  <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-heading text-base font-black text-stone-900">
                          Recent Orders Feed
                        </h3>
                        <p className="text-xs text-stone-500">Latest passenger requests needing preparation.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Orders ({orders.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-8 text-center text-stone-400 text-xs">
                        No orders recorded yet. As passengers place orders, they appear here instantly.
                      </div>
                    ) : (
                      <div className="divide-y divide-stone-100 overflow-x-auto">
                        {orders.slice(0, 5).map(ord => (
                          <div key={ord.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-stone-900 text-amber-400 font-mono text-xs font-bold rounded">
                                  #{ord.orderNumber}
                                </span>
                                <strong className="text-xs font-bold text-stone-900">{ord.customer.passengerName}</strong>
                                <span className="text-xs text-stone-400">•</span>
                                <span className="text-xs text-stone-600">{ord.customer.mobileNumber}</span>
                              </div>
                              <div className="text-xs text-stone-500 mt-1">
                                {ord.customer.deliveryType === 'local' ? (
                                  <span>🛵 Local: {ord.customer.localAddress}</span>
                                ) : (
                                  <span>🚆 Train {ord.customer.trainNumber || '--'} • Coach {ord.customer.coachNumber || '--'}, Seat {ord.customer.seatNumber || '--'}</span>
                                )}
                                <span className="mx-2">•</span>
                                <span className="font-medium text-stone-700">{ord.items.length} dishes</span>
                                <span className="mx-2">•</span>
                                <strong className="text-emerald-800 font-bold">₹{ord.totalAmount}</strong>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : ord.status === 'Preparing'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : ord.status === 'Confirmed'
                                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                                  : 'bg-stone-100 text-stone-700 border-stone-300'
                              }`}>
                                {ord.status}
                              </span>

                              <button
                                onClick={() => sendWhatsAppUpdate(ord)}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                                title="Send WhatsApp status update"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Shortcuts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => {
                        setActiveTab('restaurants');
                        setEditingRestaurant({
                          id: `rest-${Date.now()}`,
                          name: '',
                          stationCode: 'JBP',
                          stationName: 'Jabalpur Junction (JBP)',
                          rating: 4.8,
                          reviewCount: 10,
                          minOrder: 120,
                          prepTime: '20-25 mins',
                          vegOnly: false,
                          fssaiLicense: '11424850009999',
                          image: '/src/assets/images/banner_railfoody_brand_1792004058022.jpg',
                          address: 'Platform 1 Circulating Area, Jabalpur',
                          isOpen: true,
                          phone: '9752693979',
                          cuisines: ['North Indian', 'Thali'],
                          approvalStatus: 'APPROVED'
                        });
                        setIsNewRestaurant(true);
                      }}
                      className="p-3 bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-600 mb-1" />
                      <span className="text-xs font-bold text-stone-900 block">Add Restaurant</span>
                      <span className="text-[10px] text-stone-400">Onboard new partner</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('foods');
                        setEditingFood({
                          id: `food-${Date.now()}`,
                          name: '',
                          restaurantId: restaurants[0]?.id || '',
                          restaurantName: restaurants[0]?.name || 'Partner Kitchen',
                          category: 'Biryani',
                          price: 180,
                          isVeg: true,
                          image: '/src/assets/images/cat_biryani_icon_1792361770033.jpg',
                          description: 'Freshly prepared hot meal',
                          isAvailable: true,
                          preparationTime: '20 mins'
                        });
                        setIsNewFood(true);
                      }}
                      className="p-3 bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600 mb-1" />
                      <span className="text-xs font-bold text-stone-900 block">Add Menu Dish</span>
                      <span className="text-[10px] text-stone-400">15 food categories</span>
                    </button>

                    <button
                      onClick={handleSyncTrains}
                      className="p-3 bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold text-stone-900 block">Sync Timetables</span>
                      <span className="text-[10px] text-stone-400">Official railway halts</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="p-3 bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-all cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-purple-600 mb-1" />
                      <span className="text-xs font-bold text-stone-900 block">Announcements</span>
                      <span className="text-[10px] text-stone-400">Ticker & WhatsApp</span>
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4 max-w-6xl mx-auto">
                  
                  {/* Orders Header & Search */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="font-heading text-xl font-black text-stone-900">
                          Order Management ({filteredOrders.length})
                        </h2>
                        <p className="text-xs text-stone-500">
                          Manage passenger meals, status progression, coach deliveries & WhatsApp notifications.
                        </p>
                      </div>

                      <button
                        onClick={onRefreshData}
                        className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
                      </button>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                      <span className="text-xs font-bold text-stone-400 mr-1 flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Status:
                      </span>
                      {[
                        { id: 'ALL', label: `All (${orders.length})` },
                        { id: 'PENDING', label: `Pending (${pendingOrdersCount})` },
                        { id: 'ACCEPTED', label: `Accepted (${orders.filter(o => o.status === 'Confirmed').length})` },
                        { id: 'PREPARING', label: `Preparing (${preparingOrdersCount})` },
                        { id: 'OUT_FOR_DELIVERY', label: `Out for Delivery (${outForDeliveryCount})` },
                        { id: 'DELIVERED', label: `Delivered (${deliveredOrdersCount})` },
                        { id: 'CANCELLED', label: `Cancelled (${cancelledOrdersCount})` }
                      ].map(pill => (
                        <button
                          key={pill.id}
                          onClick={() => setOrderStatusFilter(pill.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            orderStatusFilter === pill.id
                              ? 'bg-stone-900 text-amber-400 shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    {/* Search and Delivery Type Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Search by Order #, Passenger, Mobile, Train No., PNR..."
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                          className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <select
                          value={orderDeliveryFilter}
                          onChange={(e) => setOrderDeliveryFilter(e.target.value as any)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                        >
                          <option value="ALL">All Delivery Types</option>
                          <option value="train">🚆 Train Berth Delivery Only</option>
                          <option value="local">🛵 Local Delivery Only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Orders Cards List */}
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-10 text-center text-stone-500">
                      <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-stone-700">No orders matching this filter</p>
                      <p className="text-xs text-stone-400 mt-0.5">Try clearing the status filter or search query.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-amber-400 transition-all space-y-4"
                        >
                          {/* Card Header: Order Number, Customer, Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-stone-900 text-amber-400 font-mono font-black text-xs px-2.5 py-0.5 rounded-md">
                                  #{ord.orderNumber}
                                </span>
                                <span className="font-bold text-stone-900 text-sm">
                                  {ord.customer.passengerName}
                                </span>
                                <a
                                  href={`tel:${ord.customer.mobileNumber}`}
                                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded"
                                >
                                  <Phone className="w-3 h-3" /> {ord.customer.mobileNumber}
                                </a>
                                <span className="text-[11px] text-stone-400">
                                  {new Date(ord.createdAt).toLocaleString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              {/* Delivery destination badge */}
                              <div className="text-xs text-stone-600 mt-2 flex flex-wrap items-center gap-2">
                                {ord.customer.deliveryType === 'local' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
                                    🛵 <strong>Local Food Delivery</strong>: {ord.customer.localAddress} {ord.customer.cityArea ? `(${ord.customer.cityArea})` : ''}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-950 border border-blue-200 rounded-lg">
                                    🚆 <strong>Train {ord.customer.trainNumber || '--'}</strong> ({ord.customer.trainName || 'Express'}) • Coach: <strong>{ord.customer.coachNumber || '--'}</strong>, Berth: <strong>{ord.customer.seatNumber || '--'}</strong> • Station: <strong>{ord.customer.boardingStation || 'JBP'}</strong> • PNR: <strong>{ord.customer.pnrNumber || '--'}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Status Selector & WhatsApp Push */}
                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-hidden cursor-pointer ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : ord.status === 'Preparing'
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : ord.status === 'Confirmed'
                                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                                    : ord.status === 'Out for Delivery'
                                    ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-900 border-rose-300'
                                    : 'bg-stone-100 text-stone-800 border-stone-300'
                                }`}
                              >
                                <option value="Pending WhatsApp Confirmation">⏳ Pending Confirmation</option>
                                <option value="Confirmed">✅ Accepted / Confirmed</option>
                                <option value="Preparing">🍳 Preparing in Kitchen</option>
                                <option value="Out for Delivery">🛵 Out for Delivery to Berth</option>
                                <option value="Delivered">🎉 Delivered</option>
                                <option value="Cancelled">❌ Cancelled</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => sendWhatsAppUpdate(ord)}
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                title="Send live WhatsApp status to passenger"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>
                            </div>
                          </div>

                          {/* Items and Bill Breakdown */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                            <div className="sm:col-span-2 space-y-1.5">
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                                Kitchen: <strong className="text-stone-800">{ord.restaurantName}</strong>
                              </span>
                              <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
                                {ord.items.map((it, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-stone-700">
                                    <span className="flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full ${it.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                      <strong>{it.name}</strong> × {it.quantity}
                                    </span>
                                    <span className="font-mono text-stone-900 font-semibold">₹{it.price * it.quantity}</span>
                                  </div>
                                ))}
                                {ord.customer.deliveryInstructions && (
                                  <div className="text-[11px] text-amber-900 italic pt-1 border-t border-stone-200">
                                    Special Passenger Note: "{ord.customer.deliveryInstructions}"
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col justify-between">
                              <div className="space-y-1 text-stone-600 text-[11px]">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span className="font-mono">₹{ord.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Delivery & Packaging:</span>
                                  <span className="font-mono">₹{ord.deliveryFee}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>GST (5%):</span>
                                  <span className="font-mono">₹{ord.gstAmount}</span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-800">Total Payable:</span>
                                <span className="font-heading font-black text-base text-emerald-800">
                                  ₹{ord.totalAmount}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: RESTAURANTS & APPROVALS */}
              {activeTab === 'restaurants' && (
                <div className="space-y-4 max-w-6xl mx-auto">
                  
                  {/* Restaurants Header */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-heading text-xl font-black text-stone-900">
                        Kitchen Partners & FSSAI Approvals ({restaurants.length})
                      </h2>
                      <p className="text-xs text-stone-500">
                        Verify vendor applications, inspect FSSAI/GST certificates, bank details, and toggle online delivery.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingRestaurant({
                          id: `rest-${Date.now()}`,
                          name: '',
                          stationCode: 'JBP',
                          stationName: 'Jabalpur Junction (JBP)',
                          rating: 4.8,
                          reviewCount: 15,
                          minOrder: 120,
                          prepTime: '20-25 mins',
                          vegOnly: false,
                          fssaiLicense: '11424850001234',
                          gstNumber: '',
                          ownerName: '',
                          bankDetails: {
                            bankName: 'State Bank of India',
                            accountNumber: '',
                            ifscCode: '',
                            beneficiaryName: ''
                          },
                          image: '/src/assets/images/banner_railfoody_brand_1792004058022.jpg',
                          address: 'Railway Station Road, Jabalpur',
                          isOpen: true,
                          phone: '9752693979',
                          cuisines: ['North Indian', 'Thali'],
                          approvalStatus: 'APPROVED'
                        });
                        setIsNewRestaurant(true);
                      }}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Restaurant
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'ALL', label: `All Kitchens (${restaurants.length})` },
                      { id: 'APPROVED', label: `Approved (${approvedKitchensCount})` },
                      { id: 'PENDING', label: `Pending Review (${pendingApprovalKitchensCount})` },
                      { id: 'REJECTED', label: `Rejected (${restaurants.filter(r => r.approvalStatus === 'REJECTED').length})` }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setRestaurantApprovalFilter(f.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          restaurantApprovalFilter === f.id
                            ? 'bg-stone-900 text-amber-400 shadow-xs'
                            : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Restaurant Edit Form Modal / Block */}
                  {editingRestaurant && (
                    <form onSubmit={handleSaveRestaurant} className="bg-white border-2 border-amber-400 p-5 rounded-2xl shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                        <div>
                          <h3 className="font-heading text-base font-black text-stone-900">
                            {isNewRestaurant ? 'Add New Kitchen Partner' : `Edit Kitchen: ${editingRestaurant.name}`}
                          </h3>
                          <p className="text-xs text-stone-500">Provide official details, FSSAI registration and bank account.</p>
                        </div>
                        <button type="button" onClick={() => setEditingRestaurant(null)} className="cursor-pointer">
                          <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Restaurant Name *</label>
                          <input
                            type="text"
                            required
                            value={editingRestaurant.name}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, name: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Station Code & Name *</label>
                          <input
                            type="text"
                            required
                            value={editingRestaurant.stationName}
                            onChange={(e) => {
                              const code = e.target.value.slice(0, 4).toUpperCase().trim();
                              setEditingRestaurant({ ...editingRestaurant, stationName: e.target.value, stationCode: code });
                            }}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Owner / Contact Person</label>
                          <input
                            type="text"
                            value={editingRestaurant.ownerName || ''}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, ownerName: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                            placeholder="e.g. Ramesh Sharma"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Contact Phone *</label>
                          <input
                            type="text"
                            required
                            value={editingRestaurant.phone}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">FSSAI License No. *</label>
                          <input
                            type="text"
                            required
                            value={editingRestaurant.fssaiLicense}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, fssaiLicense: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">GSTIN Number</label>
                          <input
                            type="text"
                            value={editingRestaurant.gstNumber || ''}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, gstNumber: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono uppercase"
                            placeholder="e.g. 23AAAAA0000A1Z5"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Bank Name & Branch</label>
                          <input
                            type="text"
                            value={editingRestaurant.bankDetails?.bankName || ''}
                            onChange={(e) => setEditingRestaurant({
                              ...editingRestaurant,
                              bankDetails: { ...(editingRestaurant.bankDetails || {}), bankName: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                            placeholder="SBI Jabalpur Civil Lines"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Bank Account Number</label>
                          <input
                            type="text"
                            value={editingRestaurant.bankDetails?.accountNumber || ''}
                            onChange={(e) => setEditingRestaurant({
                              ...editingRestaurant,
                              bankDetails: { ...(editingRestaurant.bankDetails || {}), accountNumber: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                            placeholder="Account number"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Bank IFSC Code</label>
                          <input
                            type="text"
                            value={editingRestaurant.bankDetails?.ifscCode || ''}
                            onChange={(e) => setEditingRestaurant({
                              ...editingRestaurant,
                              bankDetails: { ...(editingRestaurant.bankDetails || {}), ifscCode: e.target.value.toUpperCase() }
                            })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono uppercase"
                            placeholder="SBIN0001234"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Beneficiary Name</label>
                          <input
                            type="text"
                            value={editingRestaurant.bankDetails?.beneficiaryName || ''}
                            onChange={(e) => setEditingRestaurant({
                              ...editingRestaurant,
                              bankDetails: { ...(editingRestaurant.bankDetails || {}), beneficiaryName: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                            placeholder="Name as per passbook"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Approval Status</label>
                          <select
                            value={editingRestaurant.approvalStatus || 'APPROVED'}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, approvalStatus: e.target.value as any })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                          >
                            <option value="APPROVED">✅ APPROVED</option>
                            <option value="PENDING">⏳ PENDING REVIEW</option>
                            <option value="REJECTED">❌ REJECTED</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Upload Kitchen Photo</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleRestaurantImageUpload}
                              className="text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-900"
                            />
                            {uploadingRestImage && <span className="text-[10px] text-amber-700">Uploading...</span>}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1 text-xs">Full Address</label>
                        <input
                          type="text"
                          value={editingRestaurant.address}
                          onChange={(e) => setEditingRestaurant({ ...editingRestaurant, address: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                          placeholder="Platform or station circulating area address"
                        />
                      </div>

                      <div className="flex items-center gap-6 pt-1 text-xs">
                        <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingRestaurant.vegOnly}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, vegOnly: e.target.checked })}
                            className="rounded text-emerald-600"
                          />
                          <span>100% Pure Veg Kitchen</span>
                        </label>

                        <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingRestaurant.isOpen}
                            onChange={(e) => setEditingRestaurant({ ...editingRestaurant, isOpen: e.target.checked })}
                            className="rounded text-emerald-600"
                          />
                          <span>Kitchen Currently Open & Taking Orders</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={() => setEditingRestaurant(null)}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                        >
                          Save Kitchen Details
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Document Inspection Drawer/Modal */}
                  {viewingDocumentsRestaurant && (
                    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-amber-600" />
                            <div>
                              <h3 className="font-heading font-black text-stone-900 text-base">
                                {viewingDocumentsRestaurant.name}
                              </h3>
                              <span className="text-xs text-stone-500">Official Partner Verification Files</span>
                            </div>
                          </div>
                          <button onClick={() => setViewingDocumentsRestaurant(null)} className="cursor-pointer">
                            <X className="w-5 h-5 text-stone-400" />
                          </button>
                        </div>

                        {/* Kitchen Photo Preview */}
                        <div className="w-full h-36 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                          <img
                            src={viewingDocumentsRestaurant.kitchenImage || viewingDocumentsRestaurant.image}
                            alt="Kitchen Premise"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Document Records */}
                        <div className="space-y-2.5 text-xs">
                          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                            <span className="text-[10px] font-bold text-stone-400 uppercase block">FSSAI License Registration</span>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="font-mono font-black text-stone-900 text-sm">{viewingDocumentsRestaurant.fssaiLicense}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Govt Verified</span>
                            </div>
                          </div>

                          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                            <span className="text-[10px] font-bold text-stone-400 uppercase block">GST Identification Number (GSTIN)</span>
                            <span className="font-mono font-bold text-stone-900 text-xs">
                              {viewingDocumentsRestaurant.gstNumber || 'Not submitted (Small Scale Vendor / Composition Scheme)'}
                            </span>
                          </div>

                          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                            <span className="text-[10px] font-bold text-stone-400 uppercase block">Bank Settlement Details</span>
                            <div className="grid grid-cols-2 gap-2 text-stone-700">
                              <div>Bank: <strong>{viewingDocumentsRestaurant.bankDetails?.bankName || 'SBI'}</strong></div>
                              <div>A/C: <strong className="font-mono">{viewingDocumentsRestaurant.bankDetails?.accountNumber || 'Pending'}</strong></div>
                              <div>IFSC: <strong className="font-mono">{viewingDocumentsRestaurant.bankDetails?.ifscCode || 'Pending'}</strong></div>
                              <div>Name: <strong>{viewingDocumentsRestaurant.bankDetails?.beneficiaryName || viewingDocumentsRestaurant.name}</strong></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <span className="text-xs text-stone-500">
                            Status: <strong className="font-bold text-stone-900">{viewingDocumentsRestaurant.approvalStatus || 'APPROVED'}</strong>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                handleSetRestaurantApproval(viewingDocumentsRestaurant.id, 'APPROVED');
                                setViewingDocumentsRestaurant(null);
                              }}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Approve Kitchen
                            </button>
                            <button
                              onClick={() => {
                                handleSetRestaurantApproval(viewingDocumentsRestaurant.id, 'REJECTED');
                                setViewingDocumentsRestaurant(null);
                              }}
                              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Restaurants Cards / Table */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRestaurants.map(rest => {
                      const isApproved = rest.approvalStatus === 'APPROVED' || !rest.approvalStatus;
                      const isPending = rest.approvalStatus === 'PENDING';
                      const isRejected = rest.approvalStatus === 'REJECTED';

                      return (
                        <div
                          key={rest.id}
                          className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-400 transition-all"
                        >
                          <div>
                            {/* Card Top: Image + Info */}
                            <div className="flex items-start gap-3">
                              <img
                                src={rest.image}
                                alt={rest.name}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                              />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-stone-900 text-sm truncate">{rest.name}</h3>
                                <p className="text-xs text-stone-500 truncate">{rest.stationName}</p>
                                
                                <div className="flex items-center gap-1.5 mt-1">
                                  {isApproved && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      Approved
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                                      Pending Review
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                      Rejected
                                    </span>
                                  )}
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    rest.isOpen ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-600'
                                  }`}>
                                    {rest.isOpen ? 'Open' : 'Closed'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Details snippet */}
                            <div className="mt-3 text-[11px] text-stone-600 space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                              <div>FSSAI: <strong className="font-mono text-stone-800">{rest.fssaiLicense}</strong></div>
                              <div>Phone: <strong className="font-mono text-stone-800">{rest.phone}</strong></div>
                              <div>Type: <strong>{rest.vegOnly ? '100% Pure Veg' : 'Veg & Non-Veg'}</strong></div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                            <button
                              onClick={() => setViewingDocumentsRestaurant(rest)}
                              className="text-stone-700 hover:text-stone-950 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-600" />
                              <span>Docs</span>
                            </button>

                            <div className="flex items-center gap-1">
                              {isPending && (
                                <button
                                  onClick={() => handleSetRestaurantApproval(rest.id, 'APPROVED')}
                                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                                  title="Approve Kitchen"
                                >
                                  Approve
                                </button>
                              )}

                              <button
                                onClick={() => handleToggleRestaurantOpen(rest)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                  rest.isOpen ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                }`}
                                title="Toggle Open/Closed"
                              >
                                {rest.isOpen ? 'Close' : 'Open'}
                              </button>

                              <button
                                onClick={() => {
                                  setEditingRestaurant(rest);
                                  setIsNewRestaurant(false);
                                }}
                                className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-stone-900 cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteRestaurant(rest.id)}
                                className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB 4: MENU & FOOD ITEMS */}
              {activeTab === 'foods' && (
                <div className="space-y-4 max-w-6xl mx-auto">
                  
                  {/* Menu Header */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-heading text-xl font-black text-stone-900">
                        Menu & Pricing Control ({foodItems.length})
                      </h2>
                      <p className="text-xs text-stone-500">
                        Add, edit, or delete items across all 15 food delivery app categories.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingFood({
                          id: `food-${Date.now()}`,
                          name: '',
                          restaurantId: restaurants[0]?.id || '',
                          restaurantName: restaurants[0]?.name || 'Partner Kitchen',
                          category: 'Biryani',
                          price: 180,
                          isVeg: true,
                          image: '/src/assets/images/cat_biryani_icon_1792361770033.jpg',
                          description: 'Fresh royal Dum Biryani cooked with fragrant saffron basmati rice.',
                          isAvailable: true,
                          preparationTime: '20 mins'
                        });
                        setIsNewFood(true);
                      }}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Food Item
                    </button>
                  </div>

                  {/* Filters Row */}
                  <div className="bg-white p-3 rounded-2xl border border-stone-200 flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-500">Category:</span>
                      <select
                        value={foodCategoryFilter}
                        onChange={(e) => setFoodCategoryFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-bold"
                      >
                        <option value="ALL">All Categories</option>
                        {FOOD_CATEGORIES.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-500">Kitchen:</span>
                      <select
                        value={foodRestaurantFilter}
                        onChange={(e) => setFoodRestaurantFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg"
                      >
                        <option value="ALL">All Kitchens</option>
                        {restaurants.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Food Item Edit Form */}
                  {editingFood && (
                    <form onSubmit={handleSaveFood} className="bg-white border-2 border-amber-400 p-5 rounded-2xl shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                        <h3 className="font-heading text-base font-black text-stone-900">
                          {isNewFood ? 'Add New Menu Item' : `Edit Item: ${editingFood.name}`}
                        </h3>
                        <button type="button" onClick={() => setEditingFood(null)} className="cursor-pointer">
                          <X className="w-5 h-5 text-stone-400" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Item / Dish Name *</label>
                          <input
                            type="text"
                            required
                            value={editingFood.name}
                            onChange={(e) => setEditingFood({ ...editingFood, name: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Category *</label>
                          <select
                            value={editingFood.category}
                            onChange={(e) => setEditingFood({ ...editingFood, category: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                          >
                            {FOOD_CATEGORIES.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Price (₹) *</label>
                          <input
                            type="number"
                            required
                            value={editingFood.price}
                            onChange={(e) => setEditingFood({ ...editingFood, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Kitchen Partner</label>
                          <select
                            value={editingFood.restaurantId}
                            onChange={(e) => setEditingFood({ ...editingFood, restaurantId: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                          >
                            {restaurants.map(r => (
                              <option key={r.id} value={r.id}>{r.name} ({r.stationCode})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Prep Time</label>
                          <input
                            type="text"
                            value={editingFood.preparationTime}
                            onChange={(e) => setEditingFood({ ...editingFood, preparationTime: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Upload Food Image</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFoodImageUpload}
                              className="text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-900"
                            />
                            {uploadingFoodImage && <span className="text-[10px] text-amber-700">Uploading...</span>}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1 text-xs">Description</label>
                        <textarea
                          rows={2}
                          value={editingFood.description}
                          onChange={(e) => setEditingFood({ ...editingFood, description: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                          placeholder="Dish ingredients, portions, packing details"
                        />
                      </div>

                      <div className="flex items-center gap-6 pt-1 text-xs">
                        <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingFood.isVeg}
                            onChange={(e) => setEditingFood({ ...editingFood, isVeg: e.target.checked })}
                            className="rounded text-emerald-600"
                          />
                          <span>Pure Veg Dish</span>
                        </label>

                        <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingFood.isAvailable}
                            onChange={(e) => setEditingFood({ ...editingFood, isAvailable: e.target.checked })}
                            className="rounded text-emerald-600"
                          />
                          <span>Available / In Stock</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={() => setEditingFood(null)}
                          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                        >
                          Save Food Item
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Food Items Table */}
                  <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px] border-b border-stone-200">
                          <tr>
                            <th className="py-3 px-3">Item</th>
                            <th className="py-3 px-2">Category</th>
                            <th className="py-3 px-2">Price</th>
                            <th className="py-3 px-2">Kitchen</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredFoods.map(f => (
                            <tr key={f.id} className="hover:bg-stone-50">
                              <td className="py-3 px-3 flex items-center gap-2.5">
                                <img
                                  src={f.image}
                                  alt={f.name}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${f.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                    <strong className="text-stone-900">{f.name}</strong>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-stone-600 font-medium">{f.category}</td>
                              <td className="py-3 px-2 font-mono font-black text-stone-900">₹{f.price}</td>
                              <td className="py-3 px-2 text-stone-500 max-w-[120px] truncate">{f.restaurantName}</td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  f.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                                }`}>
                                  {f.isAvailable ? 'Available' : 'Sold Out'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setEditingFood(f);
                                    setIsNewFood(false);
                                  }}
                                  className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-700 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFood(f.id)}
                                  className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

              {/* TAB 5: TRAIN DATABASE */}
              {activeTab === 'trains' && (
                <div className="space-y-4 max-w-6xl mx-auto">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-xl font-black text-stone-900">
                        Indian Railways Train Database ({trains.length})
                      </h2>
                      <p className="text-xs text-stone-500">
                        Train timetables, station halts & delivery stoppage windows.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSyncTrains}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Live Sync Schedules
                      </button>
                      <a
                        href="/api/admin/export/trains.csv"
                        download="railfoody_trains.csv"
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-stone-200"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Export CSV
                      </a>
                    </div>
                  </div>

                  {/* Trains Table */}
                  <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px] border-b border-stone-200">
                          <tr>
                            <th className="py-3 px-3">Train Number & Name</th>
                            <th className="py-3 px-3">Route</th>
                            <th className="py-3 px-2">Halts</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {trains.map(t => (
                            <tr key={t.id} className="hover:bg-stone-50">
                              <td className="py-3 px-3">
                                <span className="font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded mr-1.5">
                                  {t.trainNumber}
                                </span>
                                <strong className="text-stone-900">{t.trainName}</strong>
                              </td>
                              <td className="py-3 px-3 text-stone-600">{t.sourceStation} ➔ {t.destStation}</td>
                              <td className="py-3 px-2 text-stone-500 font-mono">{t.halts.length} halts</td>
                              <td className="py-3 px-2">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded">
                                  {t.syncStatus}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => handleDeleteTrain(t.id)}
                                  className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

              {/* TAB 6: SLIDER BANNERS */}
              {activeTab === 'banners' && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h2 className="font-heading text-xl font-black text-stone-900">
                        Promotional Hero Banners ({editableBanners.length})
                      </h2>
                      <p className="text-xs text-stone-500">Update headline banners displayed on the customer frontend.</p>
                    </div>

                    <button
                      onClick={handleSaveBanners}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Save Banners
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editableBanners.map((banner, idx) => (
                      <div key={banner.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between font-bold text-xs text-stone-800 border-b pb-2">
                          <span>Banner #{idx + 1}</span>
                          <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-500">{banner.id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">Headline</label>
                            <input
                              type="text"
                              value={banner.title}
                              onChange={(e) => {
                                const next = [...editableBanners];
                                next[idx].title = e.target.value;
                                setEditableBanners(next);
                              }}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-stone-700 mb-1">Badge Tag</label>
                            <input
                              type="text"
                              value={banner.badge}
                              onChange={(e) => {
                                const next = [...editableBanners];
                                next[idx].badge = e.target.value;
                                setEditableBanners(next);
                              }}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1 text-xs">Subtitle Description</label>
                          <input
                            type="text"
                            value={banner.subtitle}
                            onChange={(e) => {
                              const next = [...editableBanners];
                              next[idx].subtitle = e.target.value;
                              setEditableBanners(next);
                            }}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1 text-xs">Image URL</label>
                          <input
                            type="text"
                            value={banner.image}
                            onChange={(e) => {
                              const next = [...editableBanners];
                              next[idx].image = e.target.value;
                              setEditableBanners(next);
                            }}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: SITE SETTINGS & ANNOUNCEMENTS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-4 max-w-4xl mx-auto">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h2 className="font-heading text-xl font-black text-stone-900">
                        Site Settings &amp; Announcement Bar
                      </h2>
                      <p className="text-xs text-stone-500">Configure phone helplines, WhatsApp support & live announcements.</p>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Save Settings
                    </button>
                  </div>

                  {/* Announcement Banner Control */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm font-black text-stone-900">
                        Top Running Announcement Ticker
                      </span>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editableSettings.announcementActive || false}
                          onChange={(e) => setEditableSettings({ ...editableSettings, announcementActive: e.target.checked })}
                          className="rounded text-amber-500"
                        />
                        <span>Enable Announcement</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Announcement Text (Displayed at the top of customer site)
                      </label>
                      <input
                        type="text"
                        value={editableSettings.announcementText || ''}
                        onChange={(e) => setEditableSettings({ ...editableSettings, announcementText: e.target.value })}
                        placeholder="e.g. Special Discount: Use code TRAIN10 on WhatsApp orders • Pure Veg & Jain meals available!"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Contact Numbers */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
                    <h3 className="font-bold text-sm text-stone-900">Contact & Support Helplines</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">WhatsApp Order Number</label>
                        <input
                          type="text"
                          required
                          value={editableSettings.whatsappNumber}
                          onChange={(e) => setEditableSettings({ ...editableSettings, whatsappNumber: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Helpline Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editableSettings.phone}
                          onChange={(e) => setEditableSettings({ ...editableSettings, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Support Email</label>
                        <input
                          type="email"
                          required
                          value={editableSettings.email}
                          onChange={(e) => setEditableSettings({ ...editableSettings, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Central FSSAI Registration</label>
                        <input
                          type="text"
                          value={editableSettings.fssaiNumber}
                          onChange={(e) => setEditableSettings({ ...editableSettings, fssaiNumber: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Registered Station Office Address</label>
                      <input
                        type="text"
                        value={editableSettings.address}
                        onChange={(e) => setEditableSettings({ ...editableSettings, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* SEO Metadata */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 text-xs">
                    <h3 className="font-bold text-sm text-stone-900">Search Engine Optimization (SEO)</h3>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Meta Title</label>
                      <input
                        type="text"
                        value={editableSettings.metaTitle}
                        onChange={(e) => setEditableSettings({ ...editableSettings, metaTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Meta Description</label>
                      <textarea
                        rows={2}
                        value={editableSettings.metaDescription}
                        onChange={(e) => setEditableSettings({ ...editableSettings, metaDescription: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 8: BACKUP & MIGRATE */}
              {activeTab === 'backup' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                    <div>
                      <h2 className="font-heading text-xl font-black text-stone-900">
                        System Backup & Data Migration
                      </h2>
                      <p className="text-xs text-stone-500">Export or restore the complete database of orders, kitchens, and trains.</p>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <h3 className="font-bold text-xs text-stone-900">Download Full Database (JSON)</h3>
                      <p className="text-xs text-stone-500">
                        Generates a comprehensive snapshot of all trains, restaurants, menus, site settings and orders.
                      </p>
                      <a
                        href="/api/admin/backup"
                        download="railfoody_backup.json"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-1"
                      >
                        <Download className="w-4 h-4" /> Download Backup JSON
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: SECURITY & PASSWORD */}
              {activeTab === 'password' && (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <h2 className="font-heading text-xl font-black text-stone-900 mb-1">
                      Change Admin Password
                    </h2>
                    <p className="text-xs text-stone-500 mb-4">
                      Keep your credentials safe. Password will be securely hashed with salt on the server.
                    </p>

                    <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Current Password *</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">New Password (min 6 chars) *</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Confirm New Password *</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-black rounded-xl shadow-xs transition-all cursor-pointer mt-2"
                      >
                        Update Admin Password
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

      </div>
    </div>
  );
};
