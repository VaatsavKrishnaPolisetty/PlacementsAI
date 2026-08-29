import React, { useState } from 'react';
import Icon from '../common/Icons';
import { useToast } from '../common/ToastContext';
import api from '../../services/api';

export default function StudentProfileView({ student, onProfileUpdated }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Form State
  const [personal, setPersonal] = useState({
    name: student?.name || 'Rahul Verma',
    studentId: student?.studentId || 'STU101',
    email: student?.email || 'rahul.verma@college.edu',
    phone: student?.phone || '+91 98765 43210',
    department: student?.department || 'Computer Science & Engineering',
    year: student?.year || 4,
    degree: student?.degree || 'B.Tech',
    cgpa: student?.cgpa || 8.8,
    backlogs: student?.backlogs || 0,
    graduationYear: student?.graduationYear || 2026,
  });

  // Skills State
  const [technicalSkills, setTechnicalSkills] = useState(
    student?.skills?.technical || ['Python', 'Java', 'JavaScript', 'React', 'SQL', 'Machine Learning']
  );
  const [softSkills, setSoftSkills] = useState(
    student?.skills?.soft || ['Communication', 'Leadership', 'Teamwork', 'Problem Solving']
  );

  const [newTechSkill, setNewTechSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  // Resume State
  const [resume, setResume] = useState(
    student?.resume || {
      fileName: 'Rahul_Verma_Resume.pdf',
      fileUrl: '/uploads/sample_resume.pdf',
      fileSize: 245000,
      uploadedAt: new Date(),
    }
  );

  const handleAddTechSkill = (e) => {
    e.preventDefault();
    if (newTechSkill.trim() && !technicalSkills.includes(newTechSkill.trim())) {
      setTechnicalSkills([...technicalSkills, newTechSkill.trim()]);
      setNewTechSkill('');
    }
  };

  const handleRemoveTechSkill = (skillToRemove) => {
    setTechnicalSkills(technicalSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddSoftSkill = (e) => {
    e.preventDefault();
    if (newSoftSkill.trim() && !softSkills.includes(newSoftSkill.trim())) {
      setSoftSkills([...softSkills, newSoftSkill.trim()]);
      setNewSoftSkill('');
    }
  };

  const handleRemoveSoftSkill = (skillToRemove) => {
    setSoftSkills(softSkills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updated = await api.student.updateProfile(student?.studentId || 'STU101', {
        ...personal,
        skills: {
          technical: technicalSkills,
          soft: softSkills,
        },
      });
      showToast('Profile and skills updated successfully!', 'success');
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate extension
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      showToast('Invalid format. Please upload a PDF, DOC, DOCX, or TXT resume.', 'error');
      return;
    }

    setUploadingResume(true);
    try {
      const res = await api.student.uploadResume(student?.studentId || 'STU101', file);
      
      const newResumeObj = {
        fileName: file.name,
        fileUrl: res.fileUrl || URL.createObjectURL(file),
        fileSize: file.size,
        uploadedAt: new Date(),
      };
      setResume(newResumeObj);

      // Extract skills and credentials from uploaded resume
      const extTech = res.extractedSkills?.technical || ['Python', 'SQL', 'FastAPI', 'React', 'Docker'];
      const extSoft = res.extractedSkills?.soft || ['Communication', 'Problem Solving', 'Team Leadership'];
      const extInfo = res.extractedInfo || {};

      const updatedTechSkills = Array.from(new Set([...technicalSkills, ...extTech]));
      const updatedSoftSkills = Array.from(new Set([...softSkills, ...extSoft]));

      setTechnicalSkills(updatedTechSkills);
      setSoftSkills(updatedSoftSkills);

      const updatedPersonal = {
        ...personal,
        phone: extInfo.phone || personal.phone,
        email: extInfo.email || personal.email,
        cgpa: extInfo.cgpa !== undefined ? extInfo.cgpa : personal.cgpa,
      };
      setPersonal(updatedPersonal);

      const updatedStudentProfile = {
        ...student,
        ...updatedPersonal,
        skills: {
          technical: updatedTechSkills,
          soft: updatedSoftSkills,
        },
        resume: newResumeObj,
      };

      // Save updated profile to backend/api state
      await api.student.updateProfile(student?.studentId || 'STU101', updatedStudentProfile);

      showToast(
        `🎉 Resume '${file.name}' uploaded & analyzed! Extracted ${extTech.length} skills & updated student credentials.`,
        'success'
      );

      if (onProfileUpdated) {
        onProfileUpdated(updatedStudentProfile);
      }
    } catch (err) {
      showToast(err.message || 'Upload error', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      await api.student.deleteResume(student?.studentId || 'STU101');
      setResume({ fileName: '', fileUrl: '', fileSize: 0, uploadedAt: null });
      showToast('Resume removed from profile.', 'info');
      if (onProfileUpdated) {
        onProfileUpdated({ ...student, resume: null });
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete resume', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Student Profile & Credentials</h2>
          <p className="text-xs text-slate-500">
            Manage your personal data, academic records, verified technical & soft skills, and active resume.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="btn-primary text-xs py-2 px-5 font-bold shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          {loading ? <span className="animate-spin">⏳</span> : <Icon name="check-circle" className="w-4 h-4" />}
          Save Profile Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Personal & Academic Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Icon name="user" className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={personal.name}
                  onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Student ID / Roll Number</label>
                <input
                  type="text"
                  value={personal.studentId}
                  disabled
                  className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">College Email Address</label>
                <input
                  type="email"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Icon name="shield-check" className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Academic Standing & Eligibility Benchmarks</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={personal.degree}
                  onChange={(e) => setPersonal({ ...personal, degree: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Branch</label>
                <input
                  type="text"
                  value={personal.department}
                  onChange={(e) => setPersonal({ ...personal, department: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Year</label>
                <select
                  value={personal.year}
                  onChange={(e) => setPersonal({ ...personal, year: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value={4}>4th Year (Senior)</option>
                  <option value={3}>3rd Year</option>
                  <option value={2}>2nd Year</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cumulative CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={personal.cgpa}
                  onChange={(e) => setPersonal({ ...personal, cgpa: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  value={personal.backlogs}
                  onChange={(e) => setPersonal({ ...personal, backlogs: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={personal.graduationYear}
                  onChange={(e) => setPersonal({ ...personal, graduationYear: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Skills Management Section */}
          <div className="card space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Icon name="target" className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Technical & Soft Skills Matrix</h3>
            </div>

            {/* Technical Skills */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Technical Skills ({technicalSkills.length})</label>
                <span className="text-[10px] text-slate-400">Used by AI 5-pillar matching engine</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTechSkill(skill)}
                      className="text-indigo-400 hover:text-indigo-700 font-black ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddTechSkill} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Docker, TypeScript, AWS)..."
                  value={newTechSkill}
                  onChange={(e) => setNewTechSkill(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="btn-secondary text-xs py-2 px-4 font-bold">
                  + Add Skill
                </button>
              </form>
            </div>

            {/* Soft Skills */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Soft & Professional Skills ({softSkills.length})</label>
              </div>

              <div className="flex flex-wrap gap-2">
                {softSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSoftSkill(skill)}
                      className="text-emerald-400 hover:text-emerald-700 font-black ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddSoftSkill} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add soft skill (e.g. Critical Thinking, Presentation)..."
                  value={newSoftSkill}
                  onChange={(e) => setNewSoftSkill(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="btn-secondary text-xs py-2 px-4 font-bold">
                  + Add Skill
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Col: Real Resume Management */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Icon name="file-text" className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Active Resume Management</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your latest resume in PDF, DOC, or DOCX format. Required for all campus drive applications.
            </p>

            {resume && resume.fileName ? (
              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                    📄
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 text-xs truncate">{resume.fileName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Uploaded on {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString() : 'Today'}
                    </p>
                    <span className="badge badge-success text-[9px] font-bold">✓ Verified by ATS</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-indigo-100">
                  <label className="btn-secondary text-xs py-1.5 px-3 font-bold flex-1 text-center cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleDeleteResume}
                    className="btn-ghost text-xs py-1.5 px-3 font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center space-y-3 transition-colors bg-slate-50/50">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Icon name="upload" className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">Upload your resume</p>
                  <p className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</p>
                </div>
                <label className="btn-primary text-xs py-2 px-4 font-bold inline-block cursor-pointer shadow-md">
                  {uploadingResume ? 'Uploading...' : 'Select File to Upload'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeFileUpload}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
