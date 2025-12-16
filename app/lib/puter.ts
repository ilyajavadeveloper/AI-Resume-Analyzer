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

export type AIResponse = {
    message: {
        content:
            | string
            | {
            text?: string;
        }[];
    };
};

export type PuterUser = {
    id: string;
    username?: string;
    email?: string;
};

export type KVItem = {
    key: string;
    value: string;
};

/* =========================
   STORE TYPE
========================= */
interface PuterStore {
    puterReady: boolean;
    isLoading: boolean;
    error: string | null;

    auth: {
        user: PuterUser | null;
        isAuthenticated: boolean;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        checkAuthStatus: () => Promise<boolean>;
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
        list: (
            pattern: string,
            returnValues?: boolean
        ) => Promise<KVItem[] | string[]>;
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
export const usePuterStore = create<PuterStore>((set) => ({
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
            await p.auth.signIn();
        },

        signOut: async () => {
            const p = getPuter();
            if (!p) return;
            await p.auth.signOut();
            set((s) => ({
                auth: {
                    ...s.auth,
                    user: null,
                    isAuthenticated: false,
                },
            }));
        },

        checkAuthStatus: async () => {
            const p = getPuter();
            if (!p) return false;

            const signedIn = await p.auth.isSignedIn();
            if (!signedIn) {
                set((s) => ({
                    auth: {
                        ...s.auth,
                        user: null,
                        isAuthenticated: false,
                    },
                }));
                return false;
            }

            const user = await p.auth.getUser();
            set((s) => ({
                auth: {
                    ...s.auth,
                    user,
                    isAuthenticated: true,
                },
            }));

            return true;
        },
    },

    /* ---------- FS ---------- */
    fs: {
        read: async (path) => {
            const p = getPuter();
            if (!p) return;
            return p.fs.read(path);
        },

        upload: async (files) => {
            const p = getPuter();
            if (!p) return;
            return p.fs.upload(files);
        },
    },

    /* ---------- AI (MOCK — СТАБИЛЬНО) ---------- */
    ai: {
        feedback: async () => ({
            message: {
                content: JSON.stringify({
                    overallScore: 78,
                    ATS: { score: 72, tips: [] },
                    toneAndStyle: { score: 80, tips: [] },
                    content: { score: 75, tips: [] },
                    structure: { score: 70, tips: [] },
                    skills: { score: 85, tips: [] },
                }),
            },
        }),
    },

    /* ---------- KV ---------- */
    kv: {
        get: async (key) => {
            const p = getPuter();
            if (!p) return;
            return p.kv.get(key);
        },

        set: async (key, value) => {
            const p = getPuter();
            if (!p) return;
            return p.kv.set(key, value);
        },

        list: async (pattern, returnValues = false) => {
            const p = getPuter();
            if (!p) return [];
            return p.kv.list(pattern, returnValues);
        },
    },

    /* ---------- INIT ---------- */
    init: () => {
        const interval = setInterval(() => {
            if (getPuter()) {
                clearInterval(interval);
                set({ puterReady: true });
            }
        }, 100);
    },
}));
