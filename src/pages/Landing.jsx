import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useMasterData } from '../context/MasterDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import ItemCard from '../components/ItemCard';
import LostReportCard from '../components/LostReportCard';
import WitnessReportModal from '../components/WitnessReportModal';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const Landing = () => {
  const { user } = useAuth();
  const { categories: CATEGORIES_FROM_MASTER, leaderboard: LEADERBOARD_FROM_MASTER, loading: masterLoading } = useMasterData();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [lostLoading, setLostLoading] = useState(true);
  
  const [itemsPage, setItemsPage] = useState(1);
  const [lostPage, setLostPage] = useState(1);
  const [hasMoreItems, setHasMoreItems] = useState(false);
  const [hasMoreLost, setHasMoreLost] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [lostSearchQuery, setLostSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLostCategory, setSelectedLostCategory] = useState('all');
  
  const [leaderboardType, setLeaderboardType] = useState('students');
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [selectedLostReport, setSelectedLostReport] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchItems(1, true);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchLostReports(1, true);
  }, [lostSearchQuery, selectedLostCategory]);

  const fetchItems = async (page, reset = false) => {
    try {
      if (reset) setItemsLoading(true);
      const res = await apiClient.get('/found/public', {
        params: { 
          page, 
          limit: 6,
          search: searchQuery || undefined,
          category: selectedCategory === 'all' ? undefined : selectedCategory
        }
      });
      
      if (reset) {
        setItems(res.data.items);
      } else {
        setItems(prev => [...prev, ...res.data.items]);
      }
      
      setHasMoreItems(res.data.has_more);
      setItemsPage(page);
      setItemsLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItemsLoading(false);
    }
  };

  const fetchLostReports = async (page, reset = false) => {
    try {
      if (reset) setLostLoading(true);
      const res = await apiClient.get('/lost/public', {
        params: { 
          page, 
          limit: 6,
          search: lostSearchQuery || undefined,
          category: selectedLostCategory === 'all' ? undefined : selectedLostCategory
        }
      });
      
      if (reset) {
        setLostReports(res.data.items);
      } else {
        setLostReports(prev => [...prev, ...res.data.items]);
      }
      
      setHasMoreLost(res.data.has_more);
      setLostPage(page);
      setLostLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLostLoading(false);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleWitness = (report) => {
    setSelectedLostReport(report);
    setShowWitnessModal(true);
  };

  const handleShare = (item) => {
    const text = `I found a ${item.item_name} on FindIT! If this is yours, you can claim it here.`;
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
    <div className="space-y-10 md:space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-28 md:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center px-6 relative z-10">
          <div className="mb-8 md:mb-12">
            <Badge variant="brand" className="py-1.5 px-5 rounded-full border border-brand-primary/30 text-[10px] tracking-widest uppercase">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              Official Inventory Portal
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black text-white italic tracking-tighter leading-[0.85] uppercase mb-6 md:mb-10">
            Lost it? <br />
            <span className="text-brand-primary not-italic">Find it.</span>
          </h1>
          
          <p className="text-base md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 md:mb-20 leading-relaxed font-medium">
            The university's centralized registry for lost and found items. Report assets, verify ownership, and facilitate secure returns.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 max-w-2xl mx-auto">
            <Button 
                size="lg"
                onClick={() => navigate(user ? '/report/lost' : '/report-lost-guest')}
                className="h-16 md:h-20 px-10 md:px-16 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.02]"
            >
                Report Missing Item
            </Button>
            <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate(user ? '/report/found' : '/report-found-guest')}
                className="h-16 md:h-20 px-10 md:px-16 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest border-border/50 hover:bg-white/5 transition-all hover:scale-[1.02]"
            >
                I Found Something
            </Button>
          </div>
        </div>
      </section>

      {/* Identified Items Section (Previously Recent Identifications) */}
      {items.some(i => i.identified_name || i.identified_student_id) && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-2xl shadow-lg">
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="text-left">
              <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Identified Items</h2>
              <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2">Ownership verification pending</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-6 md:gap-8 pb-8 no-scrollbar snap-x px-6 md:px-0">
            {items.filter(i => i.identified_name || i.identified_student_id).map(item => (
              <Card 
                key={item.id}
                className="min-w-[300px] md:min-w-[440px] snap-start border border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden flex flex-col relative group shadow-xl shadow-brand-primary/5 hover:shadow-brand-primary/10 transition-all duration-500"
              >
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                   <Badge variant="brand" className="py-1.5 px-4 backdrop-blur-md border-brand-primary/30">
                      <i className="fa-solid fa-id-card mr-2"></i>
                      Identity Linked
                   </Badge>
                </div>
                
                 <div className="aspect-[16/9] md:h-56 bg-muted flex items-center justify-center relative overflow-hidden">
                    {item.safe_photo_url ? (
                      <img 
                        src={item.safe_photo_thumbnail_url || item.safe_photo_url} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        alt="" 
                        loading="lazy"
                      />
                    ) : (
                      <i className="fa-solid fa-fingerprint text-7xl text-muted-foreground opacity-20"></i>
                    )}
                 </div>

                 <CardContent className="p-6 md:p-8 text-left space-y-4 md:space-y-6 flex-grow">
                    <div className="space-y-1 md:space-y-2">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Identified Owner:</p>
                       <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tight uppercase line-clamp-1">
                         {item.identified_name || `ID: ${item.identified_student_id?.replace(/(\d{4})-(\d{2})/, '$1-****')}`}
                       </h3>
                    </div>
 
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2 font-medium">
                      A <span className="text-white font-bold">{item.item_name}</span> recovered at <span className="text-brand-primary font-bold">{item.location_zone}</span>.
                    </p>

                   <div className="pt-6 border-t border-border/40 flex gap-4">
                      <Button 
                         onClick={() => navigate(`/submit-claim/${item.id}`)}
                         className="flex-grow font-black text-[10px] tracking-widest uppercase bg-brand-primary hover:bg-brand-primary/90 text-white"
                      >
                         Claim Item
                      </Button>
                      <Button 
                         variant="outline"
                         onClick={() => handleShare(item)}
                         className="w-12 h-12 md:w-14 md:h-14 p-0 rounded-xl border-border/50 hover:bg-white/5"
                      >
                         <i className="fa-solid fa-paper-plane text-muted-foreground"></i>
                      </Button>
                   </div>
                 </CardContent>
               </Card>
            ))}
          </div>
        </section>
      )}

      {/* Community Honor Roll (Leaderboard) */}
      <section className="relative py-12 md:py-24 overflow-hidden border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 md:gap-20">
            <div className="lg:w-1/2 space-y-8 text-left">
              <Badge variant="brand" className="py-1.5 px-4 shadow-sm">
                <i className="fa-solid fa-trophy mr-2"></i>
                Honor System Active
              </Badge>
              <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter leading-none uppercase">
                 Community <br/><span className="text-brand-primary not-italic">Honor Roll</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-lg font-medium leading-relaxed max-w-lg">
                  Returning lost items is a signal of character. Our community thrives through individual integrity. Each entry represents a commitment to mutual trust.
              </p>
              
              <div className="flex flex-wrap gap-2 p-1 bg-muted/30 border border-border/40 rounded-xl w-fit">
                  <Button 
                      variant={leaderboardType === 'students' ? 'default' : 'ghost'}
                      onClick={() => setLeaderboardType('students')}
                      className={`rounded-lg px-6 font-bold text-[10px] uppercase tracking-widest h-9 ${leaderboardType === 'students' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-muted-foreground hover:text-white'}`}
                  >
                      <i className="fa-solid fa-user-graduate mr-2"></i>
                      Top Contributors
                  </Button>
                  <Button 
                      variant={leaderboardType === 'colleges' ? 'default' : 'ghost'}
                      onClick={() => setLeaderboardType('colleges')}
                      className={`rounded-lg px-6 font-bold text-[10px] uppercase tracking-widest h-9 ${leaderboardType === 'colleges' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-muted-foreground hover:text-white'}`}
                  >
                      <i className="fa-solid fa-building-columns mr-2"></i>
                      Top Colleges
                  </Button>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-border/40">
                  <div className="flex -space-x-3 overflow-hidden">
                      {[1,2,3,4].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              U{i}
                          </div>
                      ))}
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-snug">
                     <span className="text-white">124+ Contributors</span> <br/>
                     Recognized this semester
                  </p>
              </div>
            </div>

            <div className="lg:w-1/2 w-full relative">
              <Card className="p-2 md:p-6 border border-border/50 bg-card/60 backdrop-blur-sm shadow-2xl shadow-brand-primary/5">
                  <div className="space-y-1">
                      {!masterLoading && leaderboardType === 'students' ? (
                          LEADERBOARD_FROM_MASTER?.students?.length > 0 ? (
                              LEADERBOARD_FROM_MASTER.students.slice(0, 5).map((student, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 py-5 rounded-2xl hover:bg-white/5 transition-all group">
                                      <div className="flex items-center gap-4">
                                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                                              i === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 
                                              i === 1 ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                                              i === 2 ? 'bg-orange-800/20 text-orange-800 border border-orange-800/30' :
                                              'bg-muted/50 text-muted-foreground border border-border/10'
                                          }`}>
                                              {i + 1}
                                          </div>
                                          <div className="text-left">
                                              <p className="text-[11px] font-black text-white tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                                                  {student.full_name_masked}
                                              </p>
                                              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                                  {student.department || 'General Education'} • Keeper of Honor
                                              </p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <div className="text-right">
                                              <p className="text-[11px] font-black text-brand-primary tracking-[0.2em]">{student.integrity_points} IP</p>
                                          </div>
                                          <span className="text-xl group-hover:scale-110 transition-transform">
                                              {i === 0 ? '👑' : i === 1 ? '🔥' : i === 2 ? '✨' : i === 3 ? '🛡️' : '🔰'}
                                          </span>
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="py-20 text-center opacity-40 italic text-xs font-black uppercase tracking-widest">The Hall is currently empty...</div>
                          )
                      ) : (
                          LEADERBOARD_FROM_MASTER?.departments?.length > 0 ? (
                              LEADERBOARD_FROM_MASTER.departments.slice(0, 5).map((col, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 py-5 rounded-2xl hover:bg-white/5 transition-all group">
                                      <div className="flex items-center gap-4">
                                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black bg-muted/50 text-muted-foreground border border-border/10 group-hover:border-amber-500/30 transition-all">
                                              {i + 1}
                                          </div>
                                          <div className="text-left text-ellipsis overflow-hidden max-w-[150px]">
                                              <p className="text-[11px] font-black text-white tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">{col.department}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <div className="text-right">
                                              <p className="text-[11px] font-black text-amber-500 tracking-[0.2em]">{col.total_points} IP</p>
                                          </div>
                                          <span className="text-xl group-hover:scale-110 transition-transform">🏛️</span>
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="py-20 text-center opacity-40 italic text-xs font-black uppercase tracking-widest">Collecting stats...</div>
                          )
                      )}
                  </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Member Benefits Strip */}
      {!user && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <Card className="p-8 md:p-12 border border-border/50 bg-card/40 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-10 shadow-lg shadow-brand-primary/5">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20 flex-grow">
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-widest italic leading-none">Account <span className="text-brand-primary not-italic">Benefits</span></h3>
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Why create an account?</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 w-full">
                {[
                  { icon: '🛡️', title: 'Smart Alerts', desc: 'Instant item match' },
                  { icon: '🏆', title: 'Honor Points', desc: 'Build your rank' },
                  { icon: '📜', title: 'Verification', desc: 'Secure recovery' }
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <span className="text-2xl md:text-4xl group-hover:scale-110 transition-transform">{perk.icon}</span>
                    <div className="text-left">
                      <p className="text-xs md:text-sm font-black text-white uppercase tracking-tight leading-none group-hover:text-brand-primary transition-colors">{perk.title}</p>
                      <p className="text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-2">{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
                onClick={() => navigate('/register')}
                className="shrink-0 px-12 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xl shadow-brand-primary/20"
            >
                Get Started
            </Button>
          </Card>
        </section>
      )}

      {/* Public Registry */}
      <section id="browse" className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 border-b border-border/40 pb-10 md:pb-14">
           <div className="text-left space-y-3">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Public Registry</h2>
                <Badge variant="brand" className="py-1 px-3">Live Records</Badge>
              </div>
              <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-[0.2em]">A catalog of all items recovered across campus</p>
           </div>
           
           <div className="w-full md:w-auto relative group">
              <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs z-20 group-focus-within:text-brand-primary transition-colors"></i>
              <Input 
                type="text" 
                placeholder="Search by item or location..." 
                className="pl-14 py-6 md:w-96 rounded-2xl border-border/50 bg-muted/40 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* Discovery Chips */}
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 px-1 md:px-0">
           <Button 
             variant={selectedCategory === 'all' ? 'default' : 'outline'}
             onClick={() => setSelectedCategory('all')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border border-border/50 ${
               selectedCategory === 'all' 
               ? 'bg-brand-primary text-white border-brand-primary/30 shadow-lg shadow-brand-primary/10' 
               : 'bg-card/60 hover:border-brand-primary/50'
             }`}
           >
             Every Item
           </Button>
           
           {(CATEGORIES_FROM_MASTER || []).map(cat => {
              const count = items.filter(i => i.category === cat.id).length;
              return (
                <Button 
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border border-border/50 flex items-center gap-3 group/chip ${
                    selectedCategory === cat.id 
                    ? 'bg-brand-primary text-white border-brand-primary/30 shadow-lg shadow-brand-primary/10' 
                    : 'bg-card/60 text-muted-foreground hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <Badge variant="outline" className={`py-0 px-2 text-[8px] ${
                        selectedCategory === cat.id ? 'bg-white/20 text-white border-transparent' : 'bg-muted text-muted-foreground border-border/30'
                    }`}>
                        {count}
                    </Badge>
                  )}
                </Button>
              );
           })}
        </div>

        {itemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl"></div>)}
            </div>
        ) : filteredItems.length === 0 ? (
            <Card className="py-24 text-center border border-border/50 bg-card/60 backdrop-blur-md">
                <div className="max-w-md mx-auto px-6">
                  <div className="w-20 h-20 bg-muted/40 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">🔍</div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight italic mb-4">No matching records</h3>
                  <p className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-[0.15em] mb-10">
                    We scanned our system records but couldn't find a match for your search.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                  >
                    Reset Filters
                  </Button>
                </div>
            </Card>
        ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                  {filteredItems.map(item => (
                      <ItemCard 
                          key={item.id}
                          item={item}
                          onClick={() => navigate(`/submit-claim/${item.id}`)}
                      />
                  ))}
              </div>
              
              {hasMoreItems && (
                <div className="mt-12 flex justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => fetchItems(itemsPage + 1)}
                    className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-border/50 flex items-center gap-3 group"
                  >
                    Show More Discoveries
                    <i className="fa-solid fa-chevron-down opacity-50 group-hover:translate-y-1 transition-transform"></i>
                  </Button>
                </div>
              )}
            </>
        )}
        </div>
      </section>

      {/* Lost Reports Registry */}
      <section id="lost-registry" className="py-12 md:py-20 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-10 md:space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 border-b border-border/40 pb-10 md:pb-14">
           <div className="text-left space-y-3">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-none uppercase">Lost Reports</h2>
                <Badge variant="brand" className="py-1 px-3 border-brand-primary/30 text-brand-primary bg-brand-primary/10">Active Search</Badge>
              </div>
              <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-[0.2em]">Help our community recover their missing belongings</p>
           </div>
           
           <div className="w-full md:w-auto relative group">
              <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors z-20"></i>
              <Input 
                type="text" 
                placeholder="Search lost reports..." 
                className="pl-14 py-6 md:w-96 rounded-2xl border-border/50 bg-muted/40 backdrop-blur-sm"
                value={lostSearchQuery}
                onChange={(e) => setLostSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* Discovery Chips for Lost Reports */}
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2">
           <Button 
             variant={selectedLostCategory === 'all' ? 'default' : 'outline'}
             onClick={() => setSelectedLostCategory('all')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border border-border/50 ${
               selectedLostCategory === 'all' 
               ? 'bg-brand-primary text-white border-brand-primary/30 shadow-lg shadow-brand-primary/10' 
               : 'bg-card/60'
             }`}
           >
             Every Report
           </Button>
           
           {(CATEGORIES_FROM_MASTER || []).map(cat => {
             const count = lostReports.filter(r => r.category === cat.id).length;
             return (
               <Button 
                 key={cat.id}
                 variant={selectedLostCategory === cat.id ? 'default' : 'outline'}
                 onClick={() => setSelectedLostCategory(cat.id)}
                 className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border border-border/50 flex items-center gap-3 group/chip ${
                   selectedLostCategory === cat.id 
                   ? 'bg-brand-primary text-white border-brand-primary/30 shadow-lg shadow-brand-primary/10' 
                   : 'bg-card/60 text-muted-foreground hover:text-white'
                 }`}
               >
                 <span>{cat.label}</span>
                 {count > 0 && (
                   <Badge variant="outline" className={`py-0 px-2 text-[8px] ${
                     selectedLostCategory === cat.id ? 'bg-white/20 text-white border-transparent' : 'bg-muted text-muted-foreground border-border/30'
                   }`}>
                     {count}
                   </Badge>
                 )}
               </Button>
             );
           })}
        </div>

        {lostLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[1,2,3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl"></div>)}
             </div>
        ) : filteredLostReports.length === 0 ? (
            <Card className="py-24 text-center border border-border/50 bg-card/60 backdrop-blur-md">
                <div className="max-w-md mx-auto px-6">
                  <div className="w-20 h-20 bg-muted/40 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">🤝</div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">No active lost reports</h3>
                  <p className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-[0.15em] leading-relaxed mb-10 opacity-70">
                    All missing items seem to be accounted for!
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => { setLostSearchQuery(''); setSelectedLostCategory('all'); }}
                    className="px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                  >
                    Clear Search
                  </Button>
                </div>
            </Card>
        ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredLostReports.map(report => (
                      <LostReportCard 
                          key={report.id}
                          report={report}
                          onWitness={handleWitness}
                      />
                  ))}
              </div>

              {hasMoreLost && (
                <div className="mt-12 flex justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => fetchLostReports(lostPage + 1)}
                    className="px-10 py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-border/50 hover:bg-white/5 flex items-center gap-3 group"
                  >
                    View More Reports
                    <i className="fa-solid fa-chevron-down opacity-50 group-hover:translate-y-1 transition-transform"></i>
                  </Button>
                </div>
              )}
            </>
        )}
        </div>
      </section>

      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110]"
          >
            <div className="border border-border/50 bg-card/95 backdrop-blur-md text-white px-8 py-4 rounded-full flex items-center space-x-4 shadow-2xl">
              <i className="fa-solid fa-check-circle text-green-500"></i>
              <p className="text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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