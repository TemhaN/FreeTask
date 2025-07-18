import React, { memo } from 'react';
import { FILE_BASE_URL } from '../../api/api';

const MessageItem = memo(
	({
		msg,
		userId,
		isValidUrl,
		formatDate,
		renderAttachment,
		handleContextMenu,
	}) => {
		if (!msg || !msg.id || !msg.senderId) {
			console.warn('Invalid message:', msg);
			return null;
		}

		const onContextMenuHandler = e => {
			e.preventDefault();
			if (msg.senderId === userId) {
				handleContextMenu(e, msg.id);
			}
		};

		return (
			<div
				className={`flex ${
					msg.senderId === userId ? 'justify-end' : 'justify-start'
				}`}
				onContextMenu={onContextMenuHandler}
			>
				<div
					className={`max-w-xs p-3 rounded-lg sm:p-2 sm:max-w-[400px] ${
						msg.senderId === userId
							? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
							: 'bg-gray-800 backdrop-blur-md text-white border border-gray-600'
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
									msg.senderId === userId ? 'text-cyan-200' : 'text-cyan-200'
								} hover:text-cyan-400`}
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
					<p className='text-xs mt-1 opacity-75 sm:text-[10px]'>
						{formatDate(msg.sentAt)}
					</p>
				</div>
			</div>
		);
	}
);

export default MessageItem;
