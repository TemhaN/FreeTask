import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { motion, AnimatePresence } from 'framer-motion';
import {
	updateProfile,
	updateClientProfile,
	resendVerificationCode,
	requestPasswordReset,
	resetPassword,
} from '../api/api';
import { useNavigate } from 'react-router-dom';

const SettingsPage = ({ userId, token, handleLogout }) => {
	const handleLogoutClick = () => {
		localStorage.removeItem('token');
		navigate('/');
	};
	const {
		profile,
		setBio,
		setCompanyName,
		setSkills,
		setAvatar,
		isLoading,
		error,
		setError,
	} = useProfile({ userId, token });
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('general');
	const [name, setName] = useState(profile?.name || '');
	const [bio, setBioState] = useState(profile?.bio || '');
	const [companyName, setCompanyNameState] = useState(
		profile?.companyName || ''
	);
	const [skills, setSkillsState] = useState(profile?.skills || []);
	const [avatar, setAvatarState] = useState(null);
	const [currentSkill, setCurrentSkill] = useState('');
	const [theme, setTheme] = useState(
		sessionStorage.getItem('theme') || 'light'
	);
	const [emailCode, setEmailCode] = useState('');
	const [passwordCode, setPasswordCode] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (profile) {
			setName(profile.name || '');
			setBioState(profile.bio || '');
			setCompanyNameState(profile.companyName || '');
			setSkillsState(profile.skills || []);
		}
	}, [profile]);

	const handleSkillInput = e => {
		const value = e.target.value;
		setCurrentSkill(value);
		if (e.key === ' ' && value.trim()) {
			if (skills.length >= 10) {
				setError('Максимум 10 навыков');
				return;
			}
			const newSkill = value.trim();
			if (!skills.includes(newSkill)) {
				setSkillsState([...skills, newSkill]);
				setCurrentSkill('');
			}
		}
	};

	const removeSkill = skill => {
		setSkillsState(skills.filter(s => s !== skill));
	};

	const handleProfileSave = async e => {
		e.preventDefault();
		setIsSaving(true);
		setError('');
		setSuccessMessage('');

		const formData = new FormData();
		if (name) formData.append('name', name);
		if (bio) formData.append('bio', bio);
		if (avatar) formData.append('avatar', avatar);
		if (profile?.role === 'Freelancer' && skills.length) {
			skills.forEach(skill => formData.append('skills', skill));
		}
		if (profile?.role === 'Client' && companyName) {
			formData.append('companyName', companyName);
		}

		try {
			if (profile?.role === 'Freelancer') {
				await updateProfile(userId, formData, token);
				setBio(bio);
				setSkills(skills);
				setAvatar(avatar);
			} else if (profile?.role === 'Client') {
				await updateClientProfile(userId, formData, token);
				setBio(bio);
				setCompanyName(companyName);
				setAvatar(avatar);
			}
			setSuccessMessage('Профиль успешно обновлён');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при сохранении профиля');
		} finally {
			setIsSaving(false);
		}
	};

	const handleResendVerification = async () => {
		setError('');
		setSuccessMessage('');
		try {
			await resendVerificationCode({
				email: profile?.email,
				type: 'EmailVerification',
			});
			setSuccessMessage('Код верификации отправлен на вашу почту');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при отправке кода');
		}
	};

	const handlePasswordResetRequest = async () => {
		setError('');
		setSuccessMessage('');
		try {
			await requestPasswordReset({ email: profile?.email });
			setSuccessMessage('Код для сброса пароля отправлен на вашу почту');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при отправке кода');
		}
	};

	const handlePasswordChange = async e => {
		e.preventDefault();
		setError('');
		setSuccessMessage('');
		setIsSaving(true);

		try {
			await resetPassword({
				email: profile?.email,
				code: passwordCode,
				newPassword,
			});
			setSuccessMessage('Пароль успешно изменён');
			setPasswordCode('');
			setNewPassword('');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при смене пароля');
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading || !profile) {
		return (
			<div className='bg-gray-900 min-h-screen flex items-center justify-center'>
				<div className='animate-spin h-8 w-8 text-cyan-500'>
					<svg viewBox='0 0 24 24' fill='none' stroke='currentColor'>
						<circle
							cx='12'
							cy='12'
							r='10'
							stroke='currentColor'
							strokeWidth='4'
							className='opacity-25'
						></circle>
						<path
							d='M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z'
							fill='currentColor'
							className='opacity-75'
						></path>
					</svg>
				</div>
			</div>
		);
	}

	const tabs = [
		{ id: 'general', label: 'Общие' },
		{ id: 'security', label: 'Безопасность' },
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className='bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8'
		>
			<div className='max-w-5xl mx-auto'>
				<h2 className='text-4xl font-bold text-white mb-8 text-center'>
					Настройки
				</h2>
				{error && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='text-red-400 mb-6 text-center bg-red-900/50 border border-red-600 p-4 rounded-xl'
					>
						{error}
					</motion.p>
				)}
				{successMessage && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='text-green-400 mb-6 text-center bg-green-900/50 border border-green-600 p-4 rounded-xl'
					>
						{successMessage}
					</motion.p>
				)}
				<div className='bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg p-6 sm:p-8'>
					{/* Вкладки */}
					<div className='flex border-b border-gray-600 mb-6 overflow-x-auto'>
						{tabs.map(tab => (
							<motion.button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`px-6 py-3 text-sm font-semibold transition-all duration-300 ${
									activeTab === tab.id
										? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg'
										: 'text-gray-400 hover:text-white'
								}`}
							>
								{tab.label}
							</motion.button>
						))}
					</div>
					<AnimatePresence mode='wait'>
						<motion.div
							key={activeTab}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
						>
							{/* Общие настройки */}
							{activeTab === 'general' && (
								<div className='space-y-6'>
									<h3 className='text-2xl font-semibold text-white mb-4'>
										Общие настройки
									</h3>
									<form onSubmit={handleProfileSave} className='space-y-6'>
										<div>
											<label className='block text-sm font-medium text-gray-300 mb-2'>
												Имя
											</label>
											<input
												type='text'
												value={name}
												onChange={e => setName(e.target.value)}
												className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
												placeholder='Введите ваше имя'
											/>
										</div>
										<div>
											<label className='block text-sm font-medium text-gray-300 mb-2'>
												Биография
											</label>
											<textarea
												value={bio}
												onChange={e => setBioState(e.target.value)}
												className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
												rows='4'
												placeholder='Расскажите о себе'
												maxLength={500}
											/>
										</div>
										{profile?.role === 'Client' && (
											<div>
												<label className='block text-sm font-medium text-gray-300 mb-2'>
													Название компании
												</label>
												<input
													type='text'
													value={companyName}
													onChange={e => setCompanyNameState(e.target.value)}
													className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
													placeholder='Введите название компании'
													maxLength={100}
												/>
											</div>
										)}
										{profile?.role === 'Freelancer' && (
											<div>
												<label className='block text-sm font-medium text-gray-300 mb-2'>
													Навыки (введите и нажмите пробел)
												</label>
												<div className='flex flex-wrap gap-2 mb-4'>
													{skills.map((skill, index) => (
														<div
															key={index}
															className='relative inline-flex items-center px-4 py-1 rounded-full bg-blue-600 text-white text-sm group'
														>
															{skill}
															<button
																type='button'
																onClick={() => removeSkill(skill)}
																className='ml-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all'
															>
																×
															</button>
														</div>
													))}
												</div>
												<input
													type='text'
													value={currentSkill}
													onChange={handleSkillInput}
													onKeyDown={handleSkillInput}
													className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
													placeholder='Введите навык и нажмите пробел'
												/>
											</div>
										)}
										<div>
											<label className='block text-sm font-medium text-gray-300 mb-2'>
												Аватар
											</label>
											<input
												type='file'
												onChange={e =>
													setAvatarState(e.target.files[0] || null)
												}
												className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 file:bg-cyan-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 hover:file:bg-cyan-600 transition-all'
												accept='image/*'
											/>
										</div>
										<motion.button
											type='submit'
											disabled={isSaving}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className={`bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
												isSaving
													? 'opacity-50 cursor-not-allowed'
													: 'hover:shadow-lg'
											}`}
										>
											{isSaving ? 'Сохранение...' : 'Сохранить профиль'}
										</motion.button>
									</form>
								</div>
							)}

							{/* Безопасность */}
							{activeTab === 'security' && (
								<div className='space-y-6'>
									<h3 className='text-lg font-semibold text-white mb-4'>
										Смена пароля
									</h3>
									<div className='space-y-4'>
										<motion.button
											onClick={handlePasswordResetRequest}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className='bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300'
										>
											Запросить код для сброса пароля
										</motion.button>
										<form onSubmit={handlePasswordChange} className='space-y-4'>
											<div>
												<label className='block text-sm font-medium text-gray-300 mb-2'>
													Код из письма
												</label>
												<input
													type='text'
													value={passwordCode}
													onChange={e => setPasswordCode(e.target.value)}
													className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
													placeholder='Введите код'
												/>
											</div>
											<div>
												<label className='block text-sm font-medium text-gray-300 mb-2'>
													Новый пароль
												</label>
												<input
													type='password'
													value={newPassword}
													onChange={e => setNewPassword(e.target.value)}
													className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
													placeholder='Введите новый пароль'
												/>
											</div>
											<motion.button
												type='submit'
												disabled={isSaving}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className={`bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
													isSaving
														? 'opacity-50 cursor-not-allowed'
														: 'hover:shadow-lg'
												}`}
											>
												{isSaving ? 'Сохранение...' : 'Изменить пароль'}
											</motion.button>
										</form>
									</div>
									<h3 className='text-lg font-semibold text-white mt-6 mb-4'>
										Верификация email
									</h3>
									{profile.isEmailVerified ? (
										<p className='text-green-400 text-sm'>
											Ваш email уже подтверждён
										</p>
									) : (
										<div className='space-y-4'>
											<motion.button
												onClick={handleResendVerification}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className='bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300'
											>
												Отправить код верификации
											</motion.button>
											<div>
												<label className='block text-sm font-medium text-gray-300 mb-2'>
													Код из письма
												</label>
												<input
													type='text'
													value={emailCode}
													onChange={e => setEmailCode(e.target.value)}
													className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
													placeholder='Введите код'
												/>
											</div>
										</div>
									)}
									<h3 className='text-lg font-semibold text-white mt-6 mb-4'>
										Выход из аккаунта
									</h3>
									<motion.button
										onClick={handleLogoutClick}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className='bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-all duration-300'
									>
										Выйти
									</motion.button>
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</motion.div>
	);
};

export default SettingsPage;
