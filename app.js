// ===== Configuration =====
const API_URL = 'https://agridrop-vxci.onrender.com'; 
let myChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // ===== 1. Slider Logic (Horizontal) =====
    const slidesContainer = document.querySelector('.slides');
    const slides = document.querySelectorAll('.slide');
    
    // We use getElementById to match the IDs in your HTML
    const prevBtn = document.getElementById('prevSlide'); 
    const nextBtn = document.getElementById('nextSlide'); 
    
    let currentIndex = 0;

    function showSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        // Moves the slides horizontally
        if(slidesContainer) {
            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        }
        currentIndex = index;
    }

    // Safety check: Only add listener if button exists
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
    } else {
        console.error("Buttons not found. Make sure HTML has id='prevSlide' and id='nextSlide'");
    }

    // ===== 2. Page Transition =====
    const enterAppBtn = document.getElementById('enterApp'); 
    const sliderContainer = document.querySelector('.slider-container');
    const appContainer = document.querySelector('.app-container');

    if (enterAppBtn) {
        enterAppBtn.addEventListener('click', () => {
            if(sliderContainer) sliderContainer.style.display = 'none';
            enterAppBtn.style.display = 'none'; 
            if(appContainer) appContainer.style.display = 'block'; 
        });
    }

    // ===== 3. Form Submission & Results =====
    const cropForm = document.getElementById('cropForm');
    const resultsDiv = document.getElementById('results');

    if (cropForm) {
        cropForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const region = document.getElementById('region').value;
            const water = document.getElementById('water').value;
            const landSize = parseFloat(document.getElementById('landSize').value) || 1;

            resultsDiv.innerHTML = `<p style="color:#117a65; font-weight:bold;">Processing recommendations...</p>`;

            try {
                const response = await fetch(`${API_URL}/recommend?water=${water}&region=${region}&land=${landSize}`);
                if (!response.ok) throw new Error("Server error");
                const data = await response.json();
                
                let html = `<h3 style="color:#0b5345; margin-top:20px;">Results for ${landSize} Acre(s):</h3>`;
                const labels = [];
                const profitData = [];

                data.forEach(crop => {
                    const totalProfit = (parseFloat(crop.profit_per_acre) * landSize);
                    labels.push(crop.crop);
                    profitData.push(totalProfit);

                    html += `
                    <div class="result-block" style="background:white; border-left:6px solid #117a65; padding:15px; border-radius:15px; margin-bottom:15px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                        <strong style="font-size:1.2rem; color:#117a65;">${crop.crop}</strong><br>
                        Water Need: ${crop.water_need} | Region: ${crop.region}<br>
                        Yield: ${crop.yield_per_acre} tons/acre<br>
                        Profit: ₹${parseFloat(crop.profit_per_acre).toLocaleString('en-IN')}/acre<br>
                        <div style="margin-top:10px; border-top:1px dotted #ccc; padding-top:5px;">
                            <strong>Total Profit: <span style="color:#27ae60;">₹${totalProfit.toLocaleString('en-IN')}</span></strong>
                        </div>
                    </div>`;
                });

                html += `<canvas id="resultsChart" style="margin-top:20px;"></canvas>`;
                resultsDiv.innerHTML = html;

                const ctx = document.getElementById('resultsChart').getContext('2d');
                if (myChart) myChart.destroy();
                myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Total Profit (₹)',
                            data: profitData,
                            backgroundColor: '#117a65'
                        }]
                    }
                });

            } catch (err) {
                resultsDiv.innerHTML = `<p style="color:red;">Error fetching data. Ensure the server is running.</p>`;
            }
        });
    }
});
