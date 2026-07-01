import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function durationLabel(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `${h}h${String(m).padStart(2, '0')}`;
    if (h) return `${h}h`;
    return `${m}min`;
}

export default function PlanoSemanal({ days = [], cycle }) {
    const totalBlocks = days.reduce((acc, d) => acc + d.blocks.length, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">
                        {cycle
                            ? `${cycle.name} · ${cycle.weekly_tasks} tarefas/semana (~${cycle.weekly_hours}h)`
                            : 'Distribuição semanal gerada a partir dos pesos das disciplinas.'}
                    </p>
                </div>
                <Link
                    href="/onboarding"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                    Gerar novo ciclo
                </Link>
            </div>

            {totalBlocks === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <p className="text-sm text-slate-500">
                        Nenhuma tarefa agendada para os próximos 7 dias. Monte seu plano para gerar o ciclo.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
                    {days.map((dia) => (
                        <div
                            key={dia.day}
                            className={
                                'flex min-h-40 flex-col rounded-xl border bg-white p-3 ' +
                                (dia.is_today ? 'border-brand-300 ring-1 ring-brand-200' : 'border-slate-200')
                            }
                        >
                            <div className="mb-2 flex items-baseline justify-between">
                                <p className="text-sm font-semibold uppercase text-slate-700">{dia.weekday}</p>
                                <span className="text-xs text-slate-400">{dia.day}</span>
                            </div>
                            <div className="flex flex-1 flex-col gap-2">
                                {dia.blocks.length === 0 ? (
                                    <span className="text-xs text-slate-400">Descanso</span>
                                ) : (
                                    dia.blocks.map((bloco) => (
                                        <div
                                            key={bloco.id}
                                            className={
                                                'rounded-lg px-2.5 py-2 text-xs ' +
                                                (bloco.done ? 'opacity-50' : '')
                                            }
                                            style={{
                                                backgroundColor: (bloco.color ?? '#94a3b8') + '22',
                                                color: '#0f172a',
                                            }}
                                        >
                                            <p className="flex items-center gap-1 font-medium">
                                                <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: bloco.color ?? '#94a3b8' }}
                                                />
                                                {bloco.subject}
                                            </p>
                                            <p className="mt-0.5 text-slate-500">
                                                {bloco.type === 'review' ? 'Revisão · ' : ''}
                                                {durationLabel(bloco.minutes)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

PlanoSemanal.layout = (page) => <AppLayout title="Meu plano semanal">{page}</AppLayout>;
