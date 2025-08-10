
import React, { useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom"; 
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import TeacherDashboard from "@/pages/TeacherDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import SpecialistDashboard from "@/pages/SpecialistDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

import AddSeminar from "@/components/teacher/AddSeminar";
import EditSeminar from "@/components/teacher/EditSeminar";
import AttendanceManager from "@/components/teacher/AttendanceManager";
import ClassRoster from "@/components/teacher/ClassRoster";
import AttendanceHistory from "@/components/teacher/AttendanceHistory";
import MySeminars from "@/components/teacher/MySeminars";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client"; 

// Student Components
import StudentDashboardOverview from "@/components/student/dashboard/StudentDashboardOverview";
import StudentScheduleView from "@/components/student/schedule/StudentScheduleView";
import ClassBrowser from "@/components/student/schedule/ClassBrowser";
import StudentAppointmentsView from "@/components/student/appointments/StudentAppointmentsView";
import StudentNotificationsView from "@/components/student/notifications/StudentNotificationsView";

// Specialist Components
import SpecialistDashboardOverview from "@/components/specialist/dashboard/SpecialistDashboardOverview";
import AppointmentCalendarView from "@/components/specialist/appointments/AppointmentCalendarView";
import AvailabilityManager from "@/components/specialist/appointments/AvailabilityManager";
import StudentSearchSpecialist from "@/components/specialist/students/StudentSearch";
import SpecialistNotificationCenter from "@/components/specialist/notifications/SpecialistNotificationCenter";
import GroupListView from "@/components/specialist/groups/GroupListView";
import EventListView from "@/components/specialist/events/EventListView";

// Admin Components
import AdminDashboardOverview from "@/components/admin/dashboard/AdminDashboardOverview";
import UserListView from "@/components/admin/users/UserListView";
import TenantManagementView from "@/components/admin/tenants/TenantManagementView";
import SystemSettingsView from "@/components/admin/settings/SystemSettingsView";
// import IntegrationSettingsView from "@/components/admin/settings/IntegrationSettingsView"; // Replaced by layout
import CreditTrackingReportView from "@/components/admin/reports/CreditTrackingReportView";
import AttendanceReportView from "@/components/admin/reports/AttendanceReportView";
import SystemUsageAnalyticsView from "@/components/admin/reports/SystemUsageAnalyticsView";
import ParentTourScheduler from "@/components/admin/tools/ParentTourScheduler";
import DataManagementView from "@/components/admin/tools/DataManagementView";

// Integration Management Components
import IntegrationManagementLayout from "@/components/admin/integrations/IntegrationManagementLayout";
import IntegrationProviderList from "@/components/admin/integrations/IntegrationProviderList";
import IntegrationInstanceList from "@/components/admin/integrations/IntegrationInstanceList";
import IntegrationForm from "@/components/admin/integrations/IntegrationForm";
import IntegrationDetailView from "@/components/admin/integrations/IntegrationDetailView";
import GoogleAuthSetup from "@/components/admin/integrations/GoogleAuthSetup";
// Placeholders for other integration components
const DataMappingDashboard = () => <div className="text-slate-300 p-4">Data Mapping Dashboard (Placeholder)</div>;
const SyncLogDashboard = () => <div className="text-slate-300 p-4">Synchronization Log Dashboard (Placeholder)</div>;


const SpecialistMySchedule = () => <AvailabilityManager />;
const SpecialistStudentManagement = () => (
  <div className="space-y-6"><h2 className="text-2xl font-semibold text-pink-400">Student Management</h2><StudentSearchSpecialist /></div>
);
const SpecialistGroupManagement = () => <div className="space-y-6"><GroupListView /></div>;
const SpecialistEventManagement = () => <div className="space-y-6"><EventListView /></div>;
const SpecialistSettings = () => <div className="text-2xl text-center p-10 text-purple-300">Specialist Settings</div>;

const AdminUserManagement = () => <UserListView onCreateUser={() => {/* open modal */}} onEditUser={(user) => {/* open modal with user */}} />;
const AdminSystemConfig = () => <div className="space-y-6"><SystemSettingsView /></div>; // IntegrationSettingsView is now part of a layout
const AdminReports = () => <div className="space-y-6"><CreditTrackingReportView /><AttendanceReportView /><SystemUsageAnalyticsView /></div>;
const AdminDataTools = () => <DataManagementView />;


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    let defaultPath = '/login';
    switch (user.role) {
        case 'teacher': defaultPath = '/teacher/my-seminars'; break;
        case 'student': defaultPath = '/student/dashboard-overview'; break;
        case 'specialist': defaultPath = '/specialist/dashboard'; break;
        case 'admin': defaultPath = '/admin/dashboard'; break;
    }
    return <Navigate to={defaultPath} replace />;
  }
  
  return children ? children : <Outlet />;
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const { refreshSession } = useAuth(); // Assuming refreshSession can process the new state

  useEffect(() => {
    const handleAuth = async () => {
        // The URL fragment contains the access_token, etc.
        // Supabase client library usually handles this automatically if configured.
        // If manual handling is needed (e.g., after Google OAuth code exchange):
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error("Auth callback error:", error);
            navigate('/login', { replace: true });
            return;
        }

        if (session) {
            await refreshSession(session); // Process the new session
            // Navigation will be handled by AuthContext or NavigateToDashboard
        } else {
            // No session found, maybe the hash was already processed or it's an error
            // Check if there's an error in URL params (less common for hash-based OAuth)
            const params = new URLSearchParams(window.location.search);
            const errorParam = params.get('error');
            const errorDescriptionParam = params.get('error_description');
            if (errorParam) {
                console.error(`OAuth Error: ${errorParam} - ${errorDescriptionParam}`);
                navigate(`/login?error=${encodeURIComponent(errorParam)}&error_description=${encodeURIComponent(errorDescriptionParam)}`, { replace: true });
                return;
            }
            // If no session and no explicit error, could be a stale callback or already handled.
            // Redirect to a sensible default or let AuthContext redirect.
            navigate('/', { replace: true });
        }
    };

    handleAuth();
    
    // Supabase's onAuthStateChange should also pick up changes.
    // This component is primarily for flows where an explicit callback URL is hit.
  }, [navigate, refreshSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <p className="text-lg text-gray-300">Processing authentication...</p>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 ml-3"></div>
    </div>
  );
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 font-sans">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} /> 
            
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route element={<TeacherDashboard />}> 
                <Route index element={<Navigate to="my-seminars" replace />} />
                <Route path="my-seminars" element={<MySeminars />} />
                <Route path="add-seminar" element={<AddSeminar />} />
                <Route path="edit-seminar/:id" element={<EditSeminar />} />
                <Route path="attendance/:seminarId" element={<AttendanceManager />} />
                <Route path="roster/:seminarId" element={<ClassRoster />} />
                <Route path="attendance-history" element={<AttendanceHistory />} />
              </Route>
            </Route>
            
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route element={<StudentDashboard />}>
                 <Route index element={<Navigate to="dashboard-overview" replace />} />
                 <Route path="dashboard-overview" element={<StudentDashboardOverview />} />
                 <Route path="schedule" element={<StudentScheduleView />} />
                 <Route path="browse-classes" element={<ClassBrowser />} />
                 <Route path="appointments" element={<StudentAppointmentsView />} />
                 <Route path="notifications" element={<StudentNotificationsView />} />
              </Route>
            </Route>

            <Route path="/specialist" element={<ProtectedRoute allowedRoles={['specialist']} />}>
              <Route element={<SpecialistDashboard />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SpecialistDashboardOverview />} />
                <Route path="appointments" element={<AppointmentCalendarView />} /> 
                <Route path="my-schedule" element={<SpecialistMySchedule />} />
                <Route path="student-viewer" element={<SpecialistStudentManagement />} /> 
                <Route path="student-groups" element={<SpecialistGroupManagement />} />
                <Route path="special-events" element={<SpecialistEventManagement />} />
                <Route path="notifications" element={<SpecialistNotificationCenter />} />
                <Route path="settings" element={<SpecialistSettings />} />
              </Route>
            </Route>

            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminDashboard />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardOverview />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="tenants" element={<TenantManagementView />} />
                <Route path="system-config" element={<AdminSystemConfig />} />
                
                <Route path="integrations" element={<IntegrationManagementLayout />}>
                  <Route index element={<Navigate to="providers" replace />} />
                  <Route path="providers" element={<IntegrationProviderList />} />
                  <Route path="instances" element={<IntegrationInstanceList />} />
                  <Route path="instances/new" element={<IntegrationForm />} /> {/* Query param for provider type */}
                  <Route path="instances/edit/:instanceId" element={<IntegrationForm />} />
                  <Route path="instances/:instanceId" element={<IntegrationDetailView />} />
                  <Route path="setup/google" element={<GoogleAuthSetup />} />
                  {/* Add routes for other specific setup wizards e.g. classlink, skyward */}
                  <Route path="mappings" element={<DataMappingDashboard />} /> 
                  <Route path="mappings/instance/:instanceId" element={<DataMappingDashboard />} /> {/* More specific mapping view */}
                  <Route path="sync-logs" element={<SyncLogDashboard />} />
                  <Route path="sync-logs/:instanceId" element={<SyncLogDashboard />} />
                </Route>

                <Route path="reports" element={<AdminReports />} />
                <Route path="parent-tours" element={<ParentTourScheduler />} />
                <Route path="data-tools" element={<AdminDataTools />} />
              </Route>
            </Route>
            
            <Route path="/" element={<ProtectedRoute><NavigateToDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} /> 
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

const NavigateToDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <Navigate to="/teacher/my-seminars" replace />;
  if (user?.role === 'student') return <Navigate to="/student/dashboard-overview" replace />;
  if (user?.role === 'specialist') return <Navigate to="/specialist/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />; 
};

export default App;
