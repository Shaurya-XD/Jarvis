import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../config/axios'
import { useUserContext } from '../context/user.context'

const Login = () => {
  const navigate = useNavigate()

  const {setUser} = useUserContext();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const response = await axiosInstance.post(
        '/users/login',
        {
          email,
          password
        },
        {
          withCredentials: true
        }
      )

      console.log(response.data)
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)

      // Reset form
      setEmail('')
      setPassword('')

      // Redirect after successful login
      navigate('/')

    } catch (err) {
      setError(
        err.response?.data?.error || 'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-white text-center">
          Welcome Back
        </h1>

        <p className="text-zinc-400 text-center mt-2">
          Sign in to continue
        </p>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="block text-zinc-300 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition py-3 rounded-xl font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-500 hover:text-indigo-400"
          >
            Create One
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login