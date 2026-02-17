import { fetch } from "undici"; // Native fetch in Node 18+ or use undici

async function main() {
    const baseUrl = "http://localhost:3002";
    
    // 1. Get CSRF Token
    console.log("Fetching CSRF token...");
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
    const csrfData = await csrfResponse.json() as { csrfToken: string };
    const csrfToken = csrfData.csrfToken;
    const cookies = csrfResponse.headers.get("set-cookie");
    
    console.log("CSRF Token:", csrfToken);
    console.log("Cookies:", cookies);

    if (!cookies) {
        throw new Error("No cookies received");
    }

    // 2. Login
    console.log("Attempting login...");
    const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", // NextAuth uses form data for credentials
            "Cookie": cookies // Send back cookies
        },
        body: new URLSearchParams({
            csrfToken: csrfToken,
            email: "erine@gmail.com",
            password: "123456",
            json: "true"
        }).toString()
    });

    console.log("Login Status:", loginResponse.status);
    const text = await loginResponse.text();
    console.log("Login Response Body:", text);
}

main().catch(console.error);
