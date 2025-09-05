"use client";
import { useState, useEffect } from "react";
import { DirectoryTable } from "@/app/components/content/DirectoryTable";
import { useAuth } from "@/app/hooks/useAuth";

interface Contact {
  id: string;
  anexo: string;
  numero: string;
  tipo: string;
  nombre: string;
  direccion: string;
  unidad: string;
  cargo: string;
  ubicacion: string;
  additionalContacts?: {
    nombre: string;
    unidad: string;
    cargo: string;
    direccion: string;
    ubicacion: string;
  }[];
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contactos");
      if (!response.ok) {
        throw new Error("Error al cargar los contactos");
      }
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    // TODO: Implementar edición de contacto
    console.log("Editar contacto:", contact);
  };

  const handleDeleteContact = (contactId: string) => {
    // TODO: Implementar eliminación de contacto
    console.log("Eliminar contacto:", contactId);
  };

  const handleRefreshContacts = () => {
    fetchContacts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando directorio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <button
            onClick={fetchContacts}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <DirectoryTable
        contacts={contacts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoggedIn={!!user}
        onEditContact={handleEditContact}
        onDeleteContact={handleDeleteContact}
        onRefreshContacts={handleRefreshContacts}
      />
    </div>
  );
}
