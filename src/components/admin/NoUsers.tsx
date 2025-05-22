
import { TableCell, TableRow } from "@/components/ui/table";

export const NoUsers = () => (
  <TableRow>
    <TableCell colSpan={5} className="text-center py-4">
      No hay usuarios registrados
    </TableCell>
  </TableRow>
);
