function applyTheme() {
  const theme = localStorage.getItem('cmda_theme') || 'light';
  document.body.classList.toggle('dark-theme', theme === 'dark');
}

function goBack() {
  window.history.back();
}

function getDefaultCosts() {
  const defaults = {
    cement: 9,
    sand: 2,
    gravel: 2.5,
    admixture: 35,
    water: 0.05
  };
  const saved = JSON.parse(localStorage.getItem('cmda_default_costs') || 'null');
  return saved ? { ...defaults, ...saved } : defaults;
}

function getDesigns() {
  return JSON.parse(localStorage.getItem('cmda_saved_designs') || '[]');
}

function saveDesigns(list) {
  localStorage.setItem('cmda_saved_designs', JSON.stringify(list));
}

function setCurrentDesign(design) {
  localStorage.setItem('cmda_current_design', JSON.stringify(design));
}

function getCurrentDesign() {
  return JSON.parse(localStorage.getItem('cmda_current_design') || 'null');
}

function protectPage() {
  if (document.body.dataset.protected !== 'true') return;
  const isLoggedIn = sessionStorage.getItem('cmda_logged_in') === 'true';
  if (!isLoggedIn) {
    window.location.href = 'index.html';
  }
}

function setupGlobalUI() {
  applyTheme();
  protectPage();
  requestAnimationFrame(() => document.body.classList.add('page-ready'));
  setupMobileMenu();

  document.querySelectorAll('.btn-back').forEach((btn) => {
    btn.addEventListener('click', goBack);
  });

  document.querySelectorAll('.logout-link').forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showLogoutFeedback();
    });
  });

  const email = sessionStorage.getItem('cmda_user_email') || 'student@demo.com';
  document.querySelectorAll('.user-email').forEach((el) => (el.textContent = email));
}

function setupMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  const appShell = document.querySelector('.app-shell');
  if (!sidebar || !appShell) return;
  if (document.querySelector('.mobile-topbar')) return;

  const activeLink = sidebar.querySelector('.nav-link.active');
  const defaultTitle = (activeLink ? activeLink.textContent : document.title).trim();

  const topbar = document.createElement('div');
  topbar.className = 'mobile-topbar';
  topbar.innerHTML = `
    <button type="button" class="mobile-menu-toggle" aria-label="Open navigation menu" aria-expanded="false">&#9776;</button>
    <p class="mobile-topbar-title">${defaultTitle}</p>
    <span style="width:40px;height:40px;"></span>
  `;

  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-menu-backdrop';

  document.body.insertBefore(topbar, appShell);
  document.body.appendChild(backdrop);

  const toggleBtn = topbar.querySelector('.mobile-menu-toggle');
  const closeMenu = function () {
    document.body.classList.remove('nav-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };
  const openMenu = function () {
    document.body.classList.add('nav-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  };

  toggleBtn.addEventListener('click', function () {
    if (document.body.classList.contains('nav-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  backdrop.addEventListener('click', closeMenu);

  sidebar.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 991) closeMenu();
  });
}

function showLogoutFeedback() {
  const existing = document.querySelector('.logout-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'logout-modal-backdrop';
  backdrop.innerHTML = `
    <div class="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logoutModalTitle">
      <h5 id="logoutModalTitle">Before you leave, please rate your experience</h5>
      <div class="rating-stars mb-3" id="ratingStars" aria-label="Rating from 1 to 5">
        <button type="button" class="star-btn" data-rating="1" aria-label="1 star">★</button>
        <button type="button" class="star-btn" data-rating="2" aria-label="2 stars">★</button>
        <button type="button" class="star-btn" data-rating="3" aria-label="3 stars">★</button>
        <button type="button" class="star-btn" data-rating="4" aria-label="4 stars">★</button>
        <button type="button" class="star-btn" data-rating="5" aria-label="5 stars">★</button>
      </div>
      <textarea id="logoutFeedbackText" class="form-control feedback-textarea mb-3" rows="3" placeholder="Tell us what you liked or how we can improve..."></textarea>
      <p class="thank-you-note mb-3" id="thankYouMsg">Thank you for your feedback!</p>
      <div class="d-flex justify-content-end gap-2 flex-wrap">
        <button type="button" class="btn btn-outline-secondary btn-sm" data-action="skip">Skip & Logout</button>
        <button type="button" class="btn btn-primary btn-sm" data-action="submit">Submit & Logout</button>
      </div>
    </div>
  `;
  const modal = backdrop.querySelector('.logout-modal');
  const starsWrap = backdrop.querySelector('#ratingStars');
  const starButtons = Array.from(backdrop.querySelectorAll('.star-btn'));
  const feedbackText = backdrop.querySelector('#logoutFeedbackText');
  const thankYouMsg = backdrop.querySelector('#thankYouMsg');
  let selectedRating = 0;
  let hoverRating = 0;

  function paintStars() {
    starButtons.forEach((btn) => {
      const value = Number(btn.dataset.rating);
      btn.classList.toggle('preview', value <= hoverRating && hoverRating > 0);
      btn.classList.toggle('active', value <= selectedRating);
    });
  }

  starsWrap.addEventListener('mouseover', function (event) {
    const target = event.target.closest('.star-btn');
    if (!target) return;
    hoverRating = Number(target.dataset.rating);
    paintStars();
  });

  starsWrap.addEventListener('mouseout', function () {
    hoverRating = 0;
    paintStars();
  });

  starsWrap.addEventListener('click', function (event) {
    const target = event.target.closest('.star-btn');
    if (!target) return;
    selectedRating = Number(target.dataset.rating);
    paintStars();
  });

  const cleanup = function (animated) {
    document.removeEventListener('keydown', onEsc);
    if (!animated) {
      backdrop.remove();
      return;
    }
    backdrop.classList.add('closing');
    setTimeout(function () {
      backdrop.remove();
    }, 220);
  };

  backdrop.addEventListener('click', function (event) {
    if (event.target === backdrop) cleanup(true);
  });

  backdrop.addEventListener('click', function (event) {
    const btn = event.target.closest('button');
    if (!btn) return;
    if (btn.dataset.action === 'skip') {
      performLogout(backdrop);
      return;
    }
    if (btn.dataset.action === 'submit') {
      const entry = {
        rating: selectedRating,
        feedback: feedbackText.value.trim(),
        submittedAt: new Date().toISOString()
      };
      const list = JSON.parse(localStorage.getItem('cmda_logout_feedback') || '[]');
      list.unshift(entry);
      localStorage.setItem('cmda_logout_feedback', JSON.stringify(list));

      backdrop.classList.add('confirmed');
      thankYouMsg.classList.add('show');
      starButtons.forEach((star) => (star.disabled = true));
      feedbackText.disabled = true;
      backdrop.querySelectorAll('button[data-action]').forEach((actionBtn) => (actionBtn.disabled = true));
      setTimeout(function () {
        performLogout(backdrop);
      }, 900);
    }
  });

  const onEsc = function (event) {
    if (event.key === 'Escape') {
      cleanup(true);
    }
  };
  document.addEventListener('keydown', onEsc);

  document.body.appendChild(backdrop);
}

function performLogout(backdrop) {
  if (backdrop) {
    backdrop.classList.add('closing');
  }
  document.body.classList.add('page-exit');
  setTimeout(function () {
    sessionStorage.removeItem('cmda_logged_in');
    sessionStorage.removeItem('cmda_user_email');
    window.location.href = 'index.html';
  }, 260);
}

function setupMotionEffects() {
  const animatedCards = document.querySelectorAll('.dashboard-card, .image-card, .material-tile, #mixPreviewPanel, .recipe-option');
  animatedCards.forEach((card, index) => {
    card.classList.add('reveal-up');
    setTimeout(() => card.classList.add('show'), 80 + index * 60);
  });
}

function setupLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const submitBtn = form.querySelector('.login-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
    }
    const email = document.getElementById('email').value.trim();
    setTimeout(function () {
      sessionStorage.setItem('cmda_logged_in', 'true');
      sessionStorage.setItem('cmda_user_email', email || 'student@demo.com');
      window.location.href = 'dashboard.html';
    }, 260);
  });
}

function parseGradeStrength(grade) {
  const number = parseFloat(String(grade).replace(/[^0-9.]/g, ''));
  return Number.isFinite(number) ? number : 20;
}

function round2(val) {
  return Math.round(val * 100) / 100;
}

function getRecommendedRecipe(grade) {
  const recipes = {
    M15: { cement: 1, sand: 2, coarse: 4, wcr: 0.55, cementReq: 300, waterReq: 165 },
    M20: { cement: 1, sand: 1.5, coarse: 3, wcr: 0.5, cementReq: 320, waterReq: 160 },
    M25: { cement: 1, sand: 1, coarse: 2, wcr: 0.45, cementReq: 360, waterReq: 162 },
    M30: { cement: 1, sand: 0.75, coarse: 1.5, wcr: 0.4, cementReq: 400, waterReq: 160 },
    M35: { cement: 1, sand: 0.7, coarse: 1.4, wcr: 0.38, cementReq: 420, waterReq: 160 },
    M40: { cement: 1, sand: 0.65, coarse: 1.3, wcr: 0.36, cementReq: 450, waterReq: 158 }
  };
  return recipes[grade] || recipes.M20;
}

function buildRecipeOptions(grade) {
  const base = getRecommendedRecipe(grade);
  return [
    {
      key: 'default',
      name: `Default ${grade}`,
      note: 'IS 10262:2019 reference ratio',
      cement: base.cement,
      sand: base.sand,
      coarse: base.coarse
    },
    {
      key: 'workable',
      name: 'Workability Focus',
      note: 'Slightly higher fine aggregate',
      cement: 1,
      sand: round2(base.sand + 0.1),
      coarse: round2(Math.max(1, base.coarse - 0.15))
    },
    {
      key: 'economy',
      name: 'Economy Focus',
      note: 'Balanced lower cement demand profile',
      cement: 1,
      sand: round2(Math.max(0.6, base.sand - 0.1)),
      coarse: round2(base.coarse + 0.15)
    }
  ];
}

function calculateMix(data) {
  const fck = parseGradeStrength(data.grade);
  const stdDev = parseFloat(data.stdDev) || 4;
  const wcr = parseFloat(data.wcr) || 0.5;
  const slump = parseFloat(data.slump) || 75;
  const aggSize = parseFloat(data.aggSize) || 20;
  const admixturePct = parseFloat(data.admixturePct) || 0;

  const targetMeanStrength = fck + 1.65 * stdDev;

  let baseWater;
  if (aggSize <= 10) baseWater = 208;
  else if (aggSize <= 20) baseWater = 186;
  else if (aggSize <= 40) baseWater = 165;
  else baseWater = 160;

  const slumpAdjustment = ((slump - 50) / 25) * 0.03;
  const waterAfterSlump = baseWater * (1 + slumpAdjustment);
  const waterAfterAdmix = waterAfterSlump * (1 - admixturePct * 0.01 * 0.08);

  const minCementByGrade = {
    15: 240,
    20: 300,
    25: 300,
    30: 320,
    35: 340,
    40: 360
  };

  const minCement = minCementByGrade[fck] || 300;
  const cement = Math.max(waterAfterAdmix / wcr, minCement);
  const water = cement * wcr;

  const sgCement = 3.15;
  const sgFA = 2.65;
  const sgCA = 2.7;
  const sgAd = 1.1;

  const airContent = aggSize <= 10 ? 0.03 : aggSize <= 20 ? 0.02 : 0.01;
  const admixtureMass = cement * (admixturePct / 100);

  const volCement = cement / (sgCement * 1000);
  const volWater = water / 1000;
  const volAdmix = admixtureMass / (sgAd * 1000);
  const volAgg = 1 - (volCement + volWater + volAdmix + airContent);

  let coarseFraction = 0.62;
  if (aggSize <= 10) coarseFraction = 0.5;
  else if (aggSize <= 20) coarseFraction = 0.62;
  else coarseFraction = 0.68;

  if (wcr < 0.5) coarseFraction += 0.01;
  if (wcr > 0.5) coarseFraction -= 0.01;

  const coarseAggregate = volAgg * coarseFraction * sgCA * 1000;
  const fineAggregate = volAgg * (1 - coarseFraction) * sgFA * 1000;

  const ratioFA = fineAggregate / cement;
  const ratioCA = coarseAggregate / cement;
  const manualCementPart = parseFloat(data.ratioCement);
  const manualSandPart = parseFloat(data.ratioSand);
  const manualCoarsePart = parseFloat(data.ratioCoarse);
  const useManualRatio =
    manualCementPart > 0 &&
    manualSandPart > 0 &&
    manualCoarsePart > 0;

  const finalFineAggregate = useManualRatio ? cement * (manualSandPart / manualCementPart) : fineAggregate;
  const finalCoarseAggregate = useManualRatio ? cement * (manualCoarsePart / manualCementPart) : coarseAggregate;
  const totalMixVolume =
    (cement / (sgCement * 1000)) +
    (water / 1000) +
    (finalFineAggregate / (sgFA * 1000)) +
    (finalCoarseAggregate / (sgCA * 1000)) +
    (admixtureMass / (sgAd * 1000)) +
    airContent;

  const costs = data.costs;
  const cementCost = cement * costs.cement;
  const sandCost = finalFineAggregate * costs.sand;
  const aggregateCost = finalCoarseAggregate * costs.gravel;
  const admixtureCost = admixtureMass * costs.admixture;
  const waterCost = water * costs.water;
  const totalCost = cementCost + sandCost + aggregateCost + admixtureCost + waterCost;

  return {
    id: data.id || Date.now(),
    designName: data.designName || `Mix-${Date.now()}`,
    date: new Date().toLocaleString(),
    grade: data.grade,
    targetMeanStrength: round2(targetMeanStrength),
    wcr: round2(wcr),
    cement: round2(cement),
    water: round2(water),
    fineAggregate: round2(finalFineAggregate),
    coarseAggregate: round2(finalCoarseAggregate),
    admixtureMass: round2(admixtureMass),
    proportion: useManualRatio
      ? `${round2(manualCementPart)} : ${round2(manualSandPart)} : ${round2(manualCoarsePart)}`
      : `1 : ${round2(ratioFA)} : ${round2(ratioCA)}`,
    totalMixVolume: round2(totalMixVolume),
    cementCost: round2(cementCost),
    sandCost: round2(sandCost),
    aggregateCost: round2(aggregateCost),
    admixtureCost: round2(admixtureCost),
    waterCost: round2(waterCost),
    estimatedCost: round2(totalCost),
    inputs: data
  };
}

function setupNewMixPage() {
  const form = document.getElementById('mixForm');
  if (!form) return;

  const costs = getDefaultCosts();
  Object.keys(costs).forEach((k) => {
    const input = document.getElementById(`cost_${k}`);
    if (input) input.value = costs[k];
  });

  const resultBox = document.getElementById('resultBox');
  const saveBtn = document.getElementById('saveDesignBtn');
  const previewPanel = document.getElementById('mixPreviewPanel');
  const recipePanel = document.getElementById('recipeSelectionPanel');
  const gradeInput = document.getElementById('grade');
  const ratioCementInput = document.getElementById('ratio_cement');
  const ratioSandInput = document.getElementById('ratio_sand');
  const ratioCoarseInput = document.getElementById('ratio_coarse');
  let activeRecipeKey = 'default';
  let latestDesign = null;

  function highlightActiveRecipe() {
    if (!recipePanel) return;
    recipePanel.querySelectorAll('.recipe-option').forEach((card) => {
      card.classList.toggle('active', card.dataset.recipeKey === activeRecipeKey);
    });
  }

  function renderRecipeOptions() {
    if (!recipePanel) return;
    const selectedGrade = gradeInput.value;
    const options = buildRecipeOptions(selectedGrade);
    recipePanel.innerHTML = options.map((option) => `
      <div class="col-md-4">
        <div class="recipe-option h-100" data-recipe-key="${option.key}" data-cement="${option.cement}" data-sand="${option.sand}" data-coarse="${option.coarse}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="mb-0">${option.name}</h6>
            <span class="ratio-pill">${option.cement} : ${option.sand} : ${option.coarse}</span>
          </div>
          <p class="text-muted mb-2">${option.note}</p>
          <button type="button" class="btn btn-sm btn-outline-primary select-recipe-btn">Select Recipe</button>
        </div>
      </div>
    `).join('');
    highlightActiveRecipe();
    recipePanel.querySelectorAll('.recipe-option').forEach((card, idx) => {
      card.classList.add('reveal-up');
      setTimeout(() => card.classList.add('show'), 50 + idx * 70);
    });
  }

  function setActiveRatio(cement, sand, coarse, recipeKey) {
    ratioCementInput.value = round2(cement);
    ratioSandInput.value = round2(sand);
    ratioCoarseInput.value = round2(coarse);
    activeRecipeKey = recipeKey || 'custom';
    highlightActiveRecipe();
  }

  function updateMixPreview(useManualValues) {
    const selectedGrade = gradeInput.value;
    const recommended = getRecommendedRecipe(selectedGrade);

    if (!useManualValues) {
      setActiveRatio(recommended.cement, recommended.sand, recommended.coarse, 'default');
      document.getElementById('wcr').value = recommended.wcr;
      renderRecipeOptions();
    }

    const cementPart = parseFloat(ratioCementInput.value) || recommended.cement;
    const sandPart = parseFloat(ratioSandInput.value) || recommended.sand;
    const coarsePart = parseFloat(ratioCoarseInput.value) || recommended.coarse;
    const waterPart = parseFloat(document.getElementById('wcr').value) || recommended.wcr;
    const estimatedCement = recommended.cementReq;
    const estimatedWater = estimatedCement * waterPart;
    const estimatedFine = estimatedCement * (sandPart / Math.max(0.01, cementPart));
    const estimatedCoarse = estimatedCement * (coarsePart / Math.max(0.01, cementPart));

    const mixTotal = cementPart + sandPart + coarsePart + waterPart;
    const cementPct = (cementPart / mixTotal) * 100;
    const sandPct = (sandPart / mixTotal) * 100;
    const coarsePct = (coarsePart / mixTotal) * 100;
    const waterPct = (waterPart / mixTotal) * 100;

    document.getElementById('default_grade').textContent = selectedGrade;
    document.getElementById('default_ratio').textContent = `${recommended.cement} : ${recommended.sand} : ${recommended.coarse}`;
    document.getElementById('preview_grade').textContent = selectedGrade;
    document.getElementById('preview_ratio').textContent = `${round2(cementPart)} : ${round2(sandPart)} : ${round2(coarsePart)}`;
    document.getElementById('preview_wcr').textContent = round2(waterPart).toFixed(2);
    document.getElementById('preview_cement_req').textContent = `${round2(estimatedCement)} kg`;
    document.getElementById('preview_water_req').textContent = `${round2(estimatedWater)} liters`;
    document.getElementById('preview_fa_req').textContent = `${round2(estimatedFine)} kg`;
    document.getElementById('preview_ca_req').textContent = `${round2(estimatedCoarse)} kg`;

    document.getElementById('bar_cement').style.width = `${cementPct}%`;
    document.getElementById('bar_sand').style.width = `${sandPct}%`;
    document.getElementById('bar_coarse').style.width = `${coarsePct}%`;
    document.getElementById('bar_water').style.width = `${waterPct}%`;

    document.getElementById('mixRecipeText').innerHTML = `
      <strong>Mix Recipe Example (${selectedGrade}):</strong><br>
      ${round2(cementPart)} Part Cement<br>
      ${round2(sandPart)} Parts Sand<br>
      ${round2(coarsePart)} Parts Coarse Aggregate<br>
      Water as per water-cement ratio (${round2(waterPart).toFixed(2)})
    `;

    if (previewPanel) {
      previewPanel.classList.remove('preview-animate');
      void previewPanel.offsetWidth;
      previewPanel.classList.add('preview-animate');
    }
  }

  updateMixPreview(false);
  gradeInput.addEventListener('change', function () {
    activeRecipeKey = 'default';
    updateMixPreview(false);
  });
  [ratioCementInput, ratioSandInput, ratioCoarseInput, document.getElementById('wcr')].forEach((el) => {
    el.addEventListener('input', function () {
      activeRecipeKey = 'custom';
      highlightActiveRecipe();
      updateMixPreview(true);
    });
  });

  if (recipePanel) {
    recipePanel.addEventListener('click', function (event) {
      const targetButton = event.target.closest('.select-recipe-btn');
      if (!targetButton) return;
      const optionCard = targetButton.closest('.recipe-option');
      if (!optionCard) return;
      setActiveRatio(
        parseFloat(optionCard.dataset.cement),
        parseFloat(optionCard.dataset.sand),
        parseFloat(optionCard.dataset.coarse),
        optionCard.dataset.recipeKey
      );
      updateMixPreview(true);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const payload = {
      designName: document.getElementById('designName').value.trim(),
      grade: document.getElementById('grade').value,
      aggSize: document.getElementById('aggSize').value,
      slump: document.getElementById('slump').value,
      wcr: document.getElementById('wcr').value,
      stdDev: document.getElementById('stdDev').value,
      admixturePct: document.getElementById('admixturePct').value,
      ratioCement: ratioCementInput.value,
      ratioSand: ratioSandInput.value,
      ratioCoarse: ratioCoarseInput.value,
      costs: {
        cement: parseFloat(document.getElementById('cost_cement').value) || 0,
        sand: parseFloat(document.getElementById('cost_sand').value) || 0,
        gravel: parseFloat(document.getElementById('cost_gravel').value) || 0,
        admixture: parseFloat(document.getElementById('cost_admixture').value) || 0,
        water: parseFloat(document.getElementById('cost_water').value) || 0
      }
    };

    latestDesign = calculateMix(payload);
    setCurrentDesign(latestDesign);
    saveBtn.disabled = false;

    resultBox.innerHTML = `
      <div class="result-highlight">
        <h5 class="mb-3">Calculated Results (IS 10262:2019 aligned workflow)</h5>
        <div class="row g-2">
          <div class="col-md-6"><strong>Cement Quantity:</strong> ${latestDesign.cement} kg/m3</div>
          <div class="col-md-6"><strong>Water Quantity:</strong> ${latestDesign.water} liters/m3</div>
          <div class="col-md-6"><strong>Fine Aggregate Quantity:</strong> ${latestDesign.fineAggregate} kg/m3</div>
          <div class="col-md-6"><strong>Coarse Aggregate Quantity:</strong> ${latestDesign.coarseAggregate} kg/m3</div>
          <div class="col-md-6"><strong>Water Cement Ratio:</strong> ${latestDesign.wcr}</div>
          <div class="col-md-6"><strong>Mix Proportion:</strong> ${latestDesign.proportion}</div>
          <div class="col-md-6"><strong>Total Mix Volume:</strong> ${latestDesign.totalMixVolume} m3</div>
          <div class="col-md-6"><strong>Estimated Cost per cubic meter:</strong> INR ${latestDesign.estimatedCost}</div>
        </div>
        <hr>
        <h6 class="mb-2">Material Cost Analysis Panel</h6>
        <div class="row g-2">
          <div class="col-md-3"><strong>Cost of Cement:</strong> INR ${latestDesign.cementCost}</div>
          <div class="col-md-3"><strong>Cost of Sand:</strong> INR ${latestDesign.sandCost}</div>
          <div class="col-md-3"><strong>Cost of Aggregate:</strong> INR ${latestDesign.aggregateCost}</div>
          <div class="col-md-3"><strong>Total Mix Cost:</strong> INR ${latestDesign.estimatedCost}</div>
        </div>
      </div>
    `;
  });

  document.getElementById('resetBtn').addEventListener('click', function () {
    form.reset();
    resultBox.innerHTML = '<p class="text-muted mb-0">Results will appear here after calculation.</p>';
    saveBtn.disabled = true;
    Object.keys(costs).forEach((k) => {
      const input = document.getElementById(`cost_${k}`);
      if (input) input.value = costs[k];
    });
    updateMixPreview(false);
  });

  saveBtn.addEventListener('click', function () {
    if (!latestDesign) return;
    const list = getDesigns();
    list.unshift(latestDesign);
    saveDesigns(list);
    alert('Design saved successfully.');
  });

  document.getElementById('openReportBtn').addEventListener('click', function () {
    window.location.href = 'report.html';
  });
}

function setupReportPage() {
  const container = document.getElementById('reportContainer');
  if (!container) return;

  const design = getCurrentDesign();
  if (!design) {
    container.innerHTML = '<div class="alert alert-warning">No design available. Please calculate a mix first.</div>';
    return;
  }

  container.innerHTML = `
    <div class="section-card p-4">
      <h4 class="mb-3">Concrete Mix Design Report</h4>
      <p class="text-muted">Design Name: <strong>${design.designName}</strong> | Date: ${design.date}</p>
      <div class="table-responsive table-card">
        <table class="table table-striped mb-0">
          <tbody>
            <tr><th>Concrete Grade</th><td>${design.grade}</td></tr>
            <tr><th>Target Mean Strength</th><td>${design.targetMeanStrength} MPa</td></tr>
            <tr><th>Water Cement Ratio</th><td>${design.wcr}</td></tr>
            <tr><th>Cement Quantity</th><td>${design.cement} kg/m3</td></tr>
            <tr><th>Water Quantity</th><td>${design.water} liters/m3</td></tr>
            <tr><th>Fine Aggregate Quantity</th><td>${design.fineAggregate} kg/m3</td></tr>
            <tr><th>Coarse Aggregate Quantity</th><td>${design.coarseAggregate} kg/m3</td></tr>
            <tr><th>Admixture Quantity</th><td>${design.admixtureMass} kg/m3</td></tr>
            <tr><th>Mix Proportion</th><td>${design.proportion}</td></tr>
            <tr><th>Total Mix Volume</th><td>${design.totalMixVolume || 1} m3</td></tr>
            <tr><th>Cost of Cement</th><td>INR ${design.cementCost || 0}</td></tr>
            <tr><th>Cost of Sand</th><td>INR ${design.sandCost || 0}</td></tr>
            <tr><th>Cost of Aggregate</th><td>INR ${design.aggregateCost || 0}</td></tr>
            <tr><th>Total Cost per m3</th><td>INR ${design.estimatedCost}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('printReportBtn').addEventListener('click', function () {
    window.print();
  });

  document.getElementById('downloadPdfBtn').addEventListener('click', function () {
    if (!window.jspdf) {
      alert('PDF library not loaded.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Concrete Mix Design Report', 14, 20);
    doc.setFontSize(11);
    const lines = [
      `Design Name: ${design.designName}`,
      `Grade: ${design.grade}`,
      `Target Mean Strength: ${design.targetMeanStrength} MPa`,
      `Water Cement Ratio: ${design.wcr}`,
      `Cement: ${design.cement} kg/m3`,
      `Water: ${design.water} liters/m3`,
      `Fine Aggregate: ${design.fineAggregate} kg/m3`,
      `Coarse Aggregate: ${design.coarseAggregate} kg/m3`,
      `Admixture: ${design.admixtureMass} kg/m3`,
      `Mix Proportion: ${design.proportion}`,
      `Total Cost: INR ${design.estimatedCost} per m3`
    ];
    let y = 32;
    lines.forEach((line) => {
      doc.text(line, 14, y);
      y += 8;
    });
    doc.save(`${design.designName || 'mix_design_report'}.pdf`);
  });
}

function setupSavedDesignsPage() {
  const tableBody = document.getElementById('savedDesignsBody');
  if (!tableBody) return;

  function render() {
    const designs = getDesigns();
    if (!designs.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No saved designs.</td></tr>';
      return;
    }

    tableBody.innerHTML = designs.map((d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${d.designName}</td>
        <td>${d.grade}</td>
        <td>${d.wcr}</td>
        <td>INR ${d.estimatedCost}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" data-action="view" data-id="${d.id}">View</button>
          <button class="btn btn-sm btn-outline-secondary me-1" data-action="edit" data-id="${d.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger me-1" data-action="delete" data-id="${d.id}">Delete</button>
          <button class="btn btn-sm btn-outline-success" data-action="export" data-id="${d.id}">Export</button>
        </td>
      </tr>
    `).join('');
  }

  tableBody.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);
    const designs = getDesigns();
    const idx = designs.findIndex((d) => Number(d.id) === id);
    if (idx === -1) return;

    if (action === 'view') {
      setCurrentDesign(designs[idx]);
      window.location.href = 'report.html';
    }

    if (action === 'delete') {
      designs.splice(idx, 1);
      saveDesigns(designs);
      render();
    }

    if (action === 'export') {
      const blob = new Blob([JSON.stringify(designs[idx], null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${designs[idx].designName || 'design'}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    }

    if (action === 'edit') {
      const newName = prompt('Edit Design Name', designs[idx].designName);
      if (newName && newName.trim()) {
        designs[idx].designName = newName.trim();
        saveDesigns(designs);
        render();
      }
    }
  });

  document.getElementById('exportAllBtn').addEventListener('click', function () {
    const designs = getDesigns();
    const blob = new Blob([JSON.stringify(designs, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'all_saved_mix_designs.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  render();
}

function setupSettingsPage() {
  const themeSelect = document.getElementById('themeSelect');
  const settingsForm = document.getElementById('settingsForm');
  if (!settingsForm || !themeSelect) return;

  themeSelect.value = localStorage.getItem('cmda_theme') || 'light';
  const costs = getDefaultCosts();
  Object.keys(costs).forEach((k) => {
    const input = document.getElementById(`default_${k}`);
    if (input) input.value = costs[k];
  });

  const profile = JSON.parse(localStorage.getItem('cmda_profile') || '{}');
  document.getElementById('profileName').value = profile.name || '';
  document.getElementById('profileOrg').value = profile.org || '';
  document.getElementById('profileEmail').value = profile.email || (sessionStorage.getItem('cmda_user_email') || '');

  settingsForm.addEventListener('submit', function (e) {
    e.preventDefault();

    localStorage.setItem('cmda_theme', themeSelect.value);
    applyTheme();

    localStorage.setItem('cmda_default_costs', JSON.stringify({
      cement: parseFloat(document.getElementById('default_cement').value) || 0,
      sand: parseFloat(document.getElementById('default_sand').value) || 0,
      gravel: parseFloat(document.getElementById('default_gravel').value) || 0,
      admixture: parseFloat(document.getElementById('default_admixture').value) || 0,
      water: parseFloat(document.getElementById('default_water').value) || 0
    }));

    localStorage.setItem('cmda_profile', JSON.stringify({
      name: document.getElementById('profileName').value,
      org: document.getElementById('profileOrg').value,
      email: document.getElementById('profileEmail').value
    }));

    alert('Settings saved successfully.');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupGlobalUI();
  setupMotionEffects();
  setupLoginPage();
  setupNewMixPage();
  setupReportPage();
  setupSavedDesignsPage();
  setupSettingsPage();
});
