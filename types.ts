export type RootStackParamList = {
    LandingPage: undefined;
    SignIn: undefined;
    SignUp: { role: 'client' | 'coach' };
  
    MainDrawer: { 
      screen?: string; 
      userType?: string;
      params?: {
        coachId?: string;
        clientId?: string;
      };
    }; 
  
    CoachProfile: { coachId: string };
    ClientProfile: { userId: string };
    CoachProfilePage: { coachId: string; fromRegistrationModal?: boolean; fromUnregisterModal?: boolean; lessonId?: number };
    ClientProfilePage: { clientId: string };
    CreateClientProfile: undefined;
    CreateCoachProfile: undefined;
    ClientCalendar: undefined;
    CoachCalendarView: undefined;
  };
  