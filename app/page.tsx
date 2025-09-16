"use client";
import { useState, useEffect } from "react";
import { DirectoryTable } from "@/app/components/content/DirectoryTable";
import { ConfirmDialog } from "@/app/components/content/ConfirmDialog";
import { useAuth } from "@/app/hooks/useAuth";
import toast from "react-hot-toast";

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
  sigla: string;
  additionalContacts?: {
    nombre: string;
    unidad: string;
    cargo: string;
    direccion: string;
    ubicacion: string;
    sigla: string;
  }[];
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    contactId: string;
    contactName: string;
  }>({ isOpen: false, contactId: "", contactName: "" });
  const { user, token } = useAuth();

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

  const handleDeleteContact = async (contactId: string) => {
    if (!token) {
      toast.error("No tienes permisos para eliminar contactos");
      return;
    }

    // Encontrar el contacto y mostrar modal de confirmación
    const contact = contacts.find((c) => c.id === contactId);
    const contactName = contact?.nombre || contact?.numero || "este contacto";

    setDeleteDialog({
      isOpen: true,
      contactId,
      contactName,
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/contactos/${deleteDialog.contactId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar contacto");
      }

      toast.success("Contacto eliminado exitosamente");
      // Refrescar la lista de contactos
      fetchContacts();
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar contacto"
      );
    } finally {
      setDeleteDialog({ isOpen: false, contactId: "", contactName: "" });
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, contactId: "", contactName: "" });
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

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Eliminar Contacto"
        message={`¿Estás seguro de que deseas eliminar ${deleteDialog.contactName}?\n\nEsta acción no se puede deshacer y eliminará toda la información asociada al contacto.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </div>
  );
}
