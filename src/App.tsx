import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { HeroSlider } from './components/HeroSlider.tsx';
import { JourneySearch } from './components/JourneySearch.tsx';
import { RestaurantList } from './components/RestaurantList.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { TrainScheduleModal } from './components/TrainScheduleModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { PolicyModal, PolicyType } from './components/PolicyModal.tsx';
import { VendorRegisterModal } from './components/VendorRegisterModal.tsx';
import { RestaurantMenuModal } from './components/RestaurantMenuModal.tsx';
import { FloatingCartBar } from './components/FloatingCartBar.tsx';
import { CategoryIconBar } from './components/CategoryIconBar.tsx';
import { CustomerReviews } from './components/CustomerReviews.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { CustomerAuthModal, CustomerUser } from './components/CustomerAuthModal.tsx';
import { TrainRecord, Restaurant, FoodItem, SliderBanner, SiteSettings, CartItem, OrderRecord } from './types.ts';
import { initialTrains, initialRestaurants, initialFoodItems, initialBanners, initialSettings } from '../data/defaultData.ts';
import { MessageCircle, Phone, ArrowUp } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [banners, setBanners] = useState<SliderBanner[]>(initialBanners);
  const [trains, setTrains] = useState<TrainRecord[]>(initialTrains);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialFoodItems);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Cart State (stored in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('railfoody_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('railfoody_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('railfoody_admin_token') || null;
  });

  // Private Admin Route State (only accessed via /admin or #admin)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return (
      window.location.pathname === '/admin' ||
      window.location.pathname === '/admin/' ||
      window.location.hash === '#admin' ||
      window.location.hash === '#/admin'
    );
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(
        window.location.pathname === '/admin' ||
        window.location.pathname === '/admin/' ||
        window.location.hash === '#admin' ||
        window.location.hash === '#/admin'
      );
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleNavigateHome = () => {
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', '/');
    } else {
      window.location.hash = '';
    }
    setIsAdminRoute(false);
  };

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scheduleModalTrain, setScheduleModalTrain] = useState<TrainRecord | null>(null);
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [recentOrder, setRecentOrder] = useState<OrderRecord | null>(null);
  const [recentWaUrl, setRecentWaUrl] = useState<string>('');
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [menuModalRestaurant, setMenuModalRestaurant] = useState<Restaurant | null>(null);

  // Customer Authentication (Mobile OTP & Gmail)
  const [customer, setCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('railfoody_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Restore customer session from backend if valid token exists
  useEffect(() => {
    const token = localStorage.getItem('railfoody_customer_token');
    if (token) {
      fetch('/api/customer/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(userData => {
          if (userData && userData.id) {
            setCustomer(userData);
            localStorage.setItem('railfoody_customer_user', JSON.stringify(userData));
          } else {
            // Token expired or invalid
            setCustomer(null);
            localStorage.removeItem('railfoody_customer_token');
            localStorage.removeItem('railfoody_customer_user');
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleCustomerLogout = async () => {
    const token = localStorage.getItem('railfoody_customer_token');
    if (token) {
      try {
        await fetch('/api/customer/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {}
    }
    setCustomer(null);
    localStorage.removeItem('railfoody_customer_token');
    localStorage.removeItem('railfoody_customer_user');
  };

  // Selected Filters
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Search Criteria from Journey Search Box
  const [journeyCriteria, setJourneyCriteria] = useState<{
    trainQuery?: string;
    selectedTrain?: TrainRecord | null;
    pnr?: string;
    journeyDate?: string;
    boardingStation?: string;
    coach?: string;
    berth?: string;
    foodSearch?: string;
  }>({
    boardingStation: 'JBP'
  });

  // Fetch live data from backend API
  const refreshData = async () => {
    try {
      const [resSettings, resBanners, resTrains, resRestaurants, resFoods] = await Promise.all([
        fetch('/api/settings').then(r => r.ok ? r.json() : null),
        fetch('/api/banners').then(r => r.ok ? r.json() : null),
        fetch('/api/trains').then(r => r.ok ? r.json() : null),
        fetch('/api/restaurants').then(r => r.ok ? r.json() : null),
        fetch('/api/foods').then(r => r.ok ? r.json() : null)
      ]);

      if (resSettings) setSettings(resSettings);
      if (resBanners) setBanners(resBanners);
      if (resTrains) setTrains(resTrains);
      if (resRestaurants) setRestaurants(resRestaurants);
      if (resFoods) setFoodItems(resFoods);

      // If admin logged in, fetch orders
      if (adminToken) {
        const resOrders = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (resOrders.ok) {
          const ordList = await resOrders.json();
          setOrders(ordList);
        }
      }
    } catch (err) {
      console.warn('API fetch warning, using loaded data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [adminToken]);

  // Cart operations
  const handleAddToCart = (food: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.foodItem.id === food.id);
      if (existing) {
        return prev.map(item =>
          item.foodItem.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          foodItem: food,
          quantity: 1,
          restaurantId: food.restaurantId,
          restaurantName: food.restaurantName || 'Railfoody Partner Kitchen'
        }
      ];
    });

    // "food Salect ke bad train ka open aaye":
    // Automatically open the cart drawer / train details modal when food is selected
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (foodId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.foodItem.id === foodId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter(item => item.foodItem.id !== foodId);
      }
      return prev.map(item =>
        item.foodItem.id === foodId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Search handler from JourneySearch
  const handleSearchSubmit = (criteria: any) => {
    setJourneyCriteria(criteria);

    if (criteria.boardingStation) {
      setSelectedStation(criteria.boardingStation);
    }

    if (criteria.foodSearch) {
      // scroll to restaurants
      const el = document.getElementById('restaurants-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cleanWaNumber = (settings.whatsappNumber || '9752693979').replace(/\D/g, '');

  if (isAdminRoute) {
    return (
      <AdminPanel
        isOpen={true}
        standalone={true}
        onClose={handleNavigateHome}
        onNavigateHome={handleNavigateHome}
        trains={trains}
        restaurants={restaurants}
        foodItems={foodItems}
        banners={banners}
        settings={settings}
        orders={orders}
        onRefreshData={refreshData}
        token={adminToken}
        onLoginSuccess={(tok) => {
          setAdminToken(tok);
          localStorage.setItem('railfoody_admin_token', tok);
          refreshData();
        }}
        onLogout={() => {
          setAdminToken(null);
          localStorage.removeItem('railfoody_admin_token');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-amber-400 selection:text-stone-950">
      
      {/* Top Header */}
      <Header
        settings={settings}
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenVendorRegister={() => setIsVendorModalOpen(true)}
        customer={customer}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogoutCustomer={handleCustomerLogout}
        onOpenAdmin={() => {
          window.history.pushState({}, '', '/admin');
          setIsAdminRoute(true);
        }}
      />

      <main className="flex-1">
        {/* 4-Image Slider Banner */}
        <HeroSlider
          banners={banners}
          whatsappNumber={settings.whatsappNumber}
        />

        {/* 15 Premium Food Category Icons */}
        <CategoryIconBar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Restaurant Search Results */}
        <RestaurantList
          restaurants={restaurants}
          selectedStation={selectedStation}
          onSelectStation={(st) => setSelectedStation(st)}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onSelectRestaurant={(rest) => {
            setSelectedRestaurant(rest);
            // Open dedicated restaurant food menu modal directly without sliding to footer bar
            setMenuModalRestaurant(rest);
          }}
          whatsappNumber={settings.whatsappNumber}
        />

        {/* How It Works & Hygiene Guarantee */}
        <HowItWorks />

        {/* Rotating Customer Reviews & Social Proof */}
        <CustomerReviews />

        {/* Frequently Asked Questions (FAQ) Accordion */}
        <FaqSection whatsappNumber={settings.whatsappNumber} />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenPolicy={(type) => setActivePolicy(type)}
        onOpenVendorRegister={() => setIsVendorModalOpen(true)}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        prefillJourney={journeyCriteria}
        settings={settings}
        customer={customer}
        onOrderSuccess={(orderData, waUrl) => {
          setRecentOrder(orderData);
          setRecentWaUrl(waUrl);
          refreshData();
        }}
      />

      {/* Order Confirmation Notice Modal */}
      <OrderSuccessModal
        order={recentOrder}
        whatsappUrl={recentWaUrl}
        onClose={() => setRecentOrder(null)}
      />

      {/* Train Schedule Timetable Modal */}
      <TrainScheduleModal
        train={scheduleModalTrain}
        onClose={() => setScheduleModalTrain(null)}
        onSelectStation={(st) => {
          setSelectedStation(st);
          setJourneyCriteria(prev => ({ ...prev, boardingStation: st }));
        }}
      />

      {/* Policies Modal (About, Privacy, Terms, Refund, Delivery) */}
      <PolicyModal
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
        brandName={settings.brandName}
        whatsappNumber={settings.whatsappNumber}
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
      />

      {/* Vendor Partner Registration Modal */}
      <VendorRegisterModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSuccess={() => {
          refreshData();
        }}
        whatsappNumber={settings.whatsappNumber}
      />

      {/* Dedicated Restaurant Food Menu Modal */}
      <RestaurantMenuModal
        isOpen={Boolean(menuModalRestaurant)}
        restaurant={menuModalRestaurant}
        foodItems={foodItems}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onOpenCart={() => setIsCartOpen(true)}
        onClose={() => setMenuModalRestaurant(null)}
        settings={settings}
        journeyCriteria={journeyCriteria}
      />

      {/* Universal Floating View Cart Bar */}
      <FloatingCartBar
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Fast Customer Mobile / Gmail Login Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(loggedUser) => {
          setCustomer(loggedUser);
        }}
        brandName={settings.brandName}
      />

      {/* Floating Sticky Mobile WhatsApp Button */}
      <a
        href={`https://wa.me/91${cleanWaNumber}?text=Hi%20Railfoody,%20I%20want%20to%20order%20food%20on%20my%20train`}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed ${cart.length > 0 ? 'bottom-24 sm:bottom-6' : 'bottom-6'} left-4 sm:left-6 z-40 p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white`}
        title="Quick Order on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>

    </div>
  );
}
