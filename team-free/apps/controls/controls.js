import { useSelect } from '@wordpress/data';

export const useDeviceType = () => {
	const { deviceType } = useSelect((select) => {
		const coreEditor = select('core/editor');
		if (!coreEditor?.getDeviceType) {
			return { deviceType: 'Desktop' };
		}
		return { deviceType: coreEditor.getDeviceType() };
	}, []);
	return deviceType || 'Desktop';
};

export const getRandomId = (prefix = '') => {
	const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
	return `${prefix}${randomNumber}`;
};

export const findDataFromArray = (itemsArray, firstKey, secondKey) => {
	return itemsArray?.find((f) => f[firstKey] === secondKey);
};

export const filterSelectOptions = (dataArray, labelKey, valueKey, indexKey = false) => {
	return dataArray?.map((data, index) => ({
		id: indexKey ? data[indexKey] : index,
		label: data[labelKey],
		value:
			typeof data[valueKey] === 'number'
				? data[valueKey]
				: data[valueKey].replace(/\s+/g, '_').toLowerCase(),
	}));
};
