import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	getFavorites,
	getFreelancerProfile,
	getTeamProfile,
} from '../api/api';
import { FILE_BASE_URL } from '../api/api';
import placeholderImage from '../images/placeholder.png';
import FavoriteButton from '../components/FavoriteButton';
import CreateOrderModal from '../components/CreateOrderModal';

const FavoritesPage = ({ userId, userRole, token }) => {
	const [favorites, setFavorites] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedEntity, setSelectedEntity] = useState({
		freelancerId: null,
		teamId: null,
	});
	const navigate = useNavigate();

	useEffect(() => {
		const fetchFavorites = async () => {
			if (!userId || userRole !== 'Client' || !token) {
				setError('Доступ только для клиентов');
				setIsLoading(false);
				return;
			}
			try {
				const res = await getFavorites(token);
				console.log('Favorites response:', res.data);
				const favoritesData = Array.isArray(res.data) ? res.data : [];

				const detailedFavorites = await Promise.all(
					favoritesData.map(async item => {
						try {
							if (item.freelancerId) {
								const profileRes = await getFreelancerProfile(
									item.freelancerId
								);
								return { ...item, freelancer: profileRes.data };
							} else if (item.teamId) {
								const teamRes = await getTeamProfile(item.teamId);
								return { ...item, team: teamRes.data };
							}
							return item;
						} catch (err) {
							console.error(
								`Error fetching profile for ${
									item.freelancerId || item.teamId
								}`,
								err
							);
							return item;
						}
					})
				);

				setFavorites(detailedFavorites);
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка загрузки данных');
				console.error('Fetch favorites error:', err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchFavorites();
	}, [userId, userRole, token]);

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

	if (isLoading) {
		return (
			<div className='text-center mt-10'>
				<svg
					className='animate-spin h-8 w-8 text-blue-500 mx-auto'
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
						d='M4 12a8 8 0 018-8v8'
					></path>
				</svg>
				<p className='text-gray-600'>Загрузка...</p>
			</div>
		);
	}

	if (error) {
		return <p className='text-red-500 text-center mt-10'>{error}</p>;
	}

	return (
		<div className='max-w-6xl mx-auto mt-10 p-6'>
			<h1 className='text-3xl font-bold text-center mb-8'>Мои избранные</h1>
			{favorites.length === 0 ? (
				<p className='text-center text-gray-600'>Избранное пусто</p>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{favorites.map(item => {
						const isFreelancer = !!item.freelancerId;
						const id = isFreelancer ? item.freelancerId : item.teamId;
						const data = isFreelancer ? item.freelancer : item.team;
						const name = isFreelancer ? item.freelancerName : item.teamName;

						if (!data && !name) return null;

						return (
							<div key={id} className='bg-white shadow-md rounded-lg p-6'>
								<div className='flex items-center mb-4 justify-between'>
									<div className='flex items-center'>
										<img
											src={
												data?.avatarUrl
													? `${FILE_BASE_URL}${data.avatarUrl}`
													: placeholderImage
											}
											alt={name || 'No name'}
											className='w-12 h-12 rounded-full object-cover mr-4'
											onError={e => {
												e.target.src = placeholderImage;
											}}
										/>
										<div>
											<h2 className='text-xl font-semibold flex items-center'>
												{data?.name || name || 'Без имени'}
												{!isFreelancer && (
													<span className='ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
														Команда
													</span>
												)}
											</h2>
											<p className='text-gray-600'>
												{isFreelancer
													? data?.email || 'Нет email'
													: `Лидер: ${data?.leaderName || 'Нет лидера'}`}
											</p>
										</div>
									</div>
									<FavoriteButton
										freelancerId={isFreelancer ? id : null}
										teamId={!isFreelancer ? id : null}
										userId={userId}
										userRole={userRole}
										token={token}
										isFavorited={true}
										onToggle={() =>
											setFavorites(prev =>
												prev.filter(fav =>
													isFreelancer
														? fav.freelancerId?.toLowerCase() !==
														  id?.toLowerCase()
														: fav.teamId?.toLowerCase() !== id?.toLowerCase()
												)
											)
										}
									/>
								</div>
								<p className='text-gray-600 mb-2'>
									<strong>Рейтинг:</strong> {(data?.rating || 0).toFixed(1)} / 5
								</p>
								{isFreelancer && (
									<p className='text-gray-600 mb-2'>
										<strong>Уровень:</strong> {data?.level || 'Не указан'}
									</p>
								)}
								{isFreelancer && (
									<p className='text-gray-600 mb-2'>
										<strong>Биография:</strong> {data?.bio || 'Не указана'}
									</p>
								)}
								<div className='mb-4'>
									<strong className='text-gray-600'>Навыки:</strong>
									{Array.isArray(data?.skills) && data?.skills.length > 0 ? (
										<div className='flex flex-wrap gap-2 mt-1'>
											{data.skills.map((skill, index) => (
												<span
													key={index}
													className='px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'
												>
													{skill}
												</span>
											))}
										</div>
									) : (
										<span className='text-gray-600'> Не указаны</span>
									)}
								</div>
								<div className='flex gap-2'>
									<button
										onClick={() =>
											navigate(isFreelancer ? `/user/${id}` : `/team/${id}`)
										}
										className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex-1'
									>
										Посмотреть профиль
									</button>
									<button
										onClick={() => handleOpenOrderModal(isFreelancer, id)}
										className='bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 flex-1'
									>
										Предложить работу
									</button>
								</div>
							</div>
						);
					})}
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

export default FavoritesPage;
