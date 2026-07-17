/* --- Modal: fundo + moldura padrão reaproveitada pelos diálogos ---------- */
export default function ModalShell({ onClose, busy, maxWidth = 'max-w-md', children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => !busy && onClose()} />
            <div className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-2xl`}>{children}</div>
        </div>
    );
}
