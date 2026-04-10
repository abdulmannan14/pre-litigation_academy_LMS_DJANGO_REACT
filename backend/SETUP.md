# Backend Setup Guide

## 1. PostgreSQL Setup

Install PostgreSQL and create the database:

```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql

# Inside psql:
CREATE DATABASE prelitigation_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE prelitigation_db TO postgres;
\q
```

## 2. Environment

```bash
cp .env.example .env
# Edit .env with your DB credentials
```

## 3. Virtual Environment

```bash
cd /path/to/learning-managment-system
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 4. Migrate & Create Superuser

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

## 5. Run the Server

```bash
python manage.py runserver
```

Server runs at: http://localhost:8000

Django Admin: http://localhost:8000/admin/

---

## API Endpoints Reference

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login — returns access + refresh tokens |
| POST | /api/auth/logout/ | Logout (blacklists refresh token) |
| POST | /api/auth/token/refresh/ | Refresh access token |
| GET | /api/auth/me/ | Get current user profile |

### Courses
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/courses/ | List all published courses |
| GET | /api/courses/<id>/ | Course detail with modules & lessons |
| POST | /api/courses/create/ | Admin: create course |
| PUT/PATCH | /api/courses/<id>/update/ | Admin: update course |
| DELETE | /api/courses/<id>/delete/ | Admin: delete course |

### Modules
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/modules/<course_id>/ | List modules for a course |
| POST | /api/modules/create/ | Admin: create module |

### Lessons
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/lessons/<module_id>/ | List lessons for a module |
| GET | /api/lesson/<id>/ | Lesson detail |
| POST | /api/lessons/create/ | Admin: create lesson |

### Quizzes
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/quiz/<lesson_id>/ | Get quiz for a lesson |
| POST | /api/quiz/submit/ | Submit quiz answers |
| GET | /api/quiz/attempts/ | My quiz attempt history |

### Progress
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/progress/ | All my enrollments |
| POST | /api/progress/enroll/ | Enroll in a course |
| GET | /api/progress/<course_id>/ | Course progress % |
| POST | /api/progress/complete/ | Mark lesson complete |
| POST | /api/progress/position/ | Save video position |

---

## Auth Header

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

## Quiz Submit Payload

```json
{
  "quiz_id": 1,
  "answers": {
    "1": "A",
    "2": "C",
    "3": "B"
  }
}
```
