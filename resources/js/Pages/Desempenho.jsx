import AppLayout from '@/Layouts/AppLayout';

const stats = [
    { label: 'Horas na semana', value: '12h', hint: '+2h vs. semana passada' },
    { label: 'Questões resolvidas', value: 340, hint: '68% de acertos' },
    { label: 'Sequência de estudo', value: '9 dias', hint: 'Mantenha o ritmo!' },
    { label: 'Revisões em dia', value: '92%', hint: '3 pendentes' },
];

const porDisciplina = [
    { subject: 'Direito Constitucional', accuracy: 74, color: 'bg-green-500' },
    { subject: 'Português', accuracy: 81, color: 'bg-brand-500' },
    { subject: 'Direito Administrativo', accuracy: 63, color: 'bg-amber-500' },
    { subject: 'Raciocínio Lógico', accuracy: 58, color: 'bg-purple-500' },
    { subject: 'Informática', accuracy: 88, color: 'bg-sky-500' },
];

export default function Desempenho() {
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
                <div className="mt-5 space-y-4">
                    {porDisciplina.map((d) => (
                        <div key={d.subject}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-700">{d.subject}</span>
                                <span className="text-slate-500">{d.accuracy}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={'h-full rounded-full ' + d.color}
                                    style={{ width: `${d.accuracy}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <p className="mt-5 text-xs text-slate-400">
                    O ciclo inteligente prioriza automaticamente as disciplinas com menor taxa de acerto.
                </p>
            </section>
        </div>
    );
}

Desempenho.layout = (page) => <AppLayout title="Desempenho">{page}</AppLayout>;
