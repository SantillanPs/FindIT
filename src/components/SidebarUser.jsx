import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  ChevronUp,
  Moon,
  Sun,
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
            <button className="outline-none group">
              <Avatar className="h-9 w-9 rounded-xl shadow-xl transition-transform group-hover:scale-110 border border-white/10 cursor-pointer">
                <AvatarImage src={user.photo_url} />
                <AvatarFallback className="bg-slate-900 text-sky-400 text-[10px] font-bold uppercase">
                  {user.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          } />
          
          <DropdownMenuContent 
            side="top" 
            align="start" 
            sideOffset={8}
            className="w-[calc(var(--sidebar-width)-2rem)] bg-[#1e293b] border-none shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1 rounded-xl overflow-hidden ring-0 outline-none"
          >
            {/* Profile */}
            <DropdownMenuItem 
              onClick={() => navigate(user.role === 'student' ? '/profile' : `/admin/profile/${user.id}`)}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg focus:bg-white/5 text-slate-300 focus:text-white transition-all cursor-pointer border-none outline-none ring-0"
            >
              <div className="h-7 w-7 rounded-full bg-sky-500/10 flex items-center justify-center">
                <User size={14} className="text-sky-400" />
              </div>
              <span className="text-[13px] font-semibold">My Account</span>
            </DropdownMenuItem>

            {/* Theme Toggle */}
            <DropdownMenuItem 
              onClick={toggleTheme}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg focus:bg-white/5 text-slate-300 focus:text-white transition-all cursor-pointer border-none outline-none ring-0"
            >
              <div className="h-7 w-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-400" />}
              </div>
              <span className="text-[13px] font-semibold">
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
              <span className="text-[13px] font-semibold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
