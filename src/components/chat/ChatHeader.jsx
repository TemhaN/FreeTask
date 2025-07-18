import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	ArrowLeftIcon,
	UserIcon,
	CreditCardIcon,
} from '@heroicons/react/24/solid';
import OrderActions from './OrderActions';
import { FILE_BASE_URL } from '../../api/api';

const ChatHeader = ({
	order,
	userRole,
	freelancer,
	client,
	timeLeft,
	paymentStatus,
	userId,
	chatId,
	token,
	onActionComplete,
	invoice,
	setMessages,
	formatField,
	formatDate,
}) => {
	const navigate = useNavigate();
	const [showPaymentModal, setShowPaymentModal] = useState(false);

	const togglePaymentModal = () => {
		setShowPaymentModal(prev => !prev);
	};

	if (!order) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className='sticky top-0 z-10 bg-gray-900/50 backdrop-blur-lg shadow-lg p-6 border-b border-gray-700 sm:p-4'
		>
			<div className='flex flex-col gap-6 max-w-5xl mx-auto'>
				{/* Back Button */}
				<motion.button
					onClick={() => navigate(-1)}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-all duration-300 w-fit sm:text-sm'
				>
					<ArrowLeftIcon className='w-5 h-5' />
					Назад
				</motion.button>

				{/* User Profile */}
				<div className='flex flex-col gap-4'>
					{userRole === 'Client' && freelancer && (
						<motion.div
							whileHover={{ scale: 1.02 }}
							className='flex items-center gap-4 bg-gray-800/50 rounded-lg p-3 sm:p-2'
						>
							{freelancer.avatarUrl ? (
								<img
									src={`${FILE_BASE_URL}${freelancer.avatarUrl}`}
									alt='Freelancer Avatar'
									className='w-14 h-14 rounded-full ring-2 ring-cyan-500 object-cover hover:ring-4 transition-all duration-300 sm:w-12 sm:h-12'
								/>
							) : (
								<div className='w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-cyan-500 hover:ring-4 transition-all duration-300 sm:w-12 sm:h-12'>
									<UserIcon className='w-7 h-7 text-white sm:w-6 sm:h-6' />
								</div>
							)}
							<div>
								<p className='font-semibold text-white text-base sm:text-sm'>
									{freelancer.name || 'Без имени'}
								</p>
								<button
									onClick={() => navigate(`/user/${freelancer.id}`)}
									className='text-cyan-400 hover:text-cyan-300 text-sm sm:text-xs transition-all duration-300'
								>
									Перейти к профилю
								</button>
							</div>
						</motion.div>
					)}
					{userRole === 'Freelancer' && (
						<motion.div
							whileHover={{ scale: 1.02 }}
							className='flex items-center gap-4 bg-gray-800/50 rounded-lg p-3 sm:p-2'
						>
							{order.isAnonymous ? (
								<div>
									<p className='font-semibold text-white text-base sm:text-sm'>
										Аноним
									</p>
									<p className='text-gray-400 text-sm sm:text-xs'>
										Заказчик скрыл свои данные
									</p>
								</div>
							) : (
								client && (
									<>
										{client.avatarUrl ? (
											<img
												src={`${FILE_BASE_URL}${client.avatarUrl}`}
												alt='Client Avatar'
												className='w-14 h-14 rounded-full ring-2 ring-cyan-500 object-cover hover:ring-4 transition-all duration-300 sm:w-12 sm:h-12'
											/>
										) : (
											<div className='w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-cyan-500 hover:ring-4 transition-all duration-300 sm:w-12 sm:h-12'>
												<UserIcon className='w-7 h-7 text-white sm:w-6 sm:h-6' />
											</div>
										)}
										<div>
											<p className='font-semibold text-white text-base sm:text-sm'>
												{client.name || 'Без имени'}
											</p>
											<button
												onClick={() => navigate(`/client/${client.id}`)}
												className='text-cyan-400 hover:text-cyan-300 text-sm sm:text-xs transition-all duration-300'
											>
												Перейти к профилю
											</button>
										</div>
									</>
								)
							)}
						</motion.div>
					)}
				</div>

				{/* Order Info */}
				<div className='flex flex-col gap-4 bg-gray-800/50 rounded-lg p-4 shadow-md sm:p-3'>
					<h2 className='text-2xl font-bold text-white sm:text-xl'>
						{formatField(order.title)}
					</h2>
					<p className='text-gray-300 text-sm sm:text-xs'>
						{formatField(order.description)}
					</p>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-xs'>
						<p className='text-gray-200 flex items-center'>
							<span className='font-semibold mr-1'>Бюджет:</span> {order.budget}
							₸
						</p>
						<p className='text-gray-200 flex items-center'>
							<span className='font-semibold mr-1'>Дедлайн:</span>{' '}
							{formatDate(order.deadline)}
						</p>
						<p className='text-red-400 font-semibold flex items-center'>
							<span className='font-semibold mr-1'>Осталось:</span> {timeLeft}
						</p>
						<p className='text-gray-200 flex items-center'>
							<span className='font-semibold mr-1'>Статус:</span>
							<span
								className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
									order.status === 'Open'
										? 'bg-green-500'
										: order.status === 'InProgress'
										? 'bg-yellow-500'
										: 'bg-red-500'
								} text-white`}
							>
								{order.status === 'Open' ? 'Открыт' : order.status}
							</span>
						</p>
						<p className='text-gray-200 flex items-center'>
							<span className='font-semibold mr-1'>Статус платежа:</span>
							<span
								className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
									paymentStatus === 'Pending'
										? 'bg-yellow-500'
										: paymentStatus === 'Paid'
										? 'bg-green-500'
										: 'bg-red-500'
								} text-white`}
							>
								{paymentStatus === 'Pending' ? 'Ожидает оплаты' : paymentStatus}
							</span>
						</p>
						{/* {invoice && (
              <p className="text-gray-200 flex items-center">
                <span className="font-semibold mr-1">Счет:</span> {invoice.amount}₸ (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    invoice.status === 'Pending' ? 'bg-yellow-500' : 'bg-green-500'
                  } text-white`}
                >
                  {invoice.status === 'Pending' ? 'Ожидает оплаты' : invoice.status}
                </span>
                )
              </p>
            )} */}
					</div>
				</div>

				{/* Order Actions */}
				<OrderActions
					orderId={order.id}
					userId={userId}
					token={token}
					onActionComplete={onActionComplete}
					chatId={chatId}
					userRole={userRole}
					orderStatus={order.status}
					paymentStatus={paymentStatus}
					order={order}
					invoice={invoice}
					setMessages={setMessages}
				/>
			</div>
		</motion.div>
	);
};

export default ChatHeader;
