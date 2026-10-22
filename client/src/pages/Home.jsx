import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { fetchJobs, setFilters } from '../features/jobs/jobSlice';
import JobCard from '../components/jobs/JobCard';
import ApplyModal from '../components/jobs/ApplyModal';

export const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, loading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  useEffect(() => {
    dispatch(fetchJobs({ limit: 6 }));
  }, [dispatch]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ keyword, location }));
    navigate('/jobs');
  };

  return (
    <div className="space-y-16 md:space-y-20 pb-20">
      {/* Hero Section - Full First-Screen Viewport */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-gradient-to-b from-blue-50/60 via-slate-50 to-white border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-5xl mx-auto space-y-4 sm:space-y-5">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Your Next Career Move <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Starts Here.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Discover exciting opportunities, connect with the right employers, and take the next step in your career — all in one place.
            </p>

            {/* Hero Search Box */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-6 bg-white p-2.5 sm:p-3 rounded-2xl shadow-lg shadow-blue-500/10 border border-slate-200/80 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-2 text-left"
            >
              <div className="sm:col-span-5 relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Job title, skills, or keywords..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 relative flex items-center border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-2">
                <MapPin className="absolute left-3.5 sm:left-5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Location or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 sm:pl-11 pr-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full h-full py-2 sm:py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>

            {/* Popular Searches Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Trending Skills:</span>
              {['Full-Stack MERN', 'React', 'Node.js', 'Kubernetes', 'Cloud Architect', 'UI/UX'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setKeyword(tag);
                    dispatch(setFilters({ keyword: tag }));
                    navigate('/jobs');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Value Proposition Highlights - Moved further down with refined smaller text */}
            <div className="pt-5 sm:pt-6">
              <div className="inline-flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 py-1.5 px-4 rounded-full bg-slate-50/80 border border-slate-200/60 text-[11px] sm:text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Smart Job Matching</span>
                </span>
                <span className="text-slate-300 font-bold select-none">·</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Transparent Application Tracking</span>
                </span>
                <span className="text-slate-300 font-bold select-none">·</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Streamlined Hiring</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              Curated Openings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured Opportunities
            </h2>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 group"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">No open jobs at this time</h3>
            <p className="text-xs text-slate-500 mt-1">Check back shortly or register a company to post jobs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => (
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
      </section>

      {/* Recruiter Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              For Growing Teams
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Hire Top Engineers Faster with Automated Pipelines
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Publish draft or open positions, review applicants per job, invite interviewers to submit feedback, and send automated notifications on every status change.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/register?role=company"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
              >
                Register Your Company
              </Link>
              <Link
                to="/jobs"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md transition-colors"
              >
                Browse Candidates & Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          job={selectedJobForApply}
          isOpen={Boolean(selectedJobForApply)}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={() => {
            dispatch(fetchJobs({ limit: 6 }));
          }}
        />
      )}
    </div>
  );
};

export default Home;
