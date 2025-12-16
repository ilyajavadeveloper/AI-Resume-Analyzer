import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";

import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import {prepareInstructions} from "../../сonstants";


const Upload = () => {
    const { fs, ai, kv, puterReady } = usePuterStore();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (selected: File | null) => {
        setFile(selected);
    };

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
            setStatusText("Saving resume data...");
            const id = generateUUID();

            const resumeData = {
                id,
                resumePath: uploaded.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: null,
            };

            await kv.set(`resume:${id}`, JSON.stringify(resumeData));

            /* ---------- AI (MOCK / SAFE) ---------- */
            setStatusText("Analyzing resume...");

            const response = await ai.feedback(
                uploaded.path,
                prepareInstructions({ jobTitle, jobDescription })
            );

            const content =
                typeof response.message.content === "string"
                    ? response.message.content
                    : response.message.content?.[0]?.text ?? "";

            let feedback;
            try {
                feedback = JSON.parse(content);
            } catch {
                feedback = { raw: content };
            }

            await kv.set(
                `resume:${id}`,
                JSON.stringify({ ...resumeData, feedback })
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
            companyName: (formData.get("company-name") as string) || "",
            jobTitle: (formData.get("job-title") as string) || "",
            jobDescription: (formData.get("job-description") as string) || "",
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
                            Drop your resume for an ATS score and improvement tips
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

                            <FileUploader onFileSelect={handleFileSelect} />

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
