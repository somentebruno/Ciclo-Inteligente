/* --- Um card por disciplina: nome + 3 colunas de estatísticas ------------ */
export default function DisciplinaCard({ subject }) {
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
