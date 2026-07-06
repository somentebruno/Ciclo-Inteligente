import AppLayout from '@/Layouts/AppLayout';

/* --- Um card por disciplina: nome + 3 colunas de estatísticas ------------ */
function DisciplinaCard({ subject }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
                <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color }}
                />
                <p className="truncate text-base font-semibold text-slate-900">{subject.name}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 text-center">
                <div className="px-2">
                    <p className="text-2xl font-bold text-slate-900">{subject.topics_studied}</p>
                    <p className="mt-1 text-xs text-slate-500">Tópicos Estudados</p>
                </div>
                <div className="px-2">
                    <p className="text-2xl font-bold text-slate-900">{subject.topics_total}</p>
                    <p className="mt-1 text-xs text-slate-500">Tópicos Totais</p>
                </div>
                <div className="px-2">
                    <p className="text-2xl font-bold text-slate-900">{subject.questions_resolved}</p>
                    <p className="mt-1 text-xs text-slate-500">Questões Resolvidas</p>
                </div>
            </div>
        </div>
    );
}

export default function Disciplinas({ hasPlan = false, subjects = [] }) {
    if (!hasPlan) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
                Você ainda não tem um plano ativo. Crie um plano para ver suas disciplinas aqui.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl">
            {subjects.length === 0 ? (
                <p className="text-center text-sm text-slate-400">
                    Nenhuma disciplina cadastrada neste plano.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => (
                        <DisciplinaCard key={subject.id} subject={subject} />
                    ))}
                </div>
            )}
        </div>
    );
}

Disciplinas.layout = (page) => <AppLayout title="Disciplinas">{page}</AppLayout>;
