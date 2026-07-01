import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const TYPE_LABEL = { theory: 'Teoria', review: 'Revisão' };

function durationLabel(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `${h}h${String(m).padStart(2, '0')}`;
    if (h) return `${h}h`;
    return `${m}min`;
}

export default function MetasDoDia({ metas = [], cycle }) {
    const total = metas.reduce((acc, m) => acc + m.minutes, 0);
    const concluido = metas.filter((m) => m.done).reduce((acc, m) => acc + m.minutes, 0);
    const progresso = total ? Math.round((concluido / total) * 100) : 0;

    if (metas.length === 0) {
        return (
            <div className="mx-auto max-w-4xl">
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <p className="text-sm text-slate-500">
                        Você não tem metas para hoje. Monte seu plano para começar.
                    </p>
                    <Link
                        href="/onboarding"
                        className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                        Montar meu plano
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                        Progresso de hoje{cycle ? ` · ${cycle.name}` : ''}
                    </p>
                    <span className="text-sm font-semibold text-brand-600">{progresso}%</span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{ width: `${progresso}%` }}
                    />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                    {concluido} de {total} minutos concluídos ·{' '}
                    {metas.filter((m) => m.done).length}/{metas.length} tarefas
                </p>
            </div>

            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {metas.map((meta) => (
                    <li key={meta.id} className="flex items-center gap-4 px-5 py-4">
                        <span
                            className={
                                'flex h-6 w-6 items-center justify-center rounded-full border text-xs ' +
                                (meta.done
                                    ? 'border-brand-600 bg-brand-600 text-white'
                                    : 'border-slate-300 text-transparent')
                            }
                        >
                            ✓
                        </span>
                        <span
                            className="hidden h-8 w-1.5 rounded-full sm:block"
                            style={{ backgroundColor: meta.subject?.color ?? '#94a3b8' }}
                        />
                        <div className="min-w-0 flex-1">
                            <p
                                className={
                                    'truncate font-medium ' +
                                    (meta.done ? 'text-slate-400 line-through' : 'text-slate-900')
                                }
                            >
                                {meta.title}
                            </p>
                            <p className="text-sm text-slate-500">
                                {meta.subject?.name} · {TYPE_LABEL[meta.type] ?? meta.type} ·{' '}
                                {durationLabel(meta.minutes)}
                            </p>
                        </div>
                        {meta.done ? (
                            <span className="text-sm font-medium text-green-600">Concluída</span>
                        ) : (
                            <Link
                                href={`/tarefas/${meta.id}`}
                                className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                            >
                                Entrar
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

MetasDoDia.layout = (page) => <AppLayout title="Metas do dia">{page}</AppLayout>;
