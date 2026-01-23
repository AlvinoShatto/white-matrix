import { useState, useEffect } from 'react';
import api from '../utils/api';

function VoterList() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const response = await api.get('/voters');
      setVoters(response.data.voters);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-elevated p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Voted</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
            <p className="text-gray-600">Loading voters...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Voted</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Voting Participants</h2>
      
      {voters.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zM5 20a3 3 0 013-3h4a3 3 0 013 3v2H5v-2z" />
          </svg>
          <p className="text-gray-600">No participants yet</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {voters.map((voter, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100 hover:border-red-300 transition-all duration-200 hover-lift"
              >
                <div className="flex items-center gap-3 flex-grow">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {voter.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold truncate">{voter.name}</p>
                    <p className="text-gray-600 text-sm truncate">{voter.email}</p>
                  </div>
                </div>

                {voter.linkedin_url ? (
                  <a
                    href={voter.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200"
                    title="View LinkedIn profile"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065z"/>
                    </svg>
                  </a>
                ) : (
                  <span className="ml-3 px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-lg flex-shrink-0">
                    No LinkedIn
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">Total: {voters.length} participant{voters.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  );
}

export default VoterList;



