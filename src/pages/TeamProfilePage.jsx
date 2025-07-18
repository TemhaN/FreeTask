import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTeamProfile, getFavorites, getFreelancerReviews } from '../api/api';
import { FILE_BASE_URL } from '../api/api';
import placeholderImage from '../images/placeholder.png';
import FavoriteButton from '../components/FavoriteButton';
import CreateOrderModal from '../components/CreateOrderModal';
import PortfolioSection from '../components/Profile/PortfolioSection';
import ReviewsSection from '../components/Profile/ReviewsSection';
import LoadingSpinner from '../components/LoadingSpinner';

const decodeToken = token => {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const payload = JSON.parse(atob(base64));
		return (
			payload.role ||
			payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
			null
		);
	} catch (e) {
		console.error('Ошибка декодирования токена:', e);
		return null;
	}
};

const isValidUrl = string => {
	try {
		const urlPattern =
			/^(https?:\/\/)?([\w-]+.)+[\w-]+(\/[\w-./]*)*(\?[\w-=&%]*)?(#[\w-]*)?$/i;
		return urlPattern.test(string);
	} catch (e) {
		return false;
	}
};

const renderBioWithLinks = bio => {
	if (!bio) return <span className='text-gray-400'>Не указана</span>;
	const words = bio.split(/(\s+)/);
	return words.map((word, index) => {
		if (isValidUrl(word)) {
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
		case 'Мастер':
			return {
				bg: 'bg-gradient-to-r from-purple-600 to-purple-400',
				tooltip: 'Вершина профессионализма',
			};
		case 'Новичок':
		default:
			return {
				bg: 'bg-gradient-to-r from-gray-600 to-gray-400',
				tooltip: 'Начальный уровень опыта',
			};
	}
};

const getLevelProgress = team => {
	if (!team) return { progress: 0, nextLevel: 'Специалист' };
	const points = parseInt(team.levelPoints) || 0;
	if (points >= 501) {
		return { progress: 100, nextLevel: null };
	}
	if (points >= 201) {
		return { progress: ((points - 201) / 300) * 100, nextLevel: 'Мастер' };
	}
	if (points >= 101) {
		return { progress: ((points - 101) / 100) * 100, nextLevel: 'Эксперт' };
	}
	return { progress: (points / 100) * 100, nextLevel: 'Специалист' };
};

const TeamProfilePage = ({ userId, token }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [team, setTeam] = useState(null);
	const [favorites, setFavorites] = useState([]);
	const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [userRole, setUserRole] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [reviews, setReviews] = useState([]);
	const [reviewsError, setReviewsError] = useState('');
	const [reviewsLoading, setReviewsLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setIsFavoritesLoading(true);
			setReviewsLoading(true);
			try {
				const [teamRes, favoritesRes, reviewsRes] = await Promise.all([
					getTeamProfile(id),
					userId && token && decodeToken(token) === 'Client'
						? getFavorites(token)
						: Promise.resolve({ data: [] }),
					getFreelancerReviews(id, 1, 10).catch(err => {
						console.error('Reviews fetch failed:', err);
						return { data: [] };
					}),
				]);
				console.log('Team portfolio data:', teamRes.data.portfolio); // Логирование
				setTeam(teamRes.data);
				setFavorites(Array.isArray(favoritesRes.data) ? favoritesRes.data : []);
				setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
				setReviewsError('');
				if (token && userId) {
					const role = decodeToken(token);
					setUserRole(role);
				}
			} catch (err) {
				setError(
					err.response?.data?.message || 'Ошибка загрузки профиля команды'
				);
				console.error('Fetch error:', err);
				setReviewsError('Ошибка загрузки отзывов');
				setReviews([]);
			} finally {
				setIsLoading(false);
				setIsFavoritesLoading(false);
				setReviewsLoading(false);
			}
		};
		fetchData();
	}, [id, token, userId]);

	const handleOpenOrderModal = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	if (isLoading) {
		return (
			<div className='bg-gray-900 min-h-screen flex items-center justify-center'>
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className='bg-gray-900 min-h-screen flex items-center justify-center'>
				<p className='text-red-400 text-xl font-semibold'>{error}</p>
			</div>
		);
	}

	if (!team) {
		return (
			<div className='bg-gray-900 min-h-screen flex items-center justify-center'>
				<p className='text-gray-400 text-xl font-semibold'>
					Команда не найдена
				</p>
			</div>
		);
	}

	const rating = team.rating || 0;
	const currentLevelName = team.level
		? {
				Newbie: 'Новичок',
				Specialist: 'Специалист',
				Expert: 'Эксперт',
				Master: 'Мастер',
		  }[team.level] || 'Новичок'
		: 'Новичок';
	const { progress, nextLevel } = getLevelProgress(team);
	const levelStyles = getLevelStyles(currentLevelName);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className='bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8'
		>
			<div className='max-w-5xl mx-auto'>
				<h2 className='text-4xl font-bold text-white mb-8 text-center'>
					Профиль команды
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
										team.avatarUrl
											? `${FILE_BASE_URL}${team.avatarUrl}`
											: placeholderImage
									}
									alt={team.name || 'Аватар'}
									className='w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-gradient-to-r from-cyan-500 to-blue-500'
									onError={e => {
										e.target.src = placeholderImage;
									}}
								/>
							</div>
							<h3 className='text-2xl font-semibold text-white'>
								{team.name || 'Без имени'}
							</h3>
							<p className='text-gray-400'>
								Лидер: {team.leaderName || 'Не указан'}
							</p>
							<p className='text-gray-300 mt-4'>
								<strong className='font-semibold text-white'>Биография:</strong>{' '}
								{renderBioWithLinks(team.bio)}
							</p>
							<div className='text-gray-300 mt-4'>
								<strong className='font-semibold text-white'>Навыки:</strong>
								{Array.isArray(team.skills) && team.skills.length > 0 ? (
									<div className='flex flex-wrap gap-2 mt-2'>
										{team.skills.map((skill, index) => (
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
									<strong className='font-semibold text-white'>Уровень:</strong>{' '}
									<motion.div
										initial={{ scale: 0.9, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ duration: 0.3 }}
										className={`relative inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 group ${
											levelStyles.bg
										} ${
											currentLevelName === 'Новичок' ||
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
									<span className='text-gray-400'>{team.levelPoints || 0}</span>
									{progress !== null && (
										<>
											<div className='mt-2 bg-gray-700 rounded-full h-6 overflow-hidden'>
												<motion.div
													className={`h-6 bg-gradient-to-r from-cyan-600 to-blue-600 ${
														currentLevelName === 'Новичок' ||
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
												Прогресс до {nextLevel || 'Максимум'}:{' '}
												{Math.round(progress)}%
											</p>
										</>
									)}
								</p>
							</div>
						</div>
						<div className='flex-1'>
							<div className='flex space-x-4'>
								{isFavoritesLoading ? (
									<span className='text-gray-400'>...</span>
								) : (
									<FavoriteButton
										teamId={id}
										userId={userId}
										userRole={userRole}
										token={token}
										isFavorited={favorites.some(
											fav => fav.teamId?.toLowerCase() === id?.toLowerCase()
										)}
										onToggle={() =>
											setFavorites(prev => {
												const exists = prev.some(
													fav => fav.teamId?.toLowerCase() === id?.toLowerCase()
												);
												if (exists) {
													return prev.filter(
														fav =>
															fav.teamId?.toLowerCase() !== id?.toLowerCase()
													);
												}
												return [...prev, { freelancerId: null, teamId: id }];
											})
										}
									/>
								)}
								{userRole === 'Client' && (
									<motion.button
										onClick={handleOpenOrderModal}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className='bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300'
									>
										Предложить работу
									</motion.button>
								)}
							</div>
						</div>
					</div>
				</div>
				<PortfolioSection
					profile={{
						...team,
						portfolioItems: Array.isArray(team.portfolio)
							? team.portfolio.filter(item => item && item.url)
							: [],
					}}
					isLoading={false}
					error={null}
					setError={() => {}}
					portfolioFile={null}
					portfolioDescription=''
					setPortfolioFile={() => {}}
					setPortfolioDescription={() => {}}
					addPortfolioItemHandler={() => {}}
					deletePortfolioItemHandler={() => {}}
					userId={userId}
					navigate={navigate}
				/>
				<ReviewsSection
					reviews={reviews}
					isLoading={reviewsLoading}
					error={reviewsError}
					className='bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg p-6 mt-8'
				/>
				{isModalOpen && (
					<CreateOrderModal
						freelancerId={null}
						teamId={id}
						userId={userId}
						token={token}
						onClose={handleCloseModal}
						onOrderCreated={chatId => navigate(`/chat/${chatId}`)}
					/>
				)}
			</div>
		</motion.div>
	);
};

export default TeamProfilePage;
