export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: string; // Identificador estável local derivado do resultado.
  name: string; // Nome da localidade retornado pelo geocoding.
  country: string | null; // País, quando fornecido.
  administrativeArea: string | null; // Região administrativa (admin1), quando fornecida.
  latitude: number; // Latitude usada na consulta meteorológica.
  longitude: number; // Longitude usada na consulta meteorológica.
  timezone: string | null; // Fuso IANA da cidade, quando fornecido.
}

export interface CurrentWeather {
  time: string | null; // Horário local da observação, quando fornecido.
  temperatureC: number | null; // Temperatura atual normalizada para Celsius.
  weatherCode: number | null; // Código WMO usado para obter a descrição localizada.
  relativeHumidity: number | null; // Umidade relativa em porcentagem.
  windSpeedKmh: number | null; // Velocidade do vento em quilômetros por hora.
  precipitationMm: number | null; // Precipitação em milímetros.
  pressureHpa: number | null; // Pressão atmosférica em hectopascais.
}

export interface ForecastDay {
  date: string; // Data local no formato YYYY-MM-DD.
  weatherCode: number | null; // Código WMO da condição diária.
  temperatureMinC: number | null; // Temperatura mínima diária em Celsius.
  temperatureMaxC: number | null; // Temperatura máxima diária em Celsius.
  precipitationProbability: number | null; // Probabilidade máxima diária de precipitação em porcentagem.
}

export interface WeatherData {
  city: City; // Cidade selecionada à qual estes dados pertencem.
  timezone: string | null; // Fuso retornado pelo endpoint de forecast.
  current: CurrentWeather | null; // Condições atuais, independentemente da previsão.
  forecast: ForecastDay[] | null; // Cinco dias; null quando a seção está indisponível.
}
