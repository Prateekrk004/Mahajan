/// <reference types="vite/client" />
import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  Clock, 
  Phone, 
  Send, 
  Check, 
  X, 
  Menu, 
  ArrowRight, 
  Store, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Package, 
  Award, 
  ShieldCheck, 
  Heart,
  MessageSquare
} from 'lucide-react';
import { PRODUCTS, BRANDS_COLORS, BRANDS_EMOJIS, getBrandRank, type Product } from './data';

// Eagerly resolve and import all local images so Vite bundles and hashes them correctly, ensuring they work in production/GitHub Pages
const LOCAL_IMAGES = import.meta.glob('./assets/images/**/*.{png,jpg,jpeg,svg,webp,PNG,JPG,JPEG,SVG,WEBP}', { eager: true, import: 'default' }) as Record<string, string>;

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80",
  "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1400&q=80",
  "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1400&q=80",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=80"
];

const ENQUIRY_TYPES = [
  "Bulk / Wholesale Order",
  "Product Availability",
  "Pricing Query",
  "Delivery Info",
  "General Enquiry"
];

const MPSLogo = ({ size = 64 }: { size?: number }) => {
  // Generate coordinates for 24 beads around a circle of radius 38
  const beads = Array.from({ length: 24 }).map((_, i) => {
    const angle = ((i * 360) / 24) * (Math.PI / 180);
    const radius = 38;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  });

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="flex-shrink-0 filter drop-shadow-sm">
      {/* Outer rings of beads exactly matching the logo in PDF */}
      {beads.map((b, i) => (
        <g key={i}>
          {/* Green outer ring of bead */}
          <circle cx={b.x} cy={b.y} r="5" fill="#009F4D" />
          {/* Inner white spacer */}
          <circle cx={b.x} cy={b.y} r="3.7" fill="#FFFFFF" />
          {/* Red inner dot */}
          <circle cx={b.x} cy={b.y} r="2.2" fill="#ED1C24" />
        </g>
      ))}
      
      {/* Central Red Circle, touching the inner edges of beads perfectly */}
      <circle cx="50" cy="50" r="33" fill="#ED1C24" />
      
      {/* Central MPS Monogram Text with exact Serif styling & Calligraphic cursive S */}
      <g style={{ fontFamily: "'Playfair Display', 'Didot', 'Georgia', 'Times New Roman', serif" }} className="select-none">
        {/* M on top-left, elegant classical serif */}
        <text
          x="36"
          y="47"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#FFFFFF"
        >
          M
        </text>
        {/* P on top-right, elegant classical serif */}
        <text
          x="64"
          y="47"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#FFFFFF"
        >
          P
        </text>
        {/* S interlaced at center-bottom, rendered as a calligraphic script curve */}
        <text
          x="50"
          y="69"
          textAnchor="middle"
          fontSize="30"
          fontWeight="900"
          fontStyle="italic"
          fill="#FFFFFF"
          className="font-black"
        >
          S
        </text>
      </g>
    </svg>
  );
};

