const API_URL = 'https://agridrop-vxci.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Image Slider Logic (Scrolling 3 images)
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);

    // 2. Start Button Entry Logic
    const enterAppBtn = document.getElementById('enterApp');
    enterAppBtn.addEventListener('click', () => {
        document.getElementById('sliderSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'block';
    });

    // 3. Form & Results Logic (Your exact logic)
    const cropForm = document.getElementById('cropForm');
    const resultsDiv = document.getElementById('results');
    let myChart = null;

    cropForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultsDiv.innerHTML = `<p style="color: #27ae60; font-weight: bold;">Loading...</p>`;
        
        const region = document.getElementById('region').value;
        const water = document.getElementById('water').value;
        const landSize = parseFloat(document.getElementById('landSize').value) || 1;

        try {
            const response = await fetch(`${API_URL}/recommend?water=${water}&region=${region}&land=${landSize}`);
            const data = await response.json();
            displayResults(data, landSize);
        } catch (err) {
            resultsDiv.innerHTML = `<p style="color:red;">Error: Database connection failed.</p>`;
        }
    });

    function displayResults(crops, landSize) {
        if (!crops || crops.length === 0) {
            resultsDiv.innerHTML = `<p>No matching crops found.</p>`;
            return;
        }
        // Exact formatting from your preferred version
        let html = `<h2 style="color: #2c3e50; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">Recommended Crops for ${landSize} acre(s):</h2>`;
        const labels = [], profitData = [];

        crops.forEach(crop => {
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

        html += `<canvas id="resultsChart" style="margin-top: 30px;"></canvas>`;
        resultsDiv.innerHTML = html;

        const ctx = document.getElementById('resultsChart').getContext('2d');
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ label: 'Profit (₹)', data: profitData, backgroundColor: 'rgba(46, 204, 113, 0.7)', borderColor: '#27ae60', borderWidth: 1 }]
            }
        });
    }
});
