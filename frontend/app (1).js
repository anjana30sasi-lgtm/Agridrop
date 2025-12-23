// ===== Configuration =====
// This URL points to your live Render backend
const API_URL = 'https://agridrop-vxci.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // ===== Slider & Navigation Logic =====
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

    // Transition from Welcome Slider to Main App
    if (enterAppBtn) {
        enterAppBtn.addEventListener('click', () => {
            sliderContainer.style.display = 'none';
            appContainer.style.display = 'block';
            window.scrollTo(0, 0);
        });
    }

    // ===== Form Submission & API Integration =====
    const cropForm = document.getElementById('cropForm');
    const resultsDiv = document.getElementById('results');
    let myChart = null;

    if (cropForm) {
        cropForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show a loading message while Render "wakes up"
            resultsDiv.innerHTML = `<p style="color: #27ae60; font-weight: bold;">Connecting to server... Please wait (this may take 30 seconds if the server was asleep).</p>`;

            const region = document.getElementById('region').value;
            const water = document.getElementById('water').value;
            const landSize = parseFloat(document.getElementById('landSize').value) || 1;

            const params = new URLSearchParams({ 
                water: water, 
                region: region, 
                land: landSize 
            });

            try {
                const response = await fetch(`${API_URL}/recommend?${params}`);
                
                if (!response.ok) {
                    throw new Error("Could not fetch recommendations");
                }

                const data = await response.json();
                displayResults(data, landSize);
            } catch (err) {
                console.error("Fetch error:", err);
                resultsDiv.innerHTML = `
                    <div style="color:red; padding: 20px; border: 1px solid red; border-radius: 8px;">
                        <p><strong>Error:</strong> Unable to connect to the backend.</p>
                        <p>Check if your Render service is active at <a href="${API_URL}" target="_blank">this link</a>.</p>
                    </div>`;
            }
        });
    }

    // ===== Displaying Results & Charting =====
    function displayResults(crops, landSize) {
        if (!crops || crops.length === 0) {
            resultsDiv.innerHTML = `<p>No matching crops found for your selection. Try different region or water settings.</p>`;
            return;
        }

        let html = `<h3>Top Recommendations for ${landSize} Acre(s):</h3><div class="crop-cards">`;
        const labels = [];
        const profitData = [];

        crops.forEach(crop => {
            labels.push(crop.crop);
            profitData.push(crop.total_profit);

            html += `
                <div class="crop-card" style="border-left: 5px solid #2ecc71; padding: 15px; margin-bottom: 15px; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h4 style="margin: 0; color: #2c3e50;">${crop.crop}</h4>
                    <p style="margin: 5px 0;"><strong>Estimated Yield:</strong> ${crop.total_yield.toFixed(2)} tons</p>
                    <p style="margin: 5px 0; color: #27ae60;"><strong>Projected Profit:</strong> ₹${crop.total_profit.toLocaleString()}</p>
                </div>`;
        });

        html += `</div><canvas id="resultsChart" style="margin-top: 20px;"></canvas>`;
        resultsDiv.innerHTML = html;

        // Render the Chart
        const ctx = document.getElementById('resultsChart').getContext('2d');
        if (myChart) myChart.destroy();

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Profit (₹)',
                    data: profitData,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
});
