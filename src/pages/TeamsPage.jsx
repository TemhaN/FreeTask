import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	getTeams,
	createTeam,
	placeTeamBid,
	getTeamBids,
	handleTeamBid,
	deleteTeam,
} from '../api/api';
import { FILE_BASE_URL } from '../api/api';
import placeholderImage from '../images/placeholder.png';

const decodeToken = token => {
	try {
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const payload = JSON.parse(atob(base64));
		return (
			payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
			null
		);
	} catch (e) {
		console.error('Ошибка декодирования токена:', e);
		return null;
	}
};

const TeamsPage = ({ userId, token }) => {
	const navigate = useNavigate();
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');
	const [minRating, setMinRating] = useState('');
	const [userRole, setUserRole] = useState(null);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [requestModalOpen, setRequestModalOpen] = useState(false);
	const [bidsModalOpen, setBidsModalOpen] = useState(false);
	const [teamName, setTeamName] = useState('');
	const [teamAvatar, setTeamAvatar] = useState(null);
	const [requestTeamId, setRequestTeamId] = useState(null);
	const [requestRole, setRequestRole] = useState('');
	const [requestBudgetShare, setRequestBudgetShare] = useState('');
	const [bids, setBids] = useState([]);
	const [isLeaderOfTeam, setIsLeaderOfTeam] = useState({});

	useEffect(() => {
		if (token) {
			setUserRole(decodeToken(token));
		}
		fetchTeams();
	}, [page, searchTerm, minRating, token]);

	const fetchTeams = async () => {
		setLoading(true);
		try {
			const params = { searchTerm, minRating, page, pageSize };
			const res = await getTeams(params);
			setTeams(res.data);
			const leaderStatus = {};
			for (const team of res.data) {
				leaderStatus[team.id] = team.leaderId === userId;
			}
			setIsLeaderOfTeam(leaderStatus);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка загрузки команд');
			console.error('Error fetching teams:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateTeam = async e => {
		e.preventDefault();
		if (!teamName.trim()) {
			setError('Название команды обязательно');
			return;
		}
		try {
			const formData = new FormData();
			formData.append('Name', teamName.trim());
			formData.append('SkillsString', JSON.stringify([]));
			formData.append('PortfolioString', JSON.stringify([]));
			if (teamAvatar) {
				formData.append('Avatar', teamAvatar);
			}
			const res = await createTeam(formData, token);
			setTeams([...teams, res.data]);
			setCreateModalOpen(false);
			setTeamName('');
			setTeamAvatar(null);
		} catch (err) {
			const errorMsg = err.response?.data?.message || 'Ошибка создания команды';
			setError(
				errorMsg === 'User already leads a team'
					? 'Вы уже лидер команды'
					: errorMsg
			);
			console.error('Error creating team:', err);
		}
	};

	const handleRequestMembership = async e => {
		e.preventDefault();
		if (!requestRole.trim() || !requestBudgetShare) {
			setError('Укажите роль и долю бюджета');
			return;
		}
		if (!userId) {
			navigate('/login');
			return;
		}
		try {
			await placeTeamBid(
				requestTeamId,
				{
					OrderId: null,
					Amount: parseFloat(requestBudgetShare),
					Comment: requestRole,
					Type: 'Membership',
				},
				token
			);
			alert('Заявка на вступление отправлена!');
			setRequestModalOpen(false);
			setRequestRole('');
			setRequestBudgetShare('');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка отправки заявки');
			console.error('Error requesting membership:', err);
		}
	};

	const fetchBids = async teamId => {
		try {
			const res = await getTeamBids(teamId, token);
			setBids(res.data);
			setRequestTeamId(teamId);
			setBidsModalOpen(true);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка загрузки заявок');
			console.error('Error fetching bids:', err);
		}
	};

	const handleBid = async (bidId, accept) => {
		try {
			await handleTeamBid(requestTeamId, bidId, { Accept: accept }, token);
			setBids(bids.filter(b => b.id !== bidId));
			alert(accept ? 'Заявка принята!' : 'Заявка отклонена!');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка обработки заявки');
			console.error('Error handling bid:', err);
		}
	};

	const handleDeleteTeam = async teamId => {
		if (!window.confirm('Вы уверены, что хотите удалить команду?')) return;
		try {
			await deleteTeam(teamId, token);
			setTeams(teams.filter(team => team.id !== teamId));
			alert('Команда удалена');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка удаления команды');
			console.error('Error deleting team:', err);
		}
	};

	const openRequestModal = teamId => {
		setRequestTeamId(teamId);
		setRequestModalOpen(true);
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen bg-gray-900'>
				<div className='text-white text-xl'>Загрузка...</div>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className='min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-10 px-4 sm:px-6 lg:px-8'
		>
			<div className='max-w-6xl mx-auto'>
				<div className='flex flex-col sm:flex-row justify-between items-center mb-8 gap-4'>
					<h1 className='text-3xl sm:text-4xl font-bold text-white'>Команды</h1>
					{userRole === 'Freelancer' && (
						<motion.button
							onClick={() => setCreateModalOpen(true)}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300'
						>
							Создать команду
						</motion.button>
					)}
				</div>

				<div className='mb-8 flex flex-col sm:flex-row gap-4'>
					<input
						type='text'
						placeholder='Поиск по названию...'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className='px-4 py-3 bg-gray-800/50 backdrop-blur-md text-white rounded-lg w-full sm:max-w-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300'
					/>
				</div>

				{error && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='text-red-400 mb-6 text-center text-lg'
					>
						{error}
					</motion.p>
				)}

				{teams.length === 0 ? (
					<p className='text-gray-400 text-center text-lg'>
						Команды не найдены
					</p>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
						{teams.map((team, index) => (
							<motion.div
								key={team.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className='bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
							>
								<div className='flex items-center gap-4 mb-4'>
									<img
										src={
											team.avatarUrl
												? `${FILE_BASE_URL}${team.avatarUrl}`
												: placeholderImage
										}
										alt={team.name}
										className='w-16 h-16 rounded-full object-cover ring-2 ring-cyan-400'
										onError={e => (e.target.src = placeholderImage)}
									/>
									<div>
										<h2
											className='text-xl font-semibold text-white cursor-pointer hover:text-cyan-400 transition-colors duration-200'
											onClick={() => navigate(`/team/${team.id}`)}
										>
											{team.name || 'Без имени'}
										</h2>
										<p className='text-gray-400 text-sm'>
											Лидер: {team.leaderName || 'Не указан'}
										</p>
										<p className='text-gray-400 text-sm'>
											Рейтинг: {(team.rating || 0).toFixed(1)} / 5
										</p>
									</div>
								</div>
								<div className='flex flex-wrap gap-2 mb-6'>
									{Array.isArray(team.skills) && team.skills.length > 0 ? (
										team.skills.slice(0, 3).map((skill, index) => (
											<span
												key={index}
												className='px-3 py-1 bg-cyan-600/70 text-white text-xs font-semibold rounded-full hover:bg-cyan-700 transition-all duration-200'
											>
												{skill}
											</span>
										))
									) : (
										<span className='text-gray-400 text-xs'>Без навыков</span>
									)}
								</div>
								{userRole === 'Freelancer' && (
									<div className='flex flex-col gap-3'>
										{!isLeaderOfTeam[team.id] && (
											<motion.button
												onClick={() => openRequestModal(team.id)}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className='w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-md transition-all duration-300'
											>
												Подать заявку
											</motion.button>
										)}
										{isLeaderOfTeam[team.id] && (
											<>
												<motion.button
													onClick={() => fetchBids(team.id)}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													className='w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-md transition-all duration-300'
												>
													Просмотреть заявки
												</motion.button>
												<motion.button
													onClick={() => handleDeleteTeam(team.id)}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													className='w-full bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-md transition-all duration-300'
												>
													Удалить команду
												</motion.button>
											</>
										)}
									</div>
								)}
							</motion.div>
						))}
					</div>
				)}

				{createModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4'
					>
						<motion.div
							initial={{ scale: 0.8, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							className='bg-gray-800/90 backdrop-blur-md p-8 rounded-xl w-full max-w-md shadow-2xl'
						>
							<div className='flex justify-between items-center mb-6'>
								<h2 className='text-2xl font-semibold text-white'>
									Создать команду
								</h2>
								<motion.button
									onClick={() => setCreateModalOpen(false)}
									whileHover={{ scale: 1.2 }}
									whileTap={{ scale: 0.8 }}
									className='text-gray-300 hover:text-white'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</motion.button>
							</div>
							<form onSubmit={handleCreateTeam} className='space-y-6'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Название команды
									</label>
									<input
										type='text'
										value={teamName}
										onChange={e => setTeamName(e.target.value)}
										className='w-full px-4 py-3 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300'
										placeholder='Введите название'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Аватар команды
									</label>
									<input
										type='file'
										onChange={e => setTeamAvatar(e.target.files[0])}
										className='w-full text-gray-300 file:bg-cyan-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 hover:file:bg-cyan-600 transition-all duration-300'
										accept='image/*'
									/>
								</div>
								<div className='flex justify-end gap-3'>
									<motion.button
										type='button'
										onClick={() => setCreateModalOpen(false)}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className='px-6 py-3 bg-gray-700/50 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300'
									>
										Отмена
									</motion.button>
									<motion.button
										type='submit'
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300'
									>
										Создать
									</motion.button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}

				{requestModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4'
					>
						<motion.div
							initial={{ scale: 0.8, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							className='bg-gray-800/90 backdrop-blur-md p-8 rounded-xl w-full max-w-md shadow-2xl'
						>
							<div className='flex justify-between items-center mb-6'>
								<h2 className='text-2xl font-semibold text-white'>
									Заявка на вступление
								</h2>
								<motion.button
									onClick={() => setRequestModalOpen(false)}
									whileHover={{ scale: 1.2 }}
									whileTap={{ scale: 0.8 }}
									className='text-gray-300 hover:text-white'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</motion.button>
							</div>
							<form onSubmit={handleRequestMembership} className='space-y-6'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Роль
									</label>
									<input
										type='text'
										value={requestRole}
										onChange={e => setRequestRole(e.target.value)}
										className='w-full px-4 py-3 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300'
										placeholder='Например, Разработчик'
										required
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Доля бюджета (%)
									</label>
									<input
										type='number'
										value={requestBudgetShare}
										onChange={e => setRequestBudgetShare(e.target.value)}
										className='w-full px-4 py-3 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300'
										min='0'
										max='100'
										step='0.1'
										placeholder='Например, 20'
										required
									/>
								</div>
								<div className='flex justify-end gap-3'>
									<motion.button
										type='button'
										onClick={() => setRequestModalOpen(false)}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className='px-6 py-3 bg-gray-700/50 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300'
									>
										Отмена
									</motion.button>
									<motion.button
										type='submit'
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300'
									>
										Отправить
									</motion.button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}

				{bidsModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4'
					>
						<motion.div
							initial={{ scale: 0.8, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							className='bg-gray-800/90 backdrop-blur-md p-8 rounded-xl w-full max-w-lg'
						>
							<div className='flex justify-between items-center mb-6'>
								<h3 className='text-2xl font-semibold text-white'>
									Заявки на вступление
								</h3>
								<motion.button
									onClick={() => setBidsModalOpen(false)}
									whileHover={{ scale: 1.2 }}
									whileTap={{ scale: 0.8 }}
									className='text-gray-300 hover:text-white'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-6 w-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								</motion.button>
							</div>
							{bids.length === 0 ? (
								<p className='text-gray-400 text-center'>Заявок нет</p>
							) : (
								<div className='space-y-4'>
									{bids.map(bid => (
										<motion.div
											key={bid.id}
											className='bg-gray-700/50 p-4 rounded-lg border border-gray-600'
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.3 }}
										>
											<p className='text-gray-300 mb-1'>
												Фрилансер: {bid.nickname || bid.name || 'Неизвестно'}
											</p>
											<p className='text-gray-300 mb-1'>
												Роль: {bid.comment || 'Не указана'}
											</p>
											<p className='text-gray-300 mb-3'>
												Доля бюджета: {bid.amount || 0}%
											</p>
											<div className='flex gap-3'>
												<motion.button
													onClick={() => handleBid(bid.id, true)}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													className='flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-md transition-all duration-300'
												>
													Принять
												</motion.button>
												<motion.button
													onClick={() => handleBid(bid.id, false)}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													className='flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-md transition-all duration-300'
												>
													Отклонить
												</motion.button>
											</div>
										</motion.div>
									))}
								</div>
							)}
							<div className='flex justify-end mt-6'>
								<motion.button
									onClick={() => setBidsModalOpen(false)}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className='px-6 py-3 bg-gray-700/50 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300'
								>
									Закрыть
								</motion.button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</div>
		</motion.div>
	);
};

export default TeamsPage;
