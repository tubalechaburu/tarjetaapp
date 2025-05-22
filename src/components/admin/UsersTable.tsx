
import { useUsers } from "@/utils/userRoleUtils";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRow } from "./UserRow";
import { NoUsers } from "./NoUsers";
import { LoadingUsers } from "./LoadingUsers";
import { ErrorDisplay } from "./ErrorDisplay";

export const UsersTable = () => {
  const { users, loading, error, fetchUsers } = useUsers();

  if (loading) {
    return <LoadingUsers />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Actualizado</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <NoUsers />
          ) : (
            users.map((user) => (
              <UserRow 
                key={user.id} 
                user={user} 
                onRoleUpdate={fetchUsers} 
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
