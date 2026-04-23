import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginPage } from './LoginPage'
import * as useAuthModule from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

describe('LoginPage', () => {
  const mockLogin = vi.fn()
  const mockRegister = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      isLoading: false,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      switchRole: vi.fn(),
    })
  })

  it('renders login form by default', () => {
    render(<LoginPage />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('validates required fields on login', async () => {
    render(<LoginPage />)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter email and password/i)).toBeInTheDocument()
    })
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('submits login form with valid data', async () => {
    mockLogin.mockResolvedValue({ error: null })
    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('switches to register tab', () => {
    render(<LoginPage />)
    
    fireEvent.click(screen.getByRole('tab', { name: /create account/i }))
    
    expect(screen.getByText('Create Your Account')).toBeInTheDocument()
  })

  it('validates password match on registration', async () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByRole('tab', { name: /create account/i }))
    
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getAllByLabelText(/password/i)[0], { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } })
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })
})
