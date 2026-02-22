import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import CoachAnalyticsDashboard from './CoachAnalyticsDashboard';
import ClientAnalyticsDashboard from './ClientAnalyticsDashboard';

export default function AnalyticsDashboard() {
    const authContext = useContext(AuthContext);
    const userType = authContext?.userType;

    // Show coach analytics for coaches
    if (userType === 'coach') {
        return <CoachAnalyticsDashboard />;
    }

    // Show client analytics for clients
    return <ClientAnalyticsDashboard />;
}

