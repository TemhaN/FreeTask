import React, { useState } from 'react';
import { addFavorite } from '../api/api';

const FavoriteButton = ({
	freelancerId,
	teamId,
	userId,
	userRole,
	token,
	isFavorited: initialIsFavorited,
	onToggle,
}) => {
	const [isFavorited, setIsFavorited] = useState(initialIsFavorited || false);
	const [isLoading, setIsLoading] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	const handleToggleFavorite = async e => {
		e.stopPropagation(); // Предотвращаем всплытие события
		if (isAnimating || !userId || userRole !== 'Client' || !token) return;
		setIsLoading(true);
		setIsAnimating(true);
		try {
			const payload = freelancerId
				? { freelancerId, teamId: null }
				: { teamId, freelancerId: null };
			console.log('Toggling favorite with payload:', payload);
			const res = await addFavorite(payload, token);
			console.log('Toggle favorite response:', res.data);
			setIsFavorited(prev => !prev);
			onToggle?.();
		} catch (err) {
			console.error('Error toggling favorite:', err.response?.data || err);
		} finally {
			setIsLoading(false);
			setTimeout(() => setIsAnimating(false), 400);
		}
	};

	if (!userId || userRole !== 'Client') {
		console.log('FavoriteButton hidden:', { userId, userRole });
		return null;
	}

	return (
		<button
			onClick={handleToggleFavorite}
			className={`focus:outline-none rounded-full p-2 bg-gray-700/50 z-35 ${
				isLoading || isAnimating ? 'opacity-50 cursor-not-allowed' : ''
			}`}
			disabled={isLoading || isAnimating}
		>
			<svg
				className={`w-6 h-6 ${isFavorited ? 'fill-red-500' : 'fill-gray-600'} ${
					isAnimating ? 'animate-pulse-heart' : ''
				}`}
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 24 24'
			>
				<path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
			</svg>
			<style>{`
        @keyframes pulse-heart {
          0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255, 0, 0, 0)); }
          50% { transform: scale(1.4); filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.5)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255, 0, 0, 0)); }
        }
        .animate-pulse-heart {
          animation: pulse-heart 200ms ease-in-out;
        }
      `}</style>
		</button>
	);
};

export default FavoriteButton;
