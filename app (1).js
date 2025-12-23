// ===== Configuration =====
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

            // Clear previous errors and show loading
            resultsDiv.innerHTML = `<p style="color: #27ae60; font-weight: bold;">Fetching data from server...</p>`;

            const region = document.getElementById('region').value;
            const water = document.getElementById('water').value;
            const landSize = parseFloat(document.getElementById('landSize').value) || 1;

            try {
                const response = await fetch(`${API_URL}/recommend?water=${water}&region=${region}&land=${landSize}`);
                
                if (!response.ok) throw new Error("Backend server error");

                const data = await response.json();
                displayResults(data, landSize);
            } catch (err) {
                console.error("Fetch error:", err);
                resultsDiv.innerHTML = `<p style="color:red;">Error: Cannot connect to the database. Ensure the backend at ${API_URL} is live.</p>`;
            }
        });
    }

    // ===== Displaying Results & Charting =====
    function displayResults(crops, landSize) {
        if (!crops || crops.length === 0) {
            resultsDiv.innerHTML = `<p>No matching crops found for this selection.</p>`;
            return;
        }

        let html = `<h3>Results for ${landSize} Acre(s):</h3><div class="crop-cards">`;
        const labels = [], profitData = [];

        crops.forEach(crop => {
            labels.push(crop.crop);
            profitData.push(crop.total_profit);

            // FIX: Convert values to Numbers so .toFixed and .toLocaleString work correctly
            const yieldValue = Number(crop.total_yield).toFixed(2);
            const profitValue = Number(crop.total_profit).toLocaleString('en-IN');

            html += `
                <div class="crop-card" style="border:1px solid #ddd; padding:15px; border-radius:8px; background:#fff; margin-bottom:10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h4>${crop.crop}</h4>
                    <p><strong>Yield:</strong> ${yieldValue} tons</p>
                    <p style="color: #27ae60;"><strong>Profit:</strong> ₹${profitValue}</p>
                </div>`;
        });

        html += `</div><canvas id="resultsChart" style="margin-top:20px;"></canvas>`;
        resultsDiv.innerHTML = html;

        const ctx = document.getElementById('resultsChart').getContext('2d');
        if (myChart) myChart.destroy();

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Projected Profit (₹)',
                    data: profitData,
                    backgroundColor: '#2ecc71',
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
