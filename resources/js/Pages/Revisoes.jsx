import AppLayout from '@/Layouts/AppLayout';

const revisoes = [
    { id: 1, subject: 'Português', topic: 'Crase', due: 'Hoje', level: 3 },
    { id: 2, subject: 'Direito Administrativo', topic: 'Atos administrativos', due: 'Hoje', level: 2 },
    { id: 3, subject: 'Informática', topic: 'Redes de computadores', due: 'Amanhã', level: 1 },
];

const levelLabel = { 1: '24h', 2: '7 dias', 3: '30 dias' };

export default function Revisoes() {
    const dueToday = revisoes.filter((r) => r.due === 'Hoje').length;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Você tem <strong>{dueToday} revisões</strong> agendadas para hoje. A repetição
                espaçada fixa o conteúdo na memória de longo prazo.
            </div>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {revisoes.map((rev) => (
                    <li
                        key={rev.id}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                {rev.subject}
                            </span>
                            <span
                                className={
                                    'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                                    (rev.due === 'Hoje'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-100 text-slate-500')
                                }
                            >
                                {rev.due}
                            </span>
                        </div>
                        <p className="mt-2 font-semibold text-slate-900">{rev.topic}</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Intervalo atual: {levelLabel[rev.level]}
                        </p>
                        <button
                            type="button"
                            className="mt-4 w-full rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                        >
                            Revisar agora
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

Revisoes.layout = (page) => <AppLayout title="Revisões">{page}</AppLayout>;
