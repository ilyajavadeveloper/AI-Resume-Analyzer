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

export type PuterUser = {
    id: string;
    username?: string;
    email?: string;
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
        read: (path: string) => Promise<Blob | null>;
        upload: (files: File[] | Blob[]) => Promise<FSItem | null>;
    };

    kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<KVItem[]>;
    };

    ai: {
        feedback: (path: string, message: string) => Promise<AIResponse>;
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

            set({ isLoading: true });

            try {
                await p.auth.signIn();
                await get().auth.checkAuthStatus();
            } catch (e: any) {
                set({
                    error:
                        e?.msg ||
                        e?.message ||
                        "Authentication failed",
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
        read: async (path: string) => {
            const p = getPuter();
            if (!p) return null;

            return p.fs.read(path);
        },

        upload: async (files) => {
            const p = getPuter();
            if (!p) return null;

            return p.fs.upload(files);
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
            if (!p) return false;

            return p.kv.set(key, value);
        },

        list: async (pattern, returnValues = false) => {
            const p = getPuter();
            if (!p) return [];

            return p.kv.list(pattern, returnValues);
        },
    },

    /* ---------- AI (MOCK SAFE) ---------- */
    ai: {
        feedback: async () => ({
            message: {
                content: JSON.stringify({
                    overallScore: 80,
                    ATS: { score: 75, tips: [] },
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
