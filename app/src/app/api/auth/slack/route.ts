import { redirect } from "next/navigation";

export async function GET() {
    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=identity.basic&redirect_uri=${process.env.SLACK_REDIRECT_URI}`;
    redirect(slackAuthUrl);
}
