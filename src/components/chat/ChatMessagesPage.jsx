import React, { useRef, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import ContextMenu from './ContextMenu';
import DeleteConfirmModal from './DeleteConfirmModal';
import Toast from './Toast';
import CheckoutForm from './OrderActions';
import useChatData from '../../hooks/useChatData';
import useSignalR from '../../hooks/useSignalR';
import useMedia from '../../hooks/useMedia';
import { getOrder, sendMessage } from '../../api/api';

const stripePromise = loadStripe(
	'pk_test_51RcApbRhoL0HJTfMUe9XTThFDogcuESuhBRlGktNVPLq0pZ8b185dlJhxSSF8LbHWRkMitNXdMaT7I5zaKjj1CAS002IKdIkq8'
);

const ChatMessagesPage = ({ userId, token }) => {
	const { chatId } = useParams();
	const fileInputRef = useRef(null);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const {
		messages,
		setMessages,
		order,
		setOrder,
		freelancer,
		client,
		userRole,
		paymentStatus,
		setPaymentStatus,
		invoice,
		setInvoice,
		isLoading,
		error,
		setError,
		hasMore,
		fetchMoreMessages,
		timeLeft,
	} = useChatData(token, chatId, userId);

	const {
		isTyping,
		editingMessageId,
		setEditingMessageId,
		newMessage,
		setNewMessage,
		handleEditMessage,
		handleDeleteMessage,
		confirmDeleteMessage,
		contextMenu,
		setContextMenu,
		showDeleteConfirm,
		setShowDeleteConfirm,
		handleSendMessage,
	} = useSignalR(token, chatId, userId, messages, setMessages, setError);

	const {
		selectedFile,
		setSelectedFile,
		audioBlob,
		setAudioBlob,
		isRecording,
		recordingTime,
		handleFileChange,
		startRecording,
		stopRecording,
		toast,
		setToast,
	} = useMedia();

	const handleOrderActionComplete = action => {
		if (action === 'OrderAccepted') {
			setOrder(prev => ({
				...prev,
				status: 'InProgress',
				freelancerId: userId,
			}));
			setToast('Заказ успешно принят');
		} else if (action === 'OrderCompleted') {
			setOrder(prev => ({ ...prev, status: 'Completed' }));
			setToast('Заказ успешно завершен');
		} else if (action === 'OrderDeclined' || action === 'OrderCancelled') {
			setOrder(prev => ({ ...prev, status: 'Cancelled', freelancerId: null }));
			setToast('Заказ отменен');
		} else if (action === 'OrderPaid') {
			setPaymentStatus('Paid');
			setToast('Платеж успешно выполнен');
		} else if (action === 'InvoiceCreated') {
			setPaymentStatus('Pending');
			setToast('Счет успешно выставлен');
			getOrder(order.id, token).then(res => {
				setOrder(res.data);
				const activeInvoice = res.data.invoices?.find(
					i => i.status === 'Pending' || i.status === 'Paid'
				);
				if (activeInvoice) {
					setInvoice(activeInvoice);
					setPaymentStatus(activeInvoice.status);
				}
			});
		}
	};

	const formatField = useCallback(value => {
		return value && value.trim() !== 'вфывфвф' ? value : 'Не указано';
	}, []);

	const formatDate = useCallback(dateString => {
		if (!dateString) return 'Не указан';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return 'Не указан';
		return date.toLocaleString('ru-RU', {
			timeZone: 'Asia/Yekaterinburg',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	}, []);

	const isValidUrl = useCallback(string => {
		try {
			const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
			return urlPattern.test(string) && string.includes('.');
		} catch (e) {
			return false;
		}
	}, []);

	if (isLoading) {
		return (
			<div className='flex justify-center items-center min-h-[600px]'>
				Загрузка...
			</div>
		);
	}

	if (userRole && userRole !== 'Freelancer' && userRole !== 'Client') {
		return (
			<div className='text-red-400 text-center min-h-[600px]'>
				Только фрилансеры или клиенты могут просматривать чат
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-gradient-to-b bg-gray-900 min-h-[850px] max-h-[80vh] flex flex-col rounded-xl shadow-lg mx-auto max-w-5xl my-8 overflow-y-auto'
		>
			<ChatHeader
				order={order}
				userRole={userRole}
				freelancer={freelancer}
				client={client}
				timeLeft={timeLeft}
				paymentStatus={paymentStatus}
				userId={userId}
				chatId={chatId}
				token={token}
				onActionComplete={handleOrderActionComplete}
				invoice={invoice}
				setMessages={setMessages}
				formatField={formatField}
				formatDate={formatDate}
			/>
			<MessagesList
				messages={messages}
				userId={userId}
				isTyping={isTyping}
				hasMore={hasMore}
				isLoading={isLoading}
				fetchMoreMessages={fetchMoreMessages}
				setContextMenu={setContextMenu}
				isValidUrl={isValidUrl}
				formatDate={formatDate}
			/>
			<MessageInput
				newMessage={newMessage}
				setNewMessage={setNewMessage}
				selectedFile={selectedFile}
				setSelectedFile={setSelectedFile}
				audioBlob={audioBlob}
				setAudioBlob={setAudioBlob}
				isRecording={isRecording}
				recordingTime={recordingTime}
				handleFileChange={handleFileChange}
				startRecording={startRecording}
				stopRecording={stopRecording}
				handleSendMessage={handleSendMessage}
				editingMessageId={editingMessageId}
				setEditingMessageId={setEditingMessageId}
				token={token}
				chatId={chatId}
				fileInputRef={fileInputRef}
			/>
			<ContextMenu
				contextMenu={contextMenu}
				setContextMenu={setContextMenu}
				handleEditMessage={handleEditMessage}
				handleDeleteMessage={handleDeleteMessage}
			/>
			<DeleteConfirmModal
				showDeleteConfirm={showDeleteConfirm}
				setShowDeleteConfirm={setShowDeleteConfirm}
				confirmDeleteMessage={confirmDeleteMessage}
			/>
			<Toast message={toast} setMessage={setToast} />
			<AnimatePresence>
				{showPaymentModal && invoice && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
						onClick={() => setShowPaymentModal(false)}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className='bg-gray-800/50 backdrop-blur-md p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-600'
							onClick={e => e.stopPropagation()}
						>
							<h3 className='font-semibold mb-4 text-lg text-white'>
								Оплатить заказ
							</h3>
							<Elements stripe={stripePromise}>
								<CheckoutForm
									invoice={invoice}
									token={token}
									orderId={order.id}
									onActionComplete={handleOrderActionComplete}
									setMessages={setMessages}
									sendSystemMessage={message => {
										const actionId = `pay_${order.id}_${Date.now()}`;
										sendMessage(token, chatId, {
											content: message,
											isVoice: false,
											attachment: null,
										}).then(response => {
											setMessages(prev => [...prev, response.data]);
										});
									}}
								/>
							</Elements>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setShowPaymentModal(false)}
								className='mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg w-full hover:bg-gray-700 transition-all duration-300'
							>
								Отмена
							</motion.button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default ChatMessagesPage;
