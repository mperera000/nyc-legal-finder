// claude.js
// This file is the bridge between your React components and your backend server
// It NEVER calls api.anthropic.com directly
// It ONLY calls your own server (Render), which then calls Claude safely

import resources from '../data/resources.json'

// ============================================
// FUNCTION — Find Legal Resources
// Called by SearchForm.jsx when user clicks "Find Legal Help"
// Sends user's details + full resources list to your server
// Server calls Claude and returns matched organizations
// ============================================
export async function findLegalResources({ borough, caseType, income, situation, language }) {

    // In development this is http://localhost:3001
    // In production (Vercel) this is your Render URL
    // Vercel reads VITE_API_URL from its environment variables
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    const response = await fetch(`${apiUrl}/api/find-resources`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            borough: borough,
            caseType: caseType,
            income: income || 'Not provided',
            situation: situation || 'Not provided',
            language: language || 'English',
            resources: resources  // sends your full resources.json to the server
        })
    })

    // If the server returned an error, throw it so SearchForm catches it
    if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        throw new Error(`Server returned ${response.status}: ${errorData.error}`)
    }

    // Parse and return the full response
    // This returns { matches: [...], general_advice: "..." }
    // SearchForm does: setResults(response)
    // So results.matches and results.general_advice will both be available
    const data = await response.json()
    return data
}


// ============================================
// FUNCTION — Get Know Your Rights Summary
// Called by KnowYourRights.jsx when user selects a case type
// Returns a plain-English 3-sentence rights summary
// ============================================
export async function getKnowYourRights({ caseType, language }) {

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    const response = await fetch(`${apiUrl}/api/know-your-rights`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            caseType: caseType,
            language: language || 'English'
        })
    })

    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
    }

    const data = await response.json()

    // Server returns { summary: "three sentences here" }
    return data.summary
}