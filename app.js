// ===== Configuration & Slider =====
// Changed to your actual Render URL
const API_URL = 'https://agridrop-vxci.onrender.com'; 

const slidesContainer = document.querySelector('.slides');
const slides = document.querySelectorAll('.slide');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
const sliderContainer = document.querySelector('.slider-container');
const appContainer = document.querySelector('.app-container');
const enterAppBtn = document.getElementById('enterApp');

let currentIndex = 0;

// Strictly Manual Slider Logic
function showSlide(index) {
  if(index < 0) index = slides.length - 1;
  if(index >= slides.length) index = 0;
  // This moves the flexbox container horizontally based on the width of one slide
  slidesContainer.style.transform = `translateX(-${index * 100}%)`;
  currentIndex = index;
}

prev.addEventListener('click', () => showSlide(currentIndex - 1));
next.addEventListener('click', () => showSlide(currentIndex + 1));

// Page Transition: Slider -> Form
enterAppBtn.addEventListener('click', () => {
  sliderContainer.style.display = 'none';
  // Also hide the floating "Start" button container
  enterAppBtn.style.display = 'none'; 
  appContainer.style.display = 'block';
});

// ===== Form Submission =====
const cropForm = document.getElementById('cropForm');
const resultsDiv = document.getElementById('results');

cropForm.addEventListener('submit', async e => {
  e.preventDefault();

  const region = document.getElementById('region').value;
  const water = document.getElementById('water').value;
  const landSize = parseFloat(document.getElementById('landSize').value) || 1;

  if(!water || !region || landSize <= 0) {
    alert("Please select a region, water level, and valid land size.");
    return;
  }

  resultsDiv.innerHTML = `<p style="color:#117a65; font-weight:bold;">Analyzing soil and water data...</p>`;

  // Creating parameters to match your Flask backend
  const params = new URLSearchParams({ 
    water: water, 
    region: region, 
    land: landSize 
  });

  try {
    const response = await fetch(`${API_URL}/recommend?${params}`);
    
    if(!response.ok) throw new Error("Backend server error");

    const data = await response.json();
    displayResults(data, landSize);

  } catch(err) {
    console.error(err);
    resultsDiv.innerHTML = `<p style="color:red;">Error: Server is starting up. Please wait 30 seconds and try again.</p>`;
  }
});

// ===== Display Results with Detailed Cards & Chart =====
function displayResults(crops, landSize) {
  if(!crops || crops.length === 0) {
    resultsDiv.innerHTML = `<p>No matching crops found. Try different settings.</p>`;
    return;
  }

  let html = `<h3 style="color:#0b5345; margin: 20px 0;">Recommendations for ${landSize} Acre(s):</h3>`;
  
  const labels = [];
  const profitData = [];

  crops.forEach(crop => {
    // Standardize numeric calculations
    const yieldVal = parseFloat(crop.yield_per_acre);
    const profitVal = parseFloat(crop.profit_per_acre);
    const totalYield = (yieldVal * landSize).toFixed(2);
    const totalProfit = (profitVal * landSize);

    labels.push(crop.crop);
    profitData.push(totalProfit);

    // Detailed printing matching your "first version" requirement
    html += `
      <div class="result-block" style="background:#fff; border-left:6px solid #117a65; padding:15px; border-radius:15px; margin-bottom:15px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        <h4 style="color:#117a65; margin-bottom:5px; font-size:1.2rem;">${crop.crop}</h4>
        <p><strong>Region:</strong> ${crop.region} | <strong>Water:</strong> ${crop.water_need}</p>
        <p>Yield/Acre: ${yieldVal} tons</p>
        <p>Profit/Acre: ₹${profitVal.toLocaleString('en-IN')}</p>
        <div style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
            <p><strong>Total Yield:</strong> ${totalYield} tons</p>
            <p><strong>Total Profit:</strong> <span style="color:#27ae60; font-weight:bold;">₹${totalProfit.toLocaleString('en-IN')}</span></p>
        </div>
      </div>
    `;
  });

  html += `<canvas id="resultsChart" style="width:100%; margin-top:30px;"></canvas>`;
  resultsDiv.innerHTML = html;

  // Render Chart 
  const ctx = document.getElementById('resultsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Estimated Profit (₹)',
        data: profitData,
        backgroundColor: '#117a65',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: { 
        y: { 
            beginAtZero: true,
            ticks: { callback: (value) => '₹' + value.toLocaleString() }
        } 
      }
    }
  });
}
