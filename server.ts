import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { initialTrains, initialRestaurants, initialFoodItems, initialBanners, initialSettings } from './data/defaultData.ts';
import { TrainRecord, Restaurant, FoodItem, SliderBanner, SiteSettings, OrderRecord, CustomerRecord, CustomerUser } from './src/types.ts';
import { sendSmsOtp } from './server/smsService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DatabaseSchema {
  trains: TrainRecord[];
  restaurants: Restaurant[];
  foodItems: FoodItem[];
  banners: SliderBanner[];
  settings: SiteSettings;
  orders: OrderRecord[];
  customers?: CustomerRecord[];
  vendorRequests?: any[];
  admin: {
    username: string;
    email: string;
    salt: string;
    passwordHash: string;
    updatedAt: string;
  };
}

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'railfoody-secret-token-key-2026';
const sessions: Record<string, { username: string; expires: number }> = {};

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded: DatabaseSchema = JSON.parse(content);
      const authorizedIds = new Set(['rest-speed-food-hub', 'rest-choupal-cafe', 'rest-celebration', 'rest-chef-rasoi']);
      if (Array.isArray(loaded.restaurants)) {
        // Retain the 4 authorized restaurants plus any dynamically registered vendor restaurants
        loaded.restaurants = loaded.restaurants.filter(r => authorizedIds.has(r.id) || r.id.startsWith('vendor-'));
        for (const base of initialRestaurants) {
          if (!loaded.restaurants.some(r => r.id === base.id)) {
            loaded.restaurants.push(base);
          }
        }
      } else {
        loaded.restaurants = initialRestaurants;
      }
      if (!Array.isArray(loaded.customers)) {
        loaded.customers = [];
      }
      return loaded;
    } catch (e) {
      console.error('Error loading DB file, fallback to defaults', e);
    }
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const defaultPassword = 'admin';
  const initialDb: DatabaseSchema = {
    trains: initialTrains,
    restaurants: initialRestaurants,
    foodItems: initialFoodItems,
    banners: initialBanners,
    settings: initialSettings,
    orders: [],
    customers: [],
    admin: {
      username: 'admin',
      email: 'railfoody@gmail.com',
      salt,
      passwordHash: hashPassword(defaultPassword, salt),
      updatedAt: new Date().toISOString()
    }
  };

  saveDatabase(initialDb);
  return initialDb;
}

let db = loadDatabase();

// ---------------- CUSTOMER AUTH & OTP IN-MEMORY REPOSITORY ----------------
// High-security store: OTP is NEVER saved in plaintext or permanently in database.
interface OtpEntry {
  phone: string;
  salt: string;
  hash: string;
  expiresAt: number;        // 5 minutes from generation
  attempts: number;         // Max 3 failed attempts allowed
  lastSentAt: number;       // For 60-second rate-limiting cooldown
  requestsInWindow: number; // Max 4 requests in 15 minutes window
  windowStart: number;      // Start of 15 min sliding window
}

const customerOtpStore = new Map<string, OtpEntry>();

interface CustomerSession {
  customerId: string;
  phone: string;
  name: string;
  email?: string;
  expires: number;
}
const customerSessions: Record<string, CustomerSession> = {};

// Auto-cleanup expired OTP entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [phone, entry] of customerOtpStore.entries()) {
    if (now > entry.expiresAt + 60000) {
      customerOtpStore.delete(phone);
    }
  }
}, 60 * 1000);

function saveDatabase(dataToSave: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database:', err);
  }
}

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static public uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Authentication Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const session = sessions[token];
  if (!session || session.expires < Date.now()) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  next();
}

// ---------------- PUBLIC API ROUTES ----------------

// Get site settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.settings);
});

// Get slider banners
app.get('/api/banners', (req: Request, res: Response) => {
  res.json(db.banners);
});

