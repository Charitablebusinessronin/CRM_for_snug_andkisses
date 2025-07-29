import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auditLogAccess } from 'lib/hipaa'; // Custom HIPAA audit logging

interface ZohoVideoPlayerProps {
  videoUrl: string;
}

export default function ZohoVideoPlayer({ videoUrl }: ZohoVideoPlayerProps) {
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get('/api/zoho-video', { // Proxy API route for Zoho call
          headers: {
            Authorization: `Bearer ${process.env.ZOHO_OAUTH_TOKEN}`, // Use env var for token
          },
        });
        setVideoData(response.data);
        auditLogAccess('ZohoVideoPlayer', 'video_fetched', 'user_id_placeholder');
      } catch (err) {
        setError('Failed to fetch video data');
        auditLogAccess('ZohoVideoPlayer', 'fetch_error', 'user_id_placeholder', err.message);
      }
    };
    fetchVideo();
  }, [videoUrl]);

  if (error) return <div>Error: {error}</div>;
  if (!videoData) return <div>Loading...</div>;

  return (
    <video controls>
      <source src={videoData.url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
