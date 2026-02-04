import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCloudSun,
  faWind,
  faTemperatureHalf
} from "@fortawesome/free-solid-svg-icons";

type Weather = {
  city: string;
  temperature: number;
  wind: number;
  code: number;
};

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Géocodage
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=fr`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("Ville introuvable");
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Météo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        city: `${name}, ${country}`,
        temperature: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
        code: weatherData.current_weather.weathercode
      });
    } catch (err) {
      setError("Ville introuvable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 px-4">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-6 text-white">

        {/* Titre */}
        <h1 className="text-2xl font-bold text-center mb-6 flex justify-center gap-2">
          <FontAwesomeIcon icon={faCloudSun} />
          Application Météo
        </h1>

        {/* Recherche */}
        <div className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex : Paris, Goma, Kinshasa"
            className="flex-1 px-4 py-2 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-300"
          />

          <button
            onClick={fetchWeather}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl transition"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        {/* États */}
        {loading && (
          <p className="text-center mt-4 text-sm opacity-80">
            Chargement...
          </p>
        )}

        {error && (
          <p className="text-center mt-4 text-red-200 text-sm">
            {error}
          </p>
        )}

        {/* Résultat */}
        {weather && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold">{weather.city}</h2>

            <div className="text-5xl font-bold mt-4">
              <FontAwesomeIcon icon={faTemperatureHalf} />{" "}
              {Math.round(weather.temperature)}°C
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              <div className="bg-white/20 rounded-xl p-3">
                <FontAwesomeIcon icon={faWind} /> Vent
                <p className="font-semibold">{weather.wind} km/h</p>
              </div>

              <div className="bg-white/20 rounded-xl p-3">
                <FontAwesomeIcon icon={faTemperatureHalf} /> Température
                <p className="font-semibold">
                  {weather.temperature} °C
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

