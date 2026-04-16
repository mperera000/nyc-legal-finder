import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // Step 1: Get all contacts that are "Waiting" and older than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'Waiting')
        .lt('contacted_date', threeDaysAgo.toISOString());

    if (error) {
        return res.status(500).json({ error: 'Database error' });
    }

    // Step 2: Send a reminder email for each contact
    for (const contact of contacts) {
        await resend.emails.send({
            from: 'NYC Legal Finder <onboarding@resend.dev>',
            to: contact.user_email,
            subject: `Did you hear back from ${contact.org_name}?`,
            html: `
        <p>Hi there,</p>
        <p>You reached out to <strong>${contact.org_name}</strong> 3 days ago.</p>
        <p>Have you heard back? It might be time to follow up or try another resource.</p>
        <p><a href="https://your-app-url.com/tracker">Update your status here →</a></p>
        <p>— NYC Legal Finder</p>
      `
        });
    }

    return res.status(200).json({ sent: contacts.length });
}