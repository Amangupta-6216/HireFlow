import React from 'react';
import { Briefcase, Shield, Server, Database, Cloud } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">HireFlow</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Industry-standard associated MERN full-stack job portal designed with granular multi-tenant role architectures, presigned S3 storage, automated email pipelines, and real-time candidate pipeline workflows.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="/jobs" className="hover:text-white transition-colors">Explore Open Jobs</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Candidate Sign Up</a></li>
              <li><a href="/register?role=company" className="hover:text-white transition-colors">Post Positions</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Enterprise Portal</a></li>
            </ul>
          </div>

          {/* Tech Stack Pillars */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2"><Server className="w-3.5 h-3.5 text-blue-400" /> Node.js & Express API</li>
              <li className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-emerald-400" /> MongoDB Atlas & Mongoose</li>
              <li className="flex items-center gap-2"><Cloud className="w-3.5 h-3.5 text-amber-400" /> AWS S3 Presigned URLs</li>
              <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-purple-400" /> JWT + HttpOnly Cookies</li>
            </ul>
          </div>

          {/* Security & Reliability */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Security Standards</h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 rounded bg-slate-900 text-[11px] text-slate-300 border border-slate-800">Bcrypt Salt 10</span>
              <span className="px-2 py-1 rounded bg-slate-900 text-[11px] text-slate-300 border border-slate-800">Express Rate Limit</span>
              <span className="px-2 py-1 rounded bg-slate-900 text-[11px] text-slate-300 border border-slate-800">Helmet Headers</span>
              <span className="px-2 py-1 rounded bg-slate-900 text-[11px] text-slate-300 border border-slate-800">Multer Filter</span>
              <span className="px-2 py-1 rounded bg-slate-900 text-[11px] text-slate-300 border border-slate-800">Nodemailer SMTP</span>
              <span className="px-2 py-1 rounded bg-slate-900 text-[11px] text-slate-300 border border-slate-800">Unique Index Constraints</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} HireFlow Full-Stack Portal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with React 18, Vite, Redux Toolkit, Tailwind CSS, Express, and MongoDB Atlas.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
