import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContextMenu = ({
	contextMenu,
	setContextMenu,
	handleEditMessage,
	handleDeleteMessage,
}) => {
	const contextMenuRef = useRef(null);
	const contextMenuTimeoutRef = useRef(null);

	useEffect(() => {
		if (contextMenu.visible) {
			console.log('Context menu opened:', contextMenu);
			contextMenuTimeoutRef.current = setTimeout(() => {
				console.log('Context menu auto-closed after 2s');
				setContextMenu(prev => ({ ...prev, visible: false }));
			}, 2000);
		}
		return () => {
			if (contextMenuTimeoutRef.current) {
				console.log('Clearing timeout on unmount or visibility change');
				clearTimeout(contextMenuTimeoutRef.current);
			}
		};
	}, [contextMenu.visible, setContextMenu]);

	const handleMouseEnter = () => {
		if (contextMenuTimeoutRef.current) {
			console.log('Mouse entered menu, clearing timeout');
			clearTimeout(contextMenuTimeoutRef.current);
		}
	};

	const handleMouseLeave = () => {
		console.log('Mouse left menu, setting 200ms timeout');
		contextMenuTimeoutRef.current = setTimeout(() => {
			console.log('Context menu closed after 200ms');
			setContextMenu(prev => ({ ...prev, visible: false }));
		}, 200);
	};

	return (
		<AnimatePresence>
			{contextMenu.visible && (
				<motion.div
					ref={contextMenuRef}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					className='absolute bg-gray-800/50 backdrop-blur-md border border-gray-600 rounded-lg shadow-lg z-50'
					style={{ top: contextMenu.y, left: contextMenu.x }}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<motion.button
						onClick={handleEditMessage}
						whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
						className='block w-full text-left px-4 py-2 text-white hover:bg-gray-600 rounded-t-lg'
					>
						Редактировать
					</motion.button>
					<motion.button
						onClick={handleDeleteMessage}
						whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
						className='block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 rounded-b-lg'
					>
						Удалить
					</motion.button>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default ContextMenu;
