export interface User {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  achievements: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  gpa?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  achievements: string[];
}

export interface ParsedResume {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: string[];
  languages: string[];
}

export interface ParsedJobDescription {
  jobTitle: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  technicalKeywords: string[];
  softSkills: string[];
  minYearsExperience: number;
  educationRequirement: string;
  toolsAndFrameworks: string[];
  certifications: string[];
}

export interface Resume {
  id: string;
  filename: string;
  fileType: string;
  latestVersionNumber: number;
  latestVersionId: string;
  versions?: ResumeVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  name: string;
  versionNumber: number;
  parsedContent: ParsedResume;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company?: string;
  rawText: string;
  parsedKeywords: ParsedJobDescription;
  createdAt: string;
}

export interface SectionScore {
  category: string;
  score: number;
  maxScore: number;
  reason: string;
}

export interface KeywordAnalysisItem {
  keyword: string;
  status: 'Found' | 'Partial' | 'Missing';
  importance: 'High' | 'Medium' | 'Low';
  resumeFrequency: number;
  jdFrequency: number;
  section: string;
}

export interface SkillGapItem {
  skill: string;
  level: 'STRONG' | 'MODERATE' | 'MISSING';
  learningPriority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FormattingIssue {
  type: 'CRITICAL' | 'WARNING' | 'GOOD';
  title: string;
  suggestion: string;
}

export interface GrammarIssue {
  original: string;
  suggested: string;
  reason: string;
}

export interface ImprovementSuggestion {
  section: string;
  suggestion: string;
}

export interface RoleRecommendation {
  role: string;
  matchPercentage: number;
  reason: string;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  resumeName: string;
  versionId: string;
  versionNumber: number;
  jobId?: string;
  jobTitle?: string;
  jobCompany?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  atsScore?: number;
  jobMatchScore?: number;
  sectionScores?: SectionScore[];
  keywordAnalysis?: KeywordAnalysisItem[];
  skillGap?: SkillGapItem[];
  formattingIssues?: FormattingIssue[];
  grammarAnalysis?: GrammarIssue[];
  improvements?: ImprovementSuggestion[];
  roleRecommendations?: RoleRecommendation[];
  errorMessage?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalResumes: number;
  averageAtsScore: number;
  bestAtsScore: number;
  averageJobMatch: number;
  recentAnalyses: ResumeAnalysis[];
}

export interface AdminStats {
  totalUsers: number;
  totalResumes: number;
  totalAnalyses: number;
  aiProvider: string;
  recentSystemAnalyses: ResumeAnalysis[];
}
