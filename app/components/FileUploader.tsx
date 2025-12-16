import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "~/lib/utils";

interface FileUploaderProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
}

const FileUploader = ({ file, onFileSelect }: FileUploaderProps) => {
    const maxFileSize = 20 * 1024 * 1024; // 20MB

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const selected = acceptedFiles[0] || null;
            onFileSelect(selected);
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
        accept: { "application/pdf": [".pdf"] },
        maxSize: maxFileSize,
    });

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()} className="uplader-drag-area">
                <input {...getInputProps()} />

                {file ? (
                    <div
                        className="uploader-selected-file"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src="/images/pdf.png"
                            alt="pdf"
                            className="size-10"
                        />

                        <div className="flex flex-col">
                            <p className="text-sm font-medium truncate max-w-xs">
                                {file.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                {formatSize(file.size)}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFileSelect(null);
                            }}
                        >
                            <img
                                src="/icons/cross.svg"
                                alt="remove"
                                className="w-4 h-4"
                            />
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        <img
                            src="/icons/info.svg"
                            alt="upload"
                            className="mx-auto size-20"
                        />
                        <p className="text-lg text-gray-500">
                            <span className="font-semibold">
                                Click to upload
                            </span>{" "}
                            or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                            PDF (max {formatSize(maxFileSize)})
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploader;
