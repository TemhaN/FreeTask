import React, { useRef, useEffect, memo } from 'react';
import { FILE_BASE_URL } from '../api/api';
import { debounce } from 'lodash';

const MessageItem = memo(
	({
		msg,
		userId,
		isValidUrl,
		formatDate,
		renderAttachment,
		handleContextMenu,
	}) => {
		console.log(`MessageItem ${msg.id} rendered`);
		return (
			<div
				className={`flex ${
					msg.senderId === userId ? 'justify-end' : 'justify-start'
				}`}
				onContextMenu={
					msg.senderId === userId ? e => handleContextMenu(e, msg.id) : null
				}
			>
				<div
					className={`max-w-xs p-3 rounded-lg ${
						msg.senderId === userId
							? 'bg-blue-500 text-white'
							: 'bg-white text-black border border-gray-300'
					}`}
				>
					{msg.content && isValidUrl(msg.content) ? (
						<p>
							<a
								href={
									msg.content.startsWith('http')
										? msg.content
										: `https://${msg.content}`
								}
								target='_blank'
								rel='noopener noreferrer'
								className={`underline ${
									msg.senderId === userId ? 'text-blue-200' : 'text-blue-600'
								}`}
							>
								{msg.content}
							</a>{' '}
							{msg.isEdited && (
								<span className='text-xs opacity-75'>(ред.)</span>
							)}
						</p>
					) : (
						msg.content && (
							<p>
								{msg.content}{' '}
								{msg.isEdited && (
									<span className='text-xs opacity-75'>(ред.)</span>
								)}
							</p>
						)
					)}
					{renderAttachment(msg)}
					<p className='text-xs mt-1 opacity-75'>{formatDate(msg.sentAt)}</p>
				</div>
			</div>
		);
	}
);

const MessagesList = ({
	messages,
	userId,
	isTyping,
	hasMore,
	isLoading,
	fetchMoreMessages,
	handleContextMenu,
	formatDate,
	isValidUrl,
}) => {
	const messagesContainerRef = useRef(null);
	const messagesEndRef = useRef(null);
	const isFetchingMore = useRef(false);
	const prevScrollHeight = useRef(0);
	const lastMessageId = useRef(null);

	console.log('MessagesList rendered');

	const renderAttachment = msg => {
		if (!msg.attachmentUrl) return null;
		const extension = msg.attachmentUrl.split('.').pop().toLowerCase();
		const fileUrl = `${FILE_BASE_URL}${msg.attachmentUrl}`;

		if (['jpg', 'jpeg', 'png'].includes(extension)) {
			return (
				<img
					src={fileUrl}
					alt='Attachment'
					className='mt-2 max-w-full rounded'
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
				<video controls className='mt-2 max-w-full rounded'>
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
					className='mt-2 text-blue-500 underline'
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
				className='mt-2 text-blue-500 underline'
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
			console.log('Triggering fetchMoreMessages');
			isFetchingMore.current = true;
			prevScrollHeight.current = container.scrollHeight;
			fetchMoreMessages();
		}
	}, 200);

	useEffect(() => {
		const container = messagesContainerRef.current;
		if (container && messages.length > 0) {
			const latestMessageId = messages[messages.length - 1].id;

			if (isFetchingMore.current) {
				const newScrollTop = container.scrollHeight - prevScrollHeight.current;
				container.scrollTop = newScrollTop;
				console.log('Restored scroll position after fetch:', newScrollTop);
				isFetchingMore.current = false;
			} else if (lastMessageId.current !== latestMessageId) {
				container.scrollTop = container.scrollHeight;
				console.log('Scrolled to bottom due to new message');
				lastMessageId.current = latestMessageId;
			}
		}
	}, [messages]);

	return (
		<div
			className='flex-1 overflow-y-auto p-4 flex flex-col space-y-4'
			ref={messagesContainerRef}
			onScroll={handleScroll}
			style={{ transition: 'none' }}
		>
			{messages.map(msg => (
				<MessageItem
					key={msg.id}
					msg={msg}
					userId={userId}
					isValidUrl={isValidUrl}
					formatDate={formatDate}
					renderAttachment={renderAttachment}
					handleContextMenu={handleContextMenu}
				/>
			))}
			{isTyping && <div className='text-gray-500 text-sm p-2'>Печатает...</div>}
			<div ref={messagesEndRef} />
		</div>
	);
};

export default memo(MessagesList);
