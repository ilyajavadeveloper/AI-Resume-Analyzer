import { create } from "zustand";

declare global {
    interface Window {
        puter: any;
    }
}

interface PuterStore {
    isLoading: boolean;
    error: string | null;
    puterReady: boolean;

    auth: {
        user: PuterUser | null;
        isAuthenticated: boolean;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        checkAuthStatus: () => Promise<boolean>;
        getUser: () => PuterUser | null;
    };

    fs: {
        read: (path: string) => Promise<Blob | undefined>;
        upload: (files: File[] | Blob[]) => Promise<FSItem | undefined>;
    };

    ai: {
        feedback: (path: string, message: string) => Promise<AIResponse>;
    };

    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        set: (key: string, value: string) => Promise<boolean | undefined>;
    };

    init: () => void;
    clearError: () => void;
}

const getPuter = () =>
    typeof window !== "undefined" && window.puter ? window.puter : null;

export const usePuterStore = create<PuterStore>((set, get) => {
    const setError = (msg: string) => {
        console.error("PUTER ERROR:", msg);
        set({ error: msg, isLoading: false });
    };

    /* ================= AUTH ================= */

    const checkAuthStatus = async (): Promise<boolean> => {
        const puter = getPuter();
        if (!puter) return false;

        const isSignedIn = await puter.auth.isSignedIn();
        if (!isSignedIn) {
            set({
                auth: {
                    ...get().auth,
                    user: null,
                    isAuthenticated: false,
                },
            });
            return false;
        }

        const user = await puter.auth.getUser();
        set({
            auth: {
                ...get().auth,
                user,
                isAuthenticated: true,
            },
        });
        return true;
    };

    const signIn = async () => {
        const puter = getPuter();
        if (!puter) return setError("Puter not available");
        await puter.auth.signIn();
        await checkAuthStatus();
    };

    const signOut = async () => {
        const puter = getPuter();
        if (!puter) return setError("Puter not available");
        await puter.auth.signOut();
        set({
            auth: {
                ...get().auth,
                user: null,
                isAuthenticated: false,
            },
        });
    };

    /* ================= FS ================= */

    const fsRead = async (path: string) => {
        const puter = getPuter();
        if (!puter) return;
        return puter.fs.read(path);
    };

    const fsUpload = async (files: File[] | Blob[]) => {
        const puter = getPuter();
        if (!puter) return;
        return puter.fs.upload(files);
    };

    /* ================= AI (🔥 MOCK – СТАБИЛЬНО) ================= */

    const feedback = async (_path: string, _message: string) => {
        // 🔥 MOCK RESPONSE — НИКАКОГО PUTER AI
        return {
            message: {
                content: JSON.stringify({
                    overallScore: 82,
                    ATS: {
                        score: 76,
                        tips: [
                            "Add measurable achievements",
                            "Use more ATS keywords from job description",
                            "Improve resume summary clarity",
                        ],
                    },
                    strengths: [
                        "Relevant technical stack",
                        "Clear project structure",
                        "Good formatting",
                    ],
                    weaknesses: [
                        "Not enough quantified impact",
                        "Summary too generic",
                    ],
                    suggestions: [
                        "Add metrics (%, $, numbers)",
                        "Tailor resume per job application",
                    ],
                }),
            },
        } as AIResponse;
    };

    /* ================= KV ================= */

    const kvGet = async (key: string) => {
        const puter = getPuter();
        if (!puter) return;
        return puter.kv.get(key);
    };

    const kvSet = async (key: string, value: string) => {
        const puter = getPuter();
        if (!puter) return;
        return puter.kv.set(key, value);
    };

    /* ================= INIT ================= */

    const init = () => {
        if (getPuter()) {
            set({ puterReady: true });
            checkAuthStatus();
            return;
        }

        const interval = setInterval(() => {
            if (getPuter()) {
                clearInterval(interval);
                set({ puterReady: true });
                checkAuthStatus();
            }
        }, 100);
    };

    return {
        isLoading: false,
        error: null,
        puterReady: false,

        auth: {
            user: null,
            isAuthenticated: false,
            signIn,
            signOut,
            checkAuthStatus,
            getUser: () => get().auth.user,
        },

        fs: {
            read: fsRead,
            upload: fsUpload,
        },

        ai: {
            feedback,
        },

        kv: {
            get: kvGet,
            set: kvSet,
        },

        init,
        clearError: () => set({ error: null }),
    };
});
