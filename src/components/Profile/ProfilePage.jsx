import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FILE_BASE_URL } from '../../api/api';
import { useProfile } from '../../hooks/useProfile';
import PortfolioSection from './PortfolioSection';
import ReviewsSection from './ReviewsSection';
import AnalyticsSection from './AnalyticsSection';
import MyTeamsSection from './MyTeamsSection';
import LoadingSpinner from '../LoadingSpinner';
import placeholderImage from '../../images/placeholder.png';
import { getProfileAnalytics, getPopularSkills } from '../../api/api';
import debounce from 'lodash/debounce';

const getLevelStyles = level => {
	switch (level) {
		case 'Эксперт':
			return {
				bg: 'bg-gradient-to-r from-green-600 to-green-400',
				tooltip: 'Высокий уровень мастерства',
			};
		case 'Специалист':
			return {
				bg: 'bg-gradient-to-r from-blue-600 to-blue-400',
				tooltip: 'Уверенные профессиональные навыки',
			};
		case 'Новичок':
		default:
			return {
				bg: 'bg-gradient-to-r from-gray-600 to-gray-400',
				tooltip: 'Начальный уровень опыта',
			};
	}
};

const ProfilePage = ({ userId, token }) => {
	const navigate = useNavigate();
	const {
		profile,
		error,
		isLoading,
		isEditing,
		bio,
		companyName,
		skills,
		avatar,
		setError,
		setIsEditing,
		setBio,
		setCompanyName,
		setSkills,
		setAvatar,
		updateProfileData,
		resetForm,
		reviews,
		reviewsError,
		reviewsLoading,
		portfolioFile,
		portfolioDescription,
		portfolioError,
		portfolioIsLoading,
		setPortfolioFile,
		setPortfolioDescription,
		setPortfolioError,
		addPortfolioItemHandler,
		deletePortfolioItemHandler,
	} = useProfile({ userId, token });

	const currentLevelName = profile?.level
		? {
				Newbie: 'Новичок',
				Specialist: 'Специалист',
				Expert: 'Эксперт',
		  }[profile.level] || 'Новичок'
		: 'Новичок';

	const [analytics, setAnalytics] = useState({
		recentOrders: [],
		statistics: {},
	});
	const [suggestedSkills, setSuggestedSkills] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [currentSkill, setCurrentSkill] = useState('');

	const fetchPopularSkills = useCallback(
		debounce(async (prefix = '') => {
			try {
				const res = await getPopularSkills(prefix);
				setSuggestedSkills(res.data.map(item => item.skill));
			} catch (err) {
				console.error('Error fetching popular skills:', err);
				setError('Ошибка загрузки популярных навыков');
			}
		}, 300),
		[setError]
	);

	useEffect(() => {
		const fetchAnalytics = async () => {
			try {
				const res = await getProfileAnalytics(userId, {}, token);
				setAnalytics({
					recentOrders: res.data.recentOrders || [],
					statistics: res.data.statistics || {},
				});
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка загрузки аналитики');
			}
		};

		if (profile?.role === 'Freelancer') {
			fetchAnalytics();
			fetchPopularSkills();
		}
	}, [profile, userId, token, setError, fetchPopularSkills]);

	const handleSkillInput = e => {
		const value = e.target.value;
		setCurrentSkill(value);
		setShowSuggestions(value.trim().length > 0);
		if (e.type === 'change') {
			fetchPopularSkills(value);
		}
		if (e.key === ' ' && value.trim()) {
			if (skills.length >= 10) {
				setError('Максимум 10 навыков');
				setShowSuggestions(false);
				return;
			}
			const newSkill = value.trim();
			if (!skills.includes(newSkill)) {
				setSkills([...skills, newSkill]);
				setCurrentSkill('');
				setShowSuggestions(false);
			}
		}
	};

	const selectSkill = skill => {
		if (skills.length >= 10) {
			setError('Максимум 10 навыков');
			setShowSuggestions(false);
			return;
		}
		if (!skills.includes(skill)) {
			setSkills([...skills, skill]);
		}
		setCurrentSkill('');
		setShowSuggestions(false);
	};

	const removeSkill = skillToRemove => {
		setSkills(skills.filter(skill => skill !== skillToRemove));
	};

	const renderBioWithLinks = bio => {
		if (!bio) return <span className='text-gray-400'>Не указана</span>;
		const words = bio.split(/(\s+)/);
		return words.map((word, index) => {
			const urlPattern =
				/^(https?:\/\/)?([\w-]+.)+[\w-]+(\/[\w-./]*)*(\?[\w-=&%]*)?(#[\w-]*)?$/i;
			if (urlPattern.test(word)) {
				return (
					<a
						key={index}
						href={word}
						target='_blank'
						rel='noopener noreferrer'
						className='text-cyan-400 hover:underline'
					>
						{word}
					</a>
				);
			}
			return word;
		});
	};

	const getLevelProgress = () => {
		if (!profile) return { progress: 0, nextLevel: 'Специалист' };
		const points = parseInt(profile.levelPoints) || 0;
		if (points >= 201) {
			return { progress: 100, nextLevel: null };
		}
		if (points >= 101) {
			return { progress: ((points - 101) / 100) * 100, nextLevel: 'Эксперт' };
		}
		return { progress: (points / 100) * 100, nextLevel: 'Специалист' };
	};
	if (isLoading || !profile) {
		return (
			<div className='bg-gray-900 min-h-screen flex items-center justify-center'>
				<LoadingSpinner />
			</div>
		);
	}

	const { progress, nextLevel } = getLevelProgress();
	const rating = profile.rating || 0;
	const currentLevel = profile.level || 'Новичок';
	const levelStyles = getLevelStyles(currentLevel);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className='bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8'
		>
			<div className='max-w-5xl mx-auto'>
				<h2 className='text-4xl font-bold text-white mb-8 text-center'>
					{profile.role === 'Freelancer'
						? 'Профиль фрилансера'
						: 'Профиль клиента'}
				</h2>
				{error && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='text-red-400 mb-6 text-center'
					>
						{error}
					</motion.p>
				)}
				<div className='bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg p-6 sm:p-8'>
					<div className='flex flex-col md:flex-row gap-8'>
						<div className='flex-1'>
							<div className='mb-6 text-center'>
								<img
									src={
										profile.avatarUrl
											? `${FILE_BASE_URL}${profile.avatarUrl}`
											: placeholderImage
									}
									alt='Аватар'
									className='w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-gradient-to-r from-cyan-500 to-blue-500'
									onError={e => {
										e.target.src = placeholderImage;
									}}
								/>
							</div>
							<h3 className='text-2xl font-semibold text-white'>
								{profile.name}
							</h3>
							<p className='text-gray-400'>{profile.email}</p>
							<p className='text-gray-300 mt-4'>
								<strong className='font-semibold text-white'>Биография:</strong>{' '}
								{renderBioWithLinks(profile.bio)}
							</p>
							{profile.role === 'Client' && (
								<p className='text-gray-300 mt-4'>
									<strong className='font-semibold text-white'>
										Компания:
									</strong>{' '}
									{profile.companyName || 'Не указана'}
								</p>
							)}
							{profile.role === 'Freelancer' && (
								<>
									<div className='text-gray-300 mt-4'>
										{profile.skills?.length > 0 ? (
											<div className='flex flex-wrap gap-2 mt-2'>
												{profile.skills.map((skill, index) => (
													<span
														key={index}
														className='px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-all duration-300'
													>
														{skill}
													</span>
												))}
											</div>
										) : (
											<span className='text-gray-400'> Не указаны</span>
										)}
									</div>
									<div className='mt-6'>
										<p className='text-gray-300'>
											<span className='flex items-center gap-2'>
												{[...Array(5)].map((_, i) => (
													<svg
														key={i}
														className={`w-5 h-5 ${
															i < Math.round(rating)
																? 'text-yellow-600'
																: 'text-gray-500'
														}`}
														fill='currentColor'
														viewBox='0 0 20 20'
													>
														<path d='M9.049 2.927c.3-.9211 1.603-.9211 1.902 0l1.518 4.674a1 1 0 00.951.69h4.905c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3 .921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783-.354-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.381-1.81.587-1.81h4.905a1 1 0 00.921-.69z' />
													</svg>
												))}
												<span className='ml-2 text-gray-400'>
													{rating.toFixed(1)}
												</span>
											</span>
										</p>
										<p className='text-gray-300 mt-4'>
											<strong className='font-semibold text-white'>
												Уровень:
											</strong>{' '}
											<motion.div
												initial={{ scale: 0.9, opacity: 0 }}
												animate={{ scale: 1, opacity: 1 }}
												transition={{ duration: 0.3 }}
												className={`relative inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 group ${
													levelStyles.bg
												} ${
													currentLevelName === 'Новенький' ||
													currentLevelName === 'Специалист'
														? 'animate-pulse'
														: ''
												}`}
												data-tooltip={levelStyles.tooltip}
											>
												{currentLevelName}
												<span className='absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2'>
													{levelStyles.tooltip}
												</span>
											</motion.div>
										</p>
										<p className='text-gray-300 mt-4'>
											<strong className='font-semibold text-white'>
												Очки уровня:
											</strong>{' '}
											<span className='text-gray-400'>
												{profile.levelPoints || 0}
											</span>
											{progress !== null && (
												<>
													<div className='mt-2 bg-gray-700 rounded-full h-6 overflow-hidden'>
														<motion.div
															className={`h-6 bg-gradient-to-r from-cyan-600 to-blue-600 ${
																currentLevelName === 'Новенький' ||
																currentLevelName === 'Специалист'
																	? 'animate-pulse'
																	: ''
															}`}
															initial={{ width: 0 }}
															animate={{ width: `${Math.min(progress, 100)}%` }}
															transition={{ duration: 0.8, ease: 'easeOut' }}
														/>
													</div>
													<p className='text-sm text-gray-400 mt-1'>
														Прогресс до {nextLevel}: {Math.round(progress)}%
													</p>
												</>
											)}
										</p>
									</div>
								</>
							)}
						</div>
						<div className='flex-1'>
							{isEditing ? (
								<form
									onSubmit={async e => {
										e.preventDefault();
										await updateProfileData();
									}}
									className='space-y-6'
								>
									<div>
										<label className='block text-sm font-medium text-gray-300 mb-2'>
											Биография
										</label>
										<textarea
											value={bio}
											onChange={e => setBio(e.target.value)}
											className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
											rows='4'
											placeholder='Расскажите о себе'
											maxLength={500}
										/>
									</div>
									{profile.role === 'Client' && (
										<div>
											<label className='block text-sm font-medium text-gray-300 mb-2'>
												Название компании
											</label>
											<input
												type='text'
												value={companyName}
												onChange={e => setCompanyName(e.target.value)}
												className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
												placeholder='Введите название компании'
												maxLength={100}
											/>
										</div>
									)}
									{profile.role === 'Freelancer' && (
										<div>
											<label className='block text-sm font-medium text-gray-300 mb-2'>
												Навыки (введите и нажмите пробел или выберите из
												подсказок)
											</label>
											<div className='flex flex-wrap gap-2 mb-4'>
												{skills.map((skill, index) => (
													<div
														key={index}
														className='relative inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-sm group'
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
											<div className='relative'>
												<input
													type='text'
													value={currentSkill}
													onChange={handleSkillInput}
													onKeyDown={handleSkillInput}
													className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
													placeholder='Введите навык и нажмите пробел'
												/>
												<AnimatePresence>
													{showSuggestions && suggestedSkills.length > 0 && (
														<motion.ul
															initial={{ opacity: 0, y: -10 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: -10 }}
															className='absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-md max-h-40 overflow-y-auto mt-1'
														>
															{suggestedSkills.map((skill, index) => (
																<li
																	key={index}
																	className='px-4 py-2 text-white hover:bg-cyan-500/50 cursor-pointer transition-all'
																	onClick={() => selectSkill(skill)}
																>
																	{skill}
																</li>
															))}
														</motion.ul>
													)}
												</AnimatePresence>
											</div>
										</div>
									)}
									<div>
										<label className='block text-sm font-medium text-gray-300 mb-2'>
											Аватар
										</label>
										<input
											type='file'
											onChange={e => setAvatar(e.target.files[0] || null)}
											className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 file:bg-cyan-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 hover:file:bg-cyan-600 transition-all'
											accept='image/*'
										/>
									</div>
									<div className='flex space-x-4'>
										<motion.button
											type='submit'
											disabled={isLoading}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className={`bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
												isLoading
													? 'opacity-50 cursor-not-allowed'
													: 'hover:shadow-lg'
											}`}
										>
											{isLoading ? 'Сохранение...' : 'Сохранить'}
										</motion.button>
										<motion.button
											type='button'
											onClick={resetForm}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className='bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300'
										>
											Отмена
										</motion.button>
									</div>
								</form>
							) : (
								<div className='flex space-x-4'>
									<motion.button
										onClick={() => setIsEditing(true)}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300'
									>
										Редактировать профиль
									</motion.button>
									<motion.button
										onClick={() => navigate('/settings')}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className='bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300'
									>
										Настройки
									</motion.button>
								</div>
							)}
						</div>
					</div>
				</div>
				{profile.role === 'Freelancer' && (
					<>
						<PortfolioSection
							profile={profile}
							portfolioFile={portfolioFile}
							portfolioDescription={portfolioDescription}
							isLoading={portfolioIsLoading}
							error={portfolioError}
							setPortfolioFile={setPortfolioFile}
							setPortfolioDescription={setPortfolioDescription}
							setError={setPortfolioError}
							addPortfolioItemHandler={addPortfolioItemHandler}
							deletePortfolioItemHandler={deletePortfolioItemHandler}
						/>
						<AnalyticsSection
							data={{
								recentOrders: analytics.recentOrders || [],
								statistics: analytics.statistics || {},
							}}
						/>
						<MyTeamsSection userId={userId} token={token} />
						<ReviewsSection
							reviews={reviews}
							isLoading={reviewsLoading}
							error={reviewsError}
							className='bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg p-6 mt-8'
						/>
					</>
				)}
			</div>
		</motion.div>
	);
};

export default ProfilePage;
