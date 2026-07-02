import { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';

/* --- Inline icons (heroicons-style) ------------------------------------- */
const iconProps = {
    fill: 'none',
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    stroke: 'currentColor',
    className: 'h-5 w-5 shrink-0',
};

const HomeIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.592 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const TargetIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);
const TasksIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ReviewIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992M4.51 9.349a7.5 7.5 0 0113.36-2.212m2.13 5.516a7.5 7.5 0 01-13.36 2.212" />
    </svg>
);
const CalendarIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
);
const ChartIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);
const CycleIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
);
const PlansIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
const MenuIcon = () => (
    <svg {...iconProps} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
);
const CloseIcon = () => (
    <svg {...iconProps} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/* --- Sidebar navigation ------------------------------------------------- */
const navigation = [
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Metas do dia', href: '/metas-do-dia', icon: TargetIcon },
    { name: 'Tarefas', href: '/tarefas', icon: TasksIcon },
    { name: 'Revisões', href: '/revisoes', icon: ReviewIcon },
    { name: 'Meu plano semanal', href: '/plano-semanal', icon: CalendarIcon },
    { name: 'Planejamento', href: '/planejamento', icon: CycleIcon },
    { name: 'Planos', href: '/planos', icon: PlansIcon },
    { name: 'Desempenho', href: '/desempenho', icon: ChartIcon },
];

function Sidebar({ currentUrl, onNavigate }) {
    return (
        <div className="flex h-full flex-col bg-slate-900 text-slate-300">
            <div className="flex h-16 items-center gap-2 px-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                    CI
                </span>
                <span className="text-base font-semibold text-white">Ciclo Inteligente</span>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const active =
                        currentUrl === item.href || currentUrl.startsWith(item.href + '/');
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
                                (active
                                    ? 'bg-brand-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white')
                            }
                        >
                            <Icon />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
                v0.1 · plano de estudos inteligente
            </div>
        </div>
    );
}

/* --- Main layout -------------------------------------------------------- */
export default function AppLayout({ title, children }) {
    const { url, props } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { currentPlan, userPlans = [], auth } = props;

    const handlePlanChange = (e) => {
        const planId = e.target.value;
        if (!planId || String(currentPlan?.id) === planId) return;
        router.post(`/planos/${planId}/ativar`, {}, { preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {title ? <Head title={title} /> : null}

            {/* Fixed sidebar (desktop) */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
                <Sidebar currentUrl={url} />
            </aside>

            {/* Mobile off-canvas sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/50"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute inset-y-0 left-0 w-64">
                        <Sidebar currentUrl={url} onNavigate={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Content column */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
                    <button
                        type="button"
                        className="text-slate-600 lg:hidden"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Abrir menu"
                    >
                        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                    {title ? (
                        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                    ) : null}

                    <div className="ml-auto flex items-center gap-3">
                        {userPlans.length > 1 ? (
                            <select
                                value={currentPlan?.id ?? ''}
                                onChange={handlePlanChange}
                                title="Trocar o plano ativo"
                                className="hidden max-w-xs rounded-md border-0 py-1.5 pl-3 pr-9 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-600 sm:block"
                            >
                                {userPlans.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        ) : currentPlan ? (
                            <span
                                title={currentPlan.name}
                                className="hidden max-w-xs truncate rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 sm:inline"
                            >
                                {currentPlan.name}
                            </span>
                        ) : (
                            <Link
                                href="/planos"
                                className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 sm:inline"
                            >
                                Criar um plano
                            </Link>
                        )}

                        {auth?.user && (
                            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                                <Link
                                    href="/profile"
                                    className="hidden text-sm font-medium text-slate-700 hover:text-brand-600 sm:block"
                                >
                                    {auth.user.name}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => router.post('/logout')}
                                    className="rounded-md px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                >
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
