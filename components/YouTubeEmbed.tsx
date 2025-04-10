import React from "react";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}

const YouTubeEmbed = ({
  videoId,
  title = "YouTube video player",
  className = "",
}: YouTubeEmbedProps) => {
  if (!videoId) return null;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-md ${className}`}
      style={{ paddingTop: "56.25%" }}
    >
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeEmbed;
