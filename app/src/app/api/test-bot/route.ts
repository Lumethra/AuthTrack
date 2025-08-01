export async function GET() {
    const response = await fetch("https://slack.com/api/auth.test", {
        headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN!}`,
        },
    });

    const data = await response.json();
    return Response.json(data);
}