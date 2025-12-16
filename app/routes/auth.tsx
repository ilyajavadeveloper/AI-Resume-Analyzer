import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
    { title: "Resumind | Auth" },
    { name: "description", content: "Log into your account" },
];

const Auth = () => {
    const { puterReady, isLoading, error, auth } = usePuterStore();
    const location = useLocation();
    const navigate = useNavigate();

    // куда редиректить после логина
    const next =
        new URLSearchParams(location.search).get("next") || "/";

    /**
     * 🔁 После успешного логина — уходим
     */
    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate(next, { replace: true });
        }
    }, [auth.isAuthenticated, next, navigate]);

    /**
     * ⛔️ Пока puter не загрузился — ничего не делаем
     */
    if (!puterReady) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 animate-pulse">
                    Initializing authentication…
                </p>
            </main>
        );
    }

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10 w-[360px]">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-3xl font-bold">Welcome</h1>
                        <h2 className="text-gray-600">
                            Log in to continue your job journey
                        </h2>
                    </div>

                    {/* ❗️ Ошибка */}
                    {error && (
                        <div className="text-sm text-red-600 text-center">
                            {error}
                        </div>
                    )}

                    {/* 🔘 Кнопки */}
                    <div className="flex flex-col gap-3">
                        {isLoading ? (
                            <button
                                className="auth-button animate-pulse"
                                disabled
                            >
                                Signing you in…
                            </button>
                        ) : auth.isAuthenticated ? (
                            <button
                                className="auth-button"
                                onClick={auth.signOut}
                            >
                                Log out
                            </button>
                        ) : (
                            <button
                                className="auth-button"
                                onClick={auth.signIn}
                            >
                                Log in with Puter
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Auth;
