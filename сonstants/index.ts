/* =========================
   TYPES
========================= */

export type TipType = "good" | "improve";

export interface SimpleTip {
    type: TipType;
    tip: string;
}

export interface DetailedTip extends SimpleTip {
    explanation: string;
}

export interface Feedback {
    overallScore: number; // max 100

    ATS: {
        score: number;
        tips: SimpleTip[];
    };

    toneAndStyle: {
        score: number;
        tips: DetailedTip[];
    };

    content: {
        score: number;
        tips: DetailedTip[];
    };

    structure: {
        score: number;
        tips: DetailedTip[];
    };

    skills: {
        score: number;
        tips: DetailedTip[];
    };

    raw?: string;
}

export interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    imagePath?: string;
    resumePath: string;
    feedback?: Feedback;
}

/* =========================
   MOCK RESUMES
========================= */

export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: { score: 90, tips: [] },
            toneAndStyle: { score: 90, tips: [] },
            content: { score: 90, tips: [] },
            structure: { score: 90, tips: [] },
            skills: { score: 90, tips: [] },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: { score: 70, tips: [] },
            toneAndStyle: { score: 60, tips: [] },
            content: { score: 55, tips: [] },
            structure: { score: 50, tips: [] },
            skills: { score: 65, tips: [] },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: { score: 78, tips: [] },
            toneAndStyle: { score: 80, tips: [] },
            content: { score: 72, tips: [] },
            structure: { score: 70, tips: [] },
            skills: { score: 82, tips: [] },
        },
    },
];

/* =========================
   AI RESPONSE FORMAT
========================= */

export const AIResponseFormat = `
interface Feedback {
  overallScore: number;

  ATS: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
    }[];
  };

  toneAndStyle: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };

  content: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };

  structure: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };

  skills: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
}
`;

/* =========================
   AI PROMPT BUILDER
========================= */

export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                    }: {
    jobTitle: string;
    jobDescription: string;
}) => `
You are an expert in ATS (Applicant Tracking Systems) and professional resume review.

Analyze the resume carefully and give honest, critical feedback.
Low scores are allowed if the resume is weak.

Job title:
${jobTitle}

Job description:
${jobDescription}

Return ONLY valid JSON using this format:
${AIResponseFormat}

Do not include any explanations, markdown, comments, or extra text.
`;
