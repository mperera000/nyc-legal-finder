function ResourceCard({ match, index }) {
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

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-2 mb-4">
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

        </div>
    )
}

export default ResourceCard