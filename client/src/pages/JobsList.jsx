import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchJobs, setFilters, resetFilters } from '../features/jobs/jobSlice';
import JobFilterBar from '../components/jobs/JobFilterBar';
import JobCard from '../components/jobs/JobCard';
import ApplyModal from '../components/jobs/ApplyModal';

export const JobsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, filters, pagination, loading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  useEffect(() => {
    loadJobs();
  }, [filters.page, filters.sortBy]);

  const loadJobs = () => {
    const params = {
      keyword: filters.keyword || undefined,
      location: filters.location || undefined,
      jobType: filters.jobType !== 'all' ? filters.jobType : undefined,
      experienceLevel: filters.experienceLevel !== 'all' ? filters.experienceLevel : undefined,
      isRemote: filters.isRemote ? 'true' : undefined,
      minSalary: filters.minSalary || undefined,
      maxSalary: filters.maxSalary || undefined,
      sortBy: filters.sortBy,
      page: filters.page || 1,
      limit: 9,
    };
    dispatch(fetchJobs(params));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters({ ...newFilters, page: 1 }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    dispatch(fetchJobs({ limit: 9, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setFilters({ page: newPage }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Open Opportunities</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search and filter verified positions across leading tech teams
        </p>
      </div>

      {/* Filter Bar */}
      <JobFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        onSearchSubmit={loadJobs}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>
          Showing {jobs.length} of {pagination.total || 0} position{pagination.total === 1 ? '' : 's'}
        </span>
        {pagination.pages > 1 && (
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No positions match your search criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your keyword, resetting salary constraints, or removing job type filters to broaden your search.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApplyClick={(jobToApply) => {
                if (!user) {
                  navigate('/login');
                } else {
                  setSelectedJobForApply(jobToApply);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => handlePageChange(pg)}
              className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors ${
                pagination.page === pg
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pg}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          job={selectedJobForApply}
          isOpen={Boolean(selectedJobForApply)}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={() => {
            loadJobs();
          }}
        />
      )}
    </div>
  );
};

export default JobsList;
