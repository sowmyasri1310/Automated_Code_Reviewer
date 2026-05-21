import React, { useState, useEffect } from 'react';
import HistorySidebar from './components/HistorySidebar';
import ReviewDashboard from './components/ReviewDashboard';
import CompareDashboard from './components/CompareDashboard';
import AnalyticsPanel from './components/AnalyticsPanel';
import { ShieldCheck, Scale, Sparkles, AlertCircle, Settings, X, Key } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api');

export default function App() {
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'compare'
  const [historyList, setHistoryList] = useState([]);
  const [activeReview, setActiveReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Custom API key settings states
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState(localStorage.getItem('gemini_api_key') || '');
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('gemini_model') || 'gemini-2.5-flash');

  // State buffers to sync code back to editors
  const [reviewCode, setReviewCode] = useState('');
  const [reviewLanguage, setReviewLanguage] = useState('javascript');
  const [reviewPersonality, setReviewPersonality] = useState('Strict Senior Developer');

  const [compareCodeA, setCompareCodeA] = useState('');
  const [compareCodeB, setCompareCodeB] = useState('');
  const [compareLanguage, setCompareLanguage] = useState('javascript');

  // Fetch History on Load
  useEffect(() => {
    fetchHistory();
    // Default load key if present
    const savedKey = localStorage.getItem('gemini_api_key');
    if (!savedKey) {
      // Pre-populate with key provided in user request for quick testing convenience!
      localStorage.setItem('gemini_api_key', 'AIzaSyC6XMgtoN0EX1J3nC-pEQXDsEQeRB37fiA');
      setApiKeyValue('AIzaSyC6XMgtoN0EX1J3nC-pEQXDsEQeRB37fiA');
    }
    const savedModel = localStorage.getItem('gemini_model');
    if (!savedModel) {
      localStorage.setItem('gemini_model', 'gemini-2.5-flash');
      setGeminiModel('gemini-2.5-flash');
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error('Failed to load history list:', err);
    }
  };

  const handleSelectHistory = (item) => {
    setError('');
    setActiveReview(item.result);
    
    if (item.reviewType === 'compare') {
      setActiveTab('compare');
      setCompareCodeA(item.code);
      setCompareCodeB(item.codeB || '');
      setCompareLanguage(item.language);
    } else {
      setActiveTab('review');
      setReviewCode(item.code);
      setReviewLanguage(item.language);
      setReviewPersonality(item.personality);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/history/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistoryList(prev => prev.filter(item => item._id !== id));
        fetchHistory();
      }
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  // Callback to save API key and model configuration
  const handleSaveSettings = (key, model) => {
    localStorage.setItem('gemini_api_key', key.trim());
    localStorage.setItem('gemini_model', model);
    setApiKeyValue(key.trim());
    setGeminiModel(model);
    setShowSettings(false);
    setError('');
  };

  // Callback to submit single file review
  const handleReviewSubmit = async ({ code, language, personality }) => {
    setLoading(true);
    setError('');
    setActiveReview(null);

    // Update state buffers
    setReviewCode(code);
    setReviewLanguage(language);
    setReviewPersonality(personality);

    const apiKey = localStorage.getItem('gemini_api_key') || '';
    const activeModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

    try {
      const response = await fetch(`${BACKEND_URL}/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey,
          'x-gemini-model': activeModel
        },
        body: JSON.stringify({ code, language, personality })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred during review');
      }

      setActiveReview(data);
      fetchHistory(); // refresh history log
    } catch (err) {
      if (err.message.includes('API_KEY_INVALID') || err.message.includes('key not valid')) {
        setError('Invalid Gemini API Key. Please click the Gear icon ⚙️ in the top right to configure a valid API Key.');
      } else if (err.message.includes('503') || err.message.toLowerCase().includes('service unavailable') || err.message.toLowerCase().includes('demand')) {
        setError('Gemini is currently experiencing high demand (503 Service Unavailable). Spikes in demand are usually temporary. Please wait a few seconds and try again, or click the Gear icon ⚙️ in the top right to switch to another model (e.g., Gemini 2.5 Pro).');
      } else if (err.message.includes('not found') || err.message.includes('404')) {
        setError(`Model "${activeModel}" is not supported or was deprecated. Click the Gear icon ⚙️ in the top right to select a newer model (e.g. Gemini 2.5 Flash).`);
      } else {
        setError(err.message || 'Network connection failed. Make sure the Node server is active.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Callback to submit dual-solution compare
  const handleCompareSubmit = async ({ code, codeB, language }) => {
    setLoading(true);
    setError('');
    setActiveReview(null);

    // Update state buffers
    setCompareCodeA(code);
    setCompareCodeB(codeB);
    setCompareLanguage(language);

    const apiKey = localStorage.getItem('gemini_api_key') || '';
    const activeModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

    try {
      const response = await fetch(`${BACKEND_URL}/compare`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey,
          'x-gemini-model': activeModel
        },
        body: JSON.stringify({ code, codeB, language })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred during comparison');
      }

      setActiveReview(data);
      fetchHistory(); // refresh history log
    } catch (err) {
      if (err.message.includes('API_KEY_INVALID') || err.message.includes('key not valid')) {
        setError('Invalid Gemini API Key. Please click the Gear icon ⚙️ in the top right to configure a valid API Key.');
      } else if (err.message.includes('503') || err.message.toLowerCase().includes('service unavailable') || err.message.toLowerCase().includes('demand')) {
        setError('Gemini is currently experiencing high demand (503 Service Unavailable). Spikes in demand are usually temporary. Please wait a few seconds and try again, or click the Gear icon ⚙️ in the top right to switch to another model (e.g., Gemini 2.5 Pro).');
      } else if (err.message.includes('not found') || err.message.includes('404')) {
        setError(`Model "${activeModel}" is not supported or was deprecated. Click the Gear icon ⚙️ in the top right to select a newer model (e.g. Gemini 2.5 Flash).`);
      } else {
        setError(err.message || 'Network connection failed. Make sure the Node server is active.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Callback from Refactoring tab to apply code directly to Monaco
  const handleApplyRefactor = (refactoredCode) => {
    setReviewCode(refactoredCode);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveReview(null);
    setError('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Premium Header Bar */}
      <header className="glass-panel" style={{
        margin: '1.25rem 1.25rem 0 1.25rem',
        padding: '0.85rem 1.75rem',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.7)',
        zIndex: 10
      }}>
        {/* Logo Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #FFF 30%, #A855F7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Automated Code Reviewer
            </h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Production Diagnostics</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.25rem'
        }}>
          <button
            onClick={() => handleTabChange('review')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'review' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'review' ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ShieldCheck size={14} />
            <span>Single Review</span>
          </button>

          <button
            onClick={() => handleTabChange('compare')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'compare' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'compare' ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Scale size={14} />
            <span>Compare Solutions</span>
          </button>
        </div>

        {/* API Settings Controller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(255,255,255,0.02)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.7rem'
          }}>
            <Sparkles size={12} style={{ color: 'var(--secondary)' }} />
            {geminiModel}
          </span>

          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            title="API Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Main Core Grid Layout */}
      <main style={{
        flex: 1,
        display: 'flex',
        padding: '1.25rem',
        gap: '1.25rem',
        height: 'calc(100vh - 100px)',
        overflow: 'hidden'
      }}>
        {/* Sidebar history */}
        <HistorySidebar
          historyList={historyList}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          activeId={activeReview?.id}
        />

        {/* Dynamic Editor Panel */}
        <div style={{ flex: 1.2, height: '100%', overflowY: 'auto' }}>
          {error && (
            <div className="glass-panel" style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              borderColor: 'var(--color-danger)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'review' ? (
            <ReviewDashboard
              onSubmit={handleReviewSubmit}
              loading={loading}
              initialCode={reviewCode}
              initialLanguage={reviewLanguage}
              initialPersonality={reviewPersonality}
            />
          ) : (
            <CompareDashboard
              onSubmit={handleCompareSubmit}
              loading={loading}
              initialCodeA={compareCodeA}
              initialCodeB={compareCodeB}
              initialLanguage={compareLanguage}
            />
          )}
        </div>

        {/* Live Diagnostics Metrics Panel */}
        <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
          <AnalyticsPanel
            data={activeReview}
            activeTab={activeTab}
            onApplyRefactor={handleApplyRefactor}
          />
        </div>
      </main>

      {/* Sleek API Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{
            width: '420px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-glow)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} style={{ color: 'var(--primary)' }} />
                API Configuration
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Paste your custom Gemini API key and pick the model version to use for processing your code analyses.
              </p>
            </div>

            {/* Model Selector dropdown inside Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gemini Model Version</label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                style={{ width: '100%', background: 'rgba(17, 24, 39, 0.8)' }}
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gemini API Key</label>
              <input
                type="password"
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
                placeholder="AIzaSy..."
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setShowSettings(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
              <button onClick={() => handleSaveSettings(apiKeyValue, geminiModel)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
