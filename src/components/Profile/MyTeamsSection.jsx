import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTeams } from '../../api/api';
import { FILE_BASE_URL } from '../../api/api';
import placeholderImage from '../../images/placeholder.png';
import LoadingSpinner from '../LoadingSpinner';

const MyTeamsSection = ({ userId, token }) => {
	const navigate = useNavigate();
	const [teams, setTeams] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchMyTeams = async () => {
			setLoading(true);
			try {
				const res = await getTeams({});
				const myTeams = res.data.filter(team => team.leaderId === userId);
				setTeams(myTeams);
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка загрузки команд');
				console.error('Error fetching teams:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchMyTeams();
	}, [userId, token]);

	if (loading) {
		return (
			<div className='bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg p-6 mt-8 flex justify-center'>
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg p-6 mt-8'
		>
			<h3 className='text-2xl font-bold text-white mb-6'>Мои команды</h3>
			{error && <p className='text-red-400 mb-4 text-center'>{error}</p>}
			{teams.length === 0 ? (
				<p className='text-gray-400 text-center'>
					Вы не являетесь лидером ни одной команды
				</p>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{teams.map(team => (
						<div
							key={team.id}
							className='bg-gray-700 rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300'
						>
							<div className='flex items-center gap-4 mb-4'>
								<img
									src={
										team.avatarUrl
											? `${FILE_BASE_URL}${team.avatarUrl}`
											: placeholderImage
									}
									alt={team.name}
									className='w-16 h-16 rounded-full object-cover ring-2 ring-cyan-500'
									onError={e => (e.target.src = placeholderImage)}
								/>
								<div>
									<h4
										className='text-lg font-semibold text-white cursor-pointer hover:text-cyan-400'
										onClick={() => navigate(`/team/${team.id}`)}
									>
										{team.name || 'Без имени'}
									</h4>
									<p className='text-gray-400 text-sm'>
										Рейтинг: {(team.rating || 0).toFixed(1)} / 5
									</p>
								</div>
							</div>
							<div className='flex flex-wrap gap-2 mb-4'>
								{Array.isArray(team.skills) && team.skills.length > 0 ? (
									team.skills.slice(0, 3).map((skill, index) => (
										<span
											key={index}
											className='px-2 py-1 bg-cyan-600 text-white text-xs rounded-full'
										>
											{skill}
										</span>
									))
								) : (
									<span className='text-gray-400 text-xs'>Без навыков</span>
								)}
							</div>
							<motion.button
								onClick={() => navigate(`/team/${team.id}`)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className='w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-md font-semibold hover:shadow-lg transition-all duration-300'
							>
								Перейти к команде
							</motion.button>
						</div>
					))}
				</div>
			)}
		</motion.div>
	);
};

export default MyTeamsSection;
