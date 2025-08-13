function parseJson(req) {
  try {
    if (req.body && Object.keys(req.body).length) return req.body;
    if (req.rawBody) return JSON.parse(req.rawBody);
  } catch (_) {}
  return {};
}

exports.handler = async (req, res) => {
  try {
    const payload = parseJson(req);
    const { request_type, request_details = {} } = payload;
    const { user_details = {}, auth_type } = request_details;
    const {
      email_id = "",
      first_name = "",
      last_name = "",
      org_id = "",
      role_details = {}
    } = user_details;

    const ALLOWED_ORG_IDS = (process.env.ALLOWED_ORG_IDS || "")
      .split(",").map(s => s.trim()).filter(Boolean);
    const ALLOWED_EMAIL_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || "snugandkisses.com")
      .split(",").map(s => s.trim()).filter(Boolean);
    const BLOCKED_EMAILS = (process.env.BLOCKED_EMAILS || "")
      .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const REQUIRE_CORPORATE_DOMAIN = String(process.env.REQUIRE_CORPORATE_DOMAIN || "false").toLowerCase() === "true";

    const DEFAULT_ROLE_NAME = process.env.DEFAULT_ROLE_NAME || "Client";
    const DEFAULT_ROLE_ID = process.env.DEFAULT_ROLE_ID || "2000000000001";

    if (request_type !== "add_user") {
      return res.status(200).json({ allow: false, message: `Unsupported request_type: ${request_type}` });
    }

    const email = String(email_id || "").toLowerCase();
    const emailDomain = email.includes("@") ? email.split("@").pop() : "";

    if (!email) {
      return res.status(200).json({ allow: false, message: "Email is required" });
    }
    if (BLOCKED_EMAILS.includes(email)) {
      return res.status(200).json({ allow: false, message: "This email is blocked" });
    }
    if (ALLOWED_ORG_IDS.length && !ALLOWED_ORG_IDS.includes(String(org_id || "").trim())) {
      return res.status(200).json({ allow: false, message: `Org not allowed: ${org_id}` });
    }
    if (REQUIRE_CORPORATE_DOMAIN && !ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
      return res.status(200).json({ allow: false, message: `Email domain not allowed: ${emailDomain}` });
    }

    const roleName = role_details.role_name || DEFAULT_ROLE_NAME;
    const roleId = role_details.role_id || DEFAULT_ROLE_ID;

    return res.status(200).json({
      allow: true,
      message: "User approved by custom validation",
      assign_role: {
        role_name: roleName,
        role_id: roleId
      },
      attributes: {
        normalized_email: email,
        auth_type: auth_type || "web",
        org_id: org_id || null,
        first_name,
        last_name
      }
    });
  } catch (err) {
    console.error("Custom validation error:", err);
    return res.status(200).json({ allow: false, message: "Validation processing error" });
  }
};



