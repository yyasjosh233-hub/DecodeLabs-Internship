"""
Firebase Setup Helper Script
This script helps you verify your Firebase configuration and test the connection.
"""

import firebase_admin
from firebase_admin import credentials, db
import json
from pathlib import Path


def test_firebase_connection():
    """
    Test the Firebase connection and display basic information.
    """
    print("=" * 60)
    print("🔧 Firebase Connection Test")
    print("=" * 60)
    
    # Check if service account key exists
    service_account_path = Path('serviceAccountKey.json')
    
    if not service_account_path.exists():
        print("❌ Error: serviceAccountKey.json not found!")
        print("\nTo fix this:")
        print("1. Go to Firebase Console (https://console.firebase.google.com/)")
        print("2. Select your project")
        print("3. Go to Project Settings → Service Accounts")
        print("4. Click 'Generate New Private Key'")
        print("5. Save the downloaded file as 'serviceAccountKey.json'")
        return False
    
    print("✅ Service account key found!")
    
    try:
        # Load and display service account info
        with open(service_account_path, 'r') as f:
            service_account = json.load(f)
        
        print(f"\n📋 Service Account Information:")
        print(f"   Project ID: {service_account.get('project_id')}")
        print(f"   Client Email: {service_account.get('client_email')}")
        
        # Initialize Firebase
        try:
            firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate('serviceAccountKey.json')
            firebase_admin.initialize_app(cred, {
                'databaseURL': f"https://{service_account.get('project_id')}.firebaseio.com"
            })
        
        print("\n✅ Firebase initialized successfully!")
        
        # Test database connection
        try:
            ref = db.reference('students')
            data = ref.get()
            print(f"✅ Database connection successful!")
            print(f"   Current students in database: {len(data.val()) if data.val() else 0}")
        except Exception as e:
            print(f"⚠️  Database connection issue: {str(e)}")
            print("   This might be due to Firebase security rules or network issues.")
            return False
        
        print("\n" + "=" * 60)
        print("✅ All tests passed! Your Firebase setup is ready.")
        print("=" * 60)
        return True
        
    except json.JSONDecodeError:
        print("❌ Error: serviceAccountKey.json is not valid JSON!")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def display_setup_instructions():
    """
    Display setup instructions for Firebase.
    """
    print("\n" + "=" * 60)
    print("📚 Firebase Setup Instructions")
    print("=" * 60)
    
    instructions = """
1. CREATE A FIREBASE PROJECT
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Enter project name: "RGM-Students"
   - Accept terms and click "Create project"

2. ENABLE REALTIME DATABASE
   - In the Firebase Console, click "Realtime Database"
   - Click "Create Database"
   - Select location closest to you
   - Start in "Test mode" for development

3. CREATE SERVICE ACCOUNT KEY
   - Go to Project Settings (⚙️ icon)
   - Select "Service Accounts" tab
   - Click "Generate New Private Key"
   - Save the JSON file as "serviceAccountKey.json"
   - Place it in the project root directory

4. GET YOUR DATABASE URL
   - In the Realtime Database section, you'll see the URL
   - It looks like: https://PROJECT-ID.firebaseio.com
   - Update this in app.py if needed

5. CONFIGURE SECURITY RULES
   - Go to Realtime Database → Rules
   - For development, use:
   
   {
     "rules": {
       "students": {
         ".read": true,
         ".write": true
       }
     }
   }
   
   - Click "Publish"

6. RUN THE APPLICATION
   - In terminal, run: python app.py
   - Open browser to: http://localhost:7860
    """
    
    print(instructions)


if __name__ == "__main__":
    # Test the connection
    success = test_firebase_connection()
    
    if not success:
        print("\n" + "=" * 60)
        display_setup_instructions()
        print("=" * 60)
