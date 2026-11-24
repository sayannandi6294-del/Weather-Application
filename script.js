
// ======================================
// 1. OPENWEATHER API KEY
// ======================================

// Add your NEW OpenWeather API key here.
const API_KEY = "cec32e636cd5a3232e299ec0254b1c41";


// ======================================
// 2. GET HTML ELEMENTS
// ======================================

const $ = (id) => document.getElementById(id);

const cityInput = $("cityInput");
const statusBox = $("status");


// ======================================
// 3. DISPLAY MESSAGES
// ======================================

function showMessage(message) {
    statusBox.textContent = message;
}


// ======================================
// 4. WEATHER ICON URL
// ======================================

function iconUrl(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}


// ======================================
// 5. FORMAT DATE AND TIME
// ======================================

function formatDay(dateText) {
    return new Date(dateText).toLocaleDateString(
        "en-IN",
        { weekday: "short" }
    );
}

function formatTime(dateText) {
    return new Date(dateText).toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            hour12: true
        }
    );
}


// ======================================
// 6. GET WEATHER DATA
// ======================================

async function getWeather(city = cityInput.value.trim()) {

    if (!city) {
        showMessage("Please enter a city name.");
        return;
    }

    if (API_KEY === "PASTE_YOUR_NEW_API_KEY_HERE") {
        showMessage("Please add your OpenWeather API key first.");
        return;
    }

    showMessage("Loading weather...");

    $("searchBtn").disabled = true;

    try {

        // Current weather API
        const currentUrl =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        // Five-day forecast API
        const forecastUrl =
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        // Fetch both APIs together
        const [currentResponse, forecastResponse] =
            await Promise.all([
                fetch(currentUrl),
                fetch(forecastUrl)
            ]);

        const current = await currentResponse.json();
        const forecast = await forecastResponse.json();

        // Check API errors
        if (!currentResponse.ok) {
            throw new Error(current.message || "City not found.");
        }

        if (!forecastResponse.ok) {
            throw new Error(forecast.message || "Forecast unavailable.");
        }

        // Display data
        renderCurrent(current);

        renderForecast(forecast);

        renderMap(current);

        cityInput.value = current.name;

        showMessage("");

    } catch (error) {

        showMessage(
            `Unable to load weather: ${error.message}. Check the city, API key and internet connection.`
        );

    } finally {

        $("searchBtn").disabled = false;

    }
}


// ======================================
// 7. DISPLAY CURRENT WEATHER
// ======================================

function renderCurrent(data) {

    $("temperature").textContent =
        Math.round(data.main.temp);

    $("description").textContent =
        data.weather[0].description;

    $("currentIcon").src =
        iconUrl(data.weather[0].icon);

    $("currentIcon").alt =
        data.weather[0].description;

    $("pressure").textContent =
        `${data.main.pressure} hPa`;

    $("humidity").textContent =
        `${data.main.humidity}%`;

    $("wind").textContent =
        `${data.wind.speed} m/s`;

    $("uv").textContent =
        `${Math.round(data.main.feels_like)}°`;

    $("mapCity").textContent =
        `${data.name}, ${data.sys.country}`;

    $("summaryCity").textContent =
        `Forecast for ${data.name}`;

    $("localTime").textContent =
        new Date().toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit"
        });

}


// ======================================
// 8. DISPLAY WEATHER MAP
// ======================================

function renderMap(data) {

    const lat = data.coord.lat;

    const lon = data.coord.lon;

    const delta = 0.16;

    const bbox =
        `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;

    $("mapFrame").src =
        `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lon}`;

    $("mapLink").href =
        `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=11/${lat}/${lon}`;

}


// ======================================
// 9. DISPLAY FIVE-DAY FORECAST
// ======================================

function renderForecast(data) {

    const days = {};

    // Collect one forecast entry per date
    data.list.forEach(item => {

        const key = item.dt_txt.split(" ")[0];

        if (!days[key]) {
            days[key] = item;
        }

    });

    const dailyItems =
        Object.values(days).slice(0, 5);

    $("forecastList").innerHTML =
        dailyItems.map(item => `

            <div class="forecast-row">

                <img
                    src="${iconUrl(item.weather[0].icon)}"
                    alt="Weather"
                >

                <strong>
                    ${formatDay(item.dt_txt)}
                    ·
                    ${Math.round(item.main.temp_max)}° /
                    ${Math.round(item.main.temp_min)}°
                </strong>

                <small>
                    ${item.weather[0].main}
                </small>

            </div>

        `).join("");


    // Next six forecast periods
    const nextHours = data.list.slice(0, 6);

    $("hourlyChart").innerHTML =
        nextHours.map(item => `

            <div class="hour-item">

                <div class="hour-temp">
                    ${Math.round(item.main.temp)}°
                </div>

                <img
                    src="${iconUrl(item.weather[0].icon)}"
                    alt="${item.weather[0].description}"
                >

                <div class="hour-time">
                    ${formatTime(item.dt_txt)}
                </div>

            </div>

        `).join("");

}


// ======================================
// 10. SEARCH BUTTON
// ======================================

$("searchBtn").addEventListener("click", () => {

    getWeather();

});


// ======================================
// 11. ENTER KEY SEARCH
// ======================================

cityInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        getWeather();

    }

});


// ======================================
// 12. POPULAR CITY BUTTONS
// ======================================

document.querySelectorAll(".city-row").forEach(button => {

    button.addEventListener("click", () => {

        getWeather(button.dataset.city);

    });

});


// ======================================
// 13. LOAD POPULAR CITY WEATHER
// ======================================

async function loadPopularCities() {

    const cities = [
        "Delhi",
        "Mumbai",
        "Hyderabad",
        "Bengaluru",
        "Kolkata"
    ];

    for (const city of cities) {

        try {

            const url =
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

            const response = await fetch(url);

            const data = await response.json();

            if (response.ok) {

                const label = $(`${city}-weather`);

                if (label) {

                    label.textContent =
                        `${Math.round(data.main.temp)}°C · ${data.weather[0].main}`;

                }

            }

        } catch (error) {

            console.log("Popular city error:", city, error.message);

        }

    }

}


// ======================================
// 14. START WEATHER APPLICATION
// ======================================

if (API_KEY !== "PASTE_YOUR_NEW_API_KEY_HERE") {

    getWeather("Kolkata");

    loadPopularCities();

} else {

    showMessage(
        "Add your OpenWeather API key in script.js to load live weather."
    );

}
