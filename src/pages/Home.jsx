import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchFreelancers, getFavorites } from '../api/api';
import { FILE_BASE_URL } from '../api/api';
import placeholderImage from '../images/placeholder.png';
import { debounce } from 'lodash';
import FavoriteButton from '../components/FavoriteButton';
import CreateOrderModal from '../components/CreateOrderModal';
import Card from '../components/Card';
import {
	MagnifyingGlassIcon,
	StarIcon,
	UserGroupIcon,
} from '@heroicons/react/24/solid';

// Функция для проверки валидности URL
const isValidUrl = string => {
	try {
		const urlPattern =
			/^(https?:\/\/)?([\w-]+.)+[\w-]+(\/[\w-./]*)*(\?[\w-=&%]*)?(#[\w-]*)?$/i;
		return urlPattern.test(string);
	} catch (e) {
		return false;
	}
};

// Функция для рендеринга текста с ссылками
const renderBioWithLinks = bio => {
	if (!bio) return 'Не указана';
	const words = bio.split(/(\s+)/);
	return words.map((word, index) => {
		if (isValidUrl(word)) {
			return (
				<a
					key={index}
					href={word}
					target='_blank'
					rel='noopener noreferrer'
					className='text-blue-500 hover:underline'
				>
					{word}
				</a>
			);
		}
		return word;
	});
};

const Home = ({ userId, userRole, token }) => {
	const [freelancers, setFreelancers] = useState([]);
	const [teams, setTeams] = useState([]);
	const [favorites, setFavorites] = useState([]);
	const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [minRating, setMinRating] = useState('');
	const [level, setLevel] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSearchActive, setIsSearchActive] = useState(false);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [isSearchMoved, setIsSearchMoved] = useState(false);
	const [showCards, setShowCards] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const searchTimeout = useRef(null);
	const cardsTimeout = useRef(null);
	const [selectedEntity, setSelectedEntity] = useState({
		freelancerId: null,
		teamId: null,
	});
	const observer = useRef();
	const navigate = useNavigate();

	useEffect(() => {
		localStorage.setItem('searchActive', isSearchActive);
	}, [isSearchActive]);

	useEffect(() => {
		const fetchFavorites = async () => {
			if (!userId || userRole !== 'Client' || !token) {
				setIsFavoritesLoading(false);
				return;
			}
			try {
				const res = await getFavorites(token);
				setFavorites(Array.isArray(res.data) ? res.data : []);
			} catch (err) {
				console.error('Error fetching favorites:', err.response?.data || err);
			} finally {
				setIsFavoritesLoading(false);
			}
		};
		fetchFavorites();
	}, [userId, userRole, token]);

	const lastElementRef = useCallback(
		node => {
			if (isLoading) return;
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver(entries => {
				if (entries[0].isIntersecting && hasMore) {
					setPage(prev => prev + 1);
				}
			});
			if (node) observer.current.observe(node);
		},
		[isLoading, hasMore]
	);

	const fetchFreelancersBase = useCallback(
		async (
			currentPage,
			reset = false,
			currentSearchTerm = '',
			currentMinRating = '',
			currentLevel = ''
		) => {
			setIsLoading(true);
			setError('');
			try {
				const params = {
					SearchTerm: currentSearchTerm || undefined,
					MinRating: currentMinRating
						? parseFloat(currentMinRating)
						: undefined,
					Level: currentLevel || undefined,
					Page: currentPage,
					PageSize: 10,
					UseFuzzySearch: true,
				};
				const res = await searchFreelancers(params);
				const { freelancers: newFreelancers = [], teams: newTeams = [] } =
					res.data || {};

				if (reset) {
					setFreelancers(newFreelancers);
					setTeams(newTeams);
				} else {
					setFreelancers(prev => [...prev, ...newFreelancers]);
					setTeams(prev => [...prev, ...newTeams]);
				}

				setHasMore(newFreelancers.length + newTeams.length >= params.PageSize);
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка загрузки');
				console.error('Fetch error:', err);
			} finally {
				setIsLoading(false);
				setIsSearching(false);
			}
		},
		[]
	);

	const debouncedSearch = useRef(
		debounce((page, reset, searchTerm, minRating, level) => {
			setIsSearching(true);
			fetchFreelancersBase(page, reset, searchTerm, minRating, level);
		}, 500)
	).current;

	useEffect(() => {
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);

	useEffect(() => {
		fetchFreelancersBase(1, true);
	}, [fetchFreelancersBase]);

	useEffect(() => {
		if (searchTerm.trim() || minRating || level) {
			setIsSearching(true);
			debouncedSearch(1, true, searchTerm, minRating, level);
		} else {
			fetchFreelancersBase(1, true);
		}
	}, [searchTerm, minRating, level, debouncedSearch, fetchFreelancersBase]);

	useEffect(() => {
		if (page > 1) {
			fetchFreelancersBase(page, false, searchTerm, minRating, level);
		}
	}, [page, fetchFreelancersBase, searchTerm, minRating, level]);

	const handleSearch = e => {
		e.preventDefault();
		setPage(1);
		setIsSearching(true);
		debouncedSearch(1, true, searchTerm, minRating, level);
	};

	const handleReset = () => {
		setSearchTerm('');
		setMinRating('');
		setLevel('');
		setPage(1);
		fetchFreelancersBase(1, true);
	};

	const handleOpenOrderModal = (isFreelancer, id) => {
		setSelectedEntity({
			freelancerId: isFreelancer ? id : null,
			teamId: !isFreelancer ? id : null,
		});
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedEntity({ freelancerId: null, teamId: null });
	};

	const combinedList = [
		...(Array.isArray(freelancers)
			? freelancers.map(f => ({ ...f, type: 'Freelancer' }))
			: []),
		...(Array.isArray(teams) ? teams.map(t => ({ ...t, type: 'Team' })) : []),
	];

	return (
		<div className='flex flex-col items-center min-h-screen px-4 overflow-x-hidden'>
			<form
				onSubmit={handleSearch}
				className={`w-full max-w-3xl transition-all duration-500 ease-in-out  ${
					isSearchMoved
						? 'translate-y-0 mt-4'
						: 'translate-y-[20vh] mt-10 scale-110 sm:scale-125 mx-10 sm:mx-20'
				}`}
			>
				<h2
					className={`font-bold text-white text-center transition-all pt-5 duration-500 ${
						isSearchMoved
							? 'text-2xl mb-6 mt-20 sm:text-3xl'
							: 'text-4xl mb-8 sm:text-5xl'
					}`}
				>
					Найдите лучшего фрилансера
				</h2>
				<div className='relative'>
					<div
						className={`absolute inset-0 -bottom-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 rounded-full blur-2xl transition-opacity duration-500 ${
							!isSearchMoved || isSearchFocused
								? 'opacity-50 animate-gradient'
								: 'opacity-0'
						}`}
					></div>
					<div className='relative flex items-center'>
						<MagnifyingGlassIcon
							className={`text-cyan-400 absolute left-4 transition-all duration-500 z-10 mx-2 ${
								isSearchMoved
									? 'w-5 h-5 sm:w-6 sm:h-6'
									: 'w-6 h-6 sm:w-8 sm:h-8'
							}`}
						/>
						<input
							type='text'
							value={searchTerm}
							onChange={e => {
								setSearchTerm(e.target.value);
								if (e.target.value.length > 0) {
									if (searchTimeout.current)
										clearTimeout(searchTimeout.current);
									searchTimeout.current = setTimeout(() => {
										setIsSearchMoved(true);
										setIsSearchActive(true);
										if (cardsTimeout.current)
											clearTimeout(cardsTimeout.current);
										cardsTimeout.current = setTimeout(() => {
											setShowCards(true);
										}, 500);
									}, 300);
								} else {
									setShowFilters(false);
								}
							}}
							onFocus={() => {
								setIsSearchFocused(true);
								if (searchTimeout.current) clearTimeout(searchTimeout.current);
								searchTimeout.current = setTimeout(() => {
									setIsSearchMoved(true);
									if (cardsTimeout.current) clearTimeout(cardsTimeout.current);
									cardsTimeout.current = setTimeout(() => {
										setShowCards(true);
									}, 500);
								}, 300);
							}}
							onBlur={() => {
								setIsSearchFocused(false);
							}}
							placeholder='Имя, навыки или команда'
							className={`w-full bg-gray-800/70 text-white border border-gray-600 rounded-full backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-gray-700/80 transition-all duration-500 text-base sm:text-lg ${
								isSearchMoved
									? 'p-3 pl-12 pr-10 sm:p-4 sm:pl-16 sm:pr-12'
									: 'p-4 pl-14 pr-10 sm:p-6 sm:pl-20 sm:pr-12'
							}`}
						/>
						<button
							type='button'
							onClick={() => setShowFilters(prev => !prev)}
							className={`absolute right-2 bg-gray-700/50 rounded-full hover:bg-gray-600/50 transition-colors transition-all duration-500 ${
								isSearchMoved ? 'p-2 sm:p-3' : 'p-3 sm:p-4'
							}`}
						>
							<svg
								className={`text-cyan-400 ${
									isSearchMoved
										? 'w-4 h-4 sm:w-5 sm:h-5'
										: 'w-5 h-5 sm:w-6 sm:h-6'
								}`}
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
								/>
							</svg>
						</button>
					</div>
				</div>
				<div
					className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 transition-all duration-500 ${
						showFilters && isSearchMoved
							? 'opacity-100 h-auto'
							: 'opacity-0 h-0 overflow-hidden'
					}`}
				>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>
							Мин. рейтинг
						</label>
						<div className='relative flex items-center'>
							<StarIcon className='w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 absolute left-3' />
							<input
								type='number'
								value={minRating}
								onChange={e => setMinRating(e.target.value)}
								placeholder='0-5'
								min='0'
								max='5'
								step='0.1'
								className='w-full p-2 pl-9 sm:p-3 sm:pl-10 bg-gray-800/50 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm sm:text-base'
							/>
						</div>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-400 mb-1'>
							Уровень
						</label>
						<div className='relative flex items-center'>
							<UserGroupIcon className='w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 absolute left-3' />
							<select
								value={level}
								onChange={e => setLevel(e.target.value)}
								className='w-full p-2 pl-9 sm:p-3 sm:pl-10 bg-gray-800/50 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm sm:text-base'
							>
								<option value=''>Все уровни</option>
								<option value='Newbie'>Newbie</option>
								<option value='Specialist'>Specialist</option>
								<option value='Expert'>Expert</option>
							</select>
						</div>
					</div>
					<div className='flex items-end'>
						<button
							type='button'
							onClick={handleReset}
							className='w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-full hover:from-gray-600 hover:to-gray-500 transition-all text-sm sm:text-base'
						>
							Сброс
						</button>
					</div>
				</div>
			</form>
			{error && (
				<p className='text-red-400 text-center mt-4 text-sm sm:text-base'>
					{error}
				</p>
			)}
			{(isLoading || isSearching) && (
				<div className='text-center mt-6 sm:mt-8'>
					<svg
						className='animate-spin h-6 w-6 sm:h-8 sm:w-8 text-cyan-500 mx-auto'
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
					>
						<circle
							className='opacity-25'
							cx='12'
							cy='12'
							r='10'
							stroke='currentColor'
							strokeWidth='4'
						></circle>
						<path
							className='opacity-75'
							fill='currentColor'
							d='M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z'
						></path>
					</svg>
					<p className='text-gray-400 mt-2 text-sm sm:text-base'>Загрузка...</p>
				</div>
			)}
			{showCards && (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8 w-full max-w-6xl mx-auto'>
					{combinedList.length > 0 ? (
						combinedList.map((item, index) => (
							<Card
								key={item.id}
								item={item}
								index={index}
								lastElementRef={lastElementRef}
								navigate={navigate}
								userId={userId}
								userRole={userRole}
								token={token}
								favorites={favorites}
								setFavorites={setFavorites}
								handleOpenOrderModal={handleOpenOrderModal}
								isFavoritesLoading={isFavoritesLoading}
								placeholderImage={placeholderImage}
								FILE_BASE_URL={FILE_BASE_URL}
								renderBioWithLinks={renderBioWithLinks}
								combinedList={combinedList}
							/>
						))
					) : (
						<p className='text-center text-gray-400 col-span-full text-sm sm:text-base'>
							Фрилансеры или команды не найдены
						</p>
					)}
				</div>
			)}
			{isModalOpen && (
				<CreateOrderModal
					freelancerId={selectedEntity.freelancerId}
					teamId={selectedEntity.teamId}
					userId={userId}
					token={token}
					onClose={handleCloseModal}
					onOrderCreated={chatId => navigate(`/chat/${chatId}`)}
				/>
			)}
		</div>
	);
};

export default Home;
