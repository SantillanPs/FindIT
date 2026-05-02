import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { useAuth } from '../context/AuthContext';
import { useMasterData } from '../context/MasterDataContext';
import { 
  Search, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  PlusCircle,
  HelpCircle,
  ShieldAlert,
  Package,
  Trophy,
  GraduationCap,
  Building2,
  X,
  AlertCircle,
  Bell,
  ChevronLeft,
  Share2
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

import { Input } from '../components/ui/input';
import ItemCard from '../components/ItemCard';
import ItemThumb from '../components/ItemThumb';
import LostReportCard from '../components/LostReportCard';
import LostReportThumb from '../components/LostReportThumb';
import WitnessReportModal from '../components/WitnessReportModal';
import ItemDetailsPeek from '../components/ItemDetailsPeek';

const Landing = () => {
  const { user } = useAuth();
  const { categories: CATEGORIES_FROM_MASTER, leaderboard: LEADERBOARD_FROM_MASTER, loading: masterLoading } = useMasterData();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('found');
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [selectedLostReport, setSelectedLostReport] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [heroVisible, setHeroVisible] = useState(true);
  const [peekItem, setPeekItem] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState('students');
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  const heroRef = useRef(null);
  const searchInputRef = useRef(null);
  const stickySearchRef = useRef(null);

  // Hardcoded Configuration
  const SHOW_ANNOUNCEMENT = false;
  const ANNOUNCEMENT_TEXT = "";
  const SUPPORT_EMAIL = "support@findit.edu";
  const HERO_SUBTITLE = "The university's centralized registry for assets. Verify ownership and facilitate secure returns.";

  // IntersectionObserver: detect when hero scrolls out
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  // Identified Items Query (Separate from general items)
  const { data: identifiedItems = [], isLoading: identifiedLoading } = useQuery({
    queryKey: ['identified_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_public_found_items')
        .select('*')
        .eq('is_owner_identified', true)
        .order('date_found', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData,
  });

  // Found Items Query (Focus on General Items)
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['found_items', selectedCategory, searchQuery],
    queryFn: async () => {
      let data, error;

      if (searchQuery && searchQuery.trim().length > 2) {
        // AI-POWERED VECTOR SEARCH
        const { data: embedData, error: embedError } = await supabase.functions.invoke('embed', {
          body: { text: searchQuery }
        });

        if (embedError) {
          const query = supabase
            .from('v_public_found_items')
            .select('*')
            .eq('is_owner_identified', false)
            .ilike('title', `%${searchQuery}%`)
            .order('date_found', { ascending: false })
            .limit(12);
          
          const fallbackRes = await query;
          data = fallbackRes.data;
          error = fallbackRes.error;
        } else {
          const { data: searchData, error: searchError } = await supabase.rpc('match_found_items', {
            query_embedding: embedData.embedding,
            match_threshold: 0.2,
            match_count: 24
          });
          // Filter out identified items from search results
          data = searchData?.filter(item => item.status === 'in_custody' && !item.is_owner_identified).slice(0, 12);
          error = searchError;
        }
      } else {
        // REGULAR FETCH (Latest items from Standardized View)
        let query = supabase
          .from('v_public_found_items')
          .select('*')
          .eq('is_owner_identified', false)
          .order('date_found', { ascending: false });

        if (selectedCategory && selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        const { data: resData, error: resError } = await query.limit(12);
        
        data = resData;
        error = resError;
      }
      
      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData,
  });

  // Simplified derived state
  const generalItems = items;

  // ═══════════════════════════════════════════════
  // INFINITE CAROUSEL LOGIC
  // ═══════════════════════════════════════════════
  useEffect(() => {
    const carousel = document.getElementById('urgent-carousel');
    if (!carousel || identifiedItems.length === 0) return;

    let animationFrameId;
    let lastTime = 0;
    const speed = 0.5; // Pixels per frame

    const animate = (time) => {
      if (lastTime !== 0) {
        const isHovered = carousel.matches(':hover');
        const isManual = carousel.dataset.isScrollingManual === 'true';
        
        if (!isHovered && !isManual) {
          carousel.scrollLeft += speed;
          
          const maxScroll = carousel.scrollWidth / 3;
          
          // Reset for Right-to-Left movement
          if (carousel.scrollLeft >= maxScroll * 2) {
            carousel.scrollLeft -= maxScroll;
          }
          // Reset for Left-to-Right movement (manual)
          if (carousel.scrollLeft <= maxScroll * 0.5) {
            carousel.scrollLeft += maxScroll;
          }
        }
      }
      lastTime = time;
      animationFrameId = requestAnimationFrame(animate);
    };

    const initTimeout = setTimeout(() => {
      carousel.scrollLeft = (carousel.scrollWidth - carousel.clientWidth) / 3;
      animationFrameId = requestAnimationFrame(animate);
    }, 500);

    const handleManualScrollStart = () => { carousel.dataset.isScrollingManual = 'true'; };
    const handleManualScrollEnd = () => { 
      setTimeout(() => {
        delete carousel.dataset.isScrollingManual; 
      }, 1000);
    };

    carousel.addEventListener('touchstart', handleManualScrollStart);
    carousel.addEventListener('touchend', handleManualScrollEnd);
    carousel.addEventListener('mousedown', handleManualScrollStart);
    carousel.addEventListener('mouseup', handleManualScrollEnd);

    return () => {
      clearTimeout(initTimeout);
      cancelAnimationFrame(animationFrameId);
      carousel.removeEventListener('touchstart', handleManualScrollStart);
      carousel.removeEventListener('touchend', handleManualScrollEnd);
      carousel.removeEventListener('mousedown', handleManualScrollStart);
      carousel.removeEventListener('mouseup', handleManualScrollEnd);
    };
  }, [identifiedItems.length]);

  // Lost Reports Query
  const { data: lostReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['lost_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_public_lost_items')
        .select('*')
        .limit(12);

      if (error) throw error;
      console.info(`[Query] Lost Reports [Source: Standardized View]:`, data?.length || 0, 'records');
      return data || [];
    },
    placeholderData: keepPreviousData,
  });


  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleShare = (item) => {
    const text = `I found a ${item.title} on FindIT! If this is yours, you can claim it here.`;
    const url = window.location.origin + `/submit-claim/${item.id}`;
    
    if (navigator.share) {
      navigator.share({ title: 'FindIT | Item Found', text, url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      showToast('Link copied to clipboard');
    }
  };

  const filteredItems = generalItems;
  const filteredLostReports = lostReports;
  const isLoading = activeTab === 'found' ? itemsLoading : reportsLoading;
  const currentItems = activeTab === 'found' ? filteredItems : filteredLostReports;

  return (
    <div className="landing-page space-y-0 pb-20 relative overflow-hidden min-h-screen text-white">
      {/* Dynamic System Banner */}
      {SHOW_ANNOUNCEMENT && ANNOUNCEMENT_TEXT && (
        <div className="relative z-[100] bg-rose-600 border-b border-rose-500/20 py-3 px-6 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <ShieldAlert className="h-4 w-4 text-white animate-pulse" />
            <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.2em]">
              {ANNOUNCEMENT_TEXT}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Ambient Background Elements */}
      <div className="lt-ambient absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent"></div>
      <div className="lt-ambient absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-sky-500/5 rounded-full pointer-events-none"></div>

      {/* ═══════════════════════════════════════════════
          HERO SECTION (Collapsible)
          Mobile: Compact ~180px
          Desktop: Slightly reduced from original
          ═══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative pt-8 pb-6 md:pt-0 md:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center px-6 relative z-10">
          
          {/* Mobile: compact single-line title */}
          <h1 id="tour-welcome" className="text-4xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tighter leading-[0.85] uppercase mb-4 md:mb-8">
            Lost it? {' '}
            <span className="lt-gradient bg-gradient-to-br from-white via-white/80 to-slate-500 bg-clip-text text-transparent">Find it.</span>
          </h1>
          
          {/* Subtitle — hidden on mobile */}
          <p className="hidden md:block text-sm md:text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium uppercase tracking-widest opacity-80">
            {HERO_SUBTITLE}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row justify-center gap-2 md:gap-4 mx-auto">
            <Button 
                id="tour-report-missing"
                onClick={() => navigate(user ? '/report/lost' : '/report-lost-guest')}
                className="lt-cta duration-0 h-9 md:h-12 px-3 md:px-8 gap-1 md:gap-1.5 rounded-lg md:rounded-xl font-bold text-[9px] md:text-[11px] uppercase tracking-[0.1em] md:tracking-[0.2em] bg-white hover:bg-slate-200 text-black shadow-xl shadow-sky-500/10 group whitespace-nowrap"
            >
                Report Missing
                <PlusCircle className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0 group-hover:scale-110 transition-transform" />
            </Button>
            <Button 
                id="tour-report-found"
                variant="outline"
                onClick={() => navigate(user ? '/report/found' : '/report-found-guest')}
                className="lt-outline duration-0 h-9 md:h-12 px-3 md:px-8 gap-1 md:gap-1.5 rounded-lg md:rounded-xl font-bold text-[9px] md:text-[11px] uppercase tracking-[0.1em] md:tracking-[0.2em] border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white group whitespace-nowrap"
            >
                Found Something
                <ChevronRight className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Inline search on hero (mobile only) */}
          <div className="mt-4 md:hidden relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
            <Input 
              type="text" 
              placeholder="Search items..." 
              className="lt-surface h-10 pl-10 pr-4 rounded-xl border-white/10 bg-slate-900/60 backdrop-blur-xl text-sm font-medium tracking-tight focus-visible:ring-sky-500/30 placeholder:text-slate-600 shadow-xl w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          LEADERBOARD TOGGLE BUTTON (top-right, below navbar)
          z-index jumps above drawer when open so it's always clickable
          ═══════════════════════════════════════════════ */}
      <button
        id="tour-leaderboard"
        onClick={() => setShowLeaderboard(prev => !prev)}
        className={`lt-surface fixed right-3 md:right-6 flex items-center gap-2 h-9 px-3 md:px-4 rounded-xl border backdrop-blur-xl shadow-lg transition-all group ${
          showLeaderboard 
            ? 'z-[202] border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20' 
            : 'z-[54] border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-white/10 hover:border-sky-500/30'
        }`}
        style={{ top: 'calc(var(--navbar-height) + 0.75rem)' }}
        title={showLeaderboard ? 'Close Honor Roll' : 'View Honor Roll'}
      >
        {showLeaderboard ? (
          <X className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        ) : (
          <Trophy className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        )}
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] hidden md:inline">
          {showLeaderboard ? 'Close' : 'Honor Roll'}
        </span>
      </button>

      {/* ═══════════════════════════════════════════════
          STICKY COMMAND BAR (appears when hero scrolls away)
          ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {!heroVisible && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lt-command-bar fixed left-0 right-0 z-[55] border-b border-white/5 bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-black/20"
            style={{ top: 'var(--navbar-height)' }}
          >
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                <Input 
                  ref={stickySearchRef}
                  type="text" 
                  placeholder="Search..." 
                  className="h-9 pl-9 pr-3 rounded-lg border-white/10 bg-white/5 text-sm font-medium tracking-tight focus-visible:ring-sky-500/30 placeholder:text-slate-600 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* CTAs */}
              <Button 
                size="sm"
                onClick={() => navigate(user ? '/report/lost' : '/report-lost-guest')}
                className="lt-cta h-9 px-4 rounded-lg font-bold text-[9px] uppercase tracking-[0.15em] bg-white hover:bg-slate-200 text-black shrink-0 hidden sm:flex"
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Report
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => navigate(user ? '/report/found' : '/report-found-guest')}
                className="lt-outline h-9 px-4 rounded-lg font-bold text-[9px] uppercase tracking-[0.15em] border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0 hidden sm:flex"
              >
                Found
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          UNIFIED FEED SECTION (Tabs + Grid)
          ═══════════════════════════════════════════════ */}
      <section id="browse" className="lt-divider py-4 md:py-12 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-4 md:space-y-10">

          {/* ═══════════════════════════════════════════════
              PUBLIC ANNOUNCEMENTS SECTION
              Community bulletin for identified-owner items
              ═══════════════════════════════════════════════ */}
          <AnimatePresence>
            {identifiedItems.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mb-8"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                      <Bell className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-emerald-400 uppercase tracking-[0.3em] italic">
                        📢 Public Announcements
                      </h2>
                      <div className="h-px w-32 bg-gradient-to-r from-emerald-500/30 to-transparent mt-1"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      {identifiedItems.length} {identifiedItems.length === 1 ? 'Item' : 'Items'}
                    </span>
                    <button 
                      onClick={() => navigate('/announcements')}
                      className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors flex items-center gap-1 group"
                    >
                      View All
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Announcement Carousel */}
                <Carousel 
                  opts={{ align: "start", loop: true }}
                  plugins={[
                    AutoScroll({
                      speed: 1,
                      startDelay: 500,
                      direction: "forward",
                      stopOnInteraction: false,
                    })
                  ]}
                  className="w-full relative group"
                >
                  <CarouselContent className="-ml-4">
                    {identifiedItems.map((item, idx) => {
                      // Relative time calculation
                      const getTimeAgo = () => {
                        if (!item.created_at) return null;
                        const diffMs = Date.now() - new Date(item.created_at).getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);
                        if (diffMins < 60) return `${diffMins}m ago`;
                        if (diffHours < 24) return `${diffHours}h ago`;
                        if (diffDays === 1) return 'Yesterday';
                        if (diffDays < 7) return `${diffDays}d ago`;
                        return `${Math.floor(diffDays / 7)}w ago`;
                      };
                      const timeAgo = getTimeAgo();

                      return (
                        <CarouselItem key={`${item.id}-${idx}`} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                          <div className="relative group/card cursor-pointer h-full" onClick={() => setPeekItem(item)}>
                            {/* Glow */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl blur opacity-20 group-hover/card:opacity-40 transition duration-500"></div>
                            
                            <div className="relative lt-surface flex flex-col p-4 rounded-2xl border border-emerald-500/30 bg-slate-900/60 backdrop-blur-xl h-full">
                              {/* Top Row: Image + Info */}
                              <div className="flex items-start gap-4">
                                {/* Thumbnail */}
                                <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-slate-950 shadow-2xl">
                                  <img 
                                    src={item.photo_thumbnail_url || item.photo_url} 
                                    alt={item.title}
                                    loading="lazy"
                                    className="h-full w-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                                  />
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em]">
                                      📢 Owner Identified
                                    </span>
                                    {timeAgo && (
                                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                                        {timeAgo}
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-sm font-black text-white truncate leading-tight uppercase tracking-tight italic">
                                    {item.identified_name || 'Registered Member'}
                                  </h3>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">
                                    {item.title || item.category}
                                  </p>
                                  {item.identified_student_id_masked && (
                                    <div className="flex items-center gap-1.5">
                                      <GraduationCap className="h-3 w-3 text-sky-400 shrink-0" />
                                      <p className="text-[9px] font-bold text-sky-400 tracking-tight uppercase">
                                        ID: <span className="text-white font-black">{item.identified_student_id_masked}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Bottom: Location + CTA */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <AlertCircle className="h-3 w-3 text-emerald-500/60" />
                                  <span className="text-[8px] font-bold uppercase tracking-widest">Claim at USG Office</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShare(item);
                                    }}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                    title="Share Announcement"
                                  >
                                    <Share2 className="h-3.5 w-3.5" />
                                  </button>
                                  <div className="text-emerald-500/30 group-hover/card:text-emerald-400 transition-colors">
                                    <ChevronRight size={16} />
                                  </div>
                                </div>
                              </div>

                              {/* Community Message */}
                              <p className="text-[8px] text-slate-600 italic mt-2 leading-relaxed">
                                If this is you, claim it. If you know them, tell them.
                              </p>
                            </div>
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  
                  {/* Controls */}
                  <div className="absolute top-1/2 -left-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <CarouselPrevious className="h-10 w-10 bg-slate-950/80 border-white/10 text-white hover:bg-emerald-500 hover:text-white rounded-xl shadow-2xl" />
                  </div>
                  <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <CarouselNext className="h-10 w-10 bg-slate-950/80 border-white/10 text-white hover:bg-emerald-500 hover:text-white rounded-xl shadow-2xl" />
                  </div>
                </Carousel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Switcher + Desktop Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8">
            {/* Tabs */}
            <div id="tour-feed" className="lt-tabs flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-full md:w-auto backdrop-blur-md">
              <button
                onClick={() => setActiveTab('found')}
                className={`flex-1 md:flex-none h-10 px-5 md:px-8 rounded-lg font-bold text-[10px] md:text-[11px] uppercase tracking-[0.15em] transition-all ${
                  activeTab === 'found'
                    ? 'lt-tab-active bg-white text-black shadow-lg'
                    : 'lt-muted text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Package className="inline-block h-3.5 w-3.5 mr-2 -mt-0.5" />
                Found Items
              </button>
              <button
                onClick={() => setActiveTab('lost')}
                className={`flex-1 md:flex-none h-10 px-5 md:px-8 rounded-lg font-bold text-[10px] md:text-[11px] uppercase tracking-[0.15em] transition-all ${
                  activeTab === 'lost'
                    ? 'lt-tab-active bg-white text-black shadow-lg'
                    : 'lt-muted text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Search className="inline-block h-3.5 w-3.5 mr-2 -mt-0.5" />
                Lost Reports
              </button>
            </div>

            {/* Desktop Search */}
            <div id="tour-search" className="hidden md:block relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
              <Input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search inventory..." 
                className="lt-surface h-12 pl-11 pr-4 rounded-xl border-white/10 bg-slate-900/40 backdrop-blur-xl text-sm font-bold uppercase tracking-tight focus-visible:ring-sky-500/30 placeholder:text-slate-600 shadow-xl w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter Pills (Found tab only) */}
          {activeTab === 'found' && (
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2 mask-horizontal-fade">
              <Button 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className={`h-9 md:h-11 px-4 md:px-8 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] italic shrink-0 border ${
                  selectedCategory === 'all' 
                  ? 'bg-white text-black border-transparent shadow-xl' 
                  : 'lt-pill bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                All Items
              </Button>
              
              {(CATEGORIES_FROM_MASTER || []).map(cat => (
                 <Button 
                   key={cat.id}
                   variant={selectedCategory === cat.id ? 'default' : 'outline'}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`h-9 md:h-11 px-4 md:px-8 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] shrink-0 border ${
                     selectedCategory === cat.id 
                     ? 'bg-white text-black border-transparent shadow-xl' 
                     : 'lt-pill bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                   }`}
                 >
                   {cat.label}
                 </Button>
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              ITEM GRID
              Mobile: 2-col Instagram thumbnails
              Desktop: 3-col full cards (found) / 4-col (lost)
              ═══════════════════════════════════════════════ */}
          {isLoading && currentItems.length === 0 ? (
            <>
              {/* Mobile skeletons */}
              <div className="grid grid-cols-2 gap-2 md:hidden">
                {[1,2,3,4,5,6].map(i => <div key={i} className="lt-skeleton aspect-square bg-white/5 animate-pulse rounded-2xl border border-white/5"></div>)}
              </div>
              {/* Desktop skeletons */}
              <div className="hidden md:grid grid-cols-3 gap-10">
                {[1,2,3].map(i => <div key={i} className="lt-skeleton h-80 bg-white/5 animate-pulse rounded-[2rem] border border-white/5"></div>)}
              </div>
            </>
          ) : currentItems.length === 0 ? (
            <Card className="lt-surface py-16 md:py-24 text-center border border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-2xl md:rounded-[3rem]">
              <div className="max-w-md mx-auto px-6 space-y-6">
                <Search className="h-8 w-8 text-slate-500 mx-auto" />
                <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">
                  {activeTab === 'found' ? 'No found items' : 'No lost reports'}
                </h3>
                <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic">
                  {activeTab === 'found' ? 'Adjust your search or category filters.' : 'No active lost reports currently listed.'}
                </p>
              </div>
            </Card>
          ) : activeTab === 'found' ? (
            <>
              {/* MOBILE: Instagram 2-col grid */}
              <div className="grid grid-cols-2 gap-2 md:hidden">
                {filteredItems.map(item => (
                  <ItemThumb 
                    key={item.id} 
                    item={item} 
                    onClick={() => setPeekItem(item)}
                  />
                ))}
              </div>
              {/* DESKTOP: Full cards grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onClick={() => setPeekItem(item)}
                    onShare={handleShare}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* MOBILE: Instagram 2-col grid for lost reports */}
              <div className="grid grid-cols-2 gap-2 md:hidden">
                {filteredLostReports.map(report => (
                  <LostReportThumb 
                    key={report.id} 
                    report={report} 
                    onClick={() => {
                      setSelectedLostReport(report);
                      setShowWitnessModal(true);
                    }}
                  />
                ))}
              </div>
              {/* DESKTOP: Full cards grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredLostReports.map((report) => (
                  <LostReportCard 
                    key={report.id} 
                    report={report} 
                    onWitness={(r) => {
                      setSelectedLostReport(r);
                      setShowWitnessModal(true);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>


      {/* Premium Toast Container */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="lt-toast border border-white/10 bg-slate-900/90 backdrop-blur-xl text-white px-8 py-4 rounded-full flex items-center space-x-4 shadow-2xl">
            <CheckCircle2 className="h-5 w-5 text-sky-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Witness Report Modal */}
      <WitnessReportModal
        isOpen={showWitnessModal}
        onClose={() => setShowWitnessModal(false)}
        report={selectedLostReport}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Item Detail Peek (Mobile thumbs tap target) */}
      <AnimatePresence>
        {peekItem && (
          <ItemDetailsPeek 
            item={peekItem}
            isOpen={!!peekItem}
            onClose={() => setPeekItem(null)}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          LEADERBOARD RIGHT DRAWER (CSS transitions, no AnimatePresence)
          ═══════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div 
        onClick={() => setShowLeaderboard(false)}
        className={`fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          showLeaderboard ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Panel */}
      <div
        className={`lt-surface fixed right-0 bottom-0 z-[201] w-full max-w-sm md:max-w-md border-l border-white/10 bg-slate-900/98 backdrop-blur-md shadow-2xl overflow-y-auto transition-transform duration-300 ease-out custom-scrollbar ${
          showLeaderboard ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: 'var(--navbar-height)' }}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 py-4 md:py-5 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-white tracking-tight uppercase leading-none">Honor Roll</h2>
              <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Community Rankings</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 md:px-6 pt-4 md:pt-5">
          <div className="lt-tabs flex gap-0.5 p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setLeaderboardType('students')}
              className={`flex-1 h-8 md:h-9 rounded-lg font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                leaderboardType === 'students' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              <GraduationCap className="h-3 w-3 md:h-3.5 md:w-3.5" />
              Users
            </button>
            <button
              onClick={() => setLeaderboardType('colleges')}
              className={`flex-1 h-8 md:h-9 rounded-lg font-bold text-[9px] md:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                leaderboardType === 'colleges' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Building2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
              Groups
            </button>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="px-4 md:px-6 py-3 md:py-4 space-y-1">
          {!masterLoading && leaderboardType === 'students' ? (
            LEADERBOARD_FROM_MASTER?.students?.slice(0, showFullLeaderboard ? 10 : 5).map((student, i) => (
              <div key={i} className="lt-row flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 group transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold ${
                    i === 0 ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 
                    i === 1 ? 'bg-slate-400/10 text-slate-300 border border-slate-400/30' :
                    i === 2 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                    'bg-white/5 text-slate-500 border border-white/5'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-[10px] md:text-[11px] font-bold text-white tracking-wider uppercase group-hover:text-sky-400 truncate">
                      {student.full_name_masked}
                    </p>
                    <p className="text-[8px] font-medium text-slate-500 uppercase tracking-widest mt-0.5 truncate">
                      {student.department || 'General Education'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <p className="text-[9px] font-bold text-white tracking-[0.15em] uppercase">{student.integrity_points} <span className="text-slate-500 font-medium">IP</span></p>
                  <span className="text-sm">
                    {i === 0 ? '👑' : i === 1 ? '💎' : i === 2 ? '⚡' : i === 3 ? '🛡️' : '✨'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            LEADERBOARD_FROM_MASTER?.departments?.slice(0, showFullLeaderboard ? 10 : 5).map((col, i) => (
              <div key={i} className="lt-row flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 group transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold ${
                    i === 0 ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 
                    i === 1 ? 'bg-slate-400/10 text-slate-300 border border-slate-400/30' :
                    i === 2 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                    'bg-white/5 text-slate-500 border border-white/5'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-[10px] md:text-[11px] font-bold text-white tracking-wider uppercase group-hover:text-sky-400 line-clamp-2 leading-tight">
                      {col.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <p className="text-[9px] font-bold text-sky-400 tracking-[0.15em] uppercase">{col.total_points} <span className="text-slate-500 font-medium">IP</span></p>
                  <Building2 className="h-3.5 w-3.5 text-slate-700 group-hover:text-slate-500" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show More/Less */}
        {(leaderboardType === 'students' ? LEADERBOARD_FROM_MASTER?.students : LEADERBOARD_FROM_MASTER?.departments)?.length > 5 && (
          <div className="px-4 md:px-6 pb-6">
            <button
              onClick={() => setShowFullLeaderboard(!showFullLeaderboard)}
              className="w-full h-9 md:h-10 rounded-xl border border-white/5 bg-white/5 text-slate-500 hover:text-white font-bold text-[8px] md:text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors"
            >
              {showFullLeaderboard ? (
                <>Show Less <ChevronUp className="h-3 w-3 md:h-3.5 md:w-3.5" /></>
              ) : (
                <>Show All <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
