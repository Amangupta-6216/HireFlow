import React from 'react';
import { Search, MapPin, Filter, RotateCcw, DollarSign, Sparkles } from 'lucide-react';

export const JobFilterBar = ({ filters, onFilterChange, onReset, onSearchSubmit }) => {
  const handleChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      {/* Top Search Inputs Row */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Keyword Search */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, skills (e.g. React, Node.js), or keywords..."
            value={filters.keyword || ''}
            onChange={(e) => handleChange('keyword', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Location Filter */}
        <div className="md:col-span-4 relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="City, state, or location..."
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-3 flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Find Jobs
          </button>
          <button
            type="button"
            onClick={onReset}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Filter Options Row */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-3">
          {/* Job Type Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Type:</span>
            <select
              value={filters.jobType || 'all'}
              onChange={(e) => handleChange('jobType', e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          {/* Experience Level */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Level:</span>
            <select
              value={filters.experienceLevel || 'all'}
              onChange={(e) => handleChange('experienceLevel', e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
            >
              <option value="all">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead / Principal</option>
            </select>
          </div>

          {/* Min Salary */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Min Salary:</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input
                type="number"
                placeholder="e.g. 100000"
                value={filters.minSalary || ''}
                onChange={(e) => handleChange('minSalary', e.target.value)}
                className="w-28 pl-6 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
              />
            </div>
          </div>

          {/* Remote Toggle */}
          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={Boolean(filters.isRemote)}
              onChange={(e) => handleChange('isRemote', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1 text-slate-700">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Remote Only
            </span>
          </label>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-slate-500">Sort by:</span>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
          >
            <option value="newest">Newest First</option>
            <option value="salaryHigh">Highest Salary</option>
            <option value="salaryLow">Lowest Salary</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default JobFilterBar;
