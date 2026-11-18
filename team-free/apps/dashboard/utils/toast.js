import toast from 'react-hot-toast';

/* Same look as the other ShapedPlugin dashboards (wp-carousel). */
export const toastStyle = {
	marginTop: '28px',
	fontSize: '15px',
	padding: '10px 18px',
};

export const toastSuccessMsg = (message) => toast.success(message, { style: toastStyle });

export const toastErrorMsg = (message) => toast.error(message, { style: toastStyle });
