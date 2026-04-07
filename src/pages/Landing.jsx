import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logSupabaseError } from '../context/AuthContext';
import { useMasterData } from '../context/MasterDataContext';
import { 
  Trophy, 
  Bell, 
  Search, 
  Users, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Share2, 
  CheckCircle2,
  Building2,
  GraduationCap,
  IdCard,
  Fingerprint,
  Send,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import ItemCard from '../components/ItemCard';
import LostReportCard from '../components/LostReportCard';
import WitnessReportModal from '../components/WitnessReportModal';

const Landing = () => {
  const { user } = useAuth();
  const { categories: CATEGORIES_FROM_MASTER, leaderboard: LEADERBOARD_FROM_MASTER, loading: masterLoading } = useMasterData();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [leaderboardType, setLeaderboardType] = useState('students');
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [selectedLostReport, setSelectedLostReport] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    // Only fetch items if we are NOT in the middle of a search
    if (!searchQuery || searchQuery.trim().length <= 2) {
      fetchItems();
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchLostReports();
  }, []);

  const fetchItems = async () => {
    try {
      setItemsLoading(true);
      
      let data, error;

      if (searchQuery && searchQuery.trim().length > 2) {
        // AI-POWERED VECTOR SEARCH
        // 1. Generate embedding using Edge Function
        const { data: embedData, error: embedError } = await supabase.functions.invoke('embed', {
          body: { text: searchQuery }
        });

        if (embedError) {
          console.error('Embedding error, falling back to text search:', embedError);
          // Fallback to text search
          const query = supabase
            .from('found_items')
            .select('*')
            .ilike('title', `%${searchQuery}%`)
            .order('date_found', { ascending: false })
            .limit(12);
          
          const fallbackRes = await query;
          data = fallbackRes.data;
          error = fallbackRes.error;
        } else {
          // 2. Call Postgres function for similarity search
          const { data: searchData, error: searchError } = await supabase.rpc('match_found_items', {
            query_embedding: embedData.embedding,
            match_threshold: 0.2, // Adjust threshold as needed
            match_count: 12
          });

          data = searchData;
          error = searchError;
        }
      } else {
        // REGULAR FETCH (Latest items)
        let query = supabase
          .from('found_items')
          .select('id, title, category, description, photo_url, date_found, location')
          .order('date_found', { ascending: false })
          .limit(12);

        if (selectedCategory && selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        const res = await Promise.race([
          query,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch Timeout')), 20000))
        ]);
        data = res.data;
        error = res.error;
      }
      
      if (error) throw error;
      
      console.info(`Supabase Fetch [Found Items]:`, data?.length || 0, 'records');
      setItems(data || []);
      setItemsLoading(false);
    } catch (error) {
      console.error('Error fetching items from Supabase:', error);
      setItems([]);
      setItemsLoading(false);
    }
  };

  const fetchLostReports = async () => {
    try {
      setReportsLoading(true);
      
      const { data, error } = await Promise.race([
        supabase
          .from('lost_items')
          .select('id, title, category, description, photo_url, date_lost, location')
          .order('date_lost', { ascending: false })
          .limit(12),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Lost Reports Timeout')), 20000))
      ]);

      if (error) throw error;

      console.info(`Supabase Fetch [Lost Reports]:`, data?.length || 0, 'records');
      setLostReports(data || []);
      setReportsLoading(false);
    } catch (error) {
      logSupabaseError('Landing Page [Lost Reports]', error);
      setLostReports([]);
      setReportsLoading(false);
    }
  };

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
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-sky-500/5 rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-0 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center px-6 relative z-10">
          
          <h1 className="text-6xl md:text-9xl lg:text-[11rem] font-black text-white italic tracking-tighter leading-[0.8] uppercase mb-8 md:mb-12">
            Lost it? <br />
            <span className="bg-gradient-to-br from-white via-white/80 to-slate-500 bg-clip-text text-transparent not-italic">Find it.</span>
          </h1>
          
          <p className="text-sm md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 md:mb-24 leading-relaxed font-medium italic opacity-80 uppercase tracking-widest">
            The university's centralized registry for assets. Verify ownership and facilitate secure returns.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 md:gap-10 max-w-2xl mx-auto">
            <Button 
                size="lg"
                onClick={() => navigate(user ? '/report/lost' : '/report-lost-guest')}
                className="h-16 md:h-24 px-10 md:px-20 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] italic bg-white hover:bg-slate-200 text-black shadow-2xl shadow-sky-500/10 transition-all group"
            >
                Report Missing
                <PlusCircle className="ml-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            </Button>
            <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate(user ? '/report/found' : '/report-found-guest')}
                className="h-16 md:h-24 px-10 md:px-20 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] italic border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white transition-all group"
            >
                Found Something
                <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Identified Items Section */}
      {items.some(i => i.identified_name || i.identified_student_id) && !itemsLoading && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24">
          <div className="flex items-center gap-6 mb-16 px-4 md:px-0">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-white/5 flex items-center justify-center text-sky-400">
              <Bell className="h-8 w-8" />
            </div>
            <div className="text-left">
              <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">Identified Items</h2>
              <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] italic mt-3">Ownership verification pending</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x px-6 md:px-0">
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
                      <Fingerprint className="h-16 w-16 text-slate-500/20" />
                    )}
                 </div>

                 <CardContent className="p-8 text-left space-y-6 flex-grow">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Identified Owner:</p>
                       <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight uppercase line-clamp-1">
                         {item.identified_name || `ID: ${item.identified_student_id?.replace(/(\d{4})-(\d{2})/, '$1-****')}`}
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
      <section className="relative py-20 md:py-32 overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 md:gap-24">
            <div className="lg:w-1/2 space-y-10 text-left">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-sky-500/30 bg-sky-500/5 backdrop-blur-md">
                <Trophy className="h-3 w-3 text-sky-400" />
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic">Honor System Active</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] uppercase">
                 Community <br/><span className="bg-gradient-to-br from-white via-white/80 to-slate-500 bg-clip-text text-transparent not-italic">Honor Roll</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed max-w-lg italic opacity-80 uppercase tracking-wider">
                  Returning lost items is a signal of character. Our community thrives through individual integrity.
              </p>
              
              <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit backdrop-blur-md">
                  <Button 
                      variant={leaderboardType === 'students' ? 'default' : 'ghost'}
                      onClick={() => setLeaderboardType('students')}
                      className={`rounded-xl px-8 font-black text-[10px] uppercase tracking-widest h-11 italic ${leaderboardType === 'students' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
                  >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Contributors
                  </Button>
                  <Button 
                      variant={leaderboardType === 'colleges' ? 'default' : 'ghost'}
                      onClick={() => setLeaderboardType('colleges')}
                      className={`rounded-xl px-8 font-black text-[10px] uppercase tracking-widest h-11 italic ${leaderboardType === 'colleges' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}
                  >
                      <Building2 className="h-4 w-4 mr-2" />
                      Colleges
                  </Button>
              </div>
            </div>

            <div className="lg:w-1/2 w-full relative">
              <Card className="p-3 md:p-8 border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                  <div className="space-y-2">
                      {!masterLoading && leaderboardType === 'students' ? (
                          LEADERBOARD_FROM_MASTER?.students?.slice(0, 5).map((student, i) => (
                              <div key={i} className="flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 transition-all group">
                                  <div className="flex items-center gap-5">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                                          i === 0 ? 'bg-amber-400 text-black border border-amber-500' : 
                                          i === 1 ? 'bg-slate-300 text-black border border-slate-400' :
                                          i === 2 ? 'bg-orange-600 text-white border border-orange-700' :
                                          'bg-white/5 text-slate-400 border border-white/5'
                                      }`}>
                                          {i + 1}
                                      </div>
                                      <div className="text-left">
                                          <p className="text-[12px] font-black text-white tracking-[0.2em] uppercase italic group-hover:text-sky-400 transition-colors">
                                              {student.full_name_masked}
                                          </p>
                                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic mt-1">
                                              {student.department || 'General Education'}
                                          </p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                      <p className="text-[11px] font-black text-white tracking-[0.3em] uppercase italic">{student.integrity_points} IP</p>
                                      <span className="text-xl group-hover:scale-125 transition-transform duration-500">
                                          {i === 0 ? '👑' : i === 1 ? '💎' : i === 2 ? '⚡' : i === 3 ? '🛡️' : '✨'}
                                      </span>
                                  </div>
                              </div>
                          ))
                      ) : (
                          LEADERBOARD_FROM_MASTER?.departments?.slice(0, 5).map((col, i) => (
                              <div key={i} className="flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 transition-all group">
                                  <div className="flex items-center gap-5">
                                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black bg-white/5 text-slate-400 border border-white/5 italic">
                                          {i + 1}
                                      </div>
                                      <div className="text-left">
                                          <p className="text-[12px] font-black text-white tracking-[0.2em] uppercase italic group-hover:text-sky-400">{col.department}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                      <p className="text-[11px] font-black text-sky-400 tracking-[0.3em] uppercase italic">{col.total_points} IP</p>
                                      <Building2 className="h-5 w-5 text-slate-600" />
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </Card>
            </div>
          </div>
        </div>
      </section>



      {/* Public Registry Section */}
      <section id="browse" className="py-12 md:py-24 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-24 border-b border-white/5 pb-16 md:pb-24">
             <div className="text-left space-y-6">
                <div className="flex items-center gap-6">
                  <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">Public Registry</h2>
                  <div className="py-2 px-6 rounded-full border border-sky-500/30 bg-sky-500/5 backdrop-blur-md hidden md:flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic">Live Records</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm md:text-lg font-medium italic uppercase tracking-wider opacity-80">A catalog of all items recovered across campus</p>
             </div>
             
             <div className="w-full md:w-auto relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-sky-400 transition-colors z-20" />
                <Input 
                  type="text" 
                  placeholder="Search inventory..." 
                  className="h-20 md:h-24 pl-16 pr-10 md:w-[460px] rounded-2xl border-white/10 bg-slate-900/40 backdrop-blur-xl text-lg font-black italic uppercase tracking-tight focus-visible:ring-sky-500/30 placeholder:text-slate-600 shadow-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-6">
             <Button 
               variant={selectedCategory === 'all' ? 'default' : 'outline'}
               onClick={() => setSelectedCategory('all')}
               className={`h-11 md:h-14 px-8 md:px-12 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic transition-all shrink-0 border ${
                 selectedCategory === 'all' 
                 ? 'bg-white text-black border-transparent shadow-xl' 
                 : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
               }`}
             >
               Every Item
             </Button>
             
             {(CATEGORIES_FROM_MASTER || []).map(cat => (
                <Button 
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`h-11 md:h-14 px-8 md:px-12 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic transition-all shrink-0 border ${
                    selectedCategory === cat.id 
                    ? 'bg-white text-black border-transparent shadow-xl' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat.label}
                </Button>
             ))}
          </div>

          {itemsLoading ? (
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
      <section id="lost-reports" className="py-12 md:py-24 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-24">
            <div className="text-left space-y-6">
              <div className="flex items-center gap-6">
                <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">Lost Reports</h2>
                <div className="py-2 px-6 rounded-full border border-rose-500/30 bg-rose-500/5 backdrop-blur-md hidden md:flex items-center gap-3">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest italic">Missing Assets</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm md:text-lg font-medium italic uppercase tracking-wider opacity-80">Community records of items currently missing</p>
            </div>
          </div>

          {reportsLoading ? (
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
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-40 text-center border-t border-white/5">
         <div className="max-w-4xl mx-auto space-y-16">
            <div className="inline-flex items-center gap-4 py-2 px-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
               <HelpCircle className="h-4 w-4 text-slate-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Expert Support</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">Need Assistance?</h2>
            <p className="text-slate-400 text-sm md:text-xl font-medium italic uppercase tracking-widest opacity-80 leading-relaxed max-w-2xl mx-auto">
               Our staff is trained to facilitate efficient recovery. Reach out for institutional support.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-8 md:gap-12">
               <a href="mailto:support@findit.edu" className="h-20 px-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center gap-4 group transition-all hover:bg-white/10">
                  <span className="text-sm font-black text-white italic uppercase tracking-[0.2em]">Contact Staff</span>
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">{toast.message}</p>
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
