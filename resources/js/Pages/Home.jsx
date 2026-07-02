import AppLayout from '@/Layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
}

export default function Home() {
    const { currentPlan, userPlans = [], auth } = usePage().props;
    const firstName = auth.user?.name?.split(' ')[0];

    return (
        <AppLayout title="Início">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-800">
                    {getGreeting()}, {firstName} 👊
                </h1>
                <p className="mt-1 mb-4 text-slate-600">
                    Foque na próxima tarefa para manter o ritmo.
                </p>

                {currentPlan ? (
                    <>
                        <p className="text-slate-600 mb-4">
                            Este é o seu plano de estudos atual:
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg font-medium border border-brand-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            </svg>
                            {currentPlan.name}
                        </div>

                        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                            <p>
                                Todo o conteúdo do site (Metas, Tarefas, Revisões, Plano Semanal e
                                Desempenho) reflete este plano.
                            </p>
                            <p className="mt-2">
                                {userPlans.length > 1
                                    ? 'Você tem mais de um plano — troque o plano ativo pelo seletor no topo da página.'
                                    : 'Você pode ter um plano por cargo.'}{' '}
                                Para criar ou apagar planos, vá em{' '}
                                <Link href="/planos" className="font-medium text-brand-700 underline">
                                    Planos
                                </Link>
                                .
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-slate-600 mb-4">
                            Você ainda não tem um plano de estudos. Crie um para começar.
                        </p>
                        <Link
                            href="/planos"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-brand-700"
                        >
                            Criar meu plano
                        </Link>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
