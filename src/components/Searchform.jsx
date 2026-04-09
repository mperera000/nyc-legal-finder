import { useState } from 'react'
import { findLegalResources } from '../api/claude'

const boroughs = [
    "Manhattan",
    "Brooklyn",
    "Bronx",
    "Queens",
    "Staten Island"
]

const caseTypes = [
    { value: "housing", label: "Housing (eviction, repairs, rent issues)" },
    { value: "immigration", label: "Immigration (visa, citizenship, deportation)" },
    { value: "family", label: "Family (divorce, custody, domestic violence)" },
    { value: "criminal", label: "Criminal (arrest, charges, record sealing)" },
    { value: "employment", label: "Employment (fired, unpaid wages, discrimination)" },
    { value: "consumer debt", label: "Consumer Debt (Summons, Bankruptcy, Wage Garnish)" },
    { value: "general", label: "General / Not sure yet" }
]

const incomeRanges = [
    { value: "under_20k", label: "Under $20,000/year" },
    { value: "20k_40k", label: "$20,000 – $40,000/year" },
    { value: "40k_60k", label: "$40,000 – $60,000/year" },
    { value: "over_60k", label: "Over $60,000/year" },
    { value: "prefer_not", label: "Prefer not to say" }
]

function SearchForm({ setResults, setLoading, onCaseTypeChange, onBoroughChange }) {
    const [borough, setBorough] = useState('')
    const [caseType, setCaseType] = useState('')
    const [income, setIncome] = useState('')
    const [situation, setSituation] = useState('')

    const handleSubmit = async () => {
        if (!borough || !caseType) {
            alert('Please select your borough and type of legal issue.')
            return
        }

        setLoading(true)
        setResults(null)
        onCaseTypeChange(caseType)
        onBoroughChange(borough)

        try {
            const response = await findLegalResources({ borough, caseType, income, situation })
            setResults(response)
        } catch (error) {
            alert('Something went wrong. Please try again.')
            console.error(error)
        }

        setLoading(false)
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Tell us about your situation
            </h2>

            {/* Borough */}
            <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">
                    Which borough are you in? *
                </label>
                <select
                    value={borough}
                    onChange={(e) => setBorough(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select your borough</option>
                    {boroughs.map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </select>
            </div>

            {/* Case Type */}
            <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">
                    What type of legal issue do you have? *
                </label>
                <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select issue type</option>
                    {caseTypes.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
            </div>

            {/* Income */}
            <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">
                    What is your approximate annual household income?
                </label>
                <select
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select income range</option>
                    {incomeRanges.map(i => (
                        <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                </select>
            </div>

            {/* Situation */}
            <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                    Briefly describe your situation (optional but helps us find better matches)
                </label>
                <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="e.g. My landlord hasn't fixed my heat for 3 weeks and is threatening to evict me..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
                />
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg text-lg transition-colors"
            >
                Find Legal Help
            </button>
        </div>
    )
}

export default SearchForm