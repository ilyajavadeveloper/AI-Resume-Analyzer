import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";

import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../сonstants";

const Upload = () => {
    const { fs, ai, kv, puterReady } = usePuterStore();
    const navigate = useNavigate();

    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");

    const handleAnalyze = async ({
                                     companyName,
                                     jobTitle,
                                     jobDescription,
                                     file,
                                 }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        try {
            if (!puterReady) {
                throw new Error("Puter not ready yet");
            }

            setIsProcessing(true);
            setStatusText("Uploading resume...");

            /* ---------- UPLOAD ---------- */
            const uploaded = await fs.upload([file]);
            if (!uploaded?.path) {
                throw new Error("Upload failed");
            }

            /* ---------- SAVE BASE ---------- */
            const id = generateUUID();

            const baseData = {
                id,
                resumePath: uploaded.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: null,
            };

            await kv.set(`resume:${id}`, JSON.stringify(baseData));

            /* ---------- AI ---------- */
            setStatusText("Analyzing resume...");

            const response = await ai.feedback(
                uploaded.path,
                prepareInstructions({ jobTitle, jobDescription })
            );

            const raw =
                typeof response.message.content === "string"
                    ? response.message.content
                    : response.message.content?.[0]?.text ?? "";

            let feedback;
            try {
                feedback = JSON.parse(raw);
            } catch {
                feedback = { raw };
            }

            await kv.set(
                `resume:${id}`,
                JSON.stringify({ ...baseData, feedback })
            );

            /* ---------- DONE ---------- */
            setStatusText("Done. Redirecting...");
            navigate(`/resume/${id}`);
        } catch (err) {
            console.error("UPLOAD ERROR:", err);
            setStatusText(
                err instanceof Error ? err.message : "Unexpected error"
            );
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData(e.currentTarget);

        handleAnalyze({
            companyName: String(formData.get("company-name") || ""),
            jobTitle: String(formData.get("job-title") || ""),
            jobDescription: String(formData.get("job-description") || ""),
            file,
        });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>

                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img
                                src="/images/resume-scan.gif"
                                alt="Processing"
                                className="w-full"
                            />
                        </>
                    ) : (
                        <h2>
                            Drop your resume for an ATS score and improvement
                            tips
                        </h2>
                    )}

                    {!isProcessing && (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 mt-8"
                        >
                            <input
                                name="company-name"
                                placeholder="Company Name"
                            />

                            <input
                                name="job-title"
                                placeholder="Job Title"
                            />

                            <textarea
                                name="job-description"
                                rows={5}
                                placeholder="Job Description"
                            />

                            <FileUploader
                                file={file}
                                onFileSelect={setFile}
                            />

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={!file}
                            >
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;
