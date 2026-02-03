import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faCloudSun, faWind, faTemperatureHalf, } from "@fortawesome/free-solid-svg-icons";

type Weather = {
  city: string;
  temp: number;
  wind: number;
  description: string;
};

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //  Convertit ville → coordonnées GPS
  const getCoordinates = async (city: string) => {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    return data.results[0];
  };

  //  Récupère météo
  const fetchWeather = async () => {
    if (!city) return;

    try {
      setLoading(true);
      setError("");

      const location = await getCoordinates(city);
      if (!location) {
        setError("Ville non trouvée");
        setWeather(null);
        return;
      }

      const { latitude, longitude, name } = location;

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = await res.json();

      setWeather({
        city: name,
        temp: data.current_weather.temperature,
        wind: data.current_weather.windspeed,
        description:
          data.current_weather.weathercode < 3
            ? "Ensoleillé"
            : data.current_weather.weathercode < 50
              ? "Nuageux"
              : "Pluie",
      });
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700">
      <div className="bg-white/20 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-full max-w-md text-white">

        <h1 className="text-2xl font-bold text-center mb-6 flex justify-center gap-2">
          <FontAwesomeIcon icon={faCloudSun} />
          Météo App
        </h1>

        {/* Recherche */}
        <div className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex : Goma, Kinshasa, Paris"
            className="flex-1 px-4 py-2 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-blue-300"
          />

          <button
            onClick={fetchWeather}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        {/* Messages */}
        {error && <p className="text-red-200 text-center mt-4">{error}</p>}
        {loading && <p className="text-center mt-4">Chargement...</p>}

        {/* Résultat */}
        {weather && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold">{weather.city}</h2>

            <div className="text-5xl font-bold mt-4">
              <FontAwesomeIcon icon={faTemperatureHalf} />{" "}
              {Math.round(weather.temp)}°C
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              <div className="bg-white/20 p-3 rounded-xl">
                <FontAwesomeIcon icon={faWind} /> Vent
                <p className="font-semibold">{weather.wind} km/h</p>
              </div>

              <div className="bg-white/20 p-3 rounded-xl">
                <FontAwesomeIcon icon={faCloudSun} /> Temps
                <p className="font-semibold">{weather.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
