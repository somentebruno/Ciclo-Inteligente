import AppLayout from '@/Layouts/AppLayout';

const metas = [
    { id: 1, subject: 'Direito Constitucional', minutes: 60, done: true },
    { id: 2, subject: 'Português', minutes: 45, done: false },
    { id: 3, subject: 'Raciocínio Lógico', minutes: 30, done: false },
];

export default function MetasDoDia() {
    const total = metas.reduce((acc, m) => acc + m.minutes, 0);
    const concluido = metas.filter((m) => m.done).reduce((acc, m) => acc + m.minutes, 0);
    const progresso = total ? Math.round((concluido / total) * 100) : 0;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">Progresso de hoje</p>
                    <span className="text-sm font-semibold text-brand-600">{progresso}%</span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{ width: `${progresso}%` }}
                    />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                    {concluido} de {total} minutos concluídos
                </p>
            </div>

            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {metas.map((meta) => (
                    <li key={meta.id} className="flex items-center gap-4 px-5 py-4">
                        <span
                            className={
                                'flex h-6 w-6 items-center justify-center rounded-full border ' +
                                (meta.done
                                    ? 'border-brand-600 bg-brand-600 text-white'
                                    : 'border-slate-300 text-transparent')
                            }
                        >
                            ✓
                        </span>
                        <div className="flex-1">
                            <p
                                className={
                                    'font-medium ' +
                                    (meta.done ? 'text-slate-400 line-through' : 'text-slate-900')
                                }
                            >
                                {meta.subject}
                            </p>
                            <p className="text-sm text-slate-500">{meta.minutes} minutos</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

MetasDoDia.layout = (page) => <AppLayout title="Metas do dia">{page}</AppLayout>;
