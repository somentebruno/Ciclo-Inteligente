import AppLayout from '@/Layouts/AppLayout';

const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const plano = {
    Seg: [{ subject: 'Constitucional', minutes: 60, color: 'bg-green-100 text-green-800' }],
    Ter: [{ subject: 'Português', minutes: 45, color: 'bg-brand-100 text-brand-800' }],
    Qua: [{ subject: 'Administrativo', minutes: 60, color: 'bg-amber-100 text-amber-800' }],
    Qui: [{ subject: 'Raciocínio Lógico', minutes: 30, color: 'bg-purple-100 text-purple-800' }],
    Sex: [{ subject: 'Informática', minutes: 30, color: 'bg-sky-100 text-sky-800' }],
    Sáb: [{ subject: 'Simulado', minutes: 120, color: 'bg-slate-200 text-slate-800' }],
    Dom: [],
};

export default function PlanoSemanal() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Distribuição semanal gerada a partir dos pesos das disciplinas.
                </p>
                <button
                    type="button"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                    Gerar novo ciclo
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
                {dias.map((dia) => (
                    <div
                        key={dia}
                        className="flex min-h-40 flex-col rounded-xl border border-slate-200 bg-white p-3"
                    >
                        <p className="mb-2 text-sm font-semibold text-slate-700">{dia}</p>
                        <div className="flex flex-1 flex-col gap-2">
                            {plano[dia].length === 0 ? (
                                <span className="text-xs text-slate-400">Descanso</span>
                            ) : (
                                plano[dia].map((bloco, i) => (
                                    <div
                                        key={i}
                                        className={'rounded-lg px-2.5 py-2 text-xs font-medium ' + bloco.color}
                                    >
                                        <p>{bloco.subject}</p>
                                        <p className="opacity-70">{bloco.minutes} min</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

PlanoSemanal.layout = (page) => <AppLayout title="Meu plano semanal">{page}</AppLayout>;
