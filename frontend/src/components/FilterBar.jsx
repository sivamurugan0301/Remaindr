import React from 'react';
import { Search, MessageSquare, Calendar, Bell, Layers, RefreshCw, X } from 'lucide-react';

export default function FilterBar({
  selectedChannel,
  onSelectChannel,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading,
  totalTasksCount,
}) {
  const channelTabs = [
    { id: 'ALL', label: 'All Reminders', icon: Layers },
    { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
    { id: 'CALENDAR', label: 'Calendar', icon: Calendar },
    { id: 'ALARMS', label: 'Alarms', icon: Bell },
  ];

  const statusOptions = [
    { id: 'ALL', label: 'All Statuses' },
    { id: 'PENDING', label: 'Upcoming' },
    { id: 'SENT', label: 'Sent' },
    { id: 'SNOOZED', label: 'Snoozed' },
    { id: 'DISMISSED', label: 'Completed' },
  ];

  return (
    <div className="space-y-4 mb-6">
      
      {/* Primary Filter Tabs */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {channelTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedChannel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectChannel(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh reminders"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Search & Status Filter row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, phone, or note..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Status:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
            {totalTasksCount} {totalTasksCount === 1 ? 'reminder' : 'reminders'}
          </span>
        </div>

      </div>

    </div>
  );
}
