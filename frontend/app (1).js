// ===== Slider =====
const slidesContainer = document.querySelector('.slides');
const slides = document.querySelectorAll('.slide');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
const sliderContainer = document.querySelector('.slider-container');
const appContainer = document.querySelector('.app-container');
const enterAppBtn = document.getElementById('enterApp');

let currentIndex = 0;
function showSlide(index) {
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
  });
}

// ===== Form Submission =====
const cropForm = document.getElementById('cropForm');
const resultsDiv = document.getElementById('results');
let myChart = null; // Variable to store the chart instance

cropForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const region = document.getElementById('region').value;
  const water = document.getElementById('water').value;
  const landSize = parseFloat(document.getElementById('landSize').value) || 1;

  const params = new URLSearchParams({ water, region, land: landSize });

  try {
    const response = await fetch(`http://localhost:3000/recommend?${params}`);
    if (!response.ok) throw new Error("Backend server error");

    const data = await response.json();
    displayResults(data, landSize);
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = `<p style="color:red;">Error: Make sure your backend server is running on port 3000.</p>`;
  }
});

function displayResults(crops, landSize) {
  if (!crops || crops.length === 0) {
    resultsDiv.innerHTML = `<p>No matching crops found for this region and water level.</p>`;
    return;
  }

  let html = `<h3>Recommended Crops for ${landSize} acre(s):</h3><div class="crop-cards">`;
  const labels = [], profitData = [];

  crops.forEach(crop => {
    labels.push(crop.crop);
    profitData.push(crop.total_profit);

    html += `
      <div class="crop-card">
        <h4>${crop.crop}</h4>
        <p><strong>Total Yield:</strong> ${crop.total_yield} tons</p>
        <p><strong>Total Profit:</strong> ₹${crop.total_profit.toLocaleString()}</p>
        <small>Yield/Acre: ${crop.yield_per_acre} | Profit/Acre: ₹${crop.profit_per_acre}</small>
      </div>`;
  });

  html += `</div><canvas id="resultsChart" width="400" height="200"></canvas>`;
  resultsDiv.innerHTML = html;

  const ctx = document.getElementById('resultsChart').getContext('2d');
  
  // Clear old chart if it exists
  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Projected Profit (₹)',
        data: profitData,
        backgroundColor: '#2ecc71'
      }]
    }
  });
}