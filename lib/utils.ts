import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
