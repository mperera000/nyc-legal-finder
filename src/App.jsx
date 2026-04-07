import { useState } from 'react'
import SearchForm from './components/SearchForm'
import ResultsList from './components/ResultsList'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-blue-700 text-white py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">NYC Free Legal Help Finder</h1>
        <p className="text-blue-200 text-lg">
          Find free and low-cost legal resources across New York City
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SearchForm setResults={setResults} setLoading={setLoading} />

        {loading && (
          <div className="text-center mt-8 text-gray-500 text-lg">
            Finding the best resources for your situation...
          </div>
        )}

        {results && !loading && (
          <ResultsList results={results} />
        )}
      </div>

    </div>
  )
}

export default App