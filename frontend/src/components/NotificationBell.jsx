// src/components/NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';

const TYPE_CONFIG = {
  NEW_APPLICATION:     { icon: '📩', color: '#3b82f6', bg: 'rgba(59,130,246,.12)' },
  CANDIDATE_ACCEPTED:  { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,.12)' },
  VALIDATION_REQUIRED: { icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
  AGREEMENT_GENERATED: { icon: '📄', color: '#7c3aed', bg: 'rgba(124,58,237,.12)' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} days ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        const dropdown = document.getElementById('notif-portal-dropdown');
        if (dropdown && dropdown.contains(e.target)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(o => !o);
  };

  const handleItemClick = (notif) => {
    markRead(notif._id);
    setOpen(false);
    if (notif.type === 'NEW_APPLICATION')     navigate('/company/candidates/all');
    if (notif.type === 'CANDIDATE_ACCEPTED')  navigate('/applications');
    if (notif.type === 'VALIDATION_REQUIRED') navigate('/admin/pending');
    if (notif.type === 'AGREEMENT_GENERATED') navigate('/applications');
  };

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button className="notif-bell-btn" ref={btnRef} onClick={handleOpen} title="Notifications">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && createPortal(
        <div
          id="notif-portal-dropdown"
          className="notif-dropdown"
          style={{ position: 'fixed', top: pos.top, right: pos.right }}
        >
          <div className="notif-dropdown__header">
            <span className="notif-dropdown__title">Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-dropdown__action" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          <div className="notif-dropdown__list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map(notif => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.NEW_APPLICATION;
                return (
                  <div
                    key={notif._id}
                    className={`notif-item ${!notif.isRead ? 'notif-item--unread' : ''}`}
                    onClick={() => handleItemClick(notif)}
                  >
                    <div className="notif-item__icon" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.icon}
                    </div>
                    <div className="notif-item__body">
                      <div className="notif-item__message">{notif.message}</div>
                      <div className="notif-item__time">{timeAgo(notif.createdAt)}</div>
                    </div>
                    {!notif.isRead && <div className="notif-item__dot" style={{ background: cfg.color }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}