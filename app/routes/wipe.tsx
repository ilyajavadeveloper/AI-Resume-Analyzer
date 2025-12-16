import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
    const { auth, isLoading, puterReady, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [files, setFiles] = useState<any[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);

    // 🔐 auth guard — ТОЛЬКО когда puter готов
    useEffect(() => {
        if (!puterReady) return;

        if (!isLoading && !auth.isAuthenticated) {
            console.log("🔴 Not authenticated → redirect to auth");
            navigate("/auth?next=/wipe", { replace: true });
        }
    }, [puterReady, isLoading, auth.isAuthenticated, navigate]);

    // 📂 загрузка файлов (БЕЗ readDir — его нет)
    useEffect(() => {
        if (!auth.isAuthenticated) return;

        const loadFiles = async () => {
            console.log("🟡 Loading files (kv only)");
            setLoadingFiles(true);

            try {
                const keys = await kv.get("resume:index");
                if (!keys) {
                    setFiles([]);
                    return;
                }

                const parsed = JSON.parse(keys);
                setFiles(parsed);
            } catch (e) {
                console.error("Failed to load files", e);
            } finally {
                setLoadingFiles(false);
            }
        };

        loadFiles();
    }, [auth.isAuthenticated, kv]);

    const handleWipe = async () => {
        if (!confirm("Are you sure you want to wipe all data?")) return;

        console.log("🔥 WIPING DATA");

        // ❌ fs.delete / kv.flush НЕТ → чистим по ключам
        try {
            await kv.set("resume:index", JSON.stringify([]));
            alert("Data wiped");
            setFiles([]);
        } catch (e) {
            console.error("Wipe failed", e);
        }
    };

    if (!puterReady || isLoading) {
        return <div>Loading Puter...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Wipe App Data</h1>

            <p>
                Logged in as: <b>{auth.user?.username || auth.user?.id}</b>
            </p>

            <div>
                <h2 className="font-semibold">Stored items:</h2>

                {loadingFiles ? (
                    <p>Loading…</p>
                ) : files.length === 0 ? (
                    <p className="text-gray-500">No stored items</p>
                ) : (
                    <ul className="list-disc pl-6">
                        {files.map((f: any, i) => (
                            <li key={i}>{JSON.stringify(f)}</li>
                        ))}
                    </ul>
                )}
            </div>

            <button
                onClick={handleWipe}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
                Wipe App Data
            </button>
        </div>
    );
};

export default WipeApp;
