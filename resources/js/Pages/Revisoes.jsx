import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Revisoes({ reviews = [], dueToday = 0 }) {
    const pending = reviews.filter((r) => !r.done);

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {dueToday > 0 ? (
                    <>
                        Você tem <strong>{dueToday} revisão(ões)</strong> agendada(s) para hoje. A
                        repetição espaçada fixa o conteúdo na memória de longo prazo.
                    </>
                ) : (
                    <>Nenhuma revisão para hoje. As revisões inteligentes aparecem aqui conforme seu progresso.</>
                )}
            </div>

            {pending.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <p className="text-sm text-slate-500">
                        Nenhuma revisão planejada. Marque aulas em “Já estudei” no onboarding para gerar
                        revisões inteligentes.
                    </p>
                    <Link
                        href="/onboarding"
                        className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                        Montar meu plano
                    </Link>
                </div>
            ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {pending.map((rev) => (
                        <li key={rev.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: rev.subject?.color ?? '#94a3b8' }}
                                    />
                                    {rev.subject?.name}
                                </span>
                                <span
                                    className={
                                        'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                                        (rev.is_today
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-slate-100 text-slate-500')
                                    }
                                >
                                    {rev.due_label}
                                </span>
                            </div>
                            <p className="mt-2 font-semibold text-slate-900">{rev.title}</p>
                            <Link
                                href={`/tarefas/${rev.id}`}
                                className="mt-4 block w-full rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-center text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                            >
                                Revisar agora
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

Revisoes.layout = (page) => <AppLayout title="Revisões">{page}</AppLayout>;
