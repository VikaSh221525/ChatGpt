import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'

const Login = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = (data) => {
        // Here you would typically send data to your backend for authentication
        // For now, we'll just log the data
        axios.post("http://localhost:3000/api/auth/login", {
            email : data.email,
            password: data.password
        }, { withCredentials: true }).then((res) => {
            navigate('/AnolaAi');
        }).catch((err) => {
            console.log(err);
        })
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className='w-full min-h-screen bg-gradient-to-br from-black via-black to-purple-900 flex items-center justify-center px-6 py-12'>
            {/* Background gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent'></div>

            <div className='w-full max-w-md relative z-10'>
                {/* Header */}
                <div className='text-center mb-8'>
                    <h1 className='text-4xl md:text-5xl font-black text-white mb-4 tracking-tight'
                        style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 900 }}>
                        Welcome to <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600'>Anola</span>
                    </h1>
                    <p className='text-gray-300 text-lg'
                        style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 400 }}>
                        Sign in to continue your journey
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Email */}
                    <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10'>
                            <FaEnvelope className='text-gray-400 text-lg' />
                        </div>
                        <input
                            type='email'
                            placeholder='Email Address'
                            className='w-full pl-12 pr-4 py-4 bg-white/10 border border-purple-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300'
                            style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 400 }}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                        />
                        {errors.email && (
                            <p className='text-red-400 text-sm mt-1 ml-1'>{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10'>
                            <FaLock className='text-gray-400 text-lg' />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Password'
                            className='w-full pl-12 pr-12 py-4 bg-white/10 border border-purple-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300'
                            style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 400 }}
                            {...register('password', {
                                required: 'Password is required',
                            })}
                        />
                        <button
                            type='button'
                            onClick={togglePasswordVisibility}
                            className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200 z-10'
                        >
                            {showPassword ? <FaEyeSlash className='text-lg' /> : <FaEye className='text-lg' />}
                        </button>
                        {errors.password && (
                            <p className='text-red-400 text-sm mt-1 ml-1'>{errors.password.message}</p>
                        )}
                    </div>

                    {/* Forgot Password Link */}
                    <div className='text-right'>
                        <button
                            type='button'
                            className='text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200'
                            style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 500 }}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {/* Login Button */}
                    <button
                        type='submit'
                        className='w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-purple-500/25'
                        style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 600 }}
                    >
                        Sign In
                    </button>
                </form>

                {/* Register Link */}
                <div className='text-center mt-8'>
                    <p className='text-gray-400' style={{ fontFamily: 'Agrandir, sans-serif', fontWeight: 400 }}>
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/Register')}
                            className='text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200'
                        >
                            Create Account
                        </button>
                    </p>
                </div>

                {/* Decorative elements */}
                <div className='absolute -top-10 -left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl'></div>
                <div className='absolute -bottom-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-xl'></div>
            </div>
        </div>
    )
}

export default Login