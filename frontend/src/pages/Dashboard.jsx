import { useState, useEffect } from 'react';
import api from '../utils/api';
import VoterList from '../components/VoterList';

function Dashboard({ token, onLogout }) {
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null);
  const [error, setError] = useState('');
  const [showVoters, setShowVoters] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesRes, voteCheckRes] = await Promise.all([
        api.get('/candidates'),
        api.get('/check-vote'),
      ]);

      setCandidates(candidatesRes.data.candidates);
      setHasVoted(voteCheckRes.data.hasVoted);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId) => {
    setVoting(true);
    setError('');
    setVotedCandidateId(candidateId);

    try {
      await api.post('/vote', { candidate_id: candidateId });
      setHasVoted(true);
      setSuccessMessage('Thank you for voting!');
      setTimeout(() => {
        setShowVoters(true);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Voting Platform</h1>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-emerald-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {hasVoted ? (
          <div className="space-y-8 animate-fade-in">
            {/* Voted Confirmation */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">Vote Submitted Successfully!</h2>
              <p className="text-red-700">Thank you for participating in this election.</p>
            </div>

            {/* Voter List */}
            <VoterList />
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Cast Your Vote</h2>
              <p className="text-lg text-gray-600">Choose your preferred candidate below</p>
            </div>

            {/* Candidates Grid */}
            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
                </svg>
                <p className="text-gray-600 text-lg font-medium">No candidates available at the moment</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="card-elevated p-6 hover-lift flex flex-col"
                  >
                    {/* Candidate Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                      <span className="text-2xl font-bold text-white">
                        {candidate.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Candidate Info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {candidate.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                      {candidate.profile_description}
                    </p>

                    {/* LinkedIn Link */}
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold mb-4 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065z"/>
                        </svg>
                        View Profile
                      </a>
                    )}

                    {/* Vote Button */}
                    <button
                      onClick={() => handleVote(candidate.id)}
                      disabled={voting}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                        voting && votedCandidateId === candidate.id
                          ? 'bg-indigo-600 text-white opacity-75 cursor-wait'
                          : 'btn-primary'
                      }`}
                    >
                      {voting && votedCandidateId === candidate.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Vote Now
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;



