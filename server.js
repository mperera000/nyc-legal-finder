// ============================================
// server.js — Your Express Backend Server
// ============================================
// This file creates a backend server that:
// 1. Sends reminder emails (via Resend)
// 2. Generates "Know Your Rights" summaries (via Claude)
// 3. Runs on port 3001 alongside your Vite app on 5174
// ============================================

// Load your secret keys from .env.local
// Must be the very first thing that runs
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import the tools we need
import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Create our Express app — this is the actual server
const app = express();

// Tell the server to allow requests from your Vite frontend
// Without this, the browser blocks cross-port communication
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
}));

// Tell the server to read JSON data from incoming requests
// Without this, req.body will always be undefined
app.use(express.json());

// Create connections to Resend and Supabase using your secret keys
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// ============================================
// ROUTE 1 — Send Reminder Emails
// URL: GET http://localhost:3001/api/send-reminder
// What it does: finds contacts with status "Waiting" 
// that are older than 3 days and emails them
// ============================================
app.get('/api/send-reminder', async (req, res) => {
    console.log('\n📧 /api/send-reminder called');

    // Calculate what date was 3 days ago
    // Changed from 7 days to 3 days per your update
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    console.log('Looking for contacts older than:', threeDaysAgo.toISOString());

    // Query Supabase for matching contacts
    const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'Waiting')
        .lt('contacted_date', threeDaysAgo.toISOString());

    // If Supabase threw an error, report it
    if (error) {
        console.error('Supabase error:', error.message);
        return res.status(500).json({ error: 'Database error', details: error.message });
    }

    // If no contacts need reminders, stop here
    if (!contacts || contacts.length === 0) {
        console.log('No contacts need reminders right now');
        return res.status(200).json({ message: 'No reminders needed', sent: 0 });
    }

    console.log(`Found ${contacts.length} contact(s) that need reminders`);

    let emailsSent = 0;
    let skipped = 0;
    let errors = [];

    // Loop through each contact and send their reminder email
    for (const contact of contacts) {
        // Safety check — skip any contact with no email address
        const emailAddress = contact.user_email || contact.email;

        if (!emailAddress) {
            console.log(`⚠️  Skipping ${contact.org_name} — no email address`);
            skipped++;
            continue;
        }

        console.log(`Sending to: ${emailAddress} for org: ${contact.org_name}`);

        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: emailAddress,
                subject: `Did you hear back from ${contact.org_name}?`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1D4ED8;">NYC Legal Finder — Follow-Up Reminder</h2>
            <p>Hi there,</p>
            <p>You contacted <strong>${contact.org_name}</strong> about a 
            <strong>${contact.case_type || 'legal'}</strong> matter 3 days ago.</p>
            <p>If you haven't heard back, it may be time to:</p>
            <ul>
              <li>Call them directly to follow up</li>
              <li>Try another organization from our finder</li>
              <li>Call 311 for additional referrals</li>
            </ul>
            <a href="${process.env.VITE_APP_URL || 'http://localhost:5174'}/tracker"
               style="display: inline-block; background: #1D4ED8; color: white; 
                      padding: 12px 24px; border-radius: 6px; text-decoration: none;
                      margin-top: 16px;">
              Update Your Status →
            </a>
            <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">
              Sent automatically by NYC Free Legal Sources Finder.
            </p>
          </div>
        `
            });

            emailsSent++;
            console.log(`✅ Email sent to ${emailAddress}`);

        } catch (emailError) {
            console.error(`❌ Failed for ${contact.org_name}:`, emailError.message);
            errors.push({ org: contact.org_name, error: emailError.message });
        }
    }

    // Return a summary of everything that happened
    return res.status(200).json({
        message: 'Reminder run complete',
        sent: emailsSent,
        skipped: skipped,
        failed: errors.length,
        errors: errors
    });
});


// ============================================
// ROUTE 2 — Know Your Rights AI Summary
// URL: POST http://localhost:3001/api/know-your-rights
// What it does: receives a caseType and language,
// asks Claude to explain the user's basic rights,
// returns a plain-English 3-sentence summary
// ============================================
app.post('/api/know-your-rights', async (req, res) => {
    console.log('\n📋 /api/know-your-rights called');

    // Pull caseType and language out of the request body
    const { caseType, language } = req.body;
    console.log('caseType:', caseType, '| language:', language);

    // Make sure we received a caseType — it's required
    if (!caseType) {
        return res.status(400).json({ error: 'caseType is required' });
    }

    // Build the prompt we send to Claude
    const prompt = `You are a plain-language legal information assistant for New York City residents.

The user has selected this legal situation: ${caseType}
Respond in: ${language || 'English'}

Write exactly 3 sentences:
Sentence 1: Explain what a "${caseType}" legal situation generally involves in simple everyday words.
Sentence 2: Describe one important right or protection that people in this situation have in New York.
Sentence 3: Suggest one clear, concrete first step this person can take right now.

RULES — follow all of these without exception:
- Write at an 8th grade reading level
- Do NOT give specific legal advice
- Do NOT make promises like "you will win" or "you are guaranteed"
- Do NOT cite specific laws, statutes, or case numbers
- If you use any legal term, immediately explain it in plain words
- Do NOT start your response with "I" or "As an AI"
- Start directly with information about the legal situation
- Keep your entire response to exactly 3 sentences — no more, no less
- Respond entirely in ${language || 'English'}`;

    try {
        // This calls YOUR Render server, which then safely calls Claude
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/know-your-rights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caseType: caseType,
                language: language || 'English'
            })
        });
        const data = await response.json();
        const result = data.summary; // your server returns { summary: "..." };

        // If Claude's API returned an error status, report it
        if (!response.ok) {
            const errData = await response.json();
            console.error('Claude API error:', errData);
            return res.status(500).json({ error: 'AI service error', details: errData });
        }

        // Pull the actual text out of Claude's response
        // Claude returns JSON with a specific structure — content[0].text is the message
        const data = await response.json();
        const summary = data.content[0].text;
        console.log('✅ Claude responded successfully');

        // Send the summary back to the frontend
        return res.status(200).json({ summary });

    } catch (error) {
        console.error('Error calling Claude:', error.message);
        return res.status(500).json({ error: 'Something went wrong', details: error.message });
    }
});


// ============================================
// Start the server
// It listens on port 3001 for incoming requests
// ============================================
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n✅ Backend server running on http://localhost:${PORT}`);
    console.log(`   Reminder route:    GET  http://localhost:${PORT}/api/send-reminder`);
    console.log(`   Know Your Rights:  POST http://localhost:${PORT}/api/know-your-rights\n`);
});
