# 🎓 RGM Student Management System

A comprehensive web-based student management application built with **Gradio** and **Firebase Realtime Database**.

## Features

- ✅ **Add Students**: Create new student records with detailed information
- 🔍 **Search Students**: Search by student ID, name, or email
- 📋 **View All**: Display all students in a formatted table
- 🗑️ **Delete Students**: Remove student records from the database
- 🎨 **User-Friendly Interface**: Clean, intuitive Gradio UI
- ☁️ **Cloud Storage**: All data stored securely in Firebase

## Prerequisites

- Python 3.8 or higher
- Firebase project with Realtime Database
- Firebase service account key JSON file

## Installation

1. **Clone or download** this project to your local machine

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Firebase**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Realtime Database
   - Create a service account key:
     - Go to Project Settings → Service Accounts
     - Click "Generate New Private Key"
     - Save the JSON file as `serviceAccountKey.json` in the project root directory

4. **Update Database URL**:
   - In `app.py`, replace the `databaseURL` value with your Firebase Realtime Database URL
   - You can find this in Firebase Console → Realtime Database → Data

## Project Structure

```
RGM Students/
├── app.py                    # Main Gradio application
├── requirements.txt          # Python dependencies
├── serviceAccountKey.json    # Firebase credentials (download from Firebase Console)
├── README.md                 # This file
└── .env (optional)           # Environment variables
```

## Usage

1. **Start the application**:
   ```bash
   python app.py
   ```

2. **Access the web interface**:
   - Open your browser and go to: `http://localhost:7860`

3. **Use the tabs**:
   - **➕ Add Student**: Fill in student details and click "Add Student"
   - **🔍 Search Student**: Enter search term to find students
   - **📋 View All Students**: Display all students in the database
   - **🗑️ Delete Student**: Remove a student by ID

## Student Record Format

Each student record contains:
- **Student ID**: Unique identifier (required)
- **Name**: Full name (required)
- **Email**: Email address (required)
- **Phone**: Contact number
- **Grade/Class**: Academic grade or class
- **Enrollment Date**: Date of enrollment (format: YYYY-MM-DD)
- **Created At**: Auto-generated timestamp

## Firebase Configuration

The Firebase configuration for this project:
```javascript
{
  "apiKey": "AIzaSyDQBlIVqJlmV_xjn9CqHGjQeM8ZevOrPO8",
  "authDomain": "joee-bbf6f.firebaseapp.com",
  "projectId": "joee-bbf6f",
  "storageBucket": "joee-bbf6f.firebasestorage.app",
  "messagingSenderId": "516187986225",
  "appId": "1:516187986225:web:e7ec13b4273075969f7810",
  "measurementId": "G-85XW591HXQ",
  "databaseURL": "https://joee-bbf6f.firebaseio.com"
}
```

## Key Functions

### `add_student(student_id, name, email, phone, grade, enrollment_date)`
Adds a new student to the Firebase database.
- Validates required fields
- Checks for duplicate student IDs
- Returns success/error message

### `search_student(search_query)`
Searches for students by ID, name, or email.
- Case-insensitive search
- Returns formatted HTML table with results
- Supports partial matching

### `get_all_students()`
Retrieves and displays all students.
- Sorted by name
- Formatted as HTML table
- Shows total count

### `delete_student(student_id)`
Deletes a student record by ID.
- Confirms student exists before deletion
- Returns success/error message

## Troubleshooting

**Issue**: "No module named 'firebase_admin'"
- Solution: Run `pip install -r requirements.txt`

**Issue**: "serviceAccountKey.json not found"
- Solution: Download it from Firebase Console and place in the project root

**Issue**: Connection timeout or database errors
- Solution: Verify your Firebase database URL and that your IP is allowed (check Firebase Security Rules)

**Issue**: Port 7860 already in use
- Solution: Change `server_port=7860` in the `app.py` file to another port

## Security Notes

⚠️ **Important**: Never share your `serviceAccountKey.json` file or expose it in version control!

Add to `.gitignore`:
```
serviceAccountKey.json
.env
__pycache__/
*.pyc
```

## Firebase Rules Example

For development (use restrictive rules in production):
```json
{
  "rules": {
    "students": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Performance Tips

- Use indexing in Firebase for better search performance
- Implement pagination for large datasets
- Cache frequently accessed data

## Future Enhancements

- 📊 Analytics dashboard
- 📧 Email notifications
- 🔐 User authentication
- 📸 Student photo upload
- 📄 Export to CSV/Excel
- 🔄 Batch import
- 📱 Mobile app version

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Check Gradio documentation

## License

This project is open source and available for educational purposes.

## Author

RGM Students Management System

---

**Happy Learning! 🚀**
