import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Sparkles, Brain, Code, AlertTriangle, ShieldCheck } from 'lucide-react';

const DEFAULT_TEMPLATES = {
  javascript: `// Paste your messy JavaScript code here for review
function calculateData(arr) {
  var result = 0;
  for(var i=0; i<arr.length; i++) {
    for(var j=0; j<arr.length; j++) {
      if(arr[i] == arr[j] && i != j) {
        result += arr[i] * 2;
      }
    }
  }
  return result;
}`,
  typescript: `// Paste your messy TypeScript code here
function getUserName(user: any): string {
  var name = user.name;
  if(user.firstName != undefined) {
    name = user.firstName + " " + user.lastName;
  }
  return name;
}`,
  python: `# Paste your messy Python code here
def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr) - 1):
            if arr[j] > arr[j+1]:
                temp = arr[j]
                arr[j] = arr[j+1]
                arr[j+1] = temp
    return arr`,
  cpp: `// Paste your messy C++ code here
#include <iostream>
#include <vector>
using namespace std;

int findMax(vector<int> arr) {
    int max = -999999;
    for(int i=0; i<arr.size(); i++) {
        if(arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}`,
  java: `// Paste your messy Java code here
import java.util.List;

public class Helper {
    public int sumElements(List<Integer> list) {
        int s = 0;
        for(int i = 0; i < list.size(); i++) {
            s = s + list.get(i);
        }
        return s;
    }
}`
};

export default function ReviewDashboard({ onSubmit, loading, initialCode, initialLanguage, initialPersonality }) {
  const [code, setCode] = useState(initialCode || DEFAULT_TEMPLATES.javascript);
  const [language, setLanguage] = useState(initialLanguage || 'javascript');
  const [personality, setPersonality] = useState(initialPersonality || 'Strict Senior Developer');

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  useEffect(() => {
    if (initialPersonality) {
      setPersonality(initialPersonality);
    }
  }, [initialPersonality]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (!initialCode || code === DEFAULT_TEMPLATES[language] || Object.values(DEFAULT_TEMPLATES).includes(code)) {
      setCode(DEFAULT_TEMPLATES[lang] || '');
    }
  };

  const handleReview = () => {
    onSubmit({ code, language, personality });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'auto', minHeight: '100%' }}>
      {/* Configuration Header Panel */}
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
            padding: '0.50rem',
            background: 'var(--secondary-glow)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--secondary)'
          }}>
            <Brain size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Review Configuration</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose your code language & review personality</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Language Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Language</span>
            <select
              value={language}
              onChange={handleLanguageChange}
              style={{ minWidth: '130px' }}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Personality Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Personality</span>
            <select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="Strict Senior Developer">Strict Senior Developer</option>
              <option value="Friendly Mentor">Friendly Mentor</option>
              <option value="Security Expert">Security Expert</option>
              <option value="FAANG Interviewer">FAANG Interviewer</option>
            </select>
          </div>

          <button
            onClick={handleReview}
            disabled={loading}
            className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
            style={{ alignSelf: 'flex-end', height: '42px', padding: '0 1.5rem', marginTop: 'auto' }}
          >
            {loading ? (
              <>
                <Sparkles size={16} className="pulse-glow" />
                <span>Reviewing...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Analyze Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Workspace */}
      <div className="glass-panel" style={{
        flex: 1,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{
          padding: '0.75rem 1.25rem',
          background: 'rgba(255, 255, 255, 0.01)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <Code size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>source_code.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'js'}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={12} style={{ color: 'var(--color-success)' }} />
              Live Syntax Checking
            </div>
          </div>
        </div>

        <div style={{ height: '400px', padding: '0.5rem 0' }}>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: 14,
              fontFamily: 'var(--font-mono)',
              minimap: { enabled: false },
              wordWrap: 'on',
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 10, bottom: 10 }
            }}
          />
        </div>
      </div>
    </div>
  );
}