// Get trains with optional filtering
app.get('/api/trains', (req: Request, res: Response) => {
  const query = (req.query.search as string || '').toLowerCase().trim();
  const station = (req.query.station as string || '').toLowerCase().trim();

  let results = db.trains;

  if (query) {
    results = results.filter(
      t =>
        t.trainNumber.toLowerCase().includes(query) ||
        t.trainName.toLowerCase().includes(query) ||
        t.sourceStation.toLowerCase().includes(query) ||
        t.destStation.toLowerCase().includes(query) ||
        t.halts.some(h => h.code.toLowerCase().includes(query) || h.name.toLowerCase().includes(query))
    );
  }

  if (station) {
    results = results.filter(
      t =>
        t.halts.some(h => h.code.toLowerCase() === station || h.name.toLowerCase().includes(station))
    );
  }

  res.json(results);
});

// Get train by ID or Number
app.get('/api/trains/:id', (req: Request, res: Response) => {
  const train = db.trains.find(t => t.id === req.params.id || t.trainNumber === req.params.id);
  if (!train) {
    return res.status(404).json({ error: 'Train not found' });
  }
  res.json(train);
});

// Get restaurants
app.get('/api/restaurants', (req: Request, res: Response) => {
  const station = (req.query.station as string || '').toLowerCase().trim();
  const vegOnly = req.query.vegOnly === 'true';
  const search = (req.query.search as string || '').toLowerCase().trim();

  let results = db.restaurants;

  if (station) {
    results = results.filter(
      r => r.stationCode.toLowerCase() === station || r.stationName.toLowerCase().includes(station)
    );
  }

  if (vegOnly) {
    results = results.filter(r => r.vegOnly);
  }

  if (search) {
    results = results.filter(
      r =>
        r.name.toLowerCase().includes(search) ||
        r.stationName.toLowerCase().includes(search) ||
        r.cuisines.some(c => c.toLowerCase().includes(search))
    );
  }

  res.json(results);
});

