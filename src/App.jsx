import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged, signInWithCustomToken, signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, onSnapshot 
} from 'firebase/firestore';

// --- ICONS (Internal Definitions to prevent missing package errors) ---
const IconBase = ({ size = 24, className = "", children }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {children}
  </svg>
);

const ShoppingCart = (props) => <IconBase {...props}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></IconBase>;
const Heart = (props) => <IconBase {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></IconBase>;
const Search = (props) => <IconBase {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></IconBase>;
const Menu = (props) => <IconBase {...props}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></IconBase>;
const X = (props) => <IconBase {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconBase>;
const Star = (props) => <IconBase {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></IconBase>;
const LogOut = (props) => <IconBase {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></IconBase>;
const Filter = (props) => <IconBase {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></IconBase>;
const ChevronRight = (props) => <IconBase {...props}><path d="m9 18 6-6-6-6"/></IconBase>;
const Plus = (props) => <IconBase {...props}><path d="M5 12h14"/><path d="M12 5v14"/></IconBase>;
const Minus = (props) => <IconBase {...props}><path d="M5 12h14"/></IconBase>;
const ShoppingBag = (props) => <IconBase {...props}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></IconBase>;
const ArrowLeft = (props) => <IconBase {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></IconBase>;
const Truck = (props) => <IconBase {...props}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></IconBase>;
const ShieldCheck = (props) => <IconBase {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></IconBase>;
const CreditCard = (props) => <IconBase {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></IconBase>;
const Sparkles = (props) => <IconBase {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 7h4"/><path d="M3 5h4"/></IconBase>;
const Gift = (props) => <IconBase {...props}><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></IconBase>;
const Lightbulb = (props) => <IconBase {...props}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></IconBase>;
const Send = (props) => <IconBase {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></IconBase>;
const Coins = (props) => <IconBase {...props}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m7.1 10 2.8-5"/></IconBase>;
const CheckCircle = (props) => <IconBase {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconBase>;
const Loader2 = (props) => <IconBase {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></IconBase>;

// --- DATA CONSTANTS (INR PRICES) ---
const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];

const ALL_PRODUCTS = [
  // --- ELECTRONICS ---
  {
    id: 'prod_e1',
    name: 'Realme Noise Cancelling Headphones',
    category: 'Electronics',
    price: 1699,
    rating: 4.8,
    reviewCount: 120,
    description: 'Immerse yourself in music with industry-leading noise cancellation and 30-hour battery life.',
    image: 'https://m.media-amazon.com/images/I/61ZEQXGTepL.jpg',
    reviews: [
      { user: "TechGuru", rating: 5, text: "Best soundstage I've heard in years." },
      { user: "CommuterJane", rating: 4, text: "Great for the train, but a bit bulky." }
    ]
  },
  {
    id: 'prod_e2',
    name: 'HP 15s, 12th Gen Intel Core i3',
    category: 'Electronics',
    price: 48999,
    rating: 4.9,
    reviewCount: 85,
    description: 'A powerhouse for creatives. Features a retina display and the latest processor for seamless multitasking.',
    image: 'https://m.media-amazon.com/images/I/71+gQ9gOTuL._SX425_.jpg',
    reviews: [
      { user: "DevMike", rating: 5, text: "Compiles code insanely fast." }
    ]
  },
  {
    id: 'prod_e3',
    name: 'LG 27 Inch 4K UHD Monitor',
    category: 'Electronics',
    price: 38500,
    rating: 4.5,
    reviewCount: 42,
    description: 'Crystal clear resolution with built-in smart hub features for streaming without a PC.',
    image: 'https://m.media-amazon.com/images/I/41RuEU+a2wL._SY300_SX300_QL70_FMwebp_.jpg',
    reviews: []
  },
  {
    id: 'prod_e4',
    name: 'ZEBRONICS Wireless Keyboard Combo',
    category: 'Electronics',
    price: 999,
    rating: 4.7,
    reviewCount: 200,
    description: 'Tactile switches and RGB lighting in a compact, wireless form factor.',
    image: 'https://m.media-amazon.com/images/I/41SOsxHfibL._SY300_SX300_QL70_FMwebp_.jpg',
    reviews: []
  },

  // --- FASHION ---
  {
    id: 'prod_f1',
    name: 'Classic Denim Jacket',
    category: 'Fashion',
    price: 6999,
    rating: 4.6,
    reviewCount: 310,
    description: 'A timeless staple. Made from sustainable cotton with a vintage wash finish.',
    image: 'https://m.media-amazon.com/images/I/61Riob8OGYL._SY550_.jpg',
    reviews: [
      { user: "StyleIcon", rating: 5, text: "Fits perfectly over a hoodie." }
    ]
  },
  {
    id: 'prod_f2',
    name: 'Puma Mens Court Sneaker',
    category: 'Fashion',
    price: 3499,
    rating: 4.4,
    reviewCount: 89,
    description: 'Designed for the city streets. Breathable mesh upper with high-rebound cushioning.',
    image: 'https://m.media-amazon.com/images/I/51cw59me6yL._SY500_.jpg',
    reviews: []
  },
  {
    id: 'prod_f3',
    name: 'Womens V-Neck Maxi Dress',
    category: 'Fashion',
    price: 5499,
    rating: 4.8,
    reviewCount: 56,
    description: 'Lightweight and breezy, perfect for warm weather outings.',
    image: 'https://m.media-amazon.com/images/I/71dHjLdBa7L._SY550_.jpg',
    reviews: []
  },
  {
    id: 'prod_f4',
    name: 'Genuine Leather Sling Bag',
    category: 'Fashion',
    price: 8499,
    rating: 4.9,
    reviewCount: 112,
    description: 'Genuine leather bag with multiple compartments for organization.',
    image: 'https://m.media-amazon.com/images/I/71dC4He41TL._SY625_.jpg',
    reviews: []
  },

  // --- HOME ---
  {
    id: 'prod_h1',
    name: 'Nordic Style Metal Desk Lamp',
    category: 'Home',
    price: 1299,
    rating: 4.3,
    reviewCount: 22,
    description: 'Adjustable LED arm with wireless charging base for your phone.',
    image: 'https://m.media-amazon.com/images/I/71xomxwBxNL._SX342_.jpg',
    reviews: []
  },
  {
    id: 'prod_h2',
    name: 'Ergonomic Mesh Mid Back Chair',
    category: 'Home',
    price: 2899,
    rating: 4.7,
    reviewCount: 450,
    description: 'Full lumbar support and mesh back for all-day comfort.',
    image: 'https://m.media-amazon.com/images/I/51A5WZTAYyL._SX679_.jpg',
    reviews: []
  },
  {
    id: 'prod_h3',
    name: 'Ceramic Vase for Flowers',
    category: 'Home',
    price: 1499,
    rating: 4.8,
    reviewCount: 15,
    description: 'Hand-crafted ceramic vase with a minimalist matte texture.',
    image: 'https://m.media-amazon.com/images/I/41c1M7IQpzL._SX300_SY300_QL70_FMwebp_.jpg',
    reviews: []
  },
  {
    id: 'prod_h4',
    name: 'Velvet Throw Pillow',
    category: 'Home',
    price: 380,
    rating: 4.5,
    reviewCount: 67,
    description: 'Soft velvet finish to add a pop of luxury to your sofa.',
    image: 'https://m.media-amazon.com/images/I/81lzMCvyREL._SX522_.jpg',
    reviews: []
  },

  // --- BEAUTY ---
  {
    id: 'prod_b1',
    name: 'Vitamin C Serum',
    category: 'Beauty',
    price: 2999,
    rating: 4.6,
    reviewCount: 900,
    description: 'Brightening serum for radiant skin. Cruelty-free and vegan.',
    image: 'https://m.media-amazon.com/images/I/615vJKpFVAL._SX425_.jpg',
    reviews: []
  },
  {
    id: 'prod_b2',
    name: 'Maybelline Creamy Matte Lipstick',
    category: 'Beauty',
    price: 3400,
    rating: 4.4,
    reviewCount: 130,
    description: 'Long-lasting matte formula in 5 distinct shades.',
    image: 'https://m.media-amazon.com/images/I/51jD170ZkGL._SX425_.jpg',
    reviews: []
  },
  {
    id: 'prod_b3',
    name: 'Pomegranate Sheet Mask',
    category: 'Beauty',
    price: 289,
    rating: 4.7,
    reviewCount: 55,
    description: 'Deep hydration mask with hyaluronic acid.',
    image: 'https://m.media-amazon.com/images/I/618zZwGvk2S._SX425_.jpg',
    reviews: []
  },
  {
    id: 'prod_b4',
    name: 'Kumkumadi Oil For Face',
    category: 'Beauty',
    price: 387,
    rating: 4.9,
    reviewCount: 40,
    description: 'Cold-pressed rosehip oil for skin regeneration.',
    image: 'https://m.media-amazon.com/images/I/71ZGckjaajL._SX425_.jpg',
    reviews: []
  },

  // --- SPORTS ---
  {
    id: 'prod_s1',
    name: 'Dual Color Yoga Mat',
    category: 'Sports',
    price: 589,
    rating: 4.8,
    reviewCount: 210,
    description: 'Extra thick mat with alignment lines for perfect poses.',
    image: 'https://m.media-amazon.com/images/I/61+J--H8kHL._SX466_.jpg',
    reviews: []
  },
  {
    id: 'prod_s2',
    name: 'Adjustable Dumbbells',
    category: 'Sports',
    price: 699,
    rating: 4.6,
    reviewCount: 95,
    description: 'Selectable weight form 5 to 50 lbs. Space saving design.',
    image: 'https://m.media-amazon.com/images/I/415qBsvQ60L._SY300_SX300_QL70_FMwebp_.jpg',
    reviews: []
  },
  {
    id: 'prod_s3',
    name: 'Pro Tennis Racket',
    category: 'Sports',
    price: 3299,
    rating: 4.5,
    reviewCount: 28,
    description: 'Lightweight graphite frame for power and control.',
    image: 'https://m.media-amazon.com/images/I/71a3nHqqbRL._SX522_.jpg',
    reviews: []
  },
  {
    id: 'prod_s4',
    name: 'Thermosteel Water Bottle',
    category: 'Sports',
    price: 2900,
    rating: 4.9,
    reviewCount: 500,
    description: 'Keeps water cold for 24 hours. Durable stainless steel.',
    image: 'https://m.media-amazon.com/images/I/61GOwOuzCRL._SX522_.jpg',
    reviews: []
  }
];

// --- FIREBASE INITIALIZATION SAFEGUARD ---
let app, auth, db;
let isFirebaseAvailable = false;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

try {
  // Check if config exists, otherwise use dummy to prevent crash
  const configStr = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
  if (configStr) {
    const firebaseConfig = JSON.parse(configStr);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseAvailable = true;
  } else {
    console.warn("Firebase config missing. Running in UI-only mode.");
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

// --- GEMINI API UTILITY ---
const callGemini = async (prompt) => {
  // IMPORTANT: On localhost, you must add your API key here
  const apiKey = ""; 
  
  if (!apiKey) return "Please add your API Key in the code to use AI features.";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, our AI service is temporarily unavailable. Please try again later.";
  }
};

// --- HELPERS ---
const RatingStars = ({ rating, count }) => (
  <div className="flex items-center text-sm text-yellow-500">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={14} fill={i < Math.floor(rating) ? "currentColor" : "none"} className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"} />
    ))}
    <span className="ml-2 text-gray-500 text-xs">({count})</span>
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    gradient: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md",
    gold: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md hover:from-yellow-600 hover:to-amber-700"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// --- SUB COMPONENTS (Defined Outside to Fix Focus Issues) ---

const Navbar = ({ view, setView, isMenuOpen, setIsMenuOpen, search, setSearch, user, cart }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 w-full">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center gap-4">
          {view === 'home' && (
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
            <span className="text-2xl font-bold text-indigo-900 hidden sm:block">BrainKart</span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setView('giftGuru')} className="hidden md:flex items-center gap-1 text-sm font-medium text-purple-600 bg-purple-50 px-3 py-2 rounded-full hover:bg-purple-100 transition-colors">
            <Gift size={16} /> Gift Guru <Sparkles size={12} className="text-yellow-500" />
          </button>
          {user && !user.isAnonymous ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden lg:block text-gray-700">{user.email?.split('@')[0]}</span>
              <Button variant="secondary" className="!p-2" onClick={() => isFirebaseAvailable && signOut(auth)}><LogOut size={20} /></Button>
            </div>
          ) : (
            <Button variant="primary" onClick={() => setView('login')} className="text-sm">Login</Button>
          )}
          <div className="relative cursor-pointer" onClick={() => setView('cart')}>
            <ShoppingCart className="text-gray-700 hover:text-indigo-600 transition-colors" size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{cart.reduce((a, c) => a + c.qty, 0)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
    
    {isMenuOpen && (
      <div className="md:hidden px-4 pb-4 border-t border-gray-100 pt-2 bg-white absolute w-full shadow-md z-40">
        <div className="relative mb-4">
          <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
        <button onClick={() => { setView('giftGuru'); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 text-purple-600 bg-purple-50 p-3 rounded-lg mb-2">
          <Gift size={18} /> Gift Guru AI
        </button>
      </div>
    )}
  </nav>
);

const GiftGuruView = ({ setView }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!query.trim()) return;
    setIsGenerating(true);
    const text = await callGemini(`Act as a shopping assistant named Gift Guru for BrainKart. Suggest 3 gifts for: "${query}" from categories: ${CATEGORIES.join(', ')}. If you mention prices, use Indian Rupees (₹). Be enthusiastic.`);
    setResult(text);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-full p-4 flex items-center justify-center w-full mt-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 relative border border-purple-100">
        <button onClick={() => setView('home')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Gift Guru AI <Sparkles className="inline text-yellow-400" /></h2>
          <p className="text-gray-600">Describe who you are shopping for, and I'll find the perfect match!</p>
        </div>
        <textarea 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="e.g., My dad who loves hiking and coffee..." 
          className="w-full p-4 rounded-xl border-2 border-purple-100 mb-4 h-32 focus:border-purple-300 outline-none transition-colors" 
        />
        <Button onClick={handleGenerate} disabled={isGenerating || !query.trim()} variant="gradient" className="w-full py-4 text-lg">
          {isGenerating ? <><Loader2 className="animate-spin" /> Thinking...</> : "Find Gift Ideas"}
        </Button>
        {result && (
          <div className="mt-8 bg-purple-50 rounded-xl p-6 border border-purple-100 whitespace-pre-wrap text-gray-700 leading-relaxed">
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

const LoginRegister = ({ 
  email, setEmail, password, setPassword, authError, setAuthError, 
  loading, handleAuth, isLoginView, setIsLoginView, setView 
}) => (
  <div className="min-h-full flex items-center justify-center px-4 w-full py-12 mt-8">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative">
      <button onClick={() => setView('home')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
      <h2 className="text-3xl font-bold text-center mb-6 text-indigo-900">{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
      {!isFirebaseAvailable && <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg mb-4 text-sm border border-yellow-200">Demo Mode: Backend unavailable.</div>}
      {authError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{authError}</div>}
      <div className="space-y-4">
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
          placeholder="Email" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
          placeholder="Password" 
        />
        <Button onClick={handleAuth} className="w-full py-3 text-lg" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : (isLoginView ? 'Sign In' : 'Sign Up')}
        </Button>
      </div>
      <div className="mt-6 text-center text-sm text-gray-600">
        <button 
          onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); }} 
          className="text-indigo-600 font-bold hover:underline"
        >
          {isLoginView ? 'Need an account? Sign Up' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  </div>
);

const ProductDetails = ({ selectedProduct, setView, handleAddToCart }) => {
  if (!selectedProduct) return null;
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAiAsking, setIsAiAsking] = useState(false);
  const [reviewSummary, setReviewSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [usageTips, setUsageTips] = useState('');
  const [isGettingTips, setIsGettingTips] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleAskAi = async () => {
    setIsAiAsking(true);
    const answer = await callGemini(`Sales assistant for ${selectedProduct.name} at BrainKart: ${aiQuestion}. Keep it short. Use Indian Rupees (₹) for currency.`);
    setAiAnswer(answer);
    setIsAiAsking(false);
  };

  const handleSummarizeReviews = async () => {
    setIsSummarizing(true);
    const reviewsText = selectedProduct.reviews.length > 0 ? selectedProduct.reviews.map(r => r.text).join(' ') : "No reviews yet.";
    const summary = await callGemini(`Summarize reviews for ${selectedProduct.name}: ${reviewsText}. List Pros & Cons.`);
    setReviewSummary(summary);
    setIsSummarizing(false);
  };

  const handleGetTips = async () => {
    setIsGettingTips(true);
    const tips = await callGemini(`3 tips to use/style ${selectedProduct.name}. Use emojis.`);
    setUsageTips(tips);
    setIsGettingTips(false);
  };

  const handleTranslate = async (lang) => {
    setIsTranslating(true);
    const res = await callGemini(`Translate description of ${selectedProduct.name} to ${lang}: ${selectedProduct.description}`);
    setTranslatedDesc(res);
    setIsTranslating(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mt-4">
      <button onClick={() => setView('home')} className="mb-6 flex items-center text-gray-600 hover:text-indigo-600">
        <ArrowLeft size={20} className="mr-2" /> Back to Products
      </button>
      <div className="bg-white rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
        <div className="relative">
           <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-96 object-contain rounded-xl shadow-inner bg-gray-50" />
           <div className="mt-4 space-y-2">
              <Button onClick={handleGetTips} disabled={isGettingTips} variant="secondary" className="w-full text-sm">
                 {isGettingTips ? "Dreaming..." : <><Lightbulb size={16}/> Usage Ideas ✨</>}
              </Button>
              {usageTips && <div className="bg-purple-50 p-4 rounded-xl text-sm whitespace-pre-wrap">{usageTips}</div>}
           </div>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
               <h1 className="text-3xl font-bold text-gray-900 leading-tight">{selectedProduct.name}</h1>
            </div>
            <div className="mt-2 mb-6">
              <span className="text-3xl font-bold text-indigo-700">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Description</h3>
                    <div className="flex gap-1">
                        {['Spanish', 'French', 'Hindi'].map(lang => (
                          <button key={lang} onClick={() => handleTranslate(lang)} disabled={isTranslating} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                            {lang.substring(0,2).toUpperCase()}
                          </button>
                        ))}
                    </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">{translatedDesc || selectedProduct.description}</p>
            </div>
            <div className="mt-6 bg-indigo-50 rounded-xl p-4">
              <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2"><Sparkles size={16} /> Ask AI Assistant</h4>
              <div className="flex gap-2">
                <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} placeholder="e.g. Is this good for gaming?" className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <Button onClick={handleAskAi} disabled={isAiAsking || !aiQuestion} className="!py-2 text-sm">Ask</Button>
              </div>
              {aiAnswer && <div className="mt-3 text-sm bg-white p-3 rounded-lg text-gray-700">{aiAnswer}</div>}
            </div>
          </div>
          <Button onClick={() => handleAddToCart(selectedProduct)} className="mt-8 py-4 text-lg w-full shadow-lg shadow-indigo-200"><ShoppingBag size={20} /> Add to Cart</Button>
        </div>
      </div>
      <div className="mt-12 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Customer Reviews</h3>
          <Button onClick={handleSummarizeReviews} disabled={isSummarizing} variant="outline" className="text-sm">Summarize Reviews ✨</Button>
        </div>
        {reviewSummary && <div className="mb-8 bg-blue-50 p-6 rounded-xl whitespace-pre-wrap text-sm text-blue-900">{reviewSummary}</div>}
        <div className="grid gap-6 md:grid-cols-3">
          {selectedProduct.reviews.length > 0 ? selectedProduct.reviews.map((rev, idx) => (
            <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between mb-3 font-bold">{rev.user} <RatingStars rating={rev.rating} count={1} /></div>
              <p className="text-gray-600 text-sm italic">"{rev.text}"</p>
            </div>
          )) : <p className="text-gray-400 col-span-3 text-center">No reviews yet.</p>}
        </div>
      </div>
    </div>
  );
};

const CartView = ({ cart, setView, handleUpdateQty, handleRemoveFromCart }) => {
  const [discountCode, setDiscountCode] = useState(null);
  const [isHaggling, setIsHaggling] = useState(false);
  const [haggleMessages, setHaggleMessages] = useState([]);
  const [haggleInput, setHaggleInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [haggleMessages]);
  
  const getFreshPrice = (id) => {
    const prod = ALL_PRODUCTS.find(p => p.id === id);
    return prod ? prod.price : 0;
  };

  const total = cart.reduce((acc, item) => acc + (getFreshPrice(item.id) * item.qty), 0);
  const finalTotal = discountCode === 'GEMINI10' ? total * 0.9 : total;

  const sendHaggleMessage = async () => {
    if (!haggleInput.trim()) return;
    const newMsgs = [...haggleMessages, { role: 'user', text: haggleInput }];
    setHaggleMessages(newMsgs);
    setHaggleInput('');
    
    const reply = await callGemini(`Act as a shopkeeper negotiating a discount for a cart total of ₹${total}. The user says: "${haggleInput}". If they are polite or persuasive, give them the code 'GEMINI10'. If not, refuse nicely. Keep it short. Reply using Indian Rupees (₹).`);
    
    setHaggleMessages(prev => [...prev, { role: 'ai', text: reply }]);
    if (reply.includes("GEMINI10")) { 
        setTimeout(() => { 
            setDiscountCode('GEMINI10'); 
            setIsHaggling(false); 
        }, 3000); 
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full mt-4">
       <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><ShoppingCart /> Your Cart</h2>
       {cart.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
             <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"><ShoppingBag size={32}/></div>
             <p className="text-xl mb-6 text-gray-600">Your cart is empty</p>
             <Button onClick={() => setView('home')}>Start Shopping</Button>
         </div>
       ) : (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-4">
             {cart.map((item) => {
               const product = ALL_PRODUCTS.find(p => p.id === item.id) || item;
               return (
                 <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center border border-gray-100">
                   <img src={product.image} alt={product.name} className="w-24 h-24 object-contain bg-gray-50 rounded-lg" />
                   <div className="flex-1">
                     <h3 className="font-bold text-gray-800">{product.name}</h3>
                     <div className="text-indigo-600 font-bold">₹{(product.price * item.qty).toLocaleString('en-IN')}</div>
                   </div>
                   <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                     <button onClick={() => handleUpdateQty(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm"><Minus size={16}/></button>
                     <span className="w-4 text-center text-sm font-medium">{item.qty}</span>
                     <button onClick={() => handleUpdateQty(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm"><Plus size={16}/></button>
                   </div>
                   <button onClick={() => handleRemoveFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-2"><X size={20} /></button>
                 </div>
               );
             })}
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm h-fit sticky top-24 border border-gray-100">
             <h3 className="text-lg font-bold mb-4">Order Summary</h3>
             <div className="space-y-3 mb-6">
                 <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                 <div className="flex justify-between text-gray-600"><span>Tax (18%)</span><span>₹{Math.round(total * 0.18).toLocaleString('en-IN')}</span></div>
                 {discountCode && <div className="flex justify-between text-green-600 font-medium"><span>Discount (10%)</span><span>-₹{Math.round(total * 0.1).toLocaleString('en-IN')}</span></div>}
                 <div className="flex justify-between text-xl font-bold pt-4 border-t text-gray-900">
                     <span>Total</span>
                     <span>₹{(discountCode ? Math.round(finalTotal * 1.18) : Math.round(total * 1.18)).toLocaleString('en-IN')}</span>
                 </div>
             </div>
             
             {!discountCode && !isHaggling && (
                 <Button onClick={() => { setIsHaggling(true); setHaggleMessages([{ role: 'ai', text: "That's a bit pricey, isn't it? Convince me to give you a discount!" }]); }} variant="gold" className="w-full mb-4">
                     <Coins size={18}/> Haggle for Discount ✨
                 </Button>
             )}

             {isHaggling && (
                <div className="bg-yellow-50 p-4 rounded-xl mb-4 border border-yellow-200">
                   <div className="h-48 overflow-y-auto mb-3 text-sm space-y-2 pr-1 custom-scrollbar">
                       {haggleMessages.map((m, i) => (
                           <div key={i} className={`p-2 rounded-lg max-w-[90%] ${m.role === 'ai' ? 'bg-white mr-auto text-gray-700 shadow-sm' : 'bg-yellow-200 ml-auto text-yellow-900'}`}>
                               {m.text}
                           </div>
                       ))}
                       <div ref={chatEndRef}></div>
                   </div>
                   <div className="flex gap-2">
                       <input 
                           value={haggleInput} 
                           onChange={e => setHaggleInput(e.target.value)} 
                           className="flex-1 border border-yellow-300 p-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
                           placeholder="Type your offer..."
                           onKeyDown={(e) => e.key === 'Enter' && sendHaggleMessage()}
                       />
                       <button onClick={sendHaggleMessage} className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600"><Send size={16}/></button>
                   </div>
                </div>
             )}

             {discountCode && <div className="mb-4 text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2 justify-center font-bold border border-green-200"><CheckCircle size={18}/> Coupon GEMINI10 Applied!</div>}
             
             <Button className="w-full py-3 shadow-lg shadow-indigo-200">Checkout</Button>
             <div className="flex justify-center gap-4 mt-4 text-gray-400">
                 <CreditCard size={20}/> <ShieldCheck size={20}/> <Truck size={20}/>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function EcommerceApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(150000); // INR Scale
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  // --- Effects ---
  useEffect(() => {
    // Initialization: Auth and styles
    const initAuth = async () => {
      if (!isFirebaseAvailable) return;

      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth init failed:", error);
      }
    };
    initAuth();
    
    if (isFirebaseAvailable) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  // Fetch User Data when User Changes
  useEffect(() => {
    if (!user || !isFirebaseAvailable) {
      if (!user) {
        setCart([]);
        setWishlist([]);
      }
      return;
    }

    // Using a structured path: /artifacts/{appId}/users/{userId}/data/profile
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    
    const unsubscribeData = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.cart) setCart(data.cart);
        if (data.wishlist) setWishlist(data.wishlist);
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
    });

    return () => unsubscribeData();
  }, [user]);

  // --- Actions ---
  const syncUserData = async (newCart, newWishlist) => {
    if (!user || !isFirebaseAvailable) return;
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    try { 
      await setDoc(userRef, { cart: newCart, wishlist: newWishlist }, { merge: true }); 
    } catch (e) { 
      console.error("Sync failed:", e); 
    }
  };

  const handleAddToCart = (product) => {
    if (!user && isFirebaseAvailable) { setView('login'); return; }
    
    // Allow local cart manipulation if offline/demo
    let newCart = [...cart];
    const existItem = newCart.find(x => x.id === product.id);
    if (existItem) {
      newCart = newCart.map(x => x.id === product.id ? { ...x, qty: x.qty + 1 } : x);
    } else {
      newCart.push({ ...product, qty: 1 });
    }
    setCart(newCart);
    syncUserData(newCart, wishlist);
  };

  const handleUpdateQty = (productId, delta) => {
    let newCart = cart.map(item => {
      if (item.id === productId) return { ...item, qty: Math.max(1, item.qty + delta) };
      return item;
    });
    setCart(newCart);
    syncUserData(newCart, wishlist);
  };

  const handleRemoveFromCart = (productId) => {
    const newCart = cart.filter(x => x.id !== productId);
    setCart(newCart);
    syncUserData(newCart, wishlist);
  };

  const toggleWishlist = (product) => {
    if (!user && isFirebaseAvailable) { setView('login'); return; }
    let newWishlist = [...wishlist];
    if (newWishlist.find(x => x.id === product.id)) {
      newWishlist = newWishlist.filter(x => x.id !== product.id);
    } else {
      newWishlist.push(product);
    }
    setWishlist(newWishlist);
    syncUserData(cart, newWishlist);
  };

  const handleAuth = async () => {
    if (!isFirebaseAvailable) {
      setAuthError("Backend unavailable in local environment.");
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (cred.user) {
          // Initialize empty profile
           await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid, 'data', 'profile'), {
             cart: [], wishlist: [], email: email
           });
        }
      }
      setView('home');
    } catch (err) { 
      setAuthError(err.message.replace("Firebase: ", "")); 
    } finally { 
      setLoading(false); 
    }
  };

  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchPrice = p.price <= priceRange;
      return matchCat && matchSearch && matchPrice;
    });
  }, [activeCategory, search, priceRange]);

  // --- MAIN RENDER ---
  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen w-full relative selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar 
        view={view}
        setView={setView}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        search={search}
        setSearch={setSearch}
        user={user}
        cart={cart}
      />
      
      <div className="pt-16 w-full min-h-screen flex flex-col">
        {view === 'home' ? (
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className={`lg:w-64 flex-shrink-0 ${isMenuOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white p-6 rounded-xl shadow-sm lg:sticky lg:top-24 transition-all border border-gray-100">
                  <div className="flex items-center gap-2 mb-6 font-bold text-gray-900 text-lg border-b pb-4"><Filter size={20} /> Filters</div>
                  <div className="mb-8">
                    <h4 className="font-semibold mb-3 text-xs tracking-wider text-gray-500 uppercase">Categories</h4>
                    <ul className="space-y-1">
                      {['All', ...CATEGORIES].map(cat => (
                        <li 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)} 
                            className={`cursor-pointer text-sm py-2 px-3 rounded-lg flex justify-between items-center transition-colors ${activeCategory === cat ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {cat} {activeCategory === cat && <ChevronRight size={14}/>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-xs tracking-wider text-gray-500 uppercase">Max Price: ₹{priceRange.toLocaleString('en-IN')}</h4>
                    <input 
                        type="range" 
                        min="1000" 
                        max="150000" 
                        step="1000" 
                        value={priceRange} 
                        onChange={(e) => setPriceRange(Number(e.target.value))} 
                        className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                </div>
              </aside>

              {/* Product Grid */}
              <main className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{activeCategory === 'All' ? 'All Products' : activeCategory}</h2>
                  <span className="text-sm text-gray-500">{filteredProducts.length} results</span>
                </div>
                {filteredProducts.length === 0 ? (
                   <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                       <Search className="mx-auto text-gray-300 mb-4" size={48} />
                       <p className="text-gray-500">No products found matching your criteria.</p>
                       <Button variant="secondary" className="mt-4 mx-auto" onClick={() => {setSearch(''); setPriceRange(150000); setActiveCategory('All')}}>Reset Filters</Button>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <div key={product.id} onClick={() => { setSelectedProduct(product); setView('product'); }} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col cursor-pointer">
                        <div className="relative h-56 overflow-hidden bg-gray-100 p-4">
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                          <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform z-10">
                            <Heart size={18} className={wishlist.some(w => w.id === product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                          </button>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">{product.category}</span>
                            <RatingStars rating={product.rating} count={product.reviewCount} />
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{product.description}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} 
                                className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-gray-200"
                            >
                                <Plus size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </main>
            </div>
          </div>
        ) : view === 'login' || view === 'register' ? (
          <LoginRegister 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            authError={authError}
            setAuthError={setAuthError}
            loading={loading}
            handleAuth={handleAuth}
            isLoginView={isLoginView}
            setIsLoginView={setIsLoginView}
            setView={setView}
          />
        ) : view === 'cart' ? (
          <CartView 
            cart={cart}
            setView={setView}
            handleUpdateQty={handleUpdateQty}
            handleRemoveFromCart={handleRemoveFromCart}
          />
        ) : view === 'product' ? (
          <ProductDetails 
            selectedProduct={selectedProduct}
            setView={setView}
            handleAddToCart={handleAddToCart}
          />
        ) : (
          <GiftGuruView setView={setView} />
        )}
      </div>
    </div>
  );
}