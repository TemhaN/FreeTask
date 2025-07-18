import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = ({ onSubmit, inputClassName, labelClassName }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState('');

	const handleSubmit = e => {
		e.preventDefault();
		setLocalError('');

		// Клиентская валидация
		if (!email) {
			setLocalError('Пожалуйста, введите email');
			return;
		}
		if (!password || password.length < 8) {
			setLocalError('Пароль должен содержать минимум 8 символов');
			return;
		}

		onSubmit({ email, password });
	};

	return (
		<motion.form
			onSubmit={handleSubmit}
			className='space-y-4'
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<div>
				<label htmlFor='email' className={`block text-sm ${labelClassName}`}>
					Email
				</label>
				<input
					id='email'
					type='email'
					value={email}
					onChange={e => setEmail(e.target.value)}
					className={`mt-1 block ${inputClassName}`}
					required
				/>
			</div>
			<div>
				<label htmlFor='password' className={`block text-sm ${labelClassName}`}>
					Пароль
				</label>
				<input
					id='password'
					type='password'
					value={password}
					onChange={e => setPassword(e.target.value)}
					className={`mt-1 block ${inputClassName}`}
					required
				/>
			</div>
			<AnimatePresence>
				{localError && (
					<motion.p
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className='text-red-400 text-center'
					>
						{localError}
					</motion.p>
				)}
			</AnimatePresence>
			<button
				type='submit'
				className='bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg w-full font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-cyan-500'
			>
				Войти
			</button>
		</motion.form>
	);
};

export default Login;
