import { create } from "zustand";

/* =========================
   GLOBAL
========================= */
declare global {
    interface Window {
        puter: any;
    }
}

/* =========================
   TYPES
========================= */
export type PuterUser = {
    id: string;
    username?: string;
    email?: string;
};

export type FSItem = {
    id: string;
    name: string;
    path: string;
    size?: number;
    type?: string;
};

export type KVItem = {
    key: string;
    value: string;
};

export type AIResponse = {
    message: {
        content:
            | string
            | {
            text?: string;
        }[];
    };
};

interface PuterStore {
    puterReady: boolean;
    isLoading: boolean;
    error: string | null;

    auth: {
        user: PuterUser | null;
        isAuthenticated: boolean;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        checkAuthStatus: () => Promise<void>;
    };

    fs: {
        upload: (files: File[]) => Promise<FSItem>;
    };

    kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<void>;
        list: (pattern: string, withValues?: boolean) => Promise<KVItem[]>;
    };

    ai: {
        feedback: (path: string, prompt: string) => Promise<AIResponse>;
    };

    init: () => void;
}

/* =========================
   HELPERS
========================= */
const getPuter = () =>
    typeof window !== "undefined" && window.puter ? window.puter : null;

/* =========================
   STORE
========================= */
export const usePuterStore = create<PuterStore>((set, get) => ({
    puterReady: false,
    isLoading: false,
    error: null,

    /* ---------- AUTH ---------- */
    auth: {
        user: null,
        isAuthenticated: false,

        signIn: async () => {
            const p = getPuter();
            if (!p) return;

            set({ isLoading: true, error: null });

            try {
                await p.auth.signIn();
                await get().auth.checkAuthStatus();
            } catch (err: any) {
                set({
                    error:
                        err?.msg ||
                        err?.message ||
                        "Auth popup closed",
                    isLoading: false,
                });
            }
        },

        signOut: async () => {
            const p = getPuter();
            if (!p) return;

            await p.auth.signOut();

            set({
                auth: {
                    ...get().auth,
                    user: null,
                    isAuthenticated: false,
                },
            });
        },

        checkAuthStatus: async () => {
            const p = getPuter();
            if (!p) return;

            const signedIn = await p.auth.isSignedIn();
            if (!signedIn) {
                set({
                    auth: {
                        ...get().auth,
                        user: null,
                        isAuthenticated: false,
                    },
                    isLoading: false,
                });
                return;
            }

            const user = await p.auth.getUser();

            set({
                auth: {
                    ...get().auth,
                    user,
                    isAuthenticated: true,
                },
                isLoading: false,
            });
        },
    },

    /* ---------- FS ---------- */
    fs: {
        upload: async (files) => {
            const p = getPuter();
            if (!p) throw new Error("Puter not ready");

            const result = await p.fs.upload(files);
            return result;
        },
    },

    /* ---------- KV ---------- */
    kv: {
        get: async (key) => {
            const p = getPuter();
            if (!p) return null;
            return p.kv.get(key);
        },

        set: async (key, value) => {
            const p = getPuter();
            if (!p) return;
            await p.kv.set(key, value);
        },

        list: async (pattern) => {
            const p = getPuter();
            if (!p) return [];

            const keys = await p.kv.list(pattern, true);
            return keys as KVItem[];
        },
    },

    /* ---------- AI (MOCK) ---------- */
    ai: {
        feedback: async () => ({
            message: {
                content: JSON.stringify({
                    overallScore: 82,
                    ATS: { score: 76, tips: [] },
                    toneAndStyle: { score: 80, tips: [] },
                    content: { score: 78, tips: [] },
                    structure: { score: 74, tips: [] },
                    skills: { score: 85, tips: [] },
                }),
            },
        }),
    },

    /* ---------- INIT ---------- */
    init: () => {
        const i = setInterval(() => {
            if (getPuter()) {
                clearInterval(i);
                set({ puterReady: true });
                get().auth.checkAuthStatus();
            }
        }, 100);
    },
}));
