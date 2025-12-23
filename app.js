const API_URL = 'https://agridrop-vxci.onrender.com';
let myChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Image Slider Logic
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 4000);

    // 2. Start Button Logic
    document.getElementById('startBtn').addEventListener('click', () => {
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('formPage').style.display = 'block';
    });

    // 3. Detailed Results Logic
    document.getElementById('cropForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resArea = document.getElementById('resultsArea');
        resArea.innerHTML = "<p style='color:#1b7a5a; font-weight:bold; margin-top:20px;'>Fetching data...</p>";

        const region = document.getElementById('region').value;
        const water = document.getElementById('water').value;
        const land = parseFloat(document.getElementById('landSize').value);

        try {
            const response = await fetch(`${API_URL}/recommend?water=${water}&region=${region}&land=${land}`);
            const data = await response.json();

            // The "First Version" Detailed Printing
            let html = `<h2 style="color: #2c3e50; border-bottom: 2px solid #27ae60; padding: 20px 0 10px 0;">Recommended Crops:</h2>`;
            const labels = [], profits = [];

            data.forEach(crop => {
                const yieldVal = Number(crop.yield_per_acre);
                const profitVal = Number(crop.profit_per_acre);
                const totalYield = (yieldVal * land).toFixed(2);
                const totalProfit = (profitVal * land);

                labels.push(crop.crop);
                profits.push(totalProfit);

                html += `
                <div class="result-block">
                    <strong style="font-size: 1.2em; color: #2c3e50;">${crop.crop}</strong><br>
                    Water Requirement: ${crop.water_need}<br>
                    Region: ${crop.region}<br>
                    Yield per acre: ${yieldVal}<br>
                    Profit per acre: ₹${profitVal.toLocaleString('en-IN')}<br>
                    <strong>Total Yield: ${totalYield} tons</strong><br>
                    <strong>Total Profit: <span style="color: #27ae60;">₹${totalProfit.toLocaleString('en-IN')}</span></strong>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">`;
            });

            resArea.innerHTML = html;
            
            // Show Chart
            const canvas = document.getElementById('resultsChart');
            canvas.style.display = "block";
            if (myChart) myChart.destroy();
            myChart = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{ label: 'Profit (₹)', data: profits, backgroundColor: '#1b7a5a' }]
                }
            });

        } catch (err) {
            resArea.innerHTML = "<p style='color:red;'>Connection Error.</p>";
        }
    });
});