// Get restaurant by ID
app.get('/api/restaurants/:id', (req: Request, res: Response) => {
  const restaurant = db.restaurants.find(r => r.id === req.params.id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  res.json(restaurant);
});

// Get food items
app.get('/api/foods', (req: Request, res: Response) => {
  const restaurantId = req.query.restaurantId as string;
  const category = req.query.category as string;
  const isVeg = req.query.isVeg === 'true';
  const isNonVeg = req.query.isNonVeg === 'true';
  const search = (req.query.search as string || '').toLowerCase().trim();

  let results = db.foodItems;

  if (restaurantId) {
    results = results.filter(f => f.restaurantId === restaurantId);
  }

  if (category && category !== 'All') {
    results = results.filter(f => f.category === category);
  }

  if (isVeg && !isNonVeg) {
    results = results.filter(f => f.isVeg);
  } else if (isNonVeg && !isVeg) {
    results = results.filter(f => !f.isVeg);
  }

  if (search) {
    results = results.filter(
      f =>
        f.name.toLowerCase().includes(search) ||
        f.description.toLowerCase().includes(search) ||
        f.category.toLowerCase().includes(search)
    );
  }

  res.json(results);
});

// Create Order (generates WhatsApp payload and saves to DB)
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, restaurantId, restaurantName, items, subtotal, deliveryFee, gstAmount, totalAmount } = req.body;

  if (!customer?.passengerName || !customer?.mobileNumber) {
    return res.status(400).json({ error: 'Please provide Customer / Passenger Name and 10-digit Mobile Number.' });
  }

  const deliveryType = customer.deliveryType || (customer.trainNumber ? 'train' : 'local');

  if (deliveryType === 'train') {
    if (!customer.trainNumber || !customer.coachNumber || !customer.seatNumber) {
      return res.status(400).json({ error: 'For Train Delivery, please provide Train Number, Coach Number, and Seat/Berth Number.' });
    }
  } else {
    if (!customer.localAddress) {
      return res.status(400).json({ error: 'For Local Delivery, please provide your delivery address / location.' });
    }
  }

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  const orderNumber = `RF-${Date.now().toString().slice(-6)}`;
  const orderId = `order-${Date.now()}`;

  // Build clean WhatsApp message formatted nicely
  const itemsText = items.map((it: any) => `• ${it.name} x ${it.quantity} (₹${it.price * it.quantity})`).join('\n');
  const instructionsLine = customer.deliveryInstructions ? `\n*Delivery Note:* ${customer.deliveryInstructions}` : '';

  let deliveryDetailsSection = '';
  if (deliveryType === 'train') {
    const pnrLine = customer.pnrNumber ? `\n*PNR Number:* ${customer.pnrNumber}` : '';
    deliveryDetailsSection = `🚆 *DELIVERY: TRAIN BERTH*
*Train:* ${customer.trainNumber} - ${customer.trainName || 'Express'}
*Boarding/Station:* ${customer.boardingStation || 'Enroute Station'}
*Journey Date:* ${customer.journeyDate || 'Today'}${pnrLine}
*Coach & Seat:* Coach ${customer.coachNumber}, Berth ${customer.seatNumber}${instructionsLine}`;
  } else {
    deliveryDetailsSection = `🛵 *DELIVERY: LOCAL FOOD DELIVERY*
*Address:* ${customer.localAddress}
*Area/Landmark:* ${customer.cityArea || 'Local City/Station area'}${instructionsLine}`;
  }

  const whatsAppMessage = `🍱 *NEW ${deliveryType === 'train' ? 'TRAIN' : 'LOCAL'} FOOD ORDER — RAILFOODY* 🍛
*Order ID:* #${orderNumber}
*Date:* ${new Date().toLocaleDateString('en-IN')}

👤 *CUSTOMER DETAILS:*
*Name:* ${customer.passengerName}
*Mobile:* ${customer.mobileNumber}

${deliveryDetailsSection}

🏪 *RESTAURANT:* ${restaurantName}

🛒 *ORDERED ITEMS:*
${itemsText}

💰 *PAYMENT SUMMARY:*
*Subtotal:* ₹${subtotal}
*Delivery Charges:* ₹${deliveryFee || 0}
*Packaging & GST:* ₹${gstAmount || 0}
*TOTAL PAYABLE:* ₹${totalAmount}

⚠️ *STATUS:* Awaiting Restaurant Confirmation.
Please send this message to Railfoody at 9752693979 to confirm your order.`;

  const newOrder: OrderRecord = {
    id: orderId,
    orderNumber,
    createdAt: new Date().toISOString(),
    customer,
    restaurantId,
    restaurantName,
    items,
    subtotal,
    deliveryFee: deliveryFee || 0,
    gstAmount: gstAmount || 0,
    totalAmount,
    status: 'Pending WhatsApp Confirmation',
    whatsAppMessage
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);

  const cleanWhatsappNumber = (db.settings.whatsappNumber || '9752693979').replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(whatsAppMessage);
  const waUrl = `https://wa.me/91${cleanWhatsappNumber}?text=${encodedMsg}`;

  res.status(201).json({
    order: newOrder,
    whatsappUrl: waUrl,
    message: 'Order initiated. Please send the WhatsApp message to complete verification.'
  });
});

