
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Users, Settings, BarChart3, CalendarCheck, Database, LogOut, UserCircle as ProfileIcon } from 'lucide-react'; // Changed BarChart to BarChart3, Calendar to CalendarCheck
import { motion } from 'framer-motion';

const AdminNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: ShieldCheck },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'System Config', path: '/admin/system-config', icon: Settings },
    { name: 'Tenant Management', path: '/admin/tenants', icon: Users }, // Using Users icon for Tenant as well
    { name: 'Reporting', path: '/admin/reports', icon: BarChart3 },
    { name: 'Parent Tours', path: '/admin/parent-tours', icon: CalendarCheck },
    { name: 'Data Management', path: '/admin/data-tools', icon: Database },
    { name: 'Seminar Capacities', path: '/admin/seminar-capacities', icon: BarChart3 },
  ];

  const bottomNavItems = [
    { name: 'My Profile', path: '/profile', icon: ProfileIcon },
    { name: 'Logout', action: handleLogout, icon: LogOut },
  ];

  const linkVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    hover: { scale: 1.05, color: "#fde047" }, // yellow-300
    tap: { scale: 0.95 }
  };

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="w-full md:w-72 bg-slate-800/70 backdrop-blur-md p-6 flex flex-col shadow-2xl md:min-h-screen border-r border-slate-700"
    >
      <div className="flex items-center mb-10">
        <ProfileIcon className="h-10 w-10 text-yellow-400 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-yellow-300">{user?.profile?.first_name} {user?.profile?.last_name}</h2>
          <p className="text-xs text-slate-400 capitalize">{user?.role} Dashboard</p>
        </div>
      </div>

      <nav className="flex-grow space-y-1.5">
        {navItems.map((item, index) => (
          <motion.div 
            key={item.name} 
            variants={linkVariants} 
            initial="initial" 
            animate="animate" 
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.path}
              end={item.path === "/admin/dashboard"}
              className={({ isActive }) =>
                `flex items-center py-2.5 px-4 rounded-lg transition-all duration-200 ease-in-out text-sm
                 ${isActive 
                    ? 'bg-yellow-500/20 text-yellow-300 shadow-inner border-l-4 border-yellow-400 font-medium' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-yellow-400'}`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-700/50 space-y-2">
        {bottomNavItems.map((item, index) => (
           <motion.div 
            key={item.name} 
            variants={linkVariants} 
            initial="initial" 
            animate="animate" 
            transition={{ delay: (navItems.length + index) * 0.05 }}
           >
             {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm
                    ${isActive 
                        ? 'bg-yellow-500/10 text-yellow-300' 
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-yellow-400'}`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
             ) : (
                <Button
                  variant="ghost"
                  onClick={item.action}
                  className="w-full flex items-center justify-start py-2.5 px-4 text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200 text-sm"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
             )}
           </motion.div>
        ))}
      </div>
    </motion.aside>
  );
};

export default AdminNav;
