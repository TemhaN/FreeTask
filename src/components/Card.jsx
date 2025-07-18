import React, { useState, useRef } from 'react';
import FavoriteButton from './FavoriteButton';

const Card = ({
	item,
	index,
	lastElementRef,
	navigate,
	userId,
	userRole,
	token,
	favorites,
	setFavorites,
	handleOpenOrderModal,
	isFavoritesLoading,
	placeholderImage,
	FILE_BASE_URL,
	renderBioWithLinks,
	combinedList,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const hoverTimeout = useRef(null);

	const handleMouseEnter = () => {
		hoverTimeout.current = setTimeout(() => {
			setIsHovered(true);
		}, 150);
	};

	const handleMouseLeave = () => {
		if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
		setIsHovered(false);
	};

	// Маппинг для уровня фрилансера
	const levelMap = {
		Newbie: { label: 'Новичок', color: 'bg-gray-500/20 text-gray-400' },
		Specialist: { label: 'Специалист', color: 'bg-cyan-500/20 text-cyan-400' },
		Expert: { label: 'Эксперт', color: 'bg-yellow-500/20 text-yellow-400' },
	};

	const getLevelDisplay = level => {
		if (!level || !levelMap[level]) return 'Не указан';
		const { label, color } = levelMap[level];
		return (
			<span className={`px-2 py-1 ${color} text-sm rounded-full`}>{label}</span>
		);
	};

	return (
		<div
			key={item.id}
			ref={index === combinedList.length - 1 ? lastElementRef : null}
			className='relative card-enter card-enter-active'
			style={{ animationDelay: `${index * 100}ms` }}
		>
			<div
				onClick={() =>
					navigate(
						item.type === 'Freelancer' ? `/user/${item.id}` : `/team/${item.id}`
					)
				}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className={`group bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700 hover:border-cyan-500 transition-all duration-300 cursor-pointer z-10 ${
					isHovered
						? 'absolute scale-110 z-20 shadow-2xl'
						: 'relative scale-100'
				}`}
				style={{
					transformOrigin: 'center',
					top: isHovered ? '0' : 'auto',
					left: isHovered ? '0' : 'auto',
					width: isHovered ? '100%' : 'auto',
				}}
			>
				<div className='flex items-center mb-4 justify-between'>
					<div className='flex items-center'>
						<img
							src={
								item.avatarUrl
									? `${FILE_BASE_URL}${item.avatarUrl}`
									: placeholderImage
							}
							alt={item.name || 'No name'}
							className='w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-cyan-500/50'
							onError={e => {
								e.target.src = placeholderImage;
							}}
						/>
						<div>
							<h2 className='text-xl font-semibold text-white flex items-center'>
								{item.name || 'Без имени'}
								{item.type === 'Team' && (
									<span className='ml-2 px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full'>
										Команда
									</span>
								)}
							</h2>
						</div>
					</div>
					{isFavoritesLoading ? (
						<span className='text-gray-400'>...</span>
					) : (
						<FavoriteButton
							freelancerId={item.type === 'Freelancer' ? item.id : null}
							teamId={item.type === 'Team' ? item.id : null}
							userId={userId}
							userRole={userRole}
							token={token}
							isFavorited={favorites.some(fav =>
								item.type === 'Freelancer'
									? fav.freelancerId?.toLowerCase() === item.id?.toLowerCase()
									: fav.teamId?.toLowerCase() === item.id?.toLowerCase()
							)}
							onToggle={() =>
								setFavorites(prev => {
									const exists = prev.some(fav =>
										item.type === 'Freelancer'
											? fav.freelancerId?.toLowerCase() ===
											  item.id?.toLowerCase()
											: fav.teamId?.toLowerCase() === item.id?.toLowerCase()
									);
									if (exists) {
										return prev.filter(fav =>
											item.type === 'Freelancer'
												? fav.freelancerId?.toLowerCase() !==
												  item.id?.toLowerCase()
												: fav.teamId?.toLowerCase() !== item.id?.toLowerCase()
										);
									} else {
										return [
											...prev,
											{
												freelancerId:
													item.type === 'Freelancer' ? item.id : null,
												teamId: item.type === 'Team' ? item.id : null,
											},
										];
									}
								})
							}
						/>
					)}
				</div>
				<div className='mb-4'>
					<p className='text-gray-400 mb-2'>
						<strong>Рейтинг:</strong> {(item.rating || 0).toFixed(1)} / 5
					</p>
					<div className='mb-2'>
						<strong className='text-gray-400'>Навыки:</strong>
						{Array.isArray(item.skills) && item.skills.length > 0 ? (
							<div className='flex flex-wrap gap-2 mt-1'>
								{item.skills.map((skill, idx) => (
									<span
										key={idx}
										className='px-2 py-1 bg-cyan-500/20 text-cyan-400 text-sm rounded-full'
									>
										{skill}
									</span>
								))}
							</div>
						) : (
							<span className='text-gray-400'> Не указаны</span>
						)}
					</div>
				</div>
				<div
					className={`transition-all duration-300 ${
						isHovered ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
					}`}
				>
					<p className='text-gray-400 mb-2'>
						{item.type === 'Freelancer'
							? item.email || 'Нет email'
							: `Лидер: ${item.leaderName || 'Нет лидера'}`}
					</p>
					{item.type === 'Freelancer' && (
						<p className='text-gray-400 mb-2'>
							<strong>Уровень:</strong> {getLevelDisplay(item.level)}
						</p>
					)}
					<p className='text-gray-400 mb-2'>
						<strong>Биография:</strong>{' '}
						{item.type === 'Freelancer'
							? renderBioWithLinks(item.bio)
							: item.bio || 'Не указана'}
					</p>
					{userRole === 'Client' && (
						<button
							onClick={e => {
								e.stopPropagation();
								handleOpenOrderModal(item.type === 'Freelancer', item.id);
							}}
							className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-600 hover:shadow-lg w-full transition-all duration-300 mt-2'
						>
							Предложить работу
						</button>
					)}
					<div className='mb-4 mt-4'>
						<strong className='text-gray-400'>Портфолио:</strong>
						{item.portfolioItems?.length > 0 || item.portfolio?.length > 0 ? (
							<div className='grid grid-cols-2 gap-2 mt-2'>
								{(item.type === 'Freelancer'
									? item.portfolioItems
									: item.portfolio || []
								)
									.slice(0, 3)
									.map(pi => (
										<div
											key={pi.id || pi.fileUrl}
											className='border border-gray-700 rounded-md p-2 hover:border-cyan-500 transition-all'
										>
											{(pi.url || pi.fileUrl)?.endsWith('.mp4') ||
											(pi.url || pi.fileUrl)?.endsWith('.mov') ? (
												<video
													src={`${FILE_BASE_URL}${pi.url || pi.fileUrl}`}
													controls
													className='w-full h-24 object-cover rounded-md'
												/>
											) : (
												<img
													src={`${FILE_BASE_URL}${pi.url || pi.fileUrl}`}
													alt={pi.description || pi.title || 'Без описания'}
													className='w-full h-24 object-cover rounded-md'
													onError={e => {
														e.target.src = placeholderImage;
													}}
												/>
											)}
											<p className='text-gray-400 text-sm mt-1 truncate'>
												{pi.description || pi.title || 'Без описания'}
											</p>
										</div>
									))}
								{(item.portfolioItems?.length > 3 ||
									item.portfolio?.length > 3) && (
									<p className='text-cyan-400 text-sm mt-2'>
										Ещё{' '}
										{(item.type === 'Freelancer'
											? item.portfolioItems
											: item.portfolio
										).length - 3}{' '}
										работ(ы)...
									</p>
								)}
							</div>
						) : (
							<p className='text-gray-400 mt-1'>Портфолио пусто</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Card;
