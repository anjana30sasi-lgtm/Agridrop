// ===== Configuration =====
// Change 'YOUR_RENDER_URL' to the link Render gives you once you host the backend.
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000' 
    : 'https://YOUR_RENDER_URL.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // ===== Slider Logic =====
    const slidesContainer = document.querySelector('.slides');
    const slides = document.querySelectorAll('.slide');
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');
    const sliderContainer = document.querySelector('.slider-container');
    const appContainer = document.querySelector('.app-container');
    const enterAppBtn = document.getElementById('enterApp');

    let currentIndex = 0;
    function showSlide(index) {
        if (!slidesContainer) return;
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }

    if (prev) prev.addEventListener('click', () => showSlide(currentIndex - 1));
    if (next) next.addEventListener('click', () => showSlide(currentIndex + 1));

    if (enterAppBtn) {
        enterAppBtn.addEventListener('click', () => {
            sliderContainer.style.display = 'none';
            appContainer.style.display = 'block';
            console.log("App section activated");
        });
    }

    // ===== Form Submission & API Integration =====
    const cropForm = document.getElementById('cropForm');
    const resultsDiv = document.getElementById('results');
    let myChart = null;

    if (cropForm) {
        cropForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const region = document.getElementById('region').value;
            const water = document.getElementById('water').value;
            const landSize = parseFloat(document.getElementById('landSize').value) || 1;

            // Pack parameters for the API
            const params = new URLSearchParams({ water, region, land: landSize });

            try {
                // Fetch data from the API
                const response = await fetch(`${API_URL}/recommend?${params}`);
                if (!response.ok) throw new Error("Backend server error");

                const data = await response.json();
                displayResults(data, landSize);
            } catch (err) {
                console.error(err);
                resultsDiv.innerHTML = `<p style="color:red;">Error: Cannot connect to the crop database. Make sure the backend is running.</p>`;
            }
        });
    }

    // ===== Displaying Results & Charting =====
    function displayResults(crops, landSize) {
        if (!crops || crops.length === 0) {
            resultsDiv.innerHTML = `<p>No matching crops found for this region and water level.</p>`;
            return;
        }

        let html = `<h3>Recommended Crops for ${landSize} acre(s):</h3><div class="crop-cards">`;
        const labels = [], profitData = [];

        crops.forEach(crop => {
            labels.push(crop.crop);
            profitData.push(crop.total_profit);

            html += `
                <div class="crop-card" style="border:1px solid #ddd; padding:15px; border-radius:8px; background:#f9f9f9; margin-bottom:10px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
                    <h4>${crop.crop}</h4>
                    <p><strong>Total Yield:</strong> ${crop.total_yield} tons</p>
                    <p><strong>Total Profit:</strong> ₹${crop.total_profit.toLocaleString()}</p>
                    <small>Region: ${crop.region} | Water Need: ${crop.water_need}</small>
                </div>`;
        });

        html += `</div><canvas id="resultsChart" width="400" height="200"></canvas>`;
        resultsDiv.innerHTML = html;

        // Create the visual chart using Chart.js
        const ctx = document.getElementById('resultsChart').getContext('2d');
        if (myChart) myChart.destroy();

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Projected Profit (₹)',
                    data: profitData,
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
});