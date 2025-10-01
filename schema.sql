-- City Experts D1 Database Schema
-- Run this with: npx wrangler d1 execute city-experts-db --local --file=schema.sql

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,                 -- slug (e.g., 'marina-tower')
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  category TEXT NOT NULL CHECK (category IN ('commercial', 'residential', 'hospitality', 'retail', 'mixed-use', 'office', 'public', 'interiors')),
  city TEXT,                           -- e.g., 'Dubai', 'Abu Dhabi'
  client TEXT,                         -- client name
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)), -- boolean: 0=false, 1=true
  order_index INTEGER NOT NULL DEFAULT 0, -- for custom ordering
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Internationalization table for project content
CREATE TABLE IF NOT EXISTS project_i18n (
  project_id TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'ar')),
  title TEXT NOT NULL,
  excerpt TEXT,                        -- short description for cards
  description TEXT,                    -- full description (supports Markdown)
  PRIMARY KEY (project_id, lang),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Media assets table for project images/videos
CREATE TABLE IF NOT EXISTS project_media (
  project_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('heroWide', 'hero', 'thumb', 'gallery', 'video')),
  url TEXT NOT NULL,                   -- Cloudinary URL
  public_id TEXT,                      -- Cloudinary public_id for management
  alt_en TEXT,                         -- Alt text in English
  alt_ar TEXT,                         -- Alt text in Arabic
  width INTEGER,                       -- Image width in pixels
  height INTEGER,                      -- Image height in pixels
  idx INTEGER NOT NULL DEFAULT 0,     -- Ordering for gallery items
  extra JSON,                          -- Additional metadata
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (project_id, kind, idx),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status_featured ON projects(status, featured, order_index);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category, status);
CREATE INDEX IF NOT EXISTS idx_projects_city ON projects(city);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_media_kind ON project_media(project_id, kind);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_projects_timestamp 
AFTER UPDATE ON projects
BEGIN
  UPDATE projects SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Sample data for testing (optional)
INSERT OR IGNORE INTO projects (id, status, category, city, featured, order_index) VALUES
('sample-commercial', 'published', 'commercial', 'Dubai', 1, 1),
('sample-residential', 'published', 'residential', 'Abu Dhabi', 1, 2),
('sample-interior', 'published', 'interiors', 'Dubai', 0, 3);

INSERT OR IGNORE INTO project_i18n (project_id, lang, title, excerpt, description) VALUES
('sample-commercial', 'en', 'Marina Commerce Tower', 'Modern 45-story commercial complex in Dubai Marina', 'A landmark commercial development featuring state-of-the-art office spaces, retail outlets, and premium amenities in the heart of Dubai Marina.'),
('sample-commercial', 'ar', 'برج مارينا التجاري', 'مجمع تجاري حديث من 45 طابقاً في دبي مارينا', 'مشروع تجاري بارز يضم مساحات مكتبية متطورة ومحلات تجارية ومرافق متميزة في قلب دبي مارينا.'),
('sample-residential', 'en', 'Waterfront Residences', 'Luxury waterfront living with panoramic views', 'Exclusive residential towers offering unparalleled luxury and stunning waterfront views in Abu Dhabi.'),
('sample-residential', 'ar', 'مساكن الواجهة المائية', 'معيشة فاخرة على الواجهة المائية مع إطلالات بانورامية', 'أبراج سكنية حصرية تقدم رفاهية لا مثيل لها وإطلالات خلابة على الواجهة المائية في أبوظبي.'),
('sample-interior', 'en', 'Executive Office Fit-out', 'Premium corporate interior design and fit-out', 'Complete interior transformation of executive office spaces with modern design elements and premium finishes.'),
('sample-interior', 'ar', 'تجهيز المكاتب التنفيذية', 'تصميم وتجهيز داخلي متميز للشركات', 'تحويل شامل للمساحات المكتبية التنفيذية مع عناصر تصميم حديثة ولمسات نهائية متميزة.');

INSERT OR IGNORE INTO project_media (project_id, kind, url, public_id, alt_en, alt_ar, width, height) VALUES
('sample-commercial', 'heroWide', 'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1920,h_1080/sample/commercial-hero-wide', 'sample/commercial-hero-wide', 'Marina Commerce Tower exterior view', 'منظر خارجي لبرج مارينا التجاري', 1920, 1080),
('sample-commercial', 'hero', 'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1200,h_800/sample/commercial-hero', 'sample/commercial-hero', 'Marina Commerce Tower', 'برج مارينا التجاري', 1200, 800),
('sample-commercial', 'thumb', 'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_800,h_600/sample/commercial-thumb', 'sample/commercial-thumb', 'Marina Commerce Tower thumbnail', 'صورة مصغرة لبرج مارينا التجاري', 800, 600),
('sample-residential', 'heroWide', 'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1920,h_1080/sample/residential-hero-wide', 'sample/residential-hero-wide', 'Waterfront Residences aerial view', 'منظر جوي لمساكن الواجهة المائية', 1920, 1080),
('sample-residential', 'hero', 'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_1200,h_800/sample/residential-hero', 'sample/residential-hero', 'Waterfront Residences', 'مساكن الواجهة المائية', 1200, 800),
('sample-residential', 'thumb', 'https://res.cloudinary.com/dmawj7tmu/image/upload/c_fill,w_800,h_600/sample/residential-thumb', 'sample/residential-thumb', 'Waterfront Residences thumbnail', 'صورة مصغرة لمساكن الواجهة المائية', 800, 600);