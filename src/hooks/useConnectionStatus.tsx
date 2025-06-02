
import { useState, useEffect } from "react";
import { checkSupabaseConnection } from "@/integrations/supabase/client";

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await checkSupabaseConnection();
        setConnectionStatus(connected);
      } catch (connectionError) {
        console.error("💥 Connection check error:", connectionError);
        setConnectionStatus(false);
      }
    };

    checkConnection();
  }, []);

  return connectionStatus;
};
