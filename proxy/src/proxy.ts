import express from 'express'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

require("dotenv").config()

const app = express();

app.use(express.json());

const CACHE_FILE = path.join(__dirname, 'cache.json'); // Path to the cache file

// Function to read cache from file
const readCache = (): { [url: string]: { data: object, timestamp: number } } => {
  if (fs.existsSync(CACHE_FILE)) {
    const fileContent = fs.readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(fileContent);
  }
  return {};
};

// Function to write cache to file
const writeCache = (cache: { [url: string]: { data: object; timestamp: number; }; }) => {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
};

app.use(express.json()); // Middleware to parse JSON bodies

app.use('/proxy/rms', async (req, res) => {
  // Extract URL from query or body based on the request type
  const url = req.method === 'POST' ? req.body.url : req.query.url;

  // Basic validation of the URL
  if (!url || !url.startsWith('http')) {
    return res.status(400).send('Invalid URL');
  }

  try {
    // Perform a GET or POST request based on the incoming request
    let response: { data: any; };
    if (req.method === 'POST') {
      // For POST, forward the body received (excluding the 'url' field)
      const { url, data: { ...bodyContent } } = req.body;
      response = await axios.post(decodeURIComponent(url), bodyContent);
    } else {
      // For GET, directly forward the request
      response = await axios.get(url);
    }

    // Send back the response from the external server
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data');
  }
});

const cache: { [url: string]: { data: object, timestamp: number } } | {} = {}; // Simple in-memory cache
const CACHE_DURATION = 1.5 * 3600 * 1000; // 1 hour cache duration
app.use('/proxy/loadshedding', async (req, res) => {
  const url = req.query.url?.toString();
  
  if (!url) {
    throw "No url in query!"
  }

  const cache = readCache();
  const now = new Date();
  
  // Check if the cache for the URL exists and calculate the time elapsed
  let timeElapsed = Number.MAX_VALUE;
  if (cache[url]) {
    const timestamp = new Date(cache[url].timestamp);
    timeElapsed = now.getTime() - timestamp.getTime();
  }

  if (cache[url] && timeElapsed < CACHE_DURATION) {
    // Serve data from cache if it's still valid
    console.log("Loading cached data...")
    res.send(cache[url].data);
  } else {
    // Fetch from API and update cache
    console.log("Fetching data using the API key: ", process.env['ESP_API_KEY']);
    try {
      const response = await axios.get(url, {
        headers: {
          token: process.env['ESP_API_KEY']
        }
      });
      cache[url] = { data: response.data, timestamp: now.getTime() };
      writeCache(cache);
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching data');
    }
  }
})

app.listen(3001, () => console.log('Proxy server running on port 3001'));

export {}