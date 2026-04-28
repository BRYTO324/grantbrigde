import { create } from 'zustand';
import { setTokens, clearTokens } from './api';

export type UserRole = 'entrepreneur' | 'funder';

export type VerificationStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  company?: string;
  phone?: string;
  avatar?: string;
  verificationStatus: VerificationStatus;
}

export interface PitchCard {
  id: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  entrepreneurName: string;
  entrepreneurAvatar: string;
  companyName: string;
  location: string;
  createdAt: string;
  tags: string[];
  stage: 'idea' | 'mvp' | 'growth' | 'scale';
  likes: number;
  views: number;
  image: string;
  verified: boolean;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  pitches: PitchCard[];
  searchQuery: string;
  selectedCategory: string;
  login: (user: User, tokens?: { access: string; refresh: string }) => void;
  logout: () => void;
  completeOnboarding: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

const samplePitches: PitchCard[] = [
  {
    id: '1',
    title: 'AfriWeave — Handcrafted Textile Marketplace',
    description: 'An online marketplace connecting local weavers and textile artisans with global buyers. Preserving cultural heritage while creating sustainable income for over 200 artisans across Nigeria.',
    category: 'Fashion & Textile',
    fundingGoal: 8500000,
    currentFunding: 3200000,
    entrepreneurName: 'Adaeze Okafor',
    entrepreneurAvatar: '',
    companyName: 'AfriWeave Ltd.',
    location: 'Lagos',
    createdAt: '2025-01-18',
    tags: ['Fashion', 'Marketplace', 'Artisan', 'Export'],
    stage: 'mvp',
    likes: 312,
    views: 2450,
    image: '',
    verified: true,
  },
  {
    id: '2',
    title: 'MediTrack — AI-Powered Drug Supply Chain',
    description: 'Using blockchain and AI to track pharmaceutical supply chains across Nigeria, reducing counterfeit drugs by 90%. Already piloted in 3 states with NAFDAC partnership.',
    category: 'HealthTech',
    fundingGoal: 12000000,
    currentFunding: 7800000,
    entrepreneurName: 'Dr. Emeka Asante',
    entrepreneurAvatar: '',
    companyName: 'MediTrack Health',
    location: 'Abuja',
    createdAt: '2024-11-20',
    tags: ['AI', 'Blockchain', 'Healthcare', 'Supply Chain'],
    stage: 'growth',
    likes: 412,
    views: 3200,
    image: '',
    verified: true,
  },
  {
    id: '3',
    title: 'FarmLink — Connecting Farmers to Markets',
    description: 'A mobile-first marketplace that connects smallholder farmers directly to retailers and restaurants, eliminating middlemen and increasing farmer income by 40% across the South-West.',
    category: 'AgriTech',
    fundingGoal: 5000000,
    currentFunding: 1450000,
    entrepreneurName: 'Fatima Diallo',
    entrepreneurAvatar: '',
    companyName: 'FarmLink Technologies',
    location: 'Lagos',
    createdAt: '2025-01-05',
    tags: ['Agriculture', 'Marketplace', 'Mobile', 'Impact'],
    stage: 'idea',
    likes: 156,
    views: 980,
    image: '',
    verified: true,
  },
  {
    id: '4',
    title: 'LearnBridge — Adaptive EdTech Platform',
    description: 'AI-driven learning platform that personalizes education for secondary school students in low-bandwidth environments. Works offline and adapts to each student learning pace.',
    category: 'EdTech',
    fundingGoal: 6500000,
    currentFunding: 3900000,
    entrepreneurName: 'James Mwangi',
    entrepreneurAvatar: '',
    companyName: 'LearnBridge Education',
    location: 'Port Harcourt',
    createdAt: '2024-10-28',
    tags: ['Education', 'AI', 'Offline-first', 'Students'],
    stage: 'mvp',
    likes: 389,
    views: 2750,
    image: '',
    verified: true,
  },
  {
    id: '5',
    title: 'PayFlow — Instant Cross-Border Payments',
    description: 'Enabling instant, low-cost cross-border payments using stablecoin rails. Transaction fees 80% lower than traditional remittance services. Licensed by CBN.',
    category: 'FinTech',
    fundingGoal: 25000000,
    currentFunding: 16500000,
    entrepreneurName: 'Nadia Benali',
    entrepreneurAvatar: '',
    companyName: 'PayFlow Finance',
    location: 'Lagos',
    createdAt: '2024-09-15',
    tags: ['Payments', 'Crypto', 'Remittance', 'Cross-border'],
    stage: 'scale',
    likes: 567,
    views: 4100,
    image: '',
    verified: true,
  },
  {
    id: '6',
    title: 'GreenBuild — Sustainable Construction Materials',
    description: 'Manufacturing affordable, eco-friendly building materials from recycled plastic waste. Each home built saves 20 tons of plastic from landfills. Operating in 3 states.',
    category: 'Construction',
    fundingGoal: 15000000,
    currentFunding: 4200000,
    entrepreneurName: 'Tendai Moyo',
    entrepreneurAvatar: '',
    companyName: 'GreenBuild Materials',
    location: 'Ibadan',
    createdAt: '2025-01-12',
    tags: ['Recycling', 'Construction', 'Sustainability', 'Housing'],
    stage: 'idea',
    likes: 198,
    views: 1340,
    image: '',
    verified: true,
  },
  {
    id: '7',
    title: 'AquaPure — Smart Water Purification Systems',
    description: 'IoT-enabled water purification systems for communities without clean water access. Solar-powered, self-monitoring, and costs 70% less than alternatives.',
    category: 'Clean Energy',
    fundingGoal: 9000000,
    currentFunding: 6100000,
    entrepreneurName: 'Blessing Okonkwo',
    entrepreneurAvatar: '',
    companyName: 'AquaPure Systems',
    location: 'Abuja',
    createdAt: '2024-11-01',
    tags: ['Water', 'IoT', 'Solar', 'Community'],
    stage: 'growth',
    likes: 445,
    views: 2980,
    image: '',
    verified: true,
  },
  {
    id: '8',
    title: 'StyleHub — AI Fashion Marketplace',
    description: 'AI-powered fashion marketplace showcasing Nigerian designers to the global market. Virtual try-on technology and personalized styling recommendations for Ankara and Adire.',
    category: 'Fashion & Textile',
    fundingGoal: 7000000,
    currentFunding: 2800000,
    entrepreneurName: 'Zara Mensah',
    entrepreneurAvatar: '',
    companyName: 'StyleHub Africa',
    location: 'Lagos',
    createdAt: '2025-01-20',
    tags: ['Fashion', 'AI', 'E-Commerce', 'Ankara'],
    stage: 'mvp',
    likes: 278,
    views: 1650,
    image: '',
    verified: true,
  },
  {
    id: '9',
    title: 'KekeElectric — Electric Tricycle Fleet',
    description: 'Converting traditional keke napep fleets to electric with battery-swap stations. Reducing emissions and operational costs for drivers by 55% in urban areas.',
    category: 'Clean Energy',
    fundingGoal: 18000000,
    currentFunding: 5400000,
    entrepreneurName: 'Chinedu Okoro',
    entrepreneurAvatar: '',
    companyName: 'KekeElectric Motors',
    location: 'Kano',
    createdAt: '2024-12-05',
    tags: ['EV', 'Transport', 'Sustainability', 'Urban'],
    stage: 'mvp',
    likes: 534,
    views: 3800,
    image: '',
    verified: true,
  },
  {
    id: '10',
    title: 'NaijaFresh — Farm-to-Table Delivery',
    description: 'Cold-chain logistics platform delivering fresh produce from farms to restaurants and homes within 24 hours. Reducing food waste by 60% across the supply chain.',
    category: 'AgriTech',
    fundingGoal: 4500000,
    currentFunding: 1100000,
    entrepreneurName: 'Oluwaseun Adeyemi',
    entrepreneurAvatar: '',
    companyName: 'NaijaFresh Logistics',
    location: 'Lagos',
    createdAt: '2025-01-08',
    tags: ['Logistics', 'Agriculture', 'Cold-chain', 'Delivery'],
    stage: 'idea',
    likes: 201,
    views: 1120,
    image: '',
    verified: true,
  },
  {
    id: '11',
    title: 'AdireGlobal — Premium Textile Export Brand',
    description: 'Luxury fashion brand built on traditional Adire textile techniques. Exporting to 12 countries with partnerships in London, Paris and New York fashion weeks.',
    category: 'Fashion & Textile',
    fundingGoal: 10000000,
    currentFunding: 7200000,
    entrepreneurName: 'Yetunde Bakare',
    entrepreneurAvatar: '',
    companyName: 'AdireGlobal Fashion',
    location: 'Abeokuta',
    createdAt: '2024-10-15',
    tags: ['Fashion', 'Export', 'Luxury', 'Adire'],
    stage: 'growth',
    likes: 623,
    views: 4500,
    image: '',
    verified: true,
  },
  {
    id: '12',
    title: 'CashCrop — Micro-Insurance for Farmers',
    description: 'Weather-indexed micro-insurance platform for smallholder farmers. Using satellite data and AI to automate claims. Protecting over 5,000 farmers across Northern Nigeria.',
    category: 'FinTech',
    fundingGoal: 8000000,
    currentFunding: 3600000,
    entrepreneurName: 'Ibrahim Yusuf',
    entrepreneurAvatar: '',
    companyName: 'CashCrop Insurance',
    location: 'Kaduna',
    createdAt: '2024-12-22',
    tags: ['Insurance', 'Agriculture', 'AI', 'Satellite'],
    stage: 'mvp',
    likes: 345,
    views: 2100,
    image: '',
    verified: true,
  },
];

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isFirstLogin: true,
  pitches: samplePitches,
  searchQuery: '',
  selectedCategory: 'All',
  login: (user, tokens) => {
    if (tokens) setTokens(tokens.access, tokens.refresh);
    set({ user: { ...user, verificationStatus: user.verificationStatus || 'pending' }, isAuthenticated: true, isFirstLogin: true });
  },
  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false, isFirstLogin: true });
  },
  completeOnboarding: () => set({ isFirstLogin: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
