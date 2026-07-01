import AppLayout from '@/Layouts/AppLayout';

const tarefas = [
    { id: 1, title: 'Resolver 20 questões de Constitucional', tag: 'Questões', done: false },
    { id: 2, title: 'Assistir aula: Controle de Constitucionalidade', tag: 'Teoria', done: false },
    { id: 3, title: 'Ler lei seca — Art. 5º', tag: 'Lei seca', done: true },
];

export default function Tarefas() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    {tarefas.filter((t) => !t.done).length} tarefas pendentes
                </p>
                <button
                    type="button"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                    + Nova tarefa
                </button>
            </div>

            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {tarefas.map((tarefa) => (
                    <li key={tarefa.id} className="flex items-center gap-4 px-5 py-4">
                        <input
                            type="checkbox"
                            defaultChecked={tarefa.done}
                            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            readOnly
                        />
                        <span
                            className={
                                'flex-1 text-sm font-medium ' +
                                (tarefa.done ? 'text-slate-400 line-through' : 'text-slate-900')
                            }
                        >
                            {tarefa.title}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {tarefa.tag}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

Tarefas.layout = (page) => <AppLayout title="Tarefas">{page}</AppLayout>;
