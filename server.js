// server.js
// Express backend server — runs on Render
// Handles all Claude API calls securely
// Never called directly from the browser

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Allow requests from your Vercel frontend
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://nyc-legal-finder.vercel.app'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));


// Allow server to read JSON from request bodies
app.use(express.json());

// Connect to Resend and Supabase
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// ============================================
// ROUTE 1 — Health Check
// URL: GET /
// Lets you confirm the server is running
// ============================================
app.get('/', (req, res) => {
    res.json({ status: 'NYC Legal Finder API is running' });
});

// ============================================
// ROUTE 2 — Send Reminder Emails
// URL: GET /api/send-reminder
// ============================================
app.get('/api/send-reminder', async (req, res) => {
    console.log('\n📧 /api/send-reminder called');

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'Waiting')
        .lt('contacted_date', threeDaysAgo.toISOString());

    if (error) {
        console.error('Supabase error:', error.message);
        return res.status(500).json({ error: 'Database error' });
    }

    if (!contacts || contacts.length === 0) {
        return res.status(200).json({ message: 'No reminders needed', sent: 0 });
    }

    let emailsSent = 0;

    for (const contact of contacts) {
        const emailAddress = contact.user_email || contact.email;
        if (!emailAddress) continue;

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
            <p>If you haven't heard back, it may be time to follow up or try another resource.</p>
            <p style="color: #6B7280; font-size: 14px;">
              Sent automatically by NYC Free Legal Sources Finder.
            </p>
          </div>
        `
            });
            emailsSent++;
        } catch (emailError) {
            console.error('Email error:', emailError.message);
        }
    }

    return res.status(200).json({ sent: emailsSent });
});

// ============================================
// ROUTE 3 — Know Your Rights AI Summary
// URL: POST /api/know-your-rights
// ============================================
app.post('/api/know-your-rights', async (req, res) => {
    console.log('\n📋 /api/know-your-rights called');

    const { caseType, language } = req.body;

    if (!caseType) {
        return res.status(400).json({ error: 'caseType is required' });
    }

    const prompt = `You are a plain-language legal information assistant for New York City residents.

The user has selected this legal situation: ${caseType}
Respond in: ${language || 'English'}

Write exactly 3 sentences:
Sentence 1: Explain what a "${caseType}" legal situation generally involves in simple everyday words.
Sentence 2: Describe one important right or protection that people in this situation have in New York.
Sentence 3: Suggest one clear concrete first step this person can take right now.

RULES:
- Write at an 8th grade reading level
- Do NOT give specific legal advice
- Do NOT make promises like "you will win" or "you are guaranteed"
- Do NOT cite specific laws or statute numbers
- Do NOT start your response with "I" or "As an AI"
- Keep your response to exactly 3 sentences
- Respond entirely in ${language || 'English'}`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5',
                max_tokens: 300,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error('Claude API error:', errData);
            return res.status(500).json({ error: 'AI service error' });
        }

        const claudeData = await response.json();
        const summary = claudeData.content[0].text;
        console.log('✅ Claude responded');

        return res.status(200).json({ summary });

    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ============================================
// ROUTE 4 — Find Matching Legal Resources
// URL: POST /api/find-resources
// ============================================
app.post('/api/find-resources', async (req, res) => {
    console.log('\n🔍 /api/find-resources called');

    const { borough, caseType, income, situation, language, resources } = req.body;

    if (!borough || !caseType) {
        return res.status(400).json({ error: 'Borough and case type are required' });
    }

    if (!resources || resources.length === 0) {
        return res.status(400).json({ error: 'No resources data received' });
    }

    const systemPrompt = `You are a free legal resource assistant for NYC residents.
Your job is to help people find free or low-cost legal aid based on their situation.

You will be given:
- The user's borough
- Their type of legal issue
- Their approximate income level
- A brief description of their situation (optional)
- A list of real legal aid organizations in NYC

Your job is to:
1. Pick the 2-3 best matching organizations for this person
2. For each one write a short plain-English explanation of what they do (2 sentences max)
3. Explain specifically WHY this org is a good match for this person
4. Include their phone number and website
5. Give a realistic wait time expectation

You MUST respond in this exact JSON format and nothing else:
{
  "matches": [
    {
      "name": "Organization name here",
      "why_good_match": "One sentence explaining why this is right for them",
      "what_they_do": "One sentence describing the organization",
      "phone": "phone number",
      "website": "website url",
      "wait_time": "realistic wait time e.g. 5-10 business days",
      "eligibility": "who qualifies"
    }
  ],
  "general_advice": "2-3 sentences of warm encouraging general guidance. Never give legal advice."
}

Rules:
- Never give actual legal advice
- Always use simple language
- Only use organizations from the list provided
- Never make up organizations or phone numbers
- Always be warm and encouraging
- Respond entirely in ${language || 'English'}`;

    const userMessage = `
Please find legal resources for this person:

Borough: ${borough}
Legal Issue Type: ${caseType}
Annual Income: ${income}
Their situation: ${situation}

Here are all the available NYC legal aid organizations:
${JSON.stringify(resources, null, 2)}

Return only the JSON response. No extra text.`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5',
                max_tokens: 1500,
                system: systemPrompt,
                messages: [{ role: 'user', content: userMessage }]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error('Claude API error:', errData);
            return res.status(500).json({ error: 'AI service error' });
        }

        const claudeData = await response.json();
        const rawText = claudeData.content[0].text;
        console.log('✅ Claude responded');

        try {
            const cleaned = rawText.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return res.status(200).json(parsed);
        } catch (parseError) {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return res.status(200).json(parsed);
            }
            console.error('Could not parse Claude response:', rawText);
            return res.status(500).json({ error: 'Could not parse AI response' });
        }

    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ============================================
// Start the server
// ============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n✅ Backend server running on port ${PORT}`);
    console.log(`   Health check:      GET  /`);
    console.log(`   Reminder route:    GET  /api/send-reminder`);
    console.log(`   Know Your Rights:  POST /api/know-your-rights`);
    console.log(`   Find Resources:    POST /api/find-resources\n`);
});