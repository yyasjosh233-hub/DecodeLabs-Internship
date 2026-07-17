"""
Sample Data Script
Add sample student data to Firebase for testing.
Run this script to populate the database with test data.
"""

import firebase_admin
from firebase_admin import credentials, db
from pathlib import Path


def add_sample_data():
    """
    Add sample student data to Firebase Realtime Database.
    """
    print("=" * 60)
    print("📚 Adding Sample Student Data")
    print("=" * 60)
    
    # Check if service account key exists
    if not Path('serviceAccountKey.json').exists():
        print("❌ Error: serviceAccountKey.json not found!")
        print("Please download it from Firebase Console first.")
        return False
    
    try:
        # Initialize Firebase
        try:
            firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate('serviceAccountKey.json')
            firebase_admin.initialize_app(cred, {
                'databaseURL': 'https://joee-bbf6f.firebaseio.com'
            })
        
        # Sample student data
        sample_students = {
            "STU001": {
                "name": "Alice Johnson",
                "email": "alice.johnson@school.com",
                "phone": "555-0101",
                "grade": "10-A",
                "enrollment_date": "2023-09-01"
            },
            "STU002": {
                "name": "Bob Smith",
                "email": "bob.smith@school.com",
                "phone": "555-0102",
                "grade": "10-B",
                "enrollment_date": "2023-09-02"
            },
            "STU003": {
                "name": "Charlie Brown",
                "email": "charlie.brown@school.com",
                "phone": "555-0103",
                "grade": "10-A",
                "enrollment_date": "2023-09-03"
            },
            "STU004": {
                "name": "Diana Prince",
                "email": "diana.prince@school.com",
                "phone": "555-0104",
                "grade": "11-A",
                "enrollment_date": "2023-09-04"
            },
            "STU005": {
                "name": "Evan Davis",
                "email": "evan.davis@school.com",
                "phone": "555-0105",
                "grade": "11-B",
                "enrollment_date": "2023-09-05"
            },
            "STU006": {
                "name": "Fiona Green",
                "email": "fiona.green@school.com",
                "phone": "555-0106",
                "grade": "12-A",
                "enrollment_date": "2023-09-06"
            },
            "STU007": {
                "name": "George Harris",
                "email": "george.harris@school.com",
                "phone": "555-0107",
                "grade": "10-C",
                "enrollment_date": "2024-01-15"
            },
            "STU008": {
                "name": "Hannah Lee",
                "email": "hannah.lee@school.com",
                "phone": "555-0108",
                "grade": "11-C",
                "enrollment_date": "2024-01-16"
            },
            "STU009": {
                "name": "Isaac Newton",
                "email": "isaac.newton@school.com",
                "phone": "555-0109",
                "grade": "12-B",
                "enrollment_date": "2024-01-17"
            },
            "STU010": {
                "name": "Julia Roberts",
                "email": "julia.roberts@school.com",
                "phone": "555-0110",
                "grade": "10-A",
                "enrollment_date": "2024-01-18"
            }
        }
        
        # Add students to database
        students_ref = db.reference('students')
        
        print("\n📝 Adding students to database...")
        for student_id, student_data in sample_students.items():
            students_ref.child(student_id).set(student_data)
            print(f"   ✅ Added: {student_data['name']} ({student_id})")
        
        print("\n" + "=" * 60)
        print(f"✅ Successfully added {len(sample_students)} sample students!")
        print("=" * 60)
        print("\n💡 You can now search or view these students in the app.")
        print("   Try searching for: 'Alice', '10-A', or 'johnson'")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding sample data: {str(e)}")
        return False


def clear_database():
    """
    Clear all students from the database.
    Use with caution!
    """
    print("\n" + "=" * 60)
    response = input("⚠️  This will DELETE ALL students from the database. Continue? (yes/no): ")
    
    if response.lower() != 'yes':
        print("❌ Operation cancelled.")
        return False
    
    try:
        # Initialize Firebase
        try:
            firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate('serviceAccountKey.json')
            firebase_admin.initialize_app(cred, {
                'databaseURL': 'https://joee-bbf6f.firebaseio.com'
            })
        
        students_ref = db.reference('students')
        students_ref.delete()
        
        print("✅ Database cleared successfully!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"❌ Error clearing database: {str(e)}")
        return False


def display_menu():
    """
    Display the menu and get user choice.
    """
    print("\n" + "=" * 60)
    print("📊 Sample Data Manager")
    print("=" * 60)
    print("\n1. Add sample students")
    print("2. Clear all students")
    print("3. Exit")
    print("\n" + "=" * 60)
    
    choice = input("Select option (1-3): ").strip()
    return choice


if __name__ == "__main__":
    while True:
        choice = display_menu()
        
        if choice == "1":
            add_sample_data()
        elif choice == "2":
            clear_database()
        elif choice == "3":
            print("\n👋 Goodbye!")
            break
        else:
            print("❌ Invalid option. Please try again.")
