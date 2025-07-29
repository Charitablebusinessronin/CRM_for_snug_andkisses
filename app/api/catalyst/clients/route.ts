import { NextResponse } from "next/server"

// This is a placeholder for your Zoho Catalyst API base URL.
// You MUST set this as an environment variable in Vercel.
// Example: NEXT_PUBLIC_CATALYST_API_BASE_URL=https://your-catalyst-app.catalystserverless.com/api
const CATALYST_API_BASE_URL = process.env.NEXT_PUBLIC_CATALYST_API_BASE_URL

export async function GET() {
  if (!CATALYST_API_BASE_URL) {
    return NextResponse.json(
      {
        message:
          "Zoho Catalyst API base URL is not configured. Please set NEXT_PUBLIC_CATALYST_API_BASE_URL environment variable.",
      },
      { status: 500 },
    )
  }

  try {
    // In a real scenario, you might pass an authentication token (e.g., JWT)
    // obtained from your login process to the Catalyst backend.
    // const authToken = headers().get('Authorization'); // Example if using headers() from 'next/headers'

    const response = await fetch(`${CATALYST_API_BASE_URL}/clients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': authToken, // Pass auth token if required by Catalyst
      },
      // Consider caching strategies if data doesn't change frequently
      // next: { revalidate: 60 } // Revalidate data every 60 seconds
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error from Catalyst backend:", errorData)
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch clients from Zoho Catalyst backend." },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Assuming Catalyst returns data in a format like:
    // {
    //   data: [
    //     { id: '1', name: 'Sarah Mitchell', status: 'Active', lastContact: '2024-07-18', nextVisit: '2024-07-20' },
    //     { id: '2', name: 'John Doe', status: 'Prospect', lastContact: '2024-07-10', nextVisit: 'N/A' },
    //   ]
    // }
    // You might need to transform this data to match your frontend's `Client` interface.
    const clients = data.data || [] // Adjust based on your actual Catalyst response structure

    // Mock data for demonstration if Catalyst API is not yet live or returns empty
    if (clients.length === 0) {
      return NextResponse.json([
        { name: "Mock Client 1", status: "Active", lastContact: "2024-07-18", nextVisit: "2024-07-20" },
        { name: "Mock Client 2", status: "Prospect", lastContact: "2024-07-15", nextVisit: "N/A" },
        { name: "Mock Client 3", status: "Paused", lastContact: "2024-07-01", nextVisit: "2024-08-01" },
      ])
    }

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error in Next.js API route calling Catalyst:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred while communicating with Zoho Catalyst backend." },
      { status: 500 },
    )
  }
}
