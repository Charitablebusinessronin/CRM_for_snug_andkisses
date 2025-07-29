import React from 'react';
import { getSession } from 'lib/auth'; // Custom auth from project
import { auditLogAccess } from 'lib/hipaa'; // Custom HIPAA audit logging
import axios from 'axios'; // Added axios import
import { decryptData } from 'lib/encryption'; // Added decryptData import
import ZohoVideoPlayer from 'components/ZohoVideoPlayer'; // To be created

export default async function OrientationPage() {
  const session = await getSession();
  if (!session || !session.user.isAdmin) {
    auditLogAccess('OrientationPage', 'access_denied', session?.user?.id);
    return <div>Access Denied. Only admins can configure videos.</div>;
  }

  auditLogAccess('OrientationPage', 'accessed', session.user.id);
  try {
    // Fetch video config from Zoho API
    const videoData = await fetchZohoVideoConfig(); // Updated to use new implementation

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Orientation Videos Module</h1>
        <ZohoVideoPlayer videoUrl={videoData.url} />
        {/* Add form for admin video upload/config */}
      </div>
    );
  } catch (error) {
    auditLogAccess('OrientationPage', 'error', session.user.id, { error });
    return <div>Error loading video configuration.</div>;
  }
}

async function fetchZohoVideoConfig() {
  try {
    const response = await axios.get('/api/zoho-video', { // Proxy API route for Zoho call
      headers: {
        Authorization: `Bearer ${process.env.ZOHO_OAUTH_TOKEN}`, // Use env var for token
      },
    });

    // Replace with actual Zoho API endpoint and decryption if needed
    const decryptedData = decryptData(response.data, process.env.ENCRYPTION_KEY); // Assume decrypt function from lib

    return decryptedData;
  } catch (error) {
    throw error;
  }
}
