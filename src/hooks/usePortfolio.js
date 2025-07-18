import { useState } from 'react';
import { addPortfolioItem, deletePortfolioItem } from '../api/api';

export const usePortfolio = ({ profile, setProfile, token }) => {
	const [portfolioFile, setPortfolioFile] = useState(null);
	const [portfolioDescription, setPortfolioDescription] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const addPortfolioItemHandler = async () => {
		if (!portfolioFile) {
			setError('Выберите файл для портфолио');
			return false;
		}
		if (portfolioFile.size > 10 * 1024 * 1024) {
			setError('Файл портфолио не должен превышать 10 МБ');
			return false;
		}
		if (portfolioDescription.length > 1000) {
			setError('Описание не должно превышать 1000 символов');
			return false;
		}

		const formData = new FormData();
		formData.append('File', portfolioFile);
		if (portfolioDescription)
			formData.append('Description', portfolioDescription);

		setIsLoading(true);
		setError('');
		try {
			const res = await addPortfolioItem(formData, token);
			setProfile({
				...profile,
				portfolioItems: [...(profile.portfolioItems || []), res.data],
			});
			setPortfolioFile(null);
			setPortfolioDescription('');
			return true;
		} catch (err) {
			const status = err.response?.status;
			const message =
				err.response?.data?.message || 'Ошибка добавления портфолио';
			if (status === 400) setError(message || 'Лимит портфолио (10 работ)');
			if (status === 401) setError('Неверный токен');
			if (status === 403)
				setError('Только фрилансеры могут добавлять портфолио');
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const deletePortfolioItemHandler = async portfolioId => {
		setIsLoading(true);
		setError('');
		try {
			await deletePortfolioItem(portfolioId, token);
			setProfile({
				...profile,
				portfolioItems: profile.portfolioItems.filter(
					item => item.id !== portfolioId
				),
			});
			return true;
		} catch (err) {
			const status = err.response?.status;
			if (status === 400) setError('Только фрилансеры могут удалять портфолио');
			if (status === 404) setError('Работа не найдена');
			if (status === 401) setError('Неверный токен');
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		portfolioFile,
		portfolioDescription,
		error,
		isLoading,
		setPortfolioFile,
		setPortfolioDescription,
		setError,
		addPortfolioItemHandler,
		deletePortfolioItemHandler,
	};
};
