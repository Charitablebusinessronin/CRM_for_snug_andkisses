
// app/components/LoginSection.tsx
import { useAuth } from './AuthWrapper';

export default function LoginSection() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Show different content based on auth status
  if (user) {
    return (
      <div className="user-dashboard">
        <h2>Welcome back, {user.firstName}!</h2>
        <div className="user-actions">
          <button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </button>
          <button onClick={() => window.location.href = '/profile'}>
            Edit Profile
          </button>
        </div>
      </div>
    );
  }

  // Only show registration for unauthenticated users
  return (
    <div className="welcome-section">
      <h2>New to Snug & Kisses?</h2>
      <p>Join our family of expectant and new parents. Get access to professional doula services, postpartum care, lactation support, and personalized care coordination.</p>
      <div className="auth-buttons">
        <a href="/register" className="btn btn-primary">
          Register as New Client
        </a>
        <a href="/login" className="btn btn-secondary">
          Existing User Sign In
        </a>
      </div>
    </div>
  );
}
