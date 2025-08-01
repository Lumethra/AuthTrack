import { redirect } from "next/navigation";

export async function GET() {
    const scopes = [
        "users:read",
        "users:read.email",
        "users.profile:read",
        "channels:history",
        "groups:history",
        "im:history",
        "mpim:history"
    ].join(",");

    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${process.env.SLACK_REDIRECT_URI}`;

    redirect(slackAuthUrl);
}
