const API_URL = 'https://agridrop-vxci.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Image Rotation Logic
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 4000);

    // 2. Start Button Click Logic
    const startBtn = document.getElementById('enterApp');
    startBtn.addEventListener('click', () => {
        document.getElementById('landingSection').style.display = 'none';
        document.getElementById('formSection').style.display = 'block';
    });

    // 3. Form Submission and Results Logic
    const cropForm = document.getElementById('cropForm');
    const resultsDiv = document.getElementById('results');
    let myChart = null;

    cropForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultsDiv.innerHTML = `<p style="color: #27ae60; font-weight: bold; margin-top: 20px;">Finding crops...</p>`;
        
        const region = document.getElementById('region').value;
        const water = document.getElementById('water').value;
        const landSize = parseFloat(document.getElementById('landSize').value) || 1;

        try {
            const response = await fetch(`${API_URL}/recommend?water=${water}&region=${region}&land=${landSize}`);
            const data = await response.json();
            displayResults(data, landSize);
        } catch (err) {
            resultsDiv.innerHTML = `<p style="color:red; margin-top: 20px;">Server Error.</p>`;
        }
    });

    function displayResults(crops, landSize) {
        if (!crops || crops.length === 0) {
            resultsDiv.innerHTML = `<p>No matching crops found.</p>`;
            return;
        }

        let html = `<h3 style="margin-top: 20px;">Recommendations for ${landSize} Acre(s):</h3>`;
        const labels = [], profitData = [];

        crops.forEach(crop => {
            const totalProfit = crop.profit_per_acre * landSize;
            labels.push(crop.crop);
            profitData.push(totalProfit);

            html += `
                <div style="margin-top: 15px; border-left: 4px solid #27ae60; padding-left: 10px;">
                    <strong>${crop.crop}</strong><br>
                    Profit: ₹${totalProfit.toLocaleString('en-IN')}
                </div>`;
        });

        html += `<canvas id="resultsChart" style="margin-top: 20px;"></canvas>`;
        resultsDiv.innerHTML = html;

        const ctx = document.getElementById('resultsChart').getContext('2d');
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ label: 'Profit (₹)', data: profitData, backgroundColor: '#27ae60' }]
            }
        });
    }
});
