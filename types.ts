export type RootStackParamList = {
    LandingPage: undefined;
    SignIn: undefined;
    SignUp: { role: 'client' | 'coach' };
  
    MainDrawer: { 
      screen?: string; 
      userType?: string;
      params?: {
        coachId?: number;
        clientId?: number;
      };
    }; 
  
    CoachProfile: { coachId: number };
    ClientProfile: { userId: number };
    CoachProfilePage: { coachId: number };
    ClientProfilePage: { clientId: number };
    CreateClientProfile: undefined;
    CreateCoachProfile: undefined;
    ClientCalendar: undefined;
    CoachCalendarView: undefined;
  };
  