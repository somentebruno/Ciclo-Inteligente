import { useState } from 'react';
import { router } from '@inertiajs/react';
import ModalShell from '@/Components/ModalShell';

export default function DeleteConfirmModal({ url, title, message, onClose }) {
    const [busy, setBusy] = useState(false);

    const confirm = () => {
        setBusy(true);
        router.delete(url, { preserveScroll: true, onFinish: () => setBusy(false) });
    };

    return (
        <ModalShell onClose={onClose} busy={busy} maxWidth="max-w-sm">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
            <div className="mt-5 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={confirm}
                    disabled={busy}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                >
                    {busy ? 'Apagando…' : 'Sim, apagar'}
                </button>
            </div>
        </ModalShell>
    );
}