export default function App() {
  // Navigation & UI States
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Hero Slider
  const [activeSlide, setActiveSlide] = useState(0);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(32);



  // B2B Enquiry Basket state
  const [basket, setBasket] = useState<Record<string, { product: Product; quantity: number }>>(() => {
    try {
      const saved = localStorage.getItem('mps_basket');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track image load stages (0: Direct, 1: Proxied/Alternate, 2: Fallback styling)
  const [imgLoadStages, setImgLoadStages] = useState<Record<string, number>>({});

  // Contact/Enquiry Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'Bulk / Wholesale Order',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Save basket to localStorage
  useEffect(() => {
    localStorage.setItem('mps_basket', JSON.stringify(basket));
  }, [basket]);

  // Reset visible count when filters change for performance optimization
  useEffect(() => {
    setVisibleCount(32);
  }, [selectedBrand, searchQuery]);

  // Compute unique brands list grouped and ordered exactly as per Client instructions
  const brandsList = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort((a, b) => {
      return getBrandRank(a) - getBrandRank(b);
    });
  }, []);

  // Filter products based on active tab & query and sort them exactly as per category ranking sequence
  const filteredProducts = useMemo(() => {
    const filtered = PRODUCTS.filter((p) => {
      const matchBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBrand && matchQuery;
    });

    // Group and sort by category sequence
    return [...filtered].sort((a, b) => {
      const rankA = getBrandRank(a.brand);
      const rankB = getBrandRank(b.brand);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return 0; // maintain stability for products of the same brand
    });
  }, [selectedBrand, searchQuery]);

  // Count items per category (including dynamic updates matching query if helpful)
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: PRODUCTS.length };
    brandsList.forEach((b) => {
      counts[b] = PRODUCTS.filter((p) => p.brand === b).length;
    });
    return counts;
  }, [brandsList]);

  // Basket Handlers
  const addToBasket = (product: Product) => {
    const key = `${product.brand}:${product.name}`;
    setBasket((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: {
          product,
          quantity: current ? current.quantity + 1 : 1
        }
      };
    });
  };

  const removeFromBasket = (product: Product) => {
    const key = `${product.brand}:${product.name}`;
    setBasket((prev) => {
      const updated = { ...prev };
      if (!updated[key]) return prev;
      if (updated[key].quantity <= 1) {
        delete updated[key];
      } else {
        updated[key] = {
          ...updated[key],
          quantity: updated[key].quantity - 1
        };
      }
      return updated;
    });
  };

  const removeBrandItems = (key: string) => {
    setBasket((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const clearBasket = () => {
    setBasket({});
  };

  const totalBasketCount = useMemo(() => {
    return (Object.values(basket) as { product: Product; quantity: number }[]).reduce((sum, item) => sum + item.quantity, 0);
  }, [basket]);

  // Image load helper with stage support (0: Direct original CDN, 1: Proxied fallback)
  const getProxyImgUrl = (url: string, stage: number = 0) => {
    if (!url) return '';
    
    // If it's a local asset path, resolve it using the Vite-bundled image map
    if (url.startsWith('/src/assets/images/') || url.startsWith('src/assets/images/')) {
      const fileName = url.substring(url.lastIndexOf('/') + 1);
      
      // Match by file name to avoid differences in relative glob keys (./ vs absolute paths), case-insensitive
      const matchingKey = Object.keys(LOCAL_IMAGES).find(key => key.toLowerCase().endsWith('/' + fileName.toLowerCase()));
      
      if (matchingKey && LOCAL_IMAGES[matchingKey]) {
        return LOCAL_IMAGES[matchingKey];
      }
    }

    if (url.startsWith('/') || url.startsWith('.') || !url.startsWith('http')) {
      if (url.startsWith('/')) {
        return '.' + url;
      }
      return url;
    }

    // For external URLs:
    // Stage 0: Direct Original URL (Very fast, respects CDNs like Amazon, Google, etc. and avoids proxy request overhead)
    // Stage 1: Fallback via images.weserv.nl proxy (handles websites with hotlinking protection/Referer blocking)
    if (stage === 0) {
      return url;
    }
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=300&h=300&fit=contain&bg=white&output=jpg`;
  };

  // Submit enquiry form
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      setFormError('Please fulfill at least your Name and Phone / WhatsApp number so we can reach you.');
      return;
    }

    setFormError('');
    setFormSubmitted(true);

    // Format message matching WhatsApp
    const whatsappNum = "919686684854";
    let messageText = `*New Enquiry from Mahajan Provision Store*\n\n`;
    messageText += `*Name:* ${form.name}\n`;
    messageText += `*Phone:* ${form.phone}\n`;
    if (form.email) messageText += `*Email:* ${form.email}\n`;
    messageText += `*Type:* ${form.type}\n`;
    if (form.message) messageText += `*Note:* ${form.message}\n\n`;

    const basketItems = Object.values(basket) as { product: Product; quantity: number }[];
    if (basketItems.length > 0) {
      messageText += `*Requested Quote Items (${basketItems.length}):*\n`;
      basketItems.forEach((item, index) => {
        messageText += `${index + 1}. [${item.product.brand}] ${item.product.name} (Qty: ${item.quantity})\n`;
      });
    }

    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${whatsappNum}?text=${encoded}`;
    
    // Redirect after brief delay
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1000);
  };

  // Quick WhatsApp direct click
  const handleDirectWhatsApp = () => {
    const whatsappNum = "919686684854";
    const defaultMsg = encodeURIComponent("Hello Mahajan Provision Store, I am inquiring about wholesale food items & hotel supplies.");
    window.open(`https://wa.me/${whatsappNum}?text=${defaultMsg}`, '_blank');
  };

  // Inject beautiful formatted message reflecting selected basket items automatically in form note
  useEffect(() => {
    const basketItems = Object.values(basket) as { product: Product; quantity: number }[];
    if (basketItems.length > 0) {
      const itemsList = basketItems.map(item => `• ${item.product.brand} - ${item.product.name} (Qty: ${item.quantity})`).join('\n');
      setForm(prev => ({
        ...prev,
        message: prev.message ? prev.message : `Please send estimated pricing/wholesale quote for:\n${itemsList}`
      }));
    }
  }, [basket]);

  return (
    <div id="root-container" className="min-h-screen flex flex-col font-sans bg-[#FAF7F2] text-[#2E2522] selection:bg-[#A11E22] selection:text-white">
      

      {/* HEADER BANNER */}
      <div id="top-promo-banner" className="bg-[#781115] text-[#EAA813] text-xs text-center py-2 px-4 font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-pulse flex-shrink-0" />
        <span>Authorised Distributor for Malas, Woh Hup, Foodrite, Dabur, MDH & More – Delivering HoReCa Wholesale Solutions Across Bengaluru</span>
      </div>

      {/* NAVIGATION BAR */}
      <nav id="main-navigation" className="sticky top-0 z-40 bg-white border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 md:py-1.5 flex items-center justify-between">
          <a href="#home" onClick={() => setActiveSection('home')} className="flex items-center transition-opacity hover:opacity-90 py-0.5">
            <img 
              src="https://i.ibb.co/fLZN5Jg/Whats-App-Image-2026-06-16-at-11-18-16.jpg" 
              alt="Mahajan Provision Stores" 
              className="h-28 md:h-32 lg:h-36 w-auto object-contain transition-transform" 
              referrerPolicy="no-referrer"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'welcome', label: 'Legacy' },
              { id: 'products', label: 'Catalogue' },
              { id: 'about', label: 'About Us' },
              { id: 'locate', label: 'Locate' }
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setActiveSection(link.id)}
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                  activeSection === link.id
                    ? 'bg-[#FAECEB] text-[#A11E22]'
                    : 'text-black/60 hover:text-[#A11E22] hover:bg-black/5'
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setActiveSection('contact')}
              className="bg-[#A11E22] text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all hover:bg-[#781115] hover:shadow-md flex items-center gap-2 cursor-pointer ml-2"
            >
              <span>Contact & Quotes</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Collapsible Mobile Control */}
          <div className="flex items-center gap-3 md:hidden">
            {totalBasketCount > 0 && (
              <a 
                href="#products" 
                className="relative bg-[#FAECEB] p-2 rounded-full text-[#A11E22]"
                aria-label="Enquiry Basket"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-[#A11E22] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalBasketCount}
                </span>
              </a>
            )}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-black/80 hover:text-[#A11E22] transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-navigation-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-black/5"
            >
              <div className="px-4 py-3 flex flex-col gap-1.5 pb-6">
                {[
                  { id: 'home', label: 'Home Page' },
                  { id: 'welcome', label: 'Legacy & Distributor Brand Status' },
                  { id: 'products', label: 'Catalogue & Wholesale Ordering' },
                  { id: 'about', label: 'About Our Team' },
                  { id: 'locate', label: 'Store Map & Hours' },
                  { id: 'contact', label: 'Quick Enquiry Form' }
                ].map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={() => {
                      setActiveSection(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-sm font-medium p-3 rounded-lg flex items-center justify-between transition-colors ${
                      activeSection === link.id
                        ? 'bg-[#FAECEB] text-[#A11E22] font-semibold'
                        : 'text-black/70 hover:bg-black/5'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </a>
                ))}
                
                <button
                  onClick={() => {
                    handleDirectWhatsApp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#A11E22] hover:bg-[#781115] text-white font-bold p-3.5 rounded-lg mt-4 flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start WhatsApp Chat Now</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="relative group min-h-[580px] bg-[#490A0C] flex items-center overflow-hidden">
        {/* Animated Background Slider */}
        <div id="hero-slider-container" className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.25, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${HERO_IMAGES[activeSlide]}')` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#260405] via-[#3E0608]/90 to-transparent" />
        </div>

        {/* Hero Visual Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 z-10 w-full text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-xs py-2 px-4 rounded-full tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-[#EAA813] animate-ping" />
              <span>🌿 50+ YEARS OF EXCELLENCE & PURE TRUST</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Mahajan <span className="text-[#EAA813] italic">Provision</span><br />Store
            </h1>
            
            <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg leading-relaxed font-sans">
              A second-generation Bangalore legacy business built on the foundation of Mahajan Provision Store. We supply premium sauces, syrups, canned mushrooms, hotel condiments & wholesale FMCG lines directly to Bengaluru&apos;s leading restaurants, cloud kitchens & retailers with flawless service.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#products"
                onClick={() => setActiveSection('products')}
                className="bg-[#A11E22] text-white hover:bg-[#781115] text-base font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-3 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Browse Products Catalogue</span>
              </a>
              <button
                onClick={handleDirectWhatsApp}
                className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 text-base font-bold px-8 py-4 rounded-xl transition-all flex items-center gap-3"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

            {/* B2B Stats Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/15">
              {[
                { number: "14+", label: "Premium Brands Authorized" },
                { number: "300+", label: "Products Catalogued" },
                { number: "B2B", label: "Wholesale & HoReCa" },
                { number: "BLR", label: "Bangalore-Wide Logistics" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#EAA813]">
                    {stat.number}
                  </span>
                  <span className="text-[11px] sm:text-xs text-white/70 mt-1 uppercase tracking-wider leading-snug">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Carousel Slide Indicators */}
        <div id="slide-dots-panel" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-2 transition-all duration-300 rounded-full ${
                activeSlide === i ? 'bg-[#EAA813] w-7' : 'bg-white/40 w-2'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CORE BENEFITS / WELCOME */}
      <section id="welcome" className="py-16 md:py-24 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Legacy Text */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#A11E22]">
                  Welcome to Mahajan Provision Store
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2E2522] tracking-tight leading-tight">
                  Premium Foodservice supplies & FMCG Distribution Since 1975
                </h2>
              </div>
              
              <div className="h-1 w-20 bg-[#A11E22] rounded-full" />

              <p className="text-black/70 text-base leading-relaxed font-sans">
                With a rich corporate lineage spanning more than five decades, we have established ourselves as the key cornerstone of food supplies in South India. At MPS, we remove the friction of sourcing for modern commercial kitchens, bulk food preparation units, premium lounges, premium retail counters, and individual eateries.
              </p>

              <p className="text-black/70 text-base leading-relaxed font-sans font-semibold">
                As authorized distributors, our goods flow directly from parent factories to your premises, guaranteeing cold-chain hygiene, maximum expiration periods, and genuine manufacturer price benefits.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm font-medium">
                {[
                  "Factory Authorized for Woh Hup, Malas, Foodrite, Dabur & Chings",
                  "Consistently competitive bulk wholesale rates",
                  "Reliable scheduled delivery across Greater Bangalore",
                  "Premium shelf life tracking on every dispatch"
                ].map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="bg-[#FAECEB] text-[#A11E22] rounded-full p-0.5 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 font-bold" />
                    </div>
                    <span className="text-black/80">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Grid Cards: B2B Specialty Categories */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  icon: "🫙", 
                  title: "Sauces & Condiments", 
                  desc: "Bulk packets of premium soy, chilli, teriyaki & mayonnaise sauce types.", 
                  color: "bg-red-50 text-red-700" 
                },
                { 
                  icon: "🍹", 
                  title: "Syrups & Mocktails", 
                  desc: "Signature Monin & Mala&apos;s fruit crushes, purees & flavor concentrates.", 
                  color: "bg-amber-50 text-amber-700" 
                },
                { 
                  icon: "🌶️", 
                  title: "Spices & Masalas", 
                  desc: "Certified gourmet grade MDH & premium whole spice ranges.", 
                  color: "bg-emerald-50 text-emerald-700" 
                },
                { 
                  icon: "🛒", 
                  title: "Retail & Fine Grocery", 
                  desc: "Olive oils, canned vegetables, papads & high-volume bulk pantry packs.", 
                  color: "bg-blue-50 text-blue-700" 
                }
              ].map((card, i) => (
                <div key={i} className="bg-[#FAF7F2] border border-black/5 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${card.color}`}>
                    {card.icon}
                  </span>
                  <h3 className="font-bold text-base text-[#2E2522]">{card.title}</h3>
                  <p className="text-black/60 text-xs leading-normal">{card.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION WITH B2B ENQUIRY SYSTEM */}
      <section id="products" className="py-16 md:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col gap-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#A11E22]">
              Live Store Catalogue
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2E2522] tracking-tight">
              A Wide Catalogue of Ingredients
            </h2>
            <p className="text-black/50 text-sm sm:text-base">
              Add premium ingredients and packaging options directly to your Enquiry List to compile your customized bulk pricing quote instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDE: MAIN PRODUCTS INTERACTIVE VISUALIZER */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Filters Block: Search Bar */}
              <div className="bg-white border border-black/5 p-4 rounded-2xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3 bg-[#FAF7F2] border border-black/5 rounded-xl px-4 py-3">
                  <Search className="w-5 h-5 text-black/40 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by product name or brand (e.g. Soya, Malas, Chilli)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent w-full focus:outline-none text-sm text-[#2E2522]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} aria-label="Clear Search">
                      <X className="w-4 h-4 text-black/40 hover:text-black" />
                    </button>
                  )}
                </div>

                {/* Filters Option: Brand Tab Pills */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-black/40 tracking-wider uppercase">
                    Select Brand Category
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-black/10">
                    <button
                      onClick={() => setSelectedBrand('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                        selectedBrand === 'ALL'
                          ? 'bg-[#A11E22] text-white'
                          : 'bg-[#FAF7F2] border border-black/5 text-[#2E2522]/60 hover:border-[#A11E22]/30 hover:text-[#A11E22]'
                      }`}
                    >
                      <span>Show All</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                        selectedBrand === 'ALL' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#2E2522]/50'
                      }`}>
                        {brandCounts.ALL}
                      </span>
                    </button>

                    {brandsList.map((brand) => {
                      const isActive = selectedBrand === brand;
                      const count = brandCounts[brand] || 0;
                      return (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(brand)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                            isActive
                              ? 'bg-[#A11E22] text-white'
                              : 'bg-[#FAF7F2] border border-black/5 text-[#2E2522]/60 hover:border-[#A11E22]/30 hover:text-[#A11E22]'
                          }`}
                        >
                          <span className="opacity-70">{BRANDS_EMOJIS[brand] || '📦'}</span>
                          <span>{brand}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                            isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-[#2E2522]/50'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Products Yield Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 min-h-[350px]">
                <AnimatePresence>
                  {filteredProducts.slice(0, visibleCount).map((product) => {
                    const key = `${product.brand}:${product.name}`;
                    const countInBasket = basket[key]?.quantity || 0;
                    const brandColor = BRANDS_COLORS[product.brand] || '#A11E22';
                    const brandEmoji = BRANDS_EMOJIS[product.brand] || '🛒';
                    const stage = imgLoadStages[key] || 0;
                    const hasError = stage >= 2 || !product.img;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={key}
                        className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
                      >
                        {/* Img display or stylish colored brand container fallback */}
                        <div className="relative aspect-square w-full bg-[#FAF7F2] flex items-center justify-center p-3 overflow-hidden select-none">
                          {!hasError ? (
                            <img
                              src={getProxyImgUrl(product.img, stage)}
                              alt={product.name}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain filter group-hover:scale-105 transition-transform"
                              onError={() => {
                                setImgLoadStages((prev) => {
                                  const current = prev[key] || 0;
                                  return { ...prev, [key]: current + 1 };
                                });
                              }}
                            />
                          ) : (
                            <div 
                              className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center p-4 transition-all"
                              style={{ background: `linear-gradient(135deg, ${brandColor}15, ${brandColor}30)` }}
                            >
                              <span className="text-4xl filter drop-shadow-sm animate-bounce duration-1000 mb-2">
                                {brandEmoji}
                              </span>
                              <span className="text-[10px] uppercase tracking-widest font-extrabold" style={{ color: brandColor }}>
                                {product.brand}
                              </span>
                            </div>
                          )}

                          {countInBasket > 0 && (
                            <div className="absolute top-2.5 right-2.5 bg-[#A11E22] text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3" />
                              <span>{countInBasket} in List</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info footer */}
                        <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between bg-white border-t border-black/5">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span 
                                className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                                style={{ color: brandColor, backgroundColor: `${brandColor}12` }}
                              >
                                {product.brand}
                              </span>
                              <span className="text-xs text-black/30 font-medium">Wholesale Packs</span>
                            </div>
                            <h3 className="font-bold text-xs sm:text-sm text-black/80 capitalize line-clamp-2 leading-snug min-h-[36px]">
                              {product.name.toLowerCase()}
                            </h3>
                          </div>

                          {/* Control Add/Minus buttons */}
                          <div className="flex items-center gap-2 mt-2">
                            {countInBasket > 0 ? (
                              <div className="flex items-center justify-between w-full bg-[#FAF7F2] rounded-xl border border-black/5 p-1">
                                <button
                                  onClick={() => removeFromBasket(product)}
                                  className="p-1 px-2.5 text-black/60 hover:text-red-600 hover:bg-black/5 rounded-lg text-sm font-bold transition-all"
                                  aria-label="Remove item"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-black/80 text-center flex-1">
                                  {countInBasket}
                                </span>
                                <button
                                  onClick={() => addToBasket(product)}
                                  className="p-1 px-2.5 text-black/60 hover:text-[#A11E22] hover:bg-black/5 rounded-lg text-sm font-bold transition-all"
                                  aria-label="Add item"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToBasket(product)}
                                className="w-full bg-[#A11E22]/10 text-[#A11E22] hover:bg-[#A11E22] hover:text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Enquiry</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Show More Products Button */}
              {filteredProducts.length > visibleCount && (
                <div className="flex justify-center mt-8 animate-fade-in">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 32)}
                    className="bg-white hover:bg-[#FAF7F2] text-[#A11E22] border border-[#A11E22]/20 hover:border-[#A11E22] font-extrabold text-sm px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Load More Products</span>
                    <span className="text-xs opacity-60">({filteredProducts.length - visibleCount} remaining)</span>
                  </button>
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-white border border-black/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
                  <Package className="w-12 h-12 text-black/30 stroke-[1.5]" />
                  <h4 className="font-bold text-lg text-black/80">No matching items found</h4>
                  <p className="text-sm text-black/50 max-w-sm">
                    Try adjusting your search filters or brand parameters. We also stock items off-catalogue, so feel free to submit a custom query.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedBrand('ALL');
                    }}
                    className="text-[#A11E22] font-bold text-sm bg-[#FAECEB] px-4 py-2 rounded-lg"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

            </div>

            {/* RIGHT SIDE: B2B ENQUIRY BASKET CONTAINER */}
            <div className="lg:col-span-4 sticky top-24">
              <div 
                id="enquiry-basket-panel" 
                className="bg-[#A11E22] text-white rounded-3xl p-6 shadow-md border border-[#781115] flex flex-col gap-5"
              >
                <div className="flex items-center justify-between border-b border-white/20 pb-4">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-5 h-5 text-[#EAA813]" />
                    <h3 className="font-serif font-black text-lg">My Enquiry List</h3>
                  </div>
                  {totalBasketCount > 0 && (
                    <button
                      onClick={clearBasket}
                      className="text-xs text-white/70 hover:text-[#EAA813] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 px-0 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Basket List Items */}
                <div className="max-h-[320px] overflow-y-auto flex flex-col gap-2.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                  {(Object.entries(basket) as [string, { product: Product; quantity: number }][]).map(([key, item]) => {
                    const brandColor = BRANDS_COLORS[item.product.brand] || '#EAA813';
                    return (
                      <div
                        key={key}
                        className="bg-white/10 hover:bg-white/15 transition-colors border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                            {item.product.brand}
                          </span>
                          <span className="font-bold text-xs truncate capitalize text-white/95 leading-none">
                            {item.product.name.toLowerCase()}
                          </span>
                        </div>

                        {/* Adjust qty list inline */}
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <button
                            onClick={() => removeFromBasket(item.product)}
                            className="w-5 h-5 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all"
                          >
                            -
                          </button>
                          <span className="font-extrabold text-xs text-[#EAA813] min-w-[14px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToBasket(item.product)}
                            className="w-5 h-5 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeBrandItems(key)}
                            className="text-white/40 hover:text-red-400 p-1 rounded transition-colors"
                            aria-label="Delete line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(basket).length === 0 && (
                    <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">
                        🛒
                      </div>
                      <p className="text-sm text-white/80 max-w-[200px] leading-relaxed">
                        Your List is currently empty. Click on items on the left to add them!
                      </p>
                    </div>
                  )}
                </div>

                {/* Sub Total summary */}
                <div className="bg-[#490A0C] p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-white/80">Unique Products Selected</span>
                    <span className="text-[#EAA813] text-base font-extrabold">{Object.keys(basket).length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-white/80">Total Packages Count</span>
                    <span className="text-[#EAA813] text-base font-extrabold">{totalBasketCount}</span>
                  </div>
                  
                  {totalBasketCount > 0 ? (
                    <a
                      href="#contact"
                      onClick={() => setActiveSection('contact')}
                      className="bg-[#EAA813] text-[#490A0C] hover:bg-[#F5C752] transition-all font-black text-xs uppercase tracking-wider py-3 rounded-xl text-center flex items-center justify-center gap-2 mt-1 shadow-sm"
                    >
                      <span>Proceed to Quote Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="bg-white/10 text-white/40 font-bold text-xs uppercase tracking-wider py-3 rounded-xl text-center mt-1 cursor-default"
                    >
                      Add Items to Start
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-white/60 text-center leading-normal">
                  💡 Sourcing in bulk? Selected products are auto-attached to your WhatsApp query upon completing the form below.
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="py-16 md:py-24 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Context */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#A11E22]">
                  Family Legacy
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2E2522] tracking-tight">
                  Over half a Century of trust in food service
                </h2>
              </div>
              
              <div className="h-1 w-20 bg-[#A11E22] rounded-full" />

              <p className="text-black/70 text-sm sm:text-base leading-relaxed">
                Mahajan Provision Store is a multi-generational, highly valued institutional business based out of Bengaluru. Sourcing from India’s best farms and packaging lines, we have developed a premium supply architecture.
              </p>

              <p className="text-black/70 text-sm sm:text-base leading-relaxed font-medium">
                Our legacy relies on four core values: Absolute authenticity of inventory, uncompromising timelines, price transparency, and lifelong customer relationships.
              </p>

              {/* Highlighting Cards */}
              <div className="flex flex-col gap-4 mt-2">
                {[
                  {
                    icon: <Award className="w-5 h-5 text-[#A11E22]" />,
                    title: "A half Century Brand",
                    desc: "Second-generation business built upon long-term loyalty with premium hotels and retail giants."
                  },
                  {
                    icon: <ShieldCheck className="w-5 h-5 text-[#A11E22]" />,
                    title: "Authentic Distribution Status",
                    desc: "Direct certified relationship with manufacturers, preventing counterfeit risk completely."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-[#FAF7F2] rounded-2xl border border-black/5">
                    <span className="p-2 sm:p-3 bg-white rounded-xl shadow-sm h-fit">
                      {item.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#2E2522]">{item.title}</h4>
                      <p className="text-xs text-black/60 mt-1 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Google Map Mock Illustration or Banner */}
            <div className="relative rounded-3xl overflow-hidden shadow-md border border-black/5 bg-[#FAECEB]/50 p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[380px]">
              <div className="absolute top-4 right-4 bg-white/80 text-[#A11E22] border border-[#A11E22]/10 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Bengaluru Head Office
              </div>
              <div className="w-16 h-16 rounded-full bg-[#A11E22] text-white flex items-center justify-center text-3xl shadow-sm">
                📍
              </div>
              <h3 className="font-serif font-black text-xl text-[#A11E22]">Perfect Bangalore Logistics</h3>
              <p className="text-black/70 text-sm max-w-sm leading-relaxed">
                Our central physical storage warehouse is strategically located in Bengaluru, permitting swift, direct distributions and pickups to anywhere in Bangalore Urban & Rural.
              </p>
              <a
                href="#locate"
                onClick={() => setActiveSection('locate')}
                className="bg-[#A11E22] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#781115] transition-all flex items-center gap-1"
              >
                <span>Find Us on Map Below</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* LOCATE US SECTION */}
      <section id="locate" className="py-16 md:py-24 bg-[#FAF7F2] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#A11E22]">
              Where to find us
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2E2522] tracking-tight">
              Locate Our Physical Store
            </h2>
            <p className="text-black/50 text-sm sm:text-base">
              Visit our stores for custom selections or schedule direct warehouse dispatches.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* MAP EMBED */}
            <div className="lg:col-span-8 rounded-3xl overflow-hidden shadow-sm border border-black/5 min-h-[350px] bg-white">
              <iframe
                title="Google Maps Location"
                src="https://maps.google.com/maps?q=Mahajan+Provision+Stores,+16/1,+3rd+Main+Rd,+New+Tharagupet,+Bengaluru,+Karnataka+560002&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 min-h-[380px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* LOGISTIC SPECIFICATIONS */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#A11E22] flex-shrink-0 mt-1" />
                <div className="flex flex-col gap-1 text-sm">
                  <h4 className="font-bold text-[#2E2522]">Store Location</h4>
                  <p className="text-black/60 font-medium leading-relaxed">
                    Mahajan Provision Stores<br />
                    16/1, 3rd Main Rd, New Tharagupet,<br />
                    Bengaluru, Karnataka 560002
                  </p>
                </div>
              </div>

              <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <Clock className="w-5 h-5 text-[#A11E22] flex-shrink-0 mt-1" />
                <div className="flex flex-col gap-1 text-sm">
                  <h4 className="font-bold text-[#2E2522]">Working Hours</h4>
                  <div className="text-black/60 font-medium leading-relaxed">
                    <p>Monday – Saturday: <span className="font-bold text-[#A11E22]">9:30 AM – 7:00 PM</span></p>
                    <p>Sunday: <span className="font-bold text-red-600">Holiday</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#A11E22] flex-shrink-0 mt-1" />
                <div className="flex flex-col gap-1 text-sm">
                  <h4 className="font-bold text-[#2E2522]">Direct Contact Details</h4>
                  <a href="https://wa.me/919686684854" target="_blank" className="text-[#A11E22] font-extrabold hover:underline">
                    +91 96866 84854
                  </a>
                  <p className="text-[11px] text-black/40 leading-normal">
                    Click to instantly trigger WhatsApp chat logs regarding price lists.
                  </p>
                </div>
              </div>

              <a
                href="https://maps.app.goo.gl/2LiCoTX8NBMcNZ9K9?g_st=ac"
                target="_blank"
                className="w-full bg-[#A11E22] hover:bg-[#781115] text-center text-white font-extrabold text-sm py-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Open Pin in Google Maps</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </a>

            </div>

          </div>

        </div>
      </section>

      {/* CONTACT / ENQUIRY FORM */}
      <section id="contact" className="py-16 md:py-24 bg-[#A11E22] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#EAA813]">
              Direct Sourcing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Request Sourcing Quote / Price Sheet
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              Submit your inquiry and physical location. Your specified basket selection turns into an exact order query on WhatsApp!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Form Side */}
            <div className="lg:col-span-7 bg-[#781115] p-6 sm:p-8 rounded-3xl border border-white/5 shadow-md">
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm p-3.5 rounded-xl font-medium flex items-center gap-2">
                    <X className="w-4 h-4" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 border border-[#EAA813]/30 text-white text-center p-8 rounded-2xl flex flex-col items-center justify-center gap-4 py-12"
                  >
                    <span className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#A11E22] text-3xl flex items-center justify-center font-bold">
                      ✓
                    </span>
                    <h3 className="font-serif font-black text-xl text-[#EAA813]">Enquiry Query Formulated!</h3>
                    <p className="text-sm text-white/80 max-w-sm leading-relaxed">
                      Thank you, {form.name}! We have compiled your selection parameters. You are now being forwarded to chat with us on WhatsApp to finalize estimates instantly.
                    </p>
                    <p className="text-xs text-white/50 italic">
                      If browser forwarding didn&apos;t occur, click the direct button below.
                    </p>
                    <button
                      type="button"
                      onClick={handleFormSubmit}
                      className="bg-[#EAA813] hover:bg-[#F0C046] text-[#A11E22] font-black text-sm px-6 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                      <span>Trigger WhatsApp Chat Manual redirection</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-white/80">Business / Sourse Owner Name <span className="text-[#EAA813] font-bold">*</span></label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Ramesh Kumar"
                          className="bg-white/10 border border-white/20 hover:border-white/40 focus:border-[#EAA813] focus:outline-none rounded-xl p-3 text-sm text-white placeholder-white/30 transition-all font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-white/80">Active Phone / WhatsApp No. <span className="text-[#EAA813] font-bold">*</span></label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="e.g. +91 96866 XXXXX"
                          className="bg-white/10 border border-white/20 hover:border-white/40 focus:border-[#EAA813] focus:outline-none rounded-xl p-3 text-sm text-white placeholder-white/30 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-white/80">Email ID Address (Optional)</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="e.g. owner@bengalurucafe.com"
                          className="bg-white/10 border border-white/20 hover:border-white/40 focus:border-[#EAA813] focus:outline-none rounded-xl p-3 text-sm text-white placeholder-white/30 transition-all font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-white/80">Categorization Type</label>
                        <select
                          value={form.type}
                          onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                          className="bg-[#781115] border border-white/20 hover:border-white/40 focus:border-[#EAA813] focus:outline-none rounded-xl p-3 text-sm text-white transition-all font-medium"
                        >
                          {ENQUIRY_TYPES.map((t) => (
                            <option key={t} value={t} className="bg-[#A11E22]">
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-white/80">Detailed Sourcing Requirements / Notes</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        placeholder="Detail specific brand flavors, sizes, pack quantities, or delivery requirements..."
                        className="bg-white/10 border border-white/20 hover:border-white/40 focus:border-[#EAA813] focus:outline-none rounded-xl p-3 text-sm text-white placeholder-white/30 transition-all font-medium resize-y"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-[#EAA813] text-[#A11E22] hover:bg-[#F2C249] transition-colors font-black text-xs uppercase tracking-widest py-4 rounded-xl text-center flex items-center justify-center gap-2 mt-2 shadow-md cursor-pointer"
                    >
                      <Send className="w-4.5 h-4.5" />
                      <span>Send Enquiry & Connect on WhatsApp</span>
                    </button>
                  </>
                )}
                
              </form>
            </div>

            {/* Quick Sourcing Detail Cards */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {[
                {
                  emoji: "⚡",
                  title: "Instant Quotations",
                  desc: "Forget waiting days. Fill out your details, hit submit, and directly text our wholesale pricing managers with zero channel delay."
                },
                {
                  emoji: "📦",
                  title: "HoReCa Custom Ordering",
                  desc: "Need custom weights or specific container quantities? Ask us! We service customized requests perfectly."
                },
                {
                  emoji: "🏠",
                  title: "Office / Store Pickup Available",
                  desc: "Prefer to pick up items yourself to schedule rapid catering loads? Walk into our Bengaluru facility anytime during business hours."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-[#781115] p-5 rounded-3xl border border-white/5 flex gap-4 hover:border-white/10 transition-colors">
                  <span className="w-12 h-12 rounded-2xl bg-white/10 border border-white/5 text-2xl flex items-center justify-center flex-shrink-0">
                    {faq.emoji}
                  </span>
                  <div>
                    <h4 className="font-serif font-black text-base text-[#EAA813] mb-1">
                      {faq.title}
                    </h4>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                      {faq.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#260405] text-white/50 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/5 mb-8">
            
            <div className="md:col-span-6 flex flex-col gap-4">
              <div className="flex items-center">
                <div className="bg-white/95 p-3 rounded-lg shadow-sm hover:opacity-95 transition-opacity">
                  <img 
                    src="https://i.ibb.co/fLZN5Jg/Whats-App-Image-2026-06-16-at-11-18-16.jpg" 
                    alt="Mahajan Provision Stores" 
                    className="h-20 w-auto object-contain" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <p className="text-xs sm:text-sm mt-1 max-w-sm leading-normal text-white/70">
                Authorized factory reseller & premium hotel supplies service operating daily in Greater Bengaluru, Karnataka. Sourced on 50 years of Mahajan Provision supply chain excellence.
              </p>
            </div>

            <div className="md:col-span-3 flex flex-col gap-4 text-xs sm:text-sm">
              <h4 className="font-bold text-white uppercase tracking-wider">Catalogue Brands</h4>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold text-white/60">
                <span>Malas Syrups</span>
                <span>Woh Hup Sauces</span>
                <span>Foodrite Mayos</span>
                <span>Dabur Juices</span>
                <span>Chings Sauces</span>
                <span>MDH Masalas</span>
                <span>Weikfield Soda</span>
                <span>LKK Soya Sauce</span>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-4 text-xs sm:text-sm">
              <h4 className="font-bold text-white uppercase tracking-wider">Fast Links</h4>
              <div className="flex flex-col gap-2">
                <a href="#welcome" className="hover:text-[#EAA813] transition-colors">Our 50-Year Legacy</a>
                <a href="#products" className="hover:text-[#EAA813] transition-colors">Ingredient Catalogue</a>
                <a href="#locate" className="hover:text-[#EAA813] transition-colors">Locate Store Map</a>
                <a href="https://wa.me/919686684854" target="_blank" className="text-[#EAA813] hover:underline flex items-center gap-1 font-bold">
                  <span>Chat With Us Support</span>
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>
              © 2026 Mahajan Provision Store, Bengaluru, Karnataka. All rights reserved.
            </p>
            <p className="text-[11px]">
              Sourced directly from certified factories to protect B2B margins. Authorized Distributor status.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
