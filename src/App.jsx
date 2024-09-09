import React, { Component } from "react";
import "./App.css";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);

  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

export class App extends Component {
  constructor(props) {
    super();
    this.state = {
      location: "India",
      isLoading: false,
      displayLocation: "",
      weather: {},
    };
    this.getWeather = this.getWeather.bind(this);
  }

  async getWeather() {
    try {
      this.setState({ isLoading: true });
      // getting location
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();
      if (!geoData.results) throw new Error("Location Not Found");
      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      this.setState({ displayLocation: `${name} ${country_code}` });
      console.log(`${name} ${country_code}`);
      // console.log(geoData);

      // getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
      // console.log(weatherData);
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ isLoading: false });
    }
  }
  render() {
    // console.log(this.state.location);
    // console.log(this.state.weather);
    // console.log(this.state.displayLocation);
    console.log(this.state.weather);
    return (
      <div className="container">
        <h1>Weather App</h1>
        <input
          type="text"
          placeholder="Location Based Search"
          value={this.state.location}
          onChange={(e) => this.setState({ location: e.target.value })}
        />
        <button onClick={this.getWeather}>Check Weather</button>
        {this.state.isLoading && <p className="loader">Loading....</p>}

        {this.state.weather.weathercode && (
          <Weather
            weather={this.state.weather}
            location={this.state.displayLocation}
          />
        )}
      </div>
    );
  }
}

export default App;

class Weather extends Component {
  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time,
      weathercode: code,
    } = this.props.weather;
    return (
      <div>
        <h2>{this.props.location} Weather Report</h2>
        <ul className="weather">
          {time.map((date, index) => (
            <Day
              date={date}
              minTime={min.at(index)}
              maxTime={max.at(index)}
              code={code.at(index)}
              key={date}
            />
          ))}
        </ul>
      </div>
    );
  }
}

class Day extends Component {
  render() {
    const { date, minTime, maxTime, code, key } = this.props;
    return (
      <div className="day">
        <span>{code}</span>
        <p>{date}</p>
        <p>
          {Math.floor(minTime)}&deg; &mdash; {Math.ceil(maxTime)}&deg;
        </p>
        <p></p>
      </div>
    );
  }
}
