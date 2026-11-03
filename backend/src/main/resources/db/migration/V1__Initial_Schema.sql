CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE resumes (
    id VARCHAR(36) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE resume_versions (
    id VARCHAR(36) PRIMARY KEY,
    resume_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    version_number INT NOT NULL,
    parsed_json_content LONGTEXT,
    raw_text_content LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_versions_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
);

CREATE TABLE job_descriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    raw_text LONGTEXT NOT NULL,
    parsed_json_keywords LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE resume_analyses (
    id VARCHAR(36) PRIMARY KEY,
    resume_version_id VARCHAR(36) NOT NULL,
    job_description_id VARCHAR(36) NULL,
    status VARCHAR(50) NOT NULL,
    ats_score INT NULL,
    job_match_score INT NULL,
    section_scores_json LONGTEXT NULL,
    keyword_analysis_json LONGTEXT NULL,
    skill_gap_json LONGTEXT NULL,
    formatting_issues_json LONGTEXT NULL,
    grammar_analysis_json LONGTEXT NULL,
    improvements_json LONGTEXT NULL,
    role_recommendations_json LONGTEXT NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_analyses_version FOREIGN KEY (resume_version_id) REFERENCES resume_versions(id) ON DELETE CASCADE,
    CONSTRAINT fk_analyses_job FOREIGN KEY (job_description_id) REFERENCES job_descriptions(id) ON DELETE SET NULL
);

-- Indexing for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_versions_resume ON resume_versions(resume_id);
CREATE INDEX idx_jobs_user ON job_descriptions(user_id);
CREATE INDEX idx_analyses_version ON resume_analyses(resume_version_id);
CREATE INDEX idx_analyses_job ON resume_analyses(job_description_id);
