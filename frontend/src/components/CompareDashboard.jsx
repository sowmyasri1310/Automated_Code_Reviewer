import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Columns, Sparkles, Scale, BookOpen, Zap, AlertCircle } from 'lucide-react';

const DUAL_TEMPLATES = {
  javascript: {
    title: "Fibonacci (Recursive vs Memoized)",
    codeA: `// Solution A: Standard Recursive (Messy/Slow)
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(35));`,
    codeB: `// Solution B: Memoized DP (Clean/Fast)
function fibonacciMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
  return memo[n];
}
console.log(fibonacciMemo(35));`
  },
  python: {
    title: "Bubble Sort vs Quick Sort",
    codeA: `# Solution A: Bubble Sort (O(n²))
def sort_array(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`,
    codeB: `# Solution B: Quick Sort (O(n log n))
def sort_array(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return sort_array(left) + middle + sort_array(right)`
  }
};

export default function CompareDashboard({ onSubmit, loading, initialCodeA, initialCodeB, initialLanguage }) {
  const [language, setLanguage] = useState(initialLanguage || 'javascript');
  const [codeA, setCodeA] = useState(initialCodeA || DUAL_TEMPLATES.javascript.codeA);
  const [codeB, setCodeB] = useState(initialCodeB || DUAL_TEMPLATES.javascript.codeB);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (DUAL_TEMPLATES[lang]) {
      setCodeA(DUAL_TEMPLATES[lang].codeA);
      setCodeB(DUAL_TEMPLATES[lang].codeB);
    }
  };

  const handleCompare = () => {
    onSubmit({ code: codeA, codeB, language });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'auto', minHeight: '100%' }}>
      {/* Control Panel */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        borderRadius: 'var(--radius-xl)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.5rem',
            background: 'var(--primary-glow)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--primary)'
          }}>
            <Scale size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Compare Solutions</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Analyze readability, execution speed, and scalability of two approaches</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Language Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Language</span>
            <select
              value={language}
              onChange={handleLanguageChange}
              style={{ minWidth: '150px' }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading}
            className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
            style={{ alignSelf: 'flex-end', height: '42px', padding: '0 1.5rem', marginTop: 'auto' }}
          >
            {loading ? (
              <>
                <Sparkles size={16} className="pulse-glow" />
                <span>Comparing...</span>
              </>
            ) : (
              <>
                <Scale size={16} />
                <span>Compare Codes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dual Side-by-Side Editor Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
        flex: 1,
        minHeight: '400px'
      }}>
        {/* Solution A Editor */}
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(239, 68, 68, 0.2)' // subtle red boundary for A
        }}>
          <div style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(239, 68, 68, 0.02)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>A</span>
              <span style={{ fontWeight: 600 }}>Solution A</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>source_a.{language === 'python' ? 'py' : 'js'}</span>
          </div>
          <div style={{ height: '400px', padding: '0.5rem 0' }}>
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={codeA}
              onChange={(value) => setCodeA(value || '')}
              options={{
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>
        </div>

        {/* Solution B Editor */}
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(16, 185, 129, 0.2)' // subtle green boundary for B
        }}>
          <div style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(16, 185, 129, 0.02)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>B</span>
              <span style={{ fontWeight: 600 }}>Solution B</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>source_b.{language === 'python' ? 'py' : 'js'}</span>
          </div>
          <div style={{ height: '400px', padding: '0.5rem 0' }}>
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={codeB}
              onChange={(value) => setCodeB(value || '')}
              options={{
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
