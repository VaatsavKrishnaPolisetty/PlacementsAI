import React, { useState, useRef } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';
import { useModalEntrance } from '../../animations/useGsapAnimations';
import api from '../../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, canClose = true }) {
  const { showToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useModalEntrance(modalRef, backdropRef);

  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering',
    year: 4,
    phone: '',
    degree: 'B.Tech',
    cgpa: 8.5,
    backlogs: 0,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickLogin = async (userType) => {
    setLoading(true);
    try {
      if (userType === 'admin') {
        const res = await api.auth.login('tpo@placement.edu', 'admin123', 'admin');
        const userWithCustomName = {
          ...res.user,
          name: formData.fullName.trim() || res.user.name || 'Dr. Sharma (TPO)',
        };
        showToast(`Logged in as ${userWithCustomName.name}`, 'success');
        onAuthSuccess(userWithCustomName);
        onClose();
      } else {
        const res = await api.auth.login('STU101', 'password123', 'student');
        const userWithCustomName = {
          ...res.user,
          name: formData.fullName.trim() || res.user.name || 'Student Candidate',
        };
        showToast(`Logged in as ${userWithCustomName.name}`, 'success');
        onAuthSuccess(userWithCustomName);
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUser;
      if (isRegister) {
        const res = await api.auth.register(formData);
        finalUser = {
          ...res.user,
          name: formData.fullName.trim() || res.user.name,
          studentId: formData.studentId || res.user.studentId || 'STU101',
          department: formData.department || 'Computer Science & Engineering',
        };
        showToast(`Account created! Welcome, ${finalUser.name}`, 'success');
      } else {
        const res = await api.auth.login(formData.email || formData.studentId, formData.password);
        finalUser = {
          ...res.user,
          name: formData.fullName.trim() || res.user.name || formData.email.split('@')[0],
          studentId: formData.studentId || res.user.studentId || 'STU101',
          department: formData.department || res.user.department || 'Computer Science & Engineering',
        };
        showToast(`Welcome back, ${finalUser.name}!`, 'success');
      }
      onAuthSuccess(finalUser);
      onClose();
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div ref={modalRef} className="my-auto relative w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-indigo-950/50 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-2 shadow-md">
              <Icon name="users" className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black tracking-tight">
              {isRegister ? 'Create Student Account' : 'Student & Staff Login'}
            </h3>
            <p className="text-xs text-indigo-200">AI Campus Placement & Interview Coordination Portal</p>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Demo Logins Bar */}
        <div className="bg-indigo-50/70 p-3.5 border-b border-indigo-100 flex items-center justify-between text-xs">
          <span className="font-bold text-indigo-950">🚀 Fast Demo Sign-In:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors shadow-xs"
            >
              Admin / TPO
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. Alex Smith / Rohan Sharma"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-semibold text-slate-900"
            />
          </div>

          {isRegister && (
            <>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student ID / Roll No</label>
                  <input
                    type="text"
                    name="studentId"
                    placeholder="e.g. 21BCE1042"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Eng</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Comm</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value={4}>4th Year (Final)</option>
                    <option value={3}>3rd Year</option>
                    <option value={2}>2nd Year</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRegister ? 'College Email' : 'College Email or Student ID'}
            </label>
            <input
              type="text"
              name="email"
              placeholder="e.g. rahul.verma@college.edu or STU101"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-xs py-2.5 font-bold shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <span className="animate-spin">⏳</span> : <Icon name="check-circle" className="w-4 h-4" />}
            {isRegister ? 'Create Account & Continue' : 'Sign In'}
          </button>
        </form>

        {/* Footer switch */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-600">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-bold text-indigo-600 hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New student?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-bold text-indigo-600 hover:underline"
              >
                Register Here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
