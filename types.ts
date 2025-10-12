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
        lessonId?: number; // for opening specific lesson via notification
        reopenRegistrationModal?: boolean; // client lesson modal
        openCoachLessonModal?: boolean;
        focusRegistered?: boolean; // focus registered tab
        scrollToLessonId?: number; // scroll to lesson in registered list after update
      };
    }; 
  
    CoachProfile: { coachId: string };
    ClientProfile: { userId: string };
    CoachProfilePage: { 
      coachId: string; 
      fromRegistrationModal?: boolean; 
      fromUnregisterModal?: boolean; 
      lessonId?: number;
      originScreen?: string; // e.g. 'ClientCalendar', 'SearchLessons'
      weekAnchorDate?: string; // ISO date to restore calendar anchor
      selectedDate?: string; // ISO date for precise selected day restoration
    };
    ClientProfilePage: { clientId: string };
    CreateClientProfile: undefined;
    CreateCoachProfile: undefined;
    ClientCalendar: undefined;
    CoachCalendarView: undefined;
  };
