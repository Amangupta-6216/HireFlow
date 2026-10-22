import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { X, Star, ThumbsUp, ThumbsDown, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export const InterviewerFeedbackModal = ({ application, isOpen, onClose, onFeedbackSubmitted }) => {
  const { user, company } = useSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      rating: 5,
      recommendation: 'strong_yes',
      comments: '',
    },
  });

  useEffect(() => {
    if (isOpen && application) {
      fetchApplicationFeedback();
    }
  }, [isOpen, application]);

  const fetchApplicationFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const res = await axiosClient.get(`/feedback/application/${application._id}`);
      setExistingFeedback(res.data.feedbacks || []);

      // If current user already submitted, pre-fill form
      const myFeedback = res.data.feedbacks?.find(
        (f) => f.interviewer?._id === user?.id || f.interviewer === user?.id
      );
      if (myFeedback) {
        setValue('rating', myFeedback.rating);
        setValue('recommendation', myFeedback.recommendation);
        setValue('comments', myFeedback.comments);
        setSelectedRating(myFeedback.rating);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  if (!isOpen || !application) return null;

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setErrorMessage(null);
      await axiosClient.post('/feedback', {
        applicationId: application._id,
        rating: Number(data.rating),
        recommendation: data.recommendation,
        comments: data.comments,
      });

      reset();
      onFeedbackSubmitted?.();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit interview feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const isOwnerOrHr = company?.role === 'owner' || company?.role === 'hr';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Candidate Evaluation & Feedback</h3>
            <p className="text-xs text-slate-500">
              Candidate: <span className="font-semibold text-slate-800">{application.candidate?.name}</span> • Role: {application.job?.title}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* View Existing Evaluations (HR / Owner view all; Interviewer views only their own) */}
          {isOwnerOrHr && existingFeedback.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submitted Feedback by Team ({existingFeedback.length})
              </h4>
              <div className="space-y-2.5">
                {existingFeedback.map((fb) => (
                  <div key={fb._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{fb.interviewer?.name || 'Interviewer'}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{fb.rating} / 5</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="capitalize font-semibold text-blue-600">
                        Recommendation: {fb.recommendation.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{new Date(fb.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 italic pt-1 border-t border-slate-200/40">
                      "{fb.comments}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Submit Your Evaluation
            </h4>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Overall Technical & Behavioral Score (1 - 5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => {
                      setSelectedRating(star);
                      setValue('rating', star);
                    }}
                    className={`p-2 rounded-xl border transition-all ${
                      selectedRating >= star
                        ? 'bg-amber-50 border-amber-300 text-amber-500'
                        : 'border-slate-200 text-slate-300 hover:text-slate-400'
                    }`}
                  >
                    <Star className={`w-6 h-6 ${selectedRating >= star ? 'fill-amber-400' : ''}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 ml-2">
                  {selectedRating} out of 5 stars
                </span>
              </div>
              <input type="hidden" {...register('rating', { required: true })} />
            </div>

            {/* Recommendation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hiring Recommendation
              </label>
              <select
                {...register('recommendation', { required: true })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="strong_yes">Strong Yes (Exceptional candidate)</option>
                <option value="yes">Yes (Meets technical bar)</option>
                <option value="neutral">Neutral / Needs further evaluation</option>
                <option value="no">No (Did not meet bar)</option>
                <option value="strong_no">Strong No</option>
              </select>
            </div>

            {/* Detailed Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Evaluation & Interview Notes
              </label>
              <textarea
                rows={4}
                placeholder="Assess problem solving, coding proficiency, system architecture, communication, and culture alignment..."
                {...register('comments', { required: 'Please provide detailed interview comments' })}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              ></textarea>
              {errors.comments && <p className="text-rose-600 text-xs mt-1">{errors.comments.message}</p>}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                {submitting ? 'Submitting...' : 'Save Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewerFeedbackModal;
