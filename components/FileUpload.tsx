"use client";

import config from "@/lib/config";
import { IKImage, ImageKitProvider, IKUpload, IKVideo } from "imagekitio-next";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const authenticator = async () => {
  try {
    // Log that we're making the request
    console.log("Requesting ImageKit authentication tokens...");

    const response = await fetch("/api/auth/imagekit");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ImageKit authentication failed:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });

      // User-friendly error notification
      toast({
        title: "Image upload error",
        description:
          "We couldn't authenticate with our image service. Please try again later.",
        variant: "destructive",
      });

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    // Check for required fields in response
    if (!data.signature || !data.expire || !data.token) {
      console.error("Invalid ImageKit auth response:", data);
      throw new Error("Authentication response is missing required fields");
    }

    const { signature, expire, token } = data;
    console.log("Authentication successful");
    return { signature, expire, token };
  } catch (error: any) {
    console.error("ImageKit authentication error:", error);

    // Provide detailed error message when possible
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

interface Props {
  type: "image" | "video";
  accept: string;
  placeholder: string;
  folder: string;
  variant: "dark" | "light";
  onFileChange: (filePath: string) => void;
  value?: string;
}

const FileUpload = ({
  type,
  accept,
  placeholder,
  folder,
  variant,
  onFileChange,
  value,
}: Props) => {
  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string | null }>({
    filePath: value ?? null,
  });
  const [progress, setProgress] = useState(0);
  const [videoProcessingAvailable, setVideoProcessingAvailable] =
    useState(true);

  const styles = {
    button:
      variant === "dark"
        ? "bg-dark-300"
        : "bg-light-600 border-gray-100 border",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  };

  const onError = (error: any) => {
    console.log(error);

    toast({
      title: `${type} upload failed`,
      description: `Your ${type} could not be uploaded. Please try again.`,
      variant: "destructive",
    });
  };

  const onSuccess = (res: any) => {
    setFile(res);

    if (type === "video") {
      onFileChange(res.filePath);

      fetch(`${urlEndpoint}/${res.filePath}`)
        .then((response) => {
          if (!response.ok && response.status === 403) {
            setVideoProcessingAvailable(false);
            toast({
              title: "Video processing limited",
              description:
                "Video transformation quota exceeded. Video may not play correctly.",
              variant: "destructive",
            });
          }
        })
        .catch(() => {
          setVideoProcessingAvailable(false);
        });
    } else {
      onFileChange(res.filePath);
    }

    toast({
      title: `${type} uploaded successfully`,
      description: `${res.filePath} has been uploaded successfully`,
    });
  };

  const onValidate = (file: File) => {
    if (type === "image") {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File size too large",
          description: "Please upload a file less than 20MB in size",
          variant: "destructive",
        });
        return false;
      }
    } else if (type === "video") {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File size too large",
          description: "Please upload a file less than 50MB in size",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };
  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        className="hidden"
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        useUniqueFileName={true}
        validateFile={onValidate}
        onUploadStart={() => setProgress(0)}
        onUploadProgress={({ loaded, total }) => {
          const percent = Math.round((loaded / total) * 100);
          setProgress(percent);
        }}
        folder={folder}
        accept={accept}
      />

      <button
        className={cn("upload-btn", styles.button)}
        onClick={(e) => {
          e.preventDefault();

          if (ikUploadRef.current) {
            //@ts-ignore
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />

        <p className={cn("text-base", styles.placeholder)}>{placeholder}</p>
      </button>

      {file && file.filePath && (
        <div className="mt-2">
          <p className={cn("text-sm", styles.text, "font-medium")}>
            {file.filePath.split("/").pop()}
          </p>
        </div>
      )}

      {progress > 0 && progress != 100 && (
        <div className="w-full rounded-full bg-green-200 mt-2">
          <div className="progress" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {file && file.filePath && type === "image" && (
        <div className="mt-4 relative">
          <div className="relative w-full h-64 rounded-md overflow-hidden border border-gray-200">
            <IKImage
              alt={file.filePath}
              path={file.filePath}
              width={500}
              height={500}
              className="object-contain w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {file && file.filePath && type === "video" && (
        <div className="mt-4 relative">
          {videoProcessingAvailable ? (
            <IKVideo
              path={file.filePath}
              controls={true}
              className="h-48 w-full rounded-md"
            />
          ) : (
            <div className="h-48 w-full rounded-md bg-dark-300 flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-primary mb-2">Video Processing Limited</p>
                <p className="text-light-100 text-sm">
                  Video preview unavailable due to processing limits.
                  <br />
                  Video has been uploaded and will be available when possible.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </ImageKitProvider>
  );
};

export default FileUpload;
