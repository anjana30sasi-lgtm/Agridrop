// ===== Configuration =====
// This matches your live Render service exactly.
const API_URL = 'https://agridrop-vxci.onrender.com';

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

            // Clear previous results and show loading status
            resultsDiv.innerHTML = `<p style="color: #27ae60; font-weight: bold;">Connecting to Agridrop server... Please wait.</p>`;

            const region = document.getElementById('region').value;
            const water = document.getElementById('water').value;
            const landSize = parseFloat(document.getElementById('landSize').value) || 1;

            try {
                // Fetch recommendations from your live Render backend
                const response = await fetch(`${API_URL}/recommend?water=${water}&region=${region}&land=${landSize}`);
                
                if (!response.ok) throw new Error("Backend server error");

                const data = await response.json();
                displayResults(data, landSize);
            } catch (err) {
                console.error("Connection Error:", err);
                resultsDiv.innerHTML = `<p style="color:red;">Error: Cannot connect to the database. Make sure the backend is awake.</p>`;
            }
        });
    }

    // ===== Displaying Results & Charting =====
    function displayResults(crops, landSize) {
        if (!crops || crops.length === 0) {
            resultsDiv.innerHTML = `<p>No matching crops found for this selection.</p>`;
            return;
        }

        let html = `<h3>Recommended Crops for ${landSize} Acre(s):</h3><div class="crop-cards">`;
        const labels = [], profitData = [];

        crops.forEach(crop => {
            labels.push(crop.crop);
            profitData.push(crop.total_profit);

            // FIX: Convert values to Numbers so .toFixed(2) and .toLocaleString() work
            // This prevents the "toFixed is not a function" error
            const yieldValue = Number(crop.total_yield).toFixed(2);
            const profitValue = Number(crop.total_profit).toLocaleString('en-IN');

            html += `
                <div class="crop-card" style="border:1px solid #ddd; padding:15px; border-radius:8px; background:#fff; margin-bottom:15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h4 style="margin-top:0; color:#2c3e50;">${crop.crop}</h4>
                    <p><strong>Total Yield:</strong> ${yieldValue} tons</p>
                    <p style="color: #27ae60; font-size: 1.1em;"><strong>Projected Profit:</strong> ₹${profitValue}</p>
                    <small style="color:#7f8c8d;">Region: ${crop.region} | Water: ${crop.water_need}</small>
                </div>`;
        });

        html += `</div><canvas id="resultsChart" style="margin-top:30px;"></canvas>`;
        resultsDiv.innerHTML = html;

        // Create the bar chart using Chart.js
        const ctx = document.getElementById('resultsChart').getContext('2d');
        if (myChart) myChart.destroy();

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Profit (₹)',
                    data: profitData,
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return '₹' + value.toLocaleString(); }
                        }
                    }
                }
            }
        });
    }
});