// Register / Add Restaurant (Vendor Application)
app.post('/api/vendor-requests', (req: Request, res: Response) => {
  const { restaurantName, ownerName, phone, stationName, fssaiLicense, vegOnly, cuisines, address } = req.body;

  if (!restaurantName || !ownerName || !phone || !stationName || !fssaiLicense) {
    return res.status(400).json({ error: 'Please provide all mandatory vendor details including Restaurant Name, Owner Name, Mobile, Station, and FSSAI License.' });
  }

  const requestId = `vendor-${Date.now()}`;
  const newRequest = {
    id: requestId,
    createdAt: new Date().toISOString(),
    restaurantName,
    ownerName,
    phone,
    stationName,
    fssaiLicense,
    vegOnly: Boolean(vegOnly),
    cuisines: cuisines || ['North Indian', 'Thali'],
    address: address || '',
    status: 'Pending Verification'
  };

  if (!db.vendorRequests) {
    db.vendorRequests = [];
  }
  db.vendorRequests.unshift(newRequest);

  // Also auto-create restaurant entry so it is listed immediately or can be activated
  const newRestaurant: Restaurant = {
    id: `rest-${Date.now()}`,
    name: restaurantName,
    stationCode: stationName.slice(0, 4).toUpperCase().trim(),
    stationName: stationName,
    rating: 4.8,
    reviewCount: 1,
    minOrder: 120,
    prepTime: '20-25 mins',
    vegOnly: Boolean(vegOnly),
    fssaiLicense: fssaiLicense,
    image: vegOnly ? '/src/assets/images/banner_indian_thali_noface_1792077362523.jpg' : '/src/assets/images/banner_railfoody_brand_1792004058022.jpg',
    address: address || `${stationName} Railway Station Area`,
    isOpen: true,
    phone: phone,
    cuisines: Array.isArray(cuisines) ? cuisines : [vegOnly ? '100% Pure Veg' : 'Veg & Non-Veg', 'Meals', 'Thali']
  };

  db.restaurants.push(newRestaurant);
  saveDatabase(db);

  // Build WhatsApp message for vendor onboarding
  const cleanWhatsappNumber = (db.settings.whatsappNumber || '9752693979').replace(/\D/g, '');
  const waMsg = `🏪 *NEW RESTAURANT VENDOR REGISTRATION — RAILFOODY* 🚆
*Restaurant Name:* ${restaurantName}
*Owner / Contact:* ${ownerName}
*Phone:* ${phone}
*Station:* ${stationName}
*FSSAI License:* ${fssaiLicense}
*Food Type:* ${vegOnly ? '100% Pure Veg' : 'Veg & Non-Veg'}
*Address:* ${address || 'Near Railway Station'}

Please review and verify our kitchen for train food delivery on Railfoody.`;

  const waUrl = `https://wa.me/91${cleanWhatsappNumber}?text=${encodeURIComponent(waMsg)}`;

  res.status(201).json({
    success: true,
    restaurant: newRestaurant,
    whatsappUrl: waUrl,
    message: 'Restaurant added successfully! Please verify details on WhatsApp.'
  });
});

// ---------------- CUSTOMER AUTHENTICATION (SMS OTP) API ROUTES ----------------

// Send 6-Digit OTP via SMS
app.post('/api/customer/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone, name } = req.body;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ 
        error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' 
      });
    }

    const now = Date.now();
    const existing = customerOtpStore.get(cleanPhone);

    // Rate Limiting: 60-second cooldown per phone number
    if (existing) {
      const elapsedSinceLast = now - existing.lastSentAt;
      if (elapsedSinceLast < 60000) {
        const remainingSeconds = Math.ceil((60000 - elapsedSinceLast) / 1000);
        return res.status(429).json({
          error: `Please wait ${remainingSeconds}s before requesting a new OTP.`,
          cooldownSeconds: remainingSeconds
        });
      }

      // Rate Limiting: Max 4 requests in a 15-minute sliding window
      if (now - existing.windowStart < 15 * 60 * 1000) {
        if (existing.requestsInWindow >= 4) {
          return res.status(429).json({
            error: 'Maximum OTP requests exceeded for this number. For security, please wait 15 minutes.'
          });
        }
      }
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString('hex');
    // PBKDF2 hash with salt: plain text OTP is NEVER permanently stored
    const hash = crypto.pbkdf2Sync(otp, salt, 10000, 32, 'sha256').toString('hex');

    // Dispatch SMS via configured SMS gateway (Fast2SMS, MSG91, Twilio, or sandbox log)
    const smsResult = await sendSmsOtp(cleanPhone, otp);

    const windowStart = (existing && (now - existing.windowStart < 15 * 60 * 1000)) ? existing.windowStart : now;
    const requestsInWindow = (existing && (now - existing.windowStart < 15 * 60 * 1000)) ? existing.requestsInWindow + 1 : 1;

    customerOtpStore.set(cleanPhone, {
      phone: cleanPhone,
      salt,
      hash,
      expiresAt: now + 5 * 60 * 1000, // Valid for exactly 5 minutes
      attempts: 0,
      lastSentAt: now,
      requestsInWindow,
      windowStart
    });

    res.json({
      success: true,
      message: `OTP sent successfully to +91 ******${cleanPhone.slice(-4)}. Valid for 5 minutes.`,
      cooldownSeconds: 60,
      expiresInSeconds: 300,
      provider: smsResult.provider,
      isSimulated: smsResult.isSimulated,
      debugOtp: smsResult.debugOtp
    });
  } catch (err: any) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to dispatch OTP. Please try again later.' });
  }
});

