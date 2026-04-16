import { useState, useEffect } from 'react'
import supabase from '../api/supabase'

const statusColors = {
    'Waiting': 'bg-yellow-100 text-yellow-800',
    'Responded': 'bg-blue-100 text-blue-800',
    'Resolved': 'bg-green-100 text-green-800'
}

function getDaysAgo(dateString) {
    const contacted = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - contacted) / (1000 * 60 * 60 * 24))
    return diff
}

function Dashboard() {
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContacts()
    }, [])

    const fetchContacts = async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('contacted_date', { ascending: false })

        if (error) {
            console.error(error)
        } else {
            setContacts(data)
        }
        setLoading(false)
    }

    const updateStatus = async (id, newStatus) => {
        const { error } = await supabase
            .from('contacts')
            .update({ status: newStatus })
            .eq('id', id)

        if (!error) {
            setContacts(contacts.map(c =>
                c.id === id ? { ...c, status: newStatus } : c
            ))
        }
    }

    if (loading) {
        return (
            <div className="text-center py-12 text-gray-500">
                Loading your tracker...
            </div>
        )
    }

    if (contacts.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg mb-2">No contacts tracked yet.</p>
                <p className="text-gray-400 text-sm">
                    Go back to search and click "I Contacted This Org" on any result.
                </p>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">My Follow-Up Tracker</h2>
            <p className="text-gray-500 mb-6">
                Track the organizations you've contacted and follow up if needed.
            </p>

            {contacts.map((contact) => {
                const daysAgo = getDaysAgo(contact.contacted_date)
                const needsFollowUp = daysAgo >= 7 && contact.status === 'Waiting'

                return (
                    <div
                        key={contact.id}
                        className={`bg-white rounded-xl shadow-md p-6 mb-4 border-l-4 ${needsFollowUp ? 'border-orange-500' : 'border-blue-600'
                            }`}
                    >
                        {/* 7-Day Nudge Banner */}
                        {needsFollowUp && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-4">
                                <p className="text-orange-800 text-sm font-semibold">
                                    ⏰ It's been {daysAgo} days — time to follow up with {contact.org_name}
                                </p>
                                <p className="text-orange-700 text-xs mt-1">
                                    Call them directly or visit their website to check on your inquiry.
                                </p>
                            </div>
                        )}

                        {/* Org Info */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{contact.org_name}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {contact.case_type} · {contact.borough} · Contacted {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`}
                                </p>
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[contact.status]}`}>
                                {contact.status}
                            </span>
                        </div>

                        {/* Status Update Buttons */}
                        <div className="flex gap-2 mt-4">
                            <p className="text-xs text-gray-500 self-center mr-1">Update status:</p>
                            {['Waiting', 'Responded', 'Resolved'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => updateStatus(contact.id, status)}
                                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${contact.status === status
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 text-gray-600 hover:border-blue-400'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                    </div>
                )
            })}
        </div>
    )
}

export default Dashboard