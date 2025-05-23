
import React from "react";
import { Link } from "react-router-dom";
import { BusinessCard } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ExternalLink, Edit, Plus } from "lucide-react";

interface UserCardsTableProps {
  cards: BusinessCard[];
}

const UserCardsTable: React.FC<UserCardsTableProps> = ({ cards }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mis Tarjetas ({cards.length})</CardTitle>
        <Link to="/create">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Nueva tarjeta
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {cards.length === 0 ? (
          <p className="text-muted-foreground">No tienes tarjetas creadas aún.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>{card.name}</TableCell>
                  <TableCell>{card.company || '-'}</TableCell>
                  <TableCell>{card.email || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link to={`/card/${card.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ExternalLink className="h-4 w-4" />
                          Ver
                        </Button>
                      </Link>
                      <Link to={`/edit/${card.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCardsTable;
