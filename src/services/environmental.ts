/**
 * Represents environmental readings, including temperature and humidity.
 */
export interface EnvironmentalData {
  /**
   * The temperature in Celsius.
   */
  temperatureCelsius: number;
  /**
   * The relative humidity (percentage).
   */
  humidity: number;
}

/**
 * Asynchronously retrieves current environmental data.
 *
 * @returns A promise that resolves to an EnvironmentalData object containing temperature and humidity.
 */
export async function getCurrentEnvironmentalData(): Promise<EnvironmentalData> {
  // TODO: Implement this by calling an API.

  return {
    temperatureCelsius: 25 + Math.random() * 5,
    humidity: 60 + Math.random() * 10,
  };
}

/**
 * Represents historical environmental data with timestamp.
 */
export interface HistoricalEnvironmentalData extends EnvironmentalData {
  /**
   * The timestamp of the reading.
   */
  timestamp: string;
}

/**
 * Asynchronously retrieves historical environmental data for a given period.
 *
 * @param period The period for which to retrieve historical data (e.g., 'daily', 'weekly', 'monthly').
 * @returns A promise that resolves to an array of HistoricalEnvironmentalData objects.
 */
export async function getHistoricalEnvironmentalData(period: string): Promise<HistoricalEnvironmentalData[]> {
  // TODO: Implement this by calling an API.

  const now = new Date();
  const baseTemperature = 20;
  const baseHumidity = 50;
  const numPoints = 30; // Number of data points for the trend

  const data: HistoricalEnvironmentalData[] = [];
  for (let i = 0; i < numPoints; i++) {
    const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
    const temperature = baseTemperature + Math.sin(i * 0.2) * 10 + Math.random() * 2; // Sinusoidal temperature variation
    const humidity = baseHumidity + Math.cos(i * 0.3) * 15 + Math.random() * 5; // Cosine humidity variation

    data.push({
      temperatureCelsius: temperature,
      humidity: humidity,
      timestamp: time,
    });
  }

  return data.reverse(); // Return the data in chronological order
}
