import ResourceCard from './ResourceCard'

function ResultsList({ results, caseType, borough }) {

    // Safety check — if results haven't loaded yet, show nothing
    // This prevents a crash when results is null (before first search)
    if (!results || !results.matches) {
        return null
    }

    // Safety check — if matches array is empty, show a helpful message
    if (results.matches.length === 0) {
        return (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-semibold text-yellow-800 mb-2">
                    No exact matches found
                </h3>
                <p className="text-yellow-900 text-sm leading-relaxed">
                    We couldn't find a specific match for your situation.
                    Try calling <strong>311</strong> — NYC's helpline can connect
                    you directly to a legal referral service. You can also visit{' '}
                    <a
                        href="https://www.lawhelp.org/ny"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-700"
                    >
                        LawHelp NY
                    </a>{' '}
                    for a broader directory.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your Matches
            </h2>
            <p className="text-gray-500 mb-6">
                Based on your situation, here are the best free legal resources for you:
            </p>

            {results.matches.map((match, index) => (
                <ResourceCard
                    key={index}
                    match={match}
                    index={index}
                    caseType={caseType}
                    borough={borough}
                />
            ))}

            {/* General Advice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                    💡 General Guidance
                </h3>
                <p className="text-yellow-900 text-sm leading-relaxed">
                    {results.general_advice}
                </p>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center mt-6">
                This tool helps you find resources — it does not provide legal advice.
                Always speak directly with a licensed attorney for advice on your
                specific situation.
            </p>

        </div>
    )
}

export default ResultsList