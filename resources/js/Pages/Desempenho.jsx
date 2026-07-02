import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';

export default function Desempenho({ hasPlan = false, stats = [], porDisciplina = [] }) {
    if (!hasPlan) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-slate-500">
                    Crie um plano de estudos para acompanhar seu desempenho.
                </p>
                <Link
                    href="/planos"
                    className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                    Criar meu plano
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{s.label}</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{s.value}</p>
                        <p className="mt-1 text-xs text-slate-400">{s.hint}</p>
                    </div>
                ))}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Taxa de acerto por disciplina</h2>

                {porDisciplina.length === 0 ? (
                    <p className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                        Ainda não há questões registradas. Registre seu desempenho ao concluir as
                        tarefas para ver a taxa de acerto por disciplina.
                    </p>
                ) : (
                    <>
                        <div className="mt-5 space-y-4">
                            {porDisciplina.map((d) => (
                                <div key={d.subject}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-700">{d.subject}</span>
                                        <span className="text-slate-500">{d.accuracy}%</span>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{ width: `${d.accuracy}%`, backgroundColor: d.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-5 text-xs text-slate-400">
                            O ciclo inteligente prioriza automaticamente as disciplinas com menor taxa
                            de acerto.
                        </p>
                    </>
                )}
            </section>
        </div>
    );
}

Desempenho.layout = (page) => <AppLayout title="Desempenho">{page}</AppLayout>;
