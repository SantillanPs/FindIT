import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useMasterData } from '../context/MasterDataContext';
import { 
  Trophy, 
  Bell, 
  Search, 
  Users, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  MapPin, 
  Clock, 
  Share2, 
  CheckCircle2,
  Building2,
  GraduationCap,
  IdCard,
  User,
  Send,
  PlusCircle,
  HelpCircle,
  ShieldAlert,
  Settings,
  LayoutGrid,
  PieChart as PieChartIcon,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import ItemCard from '../components/ItemCard';
import LostReportCard from '../components/LostReportCard';
import { motion, AnimatePresence } from 'framer-motion';
import WitnessReportModal from '../components/WitnessReportModal';

const Landing = () => {
  const { user } = useAuth();
  const { categories: CATEGORIES_FROM_MASTER, leaderboard: LEADERBOARD_FROM_MASTER, loading: masterLoading } = useMasterData();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [leaderboardType, setLeaderboardType] = useState('students');
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [selectedLostReport, setSelectedLostReport] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = React.useRef(null);

  // 1. Site Config Query
  const { data: siteConfig } = useQuery({
    queryKey: ['site_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configs')
        .select('*')
        .eq('id', 'main')
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  // 2. Found Items Query (Includes AI Search)
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
            match_count: 24 // Fetch more to allow for filtering
          });
          data = searchData?.filter(item => item.status === 'in_custody').slice(0, 12);
          error = searchError;
        }
      } else {
        // REGULAR FETCH (Latest items from Standardized View)
        let query = supabase
          .from('v_public_found_items')
          .select('*')
          .order('date_found', { ascending: false });

        if (selectedCategory && selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        const { data: resData, error: resError } = await query.limit(12);
        
        // Data Mapping (Simplified: Uses SQL-masked fields)
        data = (resData || []).map(item => ({
          ...item,
          identified_student_id: item.identified_student_id_masked
        }));
        error = resError;
      }
      
      if (error) throw error;
      console.info(`[Query] Found Items [Source: Standardized View]:`, data?.length || 0, 'records');
      return data || [];
    },
    placeholderData: keepPreviousData,
  });

  // 3. Lost Reports Query
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

  const filteredItems = items;
  const filteredLostReports = lostReports;

  return (
    <div className="space-y-10 md:space-y-24 pb-20 relative overflow-hidden min-h-screen text-white">
      {/* Dynamic System Banner */}
      {siteConfig?.show_announcement && siteConfig?.announcement_text && (
        <div className="relative z-[100] bg-rose-600 border-b border-rose-500/20 py-3 px-6 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <ShieldAlert className="h-4 w-4 text-white animate-pulse" />
            <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.2em]">
              {siteConfig.announcement_text}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-sky-500/5 rounded-full pointer-events-none"></div>




      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-0 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center px-6 relative z-10">
          
          <h1 className="text-6xl md:text-9xl lg:text-[11rem] font-extrabold text-white tracking-tighter leading-[0.8] uppercase mb-8 md:mb-12">
            {siteConfig?.hero_title ? (
              <>
                {siteConfig.hero_title.split('?')[0]}? <br />
                <span className="bg-gradient-to-br from-white via-white/80 to-slate-500 bg-clip-text text-transparent">
                  {siteConfig.hero_title.split('?')[1] || 'Found it.'}
                </span>
              </>
            ) : (
              <>
                Lost it? <br />
                <span className="bg-gradient-to-br from-white via-white/80 to-slate-500 bg-clip-text text-transparent">Find it.</span>
              </>
            )}
          </h1>
          
          <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto mb-12 md:mb-24 leading-relaxed font-medium uppercase tracking-widest opacity-80">
            {siteConfig?.hero_subtitle || "The university's centralized registry for assets. Authorize access and facilitate secure returns."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 md:gap-10 max-w-2xl mx-auto">
            <Button 
                size="lg"
                onClick={() => navigate(user ? '/report/lost' : '/report-lost-guest')}
                className="h-14 md:h-16 px-8 md:px-14 rounded-2xl font-bold text-xs md:text-sm uppercase tracking-[0.2em] bg-white hover:bg-slate-200 text-black shadow-2xl shadow-sky-500/10 transition-all group"
            >
                Report Missing
                <PlusCircle className="ml-3 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
            </Button>
            <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate(user ? '/report/found' : '/report-found-guest')}
                className="h-14 md:h-16 px-8 md:px-14 rounded-2xl font-bold text-xs md:text-sm uppercase tracking-[0.2em] border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white transition-all group"
            >
                Found Something
                <ChevronRight className="ml-3 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Identified Items Section */}
      {siteConfig?.show_identified !== false && items.some(i => i.identified_name || i.identified_student_id) && !itemsLoading && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24">
          <div className="flex items-center gap-6 mb-16 px-4 md:px-0">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-white/5 flex items-center justify-center text-sky-400">
              <Bell className="h-8 w-8" />
            </div>
            <div className="text-left">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter uppercase leading-none">Identified Items</h2>
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mt-3">Account authorization pending</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x px-6 md:px-0 mask-horizontal-fade">
            {items.filter(i => i.identified_name || i.identified_student_id).map(item => (
              <Card 
                key={item.id}
                className="min-w-[320px] md:min-w-[460px] snap-start border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden flex flex-col relative group transition-all duration-500"
              >
                <div className="absolute top-6 left-6 z-10">
                   <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-white/10 bg-black/60 backdrop-blur-md">
                      <IdCard className="h-3 w-3 text-sky-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Identity Linked</span>
                   </div>
                </div>
                
                 <div className="aspect-[16/9] md:h-60 bg-slate-950/50 flex items-center justify-center relative overflow-hidden">
                    {item.photo_url ? (
                      <img 
                        src={item.photo_thumbnail_url || item.photo_url} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        alt="" 
                        loading="lazy"
                      />
                    ) : (
                      <User className="h-16 w-16 text-slate-500/20" />
                    )}
                 </div>

                 <CardContent className="p-8 text-left space-y-6 flex-grow">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Identified Owner:</p>
                       <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight uppercase line-clamp-1">
                         {item.identified_name || `ID: ${item.identified_student_id}`}
                       </h3>
                    </div>
  
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed line-clamp-2 font-medium italic">
                      A <span className="text-white font-bold">{item.title}</span> recovered at <span className="text-sky-400 font-bold">{item.location}</span>.
                    </p>

                   <div className="pt-8 border-t border-white/5 flex gap-4">
                      <Button 
                         onClick={() => navigate(`/submit-claim/${item.id}`)}
                         className="flex-grow h-14 font-black text-[10px] tracking-[0.2em] uppercase italic bg-white hover:bg-slate-200 text-black rounded-xl"
                      >
                         Claim Item
                      </Button>
                      <Button 
                         variant="outline"
                         onClick={() => handleShare(item)}
                         className="w-14 h-14 p-0 rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
                      >
                         <Send className="h-4 w-4 text-slate-400" />
                      </Button>
                   </div>
                 </CardContent>
               </Card>
            ))}
          </div>
        </section>
      )}

      {/* Community Honor Roll (Leaderboard) */}
      {siteConfig?.show_leaderboard !== false && (
        <section className="relative py-12 md:py-16 overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 md:gap-24">
            <div className="lg:w-1/2 space-y-10 text-left">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-sky-500/30 bg-sky-500/5 backdrop-blur-md">
                <Trophy className="h-3 w-3 text-sky-400" />
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic">Honor System Active</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter leading-[0.85] uppercase">
                 Community <br/><span className="bg-gradient-to-br from-white via-white/80 to-slate-500 bg-clip-text text-transparent">Honor Roll</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed max-w-lg italic opacity-80 uppercase tracking-wider">
                  Returning lost items is a signal of character. Our community thrives through individual integrity.
              </p>
              
              <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit backdrop-blur-md">
                  <Button 
                      variant={leaderboardType === 'students' ? 'default' : 'ghost'}
                      onClick={() => setLeaderboardType('students')}
                      className={`rounded-xl px-5 font-bold text-[10px] uppercase tracking-widest h-11 ${leaderboardType === 'students' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
                  >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Contributors
                  </Button>
                  <Button 
                      variant={leaderboardType === 'colleges' ? 'default' : 'ghost'}
                      onClick={() => setLeaderboardType('colleges')}
                      className={`rounded-xl px-5 font-bold text-[10px] uppercase tracking-widest h-11 ${leaderboardType === 'colleges' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
                  >
                      <Building2 className="h-4 w-4 mr-2" />
                      Colleges
                  </Button>
              </div>
            </div>

            <div className="lg:w-1/2 w-full relative">
              <Card className="p-2 md:p-6 border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                  <div className="space-y-2">
                      {!masterLoading && leaderboardType === 'students' ? (
                          LEADERBOARD_FROM_MASTER?.students?.slice(0, showFullLeaderboard ? 10 : 3).map((student, i) => (
                              <div key={i} className="flex items-center justify-between p-3.5 md:p-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all duration-300 group">
                                  <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                                          i === 0 ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 
                                          i === 1 ? 'bg-slate-400/10 text-slate-300 border border-slate-400/30' :
                                          i === 2 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                                          'bg-white/5 text-slate-500 border border-white/5'
                                      }`}>
                                          <span>{i + 1}</span>
                                      </div>
                                      <div className="text-left min-w-0 flex-1">
                                          <p className="text-[12px] md:text-[13px] font-bold text-white tracking-wider uppercase group-hover:text-sky-400 transition-colors truncate">
                                              {student.full_name_masked}
                                          </p>
                                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1 truncate">
                                              {student.department || 'General Education'}
                                          </p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4 md:gap-6 shrink-0 ml-4">
                                      <p className="text-[11px] md:text-[12px] font-bold text-white tracking-[0.2em] uppercase">{student.integrity_points} <span className="text-slate-500 font-medium">IP</span></p>
                                      <span className="text-xl group-hover:scale-110 transition-transform duration-300 flex items-center justify-center w-6">
                                          {i === 0 ? '👑' : i === 1 ? '💎' : i === 2 ? '⚡' : i === 3 ? '🛡️' : '✨'}
                                      </span>
                                  </div>
                              </div>
                          ))
                      ) : (
                          LEADERBOARD_FROM_MASTER?.departments?.slice(0, showFullLeaderboard ? 10 : 3).map((col, i) => (
                              <div key={i} className="flex items-center justify-between p-3.5 md:p-4 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/5 transition-all duration-300 group">
                                  <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                                          i === 0 ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 
                                          i === 1 ? 'bg-slate-400/10 text-slate-300 border border-slate-400/30' :
                                          i === 2 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                                          'bg-white/5 text-slate-500 border border-white/5'
                                      }`}>
                                          <span>{i + 1}</span>
                                      </div>
                                      <div className="text-left min-w-0 flex-1">
                                          <p className="text-[12px] md:text-[13px] font-bold text-white tracking-wider uppercase group-hover:text-sky-400 transition-colors line-clamp-2 leading-tight">
                                              {col.department}
                                          </p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4 md:gap-6 shrink-0 ml-4">
                                      <p className="text-[11px] md:text-[12px] font-bold text-sky-400 tracking-[0.2em] uppercase">{col.total_points} <span className="text-slate-500 font-medium">IP</span></p>
                                      <Building2 className="h-5 w-5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
                  {(leaderboardType === 'students' ? LEADERBOARD_FROM_MASTER?.students : LEADERBOARD_FROM_MASTER?.departments)?.length > 3 && (
                      <div className="border-t border-white/5">
                          <Button 
                              variant="ghost" 
                              onClick={() => setShowFullLeaderboard(!showFullLeaderboard)}
                              className="w-full h-12 text-slate-500 hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-all group"
                          >
                              {showFullLeaderboard ? (
                                  <>
                                      Show Only Top 3 <ChevronUp className="ml-2 h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                                  </>
                              ) : (
                                  <>
                                      Show All Rankings <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
                                  </>
                              )}
                          </Button>
                      </div>
                  )}
              </Card>
            </div>
          </div>
        </div>
      </section>
      )}



      {/* Public Registry Section */}
      <section id="browse" className="py-12 md:py-20 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-24 border-b border-white/5 pb-16 md:pb-24">
             <div className="text-left space-y-6">
                <div className="flex items-center gap-6">
                  <h2 className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter uppercase leading-none">Public Registry</h2>
                  <div className="py-2 px-6 rounded-full border border-sky-500/30 bg-sky-500/5 backdrop-blur-md hidden md:flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic">Live Records</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm md:text-lg font-medium italic uppercase tracking-wider opacity-80">A catalog of all items recovered across campus</p>
             </div>
             
             <div className="w-full md:w-auto flex justify-start md:justify-end">
                <AnimatePresence mode="wait">
                  {!isSearchExpanded && searchQuery === '' ? (
                    <motion.div
                      key="search-button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Button
                        onClick={() => {
                          setIsSearchExpanded(true);
                          setTimeout(() => searchInputRef.current?.focus(), 100);
                        }}
                        className="h-12 md:h-14 px-6 md:px-8 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:bg-white/5 transition-all shadow-2xl flex items-center gap-4 group"
                      >
                        <Search className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                        <span>Search Inventory</span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search-input"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : '460px', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="relative group"
                    >
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-sky-400 transition-colors z-20" />
                      <Input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Search inventory..." 
                        className="h-12 md:h-14 pl-12 pr-10 rounded-2xl border-white/10 bg-slate-900/40 backdrop-blur-xl text-sm font-bold uppercase tracking-tight focus-visible:ring-sky-500/30 placeholder:text-slate-600 shadow-2xl w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => {
                          if (searchQuery === '') setIsSearchExpanded(false);
                        }}
                      />
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchExpanded(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors z-20"
                      >
                        <X className="h-4 w-4 text-slate-500 hover:text-white" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-6 mask-horizontal-fade">
             <Button 
               variant={selectedCategory === 'all' ? 'default' : 'outline'}
               onClick={() => setSelectedCategory('all')}
               className={`h-11 md:h-14 px-8 md:px-12 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic transition-all shrink-0 border ${
                 selectedCategory === 'all' 
                 ? 'bg-white text-black border-transparent shadow-xl' 
                 : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
               }`}
             >
               All Items
             </Button>
             
             {(CATEGORIES_FROM_MASTER || []).map(cat => (
                <Button 
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`h-11 md:h-14 px-8 md:px-12 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] transition-all shrink-0 border ${
                    selectedCategory === cat.id 
                    ? 'bg-white text-black border-transparent shadow-xl' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat.label}
                </Button>
             ))}
          </div>

          {itemsLoading && items.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                  {[1,2,3].map(i => <div key={i} className="h-80 bg-white/5 animate-pulse rounded-[2rem] border border-white/5"></div>)}
              </div>
          ) : filteredItems.length === 0 ? (
              <Card className="py-24 md:py-40 text-center border border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-[3rem]">
                  <div className="max-w-md mx-auto px-6 space-y-10">
                    <Search className="h-10 w-10 text-slate-500 mx-auto" />
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">No matching records</h3>
                    <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic">Adjust your search or category filters.</p>
                  </div>
              </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                {filteredItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onClick={() => navigate(`/submit-claim/${item.id}`)}
                    onShare={handleShare}
                  />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Public Lost Reports Section */}
      <section id="lost-reports" className="py-12 md:py-20 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-24">
            <div className="text-left space-y-6">
              <div className="flex items-center gap-6">
                <h2 className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter uppercase leading-none">Lost Reports</h2>
                <div className="py-2 px-6 rounded-full border border-rose-500/30 bg-rose-500/5 backdrop-blur-md hidden md:flex items-center gap-3">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Missing Assets</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm md:text-lg font-medium italic uppercase tracking-wider opacity-80">Community records of items currently missing</p>
            </div>
          </div>

          {reportsLoading && lostReports.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/5"></div>)}
            </div>
          ) : filteredLostReports.length === 0 ? (
             <Card className="py-24 md:py-40 text-center border border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-[3rem]">
                <div className="max-w-md mx-auto px-6 space-y-8">
                   <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">All Clear</h3>
                   <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic">No active lost reports currently listed.</p>
                </div>
             </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
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
          )}
        </div>
      </section>

      {/* Help Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 text-center border-t border-white/5">
         <div className="max-w-4xl mx-auto space-y-16">
            <div className="inline-flex items-center gap-4 py-2 px-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
               <HelpCircle className="h-4 w-4 text-slate-500" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expert Support</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter uppercase leading-none">Need Assistance?</h2>
            <p className="text-slate-400 text-sm md:text-xl font-medium italic uppercase tracking-widest opacity-80 leading-relaxed max-w-2xl mx-auto">
               Our staff is trained to facilitate efficient recovery. Reach out for institutional support.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-8 md:gap-12">
               <a href={`mailto:${siteConfig?.support_email || 'support@findit.edu'}`} className="h-14 px-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center gap-4 group transition-all hover:bg-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Contact Staff</span>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition-all" />
               </a>
            </div>
         </div>
      </section>

      {/* Premium Toast Container */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="border border-white/10 bg-slate-900/90 backdrop-blur-xl text-white px-8 py-4 rounded-full flex items-center space-x-4 shadow-2xl">
            <CheckCircle2 className="h-5 w-5 text-sky-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{toast.message}</p>
          </div>
        </div>
      )}

      <WitnessReportModal
        isOpen={showWitnessModal}
        onClose={() => setShowWitnessModal(false)}
        report={selectedLostReport}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};

export default Landing;
