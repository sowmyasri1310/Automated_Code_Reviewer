import React, { useState } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  Bug, Zap, Sparkles, HelpCircle, CheckCircle2, ChevronRight, ChevronDown, 
  Copy, Check, RefreshCw, Star, Code2, AlertTriangle, ShieldCheck, TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AnalyticsPanel({ data, activeTab, onApplyRefactor }) {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('review'); // 'review' | 'refactor' | 'complexity' | 'beginner'
  const [expandedLine, setExpandedLine] = useState(null);

  if (!data) {
    return (
      <div className="glass-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        textAlign: 'center',
        height: '100%',
        color: 'var(--text-secondary)',
        gap: '1rem',
        borderRadius: 'var(--radius-xl)'
      }}>
        <div className="pulse-glow" style={{
          padding: '1rem',
          background: 'var(--primary-glow)',
          borderRadius: '50%',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sparkles size={36} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Awaiting Code Submission</h3>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '380px' }}>
            Paste your script in the editor above and launch the analyzer to unlock comprehensive review metrics.
          </p>
        </div>
      </div>
    );
  }

  // --- CELEBRATE REFACTOR IMPLEMENTATION ---
  const handleApply = () => {
    if (data.refactoredCode) {
      onApplyRefactor(data.refactoredCode);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#A855F7', '#10B981']
      });
    }
  };

  const handleCopy = () => {
    if (data.refactoredCode) {
      navigator.clipboard.writeText(data.refactoredCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ==========================================
  // RENDER: COMPARE SOLUTIONS MODE METRICS
  // ==========================================
  if (activeTab === 'compare') {
    const isWinnerA = data.winner === 'A';
    const isWinnerB = data.winner === 'B';
    const isTie = data.winner === 'Tie';

    const getScoreColor = (score) => {
      if (score >= 80) return 'var(--color-success)';
      if (score >= 60) return 'var(--color-warning)';
      return 'var(--color-danger)';
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Winner Banner */}
        <div className="glass-panel-glow" style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(168,85,247,0.05) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          border: '1px solid rgba(168, 85, 247, 0.25)'
        }}>
          <div style={{
            background: isWinnerB ? 'var(--color-success-bg)' : isWinnerA ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isWinnerB ? 'var(--color-success)' : isWinnerA ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-lg)',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: isWinnerB ? 'var(--color-success)' : isWinnerA ? 'var(--primary)' : 'var(--text-primary)'
          }}>
            {data.winner}
          </div>
          <div style={{ flex: 1 }}>
            <span className="badge badge-info" style={{ marginBottom: '0.25rem', fontSize: '0.65rem' }}>Comparison Result</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {isTie ? "It's a Tie!" : `Solution ${data.winner} Wins the Study`}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {data.winnerReason}
            </p>
          </div>
        </div>

        {/* Dual Performance Score Bars */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            Architectural Score Matrix
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Solution A Scores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>A</span>
                Solution A Metrics
              </div>
              
              {['readability', 'speed', 'scalability'].map((metric) => {
                const score = data.scoreA[metric];
                return (
                  <div key={metric} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{metric}</span>
                      <span style={{ fontWeight: 600, color: getScoreColor(score) }}>{score}/100</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${score}%`, height: '100%', background: 'linear-gradient(90deg, #EF4444 0%, #F43F5E 100%)', borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Solution B Scores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
                <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>B</span>
                Solution B Metrics
              </div>

              {['readability', 'speed', 'scalability'].map((metric) => {
                const score = data.scoreB[metric];
                return (
                  <div key={metric} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{metric}</span>
                      <span style={{ fontWeight: 600, color: getScoreColor(score) }}>{score}/100</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${score}%`, height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Comparison Explanations */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Deep-Dive Analysis</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Readability & Code Style</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{data.readabilityComparison}</p>
            </div>

            <div style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Execution Speed & Path Complexity</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{data.speedComparison}</p>
            </div>

            <div style={{ borderLeft: '3px solid var(--color-success)', paddingLeft: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Scalability & Memory Overhead</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{data.scalabilityComparison}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: SINGLE REVIEW METRICS
  // ==========================================
  const bugProbability = data.bugProbability ?? 0;
  const getBugScoreColor = (score) => {
    if (score < 30) return 'var(--color-success)';
    if (score < 70) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Overview Analytics Row: Bug Probability Score Gauge & Complexity Badge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.25rem' }}>
        
        {/* Bug Score Card */}
        <div className="glass-panel" style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '0.75rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Radial Bug Probability Gauge */}
          <div style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: `conic-gradient(${getBugScoreColor(bugProbability)} ${bugProbability * 3.6}deg, rgba(255,255,255,0.03) 0deg)`,
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
          }}>
            {/* Inside Inner Circle */}
            <div style={{
              width: '82px',
              height: '82px',
              borderRadius: '50%',
              background: '#0E1322',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{bugProbability}%</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Risk Score</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Bug Probability</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {bugProbability < 30 ? 'Highly robust and runtime safe' : bugProbability < 70 ? 'Moderate issues found' : 'High chance of runtime crashes'}
            </p>
          </div>
        </div>

        {/* Complexity Summary Card */}
        <div className="glass-panel" style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            background: 'var(--primary-glow)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-lg)',
            width: '54px',
            height: '54px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Zap size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <span className="badge badge-info" style={{ fontSize: '0.6rem', marginBottom: '0.25rem' }}>Computational Complexity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{data.complexity?.current || 'N/A'}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>➔</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>{data.complexity?.suggested || 'N/A'}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineBreak: 'anywhere' }}>
              {data.complexity?.explanation?.substring(0, 110)}...
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Tabs Interface */}
      <div className="glass-panel" style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
      }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.01)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {[
            { id: 'review', label: 'Review Notes', icon: <Bug size={14} /> },
            { id: 'refactor', label: 'AI Refactor', icon: <Sparkles size={14} /> },
            { id: 'complexity', label: 'Complexity Visualizer', icon: <TrendingUp size={14} /> },
            { id: 'beginner', label: 'Explain like Beginner', icon: <HelpCircle size={14} /> }
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  background: isActive ? 'rgba(99, 102, 241, 0.05)' : 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div style={{ padding: '1.25rem' }}>
          
          {/* TAB 1: REVIEW CHECKLIST & ISSUES */}
          {activeSubTab === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Errors Block */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.50rem', letterSpacing: '0.05em' }}>
                  Errors / Issues Found ({data.errors?.length || 0})
                </h4>
                {(!data.errors || data.errors.length === 0) ? (
                  <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No syntactic or logical errors detected!</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.errors.map((err, i) => (
                      <div key={i} style={{
                        padding: '0.875rem 1.25rem',
                        background: 'rgba(239, 68, 68, 0.03)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start'
                      }}>
                        <AlertTriangle size={16} style={{ color: 'var(--color-danger)', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {err.line && <span className="badge badge-danger" style={{ fontSize: '0.55rem', padding: '0.1rem 0.4rem' }}>Line {err.line}</span>}
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{err.message}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{err.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Improvements Block */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.50rem', letterSpacing: '0.05em' }}>
                  Suggested Improvements ({data.improvements?.length || 0})
                </h4>
                {(!data.improvements || data.improvements.length === 0) ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No suggestions available.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.improvements.map((imp, i) => (
                      <div key={i} style={{
                        padding: '0.875rem 1.25rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start'
                      }}>
                        <CheckCircle2 size={16} style={{ 
                          color: imp.type === 'performance' ? 'var(--primary)' : imp.type === 'security' ? 'var(--accent)' : 'var(--color-success)', 
                          marginTop: '2px', 
                          flexShrink: 0 
                        }} />
                        <div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className={`badge ${
                              imp.type === 'performance' ? 'badge-info' : imp.type === 'security' ? 'badge-danger' : 'badge-success'
                            }`} style={{ fontSize: '0.55rem', padding: '0.1rem 0.4rem' }}>
                              {imp.type}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{imp.message}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{imp.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: REFACTORING & DIFF VIEW */}
          {activeSubTab === 'refactor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Optimized Refactoring</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Review and apply AI optimized code rewrite</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }}>
                    {copied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button onClick={handleApply} className="btn btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }}>
                    <RefreshCw size={14} />
                    <span>Apply Refactor</span>
                  </button>
                </div>
              </div>

              {/* Code Blocks */}
              <div style={{
                background: 'rgba(10, 15, 25, 0.9)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                    <Code2 size={12} /> refactored_solution
                  </span>
                </div>
                <pre style={{
                  padding: '1.25rem',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-success)',
                  overflowX: 'auto',
                  lineHeight: '1.5',
                  maxHeight: '400px',
                  whiteSpace: 'pre-wrap'
                }}>{data.refactoredCode}</pre>
              </div>

            </div>
          )}

          {/* TAB 3: COMPLEXITY GROWTH GRAPH */}
          {activeSubTab === 'complexity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Algorithmic Scaling Visualizer</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Comparison of operations growth matching original vs optimized algorithm</p>
              </div>

              {/* Recharts Curve */}
              {data.complexity?.chartData ? (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={data.complexity.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="inputSize" stroke="var(--text-muted)" fontSize={11} label={{ value: 'Input Size (N)', position: 'insideBottom', offset: -5 }} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} label={{ value: 'Operations', angle: -90, position: 'insideLeft', offset: 10 }} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--bg-surface-solid)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line name="Current (Slow)" type="monotone" dataKey="currentOps" stroke="var(--accent)" strokeWidth={2.5} activeDot={{ r: 8 }} />
                      <Line name="Suggested (Fast)" type="monotone" dataKey="suggestedOps" stroke="var(--color-success)" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No graph data available.</div>
              )}

              <div style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Complexity Breakdown:</span>
                {data.complexity?.explanation}
              </div>
            </div>
          )}

          {/* TAB 4: EXPLAIN LIKE BEGINNER (ANALOGIES & BREAKDOWNS) */}
          {activeSubTab === 'beginner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Metaphor / Analogy Panel */}
              <div style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.04) 0%, rgba(99,102,241,0.04) 100%)',
                border: '1px solid rgba(168, 85, 247, 0.15)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  padding: '0.50rem',
                  background: 'var(--secondary-glow)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--secondary)',
                  flexShrink: 0
                }}>
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Real-World Analogy Metaphor</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {data.explainBeginner?.analogies || 'No analogies generated.'}
                  </p>
                </div>
              </div>

              {/* Step By Step Accordion List */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.50rem', letterSpacing: '0.05em' }}>
                  Line-by-Line Breakdown
                </h4>
                {(!data.explainBeginner?.stepByStep || data.explainBeginner.stepByStep.length === 0) ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No step-by-step breakdown available.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.explainBeginner.stepByStep.map((step, idx) => {
                      const isExpanded = expandedLine === idx;
                      return (
                        <div key={idx} style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-lg)',
                          overflow: 'hidden',
                          background: 'rgba(255, 255, 255, 0.01)'
                        }}>
                          <button
                            onClick={() => setExpandedLine(isExpanded ? null : idx)}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1.1rem',
                              background: 'none',
                              border: 'none',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem',
                              fontWeight: 500
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span className="badge badge-info" style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>Lines {step.lines}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {step.explanation}
                              </span>
                            </div>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>

                          {isExpanded && (
                            <div style={{
                              padding: '1rem 1.25rem',
                              background: 'rgba(255, 255, 255, 0.02)',
                              borderTop: '1px solid var(--border-color)',
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                              lineHeight: '1.6'
                            }}>
                              {step.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
