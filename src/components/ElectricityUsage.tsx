import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import 'chart.js/auto'
import axios from 'axios'

type RMSUsageData = {
	serial: string
	startDate: string
	endDate: string
	interval: number
	historicIntervals: [
		{
			interval: number
			startingDate: string
		}
	]
	medium: "Electrictity"
	intervals: {
		index: number
		interval: number
		timeOfReading: string
		values: {
			forwardActiveEnergy: {
				unit: "kWh"
				eventType: "TookReading"
				value: number
				consumption: number
				tou: string
			}
		}
	}[]

}

type UtilityStatementData = {
	d: {
		period: {
			StartDate: string
			EndDate: string
		}
		SelectedTransactionsRequest: {
			__type: string
		}
		Transactions: {
			TransactionDate: string // /Date(1701381600000)/
			Transaction: string // "Consumption (9.7740 kWh  x 2.968265000000 R/kWh ) ( 30/11/2023- 01/12/2023)"
			Reference: null
			LineAmount: number
			Balance: number
			UtilityType: null
			Consumption: null
			Rate: null
			MeterNumber: null
			Charge: null
			TransactionTypeID: null
			TransactionId: number
		}[]
		UtilityTransactions: {
			TransactionDate: "/Date(1701381600000)/"
			Transaction: "ENERGY"
			Reference: null
			LineAmount: number
			Balance: number
			UtilityType: "Electricity"
			Consumption: number
			Rate: number
			MeterNumber: string
			Charge: "ENERGY"
			TransactionTypeID: number
			TransactionId: number
		}[]
		ConsolidatedTransactions: {
			TransactionDate: string // "/Date(1703973600000)/"
			Transaction: "ENERGY" | "10% ENERGY DISCOUNT"
			Reference: null
			LineAmount: number
			Balance: number
			UtilityType: "Electricity"
			Consumption: null
			Rate: number
			MeterNumber: string
			Charge: "ENERGY" | "10% ENERGY DISCOUNT"
			TransactionTypeID: number
			TransactionId: number
		}[]
	}
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const INTERVALS = [1, 2, 4, 8, 24].map(multiplier => multiplier * 30)

const fetchUtilityStatementData = async(startDate: string, endDate: string) => {
	const _startDate = new Date(startDate)
	const _endDate = new Date(endDate)

	let data: UtilityStatementData[] = [];

    // Iterate over months from startDate to endDate
    for (let date = new Date(_startDate); date <= _endDate; date.setMonth(date.getMonth() + 1)) {
        const month = MONTHS[date.getMonth()];
        const year = date.getFullYear();

		const externalApiUrl = "https://rms.remotemetering.net/residentialdashboard/RDService.asmx/GetUtilityStatementGrid"
		const postBody = {
			"RequestTransactions": {
				"ApplicationConnectionType": "1",
				"ApplicationConnectionTypeEnum": "1",
				"WorkingID": "2033301",
				"ContentSize": 1499.9334,
				"SelectedContract": {
					"__type": "ResidentialDashboard.LocalModel.BusinessLogic.Contracts",
					"ID": 2033301,
					"IDDebtor": 2266424,
					"DSID": "405d6bab-be1d-4dd7-8b4c-870cc876ae4b",
					"IDAccount": "9c81c1e5-2278-4bcc-826c-5b25c4fbec52",
					"UtilityType": 207,
					"MeterNumber": "BALIZI1105",
					"AccountReference": "VM00210896",
					"SubMeters": [
						"07604201421"
					],
					"DisplayValue": "IZINGA ECO ESTATE BLOCK 1 Unit 105",
					"DisplayValueDailyChart": null,
					"ValidItem": false,
					"DisplayError": null,
					"FullError": null,
					"ApplicationConnectionType": "1",
					"ApplicationConnectionTypeEnum": "1",
					"ApplicationConnectionTypeString": "Demo",
					"SelectedDateTime": null,
					"SelectedStartDate": null,
					"SelectedEndDate": null,
					"WorkingID": "2033301",
					"ContentSize": 1499.9334,
					"SelectedMonth": null
				},
				"SelectedMonth": `${month} ${year}`
			}
		}

		const proxyUrl = `http://localhost:3001/proxy/rms`; 
		try {
			const response = await axios.post(proxyUrl, { url: encodeURIComponent(externalApiUrl), data: postBody });
			if (response.data) {
                data.push(response.data);
            }
		} catch (error) {
			console.error("Error fetching utility data:", error);
			return [];
		}
	}

    return data;

}

const ElectricityUsage = () => {
	type ChartData = {
		labels: Array<string>, datasets: { label: string, data: Array<any>}[]
	}
  	const [chartData, setChartData] = useState<{ rmsData: ChartData, utilityData: ChartData, combinedData: ChartData } | null>(null);

	const [startDate, setStartDate] = useState("2023-11-01T00:00:00.000Z");
	const [endDate, setEndDate] = useState(new Date().toISOString());
	const [interval, setInterval] = useState(60); // interval in minutes


  useEffect(() => {
    const fetchData = async () => {
		const todaysDate = new Date().toISOString();
		const serial = "07604201421" // Meter serial number
        const externalApiUrl  = `https://mdm.rmsconnect.net/technical/installations/device/profile/loadn?endDate=${todaysDate}&serial=${serial}&startDate=${startDate}&interval=${interval}`;

		const proxyUrl = `http://localhost:3001/proxy/rms?url=${encodeURIComponent(externalApiUrl)}`;
		const rmsResponse = await axios.get(proxyUrl);

		const processedData = processRMSDataForChart(rmsResponse.data as RMSUsageData);

		console.log("Processed data: ", processedData)

		const utilityData = await fetchUtilityStatementData(startDate, endDate);
		const processedUtilityData = processUtilityData(utilityData);

		const combinedChartData = combineChartData(processedData, processedUtilityData);
		setChartData({ rmsData: processedData, utilityData: processedUtilityData, combinedData: combinedChartData });
	}
	fetchData();
	}, [startDate, endDate, interval]);

	  // Function to process the fetched data into the format required by Chart.js
	  const processRMSDataForChart = (rmsData: RMSUsageData) => {
		// Process your data here
		// Return it in the format expected by Chart.js
		return {
		  labels: rmsData.intervals.map(item => item.timeOfReading),
		  datasets: [
			{
			  label: 'Electricity Usage (kWh)',
			  data: rmsData.intervals.slice(1).map(item => item.values.forwardActiveEnergy.consumption),
			},
		  ],
		};
	  };
	  
	// Function to process utility data
	const processUtilityData = (utilityDataArray: UtilityStatementData[]) => {
		let labels: string[] = [];
		let balanceData: number[] = [];
	
		utilityDataArray.forEach(utilityData => {
			utilityData.d.Transactions.forEach(item => {
				const transactionDateMatch = item.TransactionDate.match(/\d+/);
	
				if (!transactionDateMatch) {
					console.error("No transaction date");
					throw `No Transaction Date in: ${JSON.stringify(item)}`;
				}
	
				const utcSeconds = parseInt(transactionDateMatch[0], 10) / 1000;
				const date = new Date(0); // Sets the date to the epoch
				date.setUTCSeconds(utcSeconds);
	
				const dateString = date.toDateString();
				if (!labels.includes(dateString)) {
					labels.push(dateString);
				}
	
				// Assuming that each transaction date is unique within each utilityData
				balanceData.push(item.Balance);
			});
		});
	
		return {
			labels: labels,
			datasets: [
				{
					label: 'Balance (R)',
					data: balanceData,
				},
			],
		};
	};


	type Datasets = {
		labels: Array<string>
		datasets: {
			label: string
			data: Array<number>
		}[]
	}

	// Function to combine chart data
	const combineChartData = (rmsData: Datasets, utilityData: Datasets) => {
		// Combine RMS usage data and utility data for the chart
		return {
		labels: rmsData.labels, // Assuming both datasets have the same labels
		datasets: [...rmsData.datasets, ...utilityData.datasets],
		};
	};


  return (
    <div>
      	<h2>Electricity Usage Over Time</h2>
		  <div>
			<label>
				Start Date:
				<input 
				type="date" 
				value={startDate.slice(0, 10)} 
				onChange={e => setStartDate(e.target.value + "T00:00:00.000Z")} 
				/>
			</label>
			<label>
				End Date:
				<input 
				type="date" 
				value={endDate.slice(0, 10)} 
				onChange={e => setEndDate(e.target.value + (new Date()).toDateString().slice(10))} 
				/>
			</label>
			<label>
				Interval (minutes):
				<select value={interval} onChange={e => setInterval(parseInt(e.target.value))}>
					{INTERVALS.map(intervalValue => (
					<option key={intervalValue} value={intervalValue}>{intervalValue}</option>
					))}
				</select>
			</label>
			</div>
    	{ chartData && <Line data={chartData.rmsData} />}
		<h2>Balance</h2>
		{ chartData && <Line data={chartData.utilityData} />}
    </div>
  );
};

export default ElectricityUsage;