import { Business, CategoryItem, CityItem, PlatformStats, LeadInquiry, AppNotification } from '../types';

export const PLATFORM_STATS: PlatformStats = {
  totalBusinesses: 52480,
  totalCities: 108,
  monthlyVisitors: 245000,
  verifiedRate: 98.6,
  avgResponseMinutes: 12,
  totalLeadsGenerated: 184500
};

export const POPULAR_CATEGORIES: CategoryItem[] = [
  { id: 'nursery', name: 'Nursery', iconName: 'Sprout', count: 1240, description: 'Plants, indoor landscaping, flora & gardening supplies', popularCities: ['Lahore', 'Islamabad', 'Karachi'] },
  { id: 'restaurant', name: 'Restaurant', iconName: 'Utensils', count: 4890, description: 'Traditional Pakistani cuisine, fine dining & street food', popularCities: ['Lahore', 'Karachi', 'Peshawar'] },
  { id: 'cafe', name: 'Cafe', iconName: 'Coffee', count: 2150, description: 'Artisanal coffee, bakeries, desserts & co-working spots', popularCities: ['Islamabad', 'Lahore', 'Karachi'] },
  { id: 'hotel', name: 'Hotel', iconName: 'Hotel', count: 1840, description: 'Luxury stays, boutique hotels, resorts & guesthouses', popularCities: ['Islamabad', 'Peshawar', 'Rawalpindi'] },
  { id: 'hospital', name: 'Hospital', iconName: 'Hospital', count: 1320, description: '24/7 emergency care, specialized clinics & medical centers', popularCities: ['Lahore', 'Karachi', 'Faisalabad'] },
  { id: 'shop', name: 'Shop & Retail', iconName: 'ShoppingBag', count: 8900, description: 'Electronics, garments, home decor & general stores', popularCities: ['Karachi', 'Lahore', 'Multan'] },
  { id: 'doctor', name: 'Doctor & Specialist', iconName: 'Stethoscope', count: 3410, description: 'Consultants, cardiologists, dermatologists & dentists', popularCities: ['Lahore', 'Karachi', 'Rawalpindi'] },
  { id: 'freelancer', name: 'Freelancer & Agency', iconName: 'Laptop', count: 5670, description: 'Software developers, UI designers, digital marketers & SEO', popularCities: ['Islamabad', 'Lahore', 'Karachi'] },
  { id: 'electrician', name: 'Electrician & Services', iconName: 'Wrench', count: 2890, description: 'Solar installers, electrical repair, AC technicians & plumbing', popularCities: ['Lahore', 'Multan', 'Faisalabad'] },
  { id: 'realestate', name: 'Real Estate', iconName: 'Home', count: 4120, description: 'Plots, residential houses, commercial plazas & rental properties', popularCities: ['Islamabad', 'Lahore', 'Karachi'] },
  { id: 'academy', name: 'Academy & Tutors', iconName: 'GraduationCap', count: 2980, description: 'O/A level academies, CSS coaching, IT bootcamps & language institutes', popularCities: ['Lahore', 'Rawalpindi', 'Islamabad'] },
  { id: 'salon', name: 'Salon & Spa', iconName: 'Scissors', count: 3100, description: 'Grooming, bridal makeup, skincare & therapeutic spas', popularCities: ['Lahore', 'Karachi', 'Islamabad'] },
  { id: 'photographer', name: 'Photographer', iconName: 'Camera', count: 1870, description: 'Wedding cinematography, corporate events & studio portraits', popularCities: ['Lahore', 'Karachi', 'Islamabad'] },
  { id: 'lawyer', name: 'Lawyer & Legal', iconName: 'Scale', count: 1450, description: 'Corporate lawyers, property dispute experts & tax consultants', popularCities: ['Islamabad', 'Lahore', 'Karachi'] },
  { id: 'gym', name: 'Gym & Fitness', iconName: 'Dumbbell', count: 1950, description: 'Crossfit, personal trainers, women fitness hubs & nutritionists', popularCities: ['Lahore', 'Karachi', 'Islamabad'] },
  { id: 'car', name: 'Car Dealer & Auto', iconName: 'Car', count: 2310, description: 'New & imported vehicles, auto detailing & spare parts', popularCities: ['Lahore', 'Karachi', 'Faisalabad'] }
];

