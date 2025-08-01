import SlackBolt from '@slack/bolt';
import { Pool } from 'pg';
import 'dotenv/config';

const { App } = SlackBolt;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000
});

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true
});

interface status {
    user: {
        id: string;
        presence: 'active' | 'away';
    };
}

interface message {
    user?: string;
    subtype?: string;
    bot_id?: string;
}

app.event('user_change', async ({ event }) => {
    const status = event as unknown as status;

    await pool.query(`
      INSERT INTO user_status (user_id, status_history)
      VALUES ($1, jsonb_build_array($2::jsonb))
      ON CONFLICT (user_id) DO UPDATE
      SET status_history = user_status.status_history || $2::jsonb
    `, [
        status.user.id,
        JSON.stringify({
            timestamp: new Date().toISOString(),
            online: status.user.presence === 'active' // true/false
        })
    ]);
});

app.event('message', async ({ event }) => {
    const message = event as unknown as message;

    // skip if not from a user
    if (!message.user || message.subtype || message.bot_id) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    await pool.query(`
      INSERT INTO daily_messages (user_id, day_counts)
      VALUES ($1, jsonb_build_object($2, 1))
      ON CONFLICT (user_id) DO UPDATE
      SET day_counts = jsonb_set(
        COALESCE(daily_messages.day_counts, '{}'::jsonb),
        ARRAY[$2],
        to_jsonb(COALESCE((daily_messages.day_counts->>$2)::int, 0) + 1)
      )
    `, [message.user, today]);
});

async function start() {
    const dbTest = await pool.query('SELECT NOW()');
    console.log('database connected:', dbTest.rows[0].now);
    await app.start();
    console.log('running');
}

start().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});