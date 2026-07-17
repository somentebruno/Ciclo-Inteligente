import AppLayout from '@/Layouts/AppLayout';
import DisciplinaCard from '@/Components/DisciplinaCard';

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
