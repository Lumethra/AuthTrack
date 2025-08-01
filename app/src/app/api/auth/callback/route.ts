import { Pool } from 'pg';
import 'dotenv/config';

const isLocal = process.env.NEST_LOCAL === 'true';

const connectionString = isLocal
    ? `postgres://${process.env.DB_USER}@localhost/${process.env.DB_NAME}?sslmode=disable&host=/var/run/postgresql`
    : `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@hackclub.app/${process.env.DB_NAME}`;

const pool = new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 50000
});

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    const response = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        body: new URLSearchParams({
            client_id: process.env.SLACK_CLIENT_ID!,
            client_secret: process.env.SLACK_CLIENT_SECRET!,
            code: code ?? "",
            redirect_uri: process.env.SLACK_REDIRECT_URI!,
        }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = await response.json();

    const userId = data.authed_user?.id;

    const userData = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
        headers: {
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/json"
        }
    });

    const userInfo = await userData.json();

    const email = userInfo.user?.profile?.email;

    await pool.query(`
  INSERT INTO slack_users (slack_id, email)
  VALUES ($1, $2)
  ON CONFLICT (slack_id) DO NOTHING
`, [userId, email]);

    console.log({ slack_id: userId, email });

    return Response.redirect(new URL("/dashboard", req.url));
}
