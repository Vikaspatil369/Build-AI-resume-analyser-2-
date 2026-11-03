import React from 'react';
import { Briefcase, GraduationCap, Code, FolderGit, FileText, User } from 'lucide-react';
import type { ParsedResume } from '../types';

interface ResumeSectionCardProps {
  resumeData: ParsedResume;
  className?: string;
}

const ResumeSectionCard: React.FC<ResumeSectionCardProps> = ({
  resumeData,
  className = '',
}) => {
  const { personalInfo, professionalSummary, skills, experience, education, projects } = resumeData;

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Contact & Personal Info */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <User className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-500 block text-xs uppercase font-bold">Full Name</span>
            <span className="text-slate-200 font-medium">{personalInfo?.name || 'Not detected'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs uppercase font-bold">Email Address</span>
            <span className="text-slate-200 font-medium">{personalInfo?.email || 'Not detected'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs uppercase font-bold">Phone Number</span>
            <span className="text-slate-200 font-medium">{personalInfo?.phone || 'Not detected'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs uppercase font-bold">LinkedIn URL</span>
            <span className="text-slate-400 truncate block hover:text-brand-400">
              {personalInfo?.linkedin ? <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer">{personalInfo.linkedin}</a> : 'Not detected'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs uppercase font-bold">GitHub Portfolio</span>
            <span className="text-slate-400 truncate block hover:text-brand-400">
              {personalInfo?.github ? <a href={`https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer">{personalInfo.github}</a> : 'Not detected'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs uppercase font-bold">Personal Portfolio</span>
            <span className="text-slate-400 truncate block hover:text-brand-400">
              {personalInfo?.portfolio ? <a href={`https://${personalInfo.portfolio}`} target="_blank" rel="noopener noreferrer">{personalInfo.portfolio}</a> : 'Not detected'}
            </span>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {professionalSummary && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <FileText className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Professional Summary</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{professionalSummary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Code className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Extracted Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Professional Experience */}
      {experience && experience.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Briefcase className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Work Experience</h3>
          </div>
          <div className="flex flex-col gap-6">
            {experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-slate-800 pl-4 py-1 relative">
                <div className="absolute w-3 h-3 bg-brand-500 rounded-full left-[-7px] top-[7px]" />
                <div className="flex flex-wrap justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{exp.role}</h4>
                    <span className="text-slate-400 text-xs font-semibold">{exp.company}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-bold bg-slate-950 px-2 py-0.5 border border-slate-800 rounded">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul className="list-disc pl-4 text-xs text-slate-300 flex flex-col gap-1 mt-2 leading-relaxed">
                    {exp.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="mt-2 text-xs">
                    <span className="font-bold text-emerald-400 block mb-0.5">Achievements:</span>
                    <ul className="list-disc pl-4 text-slate-300 flex flex-col gap-1 leading-relaxed">
                      {exp.achievements.map((ach, i) => (
                        <li key={i} className="text-emerald-300/90">{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <FolderGit className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Projects</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, index) => (
              <div key={index} className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/20 hover:border-slate-700/50 transition-all">
                <h4 className="font-bold text-slate-100 text-sm">{proj.name}</h4>
                <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {proj.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800/50 rounded text-[10px] text-slate-400">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {proj.achievements && proj.achievements.length > 0 && (
                  <ul className="list-disc pl-4 mt-2 text-[11px] text-emerald-300/80 leading-relaxed">
                    {proj.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <GraduationCap className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Education</h3>
          </div>
          <div className="flex flex-col gap-4">
            {education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{edu.degree} in {edu.fieldOfStudy}</h4>
                  <span className="text-slate-400 text-xs">{edu.institution}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-bold block">{edu.startYear} - {edu.endYear}</span>
                  {edu.gpa && <span className="text-xs text-brand-400 font-semibold">GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeSectionCard;
