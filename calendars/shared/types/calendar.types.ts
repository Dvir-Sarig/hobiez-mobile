import { Lesson } from '../../../lesson/types/Lesson';

export interface CalendarEvent extends Lesson {
  start: Date;
  end: Date;
  title: string;
}

export interface CalendarHeaderProps {
  title: string;
  onBack: () => void;
}

export interface CalendarWrapperProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}
