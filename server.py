from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


HOST = "127.0.0.1"
PORT = 4173
ERCOT_BASE = "https://www.ercot.com/api/1/services/read/dashboards"
OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"
WEATHER_LOCATIONS = [
    {"name": "Dallas", "latitude": 32.7767, "longitude": -96.7970},
    {"name": "Houston", "latitude": 29.7604, "longitude": -95.3698},
    {"name": "Austin", "latitude": 30.2672, "longitude": -97.7431},
    {"name": "San Antonio", "latitude": 29.4241, "longitude": -98.4936},
    {"name": "Midland", "latitude": 31.9973, "longitude": -102.0779},
]
ALLOWED_ERCOT_FILES = {
    "supply-demand.json",
    "daily-prc.json",
    "fuel-mix.json",
    "generation-outages.json",
    "energy-storage-resources.json",
    "system-wide-prices.json",
}


class DashboardHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.startswith("/api/ercot/"):
            self.proxy_ercot()
            return
        if self.path == "/api/weather/current":
            self.proxy_weather()
            return
        if self.path == "/api/weather/forecast":
            self.proxy_weather_forecast()
            return
        super().do_GET()

    def proxy_ercot(self):
        file_name = self.path.removeprefix("/api/ercot/").split("?", 1)[0]
        if file_name not in ALLOWED_ERCOT_FILES:
            self.send_error(404, "Unknown ERCOT endpoint")
            return

        request = Request(
            f"{ERCOT_BASE}/{file_name}",
            headers={
                "Accept": "application/json",
                "User-Agent": "ERCOT-Dashboard-MVP/1.0",
            },
        )

        try:
            with urlopen(request, timeout=15) as response:
                body = response.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
        except HTTPError as error:
            self.send_error(error.code, f"ERCOT returned {error.code}")
        except URLError as error:
            self.send_error(502, f"ERCOT request failed: {error.reason}")
        except TimeoutError:
            self.send_error(504, "ERCOT request timed out")

    def proxy_weather(self):
        results = []
        try:
            for location in WEATHER_LOCATIONS:
                params = urlencode(
                    {
                        "latitude": location["latitude"],
                        "longitude": location["longitude"],
                        "current": "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,wind_gusts_10m",
                        "temperature_unit": "fahrenheit",
                        "wind_speed_unit": "mph",
                        "timezone": "America/Chicago",
                    }
                )
                request = Request(
                    f"{OPEN_METEO_BASE}?{params}",
                    headers={"Accept": "application/json", "User-Agent": "ERCOT-Dashboard-MVP/1.0"},
                )
                with urlopen(request, timeout=10) as response:
                    payload = json.loads(response.read())
                    current = payload.get("current", {})
                    results.append(
                        {
                            "name": location["name"],
                            "temperatureF": current.get("temperature_2m"),
                            "humidityPct": current.get("relative_humidity_2m"),
                            "cloudCoverPct": current.get("cloud_cover"),
                            "windSpeedMph": current.get("wind_speed_10m"),
                            "windGustMph": current.get("wind_gusts_10m"),
                            "time": current.get("time"),
                        }
                    )
            body = json.dumps({"lastUpdated": results[0]["time"] if results else None, "locations": results}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except HTTPError as error:
            self.send_error(error.code, f"Weather API returned {error.code}")
        except URLError as error:
            self.send_error(502, f"Weather request failed: {error.reason}")
        except TimeoutError:
            self.send_error(504, "Weather request timed out")

    def proxy_weather_forecast(self):
        try:
            location_results = []
            for location in WEATHER_LOCATIONS:
                params = urlencode(
                    {
                        "latitude": location["latitude"],
                        "longitude": location["longitude"],
                        "hourly": "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,wind_gusts_10m",
                        "forecast_days": 3,
                        "temperature_unit": "fahrenheit",
                        "wind_speed_unit": "mph",
                        "timezone": "America/Chicago",
                    }
                )
                request = Request(
                    f"{OPEN_METEO_BASE}?{params}",
                    headers={"Accept": "application/json", "User-Agent": "ERCOT-Dashboard-MVP/1.0"},
                )
                with urlopen(request, timeout=10) as response:
                    payload = json.loads(response.read())
                    hourly = payload.get("hourly", {})
                    location_results.append(
                        {
                            "name": location["name"],
                            "time": hourly.get("time", []),
                            "temperatureF": hourly.get("temperature_2m", []),
                            "humidityPct": hourly.get("relative_humidity_2m", []),
                            "cloudCoverPct": hourly.get("cloud_cover", []),
                            "windSpeedMph": hourly.get("wind_speed_10m", []),
                            "windGustMph": hourly.get("wind_gusts_10m", []),
                        }
                    )

            times = location_results[0]["time"] if location_results else []
            hourly = []
            for index, target_time in enumerate(times):
                rows = [location for location in location_results if index < len(location["temperatureF"])]
                if not rows:
                    continue
                hourly.append(
                    {
                        "time": target_time,
                        "temperatureF": sum(row["temperatureF"][index] for row in rows) / len(rows),
                        "humidityPct": sum(row["humidityPct"][index] for row in rows) / len(rows),
                        "cloudCoverPct": sum(row["cloudCoverPct"][index] for row in rows) / len(rows),
                        "windSpeedMph": sum(row["windSpeedMph"][index] for row in rows) / len(rows),
                        "windGustMph": sum(row["windGustMph"][index] for row in rows) / len(rows),
                    }
                )

            body = json.dumps(
                {
                    "lastUpdated": hourly[0]["time"] if hourly else None,
                    "source": "Open-Meteo",
                    "locations": location_results,
                    "hourly": hourly,
                }
            ).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except HTTPError as error:
            self.send_error(error.code, f"Weather API returned {error.code}")
        except URLError as error:
            self.send_error(502, f"Weather request failed: {error.reason}")
        except TimeoutError:
            self.send_error(504, "Weather forecast request timed out")


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), DashboardHandler)
    print(f"Serving ERCOT Dashboard at http://{HOST}:{PORT}/index.html")
    server.serve_forever()
