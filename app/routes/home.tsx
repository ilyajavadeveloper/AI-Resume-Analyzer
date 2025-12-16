import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

/* =========================
   TYPES
========================= */
type KVItem = {
    key: string;
    value: string;
};

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind" },
        { name: "description", content: "Smart feedback for your dream job!" },
    ];
}

export default function Home() {
    // @ts-ignore
    const { auth, kv } = usePuterStore(); // ✅ ВАЖНО: kv тут
    const navigate = useNavigate();

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(false);

    /* 🔐 AUTH GUARD */
    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate("/auth?next=/", { replace: true });
        }
    }, [auth.isAuthenticated, navigate]);

    /* 📦 LOAD RESUMES */
    useEffect(() => {
        if (!auth.isAuthenticated || !kv?.list) return;

        const load = async () => {
            setLoading(true);

            try {
                const items = (await kv.list(
                    "resume:*",
                    true
                )) as KVItem[];

                const parsed: Resume[] = items
                    .map((item) => {
                        try {
                            return JSON.parse(item.value) as Resume;
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean) as Resume[];

                setResumes(parsed);
            } catch (err) {
                console.error("❌ Failed to load resumes", err);
                setResumes([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [auth.isAuthenticated, kv]);

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Track Your Applications & Resume Ratings</h1>

                    {!loading && resumes.length === 0 ? (
                        <h2>No resumes found. Upload your first resume.</h2>
                    ) : (
                        <h2>Review your submissions and AI feedback.</h2>
                    )}
                </div>

                {loading && (
                    <div className="flex justify-center">
                        <img
                            src="/images/resume-scan-2.gif"
                            className="w-[200px]"
                            alt="Loading"
                        />
                    </div>
                )}

                {!loading && resumes.length > 0 && (
                    <div className="resumes-section">
                        {resumes.map((resume) => (
                            <ResumeCard key={resume.id} resume={resume} />
                        ))}
                    </div>
                )}

                {!loading && resumes.length === 0 && (
                    <div className="flex justify-center mt-10">
                        <Link
                            to="/upload"
                            className="primary-button w-fit text-xl font-semibold"
                        >
                            Upload Resume
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
