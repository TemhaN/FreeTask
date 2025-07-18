import React, { useRef, useEffect, memo } from 'react';
import { debounce } from 'lodash';
import { motion } from 'framer-motion';
import { FILE_BASE_URL } from '../../api/api';
import MessageItem from './MessageItem';

const MessagesList = ({
	messages,
	userId,
	isTyping,
	hasMore,
	isLoading,
	fetchMoreMessages,
	setContextMenu,
}) => {
	const messagesContainerRef = useRef(null);
	const messagesEndRef = useRef(null);
	const isFetchingMore = useRef(false);
	const prevScrollHeight = useRef(0);
	const lastMessageId = useRef(null);

	const isValidUrl = string => {
		try {
			const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
			return urlPattern.test(string) && string.includes('.');
		} catch (e) {
			return false;
		}
	};

	const formatDate = dateString => {
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
	};

	const renderAttachment = msg => {
		if (!msg.attachmentUrl) return null;
		const extension = msg.attachmentUrl.split('.').pop().toLowerCase();
		const fileUrl = `${FILE_BASE_URL}${msg.attachmentUrl}`;

		if (['jpg', 'jpeg', 'png'].includes(extension)) {
			return (
				<img
					src={fileUrl}
					alt='Attachment'
					className='mt-2 max-w-full rounded-lg sm:max-w-[200px]'
					onError={() => console.error('Failed to load image:', fileUrl)}
				/>
			);
		} else if (extension === 'mp3' || msg.isVoice) {
			return (
				<audio controls className='mt-2 w-full'>
					<source src={fileUrl} type='audio/mpeg' />
					Ваш браузер не поддерживает аудио.
				</audio>
			);
		} else if (['mp4', 'mov'].includes(extension)) {
			return (
				<video controls className='mt-2 max-w-full rounded-lg sm:max-w-[200px]'>
					<source src={fileUrl} type={`video/${extension}`} />
					Ваш браузер не поддерживает видео.
				</video>
			);
		} else if (extension === 'pdf') {
			return (
				<a
					href={fileUrl}
					target='_blank'
					rel='noopener noreferrer'
					className='mt-2 text-cyan-400 underline hover:text-cyan-500'
				>
					Открыть PDF
				</a>
			);
		}
		return (
			<a
				href={fileUrl}
				target='_blank'
				rel='noopener noreferrer'
				className='mt-2 text-cyan-400 underline hover:text-cyan-500'
			>
				Скачать файл
			</a>
		);
	};

	const handleScroll = debounce(() => {
		const container = messagesContainerRef.current;
		if (
			container &&
			container.scrollTop === 0 &&
			hasMore &&
			!isLoading &&
			!isFetchingMore.current
		) {
			isFetchingMore.current = true;
			prevScrollHeight.current = container.scrollHeight;
			fetchMoreMessages();
		}
	}, 200);

	useEffect(() => {
		console.log('Messages:', messages);
		const container = messagesContainerRef.current;
		if (container && messages.length > 0) {
			const latestMessageId = messages[messages.length - 1].id;
			if (isFetchingMore.current) {
				const newScrollTop = container.scrollHeight - prevScrollHeight.current;
				container.scrollTop = newScrollTop;
				isFetchingMore.current = false;
			} else if (lastMessageId.current !== latestMessageId) {
				container.scrollTop = container.scrollHeight;
				lastMessageId.current = latestMessageId;
			}
		}
	}, [messages, hasMore, isLoading, fetchMoreMessages]);

	return (
		<div
			className='flex-1 overflow-y-auto p-4 flex bg-gray-900 flex-col space-y-4 bg-gray-400 sm:p-3'
			ref={messagesContainerRef}
			onScroll={handleScroll}
			style={{ transition: 'none' }}
		>
			{messages
				.filter(msg => msg && msg.id && msg.senderId)
				.map((msg, index) => (
					<motion.div
						key={msg.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 }}
					>
						<MessageItem
							msg={msg}
							userId={userId}
							isValidUrl={isValidUrl}
							formatDate={formatDate}
							renderAttachment={renderAttachment}
							handleContextMenu={(e, messageId) =>
								setContextMenu({
									visible: true,
									x: e.clientX,
									y: e.clientY,
									messageId,
								})
							}
						/>
					</motion.div>
				))}
			{isTyping && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='text-gray-500 text-sm p-2 sm:text-xs'
				>
					Печатает...
				</motion.div>
			)}
			<div ref={messagesEndRef} />
		</div>
	);
};

export default memo(MessagesList);
