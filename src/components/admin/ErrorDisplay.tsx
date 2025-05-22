
interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
    <p className="text-red-700">Error al cargar usuarios: {error}</p>
  </div>
);
