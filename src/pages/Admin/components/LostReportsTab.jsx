import React from 'react';
import LostReportCard from './LostReportCard';

const LostReportsTab = ({ 
  filteredLostReports, 
  matches, 
  navigate, 
  setSearchTerm,
  onUpdateReport,
  actionLoading,
  setPreviewImage,
  activeFilter
}) => {
  return (
    <div className="p-8 space-y-10 pb-32 text-left">
       {['today', 'weekly'].includes(activeFilter) && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-calendar-day text-amber-500"></i>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Showing reports from {activeFilter === 'today' ? 'Today' : 'this Week'}
              </span>
            </div>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-[9px] font-black text-amber-500 uppercase tracking-widest hover:underline"
            >
              Clear Filter ✕
            </button>
          </div>
       )}
       {filteredLostReports.length === 0 ? (
         <div className="py-20 text-center opacity-50">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Active Lost Reports</p>
           <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-2">All student reports are currently settled or matchless</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 gap-6">
           {filteredLostReports.map(report => (
             <LostReportCard 
               key={report.id}
               report={report}
               matches={matches}
               navigate={navigate}
               setSearchTerm={setSearchTerm}
               onUpdate={onUpdateReport}
               isUpdating={actionLoading === `lost-${report.id}`}
               onPreview={setPreviewImage}
             />
           ))}
         </div>
       )}
    </div>
  );
};

export default LostReportsTab;
