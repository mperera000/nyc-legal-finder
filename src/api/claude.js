import resources from '../data/resources.json'

const SYSTEM_PROMPT = `You are a free legal resource assistant for NYC residents. 
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
  "general_advice": "2-3 sentences of warm, encouraging general guidance for this person's situation. Never give legal advice. Only point them in the right direction."
}

Rules:
- Never give actual legal advice
- Always use simple language
- Only use organizations from the list provided to you
- Never make up organizations or phone numbers
- Always be warm and encouraging — legal situations are stressful`

export async function findLegalResources({ borough, caseType, income, situation }) {
    const userMessage = `
Please find legal resources for this person:

Borough: ${borough}
Legal Issue Type: ${caseType}
Annual Income: ${income || 'Not provided'}
Their situation: ${situation || 'Not provided'}

Here are all the available NYC legal aid organizations:
${JSON.stringify(resources, null, 2)}

Return only the JSON response. No extra text.
`

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
    const result = data.summary; // your server returns { summary: "..." }

    const data = await response.json()

    const text = data.content[0].text
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return parsed
}