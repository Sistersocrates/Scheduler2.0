
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from '@/components/admin/AdminNav';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
      <AdminNav />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
