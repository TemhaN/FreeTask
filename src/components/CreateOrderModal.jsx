import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder, createChat, sendMessage } from '../api/api';

const CreateOrderModal = ({
	freelancerId,
	teamId,
	userId,
	token,
	onClose,
	onOrderCreated,
}) => {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		budget: '',
		type: 'Fixed',
		isTurbo: false,
		isAnonymous: false,
		deadline: '',
	});
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const getMinDateTime = () => {
		const now = new Date();
		return now.toISOString().slice(0, 16);
	};

	const handleChange = e => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		if (!formData.title || !formData.description) {
			setError('Заполните название и описание заказа');
			setIsLoading(false);
			return;
		}
		if (
			!formData.budget ||
			isNaN(parseFloat(formData.budget)) ||
			parseFloat(formData.budget) <= 0
		) {
			setError('Укажите корректный бюджет');
			setIsLoading(false);
			return;
		}
		if (formData.isTurbo && !formData.deadline) {
			setError('Для турбо-заказа необходимо указать дедлайн');
			setIsLoading(false);
			return;
		}
		if (formData.deadline) {
			const deadlineDate = new Date(formData.deadline);
			const now = new Date();
			if (deadlineDate < now) {
				setError('Дедлайн не может быть раньше текущего времени');
				setIsLoading(false);
				return;
			}
			if (formData.isTurbo) {
				const maxDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
				if (deadlineDate > maxDeadline) {
					setError(
						'Дедлайн турбо-заказа не может превышать 48 часов от текущего времени'
					);
					setIsLoading(false);
					return;
				}
			}
		}

		try {
			const orderData = {
				...formData,
				teamId: teamId || null,
				freelancerId: freelancerId || null,
				deadline: formData.deadline
					? new Date(formData.deadline).toISOString()
					: null,
				budget: parseFloat(formData.budget),
			};
			const orderResponse = await createOrder(token, orderData);
			const orderId = orderResponse.data.id;

			const chatData = {
				orderId,
				recipientId: freelancerId,
				teamId: teamId || null,
				isGroup: !!teamId,
			};
			const chatResponse = await createChat(token, chatData);
			const chatId = chatResponse.data.id;

			const messageContent = `Здравствуйте! Предлагаю ${
				teamId ? 'вашей команде' : 'вам'
			} заказ "${formData.title}". Подробности: ${
				formData.description
			}. Бюджет: ${formData.budget}₸. Дедлайн: ${
				formData.deadline
					? new Date(formData.deadline).toLocaleString('ru-RU', {
							timeZone: 'Asia/Yekaterinburg',
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
					  })
					: 'не указан'
			}.`;
			await sendMessage(token, chatId, {
				content: messageContent,
				attachment: null,
				isVoice: false,
			});

			onOrderCreated(chatId);
			onClose();
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при создания заказа');
			console.error('Error creating order:', err.response?.data || err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'
				onClick={onClose}
			>
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.95, opacity: 0 }}
					transition={{ duration: 0.3 }}
					className='bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-4xl border border-gray-700 sm:p-5 sm:max-w-lg'
					onClick={e => e.stopPropagation()}
				>
					<div className='flex justify-between items-center mb-6'>
						<h2 className='text-3xl font-bold text-white sm:text-2xl'>
							Создать заказ
						</h2>
						<motion.button
							onClick={onClose}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='text-gray-400 hover:text-white'
						>
							<svg
								className='w-8 h-8 sm:w-6 sm:h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</motion.button>
					</div>
					{error && (
						<motion.p
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className='text-red-400 bg-red-950/30 p-3 rounded-md mb-6 text-base sm:text-sm'
						>
							{error}
						</motion.p>
					)}
					<form
						onSubmit={handleSubmit}
						className='grid grid-cols-1 lg:grid-cols-2 gap-6'
					>
						{/* Left Column */}
						<div className='space-y-6'>
							<div>
								<label className='block text-white font-bold text-lg sm:text-base mb-2'>
									Название
								</label>
								<input
									type='text'
									name='title'
									value={formData.title}
									onChange={handleChange}
									className='w-full p-4 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg sm:p-3 sm:text-base'
									required
								/>
							</div>
							<div>
								<label className='block text-white font-bold text-lg sm:text-base mb-2'>
									Описание
								</label>
								<textarea
									name='description'
									value={formData.description}
									onChange={handleChange}
									className='w-full p-4 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg sm:p-3 sm:text-base'
									rows='6'
									required
								/>
							</div>
							<div className='space-y-4'>
								<div className='flex items-center gap-3'>
									<input
										type='checkbox'
										name='isTurbo'
										checked={formData.isTurbo}
										onChange={handleChange}
										className='h-6 w-6 text-cyan-500 accent-cyan-500 focus:ring-cyan-500 border-gray-600 rounded sm:h-5 sm:w-5'
									/>
									<label className='text-white text-lg sm:text-base'>
										Турбо-заказ (срочный, до 48 часов)
									</label>
								</div>
								<div className='flex items-center gap-3'>
									<input
										type='checkbox'
										name='isAnonymous'
										checked={formData.isAnonymous}
										onChange={handleChange}
										className='h-6 w-6 text-cyan-500 accent-cyan-500 focus:ring-cyan-500 border-gray-600 rounded sm:h-5 sm:w-5'
									/>
									<label className='text-white text-lg sm:text-base'>
										Анонимный заказ
									</label>
								</div>
							</div>
						</div>
						{/* Right Column */}
						<div className='space-y-6'>
							<div>
								<label className='block text-white font-bold text-lg sm:text-base mb-2'>
									Бюджет (₸)
								</label>
								<input
									type='number'
									name='budget'
									value={formData.budget}
									onChange={handleChange}
									className='w-full p-4 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg sm:p-3 sm:text-base'
									required
									min='0'
									step='0.01'
								/>
							</div>
							<div>
								<label className='block text-white font-bold text-lg sm:text-base mb-2'>
									Тип
								</label>
								<select
									name='type'
									value={formData.type}
									onChange={handleChange}
									className='w-full p-4 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg sm:p-3 sm:text-base'
								>
									<option value='Fixed'>Фиксированная цена</option>
									<option value='Hourly'>Почасовая</option>
									<option value='Anonymous'>Анонимный</option>
									<option value='Contest'>Конкурс</option>
								</select>
							</div>
							<div>
								<label className='block text-white font-bold text-lg sm:text-base mb-2'>
									Дедлайн
								</label>
								<input
									type='datetime-local'
									name='deadline'
									value={formData.deadline}
									onChange={handleChange}
									min={getMinDateTime()}
									className='w-full p-4 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg sm:p-3 sm:text-base'
								/>
								{formData.isTurbo && (
									<p className='text-gray-400 text-sm mt-2 sm:text-xs'>
										Турбо-заказ: дедлайн не более 48 часов.
									</p>
								)}
							</div>
						</div>
						{/* Button */}
						<div className='lg:col-span-2 mt-6'>
							<motion.button
								type='submit'
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`w-full px-6 py-3 rounded-lg text-white text-lg sm:px-4 sm:py-2 sm:text-base ${
									isLoading
										? 'bg-gray-600 cursor-not-allowed'
										: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
								}`}
								disabled={isLoading}
							>
								{isLoading ? 'Создание...' : 'Создать заказ'}
							</motion.button>
						</div>
					</form>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default CreateOrderModal;
