import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
        return NextResponse.redirect("/error");
    }

    const response = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.SLACK_CLIENT_ID!,
            client_secret: process.env.SLACK_CLIENT_SECRET!,
            redirect_uri: process.env.SLACK_REDIRECT_URI!,
        }),
    });

    const data = await response.json();

    console.log(JSON.stringify(data, null, 2));

    return NextResponse.redirect("/dashboard");
}
