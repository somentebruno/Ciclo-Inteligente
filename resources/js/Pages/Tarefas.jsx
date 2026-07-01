import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function durationLabel(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `~${h}h${String(m).padStart(2, '0')}`;
    if (h) return `~${h}h`;
    return `~${m}min`;
}

const TYPE_LABEL = { theory: 'Teoria', review: 'Revisão' };
const FORMAT_LABEL = { pdf: 'PDF', video: 'Vídeo' };

function TaskCard({ task }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span
                className="hidden h-10 w-1.5 shrink-0 rounded-full sm:block"
                style={{ backgroundColor: task.subject?.color ?? '#94a3b8' }}
            />
            <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{task.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-500">{task.subject?.name}</span>
                    <span
                        className={
                            'rounded-full px-2 py-0.5 font-medium ' +
                            (task.type === 'review'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-brand-100 text-brand-700')
                        }
                    >
                        {TYPE_LABEL[task.type] ?? task.type}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                        {FORMAT_LABEL[task.format] ?? task.format}
                    </span>
                    <span className="text-slate-400">· {durationLabel(task.planned_minutes)}</span>
                    {task.scheduled_label && (
                        <span className="text-slate-400">· {task.scheduled_label}</span>
                    )}
                </div>
            </div>
            {task.completed_at ? (
                <span className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700">
                    Concluída
                </span>
            ) : (
                <Link
                    href={`/tarefas/${task.id}`}
                    className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                    Entrar
                </Link>
            )}
        </div>
    );
}

const TABS = [
    { key: 'upcoming', label: 'Próximas tarefas' },
    { key: 'reviews', label: 'Revisões planejadas' },
    { key: 'completed', label: 'Concluídas recentes' },
];

export default function Tarefas({ overview, upcoming = [], reviews = [], completed = [] }) {
    const [tab, setTab] = useState('upcoming');
    const lists = { upcoming, reviews, completed };
    const current = lists[tab];

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            {/* Overview dos próximos 7 dias */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">Próximos 7 dias</h2>
                    <span className="text-sm text-slate-500">
                        {overview?.plannedSessions ?? 0} sessões planejadas
                    </span>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-2">
                    {(overview?.days ?? []).map((d, i) => (
                        <div
                            key={d.date}
                            className={
                                'rounded-lg border p-2 text-center ' +
                                (i === 0 ? 'border-brand-300 bg-brand-50' : 'border-slate-200')
                            }
                        >
                            <p className="text-[11px] uppercase text-slate-400">{d.weekday}</p>
                            <p className="text-xs text-slate-500">{d.day}</p>
                            <p className="mt-1 text-lg font-bold text-slate-900">{d.count}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Toggle tabs */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={
                            'rounded-md px-3 py-1.5 text-sm font-medium transition ' +
                            (tab === t.key
                                ? 'bg-brand-600 text-white'
                                : 'text-slate-600 hover:text-brand-600')
                        }
                    >
                        {t.label}
                        <span
                            className={
                                'ml-1.5 rounded-full px-1.5 text-xs ' +
                                (tab === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500')
                            }
                        >
                            {lists[t.key].length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Lista */}
            <div className="space-y-3">
                {current.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <p className="text-sm text-slate-500">
                            {tab === 'completed'
                                ? 'Nenhuma tarefa concluída ainda.'
                                : 'Nenhuma tarefa aqui.'}
                        </p>
                        {tab !== 'completed' && (
                            <Link
                                href="/onboarding"
                                className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                            >
                                Montar meu plano
                            </Link>
                        )}
                    </div>
                ) : (
                    current.map((task) => <TaskCard key={task.id} task={task} />)
                )}
            </div>
        </div>
    );
}

Tarefas.layout = (page) => <AppLayout title="Minhas tarefas">{page}</AppLayout>;
