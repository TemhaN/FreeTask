import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset, resetPassword, resendVerificationCode } from '../../api/api';

const ResetPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRequestReset = async e => {
        e.preventDefault();
        try {
            console.log('Requesting password reset for:', email);
            await requestPasswordReset({ email });
            setError('');
            setStep(2);
        } catch (err) {
            console.error('Password reset request error:', err);
            setError(err.response?.data?.message || 'Ошибка при запросе сброса пароля');
        }
    };

    const handleResetPassword = async e => {
        e.preventDefault();
        try {
            console.log('Resetting password for:', email, 'with code:', code);
            await resetPassword({ email, code, newPassword });
            setError('');
            navigate('/login');
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.response?.data?.message || 'Ошибка при сбросе пароля');
        }
    };

    const handleResendCode = async () => {
        try {
            console.log('Resending password reset code for:', email);
            await resendVerificationCode({ email, type: 'PasswordReset' });
            setError('Новый код отправлен на вашу почту');
        } catch (err) {
            console.error('Resend code error:', err);
            setError(err.response?.data?.message || 'Ошибка при повторной отправке кода');
        }
    };

    return (
        <div className='max-w-md mx-auto'>
            <h2 className='text-2xl font-bold mb-4'>Восстановление пароля</h2>
            {error && <p className='text-red-500 mb-4'>{error}</p>}
            {step === 1 ? (
                <form onSubmit={handleRequestReset} className='space-y-4'>
                    <div>
                        <label htmlFor='email' className='block text-sm font-medium'>
                            Email
                        </label>
                        <input
                            id='email'
                            type='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className='mt-1 block w-full border rounded px-3 py-2'
                            required
                        />
                    </div>
                    <button
                        type='submit'
                        className='bg-blue-500 text-white px-4 py-2 rounded w-full'
                    >
                        Запросить код
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className='bg-gray-500 text-white px-4 py-2 rounded w-full mt-4'
                    >
                        Назад
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className='space-y-4'>
                    <div>
                        <label htmlFor='code' className='block text-sm font-medium'>
                            Код подтверждения
                        </label>
                        <input
                            id='code'
                            type='text'
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className='mt-1 block w-full border rounded px-3 py-2'
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor='newPassword' className='block text-sm font-medium'>
                            Новый пароль
                        </label>
                        <input
                            id='newPassword'
                            type='password'
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className='mt-1 block w-full border rounded px-3 py-2'
                            required
                        />
                    </div>
                    <button
                        type='submit'
                        className='bg-blue-500 text-white px-4 py-2 rounded w-full'
                    >
                        Сбросить пароль
                    </button>
                    <button
                        onClick={handleResendCode}
                        className='text-blue-500 hover:underline mt-2 block w-full text-center'
                    >
                        Отправить код повторно
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className='bg-gray-500 text-white px-4 py-2 rounded w-full mt-4'
                    >
                        Назад
                    </button>
                </form>
            )}
        </div>
    );
};

export default ResetPassword;