'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  FileText,
  GraduationCap,
  Briefcase,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Pencil,
  Check,
} from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button, Input, Label, Skeleton, Textarea } from '@/components/ui/Primitives';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { ApiClientError, profileApi } from '@/services/api';
import { formatDate, formatFileSize } from '@/lib/utils';
import type { EducationItem, ExperienceItem, ResumeMetadata } from '@/types';

function ProfileContent() {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [editingSkillIdx, setEditingSkillIdx] = useState<number | null>(null);
  const [editingSkillVal, setEditingSkillVal] = useState('');

  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [resume, setResume] = useState<ResumeMetadata | null>(null);
  const [completion, setCompletion] = useState(10);

  useEffect(() => {
    let active = true;
    profileApi
      .getMe()
      .then((res) => {
        if (!active) return;
        setName(res.user.name);
        setEmail(res.user.email);
        setPhone(res.profile.phone || '');
        setLocation(res.profile.location || '');
        setHeadline(res.profile.headline || '');
        setBio(res.profile.bio || '');
        setSkills(res.profile.skills || []);
        setEducation(res.profile.education || []);
        setExperience(res.profile.experience || []);
        setResume(res.profile.resume || null);
        setCompletion(res.profile.profileCompletion || 10);
      })
      .catch(() => {
        toast({
          title: 'Failed to load profile',
          description: 'Please refresh the page.',
          variant: 'error',
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [toast]);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkill('');
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setNewSkill('');
  };

  const handleSaveSkillEdit = (idx: number) => {
    const trimmed = editingSkillVal.trim();
    if (!trimmed) return;
    setSkills((prev) => prev.map((s, i) => (i === idx ? trimmed : s)));
    setEditingSkillIdx(null);
    setEditingSkillVal('');
  };

  const handleAddEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: 2020,
        endYear: 2024,
      },
    ]);
  };

  const handleAddExperience = () => {
    setExperience((prev) => [
      ...prev,
      {
        jobTitle: '',
        company: '',
        description: '',
        startDate: '2023-01',
        endDate: '',
        currentlyWorking: false,
      },
    ]);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (name.trim().length < 2) {
      toast({
        title: 'Invalid full name',
        description: 'Full name must be at least 2 characters.',
        variant: 'error',
      });
      return;
    }

    for (const edu of education) {
      if (!edu.institution.trim() || !edu.degree.trim() || !edu.fieldOfStudy.trim()) {
        toast({
          title: 'Incomplete education entry',
          description: 'Please complete institution, degree, and field of study or remove blank entries.',
          variant: 'error',
        });
        return;
      }
    }

    for (const exp of experience) {
      if (!exp.jobTitle.trim() || !exp.company.trim() || !exp.startDate.trim()) {
        toast({
          title: 'Incomplete experience entry',
          description: 'Please complete job title, company, and start date or remove blank entries.',
          variant: 'error',
        });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await profileApi.updateMe({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        skills,
        education,
        experience,
      });
      setCompletion(res.profile.profileCompletion);
      await refreshUser();
      toast({
        title: 'Profile saved',
        description: `Profile completion is now ${res.profile.profileCompletion}%.`,
        variant: 'success',
      });
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Unable to save profile.';
      toast({ title: 'Save failed', description: msg, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.doc', '.docx'];
    const lowerName = file.name.toLowerCase();
    if (!validExtensions.some((ext) => lowerName.endsWith(ext))) {
      toast({
        title: 'Unsupported file format',
        description: 'Only PDF, DOC, and DOCX files are accepted.',
        variant: 'error',
      });
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Resume size must not exceed 5 MB.',
        variant: 'error',
      });
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const res = await profileApi.uploadResume(file);
      setResume(res.resume);
      setCompletion(res.profileCompletion);
      toast({
        title: 'Resume uploaded',
        description: `${res.resume.filename} is stored in MongoDB GridFS.`,
        variant: 'success',
      });
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Resume upload failed.';
      toast({ title: 'Upload failed', description: msg, variant: 'error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-44" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* Header + Completion */}
      <div className="border-b border-[#383838] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#C6F36B] font-display font-semibold">
            Candidate Profile
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F5F5F0] mt-1">
            Profile &amp; Resume Vault
          </h1>
        </div>
        <div className="border border-[#383838] bg-[#1B1B1B] px-4 py-3 min-w-[220px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="uppercase tracking-wider text-[#969696]">Completion</span>
            <span className="font-display font-bold text-[#C6F36B]">{completion}%</span>
          </div>
          <div className="h-2 w-full bg-[#101010] border border-[#383838]">
            <div
              className="h-full bg-[#C6F36B] transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Resume Vault Card */}
      <section className="border border-[#383838] bg-[#1B1B1B] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-[#C6F36B] mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold text-[#F5F5F0]">Resume Document</h2>
              <p className="text-xs text-[#969696] mt-0.5">
                Accepted formats: PDF, DOC, DOCX · Max 5 MB · Stored in MongoDB GridFS
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleResumeChange}
              className="hidden"
              id="resume-upload-input"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              {uploading ? 'Uploading...' : resume ? 'Replace Resume' : 'Upload Resume'}
            </Button>

            {resume && (
              <Button asChild variant="outline" size="sm">
                <a href={profileApi.getResumeDownloadUrl()} target="_blank" rel="noreferrer">
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>

        {resume ? (
          <div className="border border-[#383838] bg-[#151515] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-[#F5F5F0]">{resume.filename}</span>
            <span className="text-[#969696]">
              {formatFileSize(resume.size)} · Uploaded {formatDate(resume.uploadedAt)}
            </span>
          </div>
        ) : (
          <div className="border border-dashed border-[#383838] bg-[#151515] px-4 py-3 text-xs text-[#969696]">
            No resume uploaded yet. Upload your CV to attach it automatically when applying.
          </div>
        )}
      </section>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Personal Info */}
        <section className="border border-[#383838] bg-[#1B1B1B] p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-[#F5F5F0] border-b border-[#383838] pb-3">
            Personal Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prof-name">Full Name</Label>
              <Input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="prof-email">Account Email</Label>
              <Input id="prof-email" type="email" value={email} disabled />
            </div>

            <div>
              <Label htmlFor="prof-phone">Phone Number</Label>
              <Input
                id="prof-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="prof-location">Current Location</Label>
              <Input
                id="prof-location"
                type="text"
                placeholder="e.g. Bengaluru, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="prof-headline">Professional Headline</Label>
            <Input
              id="prof-headline"
              type="text"
              placeholder="e.g. Full-Stack TypeScript Engineer · Next.js & Node.js"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="prof-bio">Summary / Bio</Label>
            <Textarea
              id="prof-bio"
              rows={4}
              placeholder="Briefly summarize your engineering, product, or domain background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </section>

        {/* Skills */}
        <section className="border border-[#383838] bg-[#1B1B1B] p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#F5F5F0] border-b border-[#383838] pb-3">
            Skills
          </h2>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a skill (e.g. TypeScript, MongoDB, Figma)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              aria-label="New skill"
            />
            <Button type="button" variant="secondary" onClick={handleAddSkill}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>

          {skills.length === 0 ? (
            <p className="text-xs text-[#969696]">No skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) =>
                editingSkillIdx === idx ? (
                  <div
                    key={`${skill}-${idx}`}
                    className="inline-flex items-center gap-1 border border-[#C6F36B] bg-[#151515] px-2 py-1"
                  >
                    <input
                      type="text"
                      value={editingSkillVal}
                      onChange={(e) => setEditingSkillVal(e.target.value)}
                      className="bg-transparent text-xs text-[#F5F5F0] w-28 focus:outline-none"
                      aria-label="Edit skill"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSkillEdit(idx)}
                      aria-label="Save skill edit"
                      className="text-[#C6F36B] p-0.5"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <span
                    key={`${skill}-${idx}`}
                    className="inline-flex items-center gap-2 border border-[#383838] bg-[#151515] px-3 py-1.5 text-xs text-[#F5F5F0]"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkillIdx(idx);
                        setEditingSkillVal(skill);
                      }}
                      aria-label={`Edit ${skill}`}
                      className="text-[#969696] hover:text-[#C6F36B]"
                    >
                      <Pencil className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkills((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label={`Remove ${skill}`}
                      className="text-[#969696] hover:text-[#FF895D]"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                )
              )}
            </div>
          )}
        </section>

        {/* Experience */}
        <section className="border border-[#383838] bg-[#1B1B1B] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#383838] pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#FF895D]" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-[#F5F5F0]">Work Experience</h2>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddExperience}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Experience
            </Button>
          </div>

          {experience.length === 0 ? (
            <p className="text-xs text-[#969696]">No work experience added yet.</p>
          ) : (
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="border border-[#383838] bg-[#151515] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#969696]">
                      Role #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExperience((prev) => prev.filter((_, i) => i !== idx))}
                      className="inline-flex items-center gap-1 text-xs text-[#FF895D] hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Job Title</Label>
                      <Input
                        value={exp.jobTitle}
                        onChange={(e) =>
                          setExperience((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, jobTitle: e.target.value } : item
                            )
                          )
                        }
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) =>
                          setExperience((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, company: e.target.value } : item
                            )
                          )
                        }
                        placeholder="e.g. Acme Labs"
                      />
                    </div>
                    <div>
                      <Label>Start Date (YYYY-MM)</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) =>
                          setExperience((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, startDate: e.target.value } : item
                            )
                          )
                        }
                        placeholder="2022-06"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        value={exp.currentlyWorking ? 'Present' : exp.endDate || ''}
                        disabled={exp.currentlyWorking}
                        onChange={(e) =>
                          setExperience((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, endDate: e.target.value } : item
                            )
                          )
                        }
                        placeholder="2024-08"
                      />
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-[#F5F5F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.currentlyWorking}
                      onChange={(e) =>
                        setExperience((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, currentlyWorking: e.target.checked } : item
                          )
                        )
                      }
                      className="accent-[#C6F36B]"
                    />
                    Currently working in this role
                  </label>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) =>
                        setExperience((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, description: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Key outcomes, systems built, or responsibilities..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Education */}
        <section className="border border-[#383838] bg-[#1B1B1B] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#383838] pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#A78BFA]" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-[#F5F5F0]">Education</h2>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddEducation}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Education
            </Button>
          </div>

          {education.length === 0 ? (
            <p className="text-xs text-[#969696]">No education entries added yet.</p>
          ) : (
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="border border-[#383838] bg-[#151515] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#969696]">
                      Credential #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEducation((prev) => prev.filter((_, i) => i !== idx))}
                      className="inline-flex items-center gap-1 text-xs text-[#FF895D] hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, institution: e.target.value } : item
                            )
                          )
                        }
                        placeholder="e.g. Delhi Technological University"
                      />
                    </div>
                    <div>
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, degree: e.target.value } : item
                            )
                          )
                        }
                        placeholder="e.g. B.Tech"
                      />
                    </div>
                    <div>
                      <Label>Field of Study</Label>
                      <Input
                        value={edu.fieldOfStudy}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, fieldOfStudy: e.target.value } : item
                            )
                          )
                        }
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Start Year</Label>
                        <Input
                          type="number"
                          value={edu.startYear}
                          onChange={(e) =>
                            setEducation((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, startYear: Number(e.target.value) } : item
                              )
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>End Year</Label>
                        <Input
                          type="number"
                          value={edu.endYear ?? ''}
                          onChange={(e) =>
                            setEducation((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      endYear: e.target.value ? Number(e.target.value) : null,
                                    }
                                  : item
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

