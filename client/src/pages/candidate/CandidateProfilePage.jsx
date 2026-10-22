import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Save,
  Pencil,
  Code2,
  Languages,
  Trophy,
  FolderGit2,
  Globe,
  Github,
  Linkedin,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  User,
  X,
  Eye,
  Check,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export const CandidateProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [resumeSignedUrl, setResumeSignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('view-edit');
  const [activeQuickLink, setActiveQuickLink] = useState('preference');

  // Section edit toggles
  const [editingPreference, setEditingPreference] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingLanguages, setEditingLanguages] = useState(false);
  const [editingInternships, setEditingInternships] = useState(false);
  const [editingProjects, setEditingProjects] = useState(false);
  const [editingAchievements, setEditingAchievements] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);

  // 1. Preference state
  const [preferredJobTypes, setPreferredJobTypes] = useState(['Jobs', 'Internships']);
  const [availability, setAvailability] = useState('More than 3 Months');
  const [preferredLocations, setPreferredLocations] = useState([
    'Hyderabad/Secunderabad',
    'Gurgaon/Gurugram',
    'Bangalore/Bengaluru',
    'Pune',
    'Noida',
    'Delhi / NCR',
  ]);
  const [newLocationInput, setNewLocationInput] = useState('');

  // 2. Education state
  const [graduation, setGraduation] = useState({
    degree: 'B.Tech / B.E.',
    institution: 'Chandigarh University, Mohali',
    startYear: '2023',
    endYear: '2027',
    courseType: 'Full Time',
    score: '8.4 CGPA',
  });
  const [classXII, setClassXII] = useState({
    board: 'CBSE',
    medium: 'English',
    passingYear: '2022',
    score: '77%',
    school: 'Delhi Public School',
  });
  const [classX, setClassX] = useState({
    board: 'CBSE',
    medium: 'English',
    passingYear: '2020',
    score: '82.17%',
    school: 'St. Xavier High School',
  });

  // 3. Key Skills state
  const [skillsList, setSkillsList] = useState([
    'Objectoriented Programming (OOP)',
    'DSA',
    'Node.js',
    'C++',
    'C',
    'Express',
    'Python',
    'Javascript',
    'Natural Language Processing',
    'Large Language Model',
    'Operating Systems',
    'DBMS',
    'Github',
  ]);
  const [skillInput, setSkillInput] = useState('');

  // 4. Languages state
  const [languagesList, setLanguagesList] = useState([
    { name: 'English', proficiency: 'Fluent' },
    { name: 'Hindi', proficiency: 'Proficient' },
  ]);
  const [newLangName, setNewLangName] = useState('');
  const [newLangProficiency, setNewLangProficiency] = useState('Fluent');

  // 5. Internships state
  const [internshipsList, setInternshipsList] = useState([]);

  // 6. Projects state
  const [projectsList, setProjectsList] = useState([]);

  // 7. Achievements state
  const [achievementsList, setAchievementsList] = useState([]);

  // 8. Contact & Summary / Bio state
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/profile');
      const p = res.data.profile;
      setProfile(p);
      setResumeSignedUrl(res.data.resumeSignedUrl);

      // Populate preferences
      if (p.preference) {
        if (p.preference.preferredJobType && p.preference.preferredJobType.length > 0) {
          setPreferredJobTypes(p.preference.preferredJobType);
        }
        if (p.preference.availability) {
          setAvailability(p.preference.availability);
        }
        if (p.preference.preferredLocations && p.preference.preferredLocations.length > 0) {
          setPreferredLocations(p.preference.preferredLocations);
        }
      }

      // Populate education
      if (p.education) {
        if (p.education.graduation) {
          setGraduation((prev) => ({
            ...prev,
            ...p.education.graduation,
          }));
        }
        if (p.education.classXII) {
          setClassXII((prev) => ({
            ...prev,
            ...p.education.classXII,
          }));
        }
        if (p.education.classX) {
          setClassX((prev) => ({
            ...prev,
            ...p.education.classX,
          }));
        }
      }

      // Populate key skills
      if (p.keySkills && p.keySkills.length > 0) {
        setSkillsList(p.keySkills);
      } else if (p.skills && p.skills.length > 0) {
        setSkillsList(p.skills);
      }

      // Populate languages
      if (p.languages && p.languages.length > 0) {
        setLanguagesList(p.languages);
      }

      // Populate internships
      if (p.internships) {
        setInternshipsList(p.internships);
      }

      // Populate projects
      if (p.projects) {
        setProjectsList(p.projects);
      }

      // Populate achievements
      if (p.achievements) {
        setAchievementsList(p.achievements);
      }

      // Populate general info
      setBio(p.bio || '');
      setPhone(p.phone || '');
      setLocation(p.location || '');
      setPortfolioUrl(p.portfolioUrl || '');
      setGithubUrl(p.githubUrl || '');
      setLinkedinUrl(p.linkedinUrl || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Preference Handlers
  const handleToggleJobType = (type) => {
    if (preferredJobTypes.includes(type)) {
      if (preferredJobTypes.length > 1) {
        setPreferredJobTypes(preferredJobTypes.filter((t) => t !== type));
      }
    } else {
      setPreferredJobTypes([...preferredJobTypes, type]);
    }
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (newLocationInput.trim() && !preferredLocations.includes(newLocationInput.trim())) {
      setPreferredLocations([...preferredLocations, newLocationInput.trim()]);
      setNewLocationInput('');
    }
  };

  const handleRemoveLocation = (loc) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== loc));
  };

  // 2. Resume Handler
  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Resume file size must be under 2 MB.' });
      return;
    }

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      setStatusMessage({ type: 'error', text: 'Only PDF and DOCX files are supported.' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadingResume(true);
      setStatusMessage(null);
      const res = await axiosClient.post('/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeSignedUrl(res.data.signedUrl);
      setProfile((prev) => ({
        ...prev,
        resumeKey: res.data.resumeKey,
        resumeOriginalName: res.data.fileName,
      }));
      setStatusMessage({ type: 'success', text: 'Resume uploaded and encrypted successfully to cloud storage!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Resume upload failed' });
    } finally {
      setUploadingResume(false);
    }
  };

  // 3. Key Skills Handlers
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      setSkillsList([...skillsList, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleQuickAddSkill = (skill) => {
    if (!skillsList.includes(skill)) {
      setSkillsList([...skillsList, skill]);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  // 4. Languages Handlers
  const handleAddLanguage = (e) => {
    e.preventDefault();
    if (newLangName.trim()) {
      setLanguagesList([...languagesList, { name: newLangName.trim(), proficiency: newLangProficiency }]);
      setNewLangName('');
      setNewLangProficiency('Fluent');
    }
  };

  const handleRemoveLanguage = (index) => {
    setLanguagesList(languagesList.filter((_, i) => i !== index));
  };

  // 5. Internships Handlers
  const handleAddInternship = () => {
    setInternshipsList([
      ...internshipsList,
      {
        companyName: '',
        duration: '',
        projects: '',
        skillsLearned: [],
      },
    ]);
    setEditingInternships(true);
  };

  const handleUpdateInternship = (index, field, value) => {
    const updated = [...internshipsList];
    updated[index][field] = value;
    setInternshipsList(updated);
  };

  const handleRemoveInternship = (index) => {
    setInternshipsList(internshipsList.filter((_, i) => i !== index));
  };

  // 6. Projects Handlers
  const handleAddProject = () => {
    setProjectsList([
      ...projectsList,
      {
        title: '',
        duration: '',
        description: '',
        skillsUsed: [],
        link: '',
      },
    ]);
    setEditingProjects(true);
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...projectsList];
    updated[index][field] = value;
    setProjectsList(updated);
  };

  const handleRemoveProject = (index) => {
    setProjectsList(projectsList.filter((_, i) => i !== index));
  };

  // 7. Achievements Handlers
  const handleAddAchievement = () => {
    setAchievementsList([
      ...achievementsList,
      {
        title: '',
        description: '',
        date: '',
      },
    ]);
    setEditingAchievements(true);
  };

  const handleUpdateAchievement = (index, field, value) => {
    const updated = [...achievementsList];
    updated[index][field] = value;
    setAchievementsList(updated);
  };

  const handleRemoveAchievement = (index) => {
    setAchievementsList(achievementsList.filter((_, i) => i !== index));
  };

  // Master Save Handler
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setStatusMessage(null);

      const payload = {
        preference: {
          preferredJobType: preferredJobTypes,
          availability: availability,
          preferredLocations: preferredLocations,
        },
        education: {
          graduation,
          classXII,
          classX,
        },
        keySkills: skillsList,
        skills: skillsList,
        languages: languagesList,
        internships: internshipsList,
        projects: projectsList,
        achievements: achievementsList,
        bio,
        phone,
        location,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
      };

      const res = await axiosClient.put('/profile', payload);
      setProfile(res.data.profile);
      if (res.data.resumeSignedUrl) {
        setResumeSignedUrl(res.data.resumeSignedUrl);
      }

      // Close open edit states
      setEditingPreference(false);
      setEditingEducation(false);
      setEditingSkills(false);
      setEditingLanguages(false);
      setEditingInternships(false);
      setEditingProjects(false);
      setEditingAchievements(false);
      setEditingSummary(false);

      setStatusMessage({
        type: 'success',
        text: 'All candidate profile details and preferences saved successfully to database!',
      });
    } catch (err) {
      console.error('Save profile error:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save profile changes. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const scrollToSection = (id) => {
    setActiveQuickLink(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600 mt-4">Loading your profile portfolio...</p>
      </div>
    );
  }

  const suggestedSkills = [
    'Objectoriented Programming (OOP)',
    'DSA',
    'Node.js',
    'C++',
    'C',
    'Express',
    'Python',
    'Javascript',
    'Natural Language Processing',
    'Large Language Model',
    'Operating Systems',
    'DBMS',
    'Github',
    'React',
    'MongoDB',
    'SQL',
    'Docker',
    'TailwindCSS',
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Top Navigation Tabs Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab('view-edit')}
                className={`h-14 font-bold text-sm border-b-2 flex items-center transition-all ${
                  activeTab === 'view-edit'
                    ? 'border-blue-600 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                View & Edit
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`h-14 font-medium text-sm border-b-2 flex items-center transition-all ${
                  activeTab === 'insights'
                    ? 'border-blue-600 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Activity insights
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-xs transition-all animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="p-1 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Layout Grid: Left Quick Links Sidebar (w-1/4), Right Cards (w-3/4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Links Sidebar */}
          <aside className="lg:col-span-3 lg:sticky lg:top-20">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 px-3">Quick links</h3>
              <nav className="space-y-0.5">
                {[
                  { id: 'preference', label: 'Preference' },
                  { id: 'resume', label: 'Resume' },
                  { id: 'education', label: 'Education' },
                  { id: 'skills', label: 'Key skills' },
                  { id: 'languages', label: 'Languages' },
                  { id: 'internships', label: 'Internships' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'achievements', label: 'Accomplishments' },
                  { id: 'summary', label: 'Profile summary' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      activeQuickLink === item.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{item.label}</span>
                    {activeQuickLink === item.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-6">
            {/* 1. Preference Section */}
            <section
              id="preference"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Your career preferences
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Job types and work locations you want recruiters to discover you for
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPreference(!editingPreference)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Edit preferences"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {editingPreference ? (
                <div className="space-y-5 pt-2 border-t border-slate-100">
                  {/* Job Type Toggle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Preferred Job Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Jobs', 'Internships', 'Remote Only', 'Part Time'].map((type) => {
                        const isSelected = preferredJobTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleToggleJobType(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 inline mr-1" />}
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Availability to Work
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Immediately">Immediately (Available now)</option>
                      <option value="Within 15 days">Within 15 days</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                      <option value="More than 3 Months">More than 3 Months</option>
                    </select>
                  </div>

                  {/* Preferred Locations */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Preferred Locations
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {preferredLocations.map((loc) => (
                        <span
                          key={loc}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-800"
                        >
                          {loc}
                          <button
                            type="button"
                            onClick={() => handleRemoveLocation(loc)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <form onSubmit={handleAddLocation} className="flex gap-2 max-w-md">
                      <input
                        type="text"
                        placeholder="Add city (e.g. Pune, Bangalore, Delhi / NCR)"
                        value={newLocationInput}
                        onChange={(e) => setNewLocationInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </form>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingPreference(false)}
                      className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Preferred job type</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      {preferredJobTypes.length > 0 ? preferredJobTypes.join(', ') : 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-400">Availability to work</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">{availability}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="block text-xs font-semibold text-slate-400">Preferred location</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                      {preferredLocations.length > 0 ? preferredLocations.join(', ') : 'Open to all locations'}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* 2. Resume Section */}
            <section
              id="resume"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">Resume</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Attached automatically for one-click applications to hiring teams
                  </p>
                </div>
                {profile?.resumeKey && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Uploaded
                  </span>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {profile?.resumeOriginalName || 'No resume uploaded yet'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {profile?.resumeUploadedAt
                        ? `Last updated on ${new Date(profile.resumeUploadedAt).toLocaleDateString()}`
                        : 'Supported formats: PDF, DOCX (Max 2 MB)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {resumeSignedUrl && (
                    <a
                      href={resumeSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-blue-600 font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Resume
                    </a>
                  )}

                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingResume ? 'Uploading...' : profile?.resumeKey ? 'Update Resume' : 'Upload Resume'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFileChange}
                      disabled={uploadingResume}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* 3. Education Section */}
            <section
              id="education"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Education</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your graduation degree, class 12th, and class 10th academic history
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingEducation(!editingEducation)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Edit education details"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {editingEducation ? (
                <div className="space-y-6 pt-2 border-t border-slate-100">
                  {/* Graduation Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Graduation / College Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Degree / Course</label>
                        <input
                          type="text"
                          value={graduation.degree}
                          onChange={(e) => setGraduation({ ...graduation, degree: e.target.value })}
                          placeholder="e.g. B.Tech / B.E."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          University / Institution
                        </label>
                        <input
                          type="text"
                          value={graduation.institution}
                          onChange={(e) => setGraduation({ ...graduation, institution: e.target.value })}
                          placeholder="e.g. Chandigarh University, Mohali"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Passing / End Year</label>
                        <input
                          type="text"
                          value={graduation.endYear}
                          onChange={(e) => setGraduation({ ...graduation, endYear: e.target.value })}
                          placeholder="e.g. 2027"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Course Type</label>
                        <select
                          value={graduation.courseType}
                          onChange={(e) => setGraduation({ ...graduation, courseType: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        >
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="Distance / Correspondence">Distance / Correspondence</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Score / CGPA</label>
                        <input
                          type="text"
                          value={graduation.score}
                          onChange={(e) => setGraduation({ ...graduation, score: e.target.value })}
                          placeholder="e.g. 8.4 CGPA or 82%"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Class XII Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Class XIIth Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Education Board</label>
                        <input
                          type="text"
                          value={classXII.board}
                          onChange={(e) => setClassXII({ ...classXII, board: e.target.value })}
                          placeholder="e.g. CBSE / ICSE / State Board"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Medium of Study</label>
                        <input
                          type="text"
                          value={classXII.medium}
                          onChange={(e) => setClassXII({ ...classXII, medium: e.target.value })}
                          placeholder="e.g. English"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Score / Percentage</label>
                        <input
                          type="text"
                          value={classXII.score}
                          onChange={(e) => setClassXII({ ...classXII, score: e.target.value })}
                          placeholder="e.g. 77%"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Passing Year</label>
                        <input
                          type="text"
                          value={classXII.passingYear}
                          onChange={(e) => setClassXII({ ...classXII, passingYear: e.target.value })}
                          placeholder="e.g. 2022"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">School Name</label>
                        <input
                          type="text"
                          value={classXII.school}
                          onChange={(e) => setClassXII({ ...classXII, school: e.target.value })}
                          placeholder="e.g. Delhi Public School"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Class X Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Class Xth Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Education Board</label>
                        <input
                          type="text"
                          value={classX.board}
                          onChange={(e) => setClassX({ ...classX, board: e.target.value })}
                          placeholder="e.g. CBSE"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Medium of Study</label>
                        <input
                          type="text"
                          value={classX.medium}
                          onChange={(e) => setClassX({ ...classX, medium: e.target.value })}
                          placeholder="e.g. English"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Score / Percentage</label>
                        <input
                          type="text"
                          value={classX.score}
                          onChange={(e) => setClassX({ ...classX, score: e.target.value })}
                          placeholder="e.g. 82.17%"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Passing Year</label>
                        <input
                          type="text"
                          value={classX.passingYear}
                          onChange={(e) => setClassX({ ...classX, passingYear: e.target.value })}
                          placeholder="e.g. 2020"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">School Name</label>
                        <input
                          type="text"
                          value={classX.school}
                          onChange={(e) => setClassX({ ...classX, school: e.target.value })}
                          placeholder="e.g. St. Xavier High School"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingEducation(false)}
                      className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-1">
                  {/* Graduation Display */}
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-sm font-bold text-slate-900">
                      {graduation.degree} from {graduation.institution || 'University / Institution'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {graduation.endYear ? `Graduating in ${graduation.endYear}` : ''}
                      {graduation.courseType ? `, ${graduation.courseType}` : ''}
                      {graduation.score ? ` • ${graduation.score}` : ''}
                    </p>
                  </div>

                  {/* Class XII Display */}
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-sm font-bold text-slate-900">Class XII</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {classXII.board ? `${classXII.board}, ` : ''}
                      {classXII.medium}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {classXII.score ? `Scored ${classXII.score}` : ''}
                      {classXII.passingYear ? `, Passed out in ${classXII.passingYear}` : ''}
                      {classXII.school ? ` • ${classXII.school}` : ''}
                    </p>
                  </div>

                  {/* Class X Display */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Class X</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {classX.board ? `${classX.board}, ` : ''}
                      {classX.medium}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {classX.score ? `Scored ${classX.score}` : ''}
                      {classX.passingYear ? `, Passed out in ${classX.passingYear}` : ''}
                      {classX.school ? ` • ${classX.school}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* 4. Key skills Section */}
            <section
              id="skills"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Key skills</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recruiters filter candidate applications by your core programming languages and frameworks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSkills(!editingSkills)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Edit skills"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* Skills Pills matching screenshot */}
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium hover:border-blue-400 hover:text-blue-600 transition-all shadow-2xs"
                  >
                    <span>{skill}</span>
                    {editingSkills && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Add Custom Skill Form */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Add a new skill (e.g. Next.js, Redis, AWS)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Add Skill
                  </button>
                </form>

                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">Suggestions:</span>
                  {suggestedSkills
                    .filter((s) => !skillsList.includes(s))
                    .slice(0, 8)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleQuickAddSkill(s)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-medium text-[11px] transition-all"
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>
            </section>

            {/* 5. Languages Section */}
            <section
              id="languages"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Languages</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Languages you speak and write comfortably in professional teams
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLanguages(!editingLanguages)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {languagesList.map((lang, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{lang.name}</h4>
                      <p className="text-[11px] text-slate-500">{lang.proficiency || 'Fluent'}</p>
                    </div>
                    {editingLanguages && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(index)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Language Form */}
              <form onSubmit={handleAddLanguage} className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Language name (e.g. French, German)"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <select
                  value={newLangProficiency}
                  onChange={(e) => setNewLangProficiency(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                >
                  <option value="Fluent">Fluent</option>
                  <option value="Proficient">Proficient</option>
                  <option value="Native">Native</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                >
                  Add Language
                </button>
              </form>
            </section>

            {/* 6. Internships Section */}
            <section
              id="internships"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Internships</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Industry experience, company name, duration, projects made, and skills learned
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddInternship}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Internship
                </button>
              </div>

              {internshipsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No internships added yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click "Add Internship" to show company experience and projects
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {internshipsList.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveInternship(index)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1"
                        title="Remove internship"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                          <input
                            type="text"
                            value={item.companyName}
                            onChange={(e) => handleUpdateInternship(index, 'companyName', e.target.value)}
                            placeholder="e.g. Acme Tech Solutions"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={item.duration}
                            onChange={(e) => handleUpdateInternship(index, 'duration', e.target.value)}
                            placeholder="e.g. June 2024 - Aug 2024 (3 months)"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Projects Made in Company
                        </label>
                        <textarea
                          rows={2}
                          value={item.projects}
                          onChange={(e) => handleUpdateInternship(index, 'projects', e.target.value)}
                          placeholder="Describe the projects and systems you built during this internship"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Skills Learned (comma separated)
                        </label>
                        <input
                          type="text"
                          value={
                            Array.isArray(item.skillsLearned)
                              ? item.skillsLearned.join(', ')
                              : item.skillsLearned || ''
                          }
                          onChange={(e) =>
                            handleUpdateInternship(
                              index,
                              'skillsLearned',
                              e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          placeholder="e.g. React, Node.js, Express, AWS S3"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 7. Projects Section */}
            <section
              id="projects"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personal Projects</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showcase web applications, ML pipelines, and software tools you have designed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Project
                </button>
              </div>

              {projectsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No personal projects added yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click "Add Project" to showcase your personal portfolio
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {projectsList.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(index)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1"
                        title="Remove project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateProject(index, 'title', e.target.value)}
                            placeholder="e.g. HireFlow Recruitment Platform"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={item.duration}
                            onChange={(e) => handleUpdateProject(index, 'duration', e.target.value)}
                            placeholder="e.g. Aug 2024 - Oct 2024"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Describe About Project</label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleUpdateProject(index, 'description', e.target.value)}
                          placeholder="Provide an overview of the project architecture, features, and user impact"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Skills Used (comma separated)
                          </label>
                          <input
                            type="text"
                            value={
                              Array.isArray(item.skillsUsed)
                                ? item.skillsUsed.join(', ')
                                : item.skillsUsed || ''
                            }
                            onChange={(e) =>
                              handleUpdateProject(
                                index,
                                'skillsUsed',
                                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                              )
                            }
                            placeholder="e.g. React, Redux, Express, MongoDB"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Project Link (GitHub / Live Demo)
                          </label>
                          <input
                            type="url"
                            value={item.link}
                            onChange={(e) => handleUpdateProject(index, 'link', e.target.value)}
                            placeholder="https://github.com/..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 8. Achievements Section */}
            <section
              id="achievements"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Accomplishments & Achievements</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hackathons won, awards, coding competition rankings, and academic milestones
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Achievement
                </button>
              </div>

              {achievementsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No achievements recorded yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click "Add Achievement" to list your milestones and certifications
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {achievementsList.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(index)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1"
                        title="Remove achievement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Achievement / Award Title
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateAchievement(index, 'title', e.target.value)}
                            placeholder="e.g. Smart India Hackathon Finalist"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Year / Date</label>
                          <input
                            type="text"
                            value={item.date}
                            onChange={(e) => handleUpdateAchievement(index, 'date', e.target.value)}
                            placeholder="e.g. 2024"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Description / Details</label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleUpdateAchievement(index, 'description', e.target.value)}
                          placeholder="Explain your accomplishment, ranking, or competitive result"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 9. Profile Summary & Contact Section */}
            <section
              id="summary"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Profile Summary & Online Presence</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your contact information and links to GitHub, LinkedIn, and portfolio
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Current City / Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Chandigarh, India"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Profile Summary / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly introduce your technical expertise, career goals, and passions..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://myportfolio.dev"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile</label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Save Action Bar */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Ready to save your profile?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  All changes will be updated across MongoDB and visible to recruiters on job applications
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
