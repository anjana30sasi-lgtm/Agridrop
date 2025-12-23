const API_URL = 'https://agridrop-vxci.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // === Slider Auto-Scroll (3 Images) ===
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);

    // === "Start Planning" Button Logic ===
    const enterAppBtn = document.getElementById('enterApp');
    const landingSection = document.getElementById('landingSection');
    const formSection = document.getElementById('formSection');

    enterAppBtn.addEventListener('click', () => {
        landingSection.style.display = 'none'; // Hides slider
        formSection.style.display = 'block';   // Shows entry fields
    });

    // === Form Submission (Your exact displayResults logic) ===
    const cropForm = document.getElementById('cropForm');
    const resultsDiv = document.getElementById('results');
    let myChart = null;

    cropForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultsDiv.innerHTML = `<p style="color: #27ae60; font-weight: bold;">Connecting...</p>`;
        
        const region = document.getElementById('region').value;
        const water = document.getElementById('water').value;
        const landSize = parseFloat(document.getElementById('landSize').value) || 1;

        try {
            const response = await fetch(`${API_URL}/recommend?water=${water}&region=${region}&land=${landSize}`);
            const data = await response.json();
            displayResults(data, landSize);
        } catch (err) {
            resultsDiv.innerHTML = `<p style="color:red;">Error: Backend connection failed.</p>`;
        }
    });

    function displayResults(crops, landSize) {
        if (!crops || crops.length === 0) {
            resultsDiv.innerHTML = `<p>No matching crops found.</p>`;
            return;
        }

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
