-- ============================================================================
-- INTERNWELL SLIET - Registration & Recruitment Database Schema
-- Compatible with Supabase (PostgreSQL 15+)
-- ============================================================================

-- 1. Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Student Profile
    full_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    department TEXT NOT NULL,
    year_semester TEXT NOT NULL,
    
    -- Application Details
    domain_interest TEXT NOT NULL,
    skills TEXT DEFAULT '',
    internship_details TEXT DEFAULT '',
    internship_duration TEXT DEFAULT '',
    profile_links TEXT DEFAULT '',
    resume_url TEXT DEFAULT '',
    applicant_note TEXT DEFAULT '',
    
    -- Status & Workflow
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
    admin_notes TEXT DEFAULT '',
    
    -- System Audit Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Prevent Duplicate Registrations
    CONSTRAINT unique_applicant_roll UNIQUE (roll_no),
    CONSTRAINT unique_applicant_email UNIQUE (email)
);

-- 2. Indexes for High-Speed Queries, Filtering, and Search
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_department ON public.registrations (department);
CREATE INDEX IF NOT EXISTS idx_registrations_domain ON public.registrations (domain_interest);
CREATE INDEX IF NOT EXISTS idx_registrations_roll_no ON public.registrations (roll_no);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations (email);

-- 3. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_registrations_updated_at ON public.registrations;
CREATE TRIGGER set_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public Anonymous & Authenticated Visitors can INSERT their application
-- Public users can only register; they CANNOT view or edit any existing data.
DROP POLICY IF EXISTS "Public users can submit registration" ON public.registrations;
CREATE POLICY "Public users can submit registration"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
    full_name IS NOT NULL AND trim(full_name) <> '' AND
    roll_no IS NOT NULL AND trim(roll_no) <> '' AND
    email IS NOT NULL AND trim(email) <> '' AND
    phone IS NOT NULL AND trim(phone) <> '' AND
    department IS NOT NULL AND trim(department) <> '' AND
    year_semester IS NOT NULL AND trim(year_semester) <> '' AND
    domain_interest IS NOT NULL AND trim(domain_interest) <> ''
);

-- Policy 2: Only Authenticated Users (Admins) can VIEW all registrations
DROP POLICY IF EXISTS "Admins can view registrations" ON public.registrations;
CREATE POLICY "Admins can view registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Only Authenticated Users (Admins) can UPDATE registrations (status / notes)
DROP POLICY IF EXISTS "Admins can update registrations" ON public.registrations;
CREATE POLICY "Admins can update registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 4: Only Authenticated Users (Admins) can DELETE registrations
DROP POLICY IF EXISTS "Admins can delete registrations" ON public.registrations;
CREATE POLICY "Admins can delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (true);

-- ============================================================================
-- 5. Optional Sample Data (Uncomment to test Admin Dashboard with mock records)
-- ============================================================================
/*
INSERT INTO public.registrations 
  (full_name, roll_no, email, phone, department, year_semester, domain_interest, skills, profile_links, applicant_note, status)
VALUES
  ('Rohan Verma', '22101045', 'rohan.22101045@sliet.ac.in', '9876543210', 'Computer Science & Engineering (CSE)', '3rd Year (Sem 5/6)', 'Full-Stack Web & Mobile', 'React, Node.js, Express, PostgreSQL', 'https://github.com/rohan-v', 'Passionate about full-stack development and open source.', 'Pending'),
  ('Simran Kaur', '23102012', 'simran.23102012@sliet.ac.in', '9812345678', 'Electronics & Communication Engineering (ECE)', '2nd Year (Sem 3/4)', 'Artificial Intelligence & ML', 'Python, PyTorch, OpenCV', 'https://linkedin.com/in/simran-k', 'Interested in building computer vision models.', 'Approved')
ON CONFLICT DO NOTHING;
*/
