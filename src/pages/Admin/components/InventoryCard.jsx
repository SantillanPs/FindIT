import { Link } from 'react-router-dom';
import { useMasterData } from '../../../context/MasterDataContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  MapPin, 
  Calendar, 
  User as UserIcon, 
  Search, 
  CheckCircle2, 
  BadgeCheck, 
  ArrowRight,
  ClipboardCheck,
  Vault,
  Clock
} from "lucide-react";

const InventoryCard = ({ 
  item, 
  matches, 
  pendingClaims, 
  navigate, 
  setSearchTerm, 
  handleStatusUpdate, 
  setShowReleaseModal, 
  setReleaseForm, 
  actionLoading, 
  isSelected, 
  onToggleSelect 
}) => {
  const { categories: CATEGORIES } = useMasterData();
  const itemMatches = matches.find(m => m.found_item.id === item.id)?.top_matches || [];
  const itemClaims = pendingClaims.filter(c => c.found_item_id === item.id);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'reported':
        return { label: 'Discovery Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock };
      case 'in_custody':
        return { label: 'In Vault', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: Vault };
      case 'claimed':
        return { label: 'Ready for Release', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: BadgeCheck };
      default:
        return { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Package };
    }
  };

  const statusCfg = getStatusConfig(item.status);

  return (
    <Card className={`relative border-white/5 bg-slate-900/40 backdrop-blur-sm hover:bg-slate-900/60 transition-all group overflow-hidden ${
       isSelected ? 'ring-2 ring-uni-500/50 bg-uni-500/5' : ''
    }`}>
       <CardContent className="p-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Selection & Visual ID Section */}
          <div className="flex items-center gap-5 p-5 md:p-6 w-full md:w-auto">
             <div 
               onClick={onToggleSelect}
               className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected ? 'bg-uni-500 border-uni-500 shadow-lg shadow-uni-500/20' : 'border-white/10 hover:border-white/30'}`}
             >
                {isSelected && <CheckCircle2 size={12} className="text-white" />}
             </div>

             <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-white/10 flex items-center justify-center text-3xl relative flex-shrink-0 shadow-inner">
                {CATEGORIES.find(c => c.id === item.category)?.emoji || '📦'}
                <Badge variant="outline" className="absolute -bottom-2 -right-2 bg-slate-900 text-[12px] font-bold text-slate-300 px-2.5 border-white/20">
                   #{item.id.toString().padStart(4, '0')}
                </Badge>
             </div>

             <div className="space-y-1.5 text-left">
                <h4 className="text-sm font-bold text-white leading-tight group-hover:text-uni-400 transition-colors flex items-center gap-2">
                   {item.location}
                </h4>
                 <div className="flex items-center gap-3">
                    <Badge className="bg-uni-500/10 text-uni-400 hover:bg-uni-500/20 border-uni-500/20 text-[13px] font-bold px-2.5 py-1">
                        {item.title}
                    </Badge>
                    <span className="text-[13px] font-medium text-slate-400 flex items-center gap-1.5">
                       <Calendar size={14} className="text-slate-500" />
                       {new Date(item.date_found).toLocaleDateString()}
                    </span>
                 </div>
             </div>
          </div>

          {/* Registry & Analysis Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-grow px-10 md:px-0 py-2 md:py-0">
             <div className="space-y-2 text-left">
                 <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                   <UserIcon size={14} className="text-slate-500" />
                   Registry Owner
                 </p>
                 <p className="text-[15px] font-bold text-white uppercase tracking-wide">
                   {item.finder_id ? (
                       <Link to={`/admin/profile/${item.finder_id}`} className="hover:text-uni-400 transition-colors decoration-slate-400">
                           {item.owner_name || 'System Registry'}
                       </Link>
                   ) : (
                       item.owner_name || 'System Registry'
                   )}
                </p>
             </div>

             <div className="space-y-3 border-l border-white/5 pl-6 hidden sm:block text-left">
                 <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                   <BadgeCheck size={14} className="text-slate-500" />
                   Insight Analysis
                 </p>
                <div className="flex flex-wrap gap-2.5">
                    {itemMatches.length > 0 ? (
                        <Badge variant="outline" className="bg-uni-500/5 text-uni-400 border-uni-400/20 text-[12px] font-bold flex items-center gap-1.5 px-2.5 py-1">
                           {itemMatches.length} Matches
                           <div className="w-1.5 h-1.5 rounded-full bg-uni-400 animate-pulse"></div>
                        </Badge>
                    ) : (
                        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider italic">Scanning registry...</span>
                    )}
                   
                    {itemClaims.length > 0 && (
                        <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20 text-[12px] font-bold px-2.5 py-1">
                           {itemClaims.length} Active Claims
                        </Badge>
                    )}

                   {itemMatches.length > 0 && (
                       <button 
                           onClick={() => {
                               navigate('/admin/matches');
                               setSearchTerm(`#${item.id.toString().padStart(4, '0')}`);
                           }}
                           className="text-[12px] font-bold text-uni-400 uppercase tracking-wider hover:text-white transition-all ml-1"
                       >
                           Inspect <ArrowRight size={12} className="inline ml-1" />
                       </button>
                   )}
                </div>
             </div>
          </div>

          {/* Actions Section */}
           <div className="w-full md:w-auto p-5 md:p-6 bg-slate-950/20 md:bg-transparent border-t md:border-none border-white/5 flex flex-row md:flex-col items-center md:items-end gap-3.5">
              <Badge className={`text-[13px] font-bold uppercase tracking-wider px-3.5 py-1.5 ${statusCfg.color} border shadow-sm`}>
                <statusCfg.icon size={14} className="mr-1.5 inline" />
                {statusCfg.label}
              </Badge>

             {!isSelected && (
               <div className="flex-grow md:w-full">
                 {item.status === 'reported' ? (
                      <Button 
                        onClick={() => handleStatusUpdate(item, 'in_custody')}
                        disabled={actionLoading === item.id}
                        className="w-full md:w-40 bg-uni-600 hover:bg-uni-700 text-white text-[13px] font-bold uppercase tracking-wider h-14 rounded-xl shadow-lg shadow-uni-600/10 active:scale-[0.98] transition-all"
                      >
                         {actionLoading === item.id ? (
                           <RefreshCw size={16} className="animate-spin" />
                         ) : (
                           <>
                             <Vault size={16} className="mr-2" />
                             Secure
                           </>
                         )}
                      </Button>
                 ) : (
                     <Button 
                        variant="outline"
                        onClick={() => {
                           setShowReleaseModal(item);
                            setReleaseForm({ 
                               name: item.identified_name || '', 
                               id_number: item.identified_student_id || '',
                               photo_url: '' 
                            });
                        }}
                        className="w-full md:w-auto px-6 bg-green-500/5 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white text-[13px] font-bold uppercase tracking-wider h-14 rounded-xl transition-all active:scale-[0.98]"
                     >
                        Release Item
                     </Button>
                 )}
               </div>
             )}
          </div>
       </CardContent>
    </Card>
  );
};

export default InventoryCard;
