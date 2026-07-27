import React from 'react';
import { LayoutGrid, HelpCircle, Bell, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      <button
        onClick={() => setActiveTab('feed')}
        className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
      >
        <LayoutGrid size={20} />
        <span>Feed</span>
      </button>

      <button
        onClick={() => setActiveTab('my-doubts')}
        className={`nav-item ${activeTab === 'my-doubts' ? 'active' : ''}`}
      >
        <HelpCircle size={20} />
        <span>My Doubts</span>
      </button>

      <button
        onClick={() => setActiveTab('activity')}
        className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
      >
        <Bell size={20} />
        <span>Activity</span>
      </button>

      <button
        onClick={() => setActiveTab('profile')}
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
      >
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
}
