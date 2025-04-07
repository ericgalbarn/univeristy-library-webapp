-- Create enums first
CREATE TYPE status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE role AS ENUM ('USER', 'ADMIN');
CREATE TYPE borrow_status AS ENUM ('BORROWED', 'RETURNED');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  university_id INTEGER NOT NULL UNIQUE,
  password TEXT NOT NULL,
  university_card TEXT NOT NULL,
  status status DEFAULT 'PENDING',
  role role DEFAULT 'USER',
  last_activity_date DATE DEFAULT CURRENT_DATE,
  create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre TEXT NOT NULL,
  rating INTEGER NOT NULL,
  cover_url TEXT NOT NULL,
  cover_color VARCHAR(7) NOT NULL,
  description TEXT NOT NULL,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 0,
  video_url TEXT NOT NULL,
  summary VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create borrow_records table
CREATE TABLE borrow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  book_id UUID NOT NULL REFERENCES books(id),
  borrow_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status borrow_status DEFAULT 'BORROWED' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create otp table
CREATE TABLE otp (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp TEXT NOT NULL,
  type TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 