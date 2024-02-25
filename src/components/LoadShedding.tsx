import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enZA from 'date-fns/locale/en-ZA'
import 'chart.js/auto'
import axios from 'axios'

import "react-big-calendar/lib/css/react-big-calendar.css"



type LoadSheddingData = {
    events: [{
        end: string
        note: string
        start: string
    }]
    info: {
        name: string
        region: string
    }
    schedule: {
        days: {
            date: string
            name: "Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday"|"Sunday"
            stages: Array<string>[]
        }[]
    }
    source: string

}


const areaId = "ethekwini3-8b-hawaan"
/**
 * {
        "count": -1,
        "id": "ethekwini3-8b-hawaan",
        "name": "Hawaan (8B)",
        "region": "eThekwini Municipality"
    }
 */


const LoadSheddingComponent = () => {
  const [loadSheddingData, setLoadSheddingData] = useState<LoadSheddingData | null>(null);

  useEffect(() => {
    fetchLoadSheddingData();
  }, [])

  const fetchLoadSheddingData = async () => {
    // Fetch data using ESP API through your proxy
    const encodedESPUri = `https://developer.sepush.co.za/business/2.0/area?id=${areaId}`
    const externalApiUrl = `http://localhost:3001/proxy/loadshedding?url=${encodeURIComponent(encodedESPUri)}`
    try {
        const response = await axios.get(externalApiUrl);
        setLoadSheddingData(response.data as LoadSheddingData);
    } catch (error) {
        console.error("Error fetching load-shedding data:", error);
        return null;
    }
  };

  type CalendarEvent = {
    title: string
    start: Date
    end: Date
    desc?: string
  }
  const loadSheddingDataToEvents = (_loadSheddingData: LoadSheddingData | null): CalendarEvent[] => {
    if (!_loadSheddingData) {
        console.warn("No load shedding data found")
        // throw "No load shedding data found"
        return []
    }

    const stageNote = _loadSheddingData.events[0].note
    const stageMatch = stageNote.match(/\d+/gi)

    if (!stageMatch) {
        throw "No matching load-shedding stage found"
    }

    const loadSheddingStage = parseInt(stageMatch[0])

    const events: CalendarEvent[] = []
    for (const day of _loadSheddingData.schedule.days) {
        const date = day.date

        for (const stageDetails of day.stages[loadSheddingStage - 1]) {
            const [startTime, endTime] = stageDetails.split("-")
            const startDate = new Date(`${date} ${startTime}`)
            let endDate = new Date(`${date} ${endTime}`)

            // Check if the end time is earlier than the start time, indicating it's on the next day
            if (endDate <= startDate) {
                endDate.setDate(endDate.getDate() + 1); // Move the end date to the next day
            }
    
            const event = {
                title: stageNote,
                start: startDate,
                end: endDate,
            }

            // Add event
            // TODO: Fix issue when starting 
            events.push(event)
        }
    }
    return events
  }

  const locales = {
    'en-ZA': enZA,
  }
  
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  })
  
  return (
    <div>
      <h2>Upcoming Load Shedding Times</h2>
      <Calendar
        localizer={localizer}
        events={loadSheddingDataToEvents(loadSheddingData)}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        />
    </div>
  );
};

export default LoadSheddingComponent;