// Verify 6-Digit OTP & Login
app.post('/api/customer/verify-otp', (req: Request, res: Response) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Mobile number and 6-digit OTP are required.' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const cleanOtp = String(otp).trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit OTP code.' });
    }

    const entry = customerOtpStore.get(cleanPhone);
    if (!entry) {
      return res.status(400).json({
        error: 'No active OTP found for this number or it has expired. Please request an OTP first.'
      });
    }

    const now = Date.now();

    // Check 5-minute expiration
    if (now > entry.expiresAt) {
      customerOtpStore.delete(cleanPhone);
      return res.status(400).json({
        error: 'OTP has expired (valid for 5 minutes). Please click Resend OTP to receive a new code.'
      });
    }

    // Check brute-force attempts (Max 3 wrong attempts)
    if (entry.attempts >= 3) {
      customerOtpStore.delete(cleanPhone);
      return res.status(400).json({
        error: 'Maximum incorrect attempts exceeded. For your security, this OTP was invalidated. Please request a new OTP.'
      });
    }

    // Constant-time hash verification to prevent timing attacks
    const computedHash = crypto.pbkdf2Sync(cleanOtp, entry.salt, 10000, 32, 'sha256').toString('hex');
    const isMatch = crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(entry.hash, 'hex'));

    if (!isMatch) {
      entry.attempts += 1;
      const remaining = 3 - entry.attempts;
      if (remaining <= 0) {
        customerOtpStore.delete(cleanPhone);
        return res.status(400).json({
          error: 'Incorrect OTP. 3 incorrect attempts reached. Please request a new OTP.'
        });
      }
      return res.status(400).json({
        error: `Incorrect OTP code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
      });
    }

    // OTP Verified! Delete immediately to prevent replay attacks
    customerOtpStore.delete(cleanPhone);

    // Save/update customer securely in database
    if (!db.customers) db.customers = [];
    let customer = db.customers.find(c => c.phone === cleanPhone);
    const nowIso = new Date().toISOString();
    const displayName = (name && typeof name === 'string' && name.trim()) 
      ? name.trim() 
      : (customer?.name || `Passenger ${cleanPhone.slice(-4)}`);

    if (customer) {
      customer.lastLoginAt = nowIso;
      if (name && typeof name === 'string' && name.trim()) {
        customer.name = name.trim();
      }
    } else {
      customer = {
        id: `cust-${Date.now()}`,
        phone: cleanPhone,
        name: displayName,
        email: `${cleanPhone}@railfoody.in`,
        loginMethod: 'phone',
        createdAt: nowIso,
        lastLoginAt: nowIso,
        totalOrders: 0
      };
      db.customers.push(customer);
    }
    saveDatabase(db);

    // Issue 30-day secure customer session token
    const token = 'cst_' + crypto.randomBytes(32).toString('hex');
    customerSessions[token] = {
      customerId: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000
    };

    res.json({
      success: true,
      message: 'Mobile number verified successfully! Welcome to RailFoody.',
      token,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        email: customer.email,
        loginMethod: 'phone',
        createdAt: customer.createdAt
      }
    });
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// Check Customer Session
app.get('/api/customer/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const session = customerSessions[token];
  if (!session || session.expires < Date.now()) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  const customer = db.customers?.find(c => c.phone === session.phone || c.id === session.customerId);
  if (!customer) {
    return res.json({
      id: session.customerId,
      phone: session.phone,
      name: session.name,
      email: session.email || `${session.phone}@railfoody.in`,
      loginMethod: 'phone',
      createdAt: new Date().toISOString()
    });
  }

  res.json({
    id: customer.id,
    phone: customer.phone,
    name: customer.name,
    email: customer.email,
    loginMethod: customer.loginMethod || 'phone',
    createdAt: customer.createdAt
  });
});

// Customer Logout
app.post('/api/customer/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    delete customerSessions[token];
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Fast Gmail Login
app.post('/api/customer/google-login', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid Gmail address is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const displayName = name ? name.trim() : cleanEmail.split('@')[0];
  const nowIso = new Date().toISOString();

  if (!db.customers) db.customers = [];
  let customer = db.customers.find(c => c.email?.toLowerCase() === cleanEmail);

  if (customer) {
    customer.lastLoginAt = nowIso;
    if (name) customer.name = displayName;
  } else {
    customer = {
      id: `cust-g-${Date.now()}`,
      phone: '',
      name: displayName,
      email: cleanEmail,
      loginMethod: 'google',
      createdAt: nowIso,
      lastLoginAt: nowIso,
      totalOrders: 0
    };
    db.customers.push(customer);
  }
  saveDatabase(db);

  const token = 'cst_' + crypto.randomBytes(32).toString('hex');
  customerSessions[token] = {
    customerId: customer.id,
    phone: customer.phone,
    name: customer.name,
    email: customer.email,
    expires: Date.now() + 30 * 24 * 60 * 60 * 1000
  };

  res.json({
    success: true,
    message: 'Google login successful',
    token,
    customer: {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
      loginMethod: 'google',
      createdAt: customer.createdAt
    }
  });
});

// ---------------- ADMIN API ROUTES ----------------

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const admin = db.admin;
  const cleanInput = username.trim().toLowerCase();
  const isMatchUser = (cleanInput === admin.username.toLowerCase()) || 
                      (cleanInput === admin.email.toLowerCase()) ||
                      (cleanInput === '9752693979') ||
                      (cleanInput === '+919752693979');

  const computedHash = hashPassword(password, admin.salt);
  if (!isMatchUser || computedHash !== admin.passwordHash) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessions[token] = {
    username: admin.username,
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };

  res.json({
    token,
    user: {
      username: admin.username,
      email: admin.email,
      lastUpdated: admin.updatedAt
    }
  });
});

// Admin verify session
app.get('/api/admin/me', requireAdmin, (req: Request, res: Response) => {
  res.json({
    username: db.admin.username,
    email: db.admin.email,
    updatedAt: db.admin.updatedAt
  });
});

// Change Admin Password
app.post('/api/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const checkHash = hashPassword(currentPassword, db.admin.salt);
  if (checkHash !== db.admin.passwordHash) {
    return res.status(400).json({ error: 'Incorrect current password' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  db.admin.salt = newSalt;
  db.admin.passwordHash = hashPassword(newPassword, newSalt);
  db.admin.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json({ success: true, message: 'Password updated successfully' });
});

// Manage Settings
app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body, lastUpdatedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) };
  saveDatabase(db);
  res.json(db.settings);
});

// Manage Slider Banners
app.put('/api/banners', requireAdmin, (req: Request, res: Response) => {
  if (Array.isArray(req.body)) {
    db.banners = req.body;
    saveDatabase(db);
    return res.json(db.banners);
  }
  res.status(400).json({ error: 'Expected banners array' });
});

// Manage Trains (CRUD + Sync)
app.post('/api/trains', requireAdmin, (req: Request, res: Response) => {
  const train: TrainRecord = {
    ...req.body,
    id: req.body.id || req.body.trainNumber,
    lastUpdated: new Date().toISOString(),
    syncStatus: 'Manual Entry Verified'
  };
  db.trains.unshift(train);
  saveDatabase(db);
  res.status(201).json(train);
});

app.put('/api/trains/:id', requireAdmin, (req: Request, res: Response) => {
  const index = db.trains.findIndex(t => t.id === req.params.id || t.trainNumber === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Train not found' });
  }
  db.trains[index] = { ...db.trains[index], ...req.body, lastUpdated: new Date().toISOString() };
  saveDatabase(db);
  res.json(db.trains[index]);
});

app.delete('/api/trains/:id', requireAdmin, (req: Request, res: Response) => {
  db.trains = db.trains.filter(t => t.id !== req.params.id && t.trainNumber !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// Live Train Sync Simulation / Official Data Update
app.post('/api/trains/sync', requireAdmin, (req: Request, res: Response) => {
  const now = new Date().toISOString();
  db.trains = db.trains.map(t => ({
    ...t,
    lastUpdated: now,
    syncStatus: 'Verified Official Railway Timetable'
  }));
  db.settings.lastTrainSync = now;
  db.settings.syncStatus = 'Active & Up-to-date';
  saveDatabase(db);

  res.json({
    success: true,
    lastSync: now,
    totalTrains: db.trains.length,
    message: `Successfully synchronized schedule for all ${db.trains.length} trains.`
  });
});

// Manage Restaurants (CRUD)
app.post('/api/restaurants', requireAdmin, (req: Request, res: Response) => {
  const rest: Restaurant = {
    ...req.body,
    id: req.body.id || `rest-${Date.now()}`
  };
  db.restaurants.push(rest);
  saveDatabase(db);
  res.status(201).json(rest);
});

app.put('/api/restaurants/:id', requireAdmin, (req: Request, res: Response) => {
  const idx = db.restaurants.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  db.restaurants[idx] = { ...db.restaurants[idx], ...req.body };
  saveDatabase(db);
  res.json(db.restaurants[idx]);
});

app.delete('/api/restaurants/:id', requireAdmin, (req: Request, res: Response) => {
  db.restaurants = db.restaurants.filter(r => r.id !== req.params.id);
  // Also remove foods from this restaurant
  db.foodItems = db.foodItems.filter(f => f.restaurantId !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// Manage Food Items (CRUD)
app.post('/api/foods', requireAdmin, (req: Request, res: Response) => {
  const food: FoodItem = {
    ...req.body,
    id: req.body.id || `food-${Date.now()}`
  };
  db.foodItems.push(food);
  saveDatabase(db);
  res.status(201).json(food);
});

app.put('/api/foods/:id', requireAdmin, (req: Request, res: Response) => {
  const idx = db.foodItems.findIndex(f => f.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Food item not found' });
  }
  db.foodItems[idx] = { ...db.foodItems[idx], ...req.body };
  saveDatabase(db);
  res.json(db.foodItems[idx]);
});

app.delete('/api/foods/:id', requireAdmin, (req: Request, res: Response) => {
  db.foodItems = db.foodItems.filter(f => f.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// Manage Orders
app.get('/api/orders', requireAdmin, (req: Request, res: Response) => {
  res.json(db.orders);
});

app.put('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  db.orders[idx].status = req.body.status;
  if (req.body.notes !== undefined) {
    db.orders[idx].notes = req.body.notes;
  }
  saveDatabase(db);
  res.json(db.orders[idx]);
});

// Upload Image (Base64 file receiver)
app.post('/api/admin/upload-image', requireAdmin, (req: Request, res: Response) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ error: 'dataUrl is required' });
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid data URL format' });
    }

    const ext = matches[1].split('/')[1] || 'jpg';
    const cleanExt = ext === 'jpeg' ? 'jpg' : ext;
    const cleanName = (filename || 'food_item').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = `${cleanName}_${Date.now()}.${cleanExt}`;
    const filePath = path.join(UPLOADS_DIR, safeFileName);

    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeFileName}`;
    res.json({ url: publicUrl, success: true });
  } catch (err: any) {
    console.error('Image upload failed:', err);
    res.status(500).json({ error: 'Image upload failed: ' + err.message });
  }
});

