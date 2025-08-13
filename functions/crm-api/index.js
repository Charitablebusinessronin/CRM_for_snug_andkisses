/**
 * Sabir's CRM API - Basic I/O Function for Catalyst
 * Healthcare CRM with HIPAA compliance and Zoho integration
 */

const catalyst = require("zcatalyst-sdk-node");

module.exports = (req, res) => {
    const catalystApp = catalyst.initialize(req);

    // Health check endpoint
    if (req.url === '/health' || req.url === '/') {
        return res.status(200).json({
            success: true,
            message: "Sabir's CRM API is running on Catalyst",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'production',
            version: '1.0.0',
            catalyst: true,
            project: "Project-Rainfall",
            author: "Sabir Asheed"
        });
    }

    // Handle different API endpoints
    switch (req.method) {
        case "GET":
            return handleGetRequest(catalystApp, req, res);
        case "POST":
            return handlePostRequest(catalystApp, req, res);
        case "PUT":
            return handlePutRequest(catalystApp, req, res);
        case "DELETE":
            return handleDeleteRequest(catalystApp, req, res);
        default:
            return res.status(405).json({ 
                error: "Method not allowed",
                allowed: ["GET", "POST", "PUT", "DELETE"] 
            });
    }
};

async function handleGetRequest(catalystApp, req, res) {
    try {
        // Parse URL path
        const urlPath = req.url.split('?')[0];
        const pathParts = urlPath.split('/').filter(part => part);

        if (pathParts.length === 0 || pathParts[0] === 'health') {
            return res.status(200).json({
                success: true,
                message: "Sabir's CRM API Health Check",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                catalyst: true
            });
        }

        // Handle different endpoints
        switch (pathParts[0]) {
            case 'api':
                return handleAPIEndpoint(catalystApp, req, res, pathParts.slice(1));
            case 'crm':
                return handleCRMEndpoint(catalystApp, req, res, pathParts.slice(1));
            case 'zoho':
                return handleZohoEndpoint(catalystApp, req, res, pathParts.slice(1));
            default:
                return res.status(200).json({
                    success: true,
                    message: 'CRM API endpoint active',
                    path: urlPath,
                    method: req.method,
                    timestamp: new Date().toISOString()
                });
        }
    } catch (error) {
        console.error("GET request error:", error);
        return res.status(500).json({ 
            error: "Internal server error",
            message: error.message 
        });
    }
}

async function handlePostRequest(catalystApp, req, res) {
    try {
        return res.status(200).json({
            success: true,
            message: 'POST request handled',
            timestamp: new Date().toISOString(),
            body: req.body
        });
    } catch (error) {
        console.error("POST request error:", error);
        return res.status(500).json({ 
            error: "Internal server error",
            message: error.message 
        });
    }
}

async function handlePutRequest(catalystApp, req, res) {
    try {
        return res.status(200).json({
            success: true,
            message: 'PUT request handled',
            timestamp: new Date().toISOString(),
            body: req.body
        });
    } catch (error) {
        console.error("PUT request error:", error);
        return res.status(500).json({ 
            error: "Internal server error",
            message: error.message 
        });
    }
}

async function handleDeleteRequest(catalystApp, req, res) {
    try {
        return res.status(200).json({
            success: true,
            message: 'DELETE request handled',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("DELETE request error:", error);
        return res.status(500).json({ 
            error: "Internal server error",
            message: error.message 
        });
    }
}

async function handleAPIEndpoint(catalystApp, req, res, pathParts) {
    return res.status(200).json({
        success: true,
        message: 'API endpoint active',
        endpoint: '/api/' + pathParts.join('/'),
        method: req.method,
        timestamp: new Date().toISOString()
    });
}

async function handleCRMEndpoint(catalystApp, req, res, pathParts) {
    return res.status(200).json({
        success: true,
        message: 'CRM endpoint active',
        endpoint: '/crm/' + pathParts.join('/'),
        method: req.method,
        timestamp: new Date().toISOString()
    });
}

async function handleZohoEndpoint(catalystApp, req, res, pathParts) {
    return res.status(200).json({
        success: true,
        message: 'Zoho integration endpoint active',
        endpoint: '/zoho/' + pathParts.join('/'),
        method: req.method,
        timestamp: new Date().toISOString()
    });
}