import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
// You'll need to download the service account key from Firebase Console
// For now, this is a placeholder

try {
  if (!admin.apps.length) {
    // In production, you should use environment variables or a service account file
    console.log('⚠️ Firebase Admin SDK not initialized - service account not configured')
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization error:', error)
}

export default admin