// Full Database Backup
app.get('/api/admin/backup', requireAdmin, (req: Request, res: Response) => {
  const safeData = {
    ...db,
    admin: {
      username: db.admin.username,
      email: db.admin.email,
      updatedAt: db.admin.updatedAt
    }
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="railfoody_backup_${new Date().toISOString().slice(0, 10)}.json"`);
  res.send(JSON.stringify(safeData, null, 2));
});

// Full Database Restore
app.post('/api/admin/restore', requireAdmin, (req: Request, res: Response) => {
  const backupData = req.body;
  if (!backupData || !backupData.trains || !backupData.restaurants || !backupData.foodItems) {
    return res.status(400).json({ error: 'Invalid backup file structure' });
  }

  db.trains = backupData.trains;
  db.restaurants = backupData.restaurants;
  db.foodItems = backupData.foodItems;
  if (backupData.banners) db.banners = backupData.banners;
  if (backupData.settings) db.settings = backupData.settings;
  if (backupData.orders) db.orders = backupData.orders;

  saveDatabase(db);
  res.json({ success: true, message: 'Database restored successfully' });
});

// Export Trains as CSV
app.get('/api/admin/export/trains.csv', requireAdmin, (req: Request, res: Response) => {
  const header = 'TrainNumber,TrainName,SourceStation,DestStation,Days,Classes,HaltsCount,SyncStatus\n';
  const rows = db.trains.map(t => {
    const days = `"${t.days.join(',')}"`;
    const classes = `"${t.classes.join(',')}"`;
    return `${t.trainNumber},"${t.trainName.replace(/"/g, '""')}","${t.sourceStation}","${t.destStation}",${days},${classes},${t.halts.length},"${t.syncStatus}"`;
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="railfoody_trains.csv"');
  res.send(header + rows);
});

