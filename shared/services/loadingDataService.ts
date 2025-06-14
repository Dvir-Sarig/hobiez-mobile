import { useState } from 'react';

export interface LoadingDataService {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

export const useLoadingDataService = (): LoadingDataService => {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    return {
        isLoading,
        startLoading,
        stopLoading,
    };
};
