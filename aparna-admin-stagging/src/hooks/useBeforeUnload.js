import { useEffect } from 'react';

const useBeforeUnload = (callback) => {
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (callback) {
                callback();
            }
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [callback]);
};

export default useBeforeUnload;
