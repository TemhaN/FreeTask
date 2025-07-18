import React from 'react';

const Notifications = ({ notifications, onMarkAsRead }) => {
	return (
		<div>
			{notifications.map(notification => (
				<div
					key={notification.Id}
					className='border p-4 mb-4 rounded flex justify-between'
				>
					<div>
						<p>{notification.Content}</p>
						<p>{new Date(notification.CreatedAt).toLocaleString()}</p>
						<p>{notification.IsRead ? 'Прочитано' : 'Непрочитано'}</p>
					</div>
					{!notification.IsRead && (
						<button
							onClick={() => onMarkAsRead(notification.Id)}
							className='bg-blue-500 text-white px-4 py-2 rounded'
						>
							Прочитать
						</button>
					)}
				</div>
			))}
		</div>
	);
};

export default Notifications;
