import React from 'react';
import { History, Trash2, Code2, Columns, Calendar, ArrowRight } from 'lucide-react';

export default function HistorySidebar({ historyList, onSelect, onDelete, activeId }) {
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="glass-panel" style={{
      width: '320px',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 100px)',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          padding: '0.5rem',
          background: 'var(--primary-glow)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--primary)'
        }}>
          <History size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Analysis History</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reload previous reports</p>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {historyList.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            gap: '0.5rem'
          }}>
            <Code2 size={32} strokeWidth={1.5} />
            <span style={{ fontSize: '0.875rem' }}>No history items yet</span>
          </div>
        ) : (
          historyList.map((item) => {
            const isSelected = activeId === item._id;
            const isCompare = item.reviewType === 'compare';
            
            return (
              <div
                key={item._id}
                onClick={() => onSelect(item)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${isCompare ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                    {isCompare ? 'Comparison' : item.personality?.split(' ')[0] || 'Review'}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item._id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {isCompare ? (
                    <>
                      <span>Sol A</span>
                      <ArrowRight size={12} />
                      <span>Sol B</span>
                    </>
                  ) : (
                    item.code.trim().substring(0, 30) || 'Untitled Code'
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {isCompare ? <Columns size={12} /> : <Code2 size={12} />}
                    {item.language}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