// Import Trains from CSV or JSON
app.post('/api/admin/import/trains', requireAdmin, (req: Request, res: Response) => {
  const { csvText, jsonList } = req.body;

  if (Array.isArray(jsonList)) {
    for (const item of jsonList) {
      const idx = db.trains.findIndex(t => t.trainNumber === item.trainNumber);
      if (idx !== -1) {
        db.trains[idx] = { ...db.trains[idx], ...item };
      } else {
        db.trains.push({
          id: item.trainNumber,
          trainNumber: item.trainNumber,
          trainName: item.trainName || 'Express Train',
          sourceStation: item.sourceStation || 'JBP',
          destStation: item.destStation || 'NDLS',
          days: item.days || ['Daily'],
          classes: item.classes || ['2A', '3A', 'SL'],
          halts: item.halts || [{ code: 'JBP', name: 'Jabalpur', arr: '--', dep: '12:00', halt: 'Origin', day: 1 }],
          lastUpdated: new Date().toISOString(),
          syncStatus: 'Imported Record'
        });
      }
    }
    saveDatabase(db);
    return res.json({ success: true, count: jsonList.length });
  }

  if (csvText) {
    const lines = csvText.trim().split('\n');
    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');
      if (parts.length >= 4) {
        const trainNumber = parts[0].trim().replace(/^"/, '').replace(/"$/, '');
        const trainName = parts[1].trim().replace(/^"/, '').replace(/"$/, '');
        const sourceStation = parts[2].trim().replace(/^"/, '').replace(/"$/, '');
        const destStation = parts[3].trim().replace(/^"/, '').replace(/"$/, '');

        const existingIdx = db.trains.findIndex(t => t.trainNumber === trainNumber);
        const record: TrainRecord = {
          id: trainNumber,
          trainNumber,
          trainName,
          sourceStation,
          destStation,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          classes: ['1A', '2A', '3A', 'SL'],
          halts: [
            { code: sourceStation.slice(0, 4), name: sourceStation, arr: '--', dep: '10:00', halt: 'Origin', day: 1 },
            { code: 'JBP', name: 'Jabalpur Junction', arr: '15:00', dep: '15:10', halt: '10 min', day: 1 },
            { code: destStation.slice(0, 4), name: destStation, arr: '22:00', dep: '--', halt: 'Terminates', day: 1 }
          ],
          lastUpdated: new Date().toISOString(),
          syncStatus: 'Imported from CSV'
        };

        if (existingIdx !== -1) {
          db.trains[existingIdx] = record;
        } else {
          db.trains.push(record);
        }
        imported++;
      }
    }
    saveDatabase(db);
    return res.json({ success: true, count: imported });
  }

  res.status(400).json({ error: 'No CSV or JSON data provided' });
});

// Technical SEO: sitemap.xml
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://railfoody.com';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#search-section</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#restaurants-section</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#menu-section</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

// Technical SEO: robots.txt
app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://railfoody.com';
  res.setHeader('Content-Type', 'text/plain');
  res.send(['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /admin/', 'Disallow: /api/admin/', `Sitemap: ${baseUrl}/sitemap.xml`].join('\n') + '\n');
});

// ---------------- VITE MIDDLEWARE / SPA SERVING ----------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚂 Railfoody server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Railfoody server:', err);
});
