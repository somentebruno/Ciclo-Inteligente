import AppLayout from '@/Layouts/AppLayout';
import { usePage } from '@inertiajs/react';

export default function Home() {
    const { globalPlans, auth } = usePage().props;
    const activeCycle = globalPlans?.activeCycle;

    return (
        <AppLayout title="Início">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                    Olá, {auth.user?.name.split(' ')[0]}!
                </h2>
                <p className="text-slate-600 mb-4">
                    Esta é a sua página inicial. No momento, você está visualizando os dados do plano de estudos:
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg font-medium border border-brand-200">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    {activeCycle ? activeCycle.name : 'Nenhum plano ativo'}
                </div>
                
                <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                    <p>Você pode alterar o plano de estudos ativo no seletor localizado no canto superior direito.</p>
                    <p className="mt-2">Todo o conteúdo do site (Metas, Tarefas, Revisões, Plano Semanal e Desempenho) refletirá o plano escolhido.</p>
                </div>
            </div>
        </AppLayout>
    );
}
