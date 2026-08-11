(() => {
  "use strict";

  const PROGRESS_KEY = "power-market-solver-progress.v3";
  const THEME_KEY = "power-market-solver-theme.v1";
  const DAY_AHEAD_INPUT_VERSION = 6;
  const colors = {
    red: "#ff3b30",
    yellow: "#ffd60a",
    green: "#34c759",
    gray: "#b9bcc2"
  };

  const levels = [
    {
      id: 0,
      playable: true,
      title: "Level 0",
      loadDemand: 70,
      resources: [
        { id: "wind", name: "Wind farm", x: 110, y: 105, capacity: 30, offer: 10 },
        { id: "gas", name: "Gas plant", x: 110, y: 250, capacity: 20, offer: 35 },
        { id: "peaker", name: "Peaker plant", x: 110, y: 395, capacity: 40, offer: 80 }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 355, y: 180 },
        { id: "east", name: "East grid node", x: 600, y: 280 }
      ],
      loads: [{ id: "city", name: "City load", x: 845, y: 280, demand: 70 }],
      connections: [
        { id: "wind-west", from: "Wind farm", to: "West grid node", type: "feeder", capacity: "30 MW" },
        { id: "gas-west", from: "Gas plant", to: "West grid node", type: "feeder", capacity: "20 MW" },
        { id: "peaker-east", from: "Peaker plant", to: "East grid node", type: "feeder", capacity: "40 MW" },
        { id: "west-east", from: "West grid node", to: "East grid node", type: "transmission", capacity: "∞ MW", expectedFlow: 50, label: "West to East" },
        { id: "east-city", from: "East grid node", to: "City load", type: "transmission", capacity: "∞ MW", expectedFlow: 70, label: "East to load" }
      ],
      expectedLmp: { west: 80, east: 80, city: 80 },
      theme: "Nodal pricing",
      description: "One load is served by three generators through two grid nodes.",
      challenge: "Challenge: find the common marginal LMP and the two transmission flows.",
      explanation: "The marginal offer is $80/MWh."
    },
    {
      id: 1,
      playable: true,
      title: "Level 1",
      loadDemand: 75,
      resources: [
        { id: "wind", name: "Wind farm", x: 110, y: 105, capacity: 25, offer: 0 },
        { id: "gas", name: "Gas plant", x: 110, y: 250, capacity: 25, offer: 35 },
        { id: "peaker", name: "Peaker plant", x: 110, y: 395, capacity: 40, offer: 90 }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 355, y: 180 },
        { id: "east", name: "East grid node", x: 600, y: 280 }
      ],
      loads: [{ id: "city", name: "City load", x: 845, y: 280, demand: 75 }],
      connections: [
        { id: "wind-west", from: "Wind farm", to: "West grid node", type: "feeder", capacity: "25 MW" },
        { id: "gas-west", from: "Gas plant", to: "West grid node", type: "feeder", capacity: "25 MW" },
        { id: "peaker-east", from: "Peaker plant", to: "East grid node", type: "feeder", capacity: "40 MW" },
        { id: "west-east", from: "West grid node", to: "East grid node", type: "transmission", capacity: "∞ MW", expectedFlow: 50, label: "West to East" },
        { id: "east-city", from: "East grid node", to: "City load", type: "transmission", capacity: "∞ MW", expectedFlow: 75, label: "East to load" }
      ],
      expectedLmp: { west: 90, east: 90, city: 90 },
      theme: "Marginal offers",
      description: "The supply stack changes while the network remains unconstrained.",
      challenge: "Challenge: identify the new marginal offer and rebalance the larger load.",
      explanation: "The marginal offer is $90/MWh."
    },
    {
      id: 2,
      playable: true,
      title: "Level 2",
      theme: "Supply curves",
      market: "Supply and demand curves",
      loadDemand: 90,
      resources: [
        { id: "wind", name: "Wind farm", x: 105, y: 70, capacity: 25, offer: 0, supplyCurve: [{ quantity: 25, offer: 0 }] },
        { id: "solar", name: "Solar field", x: 105, y: 185, capacity: 20, offer: 8, supplyCurve: [{ quantity: 20, offer: 8 }] },
        { id: "gas", name: "Gas plant", x: 105, y: 315, capacity: 30, offer: 32, supplyCurve: [{ quantity: 15, offer: 25 }, { quantity: 15, offer: 32 }] },
        { id: "hydro", name: "Hydro plant", x: 105, y: 430, capacity: 25, offer: 18, supplyCurve: [{ quantity: 25, offer: 18 }] }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 350, y: 145 },
        { id: "south", name: "South grid node", x: 350, y: 430 },
        { id: "east", name: "East grid node", x: 600, y: 255 }
      ],
      loads: [
        { id: "metro", name: "Metro load", x: 850, y: 145, demand: 45, demandCurve: [{ quantity: 25, value: 60 }, { quantity: 20, value: 40 }] },
        { id: "industrial", name: "Industrial load", x: 850, y: 365, demand: 45, demandCurve: [{ quantity: 25, value: 55 }, { quantity: 20, value: 35 }] }
      ],
      connections: [
        { id: "wind-west", from: "Wind farm", to: "West grid node", type: "feeder", capacity: "25 MW" },
        { id: "solar-west", from: "Solar field", to: "West grid node", type: "feeder", capacity: "20 MW" },
        { id: "gas-south", from: "Gas plant", to: "South grid node", type: "feeder", capacity: "30 MW" },
        { id: "hydro-east", from: "Hydro plant", to: "East grid node", type: "feeder", capacity: "25 MW" },
        { id: "west-east", from: "West grid node", to: "East grid node", type: "transmission", capacity: "60 MW", expectedFlow: 45, label: "West to East" },
        { id: "south-east", from: "South grid node", to: "East grid node", type: "transmission", capacity: "45 MW", expectedFlow: 0, label: "South to East" },
        { id: "east-metro", from: "East grid node", to: "Metro load", type: "transmission", capacity: "60 MW", expectedFlow: 45, label: "East to Metro" },
        { id: "east-industrial", from: "East grid node", to: "Industrial load", type: "transmission", capacity: "45 MW", expectedFlow: 25, label: "East to Industrial" },
        { id: "south-industrial", from: "South grid node", to: "Industrial load", type: "transmission", capacity: "45 MW", expectedFlow: 20, label: "South to Industrial" }
      ],
      expectedLmp: { west: 32, south: 32, east: 32, metro: 32, industrial: 32 },
      description: "Multiple supply blocks and two demand curves set one market-clearing price.",
      challenge: "Challenge: stack the offers against both demand curves and route every MW without over-dispatch.",
      explanation: "Wind 25 + solar 20 + hydro 25 + gas 20 serves the 90 MW load. The final 5 MW gas block sets $32/MWh; East does not need South-to-East flow."
    },
    {
      id: 3,
      playable: true,
      title: "Level 3",
      theme: "Congestion",
      market: "Congested real-time market",
      loadDemand: 80,
      resources: [
        { id: "wind", name: "West wind", x: 105, y: 80, capacity: 20, offer: 5 },
        { id: "westgas", name: "West gas", x: 105, y: 220, capacity: 30, offer: 30 },
        { id: "solar", name: "East solar", x: 105, y: 360, capacity: 25, offer: 10 },
        { id: "eastgas", name: "East gas", x: 105, y: 455, capacity: 30, offer: 45 }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 330, y: 160 },
        { id: "hub", name: "Congestion hub", x: 535, y: 250 },
        { id: "east", name: "East grid node", x: 700, y: 340 }
      ],
      loads: [
        { id: "inland", name: "Inland load", x: 850, y: 155, demand: 25 },
        { id: "coastal", name: "Coastal load", x: 850, y: 385, demand: 55 }
      ],
      connections: [
        { id: "wind-west", from: "West wind", to: "West grid node", type: "feeder", capacity: "20 MW" },
        { id: "westgas-west", from: "West gas", to: "West grid node", type: "feeder", capacity: "30 MW" },
        { id: "solar-east", from: "East solar", to: "East grid node", type: "feeder", capacity: "25 MW" },
        { id: "eastgas-east", from: "East gas", to: "East grid node", type: "feeder", capacity: "30 MW" },
        { id: "west-hub", from: "West grid node", to: "Congestion hub", type: "transmission", capacity: "25 MW", expectedFlow: 25, label: "West to Hub" },
        { id: "hub-east", from: "Congestion hub", to: "East grid node", type: "transmission", capacity: "25 MW", expectedFlow: 0, label: "Hub to East" },
        { id: "hub-inland", from: "Congestion hub", to: "Inland load", type: "transmission", capacity: "25 MW", expectedFlow: 25, label: "Hub to Inland" },
        { id: "east-coastal", from: "East grid node", to: "Coastal load", type: "transmission", capacity: "55 MW", expectedFlow: 55, label: "East to Coastal" }
      ],
      expectedLmp: { west: 30, hub: 30, east: 45, inland: 30, coastal: 45 },
      description: "A constrained interface separates low-cost west generation from the east load pocket.",
      challenge: "Challenge: use the full 25 MW West-to-Hub path for Inland while East serves Coastal.",
      explanation: "West sends 25 MW through the constrained interface to Inland. East serves Coastal with 55 MW, so the East-side marginal offer is $45/MWh."
    },
    {
      id: 4,
      playable: true,
      title: "Level 4",
      theme: "CRR hedges",
      market: "Congestion revenue rights",
      loadDemand: 85,
      resources: [
        { id: "wind", name: "West wind", x: 105, y: 80, capacity: 30, offer: 5 },
        { id: "gas", name: "Central gas", x: 105, y: 220, capacity: 40, offer: 25 },
        { id: "solar", name: "East solar", x: 105, y: 360, capacity: 20, offer: 10 },
        { id: "peaker", name: "East peaker", x: 105, y: 455, capacity: 40, offer: 65 }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 330, y: 160 },
        { id: "central", name: "Central grid node", x: 535, y: 250 },
        { id: "east", name: "East grid node", x: 700, y: 340 }
      ],
      loads: [
        { id: "north", name: "North load", x: 850, y: 155, demand: 40 },
        { id: "south", name: "South load", x: 850, y: 385, demand: 45 }
      ],
      connections: [
        { id: "wind-west", from: "West wind", to: "West grid node", type: "feeder", capacity: "30 MW" },
        { id: "gas-central", from: "Central gas", to: "Central grid node", type: "feeder", capacity: "40 MW" },
        { id: "solar-east", from: "East solar", to: "East grid node", type: "feeder", capacity: "20 MW" },
        { id: "peaker-east", from: "East peaker", to: "East grid node", type: "feeder", capacity: "40 MW" },
        { id: "west-central", from: "West grid node", to: "Central grid node", type: "transmission", capacity: "30 MW", expectedFlow: 30, label: "West to Central", crr: { type: "obligation", holder: "North buyer", strike: 10 } },
        { id: "central-east", from: "Central grid node", to: "East grid node", type: "transmission", capacity: "15 MW", expectedFlow: 15, label: "Central to East", crr: { type: "option", holder: "East buyer", strike: 20 } },
        { id: "central-north", from: "Central grid node", to: "North load", type: "transmission", capacity: "50 MW", expectedFlow: 40, label: "Central to North" },
        { id: "east-south", from: "East grid node", to: "South load", type: "transmission", capacity: "50 MW", expectedFlow: 45, label: "East to South" }
      ],
      expectedLmp: { west: 25, central: 25, east: 65, north: 25, south: 65 },
      description: "Congestion creates a locational spread that can be hedged with CRRs.",
      challenge: "Challenge: use the Central-to-East limit while 15 MW of $25 gas capacity remains available for North.",
      explanation: "Central gas retains 15 MW of headroom for North, but the 15 MW Central-to-East interface is full. East must use its $65 peaker for the margin, creating the CRR spread."
    },
    {
      id: 5,
      playable: true,
      title: "Level 5",
      theme: "Day-ahead market",
      market: "Day-ahead market",
      loadDemand: 105,
      resources: [
        { id: "wind", name: "West wind", x: 105, y: 70, capacity: 35, offer: 0, dayAheadOffer: 0 },
        { id: "solar", name: "North solar", x: 105, y: 185, capacity: 25, offer: 4, dayAheadOffer: 4 },
        { id: "gas", name: "South gas", x: 105, y: 315, capacity: 35, offer: 38, dayAheadOffer: 38 },
        { id: "battery", name: "East battery", x: 105, y: 430, capacity: 20, offer: 44, dayAheadOffer: 44 }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 330, y: 120 },
        { id: "north", name: "North grid node", x: 520, y: 200 },
        { id: "south", name: "South grid node", x: 520, y: 430 },
        { id: "east", name: "East grid node", x: 700, y: 290 }
      ],
      loads: [
        { id: "city", name: "City load", x: 875, y: 120, demand: 40, dayAheadDemand: 40 },
        { id: "coastal", name: "Coastal load", x: 875, y: 290, demand: 35, dayAheadDemand: 35 },
        { id: "valley", name: "Valley load", x: 875, y: 430, demand: 30, dayAheadDemand: 30 }
      ],
      connections: [
        { id: "wind-west", from: "West wind", to: "West grid node", type: "feeder", capacity: "35 MW" },
        { id: "solar-north", from: "North solar", to: "North grid node", type: "feeder", capacity: "25 MW" },
        { id: "gas-south", from: "South gas", to: "South grid node", type: "feeder", capacity: "35 MW" },
        { id: "battery-east", from: "East battery", to: "East grid node", type: "feeder", capacity: "20 MW" },
        { id: "west-north", from: "West grid node", to: "North grid node", type: "transmission", capacity: "50 MW", expectedFlow: 35, label: "West to North" },
        { id: "north-east", from: "North grid node", to: "East grid node", type: "transmission", capacity: "55 MW", expectedFlow: 20, label: "North to East", labelOffset: 98, labelSide: "below", labelTangent: 108 },
        { id: "south-east", from: "South grid node", to: "East grid node", type: "transmission", capacity: "30 MW", expectedFlow: 5, label: "South to East", labelOffset: 126, labelTangent: -108 },
        { id: "north-city", from: "North grid node", to: "City load", type: "transmission", capacity: "40 MW", expectedFlow: 40, label: "North to City", labelOffset: 150 },
        { id: "east-coastal", from: "East grid node", to: "Coastal load", type: "transmission", capacity: "35 MW", expectedFlow: 35, label: "East to Coastal" },
        { id: "south-valley", from: "South grid node", to: "Valley load", type: "transmission", capacity: "30 MW", expectedFlow: 30, label: "South to Valley", labelOffset: 58, labelSide: "below" }
      ],
      expectedLmp: { west: 44, north: 44, south: 44, east: 44, city: 44, coastal: 44, valley: 44 },
      description: "A day-ahead schedule clears forecast demand across four connected buses.",
      challenge: "Challenge: solve the scheduled day-ahead LMPs and flows before real-time delivery.",
      explanation: "Wind, solar, and gas are fully dispatched. The $44/MWh battery supplies the marginal 10 MW, so every node has a $44/MWh incremental LMP."
    },
    {
      id: 6,
      playable: true,
      title: "Level 6",
      theme: "Linear offer curve",
      market: "Real-time market",
      loadDemand: 25,
      resources: [
        { id: "wind", name: "West wind", x: 105, y: 105, capacity: 10, offer: 0 },
        { id: "gas", name: "Flex gas", x: 105, y: 330, capacity: 20, offer: 10, offerCurve: { style: "linear", resolution: 1, points: [{ mw: 0, price: 10 }, { mw: 10, price: 10 }, { mw: 20, price: 30 }] } }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 350, y: 220 },
        { id: "east", name: "East grid node", x: 650, y: 220 }
      ],
      loads: [{ id: "city", name: "City load", x: 875, y: 220, demand: 25 }],
      connections: [
        { id: "wind-west", from: "West wind", to: "West grid node", type: "feeder", capacity: "10 MW" },
        { id: "gas-west", from: "Flex gas", to: "West grid node", type: "feeder", capacity: "20 MW" },
        { id: "west-east", from: "West grid node", to: "East grid node", type: "transmission", capacity: "∞ MW", expectedFlow: 25, label: "West to East" },
        { id: "east-city", from: "East grid node", to: "City load", type: "transmission", capacity: "∞ MW", expectedFlow: 25, label: "East to City" }
      ],
      expectedLmp: { west: 20, east: 20, city: 20 },
      description: "A resource's marginal offer rises continuously as its output increases.",
      challenge: "Challenge: dispatch 25 MW and interpolate the Flex gas curve between $10/MWh and $30/MWh.",
      explanation: "Wind supplies 10 MW and Flex gas supplies 15 MW. At 15 MW, the linear gas curve is $20/MWh."
    },
    {
      id: 7,
      playable: true,
      title: "Level 7",
      theme: "Curve competition",
      market: "Real-time market",
      loadDemand: 45,
      resources: [
        { id: "wind", name: "West wind", x: 105, y: 80, capacity: 10, offer: 0 },
        { id: "gas", name: "Central gas", x: 105, y: 250, capacity: 20, offer: 10, offerCurve: { style: "linear", resolution: 1, points: [{ mw: 0, price: 10 }, { mw: 10, price: 10 }, { mw: 20, price: 30 }] } },
        { id: "peaker", name: "East peaker", x: 105, y: 420, capacity: 20, offer: 40, offerCurve: { style: "linear", resolution: 1, points: [{ mw: 0, price: 40 }, { mw: 10, price: 40 }, { mw: 20, price: 70 }] } }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 315, y: 150 },
        { id: "central", name: "Central grid node", x: 525, y: 250 },
        { id: "east", name: "East grid node", x: 735, y: 350 }
      ],
      loads: [{ id: "metro", name: "Metro load", x: 900, y: 250, demand: 45 }],
      connections: [
        { id: "wind-west", from: "West wind", to: "West grid node", type: "feeder", capacity: "10 MW" },
        { id: "gas-central", from: "Central gas", to: "Central grid node", type: "feeder", capacity: "20 MW" },
        { id: "peaker-east", from: "East peaker", to: "East grid node", type: "feeder", capacity: "20 MW" },
        { id: "west-central", from: "West grid node", to: "Central grid node", type: "transmission", capacity: "∞ MW", expectedFlow: 10, label: "West to Central" },
        { id: "central-east", from: "Central grid node", to: "East grid node", type: "transmission", capacity: "∞ MW", expectedFlow: 30, label: "Central to East" },
        { id: "east-metro", from: "East grid node", to: "Metro load", type: "transmission", capacity: "∞ MW", expectedFlow: 45, label: "East to Metro" }
      ],
      expectedLmp: { west: 55, central: 55, east: 55, metro: 55 },
      description: "Several generators offer different continuous curves into one unconstrained market.",
      challenge: "Challenge: stack all three curves and identify the marginal East peaker output.",
      explanation: "Wind supplies 10 MW, Central gas supplies 20 MW, and the East peaker supplies 15 MW at its $55/MWh interpolated marginal price."
    },
    {
      id: 8,
      playable: true,
      title: "Level 8",
      theme: "Curves and congestion",
      market: "Congested real-time market",
      loadDemand: 35,
      resources: [
        { id: "wind", name: "West wind", x: 105, y: 100, capacity: 10, offer: 0 },
        { id: "westgas", name: "West gas", x: 105, y: 320, capacity: 15, offer: 10, offerCurve: { style: "linear", resolution: 1, points: [{ mw: 0, price: 10 }, { mw: 10, price: 30 }, { mw: 15, price: 30 }] } },
        { id: "eastgas", name: "East gas", x: 105, y: 450, capacity: 30, offer: 40, offerCurve: { style: "linear", resolution: 1, points: [{ mw: 0, price: 40 }, { mw: 15, price: 60 }, { mw: 30, price: 90 }] } }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 350, y: 220 },
        { id: "east", name: "East grid node", x: 680, y: 320 }
      ],
      loads: [
        { id: "westLoad", name: "West load", x: 530, y: 90, demand: 10 },
        { id: "eastLoad", name: "East load", x: 900, y: 320, demand: 25 }
      ],
      connections: [
        { id: "wind-west", from: "West wind", to: "West grid node", type: "feeder", capacity: "10 MW" },
        { id: "westgas-west", from: "West gas", to: "West grid node", type: "feeder", capacity: "15 MW" },
        { id: "eastgas-east", from: "East gas", to: "East grid node", type: "feeder", capacity: "30 MW" },
        { id: "west-east", from: "West grid node", to: "East grid node", type: "transmission", capacity: "10 MW", expectedFlow: 10, label: "West to East" },
        { id: "west-load", from: "West grid node", to: "West load", type: "transmission", capacity: "20 MW", expectedFlow: 10, label: "West to West load" },
        { id: "east-load", from: "East grid node", to: "East load", type: "transmission", capacity: "30 MW", expectedFlow: 25, label: "East to East load" }
      ],
      expectedLmp: { west: 30, east: 60, westLoad: 30, eastLoad: 60 },
      description: "A binding interface forces the East gas curve to set a higher local price.",
      challenge: "Challenge: use the 10 MW West-to-East limit and interpolate both regional curves.",
      explanation: "West serves 10 MW locally and exports 10 MW. East supplies the remaining 15 MW at $60/MWh."
    },
    {
      id: 9,
      playable: true,
      title: "Level 9",
      theme: "Demand curves",
      market: "Supply and demand curves",
      loadDemand: 30,
      resources: [
        { id: "wind", name: "Wind farm", x: 105, y: 110, capacity: 10, offer: 0 },
        { id: "gas", name: "Gas plant", x: 105, y: 350, capacity: 20, offer: 10, offerCurve: { style: "linear", resolution: 1, points: [{ mw: 0, price: 10 }, { mw: 20, price: 30 }] } }
      ],
      buses: [{ id: "hub", name: "Market hub", x: 520, y: 230 }],
      loads: [{ id: "city", name: "City load", x: 875, y: 230, demand: 30, demandCurve: { style: "linear", points: [{ mw: 0, value: 100 }, { mw: 30, value: 35 }, { mw: 40, value: 0 }] } }],
      connections: [
        { id: "wind-hub", from: "Wind farm", to: "Market hub", type: "feeder", capacity: "10 MW" },
        { id: "gas-hub", from: "Gas plant", to: "Market hub", type: "feeder", capacity: "20 MW" },
        { id: "hub-city", from: "Market hub", to: "City load", type: "transmission", capacity: "∞ MW", expectedFlow: 30, label: "Hub to City" }
      ],
      expectedLmp: { hub: 30, city: 30 },
      description: "The load has a willingness-to-pay curve as the gas offer curve rises.",
      challenge: "Challenge: clear 30 MW only when the marginal supply price remains below the load's $35/MWh value.",
      explanation: "The marginal gas price is $30/MWh at 30 MW, below the load's $35/MWh marginal value, so all 30 MW clears."
    },
    {
      id: 10,
      playable: true,
      title: "Level 10",
      theme: "Curve capstone",
      market: "Day-ahead market",
      loadDemand: 40,
      resources: [
        { id: "solar", name: "West solar", x: 105, y: 90, capacity: 10, offer: 0, dayAheadOffer: 0 },
        { id: "gas", name: "Central gas", x: 105, y: 260, capacity: 25, offer: 20, dayAheadOffer: 20, offerCurve: { style: "linear", resolution: 1, points: [{ mw: 0, price: 20 }, { mw: 20, price: 50 }, { mw: 25, price: 50 }] } },
        { id: "battery", name: "East battery", x: 105, y: 430, capacity: 20, offer: 60, dayAheadOffer: 60, offerCurve: { style: "linear", resolution: 1, points: [{ mw: 0, price: 60 }, { mw: 10, price: 60 }, { mw: 20, price: 100 }] } }
      ],
      buses: [
        { id: "west", name: "West grid node", x: 320, y: 150 },
        { id: "central", name: "Central grid node", x: 535, y: 250 },
        { id: "east", name: "East grid node", x: 740, y: 350 }
      ],
      loads: [
        { id: "north", name: "North load", x: 900, y: 150, demand: 20 },
        { id: "south", name: "South load", x: 900, y: 390, demand: 20 }
      ],
      connections: [
        { id: "solar-west", from: "West solar", to: "West grid node", type: "feeder", capacity: "10 MW" },
        { id: "gas-central", from: "Central gas", to: "Central grid node", type: "feeder", capacity: "25 MW" },
        { id: "battery-east", from: "East battery", to: "East grid node", type: "feeder", capacity: "20 MW" },
        { id: "west-central", from: "West grid node", to: "Central grid node", type: "transmission", capacity: "∞ MW", expectedFlow: 10, label: "West to Central", bidirectional: true },
        { id: "central-east", from: "Central grid node", to: "East grid node", type: "transmission", capacity: "10 MW", expectedFlow: 10, label: "Central to East" },
        { id: "central-north", from: "Central grid node", to: "North load", type: "transmission", capacity: "25 MW", expectedFlow: 20, label: "Central to North" },
        { id: "east-south", from: "East grid node", to: "South load", type: "transmission", capacity: "25 MW", expectedFlow: 20, label: "East to South" }
      ],
      expectedLmp: { west: 50, central: 50, east: 60, north: 50, south: 60 },
      description: "A day-ahead curve schedule combines interpolation, a binding interface, and an East battery margin.",
      challenge: "Challenge: clear both loads while the 10 MW Central-to-East limit separates the $50 and $60 marginal curves.",
      explanation: "Central gas reaches $50/MWh for West, Central, and North through the bidirectional West-to-Central path. The full Central-to-East interface makes East battery's $60/MWh margin set East and South."
    }
  ];

  const constructionLevels = [
    {
      id: 0,
      title: "Level 0: Basic path",
      demand: 40,
      description: "One generator, one grid node, and one load. Build the simplest complete path.",
      nodes: [
        { id: "resource-1", type: "resource", name: "Generator", capacity: 40, offer: 20 },
        { id: "bus-1", type: "bus", name: "Grid node" },
        { id: "load-1", type: "load", name: "Load", demand: 40 }
      ],
      lines: [
        { id: "line-1", name: "Generator to grid", capacity: 50, flow: 40 },
        { id: "line-2", name: "Grid to load", capacity: 50, flow: 40 }
      ]
    },
    {
      id: 1,
      title: "Level 1: Shared supply",
      demand: 40,
      description: "Two generators share one grid node. Use both preset lines from generation and route the combined output to the load.",
      nodes: [
        { id: "solar-1", type: "resource", name: "Solar", capacity: 25, offer: 10 },
        { id: "gas-1", type: "resource", name: "Gas", capacity: 30, offer: 25 },
        { id: "hub-1", type: "bus", name: "Hub" },
        { id: "load-1", type: "load", name: "City load", demand: 40 }
      ],
      lines: [
        { id: "line-1", name: "Solar to hub", capacity: 30, flow: 25 },
        { id: "line-2", name: "Gas to hub", capacity: 30, flow: 15 },
        { id: "line-3", name: "Hub to city", capacity: 50, flow: 40 }
      ]
    },
    {
      id: 2,
      title: "Level 2: Split demand",
      demand: 60,
      description: "Serve two loads from two generators. The hub must balance both preset load flows.",
      nodes: [
        { id: "wind-1", type: "resource", name: "Wind", capacity: 30, offer: 5 },
        { id: "gas-1", type: "resource", name: "Gas", capacity: 40, offer: 30 },
        { id: "hub-1", type: "bus", name: "Hub" },
        { id: "north-1", type: "load", name: "North load", demand: 25 },
        { id: "south-1", type: "load", name: "South load", demand: 35 }
      ],
      lines: [
        { id: "line-1", name: "Wind to hub", capacity: 35, flow: 30 },
        { id: "line-2", name: "Gas to hub", capacity: 40, flow: 30 },
        { id: "line-3", name: "Hub to north", capacity: 30, flow: 25 },
        { id: "line-4", name: "Hub to south", capacity: 40, flow: 35 }
      ]
    },
    {
      id: 3,
      title: "Level 3: Two grid nodes",
      demand: 80,
      description: "Move power between two grid nodes while the west-to-hub interface carries the full 50 MW schedule.",
      nodes: [
        { id: "west-gas-1", type: "resource", name: "West gas", capacity: 50, offer: 20 },
        { id: "east-solar-1", type: "resource", name: "East solar", capacity: 30, offer: 5 },
        { id: "west-1", type: "bus", name: "West grid" },
        { id: "hub-1", type: "bus", name: "Central hub" },
        { id: "north-1", type: "load", name: "North load", demand: 30 },
        { id: "south-1", type: "load", name: "South load", demand: 50 }
      ],
      lines: [
        { id: "line-1", name: "West gas to west", capacity: 55, flow: 50 },
        { id: "line-2", name: "East solar to hub", capacity: 35, flow: 30 },
        { id: "line-3", name: "West to hub", capacity: 55, flow: 50 },
        { id: "line-4", name: "Hub to north", capacity: 35, flow: 30 },
        { id: "line-5", name: "Hub to south", capacity: 55, flow: 50 }
      ]
    },
    {
      id: 4,
      title: "Level 4: Constrained bridge",
      demand: 80,
      description: "Three grid nodes and three generators must be assembled around a constrained central-to-east bridge.",
      nodes: [
        { id: "wind-1", type: "resource", name: "West wind", capacity: 35, offer: 8 },
        { id: "gas-1", type: "resource", name: "Central gas", capacity: 45, offer: 28 },
        { id: "solar-1", type: "resource", name: "East solar", capacity: 25, offer: 12 },
        { id: "west-1", type: "bus", name: "West grid" },
        { id: "central-1", type: "bus", name: "Central grid" },
        { id: "east-1", type: "bus", name: "East grid" },
        { id: "north-1", type: "load", name: "North load", demand: 35 },
        { id: "south-1", type: "load", name: "South load", demand: 45 }
      ],
      lines: [
        { id: "line-1", name: "Wind to west", capacity: 40, flow: 35 },
        { id: "line-2", name: "Gas to central", capacity: 35, flow: 30 },
        { id: "line-3", name: "Solar to east", capacity: 25, flow: 15 },
        { id: "line-4", name: "West to central", capacity: 35, flow: 35 },
        { id: "line-5", name: "Central to east", capacity: 30, flow: 30 },
        { id: "line-6", name: "Central to north", capacity: 40, flow: 35 },
        { id: "line-7", name: "East to south", capacity: 50, flow: 45 }
      ]
    },
    {
      id: 5,
      title: "Level 5: Network balance",
      demand: 95,
      description: "Balance a five-node network with a west transfer, a central transfer, and two separate loads.",
      nodes: [
        { id: "wind-1", type: "resource", name: "North wind", capacity: 30, offer: 5 },
        { id: "gas-1", type: "resource", name: "West gas", capacity: 45, offer: 25 },
        { id: "battery-1", type: "resource", name: "East battery", capacity: 20, offer: 45 },
        { id: "west-1", type: "bus", name: "West grid" },
        { id: "central-1", type: "bus", name: "Central grid" },
        { id: "east-1", type: "bus", name: "East grid" },
        { id: "city-1", type: "load", name: "City load", demand: 40 },
        { id: "valley-1", type: "load", name: "Valley load", demand: 55 }
      ],
      lines: [
        { id: "line-1", name: "Wind to west", capacity: 35, flow: 30 },
        { id: "line-2", name: "Gas to central", capacity: 50, flow: 45 },
        { id: "line-3", name: "Battery to east", capacity: 25, flow: 20 },
        { id: "line-4", name: "West to central", capacity: 35, flow: 30 },
        { id: "line-5", name: "Central to east", capacity: 40, flow: 35 },
        { id: "line-6", name: "Central to city", capacity: 45, flow: 40 },
        { id: "line-7", name: "East to valley", capacity: 60, flow: 55 }
      ]
    }
  ];

  const dayAheadLevels = [
    {
      id: 0,
      title: "Level 0: Single-hour clearing",
      theme: "Merit order",
      demand: 70,
      description: "Clear one operating hour on a single unconstrained bus. The fixed offer prices are stacked from cheapest to most expensive.",
      challenge: "Challenge: make enough capacity available to serve the forecast, then identify the marginal accepted offer.",
      resources: [
        { id: "wind", name: "Wind farm", capacity: 25, offer: 10, className: "wind" },
        { id: "gas", name: "Gas plant", capacity: 25, offer: 35, className: "gas" },
        { id: "peaker", name: "Peaker plant", capacity: 30, offer: 80, className: "peaker" }
      ],
      expectedAwards: { wind: 25, gas: 25, peaker: 20 }
    },
    {
      id: 1,
      title: "Level 1: Curve dispatch",
      theme: "Piecewise-linear offers",
      demand: 90,
      controlMode: "dispatch",
      defaultDispatch: { wind: 0, solar: 0, gas: 0, hydro: 0, peaker: 0 },
      description: "Physical capacity is fixed. Choose the dispatch for each resource from its piecewise-linear offer curve.",
      challenge: "Challenge: serve 90 MW at the least cost. Increasing a resource past its low-cost segment raises its marginal offer.",
      resources: [
        { id: "wind", name: "West wind", capacity: 20, offer: 0, className: "wind", offerCurve: [{ mw: 0, price: 0 }, { mw: 20, price: 0 }] },
        { id: "solar", name: "Solar field", capacity: 20, offer: 8, className: "solar", offerCurve: [{ mw: 0, price: 8 }, { mw: 20, price: 8 }] },
        { id: "gas", name: "Gas plant", capacity: 30, offer: 20, className: "gas", offerCurve: [{ mw: 0, price: 20 }, { mw: 10, price: 20 }, { mw: 30, price: 34 }] },
        { id: "hydro", name: "Hydro unit", capacity: 15, offer: 35, className: "hydro", offerCurve: [{ mw: 0, price: 35 }, { mw: 15, price: 35 }] },
        { id: "peaker", name: "Peaker plant", capacity: 30, offer: 75, className: "peaker", offerCurve: [{ mw: 0, price: 75 }, { mw: 30, price: 75 }] }
      ],
      expectedAwards: { wind: 20, solar: 20, gas: 30, hydro: 15, peaker: 5 }
    },
    {
      id: 2,
      title: "Level 2: Congested interface",
      theme: "Nodal pricing",
      controlMode: "congestion",
      demand: 90,
      loadByZone: { west: 20, east: 70 },
      lineLimit: 25,
      loadLabel: "West: 20 MW · East: 70 MW",
      networkLabel: "25 MW (West → East)",
      defaultDispatch: { wind: 45, westGas: 0, eastGas: 45 },
      description: "Two buses are joined by a 25 MW interface. Cheap western energy cannot exceed the interface limit when serving the east load.",
      challenge: "Challenge: dispatch the constrained network and create the correct west/east LMP spread.",
      resources: [
        { id: "wind", name: "West wind", capacity: 45, offer: 10, className: "wind", zone: "west" },
        { id: "westGas", name: "West gas", capacity: 20, offer: 35, className: "gas", zone: "west" },
        { id: "eastGas", name: "East gas", capacity: 60, offer: 70, className: "peaker", zone: "east" }
      ],
      expectedAwards: { wind: 45, westGas: 0, eastGas: 45 },
      expectedFlow: 25,
      expectedNodeLmp: { west: 10, east: 70 }
    },
    {
      id: 3,
      title: "Level 3: Unit commitment",
      theme: "Three-hour commitment",
      controlMode: "commitment",
      hours: [{ id: 1, demand: 40 }, { id: 2, demand: 75 }, { id: 3, demand: 50 }],
      demand: 75,
      defaultCommitment: { wind: 1, gas: 1, peaker: 0 },
      description: "The day-ahead schedule covers three hours. Committing a unit incurs startup cost, even when it is not needed in every hour.",
      challenge: "Challenge: commit enough capacity for the 75 MW peak without paying to start the peaker.",
      resources: [
        { id: "wind", name: "Wind farm", capacity: 30, offer: 0, className: "wind", startupCost: 0 },
        { id: "gas", name: "Gas unit", capacity: 50, offer: 25, className: "gas", startupCost: 300 },
        { id: "peaker", name: "Peaker unit", capacity: 50, offer: 90, className: "peaker", startupCost: 50 }
      ],
      expectedAwards: { wind: 1, gas: 1, peaker: 0 }
    },
    {
      id: 4,
      title: "Level 4: Reserve co-optimization",
      theme: "Energy versus reserves",
      controlMode: "reserve",
      demand: 100,
      reserveRequirement: 20,
      defaultReserve: { wind: 0, gas: 20, hydro: 0, peaker: 0 },
      description: "The DAM must serve 100 MW and procure 20 MW of responsive reserve. Reserve awards reduce the energy capacity available from that resource.",
      challenge: "Challenge: place reserve on the lowest-cost capable resource while still serving all energy demand.",
      resources: [
        { id: "wind", name: "Wind farm", capacity: 40, offer: 0, className: "wind", reserveCapacity: 0, reserveOffer: 0 },
        { id: "gas", name: "Gas unit", capacity: 50, offer: 30, className: "gas", reserveCapacity: 20, reserveOffer: 5 },
        { id: "hydro", name: "Hydro unit", capacity: 30, offer: 45, className: "hydro", reserveCapacity: 30, reserveOffer: 30 },
        { id: "peaker", name: "Peaker unit", capacity: 40, offer: 90, className: "peaker", reserveCapacity: 40, reserveOffer: 30 }
      ],
      expectedAwards: { wind: 0, gas: 20, hydro: 0, peaker: 0 },
      expectedEnergyAwards: { wind: 40, gas: 30, hydro: 30, peaker: 0 }
    },
    {
      id: 5,
      title: "Level 5: Forecast risk",
      theme: "Day-ahead versus real-time",
      controlMode: "forecast",
      demand: 120,
      actualDemand: 130,
      defaultDispatch: { wind: 40, gas: 80, peaker: 0 },
      description: "The day-ahead wind forecast is 40 MW, but only 20 MW arrives in real time while actual load rises to 130 MW. The schedule is settled against the actual outcome.",
      challenge: "Challenge: submit a 120 MW day-ahead schedule, then measure the real-time balancing exposure and demand value.",
      resources: [
        { id: "wind", name: "Wind forecast", capacity: 40, offer: 0, className: "wind", actualCapacity: 20 },
        { id: "gas", name: "Gas unit", capacity: 80, offer: 30, className: "gas", actualCapacity: 80 },
        { id: "peaker", name: "Real-time peaker", capacity: 50, offer: 95, className: "peaker", actualCapacity: 50 }
      ],
      expectedAwards: { wind: 40, gas: 80, peaker: 0 }
    },
    {
      id: 6,
      title: "Level 6: Price curve dispatch",
      theme: "Continuous offers",
      controlMode: "dispatch",
      demand: 100,
      defaultDispatch: { wind: 35, solar: 25, gas: 40, peaker: 0 },
      description: "Continuous price curves replace one-step offers. Low-cost blocks are accepted first, then marginal costs rise as each unit is pushed past its first segment.",
      challenge: "Challenge: meet the economic demand target without committing the $100/MWh peaker.",
      resources: [
        { id: "wind", name: "Wind farm", capacity: 35, offer: 0, className: "wind", offerCurve: [{ mw: 0, price: 0 }, { mw: 35, price: 0 }] },
        { id: "solar", name: "Solar field", capacity: 25, offer: 15, className: "solar", offerCurve: [{ mw: 0, price: 15 }, { mw: 25, price: 15 }] },
        { id: "gas", name: "Flexible gas", capacity: 50, offer: 25, className: "gas", offerCurve: [{ mw: 0, price: 25 }, { mw: 20, price: 25 }, { mw: 50, price: 55 }] },
        { id: "peaker", name: "Peaker plant", capacity: 30, offer: 100, className: "peaker", offerCurve: [{ mw: 0, price: 100 }, { mw: 30, price: 100 }] }
      ],
      expectedAwards: { wind: 35, solar: 25, gas: 40, peaker: 0 }
    },
    {
      id: 7,
      title: "Level 7: Congested curves",
      theme: "Nodal price curves",
      controlMode: "congestion",
      demand: 100,
      loadByZone: { west: 35, east: 65 },
      lineLimit: 20,
      loadLabel: "West: 35 MW · East: 65 MW",
      networkLabel: "20 MW (West → East)",
      defaultDispatch: { westWind: 35, westGas: 20, eastBattery: 20, eastGas: 25 },
      description: "Continuous supply curves are split across two buses. The interface limit forces the east bus to use its own marginal supply.",
      challenge: "Challenge: serve both zonal loads while using the full 20 MW interface and preserving the demand curve value.",
      resources: [
        { id: "westWind", name: "West wind", capacity: 35, offer: 0, className: "wind", zone: "west", offerCurve: [{ mw: 0, price: 0 }, { mw: 35, price: 0 }] },
        { id: "westGas", name: "West gas", capacity: 30, offer: 25, className: "gas", zone: "west", offerCurve: [{ mw: 0, price: 20 }, { mw: 20, price: 25 }, { mw: 30, price: 40 }] },
        { id: "eastBattery", name: "East battery", capacity: 20, offer: 45, className: "battery", zone: "east", offerCurve: [{ mw: 0, price: 45 }, { mw: 20, price: 55 }] },
        { id: "eastGas", name: "East gas", capacity: 60, offer: 65, className: "peaker", zone: "east", offerCurve: [{ mw: 0, price: 60 }, { mw: 25, price: 65 }, { mw: 60, price: 90 }] }
      ],
      expectedAwards: { westWind: 35, westGas: 20, eastBattery: 20, eastGas: 25 },
      expectedFlow: 20,
      expectedNodeLmp: { west: 25, east: 65 }
    },
    {
      id: 8,
      title: "Level 8: Commitment and reserves",
      theme: "Multi-hour reliability",
      controlMode: "commitmentReserve",
      hours: [{ id: 1, demand: 70 }, { id: 2, demand: 110 }, { id: 3, demand: 85 }],
      demand: 110,
      reserveRequirement: 15,
      defaultCommitment: { wind: 1, gas: 1, hydro: 1, peaker: 0 },
      defaultReserve: { wind: 5, gas: 10, hydro: 0, peaker: 0 },
      description: "Commitment decisions cover three hours, while reserve sliders hold headroom back from energy dispatch. Startup costs make the best commitment non-obvious.",
      challenge: "Challenge: commit enough capacity for the peak and place 15 MW of reserve without starting the peaker.",
      resources: [
        { id: "wind", name: "Wind farm", capacity: 40, offer: 0, className: "wind", startupCost: 0, reserveCapacity: 5, reserveOffer: 0, offerCurve: [{ mw: 0, price: 0 }, { mw: 40, price: 0 }] },
        { id: "gas", name: "Gas unit", capacity: 60, offer: 30, className: "gas", startupCost: 300, reserveCapacity: 20, reserveOffer: 5, offerCurve: [{ mw: 0, price: 30 }, { mw: 20, price: 30 }, { mw: 60, price: 45 }] },
        { id: "hydro", name: "Hydro unit", capacity: 40, offer: 45, className: "hydro", startupCost: 150, reserveCapacity: 30, reserveOffer: 10, offerCurve: [{ mw: 0, price: 45 }, { mw: 40, price: 60 }] },
        { id: "peaker", name: "Peaker unit", capacity: 50, offer: 110, className: "peaker", startupCost: 50, reserveCapacity: 30, reserveOffer: 35, offerCurve: [{ mw: 0, price: 110 }, { mw: 50, price: 110 }] }
      ],
      expectedAwards: { wind: 1, gas: 1, hydro: 1, peaker: 0 },
      expectedReserveAwards: { wind: 5, gas: 10, hydro: 0, peaker: 0 }
    },
    {
      id: 9,
      title: "Level 9: Integrated DAM",
      theme: "Network reliability",
      controlMode: "integrated",
      demand: 120,
      loadByZone: { west: 50, east: 70 },
      lineLimit: 15,
      reserveRequirement: 20,
      loadLabel: "West: 50 MW · East: 70 MW",
      networkLabel: "15 MW (West → East)",
      defaultCommitment: { westWind: 1, westGas: 1, eastGas: 1, peaker: 0 },
      defaultReserve: { westWind: 5, westGas: 10, eastGas: 5, peaker: 0 },
      description: "The final tutorial combines a zonal transmission limit, a price-sensitive load, startup costs, and a reserve requirement.",
      challenge: "Challenge: keep the east load supplied, reserve 20 MW, and avoid starting the peaker while respecting the 15 MW interface.",
      resources: [
        { id: "westWind", name: "West wind", capacity: 40, offer: 0, className: "wind", zone: "west", startupCost: 0, reserveCapacity: 5, reserveOffer: 0, offerCurve: [{ mw: 0, price: 0 }, { mw: 40, price: 0 }] },
        { id: "westGas", name: "West gas", capacity: 40, offer: 35, className: "gas", zone: "west", startupCost: 250, reserveCapacity: 20, reserveOffer: 8, offerCurve: [{ mw: 0, price: 35 }, { mw: 20, price: 35 }, { mw: 40, price: 50 }] },
        { id: "eastGas", name: "East gas", capacity: 60, offer: 60, className: "cycle", zone: "east", startupCost: 400, reserveCapacity: 20, reserveOffer: 12, offerCurve: [{ mw: 0, price: 60 }, { mw: 30, price: 60 }, { mw: 60, price: 75 }] },
        { id: "peaker", name: "East peaker", capacity: 50, offer: 110, className: "peaker", zone: "east", startupCost: 50, reserveCapacity: 30, reserveOffer: 25, offerCurve: [{ mw: 0, price: 110 }, { mw: 50, price: 110 }] }
      ],
      expectedAwards: { westWind: 1, westGas: 1, eastGas: 1, peaker: 0 },
      expectedReserveAwards: { westWind: 5, westGas: 10, eastGas: 5, peaker: 0 },
      expectedFlow: 15,
      expectedNodeLmp: { west: 42.5, east: 72.5 }
    },
    {
      id: 10,
      title: "Level 10: Capstone market",
      theme: "Full co-optimization",
      controlMode: "integrated",
      hours: [{ id: 1, demand: 110 }, { id: 2, demand: 135 }],
      demand: 135,
      loadByZone: { west: 55, east: 80 },
      lineLimit: 20,
      reserveRequirement: 25,
      loadLabel: "West: 55 MW · East: 80 MW",
      networkLabel: "20 MW (West → East)",
      defaultCommitment: { westWind: 1, westGas: 1, eastSolar: 1, eastGas: 1, peaker: 0 },
      defaultReserve: { westWind: 5, westGas: 10, eastSolar: 5, eastGas: 5, peaker: 0 },
      description: "A two-hour network schedule combines rising offer curves, zonal transmission, startup costs, commitment, and operating reserves.",
      resources: [
        { id: "westWind", name: "West wind", capacity: 50, offer: 0, className: "wind", zone: "west", startupCost: 0, reserveCapacity: 5, reserveOffer: 0, offerCurve: [{ mw: 0, price: 0 }, { mw: 50, price: 0 }] },
        { id: "westGas", name: "West gas", capacity: 50, offer: 35, className: "gas", zone: "west", startupCost: 250, reserveCapacity: 20, reserveOffer: 8, offerCurve: [{ mw: 0, price: 35 }, { mw: 25, price: 35 }, { mw: 50, price: 55 }] },
        { id: "eastSolar", name: "East solar", capacity: 30, offer: 20, className: "solar", zone: "east", startupCost: 0, reserveCapacity: 5, reserveOffer: 0, offerCurve: [{ mw: 0, price: 20 }, { mw: 30, price: 20 }] },
        { id: "eastGas", name: "East gas", capacity: 70, offer: 60, className: "cycle", zone: "east", startupCost: 400, reserveCapacity: 25, reserveOffer: 12, offerCurve: [{ mw: 0, price: 60 }, { mw: 40, price: 60 }, { mw: 70, price: 85 }] },
        { id: "peaker", name: "East peaker", capacity: 50, offer: 110, className: "peaker", zone: "east", startupCost: 50, reserveCapacity: 30, reserveOffer: 25, offerCurve: [{ mw: 0, price: 110 }, { mw: 50, price: 110 }] }
      ],
      expectedAwards: { westWind: 1, westGas: 1, eastSolar: 1, eastGas: 1, peaker: 0 },
      expectedReserveAwards: { westWind: 5, westGas: 10, eastSolar: 5, eastGas: 5, peaker: 0 },
      expectedFlow: 20,
      expectedNodeLmp: { west: 39, east: 60 }
    }
  ];

  function numericCapacity(value) {
    if (value === Infinity || value === "∞") return Infinity;
    const text = String(value ?? "").trim().toLowerCase();
    if (text.includes("∞") || text.includes("infinite") || text.includes("no limit")) return Infinity;
    const parsed = Number.parseFloat(text);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function offerCurvePoints(resource) {
    const points = resource?.offerCurve?.points;
    return Array.isArray(points) ? points.map((point) => ({ mw: Number(point.mw), price: Number(point.price) })) : [];
  }

  function interpolatedCurvePrice(points, mw) {
    if (!points.length) return NaN;
    if (mw <= points[0].mw) return points[0].price;
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      if (mw <= current.mw) {
        const fraction = (mw - previous.mw) / (current.mw - previous.mw);
        return previous.price + (current.price - previous.price) * fraction;
      }
    }
    return points[points.length - 1].price;
  }

  function linearOfferBlocks(resource) {
    const points = offerCurvePoints(resource);
    if (points.length < 2 || points.some((point) => !Number.isFinite(point.mw) || !Number.isFinite(point.price))) return [];
    const resolution = Math.max(0.1, Number(resource.offerCurve.resolution) || 1);
    const blocks = [];
    let previousMw = 0;
    points.forEach((point) => {
      const endMw = point.mw;
      while (previousMw < endMw - 0.000001) {
        const nextMw = Math.min(endMw, previousMw + resolution);
        blocks.push({ quantity: nextMw - previousMw, offer: interpolatedCurvePrice(points, nextMw) });
        previousMw = nextMw;
      }
    });
    return blocks;
  }

  function supplyBlocks(resource) {
    if (resource?.offerCurve?.style === "linear") {
      const curveBlocks = linearOfferBlocks(resource);
      if (curveBlocks.length) return curveBlocks;
    }
    if (Array.isArray(resource.supplyCurve) && resource.supplyCurve.length) {
      return resource.supplyCurve.map((block) => ({ quantity: Number(block.quantity), offer: Number(block.offer) }));
    }
    return [{ quantity: Number(resource.capacity), offer: Number(resource.offer) }];
  }

  function solveMinCostFlow(level, target = null) {
    const sourceName = "__source__";
    const sinkName = "__sink__";
    const nodes = new Map();
    const graph = [];
    const nodeIndex = (name) => {
      if (!nodes.has(name)) {
        nodes.set(name, graph.length);
        graph.push([]);
      }
      return nodes.get(name);
    };
    const addEdge = (fromName, toName, capacity, cost, meta = null) => {
      const from = nodeIndex(fromName);
      const to = nodeIndex(toName);
      const forward = { to, rev: graph[to].length, cap: capacity, cost, initialCapacity: capacity, meta };
      const reverse = { to: from, rev: graph[from].length, cap: 0, cost: -cost, initialCapacity: 0, meta: null };
      graph[from].push(forward);
      graph[to].push(reverse);
      return forward;
    };
    const totalDemand = level.loads.reduce((sum, load) => sum + Number(load.demand), 0);
    const extraDemand = target ? 1 : 0;
    const finiteCapacity = (capacity) => Number.isFinite(capacity) ? capacity : totalDemand + extraDemand + 1;
    const transmissionEdges = {};
    const feederCapacity = new Map();
    level.connections.filter((connection) => connection.type === "feeder").forEach((connection) => {
      feederCapacity.set(connection.from, finiteCapacity(numericCapacity(connection.capacity)));
      addEdge(connection.from, connection.to, feederCapacity.get(connection.from), 0, { type: "feeder", id: connection.id });
    });
    level.resources.forEach((resource) => {
      supplyBlocks(resource).forEach((block, index) => {
        addEdge(sourceName, resource.name, finiteCapacity(Number(block.quantity)), Number(block.offer), {
          type: "generation", resourceId: resource.id, blockIndex: index, offer: Number(block.offer)
        });
      });
    });
    level.connections.filter((connection) => connection.type === "transmission").forEach((connection) => {
      const capacity = finiteCapacity(numericCapacity(connection.capacity));
      transmissionEdges[connection.id] = addEdge(connection.from, connection.to, capacity, 0, {
        type: "transmission", id: connection.id
      });
      if (connection.bidirectional) addEdge(connection.to, connection.from, capacity, 0, { type: "transmission-reverse", id: connection.id });
    });
    level.loads.forEach((load) => {
      const extra = target?.kind === "load" && target.id === load.id ? extraDemand : 0;
      addEdge(load.name, sinkName, Number(load.demand) + extra, 0, { type: "load", id: load.id });
    });
    if (target?.kind === "bus") addEdge(target.name, sinkName, extraDemand, 0, { type: "synthetic-load", id: target.id });

    const source = nodeIndex(sourceName);
    const sink = nodeIndex(sinkName);
    const required = totalDemand + extraDemand;
    let flow = 0;
    let cost = 0;
    const epsilon = 0.000001;
    while (flow < required - epsilon) {
      const distance = Array(graph.length).fill(Infinity);
      const previous = Array(graph.length).fill(null);
      distance[source] = 0;
      for (let pass = 0; pass < graph.length - 1; pass += 1) {
        let changed = false;
        for (let from = 0; from < graph.length; from += 1) {
          if (!Number.isFinite(distance[from])) continue;
          graph[from].forEach((edge, edgeIndex) => {
            if (edge.cap <= epsilon) return;
            const nextDistance = distance[from] + edge.cost;
            if (nextDistance < distance[edge.to] - epsilon) {
              distance[edge.to] = nextDistance;
              previous[edge.to] = { from, edgeIndex };
              changed = true;
            }
          });
        }
        if (!changed) break;
      }
      if (!Number.isFinite(distance[sink])) break;
      let augment = required - flow;
      for (let current = sink; current !== source;) {
        const step = previous[current];
        if (!step) { augment = 0; break; }
        augment = Math.min(augment, graph[step.from][step.edgeIndex].cap);
        current = step.from;
      }
      if (augment <= epsilon) break;
      for (let current = sink; current !== source;) {
        const step = previous[current];
        const edge = graph[step.from][step.edgeIndex];
        edge.cap -= augment;
        graph[current][edge.rev].cap += augment;
        current = step.from;
      }
      flow += augment;
      cost += augment * distance[sink];
    }

    const generation = {};
    const generationOffers = {};
    graph.forEach((edges) => edges.forEach((edge) => {
      if (!edge.meta || edge.meta.type !== "generation") return;
      const dispatched = edge.initialCapacity - edge.cap;
      generation[edge.meta.resourceId] = (generation[edge.meta.resourceId] || 0) + dispatched;
      if (dispatched > epsilon) generationOffers[edge.meta.resourceId] = Math.max(generationOffers[edge.meta.resourceId] || 0, edge.meta.offer);
    }));
    const transmissionFlows = Object.fromEntries(Object.entries(transmissionEdges).map(([id, edge]) => [id, edge.initialCapacity - edge.cap]));
    return {
      feasible: flow >= required - epsilon,
      flow,
      required,
      cost,
      generation,
      generationOffers,
      transmissionFlows,
      globalMarginal: Math.max(...Object.values(generationOffers), 0)
    };
  }

  function regionalMarginalOffer(level, target, base) {
    const adjacency = new Map();
    level.buses.concat(level.loads).forEach((node) => adjacency.set(node.name, []));
    level.connections.filter((connection) => connection.type === "transmission").forEach((connection) => {
      if (adjacency.has(connection.from)) adjacency.get(connection.from).push(connection.to);
      if (connection.bidirectional && adjacency.has(connection.to)) adjacency.get(connection.to).push(connection.from);
    });
    const canReach = (start, destination) => {
      const seen = new Set([start]);
      const queue = [start];
      while (queue.length) {
        const current = queue.shift();
        if (current === destination) return true;
        (adjacency.get(current) || []).forEach((next) => {
          if (!seen.has(next)) { seen.add(next); queue.push(next); }
        });
      }
      return false;
    };
    const targetName = target.name;
    const regionalResources = level.resources
      .filter((resource) => {
        const feeder = level.connections.find((connection) => connection.type === "feeder" && connection.from === resource.name);
        return feeder && canReach(feeder.to, targetName);
      });
    const regionalOffers = regionalResources
      .filter((resource) => base.generation[resource.id] > 0.000001)
      .map((resource) => base.generationOffers[resource.id])
      .filter((offer) => Number.isFinite(offer));
    const hasRegionalHeadroom = regionalResources.some((resource) => {
      const capacity = supplyBlocks(resource).reduce((sum, block) => sum + block.quantity, 0);
      return capacity - (base.generation[resource.id] || 0) > 0.000001;
    });
    return hasRegionalHeadroom && regionalOffers.length ? Math.max(...regionalOffers) : base.globalMarginal;
  }

  function constrainedMarginalLmp(level) {
    const base = solveMinCostFlow(level);
    if (!base.feasible) return { feasible: false, lmp: {}, base };
    const lmp = {};
    const hasLinearCurve = level.resources.some((resource) => resource.offerCurve?.style === "linear");
    const nodes = level.buses.map((bus) => ({ kind: "bus", id: bus.id, name: bus.name }))
      .concat(level.loads.map((load) => ({ kind: "load", id: load.id, name: load.name })));
    nodes.forEach((node) => {
      const perturbed = solveMinCostFlow(level, node);
      lmp[node.id] = hasLinearCurve
        ? regionalMarginalOffer(level, node, base)
        : (perturbed.feasible ? Math.round((perturbed.cost - base.cost) * 100) / 100 : regionalMarginalOffer(level, node, base));
    });
    return { feasible: true, lmp, base };
  }

  function validateLevel(level) {
    const errors = [];
    const suggestedFixes = [];
    const buses = new Set(level.buses.map((bus) => bus.name));
    const loads = new Set(level.loads.map((load) => load.name));
    const resources = new Map(level.resources.map((resource) => [resource.name, resource]));
    const allNodes = new Set([...buses, ...loads]);
    const resourceBus = new Map();
    const transmissions = level.connections.filter((connection) => connection.type === "transmission");
    const flowSolution = Object.fromEntries(transmissions.map((connection) => [connection.id, Number(connection.expectedFlow)]));
    const localGeneration = new Map(level.buses.map((bus) => [bus.name, 0]));
    const dispatch = {};
    const offers = [];
    const dispatchedOffers = [];
    let expectedDispatchCost = 0;

    level.connections.forEach((connection) => {
      if (!allNodes.has(connection.to) || !allNodes.has(connection.from) && !resources.has(connection.from)) {
        errors.push(`Connection ${connection.id} references an unknown endpoint.`);
      }
      if (connection.type === "feeder") {
        if (!resources.has(connection.from) || !buses.has(connection.to)) errors.push(`Feeder ${connection.id} must connect a resource to a bus.`);
        else resourceBus.set(connection.from, connection.to);
      }
    });

    level.resources.forEach((resource) => {
      const blocks = supplyBlocks(resource);
      if (!resourceBus.has(resource.name)) errors.push(`${resource.name} is not connected to a bus.`);
      if (resource.offerCurve?.style === "linear") {
        const points = offerCurvePoints(resource);
        const curveInvalid = points.length < 2 || points.some((point, index) => {
          const previous = points[index - 1];
          return !Number.isFinite(point.mw) || !Number.isFinite(point.price) || point.mw < 0 || (previous && point.mw <= previous.mw) || (previous && point.price < previous.price);
        });
        if (curveInvalid) errors.push(`${resource.name} has an invalid non-decreasing offer curve.`);
        else if (Math.abs(points[points.length - 1].mw - Number(resource.capacity)) > 0.0001) errors.push(`${resource.name}'s offer curve capacity does not match its resource capacity.`);
      }
      blocks.forEach((block) => {
        if (!Number.isFinite(block.quantity) || block.quantity < 0 || !Number.isFinite(block.offer) || block.offer < 0) errors.push(`${resource.name} has an invalid supply block.`);
        offers.push(block);
      });
    });

    const inflow = new Map([...allNodes].map((node) => [node, 0]));
    const outflow = new Map([...allNodes].map((node) => [node, 0]));
    transmissions.forEach((connection) => {
      const flow = flowSolution[connection.id];
      const capacity = numericCapacity(connection.capacity);
      if (!Number.isFinite(flow) || flow < 0) errors.push(`${connection.id} has an invalid expected flow.`);
      if (Number.isNaN(capacity) || capacity < 0) errors.push(`${connection.id} has an invalid transmission capacity.`);
      if (Number.isFinite(flow) && Number.isFinite(capacity) && flow > capacity + 0.0001) errors.push(`${connection.id} exceeds its transmission limit.`);
      if (allNodes.has(connection.from)) outflow.set(connection.from, outflow.get(connection.from) + (Number.isFinite(flow) ? flow : 0));
      if (allNodes.has(connection.to)) inflow.set(connection.to, inflow.get(connection.to) + (Number.isFinite(flow) ? flow : 0));
    });

    level.loads.forEach((load) => {
      const served = inflow.get(load.name) - outflow.get(load.name);
      if (Math.abs(served - Number(load.demand)) > 0.0001) errors.push(`${load.name} is served by ${served} MW instead of ${load.demand} MW.`);
      if (load.demandCurve?.style === "linear") {
        const points = Array.isArray(load.demandCurve.points) ? load.demandCurve.points.map((point) => ({ mw: Number(point.mw), price: Number(point.value) })) : [];
        const curveInvalid = points.length < 2 || points.some((point, index) => {
          const previous = points[index - 1];
          return !Number.isFinite(point.mw) || !Number.isFinite(point.price) || point.mw < 0 || (previous && point.mw <= previous.mw) || (previous && point.price > previous.price);
        });
        if (curveInvalid) errors.push(`${load.name} has an invalid non-increasing demand curve.`);
      }
    });
    level.buses.forEach((bus) => {
      const required = outflow.get(bus.name) - inflow.get(bus.name);
      if (required < -0.0001) errors.push(`${bus.name} has excess incoming transmission flow.`);
      localGeneration.set(bus.name, Math.max(0, required));
      const busResources = level.resources.filter((resource) => resourceBus.get(resource.name) === bus.name);
      const available = busResources.reduce((sum, resource) => sum + supplyBlocks(resource).reduce((subtotal, block) => subtotal + block.quantity, 0), 0);
      if (required > available + 0.0001) errors.push(`${bus.name} needs ${required} MW but has only ${available} MW of connected capacity.`);
      let remaining = Math.max(0, required);
      busResources.flatMap((resource) => supplyBlocks(resource).map((block) => ({ resource, ...block }))).sort((a, b) => a.offer - b.offer).forEach((block) => {
        const output = Math.min(remaining, block.quantity);
        dispatch[block.resource.id] = (dispatch[block.resource.id] || 0) + output;
        if (output > 0.0001) {
          dispatchedOffers.push(block.offer);
          expectedDispatchCost += output * block.offer;
        }
        remaining -= output;
      });
      if (remaining > 0.0001) errors.push(`${bus.name} cannot meet its required local generation.`);
    });

    const totalDemand = level.loads.reduce((sum, load) => sum + Number(load.demand), 0);
    const totalGeneration = [...localGeneration.values()].reduce((sum, value) => sum + value, 0);
    if (Math.abs(totalGeneration - totalDemand) > 0.0001) errors.push(`Generation is ${totalGeneration} MW for ${totalDemand} MW of demand.`);
    const sortedOffers = offers.filter((block) => Number.isFinite(block.quantity) && block.quantity > 0).sort((a, b) => a.offer - b.offer);
    let remainingDemand = totalDemand;
    sortedOffers.forEach((block) => {
      if (remainingDemand > 0) remainingDemand -= block.quantity;
    });
    if (remainingDemand > 0.0001) errors.push("Total supply capacity is below total demand.");
    const globalMarginal = dispatchedOffers.length ? Math.max(...dispatchedOffers) : null;

    const solutionLmp = { ...(level.expectedLmp || {}) };
    const lmpValues = Object.values(solutionLmp).map(Number);
    const offerValues = new Set(offers.map((block) => block.offer));
    if ([...level.buses, ...level.loads].some((node) => !Number.isFinite(Number(solutionLmp[node.id])))) errors.push("Every bus and load needs an LMP answer.");
    if (lmpValues.some((value) => ![...offerValues].some((offer) => Math.abs(value - offer) <= 0.01))) errors.push("An LMP does not match a valid marginal offer.");
    const hasBindingLine = transmissions.some((connection) => {
      const capacity = numericCapacity(connection.capacity);
      return Number.isFinite(capacity) && Math.abs(flowSolution[connection.id] - capacity) <= 0.0001;
    });
    if (!hasBindingLine && lmpValues.some((value) => Math.abs(value - globalMarginal) > 0.01)) errors.push("Uncongested nodes do not share the system marginal offer.");
    if (hasBindingLine && Math.abs(Math.max(...lmpValues) - globalMarginal) > 0.01) errors.push("The highest congested-node LMP is not the system marginal offer.");

    const marginalCheck = constrainedMarginalLmp(level);
    if (!marginalCheck.feasible) {
      errors.push("The network cannot produce a feasible least-cost dispatch for its fixed demand.");
      suggestedFixes.push({ type: "structural", reason: "The fixed demand cannot be served by the current network." });
    } else {
      if (marginalCheck.base.cost < expectedDispatchCost - 0.01) {
        const savings = Math.round((expectedDispatchCost - marginalCheck.base.cost) * 100) / 100;
        errors.push(`Expected flows are not least-cost; the network solver finds a schedule ${savings} cheaper.`);
        suggestedFixes.push({ type: "flows", flows: marginalCheck.base.transmissionFlows, reason: "Replace the schedule with the feasible least-cost transmission flows." });
      }
      Object.entries(marginalCheck.lmp).forEach(([nodeId, expected]) => {
        const submitted = Number(solutionLmp[nodeId]);
        if (!Number.isFinite(submitted) || Math.abs(submitted - expected) > 0.01) {
          errors.push(`LMP ${nodeId} should be ${expected} under the constrained marginal check, not ${submitted}.`);
          suggestedFixes.push({ type: "lmp", nodeId, value: expected, reason: "Use the constrained one-MW marginal cost." });
        }
      });
      level.loads.filter((load) => load.demandCurve?.style === "linear").forEach((load) => {
        const points = (load.demandCurve.points || []).map((point) => ({ mw: Number(point.mw), price: Number(point.value) }));
        if (points.length >= 2 && points.every((point) => Number.isFinite(point.mw) && Number.isFinite(point.price))) {
          const marginalValue = interpolatedCurvePrice(points, Number(load.demand));
          const loadLmp = Number(marginalCheck.lmp[load.id]);
          if (Number.isFinite(marginalValue) && Number.isFinite(loadLmp) && loadLmp > marginalValue + 0.01) errors.push(`${load.name} clears above its marginal willingness to pay.`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      suggestedFixes,
      solution: { lmp: solutionLmp, flows: flowSolution, dispatch, totalDemand, totalGeneration, globalMarginal, marginalCheck }
    };
  }

  function correctLevel(level, validation) {
    let changed = false;
    const applied = [];
    validation.suggestedFixes.forEach((fix) => {
      if (fix.type === "lmp" && Number.isFinite(fix.value)) {
        if (Number(level.expectedLmp?.[fix.nodeId]) !== Number(fix.value)) {
          level.expectedLmp = { ...(level.expectedLmp || {}), [fix.nodeId]: fix.value };
          changed = true;
          applied.push(`LMP ${fix.nodeId} → ${fix.value}`);
        }
      }
      if (fix.type === "flows" && fix.flows && typeof fix.flows === "object") {
        Object.entries(fix.flows).forEach(([connectionId, flow]) => {
          const connection = level.connections.find((candidate) => candidate.id === connectionId && candidate.type === "transmission");
          if (connection && Number.isFinite(flow) && Number(connection.expectedFlow) !== Number(flow)) {
            connection.expectedFlow = flow;
            changed = true;
            applied.push(`${connection.label || connection.id} flow → ${flow} MW`);
          }
        });
      }
    });
    return { changed, applied };
  }

  function levelDefinitionSignature(level) {
    return JSON.stringify({
      lmp: level.expectedLmp || {},
      flows: level.connections.filter((connection) => connection.type === "transmission").map((connection) => [connection.id, connection.expectedFlow])
    });
  }

  function validateAndRepairLevels() {
    const maxRepairAttempts = 4;
    levels.forEach((level) => {
      const seen = new Set();
      const repairLog = [];
      let validation = null;
      for (let attempt = 0; attempt <= maxRepairAttempts; attempt += 1) {
        validation = validateLevel(level);
        if (validation.valid) break;
        const signature = levelDefinitionSignature(level);
        if (seen.has(signature) || attempt === maxRepairAttempts) break;
        seen.add(signature);
        const correction = correctLevel(level, validation);
        if (!correction.changed) break;
        repairLog.push({ attempt: attempt + 1, changes: correction.applied });
      }
      level.validation = validation || validateLevel(level);
      level.solution = level.validation.solution;
      level.repairLog = repairLog;
      level.validationAttempts = repairLog.length;
      if (!level.validation.valid) console.warn(`${level.title} validation failed after ${repairLog.length} repair attempt${repairLog.length === 1 ? "" : "s"}: ${level.validation.errors.join(" ")}`);
    });
  }

  validateAndRepairLevels();

  const state = {
    screen: "select",
    levelId: null,
    launching: false,
    statuses: new Map(),
    answers: {},
    checked: false,
    revealed: false,
    activeTarget: null,
    constructionLevelId: null,
    constructionStatuses: new Map(),
    constructionDrafts: new Map(),
    construction: { nodes: [], lines: [], selected: null, checked: false, revealed: false, dragging: null },
    dayAheadLevelId: null,
    dayAheadStatuses: new Map(),
    dayAheadOffers: {},
    dayAheadResult: null,
    theme: localStorage.getItem(THEME_KEY) === "night" ? "night" : "day"
  };
  const els = {};

  function cacheElements() {
    [
      "mode-select-screen", "lmp-mode-button", "network-mode-button", "day-ahead-mode-button", "mode-back-button", "day-ahead-select-screen", "day-ahead-mode-back-button", "day-ahead-full-reset-button", "day-ahead-level-circles", "day-ahead-level-message", "day-ahead-level-screen", "day-ahead-back-button", "day-ahead-reset-button", "day-ahead-level-title", "day-ahead-level-description", "day-ahead-hours-summary", "day-ahead-demand", "day-ahead-reserve-summary", "day-ahead-network-summary", "day-ahead-offers", "day-ahead-stack", "day-ahead-stack-max", "day-ahead-run-button", "day-ahead-check-button", "day-ahead-result", "day-ahead-prev-button", "day-ahead-next-button", "construction-select-screen", "construction-mode-back-button", "construction-full-reset-button", "construction-level-circles", "construction-level-screen", "construction-back-button", "construction-reset-button", "construction-level-title", "construction-level-description", "construction-piece-tray", "construction-map", "construction-lines", "construction-nodes", "construction-inspector", "construction-check-button", "construction-reveal-button", "construction-feedback", "construction-prev-button", "construction-next-button", "level-select-screen", "level-screen", "level-circles", "level-select-message",
      "back-button", "reset-level-button", "level-page-title", "map-connections", "map-resources",
      "map-buses", "map-loads", "network-map", "map-title", "map-description", "map-hover-popover",
      "solve-popover", "check-network-button", "network-feedback", "completion-panel", "completion-title",
      "theme-toggle", "full-reset-select-button", "level-description", "reveal-answer-button",
      "completion-message", "next-level-button"
    ].forEach((id) => { els[id] = document.getElementById(id); });
  }

  function formatMoney(value) { return `$${Number(value).toFixed(2)}`; }
  function getLevel(id = state.levelId) { return levels.find((level) => level.id === id) || levels[0]; }
  function statusColor(status) { return colors[status] || colors.gray; }
  function isSolved(id) { return ["yellow", "green"].includes(state.statuses.get(id)); }
  function yellowCount() { return [...state.statuses.values()].filter((status) => status === "yellow").length; }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    if (els["theme-toggle"]) {
      els["theme-toggle"].textContent = state.theme === "night" ? "☀" : "☾";
      els["theme-toggle"].setAttribute("aria-label", state.theme === "night" ? "Switch to day theme" : "Switch to night theme");
    }
  }

  function targetStatus(kind, id) {
    if (kind === "resource") return "neutral";
    const answer = state.answers[`${kind === "connection" ? "flow" : "lmp"}:${id}`];
    if (!Number.isFinite(answer)) return "red";
    if (!state.checked) return "yellow";
    if (state.statuses.get(state.levelId) === "green") return "green";
    return "yellow";
  }

  function isActiveTarget(kind, id) {
    return state.activeTarget && state.activeTarget.kind === kind && state.activeTarget.id === id;
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      const entries = saved && typeof saved === "object" ? Object.entries(saved.statuses || {}) : [];
      state.statuses = new Map(entries.filter(([id, status]) => levels.some((level) => level.id === Number(id)) && ["yellow", "green"].includes(status)).map(([id, status]) => [Number(id), status]));
      const constructionEntries = saved && typeof saved === "object" ? Object.entries(saved.constructionStatuses || {}) : [];
      state.constructionStatuses = new Map(constructionEntries.filter(([id, status]) => constructionLevels.some((level) => level.id === Number(id)) && status === "green").map(([id, status]) => [Number(id), status]));
      const drafts = saved && typeof saved === "object" && saved.constructionDrafts && typeof saved.constructionDrafts === "object" ? Object.entries(saved.constructionDrafts) : [];
      state.constructionDrafts = new Map(drafts.filter(([id]) => constructionLevels.some((level) => level.id === Number(id))).map(([id, draft]) => [Number(id), draft]));
      const dayAheadEntries = saved && typeof saved === "object" ? Object.entries(saved.dayAheadStatuses || {}) : [];
      state.dayAheadStatuses = new Map(dayAheadEntries.filter(([id, status]) => dayAheadLevels.some((level) => level.id === Number(id)) && ["yellow", "green"].includes(status)).map(([id, status]) => [Number(id), status]));
      state.dayAheadOffers = saved && typeof saved === "object" && saved.dayAheadOffers && typeof saved.dayAheadOffers === "object" ? saved.dayAheadOffers : {};
      if (Number(saved.dayAheadOfferVersion) !== DAY_AHEAD_INPUT_VERSION) {
        const existingIds = dayAheadLevels.filter((level) => level.id <= 5).map((level) => level.id);
        state.dayAheadStatuses = new Map(existingIds.filter((id) => state.dayAheadStatuses.has(id)).map((id) => [id, state.dayAheadStatuses.get(id)]));
        state.dayAheadOffers = {};
      }
    } catch {
      state.statuses = new Map();
      state.constructionStatuses = new Map();
      state.constructionDrafts = new Map();
      state.dayAheadStatuses = new Map();
      state.dayAheadOffers = {};
    }
  }

  function saveProgress() {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({
      statuses: Object.fromEntries(state.statuses),
      constructionStatuses: Object.fromEntries(state.constructionStatuses),
      constructionDrafts: Object.fromEntries(state.constructionDrafts),
      dayAheadStatuses: Object.fromEntries(state.dayAheadStatuses),
      dayAheadOffers: state.dayAheadOffers,
      dayAheadOfferVersion: DAY_AHEAD_INPUT_VERSION
    }));
  }

  function isUnlocked(level) {
    if (!level || !level.playable) return false;
    if (level.validation && !level.validation.valid) return false;
    if (level.id === 0) return true;
    return isSolved(level.id - 1) && yellowCount() <= 1;
  }

  function levelStatus(level) {
    return state.statuses.get(level.id) || (isUnlocked(level) ? "red" : "gray");
  }

  function renderLevelSelect() {
    state.screen = "select";
    state.launching = false;
    els["mode-select-screen"].hidden = true;
    els["day-ahead-select-screen"].hidden = true;
    els["day-ahead-level-screen"].hidden = true;
    els["construction-select-screen"].hidden = true;
    els["construction-level-screen"].hidden = true;
    els["level-select-screen"].hidden = false;
    els["level-screen"].hidden = true;
    const unlockedIds = levels.filter((level) => isUnlocked(level)).map((level) => level.id);
    const latestUnlockedId = Math.max(...unlockedIds);
    els["level-circles"].innerHTML = levels.map((level) => {
      const unlocked = isUnlocked(level);
      const status = levelStatus(level);
      const classes = ["level-circle", `status-${status}`, level.id === latestUnlockedId ? "is-latest" : "", !unlocked ? "is-locked" : ""].filter(Boolean).join(" ");
      return `<button type="button" class="${classes}" data-level="${level.id}" style="--burst-color:${statusColor(status)}" ${unlocked ? "" : "disabled"} aria-label="${level.title}${unlocked ? "" : ", locked"}">${level.id}</button>`;
    }).join("");
    const yellow = yellowCount();
    if (yellow >= 2) {
      const needed = yellow - 1;
      els["level-select-message"].hidden = false;
      els["level-select-message"].textContent = `Solve ${needed} more level${needed === 1 ? "" : "s"} perfectly to unlock.`;
    } else {
      els["level-select-message"].hidden = true;
      els["level-select-message"].textContent = "";
    }
    els["level-circles"].querySelectorAll("[data-level]").forEach((button) => {
      button.addEventListener("click", () => launchLevel(Number(button.dataset.level)));
    });
  }

  function renderModeSelect() {
    state.screen = "modes";
    state.launching = false;
    els["mode-select-screen"].hidden = false;
    els["day-ahead-select-screen"].hidden = true;
    els["day-ahead-level-screen"].hidden = true;
    els["construction-select-screen"].hidden = true;
    els["construction-level-screen"].hidden = true;
    els["level-select-screen"].hidden = true;
    els["level-screen"].hidden = true;
  }

  function getDayAheadLevel(id = state.dayAheadLevelId) {
    return dayAheadLevels.find((level) => level.id === id) || dayAheadLevels[0];
  }

  function isDayAheadSolved(id) {
    return ["yellow", "green"].includes(state.dayAheadStatuses.get(id));
  }

  function dayAheadYellowCount() {
    return [...state.dayAheadStatuses.values()].filter((status) => status === "yellow").length;
  }

  function isDayAheadUnlocked(level) {
    if (!level) return false;
    if (level.id === 0) return true;
    return isDayAheadSolved(level.id - 1) && dayAheadYellowCount() <= 1;
  }

  function dayAheadStatus(level) {
    return state.dayAheadStatuses.get(level.id) || (isDayAheadUnlocked(level) ? "red" : "gray");
  }

  function dayAheadControlConfig(level, resource) {
    if (["commitment", "commitmentReserve", "integrated"].includes(level.controlMode)) return { max: 1, step: 1, fallback: 0, label: "Commit unit", suffix: "committed" };
    if (level.controlMode === "reserve") return { max: Number(resource.reserveCapacity) || 0, step: 1, fallback: 0, label: "Reserve target", suffix: "MW reserve" };
    if (["dispatch", "congestion", "forecast"].includes(level.controlMode)) return { max: resource.capacity, step: 1, fallback: 0, label: level.controlMode === "forecast" ? "Day-ahead dispatch" : "Dispatch target", suffix: "MW dispatch" };
    return { max: resource.capacity, step: 1, fallback: 0, label: "Available capacity", suffix: "MW available" };
  }

  function renderDayAheadSelect() {
    state.screen = "day-ahead-select";
    state.launching = false;
    els["mode-select-screen"].hidden = true;
    els["level-select-screen"].hidden = true;
    els["level-screen"].hidden = true;
    els["construction-select-screen"].hidden = true;
    els["construction-level-screen"].hidden = true;
    els["day-ahead-level-screen"].hidden = true;
    els["day-ahead-select-screen"].hidden = false;
    const unlockedIds = dayAheadLevels.filter((level) => isDayAheadUnlocked(level)).map((level) => level.id);
    const latest = Math.max(...unlockedIds);
    els["day-ahead-level-circles"].innerHTML = dayAheadLevels.map((level) => {
      const unlocked = isDayAheadUnlocked(level);
      const status = dayAheadStatus(level);
      const classes = ["level-circle", `status-${status}`, level.id === latest ? "is-latest" : "", !unlocked ? "is-locked" : ""].filter(Boolean).join(" ");
      return `<button type="button" class="${classes}" data-day-ahead-level="${level.id}" style="--burst-color:${statusColor(status)}" ${unlocked ? "" : "disabled"} aria-label="${level.title}${unlocked ? "" : ", locked"}">${level.id}</button>`;
    }).join("");
    const yellow = dayAheadYellowCount();
    if (yellow >= 2) {
      const needed = yellow - 1;
      els["day-ahead-level-message"].hidden = false;
      els["day-ahead-level-message"].textContent = `Solve ${needed} more level${needed === 1 ? "" : "s"} perfectly to unlock.`;
    } else {
      els["day-ahead-level-message"].hidden = true;
      els["day-ahead-level-message"].textContent = "";
    }
    els["day-ahead-level-circles"].querySelectorAll("[data-day-ahead-level]").forEach((button) => {
      button.addEventListener("click", () => launchDayAheadLevel(Number(button.dataset.dayAheadLevel)));
    });
  }

  function dayAheadOfferValues(level) {
    const saved = state.dayAheadOffers[level.id] && typeof state.dayAheadOffers[level.id] === "object" ? state.dayAheadOffers[level.id] : {};
    if (["commitmentReserve", "integrated"].includes(level.controlMode)) {
      return Object.fromEntries(level.resources.map((resource) => {
        const entry = saved[resource.id] && typeof saved[resource.id] === "object" ? saved[resource.id] : {};
        return [resource.id, {
          commitment: Number.isFinite(Number(entry.commitment)) ? Math.max(0, Math.min(1, Number(entry.commitment))) : 0,
          reserve: Number.isFinite(Number(entry.reserve)) ? Math.max(0, Math.min(Number(resource.reserveCapacity) || 0, Number(entry.reserve))) : 0
        }];
      }));
    }
    return Object.fromEntries(level.resources.map((resource) => {
      const config = dayAheadControlConfig(level, resource);
      return [resource.id, Number.isFinite(Number(saved[resource.id])) ? Math.max(0, Math.min(config.max, Number(saved[resource.id]))) : config.fallback];
    }));
  }

  function renderDayAheadCurve(resource) {
    const points = Array.isArray(resource.offerCurve) ? resource.offerCurve : [];
    if (points.length < 2) return "";
    const maxPrice = Math.max(1, ...points.map((point) => Number(point.price) || 0));
    const maxMw = Math.max(1, resource.capacity);
    const polyline = points.map((point) => `${10 + (Number(point.mw) / maxMw) * 160},${44 - (Number(point.price) / maxPrice) * 32}`).join(" ");
    return `<svg class="day-ahead-curve" viewBox="0 0 180 55" role="img" aria-label="${resource.name} offer curve"><line class="day-ahead-curve-axis" x1="10" y1="44" x2="170" y2="44"></line><line class="day-ahead-curve-axis" x1="10" y1="44" x2="10" y2="10"></line><polyline class="day-ahead-curve-line ${resource.className}" points="${polyline}"></polyline></svg>`;
  }

  function dayAheadCurveSummary(resource) {
    if (!Array.isArray(resource.offerCurve)) return `Offer price: $${resource.offer}/MWh`;
    return `Curve: ${resource.offerCurve.map((point) => `${point.mw} MW @ $${point.price}`).join(" → ")}`;
  }

  function renderDayAheadOffers(level) {
    const values = dayAheadOfferValues(level);
    if (["commitmentReserve", "integrated"].includes(level.controlMode)) {
      els["day-ahead-offers"].innerHTML = level.resources.map((resource) => {
        const value = values[resource.id];
        return `<article class="day-ahead-offer"><div class="day-ahead-offer-info"><strong>${resource.name}</strong><span>Energy capacity: ${resource.capacity} MW | Reserve capacity: ${resource.reserveCapacity} MW</span><span>${dayAheadCurveSummary(resource)} · Startup cost: $${resource.startupCost}/day</span></div><div class="day-ahead-offer-control"><label class="day-ahead-control-label" for="day-ahead-commit-${resource.id}">Commit unit</label><input id="day-ahead-commit-${resource.id}" type="range" min="0" max="1" step="1" value="${value.commitment}" data-day-ahead-offer="${resource.id}" data-day-ahead-kind="commitment" aria-label="Commit unit for ${resource.name}"><span class="day-ahead-offer-readout" data-day-ahead-readout="${resource.id}-commitment">${value.commitment ? "ON" : "OFF"}</span><label class="day-ahead-control-label" for="day-ahead-reserve-${resource.id}">Reserve target</label><input id="day-ahead-reserve-${resource.id}" type="range" min="0" max="${resource.reserveCapacity}" step="1" value="${value.reserve}" data-day-ahead-offer="${resource.id}" data-day-ahead-kind="reserve" aria-label="Reserve target for ${resource.name}"><span class="day-ahead-offer-readout" data-day-ahead-readout="${resource.id}-reserve">${value.reserve} MW reserve</span></div></article>`;
      }).join("");
      return;
    }
    els["day-ahead-offers"].innerHTML = level.resources.map((resource) => `<article class="day-ahead-offer">
      <div class="day-ahead-offer-info"><strong>${resource.name}</strong><span>${resource.reserveCapacity !== undefined ? `Energy capacity: ${resource.capacity} MW | Reserve capacity: ${resource.reserveCapacity} MW` : `Physical capacity: ${resource.capacity} MW`}</span><span>${dayAheadCurveSummary(resource)}</span>${renderDayAheadCurve(resource)}</div>
      <div class="day-ahead-offer-control"><label class="day-ahead-control-label" for="day-ahead-input-${resource.id}">${dayAheadControlConfig(level, resource).label}</label><input id="day-ahead-input-${resource.id}" type="range" min="0" max="${dayAheadControlConfig(level, resource).max}" step="${dayAheadControlConfig(level, resource).step}" value="${values[resource.id]}" data-day-ahead-offer="${resource.id}" aria-label="${dayAheadControlConfig(level, resource).label} for ${resource.name}" ><span class="day-ahead-offer-readout" data-day-ahead-readout="${resource.id}">${values[resource.id]} ${dayAheadControlConfig(level, resource).suffix}</span></div>
    </article>`).join("");
  }

  function renderDayAheadStack(level) {
    const values = dayAheadOfferValues(level);
    const totalCapacity = ["commitmentReserve", "integrated"].includes(level.controlMode) ? level.resources.length : level.resources.reduce((sum, resource) => sum + dayAheadControlConfig(level, resource).max, 0);
    els["day-ahead-stack-max"].textContent = `${totalCapacity} MW offered`;
    els["day-ahead-stack"].innerHTML = [...level.resources].sort((a, b) => dayAheadCurvePrice(a, 1) - dayAheadCurvePrice(b, 1)).map((resource) => {
      const rawValue = values[resource.id];
      const available = ["commitmentReserve", "integrated"].includes(level.controlMode) ? rawValue.commitment : rawValue;
      const width = totalCapacity ? Math.max(0, Math.min(100, (available / totalCapacity) * 100)) : 0;
      const valueLabel = ["commitment", "commitmentReserve", "integrated"].includes(level.controlMode) ? (available ? "ON" : "OFF") : `${available} MW`;
      const priceLabel = level.controlMode === "reserve" ? `$${resource.reserveOffer}/MW reserve` : `$${resource.offer}/MWh`;
      return `<div class="day-ahead-stack-row"><span class="day-ahead-stack-label">${resource.name}</span><div class="day-ahead-stack-track"><span class="day-ahead-stack-segment ${resource.className}" style="width:${width}%">${available ? valueLabel : ""}</span></div><span class="day-ahead-stack-value">${priceLabel}</span></div>`;
    }).join("");
  }

  function renderDayAheadResult(message = "Run the market to calculate awards and the DAM LMP.", className = "") {
    els["day-ahead-result"].className = `day-ahead-result ${className}`.trim();
    els["day-ahead-result"].innerHTML = message;
  }

  function dayAheadCurvePrice(resource, mw) {
    const points = Array.isArray(resource.offerCurve) ? resource.offerCurve : [];
    if (points.length < 2) return Number(resource.offer) || 0;
    const quantity = Math.max(0, Math.min(resource.capacity, Number(mw) || 0));
    if (quantity <= Number(points[0].mw)) return Number(points[0].price);
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      if (quantity <= Number(current.mw)) {
        const width = Number(current.mw) - Number(previous.mw);
        const fraction = width > 0 ? (quantity - Number(previous.mw)) / width : 0;
        return Number(previous.price) + (Number(current.price) - Number(previous.price)) * fraction;
      }
    }
    return Number(points[points.length - 1].price);
  }

  function dayAheadCurveCost(resource, mw) {
    const points = Array.isArray(resource.offerCurve) ? resource.offerCurve : [];
    const quantity = Math.max(0, Math.min(resource.capacity, Number(mw) || 0));
    if (points.length < 2) return quantity * (Number(resource.offer) || 0);
    let cost = 0;
    let covered = 0;
    for (let index = 1; index < points.length && covered < quantity; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      const start = Number(previous.mw);
      const end = Number(current.mw);
      const used = Math.max(0, Math.min(quantity, end) - Math.max(covered, start));
      if (!used) continue;
      const startPrice = Number(previous.price);
      const endPrice = Number(current.price);
      const fraction = end > start ? used / (end - start) : 0;
      const usedEndPrice = startPrice + (endPrice - startPrice) * fraction;
      cost += used * (startPrice + usedEndPrice) / 2;
      covered = Math.max(covered, Math.min(quantity, end));
    }
    return cost;
  }

  function solveDayAheadDispatch(level) {
    if (!["dispatch", "demandCurve", "congestionDemand"].includes(level.controlMode)) return null;
    const blocks = [];
    level.resources.forEach((resource, resourceIndex) => {
      for (let mw = 1; mw <= resource.capacity; mw += 1) {
        blocks.push({ resourceId: resource.id, resourceIndex, marginalCost: dayAheadCurveCost(resource, mw) - dayAheadCurveCost(resource, mw - 1) });
      }
    });
    blocks.sort((a, b) => a.marginalCost - b.marginalCost || a.resourceIndex - b.resourceIndex);
    const awards = Object.fromEntries(level.resources.map((resource) => [resource.id, 0]));
    blocks.slice(0, level.demand).forEach((block) => { awards[block.resourceId] += 1; });
    return { awards, feasible: blocks.length >= level.demand };
  }

  function clippedValue(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, Number(value) || 0));
  }

  function solveCongestion(level, values) {
    const awards = Object.fromEntries(level.resources.map((resource) => [resource.id, clippedValue(values[resource.id], 0, resource.capacity)]));
    const westGeneration = level.resources.filter((resource) => resource.zone === "west").reduce((sum, resource) => sum + awards[resource.id], 0);
    const eastGeneration = level.resources.filter((resource) => resource.zone === "east").reduce((sum, resource) => sum + awards[resource.id], 0);
    const westLoad = Number(level.loadByZone?.west) || 0;
    const eastLoad = Number(level.loadByZone?.east) || 0;
    const flow = Math.max(0, westGeneration - westLoad);
    const westBalance = westGeneration - westLoad - flow;
    const eastBalance = eastGeneration + flow - eastLoad;
    const totalDispatch = Object.values(awards).reduce((sum, value) => sum + value, 0);
    const remaining = Math.max(0, level.demand - totalDispatch);
    const overage = Math.max(0, totalDispatch - level.demand);
    const feasible = remaining <= 0.01 && overage <= 0.01 && flow <= level.lineLimit + 0.01 && westBalance >= -0.01 && eastBalance >= -0.01;
    const nodeLmps = {};
    ["west", "east"].forEach((zone) => {
      const accepted = level.resources.filter((resource) => resource.zone === zone && awards[resource.id] > 0);
      nodeLmps[zone] = accepted.length ? Math.max(...accepted.map((resource) => dayAheadCurvePrice(resource, awards[resource.id]))) : null;
    });
    const totalCost = level.resources.reduce((sum, resource) => sum + dayAheadCurveCost(resource, awards[resource.id]), 0);
    return { awards, remaining, overage, feasible, totalCost, flow, nodeLmps, lmp: nodeLmps.east };
  }

  function evaluateCommitment(level, commitments) {
    const committed = Object.fromEntries(level.resources.map((resource) => [resource.id, commitments[resource.id] ? 1 : 0]));
    const hourlyAwards = {};
    const hourlyLmps = {};
    let totalCost = 0;
    let remaining = 0;
    (level.hours || []).forEach((hour) => {
      let needed = Number(hour.demand) || 0;
      const awards = Object.fromEntries(level.resources.map((resource) => [resource.id, 0]));
      [...level.resources].filter((resource) => committed[resource.id]).sort((a, b) => a.offer - b.offer).forEach((resource) => {
        const award = Math.min(resource.capacity, Math.max(0, needed));
        awards[resource.id] = award;
        needed -= award;
        totalCost += award * (Number(resource.offer) || 0);
      });
      remaining = Math.max(remaining, needed);
      const marginal = [...level.resources].filter((resource) => awards[resource.id] > 0).sort((a, b) => a.offer - b.offer).at(-1);
      hourlyLmps[hour.id] = marginal?.offer ?? null;
      hourlyAwards[hour.id] = awards;
    });
    level.resources.forEach((resource) => { if (committed[resource.id]) totalCost += Number(resource.startupCost) || 0; });
    return { commitments: committed, awards: committed, hourlyAwards, hourlyLmps, remaining, overage: 0, feasible: remaining <= 0.01, totalCost, lmp: Math.max(...Object.values(hourlyLmps).filter(Number.isFinite), 0) };
  }

  function solveOptimalCommitment(level) {
    let best = null;
    const count = level.resources.length;
    for (let mask = 0; mask < (1 << count); mask += 1) {
      const commitments = Object.fromEntries(level.resources.map((resource, index) => [resource.id, (mask >> index) & 1]));
      const result = evaluateCommitment(level, commitments);
      if (!result.feasible) continue;
      if (!best || result.totalCost < best.totalCost - 0.01) best = result;
    }
    return best;
  }

  function dispatchByZone(level, energyCapacity, demand) {
    const westLoad = Number(level.loadByZone?.west) || 0;
    const eastLoad = Number(level.loadByZone?.east) || 0;
    let best = null;
    for (let flow = 0; flow <= Number(level.lineLimit || 0); flow += 1) {
      const zoneRequirements = { west: westLoad + flow, east: Math.max(0, eastLoad - flow) };
      const awards = Object.fromEntries(level.resources.map((resource) => [resource.id, 0]));
      let cost = 0;
      let feasible = true;
      ["west", "east"].forEach((zone) => {
        let needed = zoneRequirements[zone];
        [...level.resources].filter((resource) => resource.zone === zone).sort((a, b) => dayAheadCurvePrice(a, 1) - dayAheadCurvePrice(b, 1)).forEach((resource) => {
          const award = Math.min(energyCapacity[resource.id] || 0, Math.max(0, needed));
          awards[resource.id] += award;
          needed -= award;
          cost += dayAheadCurveCost(resource, award);
        });
        if (needed > 0.01) feasible = false;
      });
      if (feasible && (!best || cost < best.cost - 0.01)) best = { awards, cost, flow, requirements: zoneRequirements };
    }
    if (!best) return { awards: Object.fromEntries(level.resources.map((resource) => [resource.id, 0])), cost: 0, flow: 0, remaining: demand };
    const totalAward = Object.values(best.awards).reduce((sum, value) => sum + value, 0);
    return { ...best, remaining: Math.max(0, demand - totalAward) };
  }

  function evaluateCommitmentReserve(level, values) {
    const commitments = Object.fromEntries(level.resources.map((resource) => [resource.id, values[resource.id]?.commitment ? 1 : 0]));
    const reserveAwards = Object.fromEntries(level.resources.map((resource) => [resource.id, commitments[resource.id] ? clippedValue(values[resource.id]?.reserve, 0, Number(resource.reserveCapacity) || 0) : 0]));
    const reserveTotal = Object.values(reserveAwards).reduce((sum, value) => sum + value, 0);
    const reserveShortfall = Math.max(0, (Number(level.reserveRequirement) || 0) - reserveTotal);
    const energyCapacity = Object.fromEntries(level.resources.map((resource) => [resource.id, commitments[resource.id] ? Math.max(0, resource.capacity - reserveAwards[resource.id]) : 0]));
    const hours = level.hours || [{ id: 1, demand: level.demand }];
    const hourlyAwards = {};
    const hourlyFlows = {};
    const hourlyLmps = {};
    let remaining = 0;
    let energyCost = 0;
    hours.forEach((hour) => {
      const dispatched = level.controlMode === "integrated" ? dispatchByZone(level, energyCapacity, hour.demand) : (() => {
        let needed = hour.demand;
        const awards = Object.fromEntries(level.resources.map((resource) => [resource.id, 0]));
        let cost = 0;
      [...level.resources].filter((resource) => commitments[resource.id]).sort((a, b) => dayAheadCurvePrice(a, 1) - dayAheadCurvePrice(b, 1)).forEach((resource) => {
          const award = Math.min(energyCapacity[resource.id], Math.max(0, needed));
          awards[resource.id] = award;
          needed -= award;
          cost += dayAheadCurveCost(resource, award);
        });
        return { awards, cost, flow: 0, remaining: Math.max(0, needed) };
      })();
      hourlyAwards[hour.id] = dispatched.awards;
      hourlyFlows[hour.id] = dispatched.flow;
      remaining = Math.max(remaining, dispatched.remaining);
      energyCost += dispatched.cost;
      const accepted = level.resources.filter((resource) => dispatched.awards[resource.id] > 0);
      hourlyLmps[hour.id] = accepted.length ? Math.max(...accepted.map((resource) => dayAheadCurvePrice(resource, dispatched.awards[resource.id]))) : null;
    });
    const startupCost = level.resources.reduce((sum, resource) => sum + (commitments[resource.id] ? Number(resource.startupCost) || 0 : 0), 0);
    const reserveCost = level.resources.reduce((sum, resource) => sum + reserveAwards[resource.id] * (Number(resource.reserveOffer) || 0), 0);
    const nodeLmps = {};
    if (level.controlMode === "integrated") {
      ["west", "east"].forEach((zone) => {
        const accepted = level.resources.filter((resource) => resource.zone === zone && hourlyAwards[hours[0].id][resource.id] > 0);
        nodeLmps[zone] = accepted.length ? Math.max(...accepted.map((resource) => dayAheadCurvePrice(resource, hourlyAwards[hours[0].id][resource.id]))) : null;
      });
    }
    return { commitments, awards: commitments, reserveAwards, energyAwards: hourlyAwards[hours[0].id], hourlyAwards, hourlyFlows, hourlyLmps, reserveTotal, reserveShortfall, remaining, overage: 0, feasible: reserveShortfall <= 0.01 && remaining <= 0.01, energyCost, startupCost, reserveCost, totalCost: energyCost + startupCost + reserveCost, lmp: Math.max(...Object.values(hourlyLmps).filter(Number.isFinite), 0), flow: hourlyFlows[hours[0].id] || 0, nodeLmps };
  }

  function solveOptimalCommitmentReserve(level) {
    let best = null;
    const resources = level.resources;
    const count = resources.length;
    for (let mask = 0; mask < (1 << count); mask += 1) {
      const commitments = Object.fromEntries(resources.map((resource, index) => [resource.id, (mask >> index) & 1]));
      function walk(index, reserves, total) {
        if (total > (Number(level.reserveRequirement) || 0)) return;
        if (index === resources.length) {
          if (total < (Number(level.reserveRequirement) || 0)) return;
          const values = Object.fromEntries(resources.map((resource) => [resource.id, { commitment: commitments[resource.id], reserve: reserves[resource.id] || 0 }]));
          const result = evaluateCommitmentReserve(level, values);
          if (result.feasible && (!best || result.totalCost < best.totalCost - 0.01)) best = result;
          return;
        }
        const resource = resources[index];
        const max = commitments[resource.id] ? Number(resource.reserveCapacity) || 0 : 0;
        for (let reserve = 0; reserve <= max; reserve += 1) {
          reserves[resource.id] = reserve;
          walk(index + 1, reserves, total + reserve);
        }
      }
      walk(0, {}, 0);
    }
    return best;
  }

  function evaluateReserve(level, values) {
    const reserveAwards = Object.fromEntries(level.resources.map((resource) => [resource.id, clippedValue(values[resource.id], 0, Number(resource.reserveCapacity) || 0)]));
    const reserveTotal = Object.values(reserveAwards).reduce((sum, value) => sum + value, 0);
    const reserveShortfall = Math.max(0, (Number(level.reserveRequirement) || 0) - reserveTotal);
    const energyCapacity = Object.fromEntries(level.resources.map((resource) => [resource.id, Math.max(0, resource.capacity - reserveAwards[resource.id])]));
    let needed = Number(level.demand) || 0;
    const energyAwards = Object.fromEntries(level.resources.map((resource) => [resource.id, 0]));
    let energyCost = 0;
    [...level.resources].sort((a, b) => a.offer - b.offer).forEach((resource) => {
      const award = Math.min(energyCapacity[resource.id], Math.max(0, needed));
      energyAwards[resource.id] = award;
      needed -= award;
      energyCost += award * (Number(resource.offer) || 0);
    });
    const totalCost = energyCost + level.resources.reduce((sum, resource) => sum + reserveAwards[resource.id] * (Number(resource.reserveOffer) || 0), 0);
    const marginal = [...level.resources].filter((resource) => energyAwards[resource.id] > 0).sort((a, b) => a.offer - b.offer).at(-1);
    return { awards: reserveAwards, reserveAwards, energyAwards, reserveTotal, reserveShortfall, remaining: Math.max(0, needed), overage: 0, feasible: reserveShortfall <= 0.01 && needed <= 0.01, totalCost, energyCost, lmp: marginal?.offer ?? null };
  }

  function solveOptimalReserve(level) {
    let best = null;
    const resources = level.resources;
    function walk(index, values) {
      if (index === resources.length) {
        const result = evaluateReserve(level, values);
        if (!result.feasible) return;
        if (!best || result.totalCost < best.totalCost - 0.01) best = result;
        return;
      }
      const resource = resources[index];
      for (let value = 0; value <= (Number(resource.reserveCapacity) || 0); value += 1) {
        values[resource.id] = value;
        walk(index + 1, values);
      }
    }
    walk(0, {});
    return best;
  }

  function evaluateForecast(level, values) {
    const awards = Object.fromEntries(level.resources.map((resource) => [resource.id, clippedValue(values[resource.id], 0, resource.capacity)]));
    const totalDispatch = Object.values(awards).reduce((sum, value) => sum + value, 0);
    const remaining = Math.max(0, level.demand - totalDispatch);
    const overage = Math.max(0, totalDispatch - level.demand);
    const dayAheadCost = level.resources.reduce((sum, resource) => sum + awards[resource.id] * (Number(resource.offer) || 0), 0);
    const delivered = Object.fromEntries(level.resources.map((resource) => [resource.id, Math.min(awards[resource.id], Number(resource.actualCapacity ?? resource.capacity))]));
    const realTimeImbalance = Math.max(0, (Number(level.actualDemand ?? level.demand) || 0) - Object.values(delivered).reduce((sum, value) => sum + value, 0));
    let realTimeShortfall = realTimeImbalance;
    let realTimeCost = 0;
    const realTimeAwards = Object.fromEntries(level.resources.map((resource) => [resource.id, 0]));
    [...level.resources].sort((a, b) => a.offer - b.offer).forEach((resource) => {
      const available = Math.max(0, Number(resource.actualCapacity ?? resource.capacity) - awards[resource.id]);
      const award = Math.min(available, realTimeShortfall);
      realTimeAwards[resource.id] = award;
      realTimeShortfall -= award;
      realTimeCost += award * (Number(resource.realTimeOffer ?? resource.offer) || 0);
    });
    const marginal = [...level.resources].filter((resource) => awards[resource.id] > 0).sort((a, b) => a.offer - b.offer).at(-1);
    return { awards, remaining, overage, delivered, realTimeAwards, realTimeImbalance, realTimeShortfall, dayAheadCost, realTimeCost, totalCost: dayAheadCost + realTimeCost, feasible: remaining <= 0.01 && overage <= 0.01, lmp: marginal?.offer ?? null };
  }

  function clearDayAhead(level, values) {
    if (["dispatch", "demandCurve"].includes(level.controlMode)) {
      const awards = Object.fromEntries(level.resources.map((resource) => [resource.id, Math.max(0, Math.min(resource.capacity, Number(values[resource.id]) || 0))]));
      const totalDispatch = Object.values(awards).reduce((sum, value) => sum + value, 0);
      const remaining = Math.max(0, level.demand - totalDispatch);
      const overage = Math.max(0, totalDispatch - level.demand);
      const totalCost = level.resources.reduce((sum, resource) => sum + dayAheadCurveCost(resource, awards[resource.id]), 0);
      const marginal = remaining <= 0 && overage <= 0 ? [...level.resources].filter((resource) => awards[resource.id] > 0).sort((a, b) => dayAheadCurvePrice(a, awards[a.id]) - dayAheadCurvePrice(b, awards[b.id])).at(-1) : null;
      return { awards, remaining, overage, feasible: remaining <= 0.01 && overage <= 0.01, totalCost, lmp: marginal ? dayAheadCurvePrice(marginal, awards[marginal.id]) : null };
    }
    if (["congestion", "congestionDemand"].includes(level.controlMode)) return solveCongestion(level, values);
    if (level.controlMode === "commitment") return evaluateCommitment(level, values);
    if (level.controlMode === "reserve") return evaluateReserve(level, values);
    if (["commitmentReserve", "integrated"].includes(level.controlMode)) return evaluateCommitmentReserve(level, values);
    if (level.controlMode === "forecast") return evaluateForecast(level, values);
    const awards = {};
    let remaining = level.demand;
    let totalCost = 0;
    [...level.resources].sort((a, b) => a.offer - b.offer).forEach((resource) => {
      const award = Math.min(values[resource.id], Math.max(0, remaining));
      awards[resource.id] = award;
      remaining -= award;
      totalCost += award * resource.offer;
    });
    const marginal = remaining <= 0 ? [...level.resources].sort((a, b) => a.offer - b.offer).filter((resource) => awards[resource.id] > 0).at(-1) : null;
    return { awards, remaining, overage: 0, feasible: remaining <= 0.01, totalCost, lmp: marginal?.offer ?? null };
  }

  function validateDayAheadLevels() {
    const errors = [];
    dayAheadLevels.forEach((level) => {
      const defaults = ["dispatch", "demandCurve", "forecast"].includes(level.controlMode) ? (level.controlMode === "forecast" ? level.defaultDispatch : level.controlMode === "demandCurve" ? level.defaultDispatch : level.expectedAwards) : ["congestion", "congestionDemand"].includes(level.controlMode) ? level.defaultDispatch : ["commitment", "reserve"].includes(level.controlMode) ? (level.controlMode === "commitment" ? level.defaultCommitment : level.defaultReserve) : ["commitmentReserve", "integrated"].includes(level.controlMode) ? Object.fromEntries(level.resources.map((resource) => [resource.id, { commitment: level.defaultCommitment[resource.id], reserve: level.defaultReserve[resource.id] }])) : Object.fromEntries(level.resources.map((resource) => [resource.id, resource.capacity]));
      const result = clearDayAhead(level, defaults);
      if (!result.feasible || result.remaining > 0 || result.reserveShortfall > 0) errors.push(`${level.title} cannot serve its demand.`);
      const optimal = ["dispatch", "demandCurve"].includes(level.controlMode) ? solveDayAheadDispatch(level) : ["commitment"].includes(level.controlMode) ? solveOptimalCommitment(level) : ["reserve"].includes(level.controlMode) ? solveOptimalReserve(level) : ["commitmentReserve", "integrated"].includes(level.controlMode) ? solveOptimalCommitmentReserve(level) : null;
      level.resources.forEach((resource) => {
        const expected = optimal ? (level.controlMode === "reserve" || ["commitmentReserve", "integrated"].includes(level.controlMode) ? (level.controlMode === "reserve" ? optimal.reserveAwards[resource.id] : optimal.awards[resource.id]) : optimal.awards[resource.id]) : level.expectedAwards[resource.id];
        if (Math.abs(result.awards[resource.id] - expected) > 0.01 || Math.abs(level.expectedAwards[resource.id] - expected) > 0.01) errors.push(`${level.title} has an incorrect ${resource.name} award.`);
        if (level.controlMode === "reserve" && level.expectedEnergyAwards && Math.abs(result.energyAwards[resource.id] - level.expectedEnergyAwards[resource.id]) > 0.01) errors.push(`${level.title} has an incorrect ${resource.name} energy dispatch.`);
        if (["commitmentReserve", "integrated"].includes(level.controlMode) && level.expectedReserveAwards && Math.abs(result.reserveAwards[resource.id] - level.expectedReserveAwards[resource.id]) > 0.01) errors.push(`${level.title} has an incorrect ${resource.name} reserve award.`);
      });
      if (["congestion", "congestionDemand", "integrated"].includes(level.controlMode)) {
        if (Math.abs(result.flow - level.expectedFlow) > 0.01 || result.nodeLmps.west !== level.expectedNodeLmp.west || result.nodeLmps.east !== level.expectedNodeLmp.east) errors.push(`${level.title} has an invalid flow or nodal price.`);
      } else if (!Number.isFinite(result.lmp)) errors.push(`${level.title} has no marginal price.`);
    });
    if (errors.length) console.warn(`Day-ahead level validation failed: ${errors.join(" ")}`);
    return errors;
  }

  function runDayAheadMarket() {
    const level = getDayAheadLevel();
    const values = dayAheadOfferValues(level);
    state.dayAheadResult = clearDayAhead(level, values);
    const { awards, remaining, totalCost } = state.dayAheadResult;
    const awardRows = level.resources.map((resource) => {
      if (["commitment", "commitmentReserve", "integrated"].includes(level.controlMode)) return `<span>${resource.name}</span><span>${awards[resource.id] ? "ON" : "OFF"}</span>`;
      if (level.controlMode === "reserve") return `<span>${resource.name} reserve</span><span>${awards[resource.id].toFixed(0)} MW @ $${Number(resource.reserveOffer).toFixed(0)}/MW</span>`;
      const displayedPrice = ["dispatch", "demandCurve", "congestion", "congestionDemand"].includes(level.controlMode) ? dayAheadCurvePrice(resource, awards[resource.id]).toFixed(1) : Number(resource.offer).toFixed(0);
      return `<span>${resource.name}</span><span>${awards[resource.id].toFixed(0)} MW @ $${displayedPrice}/MWh</span>`;
    }).join("");
    if (["commitment", "commitmentReserve", "integrated"].includes(level.controlMode)) {
      if (state.dayAheadResult.remaining > 0) {
        renderDayAheadResult(`<strong>Insufficient commitment</strong><span>At least ${level.demand} MW must be available in the peak hour.</span><div class="day-ahead-result-grid">${awardRows}</div>`, "is-error");
        return;
      }
      const hours = Object.entries(state.dayAheadResult.hourlyAwards).map(([hour, hourAwards]) => `<span>Hour ${hour}</span><span>${Object.entries(hourAwards).filter(([, value]) => value > 0).map(([id, value]) => `${id} ${value.toFixed(0)} MW`).join(", ")}</span>`).join("");
      const reserveRows = level.reserveRequirement ? level.resources.map((resource) => `<span>${resource.name} reserve</span><span>${state.dayAheadResult.reserveAwards[resource.id].toFixed(0)} MW @ $${Number(resource.reserveOffer).toFixed(0)}/MW</span>`).join("") : "";
      const networkText = level.controlMode === "integrated" ? ` West → East flow: ${state.dayAheadResult.flow.toFixed(0)} MW. West LMP: $${state.dayAheadResult.nodeLmps.west}/MWh; East LMP: $${state.dayAheadResult.nodeLmps.east}/MWh.` : "";
      renderDayAheadResult(`<strong>Commitment feasible</strong><span>Startup cost and energy cost are included.${networkText}</span><div class="day-ahead-result-grid">${awardRows}${reserveRows}<span>Hourly dispatch</span><span></span>${hours}<span>Total cost</span><span>$${totalCost.toFixed(0)}</span></div>`, "");
      return;
    }
    if (level.controlMode === "reserve") {
      if (state.dayAheadResult.reserveShortfall > 0 || state.dayAheadResult.remaining > 0) {
        renderDayAheadResult(`<strong>Reserve or energy shortfall</strong><span>Provide ${level.reserveRequirement} MW reserve and preserve enough capacity for ${level.demand} MW energy.</span><div class="day-ahead-result-grid">${awardRows}</div>`, "is-error");
        return;
      }
      const energyRows = level.resources.map((resource) => `<span>${resource.name} energy</span><span>${state.dayAheadResult.energyAwards[resource.id].toFixed(0)} MW @ $${dayAheadCurvePrice(resource, state.dayAheadResult.energyAwards[resource.id]).toFixed(1)}/MWh</span>`).join("");
      renderDayAheadResult(`<strong>Reserve co-optimization</strong><span>Energy LMP: $${state.dayAheadResult.lmp}/MWh</span><div class="day-ahead-result-grid">${awardRows}${energyRows}<span>Total cost</span><span>$${totalCost.toFixed(0)}</span></div>`, "");
      return;
    }
    if (level.controlMode === "forecast") {
      if (state.dayAheadResult.overage > 0 || state.dayAheadResult.remaining > 0) {
        renderDayAheadResult(`<strong>Invalid day-ahead schedule</strong><span>Dispatch must equal the ${level.demand} MW forecast exactly.</span><div class="day-ahead-result-grid">${awardRows}</div>`, "is-error");
        return;
      }
      renderDayAheadResult(`<strong>Day-ahead schedule submitted</strong><span>DA LMP: $${state.dayAheadResult.lmp}/MWh. Real-time balancing is ${state.dayAheadResult.realTimeImbalance.toFixed(0)} MW.</span><div class="day-ahead-result-grid">${awardRows}<span>Day-ahead cost</span><span>$${state.dayAheadResult.dayAheadCost.toFixed(0)}</span><span>Real-time cost</span><span>$${state.dayAheadResult.realTimeCost.toFixed(0)}</span><span>Total settled cost</span><span>$${state.dayAheadResult.totalCost.toFixed(0)}</span></div>`, "");
      return;
    }
    if (["congestion", "congestionDemand"].includes(level.controlMode)) {
      if (!state.dayAheadResult.feasible) {
        renderDayAheadResult(`<strong>Network infeasible</strong><span>Respect the ${level.lineLimit} MW interface and balance both buses.</span><div class="day-ahead-result-grid">${awardRows}<span>West → East flow</span><span>${state.dayAheadResult.flow.toFixed(0)} MW</span></div>`, "is-error");
        return;
      }
      renderDayAheadResult(`<strong>West LMP: $${state.dayAheadResult.nodeLmps.west}/MWh · East LMP: $${state.dayAheadResult.nodeLmps.east}/MWh</strong><span>Congestion binds at ${state.dayAheadResult.flow.toFixed(0)} MW on the West → East interface.</span><div class="day-ahead-result-grid">${awardRows}<span>Total energy cost</span><span>$${totalCost.toFixed(0)}</span></div>`, "");
      return;
    }
    if (["dispatch", "demandCurve"].includes(level.controlMode) && state.dayAheadResult.overage > 0) {
      renderDayAheadResult(`<strong>Overschedule: ${state.dayAheadResult.overage.toFixed(0)} MW</strong><span>Dispatch must equal the ${level.demand} MW forecast exactly.</span><div class="day-ahead-result-grid">${awardRows}</div>`, "is-error");
      return;
    }
    if (remaining > 0) {
      renderDayAheadResult(`<strong>Shortfall: ${remaining.toFixed(0)} MW</strong><span>${level.controlMode === "dispatch" ? "Dispatch exactly the forecast load before checking the schedule." : "There is not enough offered capacity to serve the forecast load."}</span><div class="day-ahead-result-grid">${awardRows}</div>`, "is-error");
      return;
    }
    const headline = ["dispatch", "demandCurve"].includes(level.controlMode) ? `Implied marginal offer: $${state.dayAheadResult.lmp}/MWh` : `DAM LMP: $${state.dayAheadResult.lmp}/MWh`;
    const explanation = level.controlMode === "dispatch" ? `Dispatch matches the ${level.demand} MW forecast. Curve cost is calculated for every awarded MW.` : `All ${level.demand} MW are awarded at the least-cost available offers.`;
    renderDayAheadResult(`<strong>${headline}</strong><span>${explanation}</span><div class="day-ahead-result-grid">${awardRows}<span>Total energy cost</span><span>$${totalCost.toFixed(0)}</span></div>`, "");
  }

  function checkDayAheadSchedule() {
    const level = getDayAheadLevel();
    if (!state.dayAheadResult) {
      renderDayAheadResult("Run the market before checking the schedule.", "is-error");
      return;
    }
    if (state.dayAheadResult.remaining > 0 || state.dayAheadResult.overage > 0 || state.dayAheadResult.reserveShortfall > 0 || state.dayAheadResult.feasible === false) {
      state.dayAheadStatuses.delete(level.id);
      saveProgress();
      renderDayAheadNavigation();
      renderDayAheadResult(["dispatch", "demandCurve", "congestionDemand"].includes(level.controlMode) ? "Try again: match the load, demand curve, and network constraints before checking the schedule." : "Try again: increase the available MW until the forecast load is fully served.", "is-error");
      return;
    }
    const optimal = ["dispatch", "demandCurve"].includes(level.controlMode) ? solveDayAheadDispatch(level) : ["congestion", "congestionDemand"].includes(level.controlMode) ? solveCongestion(level, level.defaultDispatch) : level.controlMode === "commitment" ? solveOptimalCommitment(level) : level.controlMode === "reserve" ? solveOptimalReserve(level) : ["commitmentReserve", "integrated"].includes(level.controlMode) ? solveOptimalCommitmentReserve(level) : null;
    const expectedAwards = optimal ? (level.controlMode === "reserve" || ["commitmentReserve", "integrated"].includes(level.controlMode) ? optimal.awards : optimal.awards) : level.expectedAwards;
    const awardsMatch = level.resources.every((resource) => Math.abs(state.dayAheadResult.awards[resource.id] - expectedAwards[resource.id]) <= 0.01);
    const congestionMatch = !["congestion", "congestionDemand", "integrated"].includes(level.controlMode) || (Math.abs(state.dayAheadResult.flow - level.expectedFlow) <= 0.01 && state.dayAheadResult.nodeLmps.west === level.expectedNodeLmp.west && state.dayAheadResult.nodeLmps.east === level.expectedNodeLmp.east);
    const reserveMatch = !["commitmentReserve", "integrated"].includes(level.controlMode) || level.resources.every((resource) => Math.abs(state.dayAheadResult.reserveAwards[resource.id] - level.expectedReserveAwards[resource.id]) <= 0.01);
    const forecastMatch = level.controlMode !== "forecast" || awardsMatch;
    const perfect = awardsMatch && congestionMatch && reserveMatch && forecastMatch;
    const status = perfect ? "green" : "yellow";
    state.dayAheadStatuses.set(level.id, status);
    saveProgress();
    renderDayAheadNavigation();
    renderDayAheadResult(perfect ? "<strong>Perfect schedule</strong><span>The marginal accepted offer is the DAM LMP.</span>" : "<strong>Valid schedule, but not optimal</strong><span>The load is served, but the awards differ from the least-cost schedule.</span>", perfect ? "is-correct" : "is-close");
  }

  function renderDayAheadNavigation() {
    const previous = dayAheadLevels.find((candidate) => candidate.id === state.dayAheadLevelId - 1);
    const next = dayAheadLevels.find((candidate) => candidate.id === state.dayAheadLevelId + 1);
    els["day-ahead-prev-button"].disabled = !previous;
    els["day-ahead-next-button"].disabled = !next || !isDayAheadUnlocked(next);
  }

  function launchDayAheadLevel(id) {
    if (state.launching) return;
    const level = getDayAheadLevel(id);
    const button = els["day-ahead-level-circles"].querySelector(`[data-day-ahead-level="${id}"]`);
    if (!button || !isDayAheadUnlocked(level)) return;
    state.launching = true;
    button.classList.add("is-launching");
    for (let index = 0; index < level.id; index += 1) {
      const dot = document.createElement("span");
      dot.className = "burst-dot";
      dot.style.setProperty("--angle", `${(360 / level.id) * index}deg`);
      dot.style.setProperty("--burst-color", statusColor(dayAheadStatus(level)));
      button.appendChild(dot);
    }
    window.setTimeout(() => openDayAheadLevel(id), 620);
  }

  function openDayAheadLevel(id = 0) {
    const level = getDayAheadLevel(id);
    if (!isDayAheadUnlocked(level)) return;
    state.launching = false;
    state.screen = "day-ahead-level";
    state.dayAheadLevelId = level.id;
    state.dayAheadResult = null;
    els["mode-select-screen"].hidden = true;
    els["day-ahead-select-screen"].hidden = true;
    els["day-ahead-level-screen"].hidden = false;
    els["construction-select-screen"].hidden = true;
    els["construction-level-screen"].hidden = true;
    els["level-select-screen"].hidden = true;
    els["level-screen"].hidden = true;
    els["day-ahead-level-title"].textContent = `${level.title}: ${level.theme}`;
    els["day-ahead-level-description"].textContent = level.description;
    els["day-ahead-hours-summary"].textContent = level.hours ? level.hours.map((hour) => `${hour.id}: ${hour.demand} MW`).join(" · ") : "1";
    els["day-ahead-demand"].textContent = level.loadLabel || (level.actualDemand !== undefined ? `${level.demand} MW DA · ${level.actualDemand} MW actual` : `${level.demand} MW`);
    els["day-ahead-reserve-summary"].textContent = level.reserveRequirement ? `${level.reserveRequirement} MW` : "None";
    els["day-ahead-network-summary"].textContent = level.networkLabel || "None — single bus";
    renderDayAheadOffers(level);
    renderDayAheadStack(level);
    renderDayAheadResult();
    renderDayAheadNavigation();
  }

  function resetDayAheadLevel() {
    const level = getDayAheadLevel();
    delete state.dayAheadOffers[level.id];
    state.dayAheadResult = null;
    state.dayAheadStatuses.delete(level.id);
    saveProgress();
    openDayAheadLevel(level.id);
  }

  function resetDayAheadProgress() {
    state.dayAheadStatuses = new Map();
    state.dayAheadOffers = {};
    state.dayAheadLevelId = null;
    state.dayAheadResult = null;
    saveProgress();
    renderDayAheadSelect();
  }

  validateDayAheadLevels();

  function getConstructionLevel(id = state.constructionLevelId) {
    return constructionLevels.find((level) => level.id === id) || constructionLevels[0];
  }

  function renderConstructionSelect() {
    state.screen = "construction-select";
    state.launching = false;
    els["mode-select-screen"].hidden = true;
    els["day-ahead-select-screen"].hidden = true;
    els["day-ahead-level-screen"].hidden = true;
    els["level-select-screen"].hidden = true;
    els["level-screen"].hidden = true;
    els["construction-level-screen"].hidden = true;
    els["construction-select-screen"].hidden = false;
    const latestUnlocked = constructionLevels.reduce((latest, level) => isConstructionUnlocked(level) ? Math.max(latest, level.id) : latest, 0);
    els["construction-level-circles"].innerHTML = constructionLevels.map((level) => {
      const unlocked = isConstructionUnlocked(level);
      const status = state.constructionStatuses.get(level.id) || (unlocked ? "red" : "gray");
      const classes = ["level-circle", `status-${status}`, level.id === latestUnlocked ? "is-latest" : "", !unlocked ? "is-locked" : ""].filter(Boolean).join(" ");
      return `<button type="button" class="${classes}" data-construction-level="${level.id}" ${unlocked ? "" : "disabled"} aria-label="${level.title}${unlocked ? "" : ", locked"}">${level.id}</button>`;
    }).join("");
    els["construction-level-circles"].querySelectorAll("[data-construction-level]").forEach((button) => {
      button.addEventListener("click", () => launchConstructionLevel(Number(button.dataset.constructionLevel)));
    });
  }

  function resetConstructionProgress() {
    state.constructionStatuses = new Map();
    state.constructionDrafts = new Map();
    state.constructionLevelId = null;
    saveProgress();
    renderConstructionSelect();
  }

  function isConstructionUnlocked(level) {
    if (!level) return false;
    if (level.id === 0) return true;
    return state.constructionStatuses.get(level.id - 1) === "green";
  }

  function renderConstructionNavigation() {
    const current = state.constructionLevelId;
    const previous = constructionLevels.find((level) => level.id === current - 1);
    const next = constructionLevels.find((level) => level.id === current + 1);
    els["construction-prev-button"].disabled = !previous;
    els["construction-next-button"].disabled = !next || !isConstructionUnlocked(next);
  }

  function launchConstructionLevel(id) {
    if (state.launching) return;
    const level = getConstructionLevel(id);
    const button = els["construction-level-circles"].querySelector(`[data-construction-level="${id}"]`);
    if (!button || !isConstructionUnlocked(level)) return;
    state.launching = true;
    button.classList.add("is-launching");
    for (let index = 0; index < level.id; index += 1) {
      const dot = document.createElement("span");
      dot.className = "burst-dot";
      dot.style.setProperty("--angle", `${(360 / level.id) * index}deg`);
      dot.style.setProperty("--burst-color", statusColor(state.constructionStatuses.get(level.id) || "red"));
      button.appendChild(dot);
    }
    window.setTimeout(() => openConstructionLevel(id), 620);
  }

  function constructionNodeTypeLabel(type) {
    return type === "resource" ? "Generator" : type === "bus" ? "Grid node" : "Load";
  }

  function constructionLineName(line) {
    return line.name || (line.id === "line-1" ? "Line 1" : line.id === "line-2" ? "Line 2" : line.id);
  }

  function constructionLineDisplayName(line) {
    const number = String(line.id).match(/(\d+)$/)?.[1] || "";
    return `Transmission ${number}`.trim();
  }

  function constructionSolutionEndpoint(level, line, side) {
    const parts = constructionLineName(line).toLowerCase().split(" to ");
    const token = (parts[side === "from" ? 0 : 1] || "").trim();
    const candidates = level.nodes.filter((node) => node.name.toLowerCase().includes(token) || token.includes(node.name.toLowerCase()));
    if (!candidates.length) return null;
    if (candidates.length === 1) return candidates[0].id;
    const preferredType = side === "from" && ["west", "central", "east", "north", "south", "hub", "grid"].includes(token) ? "bus" : side === "to" && ["west", "central", "east", "hub", "grid"].includes(token) ? "bus" : side === "to" && ["north", "south", "city", "load", "valley"].includes(token) ? "load" : null;
    return (candidates.find((node) => node.type === preferredType) || candidates[0]).id;
  }

  function constructionDefaultPosition(type) {
    return type === "resource" ? { x: 150, y: 260 } : type === "bus" ? { x: 500, y: 260 } : { x: 850, y: 260 };
  }

  function constructionSolutionNodePosition(level, piece) {
    const sameType = level.nodes.filter((node) => node.type === piece.type);
    const index = sameType.findIndex((node) => node.id === piece.id);
    const x = piece.type === "resource" ? 140 : piece.type === "bus" ? 500 : 860;
    const y = sameType.length === 1 ? 260 : 110 + index * (300 / Math.max(1, sameType.length - 1));
    return { x, y: Math.max(70, Math.min(450, y)) };
  }

  function constructionNodeDetails(node) {
    if (node.type === "resource") return `${node.capacity} MW | ${formatMoney(node.offer)}/MWh`;
    if (node.type === "load") return `${node.demand} MW demand`;
    return "Junction";
  }

  function constructionNodeDetailLines(node) {
    if (node.type === "resource") return [`${node.capacity} MW`, `${formatMoney(node.offer)}/MWh`];
    if (node.type === "load") return [`${node.demand} MW`, "Demand"];
    return ["Junction"];
  }

  function constructionPositions() {
    return new Map(state.construction.nodes.map((node) => [node.id, { x: node.x, y: node.y }]));
  }

  function constructionMapHeight() {
    const viewBox = els["construction-map"].viewBox.baseVal;
    return viewBox.height || 520;
  }

  function syncConstructionViewBox() {
    const rect = els["construction-map"].getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const height = Math.max(520, Math.round((rect.height / rect.width) * 1000));
    els["construction-map"].setAttribute("viewBox", `0 0 1000 ${height}`);
  }

  function constructionLineGeometry(line, positions) {
    if (line.placed && positions.get(line.from) && positions.get(line.to)) {
      return { from: positions.get(line.from), to: positions.get(line.to) };
    }
    if (Number.isFinite(line.x1) && Number.isFinite(line.y1) && Number.isFinite(line.x2) && Number.isFinite(line.y2)) {
      return { from: { x: line.x1, y: line.y1 }, to: { x: line.x2, y: line.y2 } };
    }
    const height = constructionMapHeight();
    const staging = line.id === "line-1" ? { from: { x: 130, y: 82 }, to: { x: 430, y: 82 } } : { from: { x: 570, y: height - 82 }, to: { x: 870, y: height - 82 } };
    return staging;
  }

  function updateConstructionGeometry() {
    const positions = constructionPositions();
    state.construction.lines.forEach((line) => {
      if (!line.inWorkspace) return;
      const geometry = constructionLineGeometry(line, positions);
      const from = geometry.from;
      const to = geometry.to;
      const group = els["construction-lines"].querySelector(`[data-construction-line="${line.id}"]`);
      if (!group) return;
      group.querySelectorAll("line").forEach((element) => {
        element.setAttribute("x1", from.x);
        element.setAttribute("y1", from.y);
        element.setAttribute("x2", to.x);
        element.setAttribute("y2", to.y);
      });
      const label = group.querySelector(".construction-line-label");
      if (label) {
        label.setAttribute("x", (from.x + to.x) / 2);
        label.setAttribute("y", (from.y + to.y) / 2 - 12);
        label.textContent = `Flow ${line.flow || 0} MW | Limit ${line.capacity || 0} MW`;
      }
    });
    state.construction.nodes.forEach((node) => {
      const group = els["construction-nodes"].querySelector(`[data-construction-node="${node.id}"]`);
      if (group) group.setAttribute("transform", `translate(${node.x} ${node.y})`);
    });
  }

  function renderConstructionMap() {
    syncConstructionViewBox();
    const positions = constructionPositions();
    els["construction-lines"].innerHTML = state.construction.lines.filter((line) => line.inWorkspace).map((line) => {
      const geometry = constructionLineGeometry(line, positions);
      const from = geometry.from;
      const to = geometry.to;
      const unplaced = !line.placed;
      const statusClass = unplaced ? "is-unplaced" : "";
      const selectedClass = state.construction.selected === `line:${line.id}` ? "is-selected" : "";
      const label = `${constructionLineDisplayName(line)} | Flow ${line.flow} MW | Limit ${line.capacity} MW`;
      return `<g class="construction-line-group ${statusClass} ${selectedClass}" data-construction-line="${line.id}"><line class="construction-line" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line><line class="construction-line-hit" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line><text class="construction-line-label" x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 12}">${label}</text></g>`;
    }).join("");
    els["construction-nodes"].innerHTML = state.construction.nodes.map((node) => {
      const detailLines = constructionNodeDetailLines(node);
      const detailMarkup = detailLines.map((line, index) => `<text class="construction-node-detail" x="0" y="${8 + index * 14}">${line}</text>`).join("");
      return `<g class="construction-node ${node.type} ${state.construction.selected === `node:${node.id}` ? "is-selected" : ""}" data-construction-node="${node.id}" transform="translate(${node.x} ${node.y})" tabindex="0" role="button" aria-label="${constructionNodeTypeLabel(node.type)}"><circle class="construction-node-circle" cx="0" cy="0" r="54"></circle><text class="construction-node-label" x="0" y="-14">${constructionNodeTypeLabel(node.type)}</text>${detailMarkup}</g>`;
    }).join("");
  }

  function renderConstructionInspector() {
    const selected = state.construction.selected;
    if (!selected) {
      els["construction-inspector"].innerHTML = `Select a component or line for details.<div class="construction-inspector-actions"><button type="button" class="construction-clear-button" data-construction-action="clear">Clear all</button></div>`;
      return;
    }
    const [kind, id] = selected.split(":");
    if (kind === "node") {
      const node = state.construction.nodes.find((candidate) => candidate.id === id);
      if (!node) return;
      els["construction-inspector"].innerHTML = `<h3>${constructionNodeTypeLabel(node.type)}</h3><p>${constructionNodeDetails(node)}</p><p>Drag the circle to reposition it.</p><div class="construction-inspector-actions"><button type="button" class="construction-return" data-construction-action="return:node:${node.id}">Return to tray</button><button type="button" class="construction-clear-button" data-construction-action="clear">Clear all</button></div>`;
      return;
    }
    const line = state.construction.lines.find((candidate) => candidate.id === id);
    if (!line) return;
    const from = state.construction.nodes.find((node) => node.id === line.from);
    const to = state.construction.nodes.find((node) => node.id === line.to);
    const connection = line.placed ? `${constructionNodeTypeLabel(from?.type)} -&gt; ${constructionNodeTypeLabel(to?.type)}` : "Not connected yet";
    els["construction-inspector"].innerHTML = `<h3>${constructionLineDisplayName(line)}</h3><p>${connection}</p><p>Preset flow: ${line.flow} MW | Preset limit: ${line.capacity} MW</p><div class="construction-inspector-actions"><button type="button" class="construction-return" data-construction-action="return:line:${line.id}">Return to tray</button><button type="button" class="construction-clear-button" data-construction-action="clear">Clear all</button></div>`;
  }

  function renderConstructionTray() {
    const level = getConstructionLevel();
    const placedIds = new Set(state.construction.nodes.map((node) => node.id));
    const nodeMarkup = level.nodes.map((piece) => {
      const detail = piece.type === "resource" ? `${piece.capacity} MW - ${formatMoney(piece.offer)}/MWh` : piece.type === "load" ? `${piece.demand} MW demand` : "Network junction";
      return `<button type="button" class="construction-component construction-node-piece ${piece.type}" draggable="true" data-construction-piece-id="${piece.id}" aria-label="${piece.name}"><strong>${piece.name}</strong><span>${detail}</span></button>`;
    }).join("");
    const lineMarkup = level.lines.map((piece) => `<button type="button" class="construction-component construction-line-piece" draggable="true" data-construction-line-piece="${piece.id}" aria-label="${constructionLineDisplayName(piece)}, ${piece.flow} megawatt flow, ${piece.capacity} megawatt limit"><span class="line-piece-mark"></span><strong>${constructionLineDisplayName(piece)}</strong><span>Flow ${piece.flow} MW | Limit ${piece.capacity} MW</span></button>`).join("");
    els["construction-piece-tray"].innerHTML = nodeMarkup + lineMarkup;
    els["construction-piece-tray"].querySelectorAll("[data-construction-piece-id]").forEach((button) => {
      button.disabled = placedIds.has(button.dataset.constructionPieceId);
    });
    els["construction-piece-tray"].querySelectorAll("[data-construction-line-piece]").forEach((button) => {
      const line = state.construction.lines.find((candidate) => candidate.id === button.dataset.constructionLinePiece);
      button.disabled = !line || line.inWorkspace;
    });
  }

  function renderConstructionView() {
    renderConstructionMap();
    renderConstructionInspector();
    renderConstructionTray();
    renderConstructionNavigation();
    saveConstructionDraft();
  }

  function saveConstructionDraft() {
    if (state.constructionLevelId === null) return;
    state.constructionDrafts.set(state.constructionLevelId, JSON.parse(JSON.stringify({
      nodes: state.construction.nodes,
      lines: state.construction.lines,
      checked: state.construction.checked,
      revealed: state.construction.revealed
    })));
    saveProgress();
  }

  function constructionMapPoint(event) {
    const rect = els["construction-map"].getBoundingClientRect();
    const height = constructionMapHeight();
    return { x: Math.max(55, Math.min(945, ((event.clientX - rect.left) / rect.width) * 1000)), y: Math.max(55, Math.min(height - 55, ((event.clientY - rect.top) / rect.height) * height)) };
  }

  function addConstructionComponent(pieceId, point) {
    const level = getConstructionLevel();
    const piece = level.nodes.find((candidate) => candidate.id === pieceId);
    if (!piece) return;
    if (state.construction.nodes.some((node) => node.id === piece.id)) {
      els["construction-feedback"].className = "network-feedback is-error";
      els["construction-feedback"].textContent = `${piece.name} is already in the workspace.`;
      return;
    }
    const position = point || constructionDefaultPosition(piece.type);
    state.construction.nodes.push({ ...piece, x: position.x, y: position.y });
    state.construction.selected = `node:${piece.id}`;
    state.construction.checked = false;
    state.construction.revealed = false;
    els["construction-feedback"].className = "network-feedback";
    els["construction-feedback"].textContent = `${piece.name} placed.`;
    renderConstructionView();
  }

  function placeConstructionLine(lineId, point) {
    const line = state.construction.lines.find((candidate) => candidate.id === lineId);
    if (!line || line.inWorkspace) return;
    line.inWorkspace = true;
    const nearest = [...state.construction.nodes].sort((a, b) => Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y)).slice(0, 2);
    const nearestDistance = nearest.length === 2 ? Math.max(...nearest.map((node) => Math.hypot(node.x - point.x, node.y - point.y))) : Infinity;
    if (nearest.length === 2 && nearestDistance < 220) {
      line.from = nearest[0].id;
      line.to = nearest[1].id;
      line.placed = true;
      line.x1 = null;
      line.y1 = null;
      line.x2 = null;
      line.y2 = null;
    } else {
      line.from = null;
      line.to = null;
      line.placed = false;
      line.x1 = Math.max(55, point.x - 130);
      line.y1 = point.y;
      line.x2 = Math.min(945, point.x + 130);
      line.y2 = point.y;
    }
    state.construction.selected = `line:${line.id}`;
    state.construction.checked = false;
    state.construction.revealed = false;
    els["construction-feedback"].className = "network-feedback";
    els["construction-feedback"].textContent = line.placed ? "Line placed with its preset flow and limit." : "Line placed. Add more nodes to connect it.";
    renderConstructionView();
  }

  function validateConstructionNetwork() {
    const level = getConstructionLevel();
    const errors = [];
    const nodes = state.construction.nodes;
    const requiredNodes = level.nodes;
    const placedIds = new Set(nodes.map((node) => node.id));
    requiredNodes.forEach((piece) => { if (!placedIds.has(piece.id)) errors.push(`Place ${piece.name}.`); });
    const placedLines = state.construction.lines.filter((line) => line.placed);
    if (placedLines.length !== state.construction.lines.length) errors.push("Place every preset transmission line.");
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    placedLines.forEach((line) => {
      const from = nodeById.get(line.from);
      const to = nodeById.get(line.to);
      if (!from || !to || from.id === to.id) { errors.push("Every line must connect two different placed components."); return; }
      if (!Number.isFinite(Number(line.capacity)) || Number(line.capacity) <= 0) errors.push("Every line needs a positive transmission capacity.");
      if (!Number.isFinite(Number(line.flow)) || Number(line.flow) < 0) errors.push("Every line needs a nonnegative electric flow.");
      if (Number(line.capacity) < Number(line.flow)) errors.push("Electric flow cannot exceed the line capacity.");
    });
    const connected = new Set();
    placedLines.forEach((line) => { connected.add(line.from); connected.add(line.to); });
    nodes.forEach((node) => { if (!connected.has(node.id)) errors.push(`${node.name} is disconnected.`); });
    if (errors.length) return { valid: false, errors };

    const orientations = 2 ** placedLines.length;
    let winningOrientation = null;
    for (let mask = 0; mask < orientations && !winningOrientation; mask += 1) {
      const balances = new Map(nodes.map((node) => [node.id, 0]));
      placedLines.forEach((line, index) => {
        const forward = ((mask >> index) & 1) === 0;
        const source = forward ? line.from : line.to;
        const sink = forward ? line.to : line.from;
        const flow = Number(line.flow);
        balances.set(source, balances.get(source) - flow);
        balances.set(sink, balances.get(sink) + flow);
      });
      const feasible = nodes.every((node) => {
        const balance = balances.get(node.id);
        if (node.type === "load") return Math.abs(balance - Number(node.demand)) < 0.0001;
        if (node.type === "resource") return balance <= 0.0001 && -balance <= Number(node.capacity) + 0.0001;
        return Math.abs(balance) < 0.0001;
      });
      if (feasible) winningOrientation = { mask, balances };
    }
    if (!winningOrientation) errors.push("The preset flows cannot balance generation, grid nodes, and load demand with this topology.");
    return { valid: errors.length === 0, errors, orientation: winningOrientation };
  }

  function resetConstructionLevel(restoreDraft = false) {
    const level = getConstructionLevel();
    const saved = restoreDraft ? state.constructionDrafts.get(level.id) : null;
    if (saved && Array.isArray(saved.nodes) && Array.isArray(saved.lines)) {
      const savedNodes = new Map(saved.nodes.map((node) => [node.id, node]));
      const savedLines = new Map(saved.lines.map((line) => [line.id, line]));
      state.construction = {
        nodes: level.nodes.filter((piece) => savedNodes.has(piece.id)).map((piece) => ({ ...piece, ...savedNodes.get(piece.id) })),
        lines: level.lines.map((line) => ({ ...line, ...(savedLines.get(line.id) || {}), inWorkspace: Boolean(savedLines.get(line.id)?.inWorkspace), placed: Boolean(savedLines.get(line.id)?.placed) })),
        selected: null,
        checked: Boolean(saved.checked),
        revealed: Boolean(saved.revealed),
        dragging: null
      };
      const solved = state.constructionStatuses.get(level.id) === "green";
      els["construction-feedback"].className = solved ? "network-feedback construction-result is-correct" : "network-feedback";
      els["construction-feedback"].innerHTML = solved ? "<strong>Success</strong><span>Restored saved network.</span>" : "Restored your saved arrangement.";
      renderConstructionView();
      return;
    }
    state.construction = {
      nodes: [],
      lines: level.lines.map((line) => ({ ...line, from: null, to: null, placed: false, inWorkspace: false, x1: null, y1: null, x2: null, y2: null })),
      selected: null,
      checked: false,
      revealed: false,
      dragging: null
    };
    els["construction-feedback"].className = "network-feedback";
    els["construction-feedback"].textContent = "Place the required components.";
    renderConstructionView();
  }

  function revealConstructionSolution() {
    const level = getConstructionLevel();
    state.construction.nodes = level.nodes.map((piece) => ({ ...piece, ...constructionSolutionNodePosition(level, piece) }));
    state.construction.lines = level.lines.map((line) => ({ ...line, from: constructionSolutionEndpoint(level, line, "from"), to: constructionSolutionEndpoint(level, line, "to"), placed: true, inWorkspace: true, x1: null, y1: null, x2: null, y2: null }));
    state.construction.selected = null;
    state.construction.checked = true;
    state.construction.revealed = true;
    els["construction-feedback"].className = "network-feedback construction-result is-close";
    els["construction-feedback"].innerHTML = "<strong>Solution shown</strong><span>Reset the level to try it yourself.</span>";
    renderConstructionView();
  }

  function openConstructionLevel(id) {
    state.launching = false;
    state.screen = "construction-level";
    state.constructionLevelId = id;
    resetConstructionLevel(true);
    els["mode-select-screen"].hidden = true;
    els["construction-select-screen"].hidden = true;
    els["level-select-screen"].hidden = true;
    els["level-screen"].hidden = true;
    els["construction-level-screen"].hidden = false;
    els["construction-level-title"].textContent = getConstructionLevel(id).title;
    els["construction-level-description"].textContent = getConstructionLevel(id).description;
    renderConstructionView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function launchLevel(id) {
    if (state.launching) return;
    const level = getLevel(id);
    const button = els["level-circles"].querySelector(`[data-level="${id}"]`);
    if (!button || !isUnlocked(level)) return;
    state.launching = true;
    button.classList.add("is-launching");
    for (let index = 0; index < level.id; index += 1) {
      const dot = document.createElement("span");
      dot.className = "burst-dot";
      dot.style.setProperty("--angle", `${(360 / level.id) * index}deg`);
      button.appendChild(dot);
    }
    window.setTimeout(() => openLevel(id), 620);
  }

  function openLevel(id) {
    state.launching = false;
    state.screen = "level";
    state.levelId = id;
    state.answers = {};
    state.checked = false;
    state.revealed = false;
    state.activeTarget = null;
    els["level-select-screen"].hidden = true;
    els["level-screen"].hidden = false;
    renderLevelPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nodeRadius(name, level) {
    if (level.resources.some((resource) => resource.name === name)) return 58;
    return 64;
  }

  function targetValue(target) {
    if (!target) return "—";
    const key = target.kind === "connection" ? `flow:${target.id}` : `lmp:${target.id}`;
    const value = state.answers[key];
    return Number.isFinite(value) ? (target.kind === "connection" ? `${value.toFixed(1)} MW` : `${formatMoney(value)}/MWh`) : "—";
  }

  function nodeLmpValue(value) {
    return Number.isFinite(value) ? `${formatMoney(value)}/MWh` : "— $/MWh";
  }

  function renderMap(level, shownAnswers = state.answers) {
    const positions = new Map([
      ...level.resources.map((resource) => [resource.name, { x: resource.x, y: resource.y }]),
      ...level.buses.map((bus) => [bus.name, { x: bus.x, y: bus.y }]),
      ...level.loads.map((load) => [load.name, { x: load.x, y: load.y }])
    ]);
    const connectionSegments = level.connections.map((connection) => {
      const from = positions.get(connection.from);
      const to = positions.get(connection.to);
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return {
        id: connection.id,
        x1: from.x + (dx / distance) * nodeRadius(connection.from, level),
        y1: from.y + (dy / distance) * nodeRadius(connection.from, level),
        x2: to.x - (dx / distance) * nodeRadius(connection.to, level),
        y2: to.y - (dy / distance) * nodeRadius(connection.to, level)
      };
    });
    let transmissionIndex = 0;
    const labelBoxes = [];
    const nodePoints = [...positions.entries()];
    const overlaps = (first, second, padding = 8) => first.x - padding < second.x + second.width && first.x + first.width + padding > second.x && first.y - padding < second.y + second.height && first.y + first.height + padding > second.y;
    const segmentIntersectsBox = (segment, box, padding = 12) => {
      const left = box.x - padding;
      const right = box.x + box.width + padding;
      const top = box.y - padding;
      const bottom = box.y + box.height + padding;
      const dx = segment.x2 - segment.x1;
      const dy = segment.y2 - segment.y1;
      let t0 = 0;
      let t1 = 1;
      const clip = (p, q) => {
        if (Math.abs(p) < 0.000001) return q >= 0;
        const ratio = q / p;
        if (p < 0) {
          if (ratio > t1) return false;
          if (ratio > t0) t0 = ratio;
        } else {
          if (ratio < t0) return false;
          if (ratio < t1) t1 = ratio;
        }
        return true;
      };
      return clip(-dx, segment.x1 - left) && clip(dx, right - segment.x1) && clip(-dy, segment.y1 - top) && clip(dy, bottom - segment.y1);
    };
    const clearOfNodes = (box) => nodePoints.every(([name, point]) => {
      const closestX = Math.max(box.x, Math.min(point.x, box.x + box.width));
      const closestY = Math.max(box.y, Math.min(point.y, box.y + box.height));
      const dx = point.x - closestX;
      const dy = point.y - closestY;
      return Math.sqrt(dx * dx + dy * dy) > nodeRadius(name, level) + 8;
    });
    const clearOfLines = (box, connectionId) => connectionSegments.every((segment) => segment.id === connectionId || !segmentIntersectsBox(segment, box));
    const connectionMarkup = level.connections.map((connection) => {
      const from = positions.get(connection.from);
      const to = positions.get(connection.to);
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const x1 = from.x + (dx / distance) * nodeRadius(connection.from, level);
      const y1 = from.y + (dy / distance) * nodeRadius(connection.from, level);
      const x2 = to.x - (dx / distance) * nodeRadius(connection.to, level);
      const y2 = to.y - (dy / distance) * nodeRadius(connection.to, level);
      const lineLabel = connection.label || `${connection.from} to ${connection.to}`;
      const statusClass = connection.type === "transmission" ? `status-${targetStatus("connection", connection.id)}` : "";
      const activeClass = isActiveTarget("connection", connection.id) ? "is-active" : "";
      const flow = state.answers[`flow:${connection.id}`];
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const lineDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const normalX = -(y2 - y1) / lineDistance;
      const normalY = (x2 - x1) / lineDistance;
      const above = normalY > 0 ? -1 : 1;
      const labelDirection = connection.labelSide === "below" ? -above : above;
      const lane = connection.type === "transmission" ? transmissionIndex++ : 0;
      const laneOffset = Number.isFinite(connection.labelOffset) ? connection.labelOffset : 50 + Math.floor(lane / 3) * 28;
      const tangentX = (x2 - x1) / lineDistance;
      const tangentY = (y2 - y1) / lineDistance;
      let labelX = midX + normalX * laneOffset * labelDirection;
      let labelY = midY + normalY * laneOffset * labelDirection;
      let metaX = midX + normalX * (laneOffset - 24) * labelDirection;
      let metaY = midY + normalY * (laneOffset - 24) * labelDirection;
      if (connection.type === "transmission") {
        const labelWidth = Math.max(lineLabel.length * 7, String(connection.capacity).length * 6) + 12;
        const preferredTangent = Number.isFinite(connection.labelTangent) ? connection.labelTangent : null;
        const tangentOffsets = preferredTangent === null ? [0, -36, 36, -72, 72] : [preferredTangent, 0, -36, 36, -72, 72];
        const normalOffsets = [laneOffset, laneOffset + 24, laneOffset + 48];
        let chosen = null;
        for (const normalOffset of normalOffsets) {
          for (const tangentOffset of tangentOffsets) {
            const candidateLabelX = midX + normalX * normalOffset * labelDirection + tangentX * tangentOffset;
            const candidateLabelY = midY + normalY * normalOffset * labelDirection + tangentY * tangentOffset;
            const candidateMetaX = midX + normalX * (normalOffset - 24) * labelDirection + tangentX * tangentOffset;
            const candidateMetaY = midY + normalY * (normalOffset - 24) * labelDirection + tangentY * tangentOffset;
            const labelBox = { x: candidateLabelX - labelWidth / 2, y: candidateLabelY - 14, width: labelWidth, height: 17 };
            const metaBox = { x: candidateMetaX - labelWidth / 2, y: candidateMetaY - 11, width: labelWidth, height: 14 };
            if (clearOfNodes(labelBox) && clearOfNodes(metaBox) && clearOfLines(labelBox, connection.id) && clearOfLines(metaBox, connection.id) && !labelBoxes.some((box) => overlaps(labelBox, box.label) || overlaps(labelBox, box.meta) || overlaps(metaBox, box.label) || overlaps(metaBox, box.meta))) {
              chosen = { candidateLabelX, candidateLabelY, candidateMetaX, candidateMetaY, labelBox, metaBox };
              break;
            }
          }
          if (chosen) break;
        }
        if (chosen) {
          labelX = chosen.candidateLabelX;
          labelY = chosen.candidateLabelY;
          metaX = chosen.candidateMetaX;
          metaY = chosen.candidateMetaY;
          labelBoxes.push({ label: chosen.labelBox, meta: chosen.metaBox });
        }
      }
      const lineDetails = connection.type === "transmission" ? `<text class="map-connection-label" x="${labelX}" y="${labelY}" text-anchor="middle">${lineLabel}</text><text class="map-connection-meta" x="${metaX}" y="${metaY}" text-anchor="middle">Limit: ${connection.capacity}</text>` : "";
      const hitX = Math.min(x1, x2) - 12;
      const hitY = Math.min(y1, y2) - 12;
      const hitWidth = Math.abs(x2 - x1) + 24;
      const hitHeight = Math.abs(y2 - y1) + 24;
      return `<g class="map-connection-group ${statusClass} ${activeClass}" data-target-kind="connection" data-target-id="${connection.id}" tabindex="0" aria-label="${lineLabel} transmission line"><line class="map-connection" data-target-kind="connection" data-target-id="${connection.id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>${lineDetails}<rect class="map-connection-hit" data-target-kind="connection" data-target-id="${connection.id}" x="${hitX}" y="${hitY}" width="${hitWidth}" height="${hitHeight}" aria-hidden="true"></rect></g>`;
    }).join("");
    const resourceMarkup = level.resources.map((resource) => `<g class="map-node-group" data-target-kind="resource" data-target-id="${resource.id}" tabindex="0" aria-label="${resource.name}">
      <circle class="map-node-circle resource-card" cx="${resource.x}" cy="${resource.y}" r="58"></circle>
      <text class="map-node-name" x="${resource.x}" y="${resource.y - 12}" text-anchor="middle">${resource.name}</text>
      <text class="map-node-meta" x="${resource.x}" y="${resource.y + 8}" text-anchor="middle">${resource.capacity} MW</text>
      <text class="map-node-price" x="${resource.x}" y="${resource.y + 27}" text-anchor="middle">${formatMoney(resource.offer)}/MWh</text>
    </g>`).join("");
    const busMarkup = level.buses.map((bus) => `<g class="map-node-group status-${targetStatus("bus", bus.id)} ${isActiveTarget("bus", bus.id) ? "is-active" : ""}" data-target-kind="bus" data-target-id="${bus.id}" tabindex="0" aria-label="${bus.name}">
      <circle class="map-node-circle bus-card" cx="${bus.x}" cy="${bus.y}" r="64"></circle>
      <text class="map-node-name" x="${bus.x}" y="${bus.y - 12}" text-anchor="middle">${bus.name}</text>
      <text class="map-node-meta" x="${bus.x}" y="${bus.y + 9}" text-anchor="middle">LMP</text>
      <text class="map-node-price" x="${bus.x}" y="${bus.y + 29}" text-anchor="middle">${nodeLmpValue(shownAnswers[`lmp:${bus.id}`])}</text>
    </g>`).join("");
    const loadMarkup = level.loads.map((load) => `<g class="map-node-group status-${targetStatus("load", load.id)} ${isActiveTarget("load", load.id) ? "is-active" : ""}" data-target-kind="load" data-target-id="${load.id}" tabindex="0" aria-label="${load.name}">
      <circle class="map-node-circle load-card" cx="${load.x}" cy="${load.y}" r="64"></circle>
      <text class="map-node-name" x="${load.x}" y="${load.y - 12}" text-anchor="middle">${load.name}</text>
      <text class="map-node-load" x="${load.x}" y="${load.y + 9}" text-anchor="middle">${load.demand} MW demand</text>
      <text class="map-node-price" x="${load.x}" y="${load.y + 29}" text-anchor="middle">LMP ${nodeLmpValue(shownAnswers[`lmp:${load.id}`])}</text>
    </g>`).join("");
    els["map-connections"].innerHTML = connectionMarkup;
    els["map-resources"].innerHTML = resourceMarkup;
    els["map-buses"].innerHTML = busMarkup;
    els["map-loads"].innerHTML = loadMarkup;
    els["map-title"].textContent = `${level.title} network map`;
    els["map-description"].textContent = "Generating resources connect to grid nodes and the final load. Hover or select a circle or line for details.";
  }

  function getTarget(level, kind, id) {
    if (kind === "resource") return { kind, id, data: level.resources.find((resource) => resource.id === id) };
    if (kind === "bus") return { kind, id, data: level.buses.find((bus) => bus.id === id) };
    if (kind === "load") return { kind, id, data: level.loads.find((load) => load.id === id) };
    if (kind === "connection") return { kind, id, data: level.connections.find((connection) => connection.id === id) };
    return null;
  }

  function targetDetails(target) {
    if (!target || !target.data) return { title: "", kind: "", rows: [] };
    const item = target.data;
    const level = getLevel();
    if (target.kind === "resource") {
      const rows = [["Capacity", `${item.capacity} MW`], ["Offer", `${formatMoney(item.offer)}/MWh`]];
      if (item.supplyCurve) rows.push(["Supply curve", item.supplyCurve.map((block) => `${block.quantity} MW @ ${formatMoney(block.offer)}`).join(" · ")]);
      if (item.offerCurve?.style === "linear") rows.push(["Linear offer curve", item.offerCurve.points.map((point) => `${point.mw} MW @ ${formatMoney(point.price)}`).join(" → ")]);
      if (item.dayAheadOffer !== undefined) rows.push(["Day-ahead offer", `${formatMoney(item.dayAheadOffer)}/MWh`]);
      return { title: item.name, kind: "Resource generator", rows };
    }
    if (target.kind === "bus") {
      const rows = [["LMP", targetValue(target)]];
      if (level.market) rows.push(["Market", level.market]);
      return { title: item.name, kind: "Pricing node", rows };
    }
    if (target.kind === "load") {
      const rows = [["Demand", `${item.demand} MW`], ["LMP", targetValue(target)]];
      if (Array.isArray(item.demandCurve)) rows.push(["Demand curve", item.demandCurve.map((block) => `${block.quantity} MW @ ${formatMoney(block.value)}`).join(" · ")]);
      if (item.demandCurve?.style === "linear") rows.push(["Linear demand curve", item.demandCurve.points.map((point) => `${point.mw} MW @ ${formatMoney(point.value)}`).join(" → ")]);
      if (item.dayAheadDemand !== undefined) rows.push(["Day-ahead demand", `${item.dayAheadDemand} MW`]);
      return { title: item.name, kind: "Load node", rows };
    }
    const rows = [["Capacity", item.capacity], ["Send", targetValue(target)]];
    if (item.crr) rows.push(["CRR", `${item.crr.type} · ${item.crr.holder} · ${formatMoney(item.crr.strike)}/MWh`]);
    return { title: item.label || `${item.from} to ${item.to}`, kind: "Transmission line", rows };
  }

  function curveSeries(target) {
    if (!target || !target.data) return null;
    const item = target.data;
    if (target.kind === "resource" && item.offerCurve?.style === "linear") {
      return { label: "Offer curve", color: "var(--blue)", points: offerCurvePoints(item) };
    }
    if (target.kind === "resource" && Array.isArray(item.supplyCurve)) {
      let mw = 0;
      return { label: "Supply curve", color: "var(--blue)", points: item.supplyCurve.map((block) => { mw += Number(block.quantity); return { mw, price: Number(block.offer) }; }) };
    }
    if (target.kind === "load" && item.demandCurve?.style === "linear") {
      return { label: "Demand curve", color: "var(--orange)", points: item.demandCurve.points.map((point) => ({ mw: Number(point.mw), price: Number(point.value) })) };
    }
    if (target.kind === "load" && Array.isArray(item.demandCurve)) {
      let mw = 0;
      return { label: "Demand curve", color: "var(--orange)", points: item.demandCurve.map((block) => { mw += Number(block.quantity); return { mw, price: Number(block.value) }; }) };
    }
    return null;
  }

  function curveMarkup(target) {
    const series = curveSeries(target);
    if (!series || series.points.length < 2 || series.points.some((point) => !Number.isFinite(point.mw) || !Number.isFinite(point.price))) return "";
    const width = 280;
    const height = 142;
    const left = 42;
    const right = 10;
    const top = 12;
    const bottom = 34;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const maxMw = Math.max(...series.points.map((point) => point.mw), 1);
    const maxPrice = Math.max(...series.points.map((point) => point.price), 1);
    const coordinates = series.points.map((point) => `${left + (point.mw / maxMw) * plotWidth},${top + plotHeight - (point.price / maxPrice) * plotHeight}`).join(" ");
    const dots = series.points.map((point) => {
      const x = left + (point.mw / maxMw) * plotWidth;
      const y = top + plotHeight - (point.price / maxPrice) * plotHeight;
      return `<circle cx="${x}" cy="${y}" r="3" fill="${series.color}"></circle>`;
    }).join("");
    const encodedPoints = encodeURIComponent(JSON.stringify(series.points));
    const startPrice = interpolatedCurvePrice(series.points, 0);
    return `<div class="popover-curve"><div class="popover-curve-title">${series.label}</div><svg class="popover-curve-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${series.label} plotted by megawatts and dollars per megawatt-hour" data-curve-points="${encodedPoints}" data-curve-max-mw="${maxMw}" data-curve-max-price="${maxPrice}" data-curve-left="${left}" data-curve-top="${top}" data-curve-plot-width="${plotWidth}" data-curve-plot-height="${plotHeight}"><line class="popover-curve-axis" x1="${left}" y1="${top}" x2="${left}" y2="${top + plotHeight}"></line><line class="popover-curve-axis" x1="${left}" y1="${top + plotHeight}" x2="${left + plotWidth}" y2="${top + plotHeight}"></line><polyline class="popover-curve-line" style="stroke:${series.color}" points="${coordinates}"></polyline>${dots}<line class="popover-curve-guide" data-curve-guide x1="${left}" y1="${top}" x2="${left}" y2="${top + plotHeight}"></line><circle class="popover-curve-marker" data-curve-marker cx="${left}" cy="${top + plotHeight - (startPrice / maxPrice) * plotHeight}" r="4" style="fill:${series.color}"></circle><text class="popover-curve-axis-label" x="10" y="${top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 10 ${top + plotHeight / 2})">$/MWh</text><text class="popover-curve-value" x="${left - 5}" y="${top + 5}" text-anchor="end">${formatMoney(maxPrice)}</text><text class="popover-curve-value" x="${left - 5}" y="${top + plotHeight + 4}" text-anchor="end">$0</text><text class="popover-curve-value" x="${left}" y="${height - 15}" text-anchor="middle">0</text><text class="popover-curve-value" x="${left + plotWidth}" y="${height - 15}" text-anchor="middle">${maxMw}</text><text class="popover-curve-axis-label" x="${left + plotWidth / 2}" y="${height - 3}" text-anchor="middle">MW</text></svg><div class="popover-curve-readout" data-curve-readout>Drag across the curve to inspect a value.</div></div>`;
  }

  function updateCurveGraph(svg, clientX) {
    const points = JSON.parse(decodeURIComponent(svg.dataset.curvePoints || "[]"));
    if (!points.length) return;
    const rect = svg.getBoundingClientRect();
    const left = Number(svg.dataset.curveLeft);
    const top = Number(svg.dataset.curveTop);
    const plotWidth = Number(svg.dataset.curvePlotWidth);
    const plotHeight = Number(svg.dataset.curvePlotHeight);
    const maxMw = Number(svg.dataset.curveMaxMw);
    const maxPrice = Number(svg.dataset.curveMaxPrice);
    const viewX = Math.max(left, Math.min(left + plotWidth, (clientX - rect.left) * (280 / rect.width)));
    const mw = ((viewX - left) / plotWidth) * maxMw;
    const price = interpolatedCurvePrice(points, mw);
    const y = top + plotHeight - (price / maxPrice) * plotHeight;
    const guide = svg.querySelector("[data-curve-guide]");
    const marker = svg.querySelector("[data-curve-marker]");
    if (guide) { guide.setAttribute("x1", viewX); guide.setAttribute("x2", viewX); }
    if (marker) { marker.setAttribute("cx", viewX); marker.setAttribute("cy", y); }
    const readout = svg.parentElement.querySelector("[data-curve-readout]");
    if (readout) readout.textContent = `${mw.toFixed(1)} MW · ${formatMoney(price)}/MWh`;
  }

  function bindCurveGraphs(container) {
    container.querySelectorAll(".popover-curve-svg").forEach((svg) => {
      const update = (event) => updateCurveGraph(svg, event.clientX);
      svg.addEventListener("pointerdown", (event) => {
        svg.dataset.dragging = "true";
        svg.setPointerCapture?.(event.pointerId);
        update(event);
      });
      svg.addEventListener("pointermove", (event) => {
        if (svg.dataset.dragging === "true") update(event);
      });
      svg.addEventListener("pointerup", (event) => {
        svg.dataset.dragging = "false";
        svg.releasePointerCapture?.(event.pointerId);
      });
      svg.addEventListener("pointercancel", () => { svg.dataset.dragging = "false"; });
    });
  }

  function detailsMarkup(target) {
    const detail = targetDetails(target);
    return `<h4 class="popover-title">${detail.title}</h4><p class="popover-kind">${detail.kind}</p><dl class="popover-details">${detail.rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>${curveMarkup(target)}`;
  }

  function showHover(target) {
    if (!target || !target.data) return;
    els["map-hover-popover"].innerHTML = detailsMarkup(target);
    bindCurveGraphs(els["map-hover-popover"]);
    els["map-hover-popover"].hidden = false;
  }

  function hideHover() { els["map-hover-popover"].hidden = true; }

  function inputConfig(target) {
    if (target.kind === "connection") {
      const numericCapacity = Number.parseFloat(target.data.capacity);
      return { key: `flow:${target.id}`, label: "Transmission flow", min: 0, max: Number.isFinite(numericCapacity) ? numericCapacity : Math.max(100, getLevel().loadDemand * 1.5), step: 0.1, unit: "MW" };
    }
    return { key: `lmp:${target.id}`, label: "LMP price", min: 0, max: 150, step: 0.01, unit: "$/MWh" };
  }

  function renderSolvePopover(target) {
    state.activeTarget = target;
    const detail = targetDetails(target);
    els["solve-popover"].setAttribute("aria-label", detail.title);
    const canSolve = ["bus", "load", "connection"].includes(target.kind);
    if (!canSolve) {
      els["solve-popover"].innerHTML = `${detailsMarkup(target)}<button type="button" class="popover-close" data-close-popover aria-label="Close details">×</button>`;
      bindCurveGraphs(els["solve-popover"]);
      els["solve-popover"].hidden = false;
      return;
    }
    const config = inputConfig(target);
    const saved = state.answers[config.key];
    const sliderValue = Number.isFinite(saved) ? saved : config.min;
    els["solve-popover"].innerHTML = `${detailsMarkup(target)}
      <button type="button" class="popover-close" data-close-popover aria-label="Close details">×</button>
      <form class="popover-form" data-solve-form>
        <label for="popover-range">${config.label} <span class="popover-value" data-value-readout>${Number.isFinite(saved) ? saved : "—"} ${Number.isFinite(saved) ? config.unit : ""}</span></label>
        <input id="popover-range" class="popover-range" type="range" min="${config.min}" max="${config.max}" step="${config.step}" value="${sliderValue}" data-answer-key="${config.key}" aria-label="${config.label} slider">
        <input class="popover-number" type="number" min="${config.min}" max="${config.max}" step="${config.step}" value="${Number.isFinite(saved) ? saved : ""}" data-answer-key="${config.key}" placeholder="Type a value" aria-label="${config.label} typed value">
      </form>
      <p class="popover-note">Slide or type your value. Check Answer when every target is set.</p>`;
    bindCurveGraphs(els["solve-popover"]);
    els["solve-popover"].hidden = false;
  }

  function syncPopoverInput(input) {
    const key = input.dataset.answerKey;
    const value = Number.parseFloat(input.value);
    state.checked = false;
    state.revealed = false;
    if (Number.isFinite(value)) state.answers[key] = value;
    else delete state.answers[key];
    const range = els["solve-popover"].querySelector('[data-answer-key][type="range"]');
    const number = els["solve-popover"].querySelector('[data-answer-key][type="number"]');
    const config = state.activeTarget ? inputConfig(state.activeTarget) : null;
    if (config && Number.isFinite(value)) {
      if (range && input !== range) range.value = value;
      if (number && input !== number) number.value = value;
      const readout = els["solve-popover"].querySelector("[data-value-readout]");
      if (readout) readout.textContent = `${value} ${config.unit}`;
    }
    renderMap(getLevel(), state.answers);
    if (state.activeTarget) {
      const updated = getTarget(getLevel(), state.activeTarget.kind, state.activeTarget.id);
      els["solve-popover"].querySelector(".popover-details")?.replaceWith(document.createRange().createContextualFragment(detailsMarkup(updated)).querySelector(".popover-details"));
    }
  }

  function closeSolvePopover() {
    state.activeTarget = null;
    els["network-map"]?.querySelectorAll(".is-active").forEach((element) => element.classList.remove("is-active"));
    els["solve-popover"].hidden = true;
  }

  function renderLevelPage() {
    const level = getLevel();
    els["level-page-title"].textContent = `${level.title}: ${level.theme}`;
    els["level-description"].textContent = `${level.description} ${level.challenge} Hover over the resources to see cost curves.`;
    renderMap(level, state.answers);
    hideHover();
    closeSolvePopover();
    els["network-feedback"].className = "network-feedback";
    els["network-feedback"].textContent = "Click a node or line to set its value.";
    els["completion-panel"].hidden = true;
  }

  function readAnswers(level) {
    const lmp = Object.fromEntries([...level.buses, ...level.loads].map((node) => [node.id, state.answers[`lmp:${node.id}`]]));
    const flows = Object.fromEntries(level.connections.filter((connection) => connection.type === "transmission").map((connection) => [connection.id, state.answers[`flow:${connection.id}`]]));
    const missing = [...Object.values(lmp), ...Object.values(flows)].filter((value) => !Number.isFinite(value));
    return { lmp, flows, missing };
  }

  function within(value, expected, tolerance) { return Number.isFinite(value) && Math.abs(value - expected) <= tolerance; }

  function classifyAnswers(level, answers) {
    const transmissions = level.connections.filter((connection) => connection.type === "transmission");
    const solution = level.solution || { lmp: level.expectedLmp, flows: Object.fromEntries(transmissions.map((connection) => [connection.id, connection.expectedFlow])) };
    const perfectLmp = Object.entries(solution.lmp).every(([id, expected]) => within(answers.lmp[id], expected, 0.01));
    const perfectFlow = transmissions.every((connection) => within(answers.flows[connection.id], solution.flows[connection.id], 0.1));
    if (perfectLmp && perfectFlow) return "green";
    const solvedLmp = Object.entries(solution.lmp).every(([id, expected]) => within(answers.lmp[id], expected, 5));
    const solvedFlow = transmissions.every((connection) => within(answers.flows[connection.id], solution.flows[connection.id], 5));
    return solvedLmp && solvedFlow ? "yellow" : null;
  }

  function retainWorkingAnswers(level, answers) {
    const kept = {};
    const solution = level.solution || { lmp: level.expectedLmp, flows: Object.fromEntries(level.connections.filter((connection) => connection.type === "transmission").map((connection) => [connection.id, connection.expectedFlow])) };
    [...level.buses, ...level.loads].forEach((node) => {
      if (within(answers.lmp[node.id], solution.lmp[node.id], 5)) kept[`lmp:${node.id}`] = answers.lmp[node.id];
    });
    level.connections.filter((connection) => connection.type === "transmission").forEach((connection) => {
      if (within(answers.flows[connection.id], solution.flows[connection.id], 5)) kept[`flow:${connection.id}`] = answers.flows[connection.id];
    });
    return kept;
  }

  function completionText(status, level) {
    if (status === "green") return "Perfectly solved.";
    if (status === "yellow") return "Solved, but not perfectly.";
    return level.explanation;
  }

  function updateCompletionPanel(status, level) {
    const next = levels.find((candidate) => candidate.id === level.id + 1 && candidate.playable);
    const nextUnlocked = next && isUnlocked(next);
    const yellow = yellowCount();
    els["completion-panel"].hidden = !status;
    if (!status) return;
    els["completion-title"].textContent = status === "green" ? "Perfect" : "Solved";
    els["completion-message"].textContent = completionText(status, level);
    els["next-level-button"].hidden = !nextUnlocked;
    if (nextUnlocked) els["next-level-button"].textContent = "Next →";
    if (yellow >= 2) els["completion-message"].textContent += ` Solve ${yellow - 1} more level${yellow - 1 === 1 ? "" : "s"} perfectly to unlock.`;
  }

  function revealAnswer() {
    const level = getLevel();
    const solution = level.solution || { lmp: level.expectedLmp, flows: Object.fromEntries(level.connections.filter((connection) => connection.type === "transmission").map((connection) => [connection.id, connection.expectedFlow])) };
    state.answers = {};
    level.buses.forEach((bus) => { state.answers[`lmp:${bus.id}`] = solution.lmp[bus.id]; });
    level.loads.forEach((load) => { state.answers[`lmp:${load.id}`] = solution.lmp[load.id]; });
    level.connections.filter((connection) => connection.type === "transmission").forEach((connection) => {
      state.answers[`flow:${connection.id}`] = solution.flows[connection.id];
    });
    state.checked = true;
    state.revealed = true;
    renderMap(level, state.answers);
    closeSolvePopover();
    els["network-feedback"].className = "network-feedback is-close";
    els["network-feedback"].textContent = "Correct values revealed. Change a value to solve the level yourself.";
    els["completion-panel"].hidden = true;
  }

  function checkNetwork() {
    const level = getLevel();
    if (state.revealed) {
      els["network-feedback"].className = "network-feedback is-close";
      els["network-feedback"].textContent = "Correct values are revealed. Reset the level to try again.";
      return;
    }
    const answers = readAnswers(level);
    state.checked = true;
    if (answers.missing.length) {
      state.answers = retainWorkingAnswers(level, answers);
      renderMap(level, state.answers);
      closeSolvePopover();
      els["network-feedback"].className = "network-feedback is-error";
      els["network-feedback"].textContent = "Set every target. Correct values remain; incorrect values were cleared.";
      return;
    }
    const status = classifyAnswers(level, answers);
    if (status) {
      state.statuses.set(level.id, status);
      saveProgress();
      renderMap(level, state.answers);
      els["network-feedback"].className = `network-feedback ${status === "green" ? "is-correct" : "is-close"}`;
      els["network-feedback"].textContent = completionText(status, level);
      updateCompletionPanel(status, level);
      return;
    }
    state.statuses.delete(level.id);
    saveProgress();
    state.answers = retainWorkingAnswers(level, answers);
    state.checked = true;
    renderMap(level, state.answers);
    closeSolvePopover();
    els["network-feedback"].className = "network-feedback is-error";
    els["network-feedback"].textContent = "Some values were incorrect. Correct values remain; fix the red targets.";
    els["completion-panel"].hidden = true;
  }

  function resetLevel() {
    const levelId = state.levelId;
    [...state.statuses.keys()].forEach((id) => { if (id >= levelId) state.statuses.delete(id); });
    saveProgress();
    state.answers = {};
    state.revealed = false;
    closeSolvePopover();
    renderLevelSelect();
    openLevel(levelId);
  }

  function resetAllProgress() {
    if (!window.confirm("Reset all level progress and start over?")) return;
    localStorage.removeItem(PROGRESS_KEY);
    state.statuses.clear();
    state.dayAheadStatuses.clear();
    state.dayAheadOffers = {};
    state.levelId = null;
    state.dayAheadLevelId = null;
    state.answers = {};
    state.checked = false;
    state.revealed = false;
    closeSolvePopover();
    renderLevelSelect();
  }

  function targetFromElement(element) {
    if (!element || !element.dataset.targetKind) return null;
    return getTarget(getLevel(), element.dataset.targetKind, element.dataset.targetId);
  }

  function bindMapEvents() {
    els["network-map"].addEventListener("mouseover", (event) => {
      const group = event.target.closest(".map-connection-group, .map-node-group");
      if (!group || !els["network-map"].contains(group)) return;
      if (event.relatedTarget && group.contains(event.relatedTarget)) return;
      showHover(targetFromElement(group));
    });
    els["network-map"].addEventListener("mouseout", (event) => {
      const group = event.target.closest(".map-connection-group, .map-node-group");
      if (!group || (event.relatedTarget && (group.contains(event.relatedTarget) || els["map-hover-popover"].contains(event.relatedTarget)))) return;
      hideHover();
    });
    els["network-map"].addEventListener("focusin", (event) => showHover(targetFromElement(event.target.closest(".map-connection-group, .map-node-group"))));
    els["network-map"].addEventListener("focusout", hideHover);
    els["network-map"].addEventListener("click", (event) => {
      const group = event.target.closest(".map-connection-group, .map-node-group");
      if (!group) return;
      hideHover();
      els["network-map"].querySelectorAll(".is-active").forEach((element) => element.classList.remove("is-active"));
      group.classList.add("is-active");
      renderSolvePopover(targetFromElement(group));
    });
  }

  function bindEvents() {
    els["lmp-mode-button"].addEventListener("click", renderLevelSelect);
    els["network-mode-button"].addEventListener("click", renderConstructionSelect);
    els["day-ahead-mode-button"].addEventListener("click", renderDayAheadSelect);
    els["mode-back-button"].addEventListener("click", renderModeSelect);
    els["construction-mode-back-button"].addEventListener("click", renderModeSelect);
    els["day-ahead-mode-back-button"].addEventListener("click", renderModeSelect);
    els["day-ahead-full-reset-button"].addEventListener("click", resetDayAheadProgress);
    els["day-ahead-back-button"].addEventListener("click", renderDayAheadSelect);
    els["day-ahead-reset-button"].addEventListener("click", resetDayAheadLevel);
    els["day-ahead-prev-button"].addEventListener("click", () => {
      const previous = dayAheadLevels.find((level) => level.id === state.dayAheadLevelId - 1);
      if (previous) openDayAheadLevel(previous.id);
    });
    els["day-ahead-next-button"].addEventListener("click", () => {
      const next = dayAheadLevels.find((level) => level.id === state.dayAheadLevelId + 1);
      if (next && isDayAheadUnlocked(next)) openDayAheadLevel(next.id);
    });
    els["day-ahead-run-button"].addEventListener("click", runDayAheadMarket);
    els["day-ahead-check-button"].addEventListener("click", checkDayAheadSchedule);
    els["day-ahead-offers"].addEventListener("input", (event) => {
      const input = event.target.closest("[data-day-ahead-offer]");
      if (!input) return;
      const level = getDayAheadLevel();
      const id = input.dataset.dayAheadOffer;
      if (!state.dayAheadOffers[level.id] || typeof state.dayAheadOffers[level.id] !== "object") state.dayAheadOffers[level.id] = {};
      const kind = input.dataset.dayAheadKind;
      if (kind) {
        if (!state.dayAheadOffers[level.id][id] || typeof state.dayAheadOffers[level.id][id] !== "object") state.dayAheadOffers[level.id][id] = {};
        state.dayAheadOffers[level.id][id][kind] = Number(input.value);
      } else {
        state.dayAheadOffers[level.id][id] = Number(input.value);
      }
      const readout = els["day-ahead-offers"].querySelector(`[data-day-ahead-readout="${id}${kind ? `-${kind}` : ""}"]`);
      if (readout) readout.textContent = kind === "commitment" ? (Number(input.value) ? "ON" : "OFF") : `${input.value} ${dayAheadControlConfig(level, level.resources.find((resource) => resource.id === id)).suffix}`;
      state.dayAheadResult = null;
      renderDayAheadStack(level);
      renderDayAheadResult();
      saveProgress();
    });
    els["construction-full-reset-button"].addEventListener("click", resetConstructionProgress);
    els["construction-back-button"].addEventListener("click", renderConstructionSelect);
    els["construction-reset-button"].addEventListener("click", resetConstructionLevel);
    els["construction-prev-button"].addEventListener("click", () => {
      const previous = constructionLevels.find((level) => level.id === state.constructionLevelId - 1);
      if (previous) openConstructionLevel(previous.id);
    });
    els["construction-next-button"].addEventListener("click", () => {
      const next = constructionLevels.find((level) => level.id === state.constructionLevelId + 1);
      if (next && isConstructionUnlocked(next)) openConstructionLevel(next.id);
    });
    els["construction-check-button"].addEventListener("click", () => {
      const result = validateConstructionNetwork();
      state.construction.checked = true;
      if (result.valid) state.constructionStatuses.set(state.constructionLevelId, "green");
      els["construction-feedback"].className = `network-feedback construction-result ${result.valid ? "is-correct" : "is-error"}`;
      els["construction-feedback"].innerHTML = result.valid ? "<strong>Success</strong><span>Valid network. Every MW of load is served.</span>" : `<strong>Try again</strong><span>${result.errors.join(" ")}</span>`;
      renderConstructionView();
    });
    els["construction-reveal-button"].addEventListener("click", revealConstructionSolution);
    els["construction-piece-tray"].addEventListener("dragstart", (event) => {
      const button = event.target.closest("[data-construction-piece-id], [data-construction-line-piece]");
      if (!button) return;
      const payload = button.dataset.constructionPieceId ? `node:${button.dataset.constructionPieceId}` : `line:${button.dataset.constructionLinePiece}`;
      event.dataTransfer.setData("text/plain", payload);
    });
    els["construction-map"].addEventListener("dragover", (event) => event.preventDefault());
    els["construction-map"].addEventListener("drop", (event) => {
      event.preventDefault();
      const payload = event.dataTransfer.getData("text/plain");
      const point = constructionMapPoint(event);
      if (payload.startsWith("node:")) addConstructionComponent(payload.slice(5), point);
      if (payload.startsWith("line:")) placeConstructionLine(payload.slice(5), point);
    });
    els["construction-map"].addEventListener("pointerdown", (event) => {
      const nodeGroup = event.target.closest("[data-construction-node]");
      const lineGroup = event.target.closest("[data-construction-line]");
      if (nodeGroup) {
        state.construction.selected = `node:${nodeGroup.dataset.constructionNode}`;
        state.construction.dragging = { kind: "node", id: nodeGroup.dataset.constructionNode, pointerId: event.pointerId, moved: false, x: event.clientX, y: event.clientY };
        if (nodeGroup.setPointerCapture) nodeGroup.setPointerCapture(event.pointerId);
      } else if (lineGroup) {
        const line = state.construction.lines.find((candidate) => candidate.id === lineGroup.dataset.constructionLine);
        if (!line) return;
        const geometry = constructionLineGeometry(line, constructionPositions());
        const mapPoint = constructionMapPoint(event);
        state.construction.selected = `line:${line.id}`;
        state.construction.dragging = { kind: "line", id: line.id, pointerId: event.pointerId, moved: false, x: event.clientX, y: event.clientY, startMap: mapPoint, startGeometry: geometry, originalFrom: line.from, originalTo: line.to, wasPlaced: line.placed };
        line.from = null;
        line.to = null;
        line.placed = false;
        line.x1 = geometry.from.x;
        line.y1 = geometry.from.y;
        line.x2 = geometry.to.x;
        line.y2 = geometry.to.y;
        if (lineGroup.setPointerCapture) lineGroup.setPointerCapture(event.pointerId);
      } else return;
      event.preventDefault();
    });
    els["construction-map"].addEventListener("pointermove", (event) => {
      const drag = state.construction.dragging;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 2) drag.moved = true;
      const point = constructionMapPoint(event);
      if (drag.kind === "node") {
        const node = state.construction.nodes.find((candidate) => candidate.id === drag.id);
        if (!node) return;
        node.x = point.x;
        node.y = point.y;
      } else {
        const line = state.construction.lines.find((candidate) => candidate.id === drag.id);
        if (!line) return;
        const dx = point.x - drag.startMap.x;
        const dy = point.y - drag.startMap.y;
        line.x1 = drag.startGeometry.from.x + dx;
        line.y1 = drag.startGeometry.from.y + dy;
        line.x2 = drag.startGeometry.to.x + dx;
        line.y2 = drag.startGeometry.to.y + dy;
      }
      updateConstructionGeometry();
    });
    els["construction-map"].addEventListener("pointerup", (event) => {
      const drag = state.construction.dragging;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const captureGroup = event.target.closest("[data-construction-node], [data-construction-line]");
      if (captureGroup && captureGroup.releasePointerCapture) {
        try { captureGroup.releasePointerCapture(event.pointerId); } catch (error) { /* capture may already be released */ }
      }
      if (drag.kind === "line" && drag.moved) {
        const line = state.construction.lines.find((candidate) => candidate.id === drag.id);
        if (line) {
          const positions = constructionPositions();
          const geometry = constructionLineGeometry(line, positions);
          const fromMatches = [...state.construction.nodes].sort((a, b) => Math.hypot(a.x - geometry.from.x, a.y - geometry.from.y) - Math.hypot(b.x - geometry.from.x, b.y - geometry.from.y));
          const toMatches = [...state.construction.nodes].filter((node) => node.id !== fromMatches[0]?.id).sort((a, b) => Math.hypot(a.x - geometry.to.x, a.y - geometry.to.y) - Math.hypot(b.x - geometry.to.x, b.y - geometry.to.y));
          if (fromMatches[0] && toMatches[0] && Math.hypot(fromMatches[0].x - geometry.from.x, fromMatches[0].y - geometry.from.y) < 220 && Math.hypot(toMatches[0].x - geometry.to.x, toMatches[0].y - geometry.to.y) < 220) {
            line.from = fromMatches[0].id;
            line.to = toMatches[0].id;
            line.placed = true;
            line.x1 = null;
            line.y1 = null;
            line.x2 = null;
            line.y2 = null;
          }
        }
      } else if (drag.kind === "line") {
        const line = state.construction.lines.find((candidate) => candidate.id === drag.id);
        if (line && drag.wasPlaced) {
          line.from = drag.originalFrom;
          line.to = drag.originalTo;
          line.placed = true;
          line.x1 = null;
          line.y1 = null;
          line.x2 = null;
          line.y2 = null;
        }
      }
      state.construction.dragging = null;
      renderConstructionView();
    });
    els["construction-map"].addEventListener("pointercancel", () => {
      const drag = state.construction.dragging;
      if (drag?.kind === "line" && drag.wasPlaced) {
        const line = state.construction.lines.find((candidate) => candidate.id === drag.id);
        if (line) {
          line.from = drag.originalFrom;
          line.to = drag.originalTo;
          line.placed = true;
          line.x1 = null;
          line.y1 = null;
          line.x2 = null;
          line.y2 = null;
        }
      }
      state.construction.dragging = null;
      renderConstructionView();
    });
    els["construction-map"].addEventListener("click", (event) => {
      const lineGroup = event.target.closest("[data-construction-line]");
      if (!lineGroup) return;
      state.construction.selected = `line:${lineGroup.dataset.constructionLine}`;
      renderConstructionView();
    });
    els["construction-inspector"].addEventListener("click", (event) => {
      const action = event.target.dataset.constructionAction;
      if (!action) return;
      if (action === "clear") {
        resetConstructionLevel();
        return;
      }
      const [, operation, kind, id] = action.match(/^(return):(node|line):(.+)$/) || [];
      if (!operation) return;
      const line = kind === "line" ? state.construction.lines.find((candidate) => candidate.id === id) : null;
      if (kind === "node") {
        state.construction.nodes = state.construction.nodes.filter((node) => node.id !== id);
        state.construction.lines.forEach((candidate) => { if (candidate.from === id || candidate.to === id) { candidate.from = null; candidate.to = null; candidate.placed = false; candidate.inWorkspace = false; candidate.x1 = null; candidate.y1 = null; candidate.x2 = null; candidate.y2 = null; } });
      } else if (line) {
        line.from = null;
        line.to = null;
        line.placed = false;
        line.inWorkspace = false;
        line.x1 = null;
        line.y1 = null;
        line.x2 = null;
        line.y2 = null;
      }
      state.construction.selected = null;
      state.construction.checked = false;
      els["construction-feedback"].className = "network-feedback";
      els["construction-feedback"].textContent = "Piece returned to the starting box.";
      renderConstructionView();
    });
    els["back-button"].addEventListener("click", () => renderLevelSelect());
    els["reset-level-button"].addEventListener("click", resetLevel);
    els["full-reset-select-button"].addEventListener("click", resetAllProgress);
    els["check-network-button"].addEventListener("click", checkNetwork);
    els["reveal-answer-button"].addEventListener("click", revealAnswer);
    els["next-level-button"].addEventListener("click", () => {
      const next = levels.find((level) => level.id === state.levelId + 1 && level.playable);
      if (next && isUnlocked(next)) openLevel(next.id);
    });
    els["solve-popover"].addEventListener("click", (event) => {
      if (event.target.closest("[data-close-popover]")) closeSolvePopover();
    });
    els["solve-popover"].addEventListener("input", (event) => {
      if (event.target.matches("[data-answer-key]")) syncPopoverInput(event.target);
    });
    els["solve-popover"].addEventListener("submit", (event) => event.preventDefault());
    els["theme-toggle"].addEventListener("click", () => {
      state.theme = state.theme === "night" ? "day" : "night";
      localStorage.setItem(THEME_KEY, state.theme);
      applyTheme();
    });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSolvePopover(); });
    window.addEventListener("resize", () => {
      if (state.screen === "construction-level") renderConstructionMap();
    });
    els["map-hover-popover"].addEventListener("mouseleave", hideHover);
    bindMapEvents();
  }

  loadProgress();
  cacheElements();
  applyTheme();
  bindEvents();
  renderModeSelect();
})();
