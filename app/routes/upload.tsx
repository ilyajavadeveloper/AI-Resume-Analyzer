import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";

import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import {prepareInstructions} from "../../сonstants";

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
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
            if (!fs || !ai || !kv) {
                throw new Error("Services not ready");
            }

            setIsProcessing(true);

            // 1️⃣ Upload PDF
            setStatusText("Uploading resume...");
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile) {
                throw new Error("Failed to upload resume");
            }

            // 2️⃣ Save initial data
            setStatusText("Preparing data...");
            const uuid = generateUUID();

            const data: any = {
                id: uuid,
                resumePath: uploadedFile.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: null,
            };

            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            // 3️⃣ AI analysis
            setStatusText("Analyzing resume...");
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );

            if (!feedback) {
                throw new Error("AI returned no feedback");
            }

            const feedbackText =
                typeof feedback.message.content === "string"
                    ? feedback.message.content
                    : feedback.message.content[0]?.text;

            let parsedFeedback;
            try {
                parsedFeedback = JSON.parse(feedbackText);
            } catch {
                parsedFeedback = { raw: feedbackText };
            }

            data.feedback = parsedFeedback;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            // 4️⃣ Done
            setStatusText("Analysis complete, redirecting...");
            navigate(`/resume/${uuid}`);
        } catch (err) {
            console.error("UPLOAD ERROR:", err);
            const message =
                err instanceof Error ? err.message : "Unknown error";
            setStatusText(`Error: ${message}`);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData(e.currentTarget);

        handleAnalyze({
            companyName: formData.get("company-name") as string,
            jobTitle: formData.get("job-title") as string,
            jobDescription: formData.get("job-description") as string,
            file,
        });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
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
                            <input name="company-name" placeholder="Company Name" />
                            <input name="job-title" placeholder="Job Title" />
                            <textarea
                                name="job-description"
                                rows={5}
                                placeholder="Job Description"
                            />
                            <FileUploader onFileSelect={handleFileSelect} />
                            <button className="primary-button" type="submit">
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
