// ===== Configuration =====
const API_URL = 'https://agridrop-vxci.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // ===== Navigation Logic =====
    const sliderContainer = document.querySelector('.slider-container');
    const appContainer = document.querySelector('.app-container');
    const enterAppBtn = document.getElementById('enterApp');

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

            // Clear previous errors and show loading message
            resultsDiv.innerHTML = `<p style="color: #27ae60; font-weight: bold; padding: 10px;">Connecting to server... Please wait.</p>`;

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
                resultsDiv.innerHTML = `<p style="color:red; padding: 10px;">Error: Cannot connect to the database. Ensure the backend is live.</p>`;
            }
        });
    }

    // ===== Detailed Display Logic & Charting =====
    function displayResults(crops, landSize) {
        if (!crops || crops.length === 0) {
            resultsDiv.innerHTML = `<p style="padding: 10px;">No matching crops found for this selection.</p>`;
            return;
        }

        // 1. Text Output Header
        let html = `<h2 style="color: #2c3e50; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">Recommended Crops for ${landSize} acre(s):</h2>`;
        const labels = [], profitData = [];

        // 2. Build the detailed text list
        crops.forEach(crop => {
            // Ensure numbers for calculations
            const yieldPerAcre = Number(crop.yield_per_acre);
            const profitPerAcre = Number(crop.profit_per_acre);
            const totalYield = (yieldPerAcre * landSize).toFixed(2);
            const totalProfit = (profitPerAcre * landSize);

            labels.push(crop.crop);
            profitData.push(totalProfit);

            html += `
                <div style="margin-bottom: 25px; line-height: 1.6; font-family: 'Segoe UI', sans-serif; color: #333; border-left: 5px solid #2ecc71; padding-left: 15px;">
                    <strong style="font-size: 1.2em; color: #2c3e50;">${crop.crop}</strong><br>
                    Water Requirement: ${crop.water_need}<br>
                    Region: ${crop.region}<br>
                    Yield per acre: ${yieldPerAcre}<br>
                    Profit per acre: ₹${profitPerAcre.toLocaleString('en-IN')}<br>
                    <strong>Total Yield: ${totalYield} tons</strong><br>
                    <strong>Total Profit: <span style="color: #27ae60;">₹${totalProfit.toLocaleString('en-IN')}</span></strong>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">`;
        });

        // 3. Add the Chart Container
        html += `
            <div style="margin-top: 30px; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="text-align: center; color: #2c3e50;">Profit Analysis</h3>
                <canvas id="resultsChart"></canvas>
            </div>`;

        resultsDiv.innerHTML = html;

        // 4. Initialize the Bar Chart
        const ctx = document.getElementById('resultsChart').getContext('2d');
        if (myChart) myChart.destroy();

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Profit (₹)',
                    data: profitData,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
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
                            callback: function(value) { return '₹' + value.toLocaleString('en-IN'); }
                        }
                    }
                }
            }
        });
    }
});