export const PAKISTAN_CITIES: CityItem[] = [
  { id: 'lahore', name: 'Lahore', province: 'Punjab', businessCount: 16420, image: 'https://images.unsplash.com/photo-1588096344356-9b343e8d2847?auto=format&fit=crop&w=600&q=80', lat: 31.5204, lng: 74.3587 },
  { id: 'karachi', name: 'Karachi', province: 'Sindh', businessCount: 18910, image: 'https://images.unsplash.com/photo-1627837042769-122e11e03a9f?auto=format&fit=crop&w=600&q=80', lat: 24.8607, lng: 67.0011 },
  { id: 'islamabad', name: 'Islamabad', province: 'ICT', businessCount: 9340, image: 'https://images.unsplash.com/photo-1608248597260-24449830f305?auto=format&fit=crop&w=600&q=80', lat: 33.6844, lng: 73.0479 },
  { id: 'rawalpindi', name: 'Rawalpindi', province: 'Punjab', businessCount: 4820, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80', lat: 33.5651, lng: 73.0169 },
  { id: 'multan', name: 'Multan', province: 'Punjab', businessCount: 3110, image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80', lat: 30.1575, lng: 71.5249 },
  { id: 'peshawar', name: 'Peshawar', province: 'KPK', businessCount: 2950, image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=600&q=80', lat: 34.0151, lng: 71.5249 },
  { id: 'faisalabad', name: 'Faisalabad', province: 'Punjab', businessCount: 3840, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', lat: 31.4504, lng: 73.1350 },
  { id: 'quetta', name: 'Quetta', province: 'Balochistan', businessCount: 1250, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', lat: 30.1798, lng: 66.9750 },
  { id: 'sialkot', name: 'Sialkot', province: 'Punjab', businessCount: 1890, image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80', lat: 32.4945, lng: 74.5229 },
  { id: 'gujranwala', name: 'Gujranwala', province: 'Punjab', businessCount: 2100, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', lat: 32.1877, lng: 74.1945 }
];

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz-1',
    ownerId: 'merchant-1',
    name: 'Green Flora Botanical Nursery',
    tagline: 'Premium Exotic Plants, Landscape Design & Indoor Trees',
    category: 'Nursery',
    city: 'Lahore',
    address: 'Main Boulevard, Phase 5 DHA, near Commercial Zone, Lahore',
    phone: '+92 300 8459123',
    whatsapp: '+923008459123',
    email: 'info@greenfloranursery.pk',
    website: 'https://greenfloranursery.pk',
    instagram: 'https://instagram.com/greenflora_lahore',
    facebook: 'https://facebook.com/greenfloranursery',
    coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Green Flora Botanical Nursery is Lahore’s premier destination for rare indoor plants, bonsai collections, organic fertilizers, and professional landscape architecture for residences and corporate plazas. Verified by BizNest field team.',
    aiSummary: 'Top-rated botanical hub in DHA Lahore. Specializes in indoor air-purifying foliage, custom planters, and instant landscape consultation with <8 min response time.',
    aiKeywords: ['Nursery Lahore', 'DHA Plants', 'Bonsai Trees Pakistan', 'Landscape Architect Lahore', 'Indoor Plants'],
    trustScore: 99,
    popularityScore: 97,
    responseTime: '< 8 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 142,
    isOpenNow: true,
    operatingHours: '08:00 AM - 09:00 PM (Mon - Sun)',
    priceRange: 'PKR 💸💸',
    productsServices: [
      { id: 'p1', name: 'Monstera Deliciosa (Large)', price: 'PKR 3,500', numericPrice: 3500, description: 'Acclimated air-purifying indoor plant in ceramic pot.' },
      { id: 'p2', name: 'Ficus Lyrata Fiddle Leaf Fig', price: 'PKR 6,000', numericPrice: 6000, description: '6-ft tall mature indoor ornamental tree.' },
      { id: 'p3', name: 'Residential Lawn Landscaping Design', price: 'PKR 25,000', numericPrice: 25000, description: 'Full layout plan with sod installation, automatic sprinklers, and lighting.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Hamza Malik', userCity: 'Lahore', rating: 5, date: '2 days ago', comment: 'Ordered 10 indoor plants for my new office in Phase 6. Delivered within 3 hours in immaculate condition! Highly recommended.' },
      { id: 'r2', userName: 'Dr. Ayesha Siddiqui', userCity: 'Lahore', rating: 5, date: '1 week ago', comment: 'Extremely knowledgeable staff. They helped me pick shade-loving plants for my balcony.' }
    ],
    viewsCount: 12840,
    leadsCount: 642,
    savedCount: 310,
    createdAt: '2025-11-10'
  },
  {
    id: 'biz-2',
    ownerId: 'merchant-2',
    name: 'Monal Rooftop Restaurant & Grill',
    tagline: 'Authentic Pakistani Barbecue & Continental Dining with City Skyline Views',
    category: 'Restaurant',
    city: 'Islamabad',
    address: 'Pir Sohawa Road, Margalla Hills, Islamabad',
    phone: '+92 51 2898044',
    whatsapp: '+923015559090',
    email: 'reservations@monal.pk',
    website: 'https://monal.pk',
    instagram: 'https://instagram.com/themonalislamabad',
    facebook: 'https://facebook.com/monal.pk',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Iconic fine-dining establishment nestled high in the Margalla Hills. Famous for its Shinwari Mutton Karahi, Chicken Reshmi Kebabs, fresh naan from live tandoor, and breathtaking nocturnal views of the federal capital.',
    aiSummary: 'Pakistan’s landmark rooftop dining destination in Islamabad. High trust score, live music, reservations available via WhatsApp with 5-minute reply time.',
    aiKeywords: ['Monal Islamabad', 'Margalla Hills Restaurant', 'Shinwari Karahi', 'Best Dining Islamabad'],
    trustScore: 98,
    popularityScore: 99,
    responseTime: '< 5 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 4.8,
    reviewCount: 890,
    isOpenNow: true,
    operatingHours: '12:00 PM - 01:00 AM (Mon - Sun)',
    priceRange: 'PKR 💸💸💸',
    productsServices: [
      { id: 'p1', name: 'Special Mutton Shinwari Karahi (1kg)', price: 'PKR 4,800', numericPrice: 4800, description: 'Fresh organic lamb cooked in natural fat and black pepper.' },
      { id: 'p2', name: 'Royal Barbecue Platter', price: 'PKR 6,500', numericPrice: 6500, description: 'Reshmi kebabs, Malai boti, Lamb chops & Fish tikka with garlic naan.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Usman Chaudhry', userCity: 'Rawalpindi', rating: 5, date: 'Yesterday', comment: 'Took foreign delegates here. Flawless hospitality and scenic views.' }
    ],
    viewsCount: 45900,
    leadsCount: 2890,
    savedCount: 1420,
    createdAt: '2025-08-15'
  },
  {
    id: 'biz-3',
    ownerId: 'merchant-3',
    name: 'DevCraft Digital Systems',
    tagline: 'Custom Software Architecture, AI Models & Web Apps',
    category: 'Freelancer',
    city: 'Karachi',
    address: 'Shahrah-e-Faisal, Block 6 PECHS, Karachi',
    phone: '+92 321 9876543',
    whatsapp: '+923219876543',
    email: 'contact@devcraft.io',
    website: 'https://devcraft.io',
    instagram: 'https://instagram.com/devcraft_pk',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Premier digital development agency offering full-stack React, Node.js, AI model integration, mobile apps, and cloud deployment for international & local Pakistani startups.',
    aiSummary: 'Top rated Karachi software studio with 50+ delivered apps. Specialized in React, AI Studio tools, and enterprise API backends.',
    aiKeywords: ['Software Agency Karachi', 'Web Developer Pakistan', 'React Native App', 'AI Integration'],
    trustScore: 97,
    popularityScore: 94,
    responseTime: '< 15 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 5.0,
    reviewCount: 56,
    isOpenNow: true,
    operatingHours: '09:00 AM - 07:00 PM (Mon - Sat)',
    priceRange: 'PKR 💸💸💸',
    productsServices: [
      { id: 'p1', name: 'Custom SaaS Platform MVP', price: 'PKR 250,000', numericPrice: 250000, description: 'Full-stack application development with React, Node, DB & auth.' },
      { id: 'p2', name: 'AI Chatbot & Automation Workflow', price: 'PKR 85,000', numericPrice: 85000, description: 'Custom Gemini / OpenAI integration for WhatsApp & website.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Saad Al-Farsi', userCity: 'Karachi', rating: 5, date: '3 days ago', comment: 'Built our ecommerce backend in record time. Ultra responsive engineering team.' }
    ],
    viewsCount: 8900,
    leadsCount: 380,
    savedCount: 190,
    createdAt: '2025-09-01'
  },
  {
    id: 'biz-4',
    ownerId: 'merchant-4',
    name: 'SolarTech Energy Solutions',
    tagline: 'Tier-1 On-Grid & Hybrid Solar Panel Installation',
    category: 'Electrician',
    city: 'Multan',
    address: 'Bosan Road, Near Gulgasht Colony, Multan',
    phone: '+92 312 4567890',
    whatsapp: '+923124567890',
    email: 'info@solartechmultan.pk',
    coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Multan’s leading PEC-certified solar engineering company. Providing Longi & Canadian N-Type panels, Huawei & Growatt inverters, net metering documentation, and 25-year performance warranties.',
    aiSummary: 'Certified green energy provider in Southern Punjab. Net metering approved installer with 300+ home installations in Multan & Bahawalpur.',
    aiKeywords: ['Solar Multan', 'Net Metering Punjab', 'Inverter Repair', 'On-Grid Solar'],
    trustScore: 96,
    popularityScore: 92,
    responseTime: '< 10 mins',
    isVerified: true,
    isFeatured: false,
    isPremium: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 88,
    isOpenNow: true,
    operatingHours: '09:00 AM - 08:00 PM (Mon - Sat)',
    priceRange: 'PKR 💸💸💸💸',
    productsServices: [
      { id: 'p1', name: '10kW Hybrid Solar System', price: 'PKR 1,450,000', numericPrice: 1450000, description: 'Complete system with Longi 580W panels, Growatt inverter & net metering license.' },
      { id: 'p2', name: '15kW Commercial Solar System', price: 'PKR 2,100,000', numericPrice: 2100000, description: 'High efficiency setup for factories, hospitals and plazas.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Tariq Mehmood', userCity: 'Multan', rating: 5, date: '2 weeks ago', comment: 'Zero electricity bill since installation last summer! Exceptional after-sales service.' }
    ],
    viewsCount: 11200,
    leadsCount: 520,
    savedCount: 240,
    createdAt: '2025-10-12'
  },
  {
    id: 'biz-5',
    ownerId: 'merchant-5',
    name: 'Al-Madina Heritage Hotel',
    tagline: 'Luxury Heritage Hospitality in the Historic Heart of Peshawar',
    category: 'Hotel',
    city: 'Peshawar',
    address: 'Khyber Bazaar near Qissa Khwani, Peshawar',
    phone: '+92 91 5278901',
    whatsapp: '+923339123456',
    email: 'stay@almadinaheritage.pk',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Renovated colonial architecture blended with modern 5-star comforts. Located near Qissa Khwani Bazaar with traditional Peshawari kehwa lounges, Charsi Tikka rooftop, and valet parking.',
    aiSummary: 'Top cultural hotel in Peshawar with 4.7 stars. Includes traditional Pashtun breakfast, secure parking & tourist guide arrangements.',
    aiKeywords: ['Hotel Peshawar', 'Qissa Khwani Stay', 'Luxury Hotel KPK', 'Peshawar Heritage'],
    trustScore: 95,
    popularityScore: 90,
    responseTime: '< 12 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: false,
    status: 'active',
    rating: 4.7,
    reviewCount: 115,
    isOpenNow: true,
    operatingHours: '24/7 Concierge Service',
    priceRange: 'PKR 💸💸💸',
    productsServices: [
      { id: 'p1', name: 'Executive Heritage Suite', price: 'PKR 18,000', numericPrice: 18000, description: 'King bed, city view balcony, complimentary Kahwa and breakfast.' },
      { id: 'p2', name: 'Guided Old City Heritage Tour', price: 'PKR 5,000', numericPrice: 5000, description: '3-hour walk through Qissa Khwani, Sethi House, and Mahabat Khan Mosque.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Shahid Afridi', userCity: 'Peshawar', rating: 5, date: '1 month ago', comment: 'Authentic Pashtun hospitality. Spotless rooms and superb food.' }
    ],
    viewsCount: 9400,
    leadsCount: 290,
    savedCount: 180,
    createdAt: '2025-07-20'
  },
  {
    id: 'biz-6',
    ownerId: 'merchant-6',
    name: 'Dr. Shahzad Skin & Laser Center',
    tagline: 'American Board Certified Dermatologist & Hair Transplant Specialist',
    category: 'Doctor',
    city: 'Lahore',
    address: 'MM Alam Road, Gulberg III, Lahore',
    phone: '+92 42 35789123',
    whatsapp: '+923028887766',
    email: 'appointments@drshahzadlaser.com',
    coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Advanced medical aesthetics, HydraFacials, FDA-approved laser hair reduction, acne scar revision, and FUE hair transplantation led by Dr. Shahzad Khan.',
    aiSummary: 'Leading dermatologist in Gulberg Lahore. High trust score with state-of-the-art laser tech & online appointment booking.',
    aiKeywords: ['Dermatologist Lahore', 'HydraFacial Gulberg', 'Hair Transplant Pakistan', 'Laser Skin Center'],
    trustScore: 98,
    popularityScore: 96,
    responseTime: '< 5 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 210,
    isOpenNow: true,
    operatingHours: '11:00 AM - 08:00 PM (Mon - Sat)',
    priceRange: 'PKR 💸💸💸',
    productsServices: [
      { id: 'p1', name: 'Clinical HydraFacial MD Treatment', price: 'PKR 12,000', numericPrice: 12000, description: 'Deep cleansing, gentle exfoliation, and antioxidant hydration.' },
      { id: 'p2', name: 'FUE Hair Transplant Session', price: 'PKR 120,000', numericPrice: 120000, description: 'High density single hair graft extraction and plantation.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Mahnoor Khan', userCity: 'Lahore', rating: 5, date: '3 days ago', comment: 'Extremely polite doctor. My skin cleared up completely in 4 weeks!' }
    ],
    viewsCount: 15600,
    leadsCount: 890,
    savedCount: 420,
    createdAt: '2025-06-18'
  },
  {
    id: 'biz-7',
    ownerId: 'merchant-7',
    name: 'Prime Estate & Builders',
    tagline: 'Authorized Dealer DHA, Bahria Town & Park View City',
    category: 'Real Estate',
    city: 'Islamabad',
    address: 'G-11 Markaz, Executive Heights Plaza, Islamabad',
    phone: '+92 51 2223344',
    whatsapp: '+923005001122',
    email: 'info@primeestateisb.com',
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Top-tier real estate consultancy specializing in residential plot transfers, luxury farmhouses in Chak Shahzad, commercial plaza investments, and verified overseas investor management.',
    aiSummary: 'Trusted Islamabad real estate portal with 100% verified plot records and transparent transfer procedure.',
    aiKeywords: ['Property Islamabad', 'DHA Islamabad Plots', 'Farmhouse Investment', 'Real Estate Agent'],
    trustScore: 97,
    popularityScore: 93,
    responseTime: '< 10 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 4.8,
    reviewCount: 94,
    isOpenNow: true,
    operatingHours: '10:00 AM - 07:00 PM (Mon - Sat)',
    priceRange: 'PKR 💸💸💸💸',
    productsServices: [
      { id: 'p1', name: '1 Kanal Residential Plot - DHA Phase 2', price: 'PKR 38,500,000', numericPrice: 38500000, description: 'Corner plot, fully paid, ready for immediate construction.' },
      { id: 'p2', name: 'Commercial Shop Rental - G-11 Plaza', price: 'PKR 150,000', numericPrice: 150000, description: 'Ground floor retail space with heavy footfall.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Omer Farooq', userCity: 'Islamabad', rating: 5, date: '2 weeks ago', comment: 'Very smooth plot transfer experience. No hidden commissions.' }
    ],
    viewsCount: 18400,
    leadsCount: 710,
    savedCount: 390,
    createdAt: '2025-05-14'
  },
  {
    id: 'biz-8',
    ownerId: 'merchant-8',
    name: 'Tariq & Co. Advocates & Legal Consultants',
    tagline: 'High Court Practitioners for Corporate Law, Tax & Property Disputes',
    category: 'Lawyer',
    city: 'Rawalpindi',
    address: 'District Courts Complex, Judicial Avenue, Rawalpindi',
    phone: '+92 51 5556677',
    whatsapp: '+923335556677',
    email: 'lawyers@tariqlegal.pk',
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Senior legal advocates representing clients before the Lahore High Court and Supreme Court of Pakistan. Expertise in SECP company registration, tax litigation, land title verification, and family law.',
    aiSummary: 'Leading law firm in Rawalpindi with 20+ years of legal excellence. Fast initial legal opinion via WhatsApp.',
    aiKeywords: ['Lawyer Rawalpindi', 'SECP Registration', 'Property Law Pakistan', 'High Court Advocate'],
    trustScore: 99,
    popularityScore: 89,
    responseTime: '< 15 mins',
    isVerified: true,
    isFeatured: false,
    isPremium: false,
    status: 'active',
    rating: 4.9,
    reviewCount: 42,
    isOpenNow: true,
    operatingHours: '09:00 AM - 05:00 PM (Mon - Fri)',
    priceRange: 'PKR 💸💸💸',
    productsServices: [
      { id: 'p1', name: 'SECP Private Limited Company Incorporation', price: 'PKR 35,000', numericPrice: 35000, description: 'Complete process including NTN, digital signature, and incorporation certificate.' },
      { id: 'p2', name: 'Property Legal Verification & Title Search', price: 'PKR 15,000', numericPrice: 15000, description: 'Comprehensive search at Patwari & Sub-Registrar records.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Bilal Hassan', userCity: 'Rawalpindi', rating: 5, date: '1 month ago', comment: 'Advocate Tariq saved us from a fraudulent property scam. Forever grateful!' }
    ],
    viewsCount: 6200,
    leadsCount: 180,
    savedCount: 95,
    createdAt: '2025-04-02'
  },
  {
    id: 'biz-9',
    ownerId: 'merchant-9',
    name: 'Sialkot Master Crafts Leather & Sports',
    tagline: 'Export-Quality Leather Jackets, Soccer Balls & Boxing Gear',
    category: 'Shop & Retail',
    city: 'Sialkot',
    address: 'Kashmir Road, Industrial Estate, Sialkot',
    phone: '+92 52 4291823',
    whatsapp: '+923018899000',
    email: 'exports@sialkotcrafts.com',
    website: 'https://sialkotcrafts.com',
    coverImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Sialkot’s premier manufacturer and direct retail exporter of 100% genuine full-grain leather jackets, FIFA-spec match soccer balls, martial arts gear, and custom teamwear.',
    aiSummary: 'Global supplier based in Sialkot with direct factory pricing for Pakistan & worldwide shipping.',
    aiKeywords: ['Leather Jacket Sialkot', 'Football Manufacturer', 'Sports Goods Pakistan', 'Boxing Gloves Export'],
    trustScore: 98,
    popularityScore: 95,
    responseTime: '< 10 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 130,
    isOpenNow: true,
    operatingHours: '08:30 AM - 07:00 PM (Mon - Sat)',
    priceRange: 'PKR 💸💸',
    productsServices: [
      { id: 'p1', name: 'Classic Genuine Lambskin Leather Biker Jacket', price: 'PKR 14,500', numericPrice: 14500, description: 'Handcrafted full-grain leather with YKK zippers.' },
      { id: 'p2', name: 'FIFA Quality Pro Thermo-Bonded Soccer Ball', price: 'PKR 4,200', numericPrice: 4200, description: 'Microfiber PU match ball with 12-panel seamless structure.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Kamran Akmal', userCity: 'Sialkot', rating: 5, date: '3 weeks ago', comment: 'Best leather quality in Pakistan. Unbeatable factory price!' }
    ],
    viewsCount: 13400,
    leadsCount: 610,
    savedCount: 320,
    createdAt: '2025-03-12'
  },
  {
    id: 'biz-10',
    ownerId: 'merchant-10',
    name: 'Chenab Weavers & Textile Mills Outlet',
    tagline: 'Premium Faisalabad Lawn, Bedding & Unstitched Cotton Suitings',
    category: 'Shop & Retail',
    city: 'Faisalabad',
    address: 'D-Ground Commercial Area, Peoples Colony No. 1, Faisalabad',
    phone: '+92 41 8541290',
    whatsapp: '+923227654321',
    email: 'sales@chenabweavers.pk',
    coverImage: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1584184924103-e310d9d8533f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Direct factory outlet from Faisalabad—the Manchester of Pakistan. Selling luxury embroidered digital lawn 3-piece suits, Egyptian cotton gents shalwar kameez fabric, and 100% hotel-grade bedsheets.',
    aiSummary: 'Direct textile factory prices in Faisalabad with cash on delivery across 100+ cities in Pakistan.',
    aiKeywords: ['Lawn Suits Faisalabad', 'Unstitched Cotton', 'Bedsheets Wholesale', 'Textile Mill Outlet'],
    trustScore: 97,
    popularityScore: 96,
    responseTime: '< 8 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 4.8,
    reviewCount: 240,
    isOpenNow: true,
    operatingHours: '10:00 AM - 10:00 PM (Mon - Sun)',
    priceRange: 'PKR 💸💸',
    productsServices: [
      { id: 'p1', name: 'Luxury Digital Embroidered Lawn 3-Piece Suit', price: 'PKR 4,800', numericPrice: 4800, description: 'Chiffon dupatta, lawn shirt & embroidered trousers.' },
      { id: 'p2', name: 'Egyptian Cotton Gents Unstitched Suit (4.5m)', price: 'PKR 3,200', numericPrice: 3200, description: 'Wrinkle-resistant soft luxury finish for summer & festive wear.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Nabila Shah', userCity: 'Multan', rating: 5, date: '4 days ago', comment: 'Authentic Faisalabad fabric! Color does not bleed and stitching drape is perfect.' }
    ],
    viewsCount: 22100,
    leadsCount: 1100,
    savedCount: 540,
    createdAt: '2025-02-18'
  },
  {
    id: 'biz-11',
    ownerId: 'merchant-11',
    name: 'Quetta Zarghoon Dry Fruits & Organic Honey',
    tagline: '100% Pure Balochi Pine Nuts (Chilgoza), Walnuts, Figs & Sidr Honey',
    category: 'Shop & Retail',
    city: 'Quetta',
    address: 'Liaquat Bazaar, near Kandahari Bazaar, Quetta',
    phone: '+92 81 2839201',
    whatsapp: '+923337890123',
    email: 'info@quettadryfruits.pk',
    coverImage: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Heritage organic dry fruit purveyor in Quetta. Sourcing hand-picked Zhob Chilgoza, jumbo almonds, Balochi dates, sun-dried figs (Anjeer), and raw wild Sidr honey.',
    aiSummary: 'Direct Quetta bazaar wholesaler shipping authentic dry fruits nationwide with quality guarantee.',
    aiKeywords: ['Quetta Chilgoza', 'Dry Fruits Pakistan', 'Sidr Honey Quetta', 'Balochi Almonds'],
    trustScore: 99,
    popularityScore: 91,
    responseTime: '< 10 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: false,
    status: 'active',
    rating: 4.9,
    reviewCount: 175,
    isOpenNow: true,
    operatingHours: '09:00 AM - 09:00 PM (Mon - Sat)',
    priceRange: 'PKR 💸💸💸',
    productsServices: [
      { id: 'p1', name: 'Balochi Pine Nuts / Roasted Chilgoza (1 kg)', price: 'PKR 9,500', numericPrice: 9500, description: 'Jumbo roasted roasted pine nuts with natural aroma.' },
      { id: 'p2', name: 'Wild Organic Sidr Beri Honey (1 kg Jar)', price: 'PKR 4,500', numericPrice: 4500, description: '100% raw unheated medicinal honey from Karak & Balochistan forests.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Asad Shah', userCity: 'Islamabad', rating: 5, date: '1 week ago', comment: 'Super fresh Chilgoza! Delivered to Islamabad in 48 hours in vacuum sealed box.' }
    ],
    viewsCount: 11800,
    leadsCount: 490,
    savedCount: 280,
    createdAt: '2025-01-20'
  },
  {
    id: 'biz-12',
    ownerId: 'merchant-12',
    name: 'Gourmet Artisanal Roastery & Cafe',
    tagline: 'Specialty Arabica Coffee, French Croissants & Co-Working Lounge',
    category: 'Cafe',
    city: 'Islamabad',
    address: 'F-7 Markaz, Jinnah Super, Islamabad',
    phone: '+92 51 2654321',
    whatsapp: '+923001234567',
    email: 'hello@gourmetroastery.pk',
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Islamabad’s favorite specialty coffee destination. Serving micro-batch roasted single-origin Arabica beans, fresh sourdough sandwiches, butter croissants, high-speed optical fiber WiFi, and quiet workstation bays.',
    aiSummary: 'Top rated cafe in F-7 Islamabad. Ideal for freelancers, remote meetings, and coffee lovers.',
    aiKeywords: ['Coffee Shop Islamabad', 'F7 Cafe', 'Specialty Coffee', 'Co-working Islamabad'],
    trustScore: 98,
    popularityScore: 97,
    responseTime: '< 5 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 4.8,
    reviewCount: 310,
    isOpenNow: true,
    operatingHours: '07:30 AM - 11:30 PM (Mon - Sun)',
    priceRange: 'PKR 💸💸',
    productsServices: [
      { id: 'p1', name: 'Spanish Latte with Fresh Espresso Shot', price: 'PKR 850', numericPrice: 850, description: 'Single-origin espresso blended with condensed milk and steamed foam.' },
      { id: 'p2', name: 'Smoked Turkey & Cheese Sourdough Panini', price: 'PKR 1,250', numericPrice: 1250, description: 'Artisanal sourdough with Dijon mustard & melted Swiss cheese.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Zainab Qureshi', userCity: 'Islamabad', rating: 5, date: '2 days ago', comment: 'My go-to spot for remote work! Great coffee and peaceful vibes.' }
    ],
    viewsCount: 28900,
    leadsCount: 1420,
    savedCount: 890,
    createdAt: '2025-05-10'
  },
  {
    id: 'biz-13',
    ownerId: 'merchant-13',
    name: 'National Fitness & Crossfit Arena',
    tagline: 'State-of-the-Art Cardio, Heavy Weightlifting & Certified Personal Trainers',
    category: 'Gym',
    city: 'Lahore',
    address: 'Phase 3 DHA, Y-Block Commercial, Lahore',
    phone: '+92 42 35748900',
    whatsapp: '+923009988776',
    email: 'info@nationalfitness.pk',
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Lahore’s premier 15,000 sq ft fitness facility featuring Life Fitness machines, Rogue crossfit rigs, sauna, steam room, protein bar, and dedicated women-only workout hours.',
    aiSummary: 'Top gym in DHA Y Block Lahore with IFBB certified trainers and flexible monthly memberships.',
    aiKeywords: ['Gym DHA Lahore', 'Fitness Club Y Block', 'Personal Trainer Lahore', 'Crossfit Gym'],
    trustScore: 97,
    popularityScore: 94,
    responseTime: '< 10 mins',
    isVerified: true,
    isFeatured: false,
    isPremium: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 180,
    isOpenNow: true,
    operatingHours: '06:00 AM - 12:00 AM (Mon - Sat)',
    priceRange: 'PKR 💸💸',
    productsServices: [
      { id: 'p1', name: 'Monthly All-Access Fitness Pass', price: 'PKR 12,000', numericPrice: 12000, description: 'Includes gym floor, crossfit zone, sauna & locker facility.' },
      { id: 'p2', name: '1-on-1 Personal Training Package (12 Sessions)', price: 'PKR 35,000', numericPrice: 35000, description: 'Custom workout plan, nutrition guide, and body composition tracking.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Fahad Mustafa', userCity: 'Lahore', rating: 5, date: '1 week ago', comment: 'World class equipment and super clean environment!' }
    ],
    viewsCount: 14200,
    leadsCount: 560,
    savedCount: 310,
    createdAt: '2025-06-01'
  },
  {
    id: 'biz-14',
    ownerId: 'merchant-14',
    name: 'Khyber Shinwari Barbecue & Karahi',
    tagline: 'Authentic Salted Lamb Karahi & Landi Kotal Kebabs',
    category: 'Restaurant',
    city: 'Peshawar',
    address: 'Ring Road near Hayatabad Phase 3, Peshawar',
    phone: '+92 91 5829102',
    whatsapp: '+923339876543',
    email: 'info@khybershinwari.pk',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'World-renowned traditional Pashtun eatery in Peshawar. Live slaughtering of mountain lamb, seasoned purely with salt and fat, cooked over wood fires.',
    aiSummary: 'Top Pashtun cuisine landmark in Peshawar with traditional carpet seating and family dining halls.',
    aiKeywords: ['Shinwari Karahi Peshawar', 'Namkeen Tikka', 'Charsi Karahi', 'Peshawar Food'],
    trustScore: 99,
    popularityScore: 98,
    responseTime: '< 5 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 620,
    isOpenNow: true,
    operatingHours: '11:00 AM - 02:00 AM (Mon - Sun)',
    priceRange: 'PKR 💸💸',
    productsServices: [
      { id: 'p1', name: 'Fresh Shinwari Namkeen Lamb Karahi (1 kg)', price: 'PKR 4,200', numericPrice: 4200, description: 'Cooked in natural fat with sea salt & green chillies.' },
      { id: 'p2', name: 'Landi Kotal Mutton Boti (1 Dozen Skewers)', price: 'PKR 2,800', numericPrice: 2800, description: 'Tender lamb chunks grilled over oak charcoal.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Arbab Jehangir', userCity: 'Peshawar', rating: 5, date: '3 days ago', comment: 'The gold standard for Namkeen Karahi in Pakistan!' }
    ],
    viewsCount: 38000,
    leadsCount: 2100,
    savedCount: 1100,
    createdAt: '2025-03-01'
  },
  {
    id: 'biz-15',
    ownerId: 'merchant-15',
    name: 'Tariq Auto Imports & Detailing Studio',
    tagline: 'Auction-Graded Japanese Cars, Ceramic Coating & PPF Film',
    category: 'Car Dealer & Auto',
    city: 'Karachi',
    address: 'Main Khalid Bin Walid Road, PECHS, Karachi',
    phone: '+92 21 34567890',
    whatsapp: '+923002233445',
    email: 'sales@tariqautos.pk',
    coverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Karachi’s trusted importer of verified 4.5+ grade Japanese vehicles (Prius, Vezel, Land Cruiser) with original USS auction sheets, plus premium Gyeon ceramic coating.',
    aiSummary: 'Verified car dealership on Khalid Bin Walid Road with verifiable auction sheets and paint protection services.',
    aiKeywords: ['Japanese Cars Karachi', 'Auction Sheet Verification', 'Ceramic Coating PECHS', 'Vezel Karachi'],
    trustScore: 98,
    popularityScore: 95,
    responseTime: '< 8 mins',
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'active',
    rating: 4.9,
    reviewCount: 160,
    isOpenNow: true,
    operatingHours: '10:00 AM - 09:00 PM (Mon - Sat)',
    priceRange: 'PKR 💸💸💸💸',
    productsServices: [
      { id: 'p1', name: 'Gyeon 9H Ceramic Coating Protection', price: 'PKR 45,000', numericPrice: 45000, description: '3-year warranty hydrophobic ceramic seal for paint finish.' },
      { id: 'p2', name: 'Toyota Land Cruiser Prado 2021 (4.5 Grade)', price: 'PKR 32,500,000', numericPrice: 32500000, description: 'Unregistered fresh import with original Japanese inspection certificate.' }
    ],
    reviews: [
      { id: 'r1', userName: 'Imran Hashmi', userCity: 'Karachi', rating: 5, date: '2 weeks ago', comment: 'Verified auction sheet online right in front of me. Transformed my car!' }
    ],
    viewsCount: 21500,
    leadsCount: 940,
    savedCount: 480,
    createdAt: '2025-04-15'
  }
];

export const MOCK_BUSINESSES = INITIAL_BUSINESSES;

export const MOCK_LEADS: LeadInquiry[] = [
  {
    id: 'lead-101',
    businessId: 'biz-1',
    businessName: 'Green Flora Botanical Nursery',
    senderName: 'Muhammad Salman',
    senderPhone: '+92 300 4567891',
    senderEmail: 'salman@gmail.com',
    city: 'Lahore',
    message: 'Looking for 15 indoor potted plants for our new software house office in Phase 5 DHA. Please share wholesale catalog.',
    createdAt: '2026-08-01',
    status: 'new'
  },
  {
    id: 'lead-102',
    businessId: 'biz-2',
    businessName: 'Monal Rooftop Restaurant & Grill',
    senderName: 'Saima Bano',
    senderPhone: '+92 321 7890123',
    senderEmail: 'saima.b@outlook.com',
    city: 'Islamabad',
    message: 'Would like to reserve a rooftop table for 12 family members this Sunday evening. Do you have outdoor heaters?',
    createdAt: '2026-08-03',
    status: 'new'
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Inquiry Response Received',
    message: 'Green Flora Botanical Nursery responded to your wholesale catalog inquiry: "Yes! We offer 20% discount on 10+ plant orders."',
    timestamp: '10 minutes ago',
    isRead: false,
    type: 'inquiry_reply'
  },
  {
    id: 'notif-2',
    title: 'Business Status Update',
    message: 'Your business "Al-Makkah Auto Care Lahore" status was updated to Verified Hub Gold Shield! 🛡️',
    timestamp: '2 hours ago',
    isRead: false,
    type: 'business_status'
  },
  {
    id: 'notif-3',
    title: 'New Customer Inquiry',
    message: 'Muhammad Salman sent a new lead inquiry for "Green Flora Botanical Nursery" regarding office landscaping.',
    timestamp: 'Yesterday',
    isRead: true,
    type: 'lead'
  },
  {
    id: 'notif-4',
    title: 'Order Confirmed',
    message: 'Order #ORD-8492 with Monal Rooftop Restaurant was confirmed for table reservation.',
    timestamp: '3 days ago',
    isRead: true,
    type: 'order'
  }
];

