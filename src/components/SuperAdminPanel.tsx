
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthContext";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SuperAdminUsersTable } from "@/components/admin/SuperAdminUsersTable";
import { toast } from "sonner";

export const SuperAdminPanel = () => {
  const { user, userRole, isSuperAdmin } = useAuth();
  
  useEffect(() => {
    console.log("SuperAdminPanel - Current role:", userRole);
    console.log("SuperAdminPanel - User:", user);
    
    // Remove hardcoded email check - use only secure role-based authorization
    const hasValidAccess = userRole === 'superadmin' || (isSuperAdmin && isSuperAdmin());
    
    if (user && !hasValidAccess) {
      toast.error(`Access denied. Superadmin role required. Current role: ${userRole || 'no role assigned'}`);
    }
  }, [user, userRole, isSuperAdmin]);

  // Use only role-based authorization - no hardcoded email checks
  const canAccess = userRole === 'superadmin' || (isSuperAdmin && isSuperAdmin());

  // Enhanced security check - don't render if unauthorized
  if (!user || !canAccess) {
    return null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-6 rounded-lg">
      <AdminHeader />
      <div className="mt-6">
        <SuperAdminUsersTable />
      </div>
    </div>
  );
};
