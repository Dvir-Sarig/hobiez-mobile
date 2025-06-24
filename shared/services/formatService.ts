import { format } from "date-fns";
import dayjs from 'dayjs';

export const formatLessonTimeReadable = (time: string) => {
    const date = new Date(time);
    // Get the exact time components
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Create a new date with the exact time components
    const exactDate = new Date(year, month, day, hours, minutes);
    return format(exactDate, "dd MMM yyyy, HH:mm");
};

export const formatPrice = (price: number) => {
    return `₪${price.toFixed(2)}`;
};
