import{ useState } from 'react'
import { signUp } from '@/lib/auth-client'
export function SignUpForm() {
  // 1. Keep track of what the user is typing in the input fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  
  // Keep track of loading and error states to show in the UI
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 2. This function runs when the user clicks the "Sign Up" button
  const handleSubmit = async (e: React.ChangeEvent) => {
    e.preventDefault() // Prevents the browser from reloading the page
    setErrorMessage(null) // Reset any old errors

    await signUp.email(
      {
        email,
        password,
        name,
        // For testing, we can omit 'image' and 'callbackURL'
      },
      {
        // This runs the exact moment the button is pressed
        onRequest: () => {
          setIsLoading(true)
        },
        // This runs if Better Auth successfully creates the user in your DB
        onSuccess: () => {
          setIsLoading(false)
          alert('Sign up successful! You can now check your database or log in.')
          // If you want to force redirect using window location:
          window.location.href = '/admin' 
        },
        // This runs if something goes wrong (e.g., password too short, email already exists)
        onError: (ctx) => {
          setIsLoading(false)
          setErrorMessage(ctx.error.message || 'Something went wrong.')
        },
      }
    )
  }

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create an Account</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Email</label>
          <input
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Password</label>
          <input
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Display an error message if one exists */}
        {errorMessage && (
          <p style={{ color: 'red', fontSize: '14px', margin: '0' }}>
            {errorMessage}
          </p>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}