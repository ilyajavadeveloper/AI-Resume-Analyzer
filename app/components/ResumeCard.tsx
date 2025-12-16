import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";

const ResumeCard = ({
                        resume: { id, companyName, jobTitle, feedback },
                    }: {
    resume: Resume;
}) => {
    const overallScore =
        typeof feedback?.overallScore === "number"
            ? feedback.overallScore
            : 0;

    return (
        <Link
            to={`/resume/${id}`}
            className="resume-card animate-in fade-in duration-1000"
        >
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && (
                        <h2 className="text-black! font-bold wrap-break-word">
                            {companyName}
                        </h2>
                    )}
                    {jobTitle && (
                        <h3 className="text-lg wrap-break-word text-gray-500">
                            {jobTitle}
                        </h3>
                    )}
                    {!companyName && !jobTitle && (
                        <h2 className="text-black! font-bold">Resume</h2>
                    )}
                </div>

                <div className="shrink-0">
                    <ScoreCircle score={overallScore} />
                </div>
            </div>

            {feedback?.raw && (
                <p className="mt-4 text-sm text-gray-500 line-clamp-3">
                    AI returned unstructured feedback. Click to review details.
                </p>
            )}
        </Link>
    );
};

export default ResumeCard;
