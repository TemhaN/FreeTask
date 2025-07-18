import React from 'react';
import { reportContent } from '../../api/api';

const PendingReports = ({ reports, token, setError }) => {
	const handleResolveReport = async (reportId, action) => {
		try {
			await reportContent({ ReportId: reportId, Action: action }, token);
			setError(`Жалоба ${reportId} обработана: ${action}`);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка обработки жалобы');
		}
	};

	return (
		<div>
			<h3 className='text-xl font-bold mb-4'>Ожидающие жалобы</h3>
			{reports.map(report => (
				<div key={report.Id} className='border p-4 mb-4 rounded'>
					<p>ID: {report.Id}</p>
					<p>
						Контент: {report.ContentId} ({report.ContentType})
					</p>
					<p>Причина: {report.Reason}</p>
					<p>Дата: {new Date(report.CreatedAt).toLocaleString()}</p>
					<div className='space-x-2'>
						<button
							onClick={() => handleResolveReport(report.Id, 'Reject')}
							className='bg-red-500 text-white px-4 py-2 rounded'
						>
							Отклонить
						</button>
						<button
							onClick={() => handleResolveReport(report.Id, 'Ban')}
							className='bg-yellow-500 text-white px-4 py-2 rounded'
						>
							Забанить
						</button>
						<button
							onClick={() => handleResolveReport(report.Id, 'Warn')}
							className='bg-blue-500 text-white px-4 py-2 rounded'
						>
							Предупредить
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

export default PendingReports;
