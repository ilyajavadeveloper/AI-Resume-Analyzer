import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

const Auth = () => {
    const { auth, isLoading, error } = usePuterStore();
    const navigate = useNavigate();
    const location = useLocation();

    const next =
        new URLSearchParams(location.search).get("next") || "/";

    useEffect(() => {
        if (auth.isAuthenticated) {
            console.log("➡️ Redirecting to", next);
            navigate(next, { replace: true });
        }
    }, [auth.isAuthenticated, next, navigate]);

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="gradient-border">
                <section className="bg-white rounded-2xl p-10 flex flex-col gap-6">
                    <h1>Welcome</h1>
                    <h2>Log in to continue</h2>

                    {error && (
                        <p className="text-red-600 text-sm">{error}</p>
                    )}

                    <button
                        className="auth-button"
                        disabled={isLoading}
                        onClick={auth.signIn}
                    >
                        {isLoading ? "Signing in…" : "Log In"}
                    </button>
                </section>
            </div>
        </main>
    );
};

export default Auth;
