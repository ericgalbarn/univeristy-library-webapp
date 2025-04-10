"use client";

import config from "@/lib/config";
import { IKVideo, ImageKitProvider } from "imagekitio-next";
import React, { useState } from "react";
import { isYouTubeUrl, getYouTubeId } from "@/lib/utils";
import YouTubeEmbed from "./YouTubeEmbed";

const BookVideo = ({ videoUrl }: { videoUrl: string }) => {
  const [imageKitError, setImageKitError] = useState(false);

  if (!videoUrl) return null;

  // Check if it's a YouTube URL
  if (isYouTubeUrl(videoUrl)) {
    const videoId = getYouTubeId(videoUrl);
    return <YouTubeEmbed videoId={videoId || ""} className="w-full h-full" />;
  }

  // If not YouTube, use ImageKit
  return (
    <ImageKitProvider
      publicKey={config.env.imagekit.publicKey}
      urlEndpoint={config.env.imagekit.urlEndpoint}
    >
      {imageKitError ? (
        <div className="w-full p-4 bg-dark-300 rounded-xl text-center">
          <p className="text-light-100 mb-2">Video could not be loaded</p>
          <p className="text-xs text-light-300">
            Processing quota may be exceeded
          </p>
        </div>
      ) : (
        <IKVideo
          path={videoUrl}
          controls={true}
          className="w-full rounded-xl"
          onError={() => setImageKitError(true)}
        />
      )}
    </ImageKitProvider>
  );
};

export default BookVideo;
