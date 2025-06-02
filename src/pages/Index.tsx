
import { AuthGuard } from "@/components/dashboard/AuthGuard";
import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

const Index = () => {
  const connectionStatus = useConnectionStatus();

  return (
    <AuthGuard>
      <DashboardContainer connectionStatus={connectionStatus} />
    </AuthGuard>
  );
};

export default Index;
