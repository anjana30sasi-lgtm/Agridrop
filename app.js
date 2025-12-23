const API_URL = 'https://agridrop-vxci.onrender.com';
let myChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Arrow Navigation Logic
    let currentIdx = 0;
    const slides = document.querySelectorAll('.slide');
    
    function showSlide(index) {
        slides[currentIdx].classList.remove('active');
        currentIdx = (index + slides.length) % slides.length;
        slides[currentIdx].classList.add('active');
    }

    document.querySelector('.right').addEventListener('click', () => showSlide(currentIdx + 1));
    document.querySelector('.left').addEventListener('click', () => showSlide(currentIdx - 1));

    // 2. Start Button -> Go to Form
    document.getElementById('startBtn').addEventListener('click', () => {
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('formPage').style.display = 'block';
    });

    // 3. Detailed "First Version" Result Printing
    document.getElementById('cropForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resArea = document.getElementById('resultsArea');
        resArea.innerHTML = "<p style='color:#1b7a5a; font-weight:bold; margin-top:20px;'>Processing Results...</p>";

        const region = document.getElementById('region').value;
        const water = document.getElementById('water').value;
        const land = parseFloat(document.getElementById('landSize').value);

        try {
            const response = await fetch(`${API_URL}/recommend?water=${water}&region=${region}&land=${land}`);
            const data = await response.json();

            // Detailed Output Header
            let html = `<h3 style="color: #2c3e50; border-bottom: 2px solid #27ae60; margin-top: 25px; padding-bottom: 10px;">Recommended Crops:</h3>`;
            const labels = [], profits = [];

            data.forEach(crop => {
                const yieldVal = Number(crop.yield_per_acre);
                const profitVal = Number(crop.profit_per_acre);
                const totalYield = (yieldVal * land).toFixed(2);
                const totalProfit = (profitVal * land);

                labels.push(crop.crop);
                profits.push(totalProfit);

                // Detailed Block Printing
                html += `
                <div class="result-block">
                    <strong style="font-size: 1.1em; color: #2c3e50;">${crop.crop}</strong><br>
                    Water Need: ${crop.water_need}<br>
                    Region: ${crop.region}<br>
                    Yield per acre: ${yieldVal}<br>
                    Profit per acre: ₹${profitVal.toLocaleString('en-IN')}<br>
                    <strong>Total Yield (${land} acres): ${totalYield} tons</strong><br>
                    <strong>Total Profit: <span style="color: #27ae60;">₹${totalProfit.toLocaleString('en-IN')}</span></strong>
                </div>`;
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
            resArea.innerHTML = "<p style='color:red;'>Could not load recommendations.</p>";
        }
    });
});
