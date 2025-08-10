
import React from "react";
import { Outlet, useLocation } from "react-router-dom"; // Added useLocation
import StudentHeader from "@/components/student/layout/StudentHeader";
import StudentNav from "@/components/student/layout/StudentNav";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  const location = useLocation(); // Initialized useLocation

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
      <StudentNav />
      <div className="flex-1 flex flex-col overflow-hidden"> {/* Added overflow-hidden here */}
        <StudentHeader />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto"> {/* This will scroll */}
          <motion.div
            key={location.pathname} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      {/* Mobile bottom navigation is now part of StudentNav */}
    </div>
  );
};

export default StudentDashboard;
