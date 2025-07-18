import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
	PaperClipIcon,
	MicrophoneIcon,
	StopIcon,
	ArrowUpIcon,
} from '@heroicons/react/24/solid';

	const MessageInput = ({
		newMessage,
		setNewMessage,
		selectedFile,
		setSelectedFile,
		audioBlob,
		setAudioBlob,
		isRecording,
		recordingTime,
		startRecording,
		stopRecording,
		handleSendMessage,
		editingMessageId,
		setEditingMessageId,
		token,
		chatId,
	}) => {
	const fileInputRef = useRef(null);

	const handleFileChange = e => {
		const file = e.target.files[0];
		console.log('Selected file:', file);
		setSelectedFile(file);
	};

	const handleSubmit = e => {
		e.preventDefault();
		console.log('Submitting form, editingMessageId:', editingMessageId);
		handleSendMessage(e, selectedFile, audioBlob);
	};

	const handleCancelEdit = () => {
		setNewMessage('');
		setEditingMessageId(null);
		setSelectedFile(null);
		setAudioBlob(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	return (
		<motion.form
			onSubmit={handleSubmit}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className='flex p-4 bg-gray-800/50 backdrop-blur-md border-t border-gray-700 items-center gap-2 sm:p-3'
		>
			<input
				type='file'
				accept='image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,video/mp4,video/webm'
				onChange={handleFileChange}
				className='hidden'
				ref={fileInputRef}
			/>
			<motion.button
				type='button'
				onClick={() => fileInputRef.current.click()}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				className='bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition-all duration-300 sm:p-1.5'
				title='Прикрепить файл'
			>
				<PaperClipIcon className='w-5 h-5' />
			</motion.button>
			{isRecording ? (
				<motion.button
					type='button'
					onClick={stopRecording}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all duration-300 sm:p-1.5 flex items-center gap-1'
					title='Остановить запись'
				>
					<StopIcon className='w-5 h-5' />
					<span className='text-xs'>{recordingTime}s</span>
				</motion.button>
			) : (
				<motion.button
					type='button'
					onClick={startRecording}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition-all duration-300 sm:p-1.5'
					title='Записать голосовое'
				>
					<MicrophoneIcon className='w-5 h-5' />
				</motion.button>
			)}
			<input
				type='text'
				value={newMessage}
				onChange={e => setNewMessage(e.target.value)}
				className='flex-1 p-2 bg-gray-900/50 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 sm:p-1.5 sm:text-sm'
				placeholder={
					editingMessageId
						? 'Редактировать сообщение...'
						: 'Напишите сообщение...'
				}
				disabled={isRecording}
			/>
			{(selectedFile || audioBlob) && (
				<span className='text-sm text-gray-400 truncate max-w-xs sm:text-xs'>
					{selectedFile ? selectedFile.name : 'Голосовое сообщение готово'}
				</span>
			)}
			{editingMessageId ? (
				<>
					<motion.button
						type='submit'
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 sm:px-3 sm:py-1.5 sm:text-sm'
					>
						Сохранить
					</motion.button>
					<motion.button
						type='button'
						onClick={handleCancelEdit}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 sm:px-3 sm:py-1.5 sm:text-sm'
					>
						Отмена
					</motion.button>
				</>
			) : (
				<motion.button
					type='submit'
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 sm:px-3 sm:py-1.5 sm:text-sm'
					disabled={isRecording}
				>
					<ArrowUpIcon className='w-5 h-5' />
				</motion.button>
			)}
		</motion.form>
	);
};

export default MessageInput;
