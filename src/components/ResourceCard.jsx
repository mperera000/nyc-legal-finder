import { useState } from 'react'
import supabase from '../api/supabase'

function ResourceCard({ match, index, caseType, borough }) {
    const [contacted, setContacted] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showEmailInput, setShowEmailInput] = useState(false)  // ADD
    const [userEmail, setUserEmail] = useState('')               // ADD

    const handleContactedClick = () => {
        // First click shows the email input
        setShowEmailInput(true)
    }

    const handleContacted = async () => {
        setSaving(true)

        const { error } = await supabase
            .from('contacts')
            .insert([
                {
                    org_name: match.name,
                    case_type: caseType,
                    borough: borough,
                    status: 'Waiting',
                    contacted_date: new Date().toISOString(),
                    user_email: userEmail || null,  // ADD
                    notes: ''
                }
            ])

        if (error) {
            alert('Could not save. Please try again.')
            console.error(error)
        } else {
            setContacted(true)
            setShowEmailInput(false)
        }

        setSaving(false)
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-4 border-l-4 border-blue-600">

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        Match #{index + 1}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mt-1">
                        {match.name}
                    </h3>
                </div>
            </div>

            {/* Why good match */}
            <div className="bg-blue-50 rounded-lg px-4 py-3 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                    ✓ {match.why_good_match}
                </p>
            </div>

            {/* What they do */}
            <p className="text-gray-600 mb-4">
                {match.what_they_do}
            </p>

            {/* Details */}
            <div className="grid grid-cols-1 gap-2 mb-5">
                <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-28">📞 Phone:</span>
                    <a href={`tel:${match.phone}`} className="text-blue-600 hover:underline">
                        {match.phone}
                    </a>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-28">🌐 Website:</span>
                    <a href={match.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                    </a>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-28">⏱ Wait Time:</span>
                    <span>{match.wait_time}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-28">✅ Eligibility:</span>
                    <span>{match.eligibility}</span>
                </div>
            </div>

            {/* Contact Button Area */}
            {contacted ? (
                <div className="w-full bg-green-100 text-green-800 font-semibold py-3 rounded-lg text-center">
                    ✓ Contacted — Added to your tracker
                </div>

            ) : showEmailInput ? (
                // Email input appears after first click
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        Want a reminder in 3 days if you haven't heard back?
                    </p>
                    <input
                        type="email"
                        placeholder="Your email (optional)"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleContacted}
                        disabled={saving}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Confirm — I Contacted This Org'}
                    </button>
                    <button
                        onClick={() => setShowEmailInput(false)}
                        className="w-full text-gray-400 text-sm hover:text-gray-600"
                    >
                        Cancel
                    </button>
                </div>

            ) : (
                <button
                    onClick={handleContactedClick}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                    I Contacted This Org
                </button>
            )}

        </div>
    )
}

export default ResourceCard