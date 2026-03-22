/**
 * API client for handling appointment bookings
 */

export interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  address: string;
  date_time: string;
  duration: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Book an appointment by sending data to the backend API
 * @param appointmentData - The appointment data to submit
 * @returns Promise with API response
 */
export async function bookAppointment(appointmentData: AppointmentData): Promise<ApiResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3008';
    const response = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || 'Appointment booked successfully',
    };
  } catch (error) {
    console.error('Failed to book appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Validate appointment data before submission
 * @param data - The appointment data to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateAppointmentData(data: AppointmentData): string[] {
  const errors: string[] = [];

  // Required field validation
  if (!data.name.trim()) {
    errors.push('Name is required');
  }

  if (!data.email.trim()) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.push('Email is invalid');
  }

  if (!data.phone.trim()) {
    errors.push('Phone number is required');
  }

  if (!data.address.trim()) {
    errors.push('Address is required');
  }

  if (!data.date_time) {
    errors.push('Date and time are required');
  }

  if (!data.duration) {
    errors.push('Duration is required');
  } else {
    const duration = parseInt(data.duration, 10);
    if (isNaN(duration) || duration < 15) {
      errors.push('Duration must be at least 15 minutes');
    }
  }

  return errors;
}