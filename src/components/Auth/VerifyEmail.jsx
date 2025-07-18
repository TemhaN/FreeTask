import React, { useState } from 'react';
import { resendVerificationCode } from '../../api/api';

const VerifyEmail = ({ email, setError, verifyEmailLink }) => {
	const [code, setCode] = useState('');
	const [resendMessage, setResendMessage] = useState('');
	const [resendError, setResendError] = useState('');

	const handleSubmit = async e => {
		e.preventDefault();
		try {
			await verifyEmailLink(email, code);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка верификации');
		}
	};

	const handleResendCode = async () => {
		try {
			const res = await resendVerificationCode({
				email,
				type: 'EmailVerification',
			});
			setResendMessage(res.data.message || 'Новый код отправлен на почту');
			setResendError('');
		} catch (err) {
			setResendError(err.response?.data?.message || 'Ошибка при отправке кода');
			setResendMessage('');
		}
	};

	return (
		<div className='space-y-4'>
			<h3 className='text-xl font-bold'>Подтверждение email</h3>
			<p className='text-gray-600'>
				Код отправлен на <span className='font-semibold'>{email}</span>
			</p>
			{resendMessage && <p className='text-green-500'>{resendMessage}</p>}
			{resendError && <p className='text-red-500'>{resendError}</p>}
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label className='block text-sm font-medium'>Код подтверждения</label>
					<input
						type='text'
						value={code}
						onChange={e => setCode(e.target.value)}
						className='mt-1 block w-full border rounded px-3 py-2'
						required
					/>
				</div>
				<button
					type='submit'
					className='bg-blue-500 text-white px-4 py-2 rounded'
				>
					Подтвердить
				</button>
			</form>
			<button
				onClick={handleResendCode}
				className='text-blue-500 hover:underline'
			>
				Отправить код повторно
			</button>
		</div>
	);
};

export default VerifyEmail;
