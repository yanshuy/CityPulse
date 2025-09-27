import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { GlobalUser } from './user-store'
import { VIN_URL } from '@/app/page'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  retryCondition?: (error: any) => boolean
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryCondition = (error) => {
      // Retry on 503 (overloaded), 429 (rate limited), and network errors
      return (
        error?.statusCode === 503 ||
        error?.statusCode === 429 ||
        error?.code === 'NETWORK_ERROR' ||
        error?.isRetryable === true ||
        (error?.message && error.message.includes('overloaded'))
      )
    }
  } = options

  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry on last attempt or if error is not retryable
      if (attempt === maxRetries || !retryCondition(error)) {
        throw error
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      )

      console.warn(`AI API attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms:`, error?.message || error)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results?.length > 0) {
      const result = data.results[0];
      const components = result.address_components;

      // Find relevant components
      const sublocality = components.find(
        (c: any) => c.types.includes('sublocality_level_1')
      )?.long_name;
      const city = components.find(
        (c: any) => c.types.includes('locality')
      )?.long_name;
      // const country = components.find(
      //   (c: any) => c.types.includes('country')
      // )?.long_name;

      // Construct short address
      const parts = [sublocality, city].filter(Boolean);
      return parts.join(', ');
    }
    throw new Error('No address found');
  } catch (error) {
    console.error('Error getting address:', error);
    throw error;
  }
}

/**
 * Send GlobalUser object to the VIN backend server
 * @param user - The GlobalUser object to send
 * @param vinUrl - The VIN server URL (e.g., "https://api.citypulse.ai")
 */
export async function sendUserToVinBackend(user: GlobalUser): Promise<void> {
  try {
    const response = await fetch(`${VIN_URL}/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })

    if (!response.ok) {
      throw new Error(`Failed to send user data to VIN backend: ${response.status} ${response.statusText}`)
    }

    console.log('✅ User data successfully sent to VIN backend')
  } catch (error) {
    console.error('❌ Error sending user data to VIN backend:', error)
    // Don't throw the error to avoid breaking the main flow
    // This is a best-effort operation
  }
}
