// This file runs directly with Node.js — no server needed
// We're using dynamic imports because your project uses ES modules
// Run it by typing: node test-reminder.js in the terminal

// Step 1: Load your environment variables from .env
// dotenv reads your .env file and makes those values available 
// as process.env.WHATEVER_THE_KEY_IS
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Step 2: Import Resend and Supabase
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Step 3: Print your env variables to confirm they loaded
// We only print the first 10 characters for security
console.log('--- Checking environment variables ---');
console.log('ANTHROPIC_API_KEY loaded:', process.env.ANTHROPIC_API_KEY ? '✅ YES - starts with: ' + process.env.ANTHROPIC_API_KEY.substring(0, 10) : '❌ NO - NOT FOUND');
console.log('SUPABASE_URL loaded:', process.env.SUPABASE_URL ? '✅ YES' : '❌ NO - NOT FOUND');
console.log('SUPABASE_ANON_KEY loaded:', process.env.SUPABASE_ANON_KEY ? '✅ YES' : '❌ NO - NOT FOUND');
console.log('RESEND_API_KEY loaded:', process.env.RESEND_API_KEY ? '✅ YES - starts with: ' + process.env.RESEND_API_KEY.substring(0, 5) : '❌ NO - NOT FOUND');
console.log('--------------------------------------\n');

// Step 4: Create connections to Resend and Supabase
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Step 5: The main function that does all the work
async function testReminder() {
    console.log('--- Step 1: Querying Supabase for old contacts ---');

    // Calculate what date was 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    console.log('Looking for contacts older than:', threeDaysAgo.toISOString());

    // Query Supabase
    const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('status', 'Waiting')
        .lt('contacted_date', threeDaysAgo.toISOString());

    // If Supabase returned an error, print it and stop
    if (error) {
        console.log('❌ SUPABASE ERROR:', error.message);
        console.log('Full error:', JSON.stringify(error, null, 2));
        return;
    }

    // Print what Supabase found
    console.log('✅ Supabase query succeeded');
    console.log('Contacts found that need reminders:', contacts.length);

    if (contacts.length === 0) {
        console.log('\n⚠️  Zero contacts found. This means either:');
        console.log('   1. You have no rows in the contacts table');
        console.log('   2. No rows have status = "Waiting"');
        console.log('   3. No rows have a contacted_date older than 3 days');
        console.log('\nGo to Supabase → Table Editor → contacts and check your test row.');
        return;
    }

    // Print each contact found
    contacts.forEach((c, i) => {
        console.log(`\nContact ${i + 1}:`);
        console.log('  org_name:', c.org_name);
        console.log('  user_email:', c.user_email);
        console.log('  status:', c.status);
        console.log('  contacted_date:', c.contacted_date);
    });

    console.log('\n--- Step 2: Sending reminder emails ---');

    // Loop through each contact and send an email
    for (const contact of contacts) {

        // SAFETY CHECK: if there's no email address, skip this contact
        // This prevents the 422 error from Resend
        const emailAddress = contact.user_email || contact.email;

        if (!emailAddress || emailAddress === 'undefined') {
            console.log(`\n⚠️  SKIPPING ${contact.org_name} — no email address found in this row`);
            console.log('   Go to Supabase and add an email address to this contact row');
            continue; // skip to the next contact in the loop
        }

        console.log(`\nSending email to: ${emailAddress} for org: ${contact.org_name}`);

        try {
            const result = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: emailAddress,   // use the variable, not contact.user_email directly
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
            <p style="color: #6B7280; font-size: 14px;">
              This reminder was sent automatically by NYC Free Legal Sources Finder.
            </p>
          </div>
        `
            });

            console.log('✅ Email sent successfully. Resend ID:', result.data?.id || 'N/A');

        } catch (emailError) {
            console.log('❌ Email failed:', emailError.message);
            console.log('Full error:', JSON.stringify(emailError, null, 2));
        }
    }

    console.log('\n--- DONE ---');
    console.log('Test complete. Check your email inbox now.');
}

// Run the function
testReminder();