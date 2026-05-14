'use client';

import { Trash2 } from 'lucide-react';
import { deleteSubscription } from '@/app/actions';
import { toast } from 'sonner';

export default function DeleteButton({ id, name }: { id: string, name: string }) {
  const handleDelete = async () => {
    if (window.confirm(`¿Seguro que quieres eliminar ${name}?`)) {
      const toastId = toast.loading("Eliminando...");
      await deleteSubscription(id);
      toast.success("Eliminado correctamente", { id: toastId });
    }
  };

  return (
    <button onClick={handleDelete} className="text-slate-200 hover:text-red-500 hover:bg-red-50 p-4 rounded-2xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100">
      <Trash2 size={24} />
    </button>
  );
}