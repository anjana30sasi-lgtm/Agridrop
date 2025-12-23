// ===== Configuration =====
// Points to your live Render backend
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

            // Loading state while waiting for the server to "wake up"
            resultsDiv.innerHTML = `<p style="color: #27ae60; font-weight: bold; padding: 20px;">
                Connecting to Agridrop server... Please wait (may take up to 30 seconds for first load).
            </p>`;

            const region = document.getElementById('region').value;
            const water = document.getElementById('water').value;
            const landSize = parseFloat(document.getElementById('landSize').value) || 1;

            try {
                const response = await fetch(`${API_URL}/recommend?water=${water}&region=${region}&land=${landSize}`);
                
                if (!response.ok) throw new Error("Backend server error");

                const data = await response.json();
                displayResults(data, landSize);
            } catch (err) {
                console.error("Connection Error:", err);
                resultsDiv.innerHTML = `<p style="color:red; padding: 20px;">
                    Error: Cannot connect to the database. Ensure the backend is live at ${API_URL}
                </p>`;
            }
        });
    }

    // ===== Displaying Results & Charting =====
    function displayResults(crops, landSize) {
        if (!crops || crops.length === 0) {
            resultsDiv.innerHTML = `<p style="padding: 20px;">No matching crops found for this selection.</p>`;
            return;
        }

        // 1. Text Output Header
        let html = `<h2 style="color: #27ae60; margin-bottom: 20px; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">
            Recommended Crops for ${landSize} acre(s):
        </h2>`;
        
        const labels = [], profitData = [];

        // 2. Loop through crops to build the detailed list
        crops.forEach(crop => {
            // Convert to numbers to ensure calculations and formatting work
            const yieldPerAcre = Number(crop.yield_per_acre);
            const profitPerAcre = Number(crop.profit_per_acre);
            const totalYield = (yieldPerAcre * landSize);
            const totalProfit = (profitPerAcre * landSize);

            // Prepare data for the chart
            labels.push(crop.crop);
            profitData.push(totalProfit);

            // Generate HTML using your exact requested format
            html += `
                <div class="result-item" style="margin-bottom: 30px; line-height: 1.8; font-size: 1.1em; color: #333; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <strong style="font-size: 1.4em; color: #2c3e50;">${crop.crop}</strong><br>
                    Water Requirement: ${crop.water_need}<br>
                    Region: ${crop.region}<br>
                    Yield per acre: ${yieldPerAcre}<br>
                    Profit per acre: ₹${profitPerAcre.toLocaleString('en-IN')}<br>
                    Total Yield: ${totalYield}<br>
                    Total Profit: <span style="font-weight: bold; color: #27ae60;">₹${totalProfit.toLocaleString('en-IN')}</span>
                </div>
                <hr style="border: 0; border-top: 1px dashed #ccc; margin: 20px 0;">`;
        });

        // 3. Add a container for the Bar Chart
        html += `
            <div style="margin-top: 40px; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <h3 style="text-align: center; color: #2c3e50; margin-bottom: 20px;">Profit Comparison Across Crops</h3>
                <canvas id="resultsChart"></canvas>
            </div>`;

        resultsDiv.innerHTML = html;

        // 4. Initialize Chart.js
        const ctx = document.getElementById('resultsChart').getContext('2d');
        if (myChart) myChart.destroy(); // Destroy previous chart to avoid overlay issues

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Profit (₹)',
                    data: profitData,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: '#27ae60',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return '₹' + value.toLocaleString('en-IN'); }
                        }
                    }
                }
            }
        });
    }
});
