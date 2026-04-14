import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  ChevronUp,
  Moon,
  Sun,
  Trophy,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarUser({ user, theme, toggleTheme, handleLogout }) {
  const navigate = useNavigate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group outline-none text-left">
              <div className="relative">
                <Avatar className={cn(
                  "h-9 w-9 rounded-full shadow-lg border-2 shrink-0 transition-transform group-hover:scale-105",
                  user.verification_status === 'approved' ? "border-emerald-500/50" : 
                  user.verification_status === 'rejected' ? "border-rose-500/50" : "border-amber-500/50"
                )}>
                  <AvatarImage src={user.photo_url} className="object-cover" />
                  <AvatarFallback className="bg-slate-800 text-uni-400 text-[10px] font-bold uppercase">
                    {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950",
                  user.verification_status === 'approved' ? "bg-emerald-500" : 
                  user.verification_status === 'rejected' ? "bg-rose-500" : "bg-amber-500"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 overflow-hidden">
                   <span className="text-xs font-bold text-white truncate leading-none">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate font-medium mt-1">
                  {user.email}
                </p>
              </div>
              
              <ChevronUp size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
            </button>
          } />
          
          <DropdownMenuContent 
            side="top" 
            align="start" 
            sideOffset={8}
            className="w-[calc(var(--sidebar-width)-2rem)] bg-[#0f172a] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-0 rounded-2xl overflow-hidden ring-0 outline-none backdrop-blur-3xl"
          >
            {/* Identity Card Header */}
            <div className="p-4 bg-slate-900/60 border-b border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className={cn(
                  "h-10 w-10 rounded-full shadow-lg shrink-0 border-2",
                  user.verification_status === 'approved' ? "border-emerald-500/50" : 
                  user.verification_status === 'rejected' ? "border-rose-500/50" : "border-amber-500/50"
                )}>
                  <AvatarImage src={user.photo_url} className="object-cover" />
                  <AvatarFallback className="bg-slate-800 text-uni-400 text-xs font-bold uppercase">
                    {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-bold text-white truncate leading-tight">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate font-medium mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Status and Points */}
              <div className="flex flex-wrap gap-2">
                {user.verification_status === 'approved' ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <ShieldCheck size={10} strokeWidth={2.5} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Verified</span>
                  </div>
                ) : user.verification_status === 'rejected' ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <AlertCircle size={10} strokeWidth={2.5} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Issue</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Clock size={10} strokeWidth={2.5} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Pending</span>
                  </div>
                )}

                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-white/5 text-slate-400">
                  <Trophy size={10} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    {user.integrity_points || 0} pts
                  </span>
                </div>
              </div>
            </div>

            <div className="p-1">
              {/* Profile */}
              <DropdownMenuItem 
                onClick={() => navigate(user.role === 'student' ? '/profile' : `/admin/profile/${user.id}`)}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg focus:bg-white/5 text-slate-300 focus:text-white transition-all cursor-pointer border-none outline-none ring-0"
              >
                <div className="h-7 w-7 rounded-full bg-sky-500/10 flex items-center justify-center">
                  <User size={14} className="text-sky-400" />
                </div>
                <span className="text-[13px] font-bold">My Account</span>
              </DropdownMenuItem>

              {/* Theme Toggle */}
              <DropdownMenuItem 
                onClick={toggleTheme}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg focus:bg-white/5 text-slate-300 focus:text-white transition-all cursor-pointer border-none outline-none ring-0"
              >
                <div className="h-7 w-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                  {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-400" />}
                </div>
                <span className="text-[13px] font-bold">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </DropdownMenuItem>

              {/* Divider */}
              <div className="h-px bg-white/5 my-1 mx-2" />

              {/* Logout */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg focus:bg-rose-500/10 text-slate-400 focus:text-rose-400 transition-all cursor-pointer border-none outline-none ring-0"
              >
                <div className="h-7 w-7 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <LogOut size={14} className="text-rose-400" />
                </div>
                <span className="text-[13px] font-bold">Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
