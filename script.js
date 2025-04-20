document.addEventListener("DOMContentLoaded", function () {
  // Initial state
  const state = {
    facilityDimensions: {
      width: 44721, // Default to 1500 square meters with 4:3 aspect ratio
      height: 33541,
    },
    propertyName: "My Self-Storage Facility",
    totalArea: 1500,
    scale: 10, // pixels per cm
    corridorWidth: 150,
    expenseRatio: 0.35, // 35% operating expenses by default
    occupancyRate: 0.85, // 85% occupancy by default
    constructionCostPerSqm: 350, // €350 per square meter for construction
    phase: 1, // Default to Phase 1
    visualMode: "financial", // Default view mode
    unitTypes: [
      {
        id: "xs",
        name: "XS",
        area: 2,
        color: "#A8E6CF",
        pricePerSqm: 25,
        count: 0,
      },
      {
        id: "s",
        name: "S",
        area: 5,
        color: "#DCEDC1",
        pricePerSqm: 22,
        count: 0,
      },
      {
        id: "m",
        name: "M",
        area: 10,
        color: "#FFD3B6",
        pricePerSqm: 20,
        count: 0,
      },
      {
        id: "l",
        name: "L",
        area: 15,
        color: "#FFAAA5",
        pricePerSqm: 18,
        count: 0,
      },
      {
        id: "xl",
        name: "XL",
        area: 20,
        color: "#FF8B94",
        pricePerSqm: 16,
        count: 0,
      },
    ],
    unitMixRatios: {
      xs: 20,
      s: 30,
      m: 30,
      l: 15,
      xl: 5,
    },
    units: [],
    rentableArea: 0,
    utilization: 0,
    monthlyRevenue: 0,
    selectedPreset: "suburban", // Default preset
  };

  // Mix presets
  const mixPresets = {
    custom: {
      name: "Custom Mix",
      description: "Your customized unit mix",
    },
    urban: {
      name: "Urban Focus",
      description:
        "Emphasizes smaller units for urban areas with limited space",
      ratios: { xs: 30, s: 40, m: 20, l: 7, xl: 3 },
    },
    suburban: {
      name: "Suburban Standard",
      description: "Balanced mix for typical suburban facilities",
      ratios: { xs: 20, s: 30, m: 30, l: 15, xl: 5 },
    },
    business: {
      name: "Business Focus",
      description: "More large units for business customers",
      ratios: { xs: 10, s: 20, m: 30, l: 25, xl: 15 },
    },
    balanced: {
      name: "Perfectly Balanced",
      description: "Equal distribution across all unit sizes",
      ratios: { xs: 20, s: 20, m: 20, l: 20, xl: 20 },
    },
  };

  // Unit guidance data
  const unitGuidance = {
    xs: {
      idealRange: "20-25%",
      guidanceText: "Popular in urban areas",
      priceRange: "€20-30",
      detailedGuidance:
        "Smallest units are in high demand in urban areas where apartments are small. Ideal for documents, seasonal items, and small collections.",
    },
    s: {
      idealRange: "30-40%",
      guidanceText: "Most popular size",
      priceRange: "€18-25",
      detailedGuidance:
        "This is the workhorse of self-storage. Fits contents of a small apartment or several rooms. Most consistent demand.",
    },
    m: {
      idealRange: "25-30%",
      guidanceText: "For household storage",
      priceRange: "€15-20",
      detailedGuidance:
        "Medium units are ideal for contents of a 2-bedroom apartment. Popular for medium-term storage during moves or renovations.",
    },
    l: {
      idealRange: "10-15%",
      guidanceText: "Higher revenue",
      priceRange: "€12-18",
      detailedGuidance:
        "Large units have longer average stays and lower maintenance costs per square meter. Popular with families between homes.",
    },
    xl: {
      idealRange: "10-15%",
      guidanceText: "Business customers",
      priceRange: "€12-18",
      detailedGuidance:
        "Extra-large units attract business customers who often stay longer. Lower price per sqm but highest total revenue per unit.",
    },
  };

  // DOM elements
  const elements = {
    // Property details
    propertyNameDisplay: document.getElementById("property-name-display"),
    propertyNameInput: document.getElementById("property-name-input"),
    totalAreaInput: document.getElementById("total-area-input"),
    totalAreaDisplay: document.getElementById("total-area-display"),
    phaseSelect: document.getElementById("phase-select"),

    // Key metrics
    rentableAreaDisplay: document.getElementById("rentable-area-display"),
    utilizationDisplay: document.getElementById("utilization-display"),
    monthlyRevenueDisplay: document.getElementById("monthly-revenue-display"),
    occupancyRateNote: document.getElementById("occupancy-rate-note"),

    // View controls
    financialViewBtn: document.getElementById("financial-view-btn"),
    layoutViewBtn: document.getElementById("layout-view-btn"),
    breakevenViewBtn: document.getElementById("breakeven-view-btn"),
    financialView: document.getElementById("financial-view"),
    layoutView: document.getElementById("layout-view"),
    breakevenView: document.getElementById("breakeven-view"),

    // Unit mix controls
    unitTypesContainer: document.getElementById("unit-types-container"),
    mixTotalIndicator: document.getElementById("mix-total-indicator"),
    mixTotalValue: document.getElementById("mix-total-value"),
    mixTotalBar: document.getElementById("mix-total-bar"),
    mixTotalMessage: document.getElementById("mix-total-message"),
    autoBalanceBtn: document.getElementById("auto-balance-btn"),
    presetDescription: document.getElementById("preset-description"),

    // Financial view elements
    unitSummaryTable: document.getElementById("unit-summary-table"),
    financialMonthlyRevenue: document.getElementById(
      "financial-monthly-revenue"
    ),
    financialAnnualRevenue: document.getElementById("financial-annual-revenue"),
    financialMonthlyExpenses: document.getElementById(
      "financial-monthly-expenses"
    ),
    financialAnnualExpenses: document.getElementById(
      "financial-annual-expenses"
    ),
    financialMonthlyNOI: document.getElementById("financial-monthly-noi"),
    financialAnnualNOI: document.getElementById("financial-annual-noi"),
    financialRevenuePerSqm: document.getElementById(
      "financial-revenue-per-sqm"
    ),
    financialUtilization: document.getElementById("financial-utilization"),
    financialNOIMargin: document.getElementById("financial-noi-margin"),
    financialROI: document.getElementById("financial-roi"),
    expenseRatioSlider: document.getElementById("expense-ratio-slider"),
    expenseRatioDisplay: document.getElementById("expense-ratio-display"),
    occupancyRateSlider: document.getElementById("occupancy-rate-slider"),
    occupancyRateDisplay: document.getElementById("occupancy-rate-display"),
    financialExpenseRatio: document.getElementById("financial-expense-ratio"),
    financialNOIMarginSummary: document.getElementById(
      "financial-noi-margin-summary"
    ),
    financialAnnualNOISummary: document.getElementById(
      "financial-annual-noi-summary"
    ),

    // Layout view elements
    spaceRentableArea: document.getElementById("space-rentable-area"),
    spaceCommonArea: document.getElementById("space-common-area"),
    spaceUtilizationBar: document.getElementById("space-utilization-bar"),

    // Breakeven view elements
    constructionCostInput: document.getElementById("construction-cost-input"),
    totalConstructionCost: document.getElementById("total-construction-cost"),
    breakevenAnnualNOI: document.getElementById("breakeven-annual-noi"),
    breakevenROI: document.getElementById("breakeven-roi"),
    breakevenPeriod: document.getElementById("breakeven-period"),
    costPerUnit: document.getElementById("cost-per-unit"),
    phaseDataTable: document.getElementById("phase-data-table"),
  };

  // Add this right before you initialize your charts
  console.log("Initializing charts");
  console.log(
    "Revenue chart container:",
    document.getElementById("revenue-chart")
  );
  console.log(
    "Unit mix chart container:",
    document.getElementById("unit-mix-chart")
  );

  // Initialize charts
  let revenueChart = null;
  let unitMixChart = null;

  // Initialize the application
  function init() {
    // Set up event listeners for property details
    elements.propertyNameInput.addEventListener("input", updatePropertyName);
    elements.totalAreaInput.addEventListener("input", updateTotalArea);
    elements.phaseSelect.addEventListener("change", updatePhase);

    // Set up event listeners for finance controls
    elements.expenseRatioSlider.addEventListener("input", updateExpenseRatio);
    elements.occupancyRateSlider.addEventListener("input", updateOccupancyRate);
    elements.constructionCostInput.addEventListener(
      "input",
      updateConstructionCost
    );

    // Set up event listeners for view controls
    elements.financialViewBtn.addEventListener("click", () =>
      setVisualMode("financial")
    );
    elements.layoutViewBtn.addEventListener("click", () =>
      setVisualMode("layout")
    );
    elements.breakevenViewBtn.addEventListener("click", () =>
      setVisualMode("breakeven")
    );

    // Set up event listener for auto-balance button
    elements.autoBalanceBtn.addEventListener("click", balanceUnitMix);

    // Set up event listeners for presets
    document
      .querySelectorAll("#mix-presets-container button")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const presetId = this.id.replace("preset-", "");
          applyPreset(presetId);
        });
      });

    // Render initial UI
    renderUnitTypes();
    generateUnitLayout();

    // Set initial preset (suburban)
    applyPreset("suburban");
  }

  // Apply a preset for unit mix ratios
  function applyPreset(presetId) {
    if (
      presetId !== "custom" &&
      mixPresets[presetId] &&
      mixPresets[presetId].ratios
    ) {
      state.unitMixRatios = { ...mixPresets[presetId].ratios };
      state.selectedPreset = presetId;

      // Update preset UI
      document
        .querySelectorAll("#mix-presets-container button")
        .forEach((btn) => {
          btn.classList.remove("bg-blue-600", "text-white");
          btn.classList.add("bg-gray-200", "text-gray-800");
        });

      const activeBtn = document.getElementById(`preset-${presetId}`);
      if (activeBtn) {
        activeBtn.classList.remove("bg-gray-200", "text-gray-800");
        activeBtn.classList.add("bg-blue-600", "text-white");
      }

      // Show description
      if (mixPresets[presetId].description) {
        elements.presetDescription.textContent =
          mixPresets[presetId].description;
        elements.presetDescription.classList.remove("hidden");
      } else {
        elements.presetDescription.classList.add("hidden");
      }

      // Update unit mix sliders
      updateUnitMixDisplay();
      checkMixTotal();

      // Regenerate layout
      setTimeout(generateUnitLayout, 300);
    }
  }

  // Update property name
  function updatePropertyName(e) {
    state.propertyName = e.target.value;
    elements.propertyNameDisplay.textContent = state.propertyName;
  }

  // Update total area
  function updateTotalArea(e) {
    const totalArea = parseFloat(e.target.value) || 0;
    if (totalArea <= 0) return;

    // Use 4:3 aspect ratio
    const ratio = 4 / 3;

    let width = Math.sqrt(totalArea * ratio);
    let height = width / ratio;

    // Convert to pixels
    const scaledWidth = width * 100 * state.scale;
    const scaledHeight = height * 100 * state.scale;

    state.facilityDimensions = {
      width: scaledWidth,
      height: scaledHeight,
    };

    state.totalArea = totalArea;

    // Update display
    elements.totalAreaDisplay.textContent = `${totalArea.toFixed(1)} m²`;

    // Regenerate layout
    setTimeout(generateUnitLayout, 500);
  }

  // Update phase
  function updatePhase(e) {
    state.phase = parseInt(e.target.value) || 1;
    updateBreakevenAnalysis();
  }

  // Update expense ratio
  function updateExpenseRatio(e) {
    const ratioValue = parseInt(e.target.value) || 35;
    state.expenseRatio = ratioValue / 100;

    // Update displays
    elements.expenseRatioDisplay.textContent = `${ratioValue.toFixed(1)}%`;
    elements.financialExpenseRatio.textContent = `${ratioValue.toFixed(1)}%`;
    elements.financialNOIMarginSummary.textContent = `${(
      100 - ratioValue
    ).toFixed(1)}%`;

    // Update financial calculations
    calculateFinancialMetrics();
  }

  // Update occupancy rate
  function updateOccupancyRate(e) {
    const rateValue = parseInt(e.target.value) || 85;
    state.occupancyRate = rateValue / 100;

    // Update displays
    elements.occupancyRateDisplay.textContent = `${rateValue.toFixed(0)}%`;
    elements.occupancyRateNote.textContent = `Based on ${rateValue.toFixed(
      0
    )}% occupancy rate`;

    // Update financial calculations
    generateUnitLayout();
  }

  // Update construction cost
  function updateConstructionCost(e) {
    state.constructionCostPerSqm = parseFloat(e.target.value) || 350;
    updateBreakevenAnalysis();
  }

  // Set visual mode (financial, layout, breakeven)
  function setVisualMode(mode) {
    state.visualMode = mode;

    // Update button states
    elements.financialViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.financialViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.layoutViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.layoutViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.breakevenViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.breakevenViewBtn.classList.add("bg-gray-200", "text-gray-800");

    // Hide all views
    elements.financialView.classList.add("hidden");
    elements.layoutView.classList.add("hidden");
    elements.breakevenView.classList.add("hidden");

    // Show selected view and update its button
    if (mode === "financial") {
      elements.financialView.classList.remove("hidden");
      elements.financialViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.financialViewBtn.classList.add("bg-blue-600", "text-white");
    } else if (mode === "layout") {
      elements.layoutView.classList.remove("hidden");
      elements.layoutViewBtn.classList.remove("bg-gray-200", "text-gray-800");
      elements.layoutViewBtn.classList.add("bg-blue-600", "text-white");

      // Initialize charts if needed
      initCharts();
    } else if (mode === "breakeven") {
      elements.breakevenView.classList.remove("hidden");
      elements.breakevenViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.breakevenViewBtn.classList.add("bg-blue-600", "text-white");

      if (mode === "layout") {
        elements.layoutView.classList.remove("hidden");

        // Add a slight delay before initializing charts
        // to ensure containers are visible and sized correctly
        setTimeout(() => {
          initCharts();
        }, 50);
      }

      // Rest of your mode switching code...

      // Update breakeven analysis
      updateBreakevenAnalysis();
    }
  }

  // Initialize charts for layout view
  function initCharts() {
    // Ensure chart containers exist
    const revenueChartContainer = document.getElementById("revenue-chart");
    const unitMixChartContainer = document.getElementById("unit-mix-chart");

    if (!revenueChartContainer || !unitMixChartContainer) {
      console.error("Chart containers not found");
      return;
    }
    // Prepare data for charts
    const revenueData = prepareRevenueChartData();
    const unitMixData = prepareUnitMixPieData();

    // Inside your initCharts function, after ensuring containers exist:

    // Clear containers and create canvas elements
    revenueChartContainer.innerHTML = "<canvas></canvas>";
    unitMixChartContainer.innerHTML = "<canvas></canvas>";

    // Create canvas elements with proper styling
    const revenueCanvas = document.createElement("canvas");
    const unitMixCanvas = document.createElement("canvas");

    // Add canvases to containers
    revenueChartContainer.appendChild(revenueCanvas);
    unitMixChartContainer.appendChild(unitMixCanvas);

    // Get the canvas contexts
    const revenueCtx = revenueChartContainer
      .querySelector("canvas")
      .getContext("2d");

    // Set the canvas size to match the container size
    const unitMixCtx = unitMixChartContainer
      .querySelector("canvas")
      .getContext("2d");

    // Create basic charts
    revenueChart = new Chart(revenueCtx, {
      type: "bar",
      data: {
        labels: revenueData.map((item) => item.name),
        datasets: [
          {
            label: "Monthly Revenue (€)",
            data: revenueData.map((item) => item.revenue),
            backgroundColor: revenueData.map((item) => item.color),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            right: 20,
            bottom: 10,
            left: 10,
          },
        },
      },
    });

    unitMixChart = new Chart(unitMixCtx, {
      type: "pie",
      data: {
        labels: unitMixData.map((item) => `${item.name} (${item.count} units)`),
        datasets: [
          {
            data: unitMixData.map((item) => item.count),
            backgroundColor: unitMixData.map((item) => item.color),
            borderColor: "#ffffff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage =
                  total > 0 ? Math.round((value / total) * 100) : 0;
                return `${percentage}% (${value} units)`;
              },
            },
          },
        },
      },
    });

    // Update space allocation display
    updateSpaceAllocationDisplay();
  }

  // Update space allocation display
  function updateSpaceAllocationDisplay() {
    const rentableArea = state.rentableArea;
    const totalArea = state.totalArea;
    const utilization = state.utilization;
    const commonArea = totalArea - rentableArea;

    elements.spaceRentableArea.textContent = `${rentableArea.toFixed(
      1
    )} m² (${utilization.toFixed(1)}%)`;
    elements.spaceCommonArea.textContent = `${commonArea.toFixed(1)} m² (${(
      100 - utilization
    ).toFixed(1)}%)`;
    elements.spaceUtilizationBar.style.width = `${utilization}%`;
  }

  // Prepare data for revenue chart
  function prepareRevenueChartData() {
    return state.unitTypes.map((type) => {
      const totalTypeArea = type.count * type.area;
      return {
        name: type.name,
        revenue: totalTypeArea * type.pricePerSqm * state.occupancyRate,
        area: totalTypeArea,
        color: type.color,
      };
    });
  }

  // Prepare data for unit mix pie chart
  function prepareUnitMixPieData() {
    // Filter to only include unit types that have at least one unit
    const activeUnitTypes = state.unitTypes.filter((type) => type.count > 0);

    // If no units placed yet, use ratios instead for visualization
    if (activeUnitTypes.length === 0) {
      return state.unitTypes.map((type) => ({
        name: type.name,
        count: state.unitMixRatios[type.id], // Use ratio as placeholder
        color: type.color,
      }));
    }

    // Return actual unit counts for all types
    return state.unitTypes.map((type) => ({
      name: type.name,
      count: type.count, // This should be the actual count of units
      color: type.color,
    }));
  }

  // Update breakeven analysis
  function updateBreakevenAnalysis() {
    // Calculate construction cost
    const totalConstructionCost = calculateConstructionCost();
    elements.totalConstructionCost.textContent = formatCurrency(
      totalConstructionCost
    );

    // Calculate NOI
    const annualNOI = state.monthlyRevenue * 12 * (1 - state.expenseRatio);
    elements.breakevenAnnualNOI.textContent = formatCurrency(annualNOI);

    // Calculate ROI
    const roi = calculateROI();
    elements.breakevenROI.textContent = `${roi.toFixed(2)}% annually`;

    // Calculate breakeven period
    const breakevenYears = calculateBreakEvenYears();
    elements.breakevenPeriod.textContent = `${breakevenYears.toFixed(1)} years`;

    // Calculate cost per unit
    const totalUnitCount = state.unitTypes.reduce(
      (sum, type) => sum + type.count,
      0
    );
    const costPerUnit =
      totalUnitCount > 0 ? totalConstructionCost / totalUnitCount : 0;
    elements.costPerUnit.textContent = formatCurrency(costPerUnit);

    // Update phased development table
    updatePhaseDataTable();
  }

  // Update phased development table
  function updatePhaseDataTable() {
    const phaseData = preparePhaseData();
    elements.phaseDataTable.innerHTML = "";

    phaseData.forEach((phase) => {
      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";

      row.innerHTML = `
        <td class="px-4 py-2 text-sm text-gray-700">Phase ${phase.phase}</td>
        <td class="px-4 py-2 text-sm text-gray-700">${phase.area.toFixed(
          1
        )} m²</td>
        <td class="px-4 py-2 text-sm text-gray-700">${formatCurrency(
          phase.investment
        )}</td>
        <td class="px-4 py-2 text-sm text-gray-700">${formatCurrency(
          phase.revenue
        )}</td>
      `;

      elements.phaseDataTable.appendChild(row);
    });
  }

  // Prepare phased development data
  function preparePhaseData() {
    const totalInvestment = calculateConstructionCost();
    const basePhaseArea = state.totalArea / 3;

    return [
      {
        phase: 1,
        area: basePhaseArea,
        investment: basePhaseArea * state.constructionCostPerSqm,
        revenue: state.monthlyRevenue * 12 * (basePhaseArea / state.totalArea),
        utilization: state.utilization,
      },
      {
        phase: 2,
        area: basePhaseArea * 2,
        investment: basePhaseArea * 2 * state.constructionCostPerSqm,
        revenue:
          state.monthlyRevenue * 12 * ((basePhaseArea * 2) / state.totalArea),
        utilization: state.utilization * 0.9, // Slightly lower in phase 2
      },
      {
        phase: 3,
        area: state.totalArea,
        investment: totalInvestment,
        revenue: state.monthlyRevenue * 12,
        utilization: state.utilization * 0.85, // Lower in final phase
      },
    ];
  }

  // Calculate total construction cost
  function calculateConstructionCost() {
    return state.totalArea * state.constructionCostPerSqm;
  }

  // Calculate ROI (Return on Investment)
  function calculateROI() {
    const annualNOI = state.monthlyRevenue * 12 * (1 - state.expenseRatio);
    const totalInvestment = calculateConstructionCost();
    return totalInvestment > 0 ? (annualNOI / totalInvestment) * 100 : 0;
  }

  // Calculate break-even period (in years)
  function calculateBreakEvenYears() {
    const annualNOI = state.monthlyRevenue * 12 * (1 - state.expenseRatio);
    const totalInvestment = calculateConstructionCost();
    return annualNOI > 0 ? totalInvestment / annualNOI : 0;
  }

  // Render unit types
  function renderUnitTypes() {
    elements.unitTypesContainer.innerHTML = "";

    state.unitTypes.forEach((type) => {
      const guidance = unitGuidance[type.id];

      const card = document.createElement("div");
      card.className = "unit-card";
      card.style.borderColor = type.color;

      card.innerHTML = `
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">
            ${type.name} (${type.area} m²)
          </span>
          <span class="text-sm font-medium" style="color: ${type.color}">
            ${type.count} units
          </span>
        </div>
        
        <div class="bg-blue-50 border border-blue-100 rounded p-2 mb-3">
          <p class="text-xs text-gray-700 m-0">${guidance.detailedGuidance}</p>
        </div>
        
        <div class="mb-3">
          <div class="flex justify-between mb-1">
            <span class="text-xs text-gray-500">Mix %</span>
            <span class="text-xs text-blue-600 font-medium">Ideal: ${
              guidance.idealRange
            }</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value="${state.unitMixRatios[type.id]}"
              class="w-full flex-grow unit-mix-slider"
              data-unit-id="${type.id}"
            />
            <input
              type="number"
              min="0"
              max="100"
              value="${state.unitMixRatios[type.id]}"
              class="w-16 border rounded px-2 py-1 text-sm unit-mix-input"
              data-unit-id="${type.id}"
            />
          </div>
          <div class="flex justify-between mt-1">
            <span class="text-xs text-gray-600 italic">${
              guidance.guidanceText
            }</span>
          </div>
        </div>
        
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-xs text-gray-500">Price per m²/month</span>
            <span class="text-xs text-blue-600 font-medium">Avg: ${
              guidance.priceRange
            }</span>
          </div>
          <input
            type="number"
            min="0"
            step="0.5"
            value="${type.pricePerSqm}"
            class="border rounded px-2 py-1 w-full box-border unit-price-input"
            data-unit-id="${type.id}"
          />
        </div>
      `;

      elements.unitTypesContainer.appendChild(card);
    });

    // Add event listeners
    document.querySelectorAll(".unit-mix-slider").forEach((slider) => {
      slider.addEventListener("input", handleUnitMixChange);
    });

    document.querySelectorAll(".unit-mix-input").forEach((input) => {
      input.addEventListener("input", handleUnitMixChange);
    });

    document.querySelectorAll(".unit-price-input").forEach((input) => {
      input.addEventListener("input", handleUnitPriceChange);
    });

    // Check mix total
    checkMixTotal();
  }

  // Handle unit mix change (from slider or input)
  function handleUnitMixChange(e) {
    const unitId = e.target.dataset.unitId;
    const newValue = parseInt(e.target.value) || 0;

    // If the value is the same, no need to update
    if (state.unitMixRatios[unitId] === newValue) return;

    // Create a working copy of the mix ratios
    const newUnitMixRatios = { ...state.unitMixRatios };

    // Set the new value for the changed unit type
    newUnitMixRatios[unitId] = newValue;

    // Update state
    state.unitMixRatios = newUnitMixRatios;

    // Change preset to 'custom' when user manually adjusts values
    state.selectedPreset = "custom";

    // Update preset UI
    document
      .querySelectorAll("#mix-presets-container button")
      .forEach((btn) => {
        btn.classList.remove("bg-blue-600", "text-white");
        btn.classList.add("bg-gray-200", "text-gray-800");
      });

    const customBtn = document.getElementById("preset-custom");
    if (customBtn) {
      customBtn.classList.remove("bg-gray-200", "text-gray-800");
      customBtn.classList.add("bg-blue-600", "text-white");
    }

    // Hide preset description
    elements.presetDescription.classList.add("hidden");

    // Update all sliders and inputs
    updateUnitMixDisplay();

    // Check mix total
    checkMixTotal();

    // Only regenerate layout if total is 100%
    if (getTotalMixPercentage() === 100) {
      setTimeout(generateUnitLayout, 300);
    }
  }

  // Update unit mix display (sliders and inputs)
  function updateUnitMixDisplay() {
    document.querySelectorAll(".unit-mix-slider").forEach((slider) => {
      const unitId = slider.dataset.unitId;
      slider.value = state.unitMixRatios[unitId];
    });

    document.querySelectorAll(".unit-mix-input").forEach((input) => {
      const unitId = input.dataset.unitId;
      input.value = state.unitMixRatios[unitId];
    });
  }

  // Handle unit price change
  function handleUnitPriceChange(e) {
    const unitId = e.target.dataset.unitId;
    const newPrice = parseFloat(e.target.value) || 0;

    // Update the unit type price in state
    state.unitTypes = state.unitTypes.map((type) =>
      type.id === unitId ? { ...type, pricePerSqm: newPrice } : type
    );

    // Recalculate metrics
    generateUnitLayout();
  }

  // Check if the unit mix total is 100% and update UI accordingly
  function checkMixTotal() {
    const total = getTotalMixPercentage();

    if (total !== 100) {
      elements.mixTotalIndicator.classList.remove("hidden");
      elements.mixTotalValue.textContent = `${total}%`;
      elements.mixTotalBar.style.width = `${Math.min(total, 100)}%`;

      if (total < 100) {
        elements.mixTotalBar.classList.remove("bg-red-500");
        elements.mixTotalBar.classList.add("bg-yellow-500");
        elements.mixTotalMessage.textContent =
          "Your unit mix totals less than 100%. Click 'Auto-Balance' to proportionally adjust all values.";
      } else {
        elements.mixTotalBar.classList.remove("bg-yellow-500");
        elements.mixTotalBar.classList.add("bg-red-500");
        elements.mixTotalMessage.textContent =
          "Your unit mix totals more than 100%. Click 'Auto-Balance' to proportionally scale down all values.";
      }
    } else {
      elements.mixTotalIndicator.classList.add("hidden");
    }
  }

  // Get total mix percentage
  function getTotalMixPercentage() {
    return Object.values(state.unitMixRatios).reduce(
      (sum, val) => sum + val,
      0
    );
  }

  // Balance unit mix to total 100%
  function balanceUnitMix() {
    const total = getTotalMixPercentage();

    if (total === 100) return; // Already balanced

    const newUnitMixRatios = { ...state.unitMixRatios };

    // If total is 0, set equal distribution
    if (total === 0) {
      const equalValue = Math.floor(100 / Object.keys(newUnitMixRatios).length);
      Object.keys(newUnitMixRatios).forEach((key) => {
        newUnitMixRatios[key] = equalValue;
      });
      // Adjust the first value to make sure total is exactly 100
      const firstKey = Object.keys(newUnitMixRatios)[0];
      newUnitMixRatios[firstKey] +=
        100 - equalValue * Object.keys(newUnitMixRatios).length;
    } else {
      // Scale all values proportionally to sum to 100
      const scaleFactor = 100 / total;

      let newTotal = 0;
      Object.keys(newUnitMixRatios).forEach((key) => {
        // Round to nearest integer
        newUnitMixRatios[key] = Math.round(newUnitMixRatios[key] * scaleFactor);
        newTotal += newUnitMixRatios[key];
      });

      // Adjust for rounding errors to ensure sum is exactly 100
      if (newTotal !== 100) {
        // Find the largest value and adjust it
        const largestKey = Object.keys(newUnitMixRatios).reduce((a, b) =>
          newUnitMixRatios[a] > newUnitMixRatios[b] ? a : b
        );
        newUnitMixRatios[largestKey] += 100 - newTotal;
      }
    }

    // Update state
    state.unitMixRatios = newUnitMixRatios;
    state.selectedPreset = "custom";

    // Update preset UI
    document
      .querySelectorAll("#mix-presets-container button")
      .forEach((btn) => {
        btn.classList.remove("bg-blue-600", "text-white");
        btn.classList.add("bg-gray-200", "text-gray-800");
      });

    const customBtn = document.getElementById("preset-custom");
    if (customBtn) {
      customBtn.classList.remove("bg-gray-200", "text-gray-800");
      customBtn.classList.add("bg-blue-600", "text-white");
    }

    // Update unit mix display
    updateUnitMixDisplay();
    checkMixTotal();

    // Regenerate layout
    setTimeout(generateUnitLayout, 300);
  }

  // Calculate unit dimensions
  function calculateUnitDimensions(area) {
    // Square root to get equal sides, then adjust to a reasonable aspect ratio
    const side = Math.sqrt(area * 10000); // Convert m² to cm²
    const gridSize = 50; // Fixed grid size for calculations
    return {
      width: Math.round((side * 1.2) / gridSize) * gridSize, // Make slightly wider
      height: Math.round((side * 0.8) / gridSize) * gridSize, // Make slightly shorter
    };
  }

  // Generate unit layout
  function generateUnitLayout() {
    // Clear existing units
    state.units = [];

    // Calculate total percentage
    const totalPercentage = getTotalMixPercentage();
    if (totalPercentage <= 0) return;

    // Calculate target rentable area using a fixed 70% utilization
    const targetRentableArea = state.totalArea * 0.7;

    // Initialize unit placers
    const newUnits = [];
    let currentX = state.corridorWidth;
    let currentY = state.corridorWidth;
    let rowHeight = 0;
    const gridSize = 50; // Fixed grid size for calculations

    // Calculate how many units of each type to create
    const unitCounts = {};
    const typeCounts = {};

    // First pass: calculate how many units we need
    state.unitTypes.forEach((type) => {
      const ratio = state.unitMixRatios[type.id] / totalPercentage;
      const areaNeed = targetRentableArea * ratio;
      const unitCount = Math.floor(areaNeed / type.area);
      unitCounts[type.id] = unitCount;
      typeCounts[type.id] = unitCount;
    });

    // Second pass: place units on the layout
    for (const type of state.unitTypes) {
      const { id, area, color } = type;
      let count = unitCounts[id];

      // Skip if no units of this type
      if (count <= 0) continue;

      // Get dimensions for this unit type
      const dimensions = calculateUnitDimensions(area);

      while (count > 0) {
        // Check if we need to start a new row
        if (
          currentX + dimensions.width >
          state.facilityDimensions.width - state.corridorWidth
        ) {
          currentX = state.corridorWidth;
          currentY += rowHeight + state.corridorWidth;
          rowHeight = 0;
        }

        // Check if we're out of vertical space
        if (
          currentY + dimensions.height >
          state.facilityDimensions.height - state.corridorWidth
        ) {
          // Update actual count that was placed
          typeCounts[id] = unitCounts[id] - count;
          break; // Stop placing units if we run out of space
        }

        // Create new unit
        const newUnit = {
          id: `${id}-${Date.now()}-${count}`,
          x: currentX,
          y: currentY,
          width: dimensions.width,
          height: dimensions.height,
          type: id,
          area: area,
          color: color,
        };

        newUnits.push(newUnit);

        // Update position for next unit
        currentX += dimensions.width + gridSize;
        rowHeight = Math.max(rowHeight, dimensions.height);
        count--;
      }
    }

    // Update unit counts
    state.unitTypes = state.unitTypes.map((type) => ({
      ...type,
      count: typeCounts[type.id] || 0,
    }));

    // Update state with new units
    state.units = newUnits;

    // Calculate metrics
    calculateFinancialMetrics();

    // Update UI
    renderUnitTypes();
  }

  // Calculate financial metrics
  function calculateFinancialMetrics() {
    // Calculate rentable area
    let totalRentableArea = 0;
    let totalMonthlyRevenue = 0;

    state.units.forEach((unit) => {
      const unitType = state.unitTypes.find((type) => type.id === unit.type);
      if (unitType) {
        totalRentableArea += unitType.area;
        totalMonthlyRevenue += unitType.area * unitType.pricePerSqm;
      }
    });

    // Apply occupancy rate
    totalMonthlyRevenue = totalMonthlyRevenue * state.occupancyRate;

    // Update state
    state.rentableArea = totalRentableArea;
    state.utilization = (totalRentableArea / state.totalArea) * 100;
    state.monthlyRevenue = totalMonthlyRevenue;

    // Update UI
    updateFinancialDisplay();
    updateSummaryTable();
    updateBreakevenAnalysis();

    // Update charts if in layout view
    if (state.visualMode === "layout" && revenueChart && unitMixChart) {
      const revenueData = prepareRevenueChartData();
      const unitMixData = prepareUnitMixPieData();

      revenueChart.data.labels = revenueData.map((item) => item.name);
      revenueChart.data.datasets[0].data = revenueData.map(
        (item) => item.revenue
      );
      revenueChart.data.datasets[0].backgroundColor = revenueData.map(
        (item) => item.color
      );
      revenueChart.update();

      unitMixChart.data.labels = unitMixData.map(
        (item) => `${item.name} (${item.count} units)`
      );
      unitMixChart.data.datasets[0].data = unitMixData.map(
        (item) => item.count
      );
      unitMixChart.data.datasets[0].backgroundColor = unitMixData.map(
        (item) => item.color
      );
      unitMixChart.update();

      updateSpaceAllocationDisplay();
    }
  }

  // Update financial display
  function updateFinancialDisplay() {
    // Basic metrics
    elements.totalAreaDisplay.textContent = `${state.totalArea.toFixed(1)} m²`;
    elements.rentableAreaDisplay.textContent = `${state.rentableArea.toFixed(
      1
    )} m²`;
    elements.utilizationDisplay.textContent = `${state.utilization.toFixed(
      1
    )}%`;
    elements.monthlyRevenueDisplay.textContent = formatCurrency(
      state.monthlyRevenue
    );

    // Revenue metrics
    elements.financialMonthlyRevenue.textContent = formatCurrency(
      state.monthlyRevenue
    );
    elements.financialAnnualRevenue.textContent = formatCurrency(
      state.monthlyRevenue * 12
    );

    // Expense metrics
    const monthlyExpenses = state.monthlyRevenue * state.expenseRatio;
    const annualExpenses = monthlyExpenses * 12;
    elements.financialMonthlyExpenses.textContent =
      formatCurrency(monthlyExpenses);
    elements.financialAnnualExpenses.textContent =
      formatCurrency(annualExpenses);

    // NOI metrics
    const monthlyNOI = state.monthlyRevenue * (1 - state.expenseRatio);
    const annualNOI = monthlyNOI * 12;
    elements.financialMonthlyNOI.textContent = formatCurrency(monthlyNOI);
    elements.financialAnnualNOI.textContent = formatCurrency(annualNOI);
    elements.financialAnnualNOISummary.textContent = formatCurrency(annualNOI);

    // Other financial metrics
    const revenuePerSqm =
      state.rentableArea > 0 ? state.monthlyRevenue / state.rentableArea : 0;
    elements.financialRevenuePerSqm.textContent = `${formatCurrency(
      revenuePerSqm
    )}/m²/month`;

    elements.financialUtilization.textContent = `${state.utilization.toFixed(
      1
    )}%`;

    const noiMargin = (1 - state.expenseRatio) * 100;
    elements.financialNOIMargin.textContent = `${noiMargin.toFixed(1)}%`;
    elements.financialNOIMarginSummary.textContent = `${noiMargin.toFixed(1)}%`;

    // ROI
    const roi = calculateROI();
    elements.financialROI.textContent = `${roi.toFixed(2)}% annually`;
  }

  // Update unit summary table
  function updateSummaryTable() {
    elements.unitSummaryTable.innerHTML = "";

    // Add rows for each unit type
    state.unitTypes.forEach((type) => {
      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";

      const totalArea = type.count * type.area;
      const monthlyRevenue = totalArea * type.pricePerSqm * state.occupancyRate;

      row.innerHTML = `
        <td class="px-4 py-2 text-sm text-gray-700">
          <span class="inline-block w-3 h-3 mr-2 rounded-full" style="background-color: ${
            type.color
          }"></span>
          ${type.name}
        </td>
        <td class="px-4 py-2 text-sm text-gray-700">${type.area} m²</td>
        <td class="px-4 py-2 text-sm text-gray-700">${type.count}</td>
        <td class="px-4 py-2 text-sm text-gray-700">${totalArea.toFixed(
          1
        )} m²</td>
        <td class="px-4 py-2 text-sm text-gray-700">${formatCurrency(
          monthlyRevenue
        )}</td>
      `;

      elements.unitSummaryTable.appendChild(row);
    });

    // Add total row
    const totalRow = document.createElement("tr");
    totalRow.className = "bg-gray-50 font-medium";

    const totalCount = state.unitTypes.reduce(
      (sum, type) => sum + type.count,
      0
    );

    totalRow.innerHTML = `
      <td class="px-4 py-2 text-sm text-gray-700">Total</td>
      <td class="px-4 py-2 text-sm text-gray-700">-</td>
      <td class="px-4 py-2 text-sm text-gray-700">${totalCount}</td>
      <td class="px-4 py-2 text-sm text-gray-700">${state.rentableArea.toFixed(
        1
      )} m²</td>
      <td class="px-4 py-2 text-sm text-gray-700">${formatCurrency(
        state.monthlyRevenue
      )}</td>
    `;

    elements.unitSummaryTable.appendChild(totalRow);
  }

  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  }

  // Initialize the application
  init();
});
