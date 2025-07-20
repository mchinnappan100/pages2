// Function to fetch hardiness zone from ZIP code using PlantMaps API (hypothetical endpoint)
async function getZoneFromZip(zipCode) {
    try {
        const response = await fetch(`https://www.plantmaps.com/api/zipcode.php?zip=${zipCode}`);
        if (!response.ok) {
            throw new Error('Invalid ZIP code or API error');
        }
        const data = await response.json();
        return data.zone || '6a'; // Default to 6a if no zone is found
    } catch (error) {
        console.error('Error fetching zone:', error);
        showError('Could not retrieve hardiness zone. Please check your ZIP code and try again.');
        return '6a'; // Fallback zone
    }
}

// Function to fetch plant data from Trefle API
async function getPlantData(zone) {
    try {
        const response = await fetch(`https://trefle.io/api/v1/plants?zone=${zone}&token=YOUR_TREFLE_API_KEY`);
        if (!response.ok) {
            throw new Error('Error fetching plant data');
        }
        const data = await response.json();
        return {
            plants: data.data.slice(0, 4).map(plant => ({
                name: plant.common_name || 'Unknown Plant',
                description: plant.scientific_name || 'No description available'
            })),
            vegetables: data.data.filter(p => p.family === 'Vegetable').slice(0, 4).map(veg => ({
                name: veg.common_name || 'Unknown Vegetable',
                description: veg.scientific_name || 'No description available'
            })),
            flowers: data.data.filter(p => p.type === 'Flower').slice(0, 4).map(flower => ({
                name: flower.common_name || 'Unknown Flower',
                description: flower.scientific_name || 'No description available'
            }))
        };
    } catch (error) {
        console.error('Error fetching plant data:', error);
        return getFallbackPlantData(zone); // Fallback to static data if API fails
    }
}

// Fallback plant data (subset of your original zoneData for brevity)
function getFallbackPlantData(zone) {
    const fallbackData = {
        '3a': {
            temp: '-40°F to -35°F (-40°C to -37.2°C)',
            plants: [
                { name: 'Siberian Iris', description: 'Hardy perennial with beautiful purple flowers' },
                { name: 'Hosta', description: 'Shade-loving plants with attractive foliage' }
            ],
            vegetables: [
                { name: 'Carrots', description: 'Cool-season root vegetable' },
                { name: 'Lettuce', description: 'Quick-growing leafy green' }
            ],
            flowers: [
                { name: 'Pansy', description: 'Cold-tolerant annual' },
                { name: 'Marigold', description: 'Bright annual' }
            ]
        },
        // Add other zones as needed
        '9a': {
            temp: '20°F to 25°F (-6.7°C to -3.9°C)',
            plants: [
                { name: 'Palm Trees', description: 'Tropical trees for landscape focal points' },
                { name: 'Citrus Trees', description: 'Orange, lemon, lime trees' }
            ],
            vegetables: [
                { name: 'Kale', description: 'Cool-season superfood green' },
                { name: 'Arugula', description: 'Peppery salad green' }
            ],
            flowers: [
                { name: 'Ixora', description: 'Clusters of small bright flowers' },
                { name: 'Croton', description: 'Colorful foliage plant' }
            ]
        }
    };
    return fallbackData[zone] || fallbackData['9a'];
}

// Function to get seasonal tips based on current month
function getSeasonalTips(zone) {
    const currentMonth = new Date().getMonth();
    const season = currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
                  currentMonth >= 5 && currentMonth <= 7 ? 'summer' :
                  currentMonth >= 8 && currentMonth <= 10 ? 'fall' : 'winter';
    
    const tips = {
        spring: [
            'Start seeds indoors 6-8 weeks before last frost',
            'Begin hardening off seedlings on warm days',
            'Plant cool-season crops like lettuce and peas',
            'Apply compost to garden beds'
        ],
        summer: [
            'Water deeply but less frequently',
            'Mulch around plants to retain moisture',
            'Deadhead flowers to encourage blooming',
            'Harvest vegetables regularly'
        ],
        fall: [
            'Plant spring-blooming bulbs',
            'Collect seeds from favorite flowers',
            'Begin preparing garden for winter',
            'Plant cool-season vegetables'
        ],
        winter: [
            'Plan next year\'s garden layout',
            'Order seeds from catalogs',
            'Protect tender plants from frost',
            'Maintain garden tools'
        ]
    };
    return tips[season];
}

// Function to display results
function displayResults(zone, data) {
    // Update zone card
    document.getElementById('zoneNumber').textContent = `Zone ${zone}`;
    document.getElementById('zoneTemp').textContent = data.temp;

    // Display plants
    const plantsList = document.getElementById('plantsList');
    plantsList.innerHTML = data.plants.map(plant => 
        `<div class="plant-item">
            <div class="plant-name">${plant.name}</div>
            <div class="plant-description">${plant.description}</div>
        </div>`
    ).join('');

    // Display vegetables
    const vegetableGarden = document.getElementById('vegetableGarden');
    vegetableGarden.innerHTML = data.vegetables.map(veg => 
        `<div class="plant-item">
            <div class="plant-name">${veg.name}</div>
            <div class="plant-description">${veg.description}</div>
        </div>`
    ).join('');

    // Display flowers
    const flowerGarden = document.getElementById('flowerGarden');
    flowerGarden.innerHTML = data.flowers.map(flower => 
        `<div class="plant-item">
            <div class="plant-name">${flower.name}</div>
            <div class="plant-description">${flower.description}</div>
        </div>`
    ).join('');

    // Display seasonal tips
    const seasonalTips = document.getElementById('seasonalTips');
    const tips = getSeasonalTips(zone);
    seasonalTips.innerHTML = tips.map(tip => 
        `<div class="tip-item">${tip}</div>`
    ).join('');
}

// Function to show error message
function showError(message) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.innerHTML = `<div class="error">${message}</div>`;
}

// Form submission handler
document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const zipCode = document.getElementById('zipInput').value;
    const resultsSection = document.getElementById('resultsSection');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    
    // Validate ZIP code
    if (!/^\d{5}$/.test(zipCode)) {
        showError('Please enter a valid 5-digit ZIP code.');
        return;
    }

    // Show loading state
    resultsSection.style.display = 'block';
    loading.style.display = 'block';
    results.style.display = 'none';
    
    try {
        // Fetch zone and plant data
        const zone = await getZoneFromZip(zipCode);
        const plantData = await getPlantData(zone);
        
        // Hide loading, show results
        loading.style.display = 'none';
        results.style.display = 'block';
        displayResults(zone, plantData);
    } catch (error) {
        console.error('Error processing request:', error);
        showError('An error occurred. Please try again later.');
        loading.style.display = 'none';
    }
});

// Auto-format ZIP code input
document.getElementById('zipInput').addEventListener('input', function(e) {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
});