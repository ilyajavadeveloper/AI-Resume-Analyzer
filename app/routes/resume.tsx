import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => [
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const navigate = useNavigate();

    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState<any>(null);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate(`/auth?next=/resume/${id}`);
        }
    }, [isLoading, auth.isAuthenticated, id]);

    useEffect(() => {
        const loadResume = async () => {
            if (!id) return;

            const stored = await kv.get(`resume:${id}`);
            if (!stored) return;

            const data = JSON.parse(stored);

            // 📄 PDF preview
            const resumeBlob = await fs.read(data.resumePath);
            if (resumeBlob) {
                const pdfBlob = new Blob([resumeBlob], {
                    type: "application/pdf",
                });
                setResumeUrl(URL.createObjectURL(pdfBlob));
            }

            setFeedback(data.feedback);
        };

        loadResume();
    }, [id]);

    const hasStructuredFeedback =
        feedback &&
        typeof feedback === "object" &&
        !feedback.raw;

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img
                        src="/icons/back.svg"
                        alt="back"
                        className="w-2.5 h-2.5"
                    />
                    <span className="text-gray-800 text-sm font-semibold">
                        Back to Homepage
                    </span>
                </Link>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                {/* PDF PREVIEW */}
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 flex items-center justify-center">
                    {resumeUrl ? (
                        <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gradient-border animate-in fade-in duration-1000"
                        >
                            <embed
                                src={resumeUrl}
                                type="application/pdf"
                                className="w-[420px] h-[90vh] rounded-2xl"
                            />
                        </a>
                    ) : (
                        <img
                            src="/images/resume-scan-2.gif"
                            className="w-full"
                        />
                    )}
                </section>

                {/* FEEDBACK */}
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">
                        Resume Review
                    </h2>

                    {!feedback && (
                        <img
                            src="/images/resume-scan-2.gif"
                            className="w-full"
                        />
                    )}

                    {feedback?.raw && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <h3 className="font-semibold mb-2">
                                AI Feedback (raw)
                            </h3>
                            <pre className="text-sm whitespace-pre-wrap">
                                {feedback.raw}
                            </pre>
                        </div>
                    )}

                    {hasStructuredFeedback && (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS
                                score={feedback.ATS?.score || 0}
                                suggestions={feedback.ATS?.tips || []}
                            />
                            <Details feedback={feedback} />
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;
