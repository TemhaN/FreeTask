import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserProfile, getOrders, getReviews } from '../api/api';
import placeholderImage from '../images/placeholder.png';
import { FILE_BASE_URL } from '../api/api';

const ClientPage = ({ token }) => {
	const { id } = useParams();
	const [profile, setProfile] = useState(null);
	const [orders, setOrders] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Получаем профиль клиента
				const profileRes = await getUserProfile(id);
				setProfile(profileRes.data);
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка загрузки данных');
				console.error('Error fetching client data:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen bg-gray-900'>
				<div className='text-white text-xl'>Загрузка...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex justify-center items-center h-screen bg-gray-900'>
				<div className='text-red-400 text-xl'>{error}</div>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className='container mx-auto p-6 bg-gray-900 text-white'
		>
			{/* Профиль клиента */}
			<div className='bg-gray-800 rounded-lg p-6 shadow-md mb-6'>
				<div className='flex items-center gap-4'>
					<img
						src={`${FILE_BASE_URL}${profile.avatarUrl}`}
						alt={`Photo ${profile.avatarUrl}`}
						className='w-24 h-24 rounded-full object-cover'
						onError={e => {
							e.target.src = placeholderImage;
						}}
					/>
					<div>
						<h1 className='text-2xl font-bold'>{profile.name || 'Клиент'}</h1>
						<p className='text-gray-400'>{profile.email}</p>
						<p className='text-gray-400'>{profile.bio}</p>
						<p className='text-gray-400'>{profile.companyName}</p>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default ClientPage;
