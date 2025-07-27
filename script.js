document.addEventListener("DOMContentLoaded", function () {
  // Initial state
  const state = {
    facilityDimensions: {
      width: 44721, // Default to 1500 square meters with 4:3 aspect ratio
      height: 33541,
    },
    totalArea: 1500,
    scale: 10, // pixels per cm
    corridorWidth: 150,
    expenseRatio: 0.35, // 35% operating expenses by default
    occupancyRate: 0.85, // 85% occupancy by default
    
    // Individual operating expenses (monthly amounts in EUR)
    operatingExpenses: {
      mgmt: 450,        // Property management
      utilities: 320,   // Utilities (electric/water)
      insurance: 180,   // Insurance
      security: 125,    // Security system
      maintenance: 275, // Maintenance & repairs
      marketing: 200,   // Marketing & advertising
      legal: 150,       // Legal & professional (fixed, no slider)
    },
    constructionCostPerSqm: 350, // €350 per square meter for construction
    totalInvestment: 750000, // Total investment amount
    visualMode: "financial", // Default view mode
    leaseupRate: 8, // Units leased per month at steady state
    rampupMonths: 6, // Months before reaching steady lease-up rate
    
    // Market analysis data
    siteAddress: "",
    populationDensity: 2500,
    medianIncome: 45000,
    housingTurnover: 12,
    distanceToCenter: 8,
    competingFacilities: 3,
    competitorPrice: 180,
    marketOccupancy: 82,
    
    // Site characteristics (booleans)
    siteCharacteristics: {
      highwayAccess: true,
      truckAccess: true,
      visibility: false,
      existingBuilding: false,
    },
    
    // Market demand drivers (booleans)
    demandDrivers: {
      newDevelopments: false,
      businessDistrict: false,
      militaryBase: false,
      seasonalTourism: false,
    },
    
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
    totalAreaInput: document.getElementById("total-area-input"),
    totalAreaDisplay: document.getElementById("total-area-display"),
    totalInvestmentInput: document.getElementById("total-investment-input"),
    totalInvestmentDisplay: document.getElementById("total-investment-display"),

    // Key metrics
    rentableAreaDisplay: document.getElementById("rentable-area-display"),
    utilizationDisplay: document.getElementById("utilization-display"),
    monthlyRevenueDisplay: document.getElementById("monthly-revenue-display"),
    occupancyRateNote: document.getElementById("occupancy-rate-note"),
    annualROIDisplay: document.getElementById("annual-roi-display"),
    breakevenTimelineDisplay: document.getElementById("breakeven-timeline-display"),
    costPerSqmDisplay: document.getElementById("cost-per-sqm-display"),
    constructionCostPerUnitDisplay: document.getElementById("construction-cost-per-unit-display"),

    // Main navigation
    marketNavBtn: document.getElementById("market-nav-btn"),
    operationalNavBtn: document.getElementById("operational-nav-btn"),
    financialNavBtn: document.getElementById("financial-nav-btn"),
    marketSubnav: document.getElementById("market-subnav"),
    operationalSubnav: document.getElementById("operational-subnav"),
    financialSubnav: document.getElementById("financial-subnav"),

    // View controls
    financialViewBtn: document.getElementById("financial-view-btn"),
    layoutViewBtn: document.getElementById("layout-view-btn"),
    breakevenViewBtn: document.getElementById("breakeven-view-btn"),
    leaseupViewBtn: document.getElementById("leaseup-view-btn"),
    marketViewBtn: document.getElementById("market-view-btn"),
    suppliersViewBtn: document.getElementById("suppliers-view-btn"),
    operatingExpensesViewBtn: document.getElementById("operating-expenses-view-btn"),
    cashflowViewBtn: document.getElementById("cashflow-view-btn"),
    sensitivityViewBtn: document.getElementById("sensitivity-view-btn"),
    financialView: document.getElementById("financial-view"),
    layoutView: document.getElementById("layout-view"),
    breakevenView: document.getElementById("breakeven-view"),
    leaseupView: document.getElementById("leaseup-view"),
    marketView: document.getElementById("market-view"),
    suppliersView: document.getElementById("suppliers-view"),
    operatingExpensesView: document.getElementById("operating-expenses-view"),
    cashflowView: document.getElementById("cashflow-view"),
    sensitivityView: document.getElementById("sensitivity-view"),
    unitMixSection: document.getElementById("unit-mix-section"),

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

    // Operating expenses elements
    mgmtSlider: document.getElementById("mgmt-slider"),
    utilitiesSlider: document.getElementById("utilities-slider"),
    insuranceSlider: document.getElementById("insurance-slider"),
    securitySlider: document.getElementById("security-slider"),
    maintenanceSlider: document.getElementById("maintenance-slider"),
    marketingSlider: document.getElementById("marketing-slider"),
    mgmtCost: document.getElementById("mgmt-cost"),
    utilitiesCost: document.getElementById("utilities-cost"),
    insuranceCost: document.getElementById("insurance-cost"),
    securityCost: document.getElementById("security-cost"),
    maintenanceCost: document.getElementById("maintenance-cost"),
    marketingCost: document.getElementById("marketing-cost"),
    legalCost: document.getElementById("legal-cost"),
    totalOpex: document.getElementById("total-opex"),
    opexRatio: document.getElementById("opex-ratio"),
    annualOpex: document.getElementById("annual-opex"),
    opexPerSqm: document.getElementById("opex-per-sqm"),

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

    // Lease-up view elements
    leaseupRateInput: document.getElementById("leaseup-rate-input"),
    rampupMonthsInput: document.getElementById("rampup-months-input"),
    leaseupMilestonesTable: document.getElementById("leaseup-milestones-table"),
    breakevenTimeline: document.getElementById("breakeven-timeline"),
    targetOccupancyTimeline: document.getElementById("target-occupancy-timeline"),

    // Market analysis elements
    siteAddressInput: document.getElementById("site-address-input"),
    populationDensityInput: document.getElementById("population-density-input"),
    medianIncomeInput: document.getElementById("median-income-input"),
    housingTurnoverInput: document.getElementById("housing-turnover-input"),
    distanceCenterInput: document.getElementById("distance-center-input"),
    competingFacilitiesInput: document.getElementById("competing-facilities-input"),
    competitorPriceInput: document.getElementById("competitor-price-input"),
    marketOccupancyInput: document.getElementById("market-occupancy-input"),
    
    // Site characteristics checkboxes
    highwayAccessCb: document.getElementById("highway-access"),
    truckAccessCb: document.getElementById("truck-access"),
    visibilityCb: document.getElementById("visibility"),
    existingBuildingCb: document.getElementById("existing-building"),
    
    // Demand drivers checkboxes
    newDevelopmentsCb: document.getElementById("new-developments"),
    businessDistrictCb: document.getElementById("business-district"),
    militaryBaseCb: document.getElementById("military-base"),
    seasonalTourismCb: document.getElementById("seasonal-tourism"),
    
    // Market analysis displays
    viabilityScore: document.getElementById("viability-score"),
    viabilityBar: document.getElementById("viability-bar"),
    demographicsScore: document.getElementById("demographics-score"),
    demographicsBar: document.getElementById("demographics-bar"),
    competitionScore: document.getElementById("competition-score"),
    competitionBar: document.getElementById("competition-bar"),
    siteQualityScore: document.getElementById("site-quality-score"),
    siteQualityBar: document.getElementById("site-quality-bar"),
    viabilityRecommendation: document.getElementById("viability-recommendation"),
    
    // Market metrics displays
    demandIndex: document.getElementById("demand-index"),
    supplyGap: document.getElementById("supply-gap"),
    pricePremium: document.getElementById("price-premium"),
    breakevenRisk: document.getElementById("breakeven-risk"),
    strategicRecommendations: document.getElementById("strategic-recommendations"),
    riskFactors: document.getElementById("risk-factors"),

    // Suppliers view elements
    supplierSearch: document.getElementById("supplier-search"),
    suppliersGrid: document.getElementById("suppliers-grid"),
    recommendedSuppliers: document.getElementById("recommended-suppliers"),
    recFacilitySize: document.getElementById("rec-facility-size"),


    // Cash flow analysis elements
    initialInvestmentInput: document.getElementById("initial-investment-input"),
    workingCapitalInput: document.getElementById("working-capital-input"),
    loanAmountInput: document.getElementById("loan-amount-input"),
    interestRateInput: document.getElementById("interest-rate-input"),
    loanTermInput: document.getElementById("loan-term-input"),
    cashflowSummaryTable: document.getElementById("cashflow-summary-table"),
    cashPositiveMonth: document.getElementById("cash-positive-month"),
    cumulativePositiveMonth: document.getElementById("cumulative-positive-month"),
    fiveYearCash: document.getElementById("five-year-cash"),

    // Sensitivity analysis elements
    runSensitivityBtn: document.getElementById("run-sensitivity-btn"),
    rentMin: document.getElementById("rent-min"),
    rentMax: document.getElementById("rent-max"),
    occupancyMin: document.getElementById("occupancy-min"),
    occupancyMax: document.getElementById("occupancy-max"),
    bestCaseNpv: document.getElementById("best-case-npv"),
    worstCaseNpv: document.getElementById("worst-case-npv"),
    sensitivityInsights: document.getElementById("sensitivity-insights"),
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
  let leaseupChart = null;

  // Suppliers data structure
  const suppliersData = [
    // Construction & Building
    {
      name: "Steel Building Systems",
      category: "construction",
      description: "Pre-engineered steel buildings designed specifically for self-storage facilities",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "🏗️",
      rating: 4.8,
      specialties: ["Steel Buildings", "Turnkey Construction", "Climate Control"],
      priceRange: "€€€",
      forFacilitySize: ["small", "medium", "large"],
      location: "Nationwide",
      phone: "+1-800-STEEL-SS"
    },
    {
      name: "Concrete Solutions Pro",
      category: "construction",
      description: "Specialized concrete construction for storage facility foundations and structures",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "🏢",
      rating: 4.6,
      specialties: ["Concrete Work", "Foundations", "Site Preparation"],
      priceRange: "€€",
      forFacilitySize: ["medium", "large"],
      location: "Regional",
      phone: "+1-800-CONCRETE"
    },
    
    // Security Systems
    {
      name: "SecureStorage Technologies",
      category: "security",
      description: "Complete security solutions including cameras, access control, and monitoring",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "🔒",
      rating: 4.9,
      specialties: ["CCTV Systems", "Access Control", "Alarm Systems", "Mobile Apps"],
      priceRange: "€€€",
      forFacilitySize: ["small", "medium", "large"],
      location: "International",
      phone: "+1-800-SECURE-1"
    },
    {
      name: "Guardian Access Systems",
      category: "security",
      description: "Keypad and smart lock solutions for individual storage units",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "🗝️",
      rating: 4.7,
      specialties: ["Smart Locks", "Keypads", "Mobile Access", "Integration"],
      priceRange: "€€",
      forFacilitySize: ["small", "medium", "large"],
      location: "Nationwide",
      phone: "+1-800-GUARDIAN"
    },

    // Doors & Hardware
    {
      name: "RollUp Door Specialists",
      category: "doors",
      description: "High-quality roll-up doors designed for frequent use in storage facilities",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "🚪",
      rating: 4.8,
      specialties: ["Roll-up Doors", "Steel Doors", "Hardware", "Installation"],
      priceRange: "€€",
      forFacilitySize: ["small", "medium", "large"],
      location: "Regional",
      phone: "+1-800-ROLLUP-1"
    },
    {
      name: "Premium Storage Hardware",
      category: "doors",
      description: "Locks, hinges, handles and all hardware for storage unit doors",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "🔧",
      rating: 4.5,
      specialties: ["Door Hardware", "Locks", "Hinges", "Weather Sealing"],
      priceRange: "€",
      forFacilitySize: ["small", "medium", "large"],
      location: "Online",
      phone: "+1-800-HARDWARE"
    },

    // Management Software
    {
      name: "StorageMax Pro",
      category: "management",
      description: "Complete facility management software with billing, tenant management, and reporting",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "💻",
      rating: 4.9,
      specialties: ["Tenant Management", "Online Payments", "Reporting", "Mobile App"],
      priceRange: "€€",
      forFacilitySize: ["small", "medium", "large"],
      location: "Cloud-based",
      phone: "+1-800-STORAGE-MAX"
    },
    {
      name: "EasyStore Manager",
      category: "management",
      description: "Simple, affordable management software for smaller facilities",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "📱",
      rating: 4.4,
      specialties: ["Basic Management", "Online Rentals", "Payment Processing"],
      priceRange: "€",
      forFacilitySize: ["small", "medium"],
      location: "Cloud-based",
      phone: "+1-800-EASYSTORE"
    },

    // Financing & Insurance
    {
      name: "Storage Capital Partners",
      category: "financing",
      description: "Specialized SBA and conventional financing for self-storage development",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "💰",
      rating: 4.7,
      specialties: ["SBA Loans", "Construction Loans", "Refinancing"],
      priceRange: "Variable",
      forFacilitySize: ["medium", "large"],
      location: "Nationwide",
      phone: "+1-800-STORAGE-$"
    },
    {
      name: "Self-Storage Insurance Group",
      category: "financing",
      description: "Comprehensive insurance coverage designed for storage facility operators",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "🛡️",
      rating: 4.6,
      specialties: ["Property Insurance", "Liability Coverage", "Business Insurance"],
      priceRange: "€€",
      forFacilitySize: ["small", "medium", "large"],
      location: "Nationwide",
      phone: "+1-800-SS-INSURE"
    },

    // Marketing & Operations
    {
      name: "StorageBoost Marketing",
      category: "marketing",
      description: "Digital marketing and lead generation specifically for self-storage facilities",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "📈",
      rating: 4.8,
      specialties: ["Google Ads", "SEO", "Website Design", "Lead Generation"],
      priceRange: "€€",
      forFacilitySize: ["small", "medium", "large"],
      location: "Remote",
      phone: "+1-800-BOOST-SS"
    },
    {
      name: "Storage Supplies Direct",
      category: "marketing",
      description: "Moving supplies, boxes, and retail products for your storage facility",
      website: "https://example.com",
      affiliateLink: "https://example.com?ref=storagefacilitator",
      logo: "📦",
      rating: 4.5,
      specialties: ["Moving Supplies", "Boxes", "Locks", "Retail Products"],
      priceRange: "€",
      forFacilitySize: ["small", "medium", "large"],
      location: "Wholesale",
      phone: "+1-800-SUPPLIES"
    },
  ];

  // Current filter state
  let currentFilter = "all";
  let currentSearchTerm = "";

  // Initialize the application
  function init() {
    // Set up event listeners for property details
    elements.totalAreaInput.addEventListener("input", updateTotalArea);
    elements.totalInvestmentInput.addEventListener("input", updateTotalInvestment);

    // Set up event listeners for finance controls
    elements.expenseRatioSlider.addEventListener("input", updateExpenseRatio);
    elements.occupancyRateSlider.addEventListener("input", updateOccupancyRate);
    elements.constructionCostInput.addEventListener(
      "input",
      updateConstructionCost
    );

    // Set up event listeners for operating expense sliders
    elements.mgmtSlider.addEventListener("input", updateMgmtCost);
    elements.utilitiesSlider.addEventListener("input", updateUtilitiesCost);
    elements.insuranceSlider.addEventListener("input", updateInsuranceCost);
    elements.securitySlider.addEventListener("input", updateSecurityCost);
    elements.maintenanceSlider.addEventListener("input", updateMaintenanceCost);
    elements.marketingSlider.addEventListener("input", updateMarketingCost);

    // Set up event listeners for lease-up controls
    elements.leaseupRateInput.addEventListener("input", updateLeaseupRate);
    elements.rampupMonthsInput.addEventListener("input", updateRampupMonths);

    // Set up event listeners for market analysis controls
    elements.siteAddressInput.addEventListener("input", updateMarketAnalysis);
    elements.populationDensityInput.addEventListener("input", updateMarketAnalysis);
    elements.medianIncomeInput.addEventListener("input", updateMarketAnalysis);
    elements.housingTurnoverInput.addEventListener("input", updateMarketAnalysis);
    elements.distanceCenterInput.addEventListener("input", updateMarketAnalysis);
    elements.competingFacilitiesInput.addEventListener("input", updateMarketAnalysis);
    elements.competitorPriceInput.addEventListener("input", updateMarketAnalysis);
    elements.marketOccupancyInput.addEventListener("input", updateMarketAnalysis);
    
    // Site characteristics checkboxes
    elements.highwayAccessCb.addEventListener("change", updateMarketAnalysis);
    elements.truckAccessCb.addEventListener("change", updateMarketAnalysis);
    elements.visibilityCb.addEventListener("change", updateMarketAnalysis);
    elements.existingBuildingCb.addEventListener("change", updateMarketAnalysis);
    
    // Demand drivers checkboxes
    elements.newDevelopmentsCb.addEventListener("change", updateMarketAnalysis);
    elements.businessDistrictCb.addEventListener("change", updateMarketAnalysis);
    elements.militaryBaseCb.addEventListener("change", updateMarketAnalysis);
    elements.seasonalTourismCb.addEventListener("change", updateMarketAnalysis);

    // Set up event listeners for suppliers section
    elements.supplierSearch.addEventListener("input", handleSupplierSearch);
    
    // Set up filter buttons
    document.getElementById("filter-all").addEventListener("click", () => setSupplierFilter("all"));
    document.getElementById("filter-construction").addEventListener("click", () => setSupplierFilter("construction"));
    document.getElementById("filter-security").addEventListener("click", () => setSupplierFilter("security"));
    document.getElementById("filter-doors").addEventListener("click", () => setSupplierFilter("doors"));
    document.getElementById("filter-management").addEventListener("click", () => setSupplierFilter("management"));
    document.getElementById("filter-financing").addEventListener("click", () => setSupplierFilter("financing"));
    document.getElementById("filter-marketing").addEventListener("click", () => setSupplierFilter("marketing"));


    // Set up event listeners for main navigation
    elements.marketNavBtn.addEventListener("click", () => setMainNav("market"));
    elements.operationalNavBtn.addEventListener("click", () => setMainNav("operational"));
    elements.financialNavBtn.addEventListener("click", () => setMainNav("financial"));

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
    elements.leaseupViewBtn.addEventListener("click", () =>
      setVisualMode("leaseup")
    );
    elements.marketViewBtn.addEventListener("click", () =>
      setVisualMode("market")
    );
    elements.suppliersViewBtn.addEventListener("click", () =>
      setVisualMode("suppliers")
    );
    elements.operatingExpensesViewBtn.addEventListener("click", () =>
      setVisualMode("operating-expenses")
    );
    elements.cashflowViewBtn.addEventListener("click", () =>
      setVisualMode("cashflow")
    );
    elements.sensitivityViewBtn.addEventListener("click", () =>
      setVisualMode("sensitivity")
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

    // Initialize operating expenses display
    updateOperatingExpenses();

    // Set initial preset (suburban)
    applyPreset("suburban");
    
    // Set initial view (market)
    console.log('Elements check:');
    console.log('financialView:', elements.financialView);
    console.log('layoutView:', elements.layoutView);
    console.log('suppliersView:', elements.suppliersView);
    setVisualMode("market");
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

  // Update total investment
  function updateTotalInvestment(e) {
    const investment = parseFloat(e.target.value) || 0;
    if (investment <= 0) return;

    state.totalInvestment = investment;

    // Calculate how many units we can build with this investment
    const constructionCostPerUnit = calculateConstructionCostPerUnit();
    if (constructionCostPerUnit > 0) {
      const maxUnits = Math.floor(investment / constructionCostPerUnit);
      
      // Calculate required area for these units
      const averageUnitSize = calculateAverageUnitSize();
      const requiredArea = maxUnits * averageUnitSize;
      
      // Update total area based on investment
      state.totalArea = requiredArea;
      elements.totalAreaInput.value = requiredArea;
      elements.totalAreaDisplay.textContent = `${requiredArea.toFixed(1)} m²`;
      
      // Update facility dimensions
      const ratio = 4 / 3;
      let width = Math.sqrt(requiredArea * ratio);
      let height = width / ratio;
      const scaledWidth = width * 100 * state.scale;
      const scaledHeight = height * 100 * state.scale;
      
      state.facilityDimensions = {
        width: scaledWidth,
        height: scaledHeight,
      };
    }

    // Update display
    elements.totalInvestmentDisplay.textContent = formatCurrency(investment);

    // Regenerate layout and recalculate metrics
    setTimeout(() => {
      generateUnitLayout();
      calculateFinancialMetrics();
    }, 100);
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

  // Operating expense update functions
  function updateMgmtCost(e) {
    state.operatingExpenses.mgmt = parseInt(e.target.value) || 450;
    elements.mgmtCost.textContent = state.operatingExpenses.mgmt;
    updateOperatingExpenses();
  }

  function updateUtilitiesCost(e) {
    state.operatingExpenses.utilities = parseInt(e.target.value) || 320;
    elements.utilitiesCost.textContent = state.operatingExpenses.utilities;
    updateOperatingExpenses();
  }

  function updateInsuranceCost(e) {
    state.operatingExpenses.insurance = parseInt(e.target.value) || 180;
    elements.insuranceCost.textContent = state.operatingExpenses.insurance;
    updateOperatingExpenses();
  }

  function updateSecurityCost(e) {
    state.operatingExpenses.security = parseInt(e.target.value) || 125;
    elements.securityCost.textContent = state.operatingExpenses.security;
    updateOperatingExpenses();
  }

  function updateMaintenanceCost(e) {
    state.operatingExpenses.maintenance = parseInt(e.target.value) || 275;
    elements.maintenanceCost.textContent = state.operatingExpenses.maintenance;
    updateOperatingExpenses();
  }

  function updateMarketingCost(e) {
    state.operatingExpenses.marketing = parseInt(e.target.value) || 200;
    elements.marketingCost.textContent = state.operatingExpenses.marketing;
    updateOperatingExpenses();
  }

  // Update total operating expenses and related calculations
  function updateOperatingExpenses() {
    const expenses = state.operatingExpenses;
    const totalMonthlyOpex = expenses.mgmt + expenses.utilities + expenses.insurance + 
                            expenses.security + expenses.maintenance + expenses.marketing + expenses.legal;
    
    // Update displays
    elements.totalOpex.textContent = totalMonthlyOpex.toLocaleString();
    elements.annualOpex.textContent = '€' + (totalMonthlyOpex * 12).toLocaleString();
    elements.opexPerSqm.textContent = '€' + (totalMonthlyOpex / state.totalArea).toFixed(1);
    
    // Calculate OpEx ratio using current monthly revenue
    const monthlyRevenue = state.monthlyRevenue;
    if (monthlyRevenue > 0) {
      const opexRatio = (totalMonthlyOpex / monthlyRevenue) * 100;
      elements.opexRatio.textContent = opexRatio.toFixed(0) + '%';
    } else {
      elements.opexRatio.textContent = '0%';
    }
    
    // Update financial calculations
    calculateFinancialMetrics();
  }

  // Update lease-up rate
  function updateLeaseupRate(e) {
    state.leaseupRate = parseInt(e.target.value) || 8;
    updateLeaseupAnalysis();
  }

  // Update ramp-up months
  function updateRampupMonths(e) {
    state.rampupMonths = parseInt(e.target.value) || 6;
    updateLeaseupAnalysis();
  }

  // Set visual mode (financial, layout, breakeven)
  function setMainNav(navMode) {
    console.log('Setting main nav to:', navMode);
    
    // Update main nav button states
    elements.marketNavBtn.classList.remove("border-blue-600", "bg-blue-50", "text-blue-700");
    elements.marketNavBtn.classList.add("border-transparent", "text-gray-600");
    
    elements.operationalNavBtn.classList.remove("border-blue-600", "bg-blue-50", "text-blue-700");
    elements.operationalNavBtn.classList.add("border-transparent", "text-gray-600");
    
    elements.financialNavBtn.classList.remove("border-blue-600", "bg-blue-50", "text-blue-700");
    elements.financialNavBtn.classList.add("border-transparent", "text-gray-600");
    
    // Hide all subnavs
    elements.marketSubnav.classList.add("hidden");
    elements.operationalSubnav.classList.add("hidden");
    elements.financialSubnav.classList.add("hidden");
    
    // Show selected nav and subnav
    if (navMode === "market") {
      elements.marketNavBtn.classList.remove("border-transparent", "text-gray-600");
      elements.marketNavBtn.classList.add("border-blue-600", "bg-blue-50", "text-blue-700");
      elements.marketSubnav.classList.remove("hidden");
      setVisualMode("market");
    } else if (navMode === "operational") {
      elements.operationalNavBtn.classList.remove("border-transparent", "text-gray-600");
      elements.operationalNavBtn.classList.add("border-blue-600", "bg-blue-50", "text-blue-700");
      elements.operationalSubnav.classList.remove("hidden");
      setVisualMode("layout");
    } else if (navMode === "financial") {
      elements.financialNavBtn.classList.remove("border-transparent", "text-gray-600");
      elements.financialNavBtn.classList.add("border-blue-600", "bg-blue-50", "text-blue-700");
      elements.financialSubnav.classList.remove("hidden");
      setVisualMode("financial");
    }
  }

  function setVisualMode(mode) {
    console.log('Setting visual mode to:', mode);
    state.visualMode = mode;

    // Update button states
    elements.financialViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.financialViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.layoutViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.layoutViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.breakevenViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.breakevenViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.leaseupViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.leaseupViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.marketViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.marketViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.suppliersViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.suppliersViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.operatingExpensesViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.operatingExpensesViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.cashflowViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.cashflowViewBtn.classList.add("bg-gray-200", "text-gray-800");

    elements.sensitivityViewBtn.classList.remove("bg-blue-600", "text-white");
    elements.sensitivityViewBtn.classList.add("bg-gray-200", "text-gray-800");

    // Hide all views - using style.display for more reliable hiding
    console.log('Hiding all views...');
    const allViews = [
      elements.financialView,
      elements.layoutView, 
      elements.breakevenView,
      elements.leaseupView,
      elements.marketView,
      elements.suppliersView,
      elements.operatingExpensesView,
      elements.cashflowView,
      elements.sensitivityView
    ];
    
    allViews.forEach(view => {
      if (view) {
        view.style.display = 'none';
        view.classList.add("hidden");
      }
    });
    console.log('All views hidden');

    // Unit mix section is now part of layout view, so no separate visibility control needed

    // Show selected view and update its button
    if (mode === "financial") {
      elements.financialView.style.display = 'block';
      elements.financialView.classList.remove("hidden");
      elements.financialViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.financialViewBtn.classList.add("bg-blue-600", "text-white");
      console.log('Financial view shown');
    } else if (mode === "layout") {
      elements.layoutView.style.display = 'block';
      elements.layoutView.classList.remove("hidden");
      elements.layoutViewBtn.classList.remove("bg-gray-200", "text-gray-800");
      elements.layoutViewBtn.classList.add("bg-blue-600", "text-white");
      console.log('Layout view shown');

      // Initialize charts if needed
      initCharts();
      
      // Update summary table
      updateSummaryTable();
    } else if (mode === "breakeven") {
      elements.breakevenView.style.display = 'grid';
      elements.breakevenView.classList.remove("hidden");
      elements.breakevenViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.breakevenViewBtn.classList.add("bg-blue-600", "text-white");
      console.log('Breakeven view shown');

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
    } else if (mode === "leaseup") {
      elements.leaseupView.style.display = 'grid';
      elements.leaseupView.classList.remove("hidden");
      elements.leaseupViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.leaseupViewBtn.classList.add("bg-blue-600", "text-white");
      console.log('Leaseup view shown');

      // Initialize lease-up chart and update analysis
      initLeaseupChart();
      updateLeaseupAnalysis();
    } else if (mode === "market") {
      elements.marketView.style.display = 'grid';
      elements.marketView.classList.remove("hidden");
      elements.marketViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.marketViewBtn.classList.add("bg-blue-600", "text-white");
      console.log('Market view shown');

      // Update market analysis
      updateMarketAnalysis();
    } else if (mode === "suppliers") {
      console.log('Showing suppliers view...');
      elements.suppliersView.style.display = 'grid';
      elements.suppliersView.classList.remove("hidden");
      elements.suppliersViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.suppliersViewBtn.classList.add("bg-blue-600", "text-white");
      console.log('Suppliers view shown');

      // Initialize suppliers view
      renderSuppliers();
      updateRecommendedSuppliers();
    } else if (mode === "operating-expenses") {
      console.log('Showing operating expenses view...');
      elements.operatingExpensesView.style.display = 'grid';
      elements.operatingExpensesView.classList.remove("hidden");
      elements.operatingExpensesViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.operatingExpensesViewBtn.classList.add("bg-blue-600", "text-white");
      console.log('Operating expenses view shown');

      // Initialize operating expenses values
      updateOperatingExpenses();
    } else if (mode === "cashflow") {
      console.log('Showing cashflow view...');
      elements.cashflowView.style.display = 'grid';
      elements.cashflowView.classList.remove("hidden");
      elements.cashflowViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.cashflowViewBtn.classList.add("bg-blue-600", "text-white");
      console.log('Cashflow view shown');

      // Initialize cash flow analysis
      console.log('Initializing cash flow analysis...');
      updateCashFlowAnalysis();
    } else if (mode === "sensitivity") {
      console.log('Showing sensitivity view...');
      elements.sensitivityView.style.display = 'grid';
      elements.sensitivityView.classList.remove("hidden");
      elements.sensitivityViewBtn.classList.remove(
        "bg-gray-200",
        "text-gray-800"
      );
      elements.sensitivityViewBtn.classList.add("bg-blue-600", "text-white");
      console.log('Sensitivity view shown');

      // Initialize sensitivity analysis
      updateSensitivityAnalysis();
      
      // Ensure button listener is attached when view is shown
      const sensitivityBtn = document.getElementById('run-sensitivity-btn');
      if (sensitivityBtn) {
        console.log('Attaching sensitivity button listener in view init');
        sensitivityBtn.onclick = function() {
          console.log('Sensitivity button clicked via onclick');
          runSensitivityAnalysis();
        };
      }
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

  // Calculate construction cost per unit
  function calculateConstructionCostPerUnit() {
    const totalUnits = calculateTotalUnits() || 1;
    const totalConstructionCost = state.totalArea * state.constructionCostPerSqm;
    return totalConstructionCost / totalUnits;
  }

  // Calculate average unit size based on current mix
  function calculateAverageUnitSize() {
    let totalWeightedSize = 0;
    let totalPercentage = 0;
    
    state.unitTypes.forEach((type) => {
      const percentage = state.unitMixRatios[type.id] || 0;
      totalWeightedSize += type.area * (percentage / 100);
      totalPercentage += percentage;
    });
    
    return totalPercentage > 0 ? totalWeightedSize / (totalPercentage / 100) : 30; // Default to 30m² if no mix set
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
        
        <div class="bg-blue-50 border border-blue-100 rounded p-2 mb-3" style="min-height: 60px;">
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
              class="flex-1 unit-mix-slider"
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
          <div class="mt-1" style="min-height: 20px;">
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
            class="border rounded px-2 py-1 w-20 unit-price-input"
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

    // Update new key metrics
    elements.annualROIDisplay.textContent = `${roi.toFixed(1)}%`;
    
    // Break-even timeline calculation
    const totalInvestment = (state.totalArea * 350) || 525000; // Default construction cost per m²
    const breakevenYears = totalInvestment > 0 && annualNOI > 0 ? totalInvestment / annualNOI : 0;
    elements.breakevenTimelineDisplay.textContent = breakevenYears > 0 ? `${breakevenYears.toFixed(1)} years` : "N/A";
    
    // Cost per square meter calculation
    const monthlyCostPerSqm = monthlyExpenses / state.totalArea;
    elements.costPerSqmDisplay.textContent = `€${monthlyCostPerSqm.toFixed(2)}/m²`;
    
    // Construction cost per unit calculation
    const constructionCostPerUnit = calculateConstructionCostPerUnit();
    elements.constructionCostPerUnitDisplay.textContent = formatCurrency(constructionCostPerUnit);
    
    // Total investment display
    elements.totalInvestmentDisplay.textContent = formatCurrency(state.totalInvestment);

    // Update operating expenses (OpEx ratio calculation)
    updateOperatingExpenses();
  }

  // Update unit summary table
  function updateSummaryTable() {
    console.log('updateSummaryTable called', elements.unitSummaryTable, state.unitTypes);
    
    if (!elements.unitSummaryTable) {
      console.error('unitSummaryTable element not found');
      return;
    }
    
    elements.unitSummaryTable.innerHTML = "";

    // Add rows for each unit type
    state.unitTypes.forEach((type) => {
      console.log('Processing unit type:', type);
      
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

  // Initialize lease-up chart
  function initLeaseupChart() {
    const leaseupChartContainer = document.getElementById("leaseup-chart");
    
    if (!leaseupChartContainer) {
      console.error("Lease-up chart container not found");
      return;
    }

    // Clear container and create canvas
    leaseupChartContainer.innerHTML = "<canvas></canvas>";
    const leaseupCtx = leaseupChartContainer.querySelector("canvas").getContext("2d");

    // Prepare lease-up timeline data
    const leaseupData = calculateLeaseupTimeline();

    leaseupChart = new Chart(leaseupCtx, {
      type: "line",
      data: {
        labels: leaseupData.map(item => `Month ${item.month}`),
        datasets: [
          {
            label: "Monthly Revenue (€)",
            data: leaseupData.map(item => item.revenue),
            borderColor: "#2563eb",
            backgroundColor: "#2563eb20",
            fill: true,
            tension: 0.4,
          },
          {
            label: "Occupancy %",
            data: leaseupData.map(item => item.occupancy * 100),
            borderColor: "#22c55e",
            backgroundColor: "#22c55e20",
            fill: false,
            tension: 0.4,
            yAxisID: 'y1',
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Monthly Revenue (€)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Occupancy %'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                if (label === 'Monthly Revenue (€)') {
                  return `${label}: ${formatCurrency(context.raw)}`;
                } else {
                  return `${label}: ${context.raw.toFixed(1)}%`;
                }
              }
            }
          }
        }
      },
    });
  }

  // Calculate lease-up timeline data
  function calculateLeaseupTimeline() {
    const totalUnits = state.unitTypes.reduce((sum, type) => sum + type.count, 0);
    if (totalUnits === 0) return [];

    const timeline = [];
    let currentUnits = 0;
    let month = 0;

    // Calculate monthly revenue potential at full occupancy
    const fullMonthlyRevenue = state.monthlyRevenue / state.occupancyRate;

    while (currentUnits < totalUnits && month <= 60) { // Cap at 5 years
      month++;
      
      // Calculate units leased this month
      let unitsThisMonth;
      if (month <= state.rampupMonths) {
        // Ramp-up period: gradually increase lease rate
        const rampFactor = month / state.rampupMonths;
        unitsThisMonth = Math.round(state.leaseupRate * rampFactor);
      } else {
        // Steady state leasing
        unitsThisMonth = state.leaseupRate;
      }

      // Don't exceed total units
      currentUnits = Math.min(currentUnits + unitsThisMonth, totalUnits);
      
      const occupancy = currentUnits / totalUnits;
      const monthlyRevenue = fullMonthlyRevenue * occupancy;

      timeline.push({
        month,
        units: currentUnits,
        occupancy,
        revenue: monthlyRevenue,
        unitsLeased: unitsThisMonth
      });

      // Stop if we've reached full occupancy
      if (currentUnits >= totalUnits) break;
    }

    return timeline;
  }

  // Update lease-up analysis
  function updateLeaseupAnalysis() {
    const timeline = calculateLeaseupTimeline();
    const totalUnits = state.unitTypes.reduce((sum, type) => sum + type.count, 0);
    
    if (totalUnits === 0 || timeline.length === 0) {
      elements.breakevenTimeline.textContent = "N/A";
      elements.targetOccupancyTimeline.textContent = "N/A";
      elements.leaseupMilestonesTable.innerHTML = "";
      return;
    }

    // Calculate break-even timeline
    const monthlyExpenses = state.monthlyRevenue * state.expenseRatio / state.occupancyRate;
    const breakevenMonth = timeline.find(item => item.revenue >= monthlyExpenses);
    elements.breakevenTimeline.textContent = breakevenMonth 
      ? `${breakevenMonth.month} months`
      : "Beyond projection";

    // Calculate 80% occupancy timeline
    const targetOccupancyMonth = timeline.find(item => item.occupancy >= 0.8);
    elements.targetOccupancyTimeline.textContent = targetOccupancyMonth
      ? `${targetOccupancyMonth.month} months`
      : "Beyond projection";

    // Update milestones table
    updateLeaseupMilestonesTable(timeline);

    // Update chart if it exists
    if (leaseupChart) {
      leaseupChart.data.labels = timeline.map(item => `Month ${item.month}`);
      leaseupChart.data.datasets[0].data = timeline.map(item => item.revenue);
      leaseupChart.data.datasets[1].data = timeline.map(item => item.occupancy * 100);
      leaseupChart.update();
    }
  }

  // Update lease-up milestones table
  function updateLeaseupMilestonesTable(timeline) {
    elements.leaseupMilestonesTable.innerHTML = "";

    const milestones = [
      { label: "25% Occupancy", target: 0.25 },
      { label: "50% Occupancy", target: 0.50 },
      { label: "75% Occupancy", target: 0.75 },
      { label: "80% Occupancy", target: 0.80 },
      { label: "90% Occupancy", target: 0.90 },
    ];

    milestones.forEach(milestone => {
      const milestoneMonth = timeline.find(item => item.occupancy >= milestone.target);
      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";

      const timelineText = milestoneMonth 
        ? `${milestoneMonth.month} months` 
        : "Beyond projection";
      
      const revenueText = milestoneMonth 
        ? formatCurrency(milestoneMonth.revenue)
        : "€0.00";

      row.innerHTML = `
        <td class="px-4 py-2 text-sm text-gray-700">${milestone.label}</td>
        <td class="px-4 py-2 text-sm text-gray-700">${timelineText}</td>
        <td class="px-4 py-2 text-sm text-gray-700">${revenueText}</td>
      `;

      elements.leaseupMilestonesTable.appendChild(row);
    });
  }

  // Update market analysis
  function updateMarketAnalysis() {
    // Update state from inputs
    state.siteAddress = elements.siteAddressInput.value;
    state.populationDensity = parseInt(elements.populationDensityInput.value) || 2500;
    state.medianIncome = parseInt(elements.medianIncomeInput.value) || 45000;
    state.housingTurnover = parseInt(elements.housingTurnoverInput.value) || 12;
    state.distanceToCenter = parseInt(elements.distanceCenterInput.value) || 8;
    state.competingFacilities = parseInt(elements.competingFacilitiesInput.value) || 3;
    state.competitorPrice = parseInt(elements.competitorPriceInput.value) || 180;
    state.marketOccupancy = parseInt(elements.marketOccupancyInput.value) || 82;

    // Update site characteristics
    state.siteCharacteristics = {
      highwayAccess: elements.highwayAccessCb.checked,
      truckAccess: elements.truckAccessCb.checked,
      visibility: elements.visibilityCb.checked,
      existingBuilding: elements.existingBuildingCb.checked,
    };

    // Update demand drivers
    state.demandDrivers = {
      newDevelopments: elements.newDevelopmentsCb.checked,
      businessDistrict: elements.businessDistrictCb.checked,
      militaryBase: elements.militaryBaseCb.checked,
      seasonalTourism: elements.seasonalTourismCb.checked,
    };

    // Calculate scores
    const demographicsScore = calculateDemographicsScore();
    const competitionScore = calculateCompetitionScore();
    const siteQualityScore = calculateSiteQualityScore();
    const overallScore = Math.round((demographicsScore + competitionScore + siteQualityScore) / 3);

    // Update displays
    updateScoreDisplays(demographicsScore, competitionScore, siteQualityScore, overallScore);
    updateMarketMetrics();
    updateRecommendations();
  }

  // Calculate demographics score (0-100)
  function calculateDemographicsScore() {
    let score = 0;

    // Population density (0-30 points)
    if (state.populationDensity >= 3000) score += 30;
    else if (state.populationDensity >= 2000) score += 25;
    else if (state.populationDensity >= 1000) score += 20;
    else if (state.populationDensity >= 500) score += 15;
    else score += 10;

    // Median income (0-25 points)
    if (state.medianIncome >= 60000) score += 25;
    else if (state.medianIncome >= 45000) score += 20;
    else if (state.medianIncome >= 35000) score += 15;
    else if (state.medianIncome >= 25000) score += 10;
    else score += 5;

    // Housing turnover (0-20 points)
    if (state.housingTurnover >= 15) score += 20;
    else if (state.housingTurnover >= 12) score += 18;
    else if (state.housingTurnover >= 10) score += 15;
    else if (state.housingTurnover >= 8) score += 12;
    else score += 8;

    // Distance to center (0-15 points)
    if (state.distanceToCenter <= 5) score += 15;
    else if (state.distanceToCenter <= 10) score += 12;
    else if (state.distanceToCenter <= 15) score += 10;
    else if (state.distanceToCenter <= 25) score += 8;
    else score += 5;

    // Demand drivers bonus (0-10 points)
    const driverCount = Object.values(state.demandDrivers).filter(Boolean).length;
    score += driverCount * 2.5;

    return Math.min(100, Math.round(score));
  }

  // Calculate competition score (0-100)
  function calculateCompetitionScore() {
    let score = 50; // Base score

    // Competition density (adjust based on facilities per area)
    const facilitiesPerKm = state.competingFacilities / (Math.PI * 5 * 5); // 5km radius
    if (facilitiesPerKm <= 0.02) score += 30; // Very low competition
    else if (facilitiesPerKm <= 0.04) score += 20; // Low competition
    else if (facilitiesPerKm <= 0.06) score += 10; // Moderate competition
    else if (facilitiesPerKm <= 0.08) score += 0; // High competition
    else score -= 15; // Very high competition

    // Market occupancy (higher occupancy = more demand but also more competition)
    if (state.marketOccupancy >= 90) score += 10; // High demand market
    else if (state.marketOccupancy >= 80) score += 15; // Strong demand
    else if (state.marketOccupancy >= 70) score += 10; // Moderate demand
    else if (state.marketOccupancy >= 60) score += 5; // Weak demand
    else score -= 10; // Very weak demand

    // Price level analysis
    const avgPricePerSqm = state.competitorPrice / 10; // Convert to per sqm
    if (avgPricePerSqm >= 25) score += 10; // Premium market
    else if (avgPricePerSqm >= 20) score += 5; // Good pricing
    else if (avgPricePerSqm >= 15) score += 0; // Average pricing
    else score -= 5; // Low pricing market

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Calculate site quality score (0-100)
  function calculateSiteQualityScore() {
    let score = 20; // Base score

    // Site characteristics
    if (state.siteCharacteristics.highwayAccess) score += 25;
    if (state.siteCharacteristics.truckAccess) score += 20;
    if (state.siteCharacteristics.visibility) score += 15;
    if (state.siteCharacteristics.existingBuilding) score += 10;

    // Location bonus based on distance to center
    if (state.distanceToCenter <= 5) score += 10;
    else if (state.distanceToCenter <= 15) score += 5;

    return Math.min(100, Math.round(score));
  }

  // Update score displays
  function updateScoreDisplays(demographics, competition, siteQuality, overall) {
    // Update individual scores
    elements.demographicsScore.textContent = demographics;
    elements.demographicsBar.style.width = `${demographics}%`;
    
    elements.competitionScore.textContent = competition;
    elements.competitionBar.style.width = `${competition}%`;
    
    elements.siteQualityScore.textContent = siteQuality;
    elements.siteQualityBar.style.width = `${siteQuality}%`;

    // Update overall score
    elements.viabilityScore.textContent = overall;
    elements.viabilityBar.style.width = `${overall}%`;

    // Update recommendation
    updateViabilityRecommendation(overall);
  }

  // Update viability recommendation
  function updateViabilityRecommendation(score) {
    const recommendation = elements.viabilityRecommendation;
    
    if (score >= 80) {
      recommendation.className = "mt-4 p-3 rounded bg-green-50 border border-green-200";
      recommendation.innerHTML = `
        <p class="font-medium text-green-800 mb-1">✓ Excellent Site</p>
        <p class="text-sm text-gray-700">
          This location shows exceptional potential for a self-storage facility. Strong demographics, favorable competition, and excellent site characteristics.
        </p>
      `;
    } else if (score >= 61) {
      recommendation.className = "mt-4 p-3 rounded bg-blue-50 border border-blue-200";
      recommendation.innerHTML = `
        <p class="font-medium text-blue-800 mb-1">✓ Good Site</p>
        <p class="text-sm text-gray-700">
          This location shows strong potential for a self-storage facility. Consider addressing any weak areas identified in the analysis.
        </p>
      `;
    } else if (score >= 41) {
      recommendation.className = "mt-4 p-3 rounded bg-yellow-50 border border-yellow-200";
      recommendation.innerHTML = `
        <p class="font-medium text-yellow-800 mb-1">⚠ Marginal Site</p>
        <p class="text-sm text-gray-700">
          This location has mixed potential. Significant improvements or market changes would be needed for success.
        </p>
      `;
    } else {
      recommendation.className = "mt-4 p-3 rounded bg-red-50 border border-red-200";
      recommendation.innerHTML = `
        <p class="font-medium text-red-800 mb-1">✗ Poor Site</p>
        <p class="text-sm text-gray-700">
          This location shows significant challenges for a self-storage facility. Consider alternative locations or major market changes.
        </p>
      `;
    }
  }

  // Update market metrics
  function updateMarketMetrics() {
    // Calculate demand index
    const populationFactor = Math.min(state.populationDensity / 2500, 2);
    const incomeFactor = Math.min(state.medianIncome / 45000, 1.5);
    const turnoverFactor = Math.min(state.housingTurnover / 12, 1.5);
    const demandIndex = (populationFactor * incomeFactor * turnoverFactor).toFixed(1);
    elements.demandIndex.textContent = `${demandIndex}x`;

    // Calculate supply gap (simplified)
    const expectedDemand = Math.round(state.populationDensity * 0.5); // 0.5 units per 1000 people
    const currentSupply = state.competingFacilities * 150; // Assume 150 units per facility
    const supplyGap = expectedDemand - currentSupply;
    elements.supplyGap.textContent = supplyGap > 0 ? `+${supplyGap} units` : `${supplyGap} units`;

    // Calculate price premium potential
    const marketStrength = (state.marketOccupancy - 70) / 2; // Base from 70% occupancy
    const competitionFactor = Math.max(0, 5 - state.competingFacilities);
    const pricePremium = Math.round(marketStrength + competitionFactor);
    elements.pricePremium.textContent = pricePremium > 0 ? `+${pricePremium}%` : `${pricePremium}%`;

    // Break-even risk assessment
    const overallScore = parseInt(elements.viabilityScore.textContent);
    let riskLevel;
    if (overallScore >= 80) riskLevel = "Very Low";
    else if (overallScore >= 65) riskLevel = "Low";
    else if (overallScore >= 50) riskLevel = "Medium";
    else if (overallScore >= 35) riskLevel = "High";
    else riskLevel = "Very High";
    elements.breakevenRisk.textContent = riskLevel;
  }

  // Update recommendations
  function updateRecommendations() {
    const recommendations = [];
    const risks = [];

    // Strategic recommendations based on analysis
    if (state.medianIncome >= 50000) {
      recommendations.push("Consider premium pricing strategy for high-income area");
    } else {
      recommendations.push("Focus on value pricing to match local income levels");
    }

    if (state.populationDensity >= 3000) {
      recommendations.push("Emphasize smaller units (5-10m²) for dense urban area");
    } else {
      recommendations.push("Include larger units (15-20m²) for suburban market");
    }

    if (state.competingFacilities <= 2) {
      recommendations.push("Price 5-15% above market due to limited competition");
    } else {
      recommendations.push("Match competitor pricing initially to gain market share");
    }

    if (state.demandDrivers.militaryBase || state.demandDrivers.businessDistrict) {
      recommendations.push("Market heavily to business customers for stable long-term rentals");
    }

    // Risk factors
    if (state.competingFacilities >= 4) {
      risks.push("High competition may limit pricing power and occupancy");
    }

    if (state.marketOccupancy < 75) {
      risks.push("Low market occupancy suggests weak local demand");
    }

    if (!state.siteCharacteristics.highwayAccess) {
      risks.push("Limited highway access may reduce customer convenience");
    }

    if (state.distanceToCenter > 20) {
      risks.push("Distance from urban center may limit customer base");
    }

    // Update displays
    updateRecommendationsList(elements.strategicRecommendations, recommendations, "green");
    updateRecommendationsList(elements.riskFactors, risks, "yellow");
  }

  // Update recommendations list
  function updateRecommendationsList(container, items, color) {
    container.innerHTML = "";
    
    if (items.length === 0) {
      const item = document.createElement("div");
      item.className = "flex items-start";
      item.innerHTML = `
        <span class="text-gray-500 mr-2">•</span>
        <span>No specific recommendations at this time</span>
      `;
      container.appendChild(item);
      return;
    }

    items.forEach(text => {
      const item = document.createElement("div");
      item.className = "flex items-start";
      const colorClass = color === "green" ? "text-green-600" : "text-yellow-600";
      const symbol = color === "green" ? "•" : "⚠";
      
      item.innerHTML = `
        <span class="${colorClass} mr-2">${symbol}</span>
        <span>${text}</span>
      `;
      container.appendChild(item);
    });
  }

  // Supplier filtering and search functions
  function setSupplierFilter(category) {
    currentFilter = category;
    
    // Update button states
    document.querySelectorAll('[id^="filter-"]').forEach(btn => {
      btn.classList.remove("bg-blue-600", "text-white");
      btn.classList.add("bg-gray-200", "text-gray-800");
    });
    
    document.getElementById(`filter-${category}`).classList.remove("bg-gray-200", "text-gray-800");
    document.getElementById(`filter-${category}`).classList.add("bg-blue-600", "text-white");
    
    renderSuppliers();
  }

  function handleSupplierSearch(e) {
    currentSearchTerm = e.target.value.toLowerCase();
    renderSuppliers();
  }

  function filterSuppliers() {
    return suppliersData.filter(supplier => {
      // Category filter
      const categoryMatch = currentFilter === "all" || supplier.category === currentFilter;
      
      // Search filter
      const searchMatch = currentSearchTerm === "" || 
        supplier.name.toLowerCase().includes(currentSearchTerm) ||
        supplier.description.toLowerCase().includes(currentSearchTerm) ||
        supplier.specialties.some(specialty => specialty.toLowerCase().includes(currentSearchTerm));
      
      return categoryMatch && searchMatch;
    });
  }

  function renderSuppliers() {
    const filteredSuppliers = filterSuppliers();
    elements.suppliersGrid.innerHTML = "";
    
    if (filteredSuppliers.length === 0) {
      elements.suppliersGrid.innerHTML = `
        <div class="col-span-full text-center py-8 text-gray-500">
          <p class="text-lg mb-2">No suppliers found</p>
          <p class="text-sm">Try adjusting your search terms or category filter</p>
        </div>
      `;
      return;
    }
    
    filteredSuppliers.forEach(supplier => {
      const supplierCard = createSupplierCard(supplier);
      elements.suppliersGrid.appendChild(supplierCard);
    });
  }

  function createSupplierCard(supplier) {
    const card = document.createElement("div");
    card.className = "bg-white border rounded-lg p-4 hover:shadow-md transition-shadow";
    
    const stars = "★".repeat(Math.floor(supplier.rating)) + "☆".repeat(5 - Math.floor(supplier.rating));
    const specialtiesList = supplier.specialties.slice(0, 3).join(", ");
    const moreSpecialties = supplier.specialties.length > 3 ? ` +${supplier.specialties.length - 3} more` : "";
    
    card.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center">
          <span class="text-2xl mr-3">${supplier.logo}</span>
          <div>
            <h4 class="font-medium text-gray-900">${supplier.name}</h4>
            <div class="flex items-center text-sm text-gray-600">
              <span class="text-yellow-500 mr-1">${stars}</span>
              <span>${supplier.rating}</span>
              <span class="ml-2 text-gray-400">•</span>
              <span class="ml-2">${supplier.location}</span>
            </div>
          </div>
        </div>
        <span class="text-sm font-medium text-green-600">${supplier.priceRange}</span>
      </div>
      
      <p class="text-sm text-gray-700 mb-3">${supplier.description}</p>
      
      <div class="mb-3">
        <p class="text-xs text-gray-600 mb-1">Specialties:</p>
        <p class="text-sm text-blue-600">${specialtiesList}${moreSpecialties}</p>
      </div>
      
      <div class="flex justify-between items-center">
        <div class="text-xs text-gray-500">
          <p>📞 ${supplier.phone}</p>
        </div>
        <div class="space-x-2">
          <a 
            href="${supplier.website}" 
            target="_blank" 
            class="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            Website
          </a>
          <a 
            href="${supplier.affiliateLink}" 
            target="_blank" 
            class="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onclick="trackAffiliateClick('${supplier.name}')"
          >
            Get Quote
          </a>
        </div>
      </div>
    `;
    
    return card;
  }

  function updateRecommendedSuppliers() {
    // Update facility size display
    elements.recFacilitySize.textContent = `${state.totalArea}m²`;
    
    // Determine facility size category
    let sizeCategory;
    if (state.totalArea < 800) sizeCategory = "small";
    else if (state.totalArea < 2000) sizeCategory = "medium";
    else sizeCategory = "large";
    
    // Get top recommendations for this project
    const recommendations = getRecommendationsForProject(sizeCategory);
    
    elements.recommendedSuppliers.innerHTML = "";
    
    recommendations.forEach(supplier => {
      const recCard = document.createElement("div");
      recCard.className = "border border-blue-200 rounded-lg p-3 bg-blue-50";
      
      recCard.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-lg mr-2">${supplier.logo}</span>
            <div>
              <h5 class="font-medium text-gray-900 text-sm">${supplier.name}</h5>
              <p class="text-xs text-gray-600">${supplier.category.charAt(0).toUpperCase() + supplier.category.slice(1)} • ${supplier.priceRange}</p>
            </div>
          </div>
          <a 
            href="${supplier.affiliateLink}" 
            target="_blank" 
            class="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onclick="trackAffiliateClick('${supplier.name}', 'recommended')"
          >
            Get Quote
          </a>
        </div>
        <p class="text-xs text-gray-700 mt-2">${supplier.description}</p>
      `;
      
      elements.recommendedSuppliers.appendChild(recCard);
    });
  }

  function getRecommendationsForProject(sizeCategory) {
    // Get top-rated suppliers for each essential category, filtered by facility size
    const essentialCategories = ["construction", "security", "doors", "management"];
    const recommendations = [];
    
    essentialCategories.forEach(category => {
      const categorySuppliers = suppliersData.filter(supplier => 
        supplier.category === category && 
        supplier.forFacilitySize.includes(sizeCategory)
      );
      
      if (categorySuppliers.length > 0) {
        // Sort by rating and take the top one
        const topSupplier = categorySuppliers.sort((a, b) => b.rating - a.rating)[0];
        recommendations.push(topSupplier);
      }
    });
    
    return recommendations;
  }

  function trackAffiliateClick(supplierName, source = 'grid') {
    // Analytics tracking for affiliate clicks
    console.log(`Affiliate click tracked: ${supplierName} from ${source}`);
    
    // Here you would typically send this data to your analytics service
    // For example:
    // gtag('event', 'affiliate_click', {
    //   'supplier_name': supplierName,
    //   'source': source,
    //   'facility_size': state.totalArea
    // });
    
    // You could also track conversion data, revenue, etc.
  }

  // Consultation modal and contact functions
  function openConsultationModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modalOverlay.id = 'consultation-modal';
    
    // Create modal content
    modalOverlay.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 relative">
        <button 
          onclick="closeConsultationModal()" 
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
        
        <div class="mb-4">
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-3">👨‍💼</span>
            <h3 class="text-lg font-semibold text-gray-800">Schedule Your Consultation</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            Get expert guidance tailored to your specific self-storage project. I'll help you avoid costly mistakes and maximize your success.
          </p>
        </div>

        <form id="consultation-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input 
              type="text" 
              id="client-name" 
              required
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              id="client-email" 
              required
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              id="client-phone" 
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Location</label>
            <input 
              type="text" 
              id="project-location" 
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City, State/Country"
              value="${state.siteAddress}"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Stage</label>
            <select 
              id="project-stage" 
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your current stage</option>
              <option value="site-search">Looking for a site</option>
              <option value="site-evaluation">Evaluating a specific site</option>
              <option value="planning">Planning and design phase</option>
              <option value="permits">Permitting and approvals</option>
              <option value="construction">Ready for construction</option>
              <option value="operations">Setting up operations</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Planned Facility Size</label>
            <input 
              type="text" 
              id="planned-size" 
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1500 m² or 50 units"
              value="${state.totalArea}m²"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Areas Where You Need Help</label>
            <div class="space-y-2 text-sm">
              <label class="flex items-center">
                <input type="checkbox" class="mr-2" value="site-selection"> Site selection and evaluation
              </label>
              <label class="flex items-center">
                <input type="checkbox" class="mr-2" value="financial-planning"> Financial planning and modeling
              </label>
              <label class="flex items-center">
                <input type="checkbox" class="mr-2" value="permitting"> Permitting and zoning
              </label>
              <label class="flex items-center">
                <input type="checkbox" class="mr-2" value="construction"> Construction planning
              </label>
              <label class="flex items-center">
                <input type="checkbox" class="mr-2" value="operations"> Operations setup
              </label>
              <label class="flex items-center">
                <input type="checkbox" class="mr-2" value="marketing"> Marketing and leasing
              </label>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
            <textarea 
              id="additional-details" 
              rows="3"
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell me more about your project, timeline, or specific questions..."
            ></textarea>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button 
              type="button" 
              onclick="closeConsultationModal()"
              class="flex-1 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    `;
    
    // Add modal to page
    document.body.appendChild(modalOverlay);
    
    // Set up form submission
    document.getElementById('consultation-form').addEventListener('submit', handleConsultationSubmission);
    
    // Focus first input
    document.getElementById('client-name').focus();
  }

  function closeConsultationModal() {
    const modal = document.getElementById('consultation-modal');
    if (modal) {
      modal.remove();
    }
  }

  function handleConsultationSubmission(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
      name: document.getElementById('client-name').value,
      email: document.getElementById('client-email').value,
      phone: document.getElementById('client-phone').value,
      location: document.getElementById('project-location').value,
      stage: document.getElementById('project-stage').value,
      size: document.getElementById('planned-size').value,
      helpAreas: Array.from(document.querySelectorAll('#consultation-form input[type="checkbox"]:checked'))
                     .map(cb => cb.value),
      details: document.getElementById('additional-details').value,
      facilityData: {
        totalArea: state.totalArea,
        unitMix: state.unitMixRatios,
        monthlyRevenue: state.monthlyRevenue,
        viabilityScore: document.getElementById('viability-score')?.textContent || 'N/A'
      }
    };
    
    // Here you would typically send this data to your backend/CRM
    console.log('Consultation request:', formData);
    
    // For demonstration, we'll create a mailto link with the data
    const emailBody = createConsultationEmail(formData);
    const mailtoLink = `mailto:your-email@example.com?subject=Self-Storage Consultation Request - ${formData.name}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message and close modal
    showConsultationSuccess();
    closeConsultationModal();
  }

  function createConsultationEmail(data) {
    return `
New Self-Storage Consultation Request

Client Information:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Project Location: ${data.location}

Project Details:
- Current Stage: ${data.stage}
- Planned Facility Size: ${data.size}
- Areas Needing Help: ${data.helpAreas.join(', ')}

Current Planning Data:
- Total Area: ${data.facilityData.totalArea}m²
- Projected Monthly Revenue: €${data.facilityData.monthlyRevenue.toFixed(2)}
- Market Viability Score: ${data.facilityData.viabilityScore}

Additional Details:
${data.details}

---
This request was generated from the StorageFacilitator planning tool.
    `.trim();
  }

  function showConsultationSuccess() {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="text-lg mr-2">✅</span>
        <div>
          <p class="font-medium">Request Sent!</p>
          <p class="text-sm text-green-100">I'll get back to you within 24 hours.</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
    
    // Track the consultation request
    console.log('Consultation request tracked');
    // Here you could send analytics data:
    // gtag('event', 'consultation_request', {
    //   'facility_size': state.totalArea,
    //   'monthly_revenue': state.monthlyRevenue
    // });
  }

  // Make functions available globally for onclick handlers
  window.closeConsultationModal = closeConsultationModal;

  // Initialize the application
  // Helper function to calculate total units
  function calculateTotalUnits() {
    return state.unitTypes.reduce((sum, type) => sum + type.count, 0);
  }

  // Helper function to calculate monthly revenue at full occupancy
  function calculateMonthlyRevenue() {
    if (state.monthlyRevenue === 0) {
      // Return a default value based on typical self-storage metrics
      const defaultRevenue = state.totalArea * 15; // €15 per m² average
      return defaultRevenue;
    }
    
    // Return the actual monthly revenue at full occupancy
    // This should represent what the facility makes at 100% occupancy
    return state.monthlyRevenue;
  }

  // Cash Flow Analysis Functions
  function updateCashFlowAnalysis() {
    console.log('updateCashFlowAnalysis called');
    if (!elements.initialInvestmentInput) {
      console.error('Cash flow elements not found');
      return;
    }
    const initialInvestment = parseFloat(elements.initialInvestmentInput.value) || 750000;
    const workingCapital = parseFloat(elements.workingCapitalInput.value) || 75000;
    const loanAmount = parseFloat(elements.loanAmountInput.value) || 500000;
    const interestRate = parseFloat(elements.interestRateInput.value) || 5.5;
    const loanTerm = parseInt(elements.loanTermInput.value) || 20;
    
    console.log('Cash flow inputs:', { initialInvestment, workingCapital, loanAmount, interestRate, loanTerm });

    // Calculate monthly loan payment
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    const monthlyPayment = loanAmount > 0 ? 
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;

    // Generate 5-year cash flow projection
    const cashFlowData = [];
    let cumulativeCash = -(initialInvestment - loanAmount + workingCapital);
    
    const totalUnits = calculateTotalUnits();
    const baseRevenue = calculateMonthlyRevenue();
    console.log('Cash flow debug values:');
    console.log('- totalUnits:', totalUnits);
    console.log('- state.monthlyRevenue:', state.monthlyRevenue);
    console.log('- state.occupancyRate:', state.occupancyRate);
    console.log('- baseMonthlyRevenue:', baseRevenue);
    console.log('- leaseupRate:', state.leaseupRate);
    console.log('- rampupMonths:', state.rampupMonths);
    
    for (let month = 1; month <= 60; month++) {
      // Revenue calculation with lease-up curve
      const occupancyRate = calculateOccupancyForMonth(month);
      const baseMonthlyRevenue = calculateMonthlyRevenue();
      const monthlyRevenue = baseMonthlyRevenue * (occupancyRate / 100);
      
      // Debug first 12 months to see the transition
      if (month <= 3) {
        console.log(`Month ${month}:`);
        console.log(`  - Occupancy: ${occupancyRate.toFixed(1)}%`);
        console.log(`  - Base revenue: €${baseMonthlyRevenue.toFixed(0)}`);
        console.log(`  - Monthly revenue: €${monthlyRevenue.toFixed(0)}`);
      }
      
      // Operating expenses
      const monthlyExpenses = monthlyRevenue * (state.expenseRatio / 100);
      
      // Net operating income
      const noi = monthlyRevenue - monthlyExpenses;
      
      // Net cash flow (after debt service)
      const netCashFlow = noi - monthlyPayment;
      cumulativeCash += netCashFlow;
      
      cashFlowData.push({
        month,
        year: Math.ceil(month / 12),
        monthlyRevenue,
        monthlyExpenses,
        noi,
        debtService: monthlyPayment,
        netCashFlow,
        cumulativeCash,
        occupancyRate
      });
    }

    // Update cash flow chart
    initCashFlowChart(cashFlowData);
    
    // Update summary table
    updateCashFlowSummaryTable(cashFlowData);
    
    // Update key metrics
    updateCashFlowMetrics(cashFlowData);
  }

  function calculateOccupancyForMonth(month) {
    // Use the same lease-up logic as the existing timeline
    const rampupMonths = state.rampupMonths || 6;
    const leaseupRate = state.leaseupRate || 8;
    const totalUnits = calculateTotalUnits() || 100;
    const targetOccupancy = state.occupancyRate || 85;
    
    let currentUnits = 0;
    
    // Calculate cumulative units leased up to this month
    for (let m = 1; m <= month; m++) {
      let unitsThisMonth;
      if (m <= rampupMonths) {
        // Ramp-up period: gradually increase lease rate
        const rampFactor = m / rampupMonths;
        unitsThisMonth = Math.round(leaseupRate * rampFactor);
      } else {
        // Steady state leasing
        unitsThisMonth = leaseupRate;
      }
      
      currentUnits = Math.min(currentUnits + unitsThisMonth, totalUnits * (targetOccupancy / 100));
      
      // Stop if we've reached target occupancy
      if (currentUnits >= totalUnits * (targetOccupancy / 100)) break;
    }
    
    return Math.min((currentUnits / totalUnits) * 100, targetOccupancy);
  }

  function initCashFlowChart(cashFlowData) {
    console.log('initCashFlowChart called with data:', cashFlowData.length, 'months');
    const chartContainer = document.getElementById("cashflow-chart");
    if (!chartContainer) {
      console.error('Cash flow chart container not found');
      return;
    }

    // Clear container and create canvas
    chartContainer.innerHTML = "<canvas></canvas>";
    const ctx = chartContainer.querySelector("canvas").getContext("2d");

    // Prepare chart data
    const labels = cashFlowData.map(d => `M${d.month}`);
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Cash Flow',
          data: cashFlowData.map(d => d.netCashFlow),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: false,
          tension: 0.1
        }, {
          label: 'Cumulative Cash',
          data: cashFlowData.map(d => d.cumulativeCash),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.1,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            position: 'left',
            title: {
              display: true,
              text: 'Monthly Cash Flow (€)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Cumulative Cash (€)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        plugins: {
          title: {
            display: true,
            text: '5-Year Cash Flow Projection'
          },
          legend: {
            display: true
          }
        }
      }
    });
  }

  function updateCashFlowSummaryTable(cashFlowData) {
    const tableBody = elements.cashflowSummaryTable;
    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Group by year and calculate annual totals
    for (let year = 1; year <= 5; year++) {
      const yearData = cashFlowData.filter(d => d.year === year);
      const annualRevenue = yearData.reduce((sum, d) => sum + d.monthlyRevenue, 0);
      const annualExpenses = yearData.reduce((sum, d) => sum + d.monthlyExpenses, 0);
      const annualDebtService = yearData.reduce((sum, d) => sum + d.debtService, 0);
      const annualNetCash = yearData.reduce((sum, d) => sum + d.netCashFlow, 0);
      const yearEndCumulative = yearData[yearData.length - 1].cumulativeCash;

      const row = document.createElement('tr');
      row.className = 'border-b hover:bg-gray-50';
      row.innerHTML = `
        <td class="px-4 py-2 text-sm text-gray-700 font-medium">Year ${year}</td>
        <td class="px-4 py-2 text-sm text-gray-700">€${annualRevenue.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
        <td class="px-4 py-2 text-sm text-gray-700">€${annualExpenses.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
        <td class="px-4 py-2 text-sm text-gray-700">€${annualDebtService.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
        <td class="px-4 py-2 text-sm font-medium ${annualNetCash >= 0 ? 'text-green-600' : 'text-red-600'}">
          €${annualNetCash.toLocaleString('en-US', {maximumFractionDigits: 0})}
        </td>
        <td class="px-4 py-2 text-sm font-medium ${yearEndCumulative >= 0 ? 'text-green-600' : 'text-red-600'}">
          €${yearEndCumulative.toLocaleString('en-US', {maximumFractionDigits: 0})}
        </td>
      `;
      tableBody.appendChild(row);
    }
  }

  function updateCashFlowMetrics(cashFlowData) {
    // Find when monthly cash flow turns positive
    const cashPositiveIndex = cashFlowData.findIndex(d => d.netCashFlow > 0);
    const cashPositiveMonth = cashPositiveIndex >= 0 ? cashPositiveIndex + 1 : 0;
    
    // Find when cumulative cash turns positive
    const cumulativePositiveIndex = cashFlowData.findIndex(d => d.cumulativeCash > 0);
    const cumulativePositiveMonth = cumulativePositiveIndex >= 0 ? cumulativePositiveIndex + 1 : 0;
    
    // 5-year cash position
    const fiveYearCash = cashFlowData[59].cumulativeCash; // Month 60
    
    // Update display
    elements.cashPositiveMonth.textContent = cashPositiveMonth > 0 ? `Month ${cashPositiveMonth}` : 'Not within 5 years';
    elements.cumulativePositiveMonth.textContent = cumulativePositiveMonth > 0 ? `Month ${cumulativePositiveMonth}` : 'Not within 5 years';
    elements.fiveYearCash.textContent = `€${fiveYearCash.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
  }

  // Sensitivity Analysis Functions
  function updateSensitivityAnalysis() {
    // This will be called when sensitivity analysis is run
    console.log('Sensitivity analysis initialized');
  }

  function runSensitivityAnalysis() {
    try {
      const rentMin = parseFloat(elements.rentMin.value) || -20;
      const rentMax = parseFloat(elements.rentMax.value) || 20;
      const occupancyMin = parseFloat(elements.occupancyMin.value) || 70;
      const occupancyMax = parseFloat(elements.occupancyMax.value) || 95;
    
    // Generate sensitivity matrix
    const sensitivityData = [];
    const rentSteps = 5;
    const occupancySteps = 5;
    
    for (let i = 0; i <= rentSteps; i++) {
      for (let j = 0; j <= occupancySteps; j++) {
        const rentChange = rentMin + (rentMax - rentMin) * (i / rentSteps);
        const occupancyRate = occupancyMin + (occupancyMax - occupancyMin) * (j / occupancySteps);
        
        const npv = calculateNPV(rentChange, occupancyRate);
        sensitivityData.push({
          rentChange,
          occupancyRate,
          npv
        });
      }
    }
    
    // Update sensitivity chart
    initSensitivityChart(sensitivityData);
    
    // Update best/worst case scenarios
    const sortedByNPV = [...sensitivityData].sort((a, b) => b.npv - a.npv);
    const bestCase = sortedByNPV[0];
    const worstCase = sortedByNPV[sortedByNPV.length - 1];
    
    elements.bestCaseNpv.textContent = `€${bestCase.npv.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
    elements.worstCaseNpv.textContent = `€${worstCase.npv.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
    
    // Generate insights
    generateSensitivityInsights(sensitivityData, bestCase, worstCase);
    
    } catch (error) {
      console.error('Error in runSensitivityAnalysis:', error);
    }
  }

  function calculateNPV(rentChangePercent, occupancyRate) {
    // Simplified NPV calculation for sensitivity analysis
    const baseMonthlyRevenue = calculateMonthlyRevenue();
    const adjustedRevenue = baseMonthlyRevenue * (1 + rentChangePercent / 100) * (occupancyRate / 100);
    const monthlyExpenses = adjustedRevenue * (state.expenseRatio / 100);
    const monthlyNOI = adjustedRevenue - monthlyExpenses;
    const annualNOI = monthlyNOI * 12;
    
    // Simple NPV over 10 years with 8% discount rate
    const discountRate = 0.08;
    let npv = -(parseFloat(elements.initialInvestmentInput.value) || 750000); // Initial investment
    
    for (let year = 1; year <= 10; year++) {
      npv += annualNOI / Math.pow(1 + discountRate, year);
    }
    
    return npv;
  }

  function initSensitivityChart(sensitivityData) {
    const chartContainer = document.getElementById("sensitivity-chart");
    if (!chartContainer) return;

    // Create a heatmap-style visualization
    chartContainer.innerHTML = "<canvas></canvas>";
    const ctx = chartContainer.querySelector("canvas").getContext("2d");

    // Calculate colors statically to avoid Chart.js callback issues
    const maxNPV = Math.max(...sensitivityData.map(d => d.npv));
    const minNPV = Math.min(...sensitivityData.map(d => d.npv));
    
    const chartData = sensitivityData.map(d => {
      const normalized = (d.npv - minNPV) / (maxNPV - minNPV);
      const red = Math.round(255 * (1 - normalized));
      const green = Math.round(255 * normalized);
      
      return {
        x: d.rentChange,
        y: d.occupancyRate,
        npv: d.npv,
        backgroundColor: `rgba(${red}, ${green}, 0, 0.7)`
      };
    });
    
    // Prepare data for scatter plot
    new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'NPV Scenarios',
          data: chartData,
          backgroundColor: chartData.map(d => d.backgroundColor),
          pointRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Rent Price Change (%)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Occupancy Rate (%)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'NPV Sensitivity Analysis'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const dataIndex = context.dataIndex;
                if (dataIndex !== undefined && sensitivityData[dataIndex]) {
                  const npv = sensitivityData[dataIndex].npv;
                  return `NPV: €${npv.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
                }
                return 'NPV: N/A';
              }
            }
          }
        }
      }
    });
  }

  function generateSensitivityInsights(sensitivityData, bestCase, worstCase) {
    const insights = [];
    
    const npvRange = bestCase.npv - worstCase.npv;
    const avgNPV = sensitivityData.reduce((sum, d) => sum + d.npv, 0) / sensitivityData.length;
    
    insights.push(`NPV ranges from €${worstCase.npv.toLocaleString()} to €${bestCase.npv.toLocaleString()}`);
    insights.push(`Average NPV across all scenarios: €${avgNPV.toLocaleString('en-US', {maximumFractionDigits: 0})}`);
    
    if (npvRange > 500000) {
      insights.push('⚠️ High sensitivity to market conditions - consider risk mitigation strategies');
    } else {
      insights.push('✓ Relatively stable returns across different market scenarios');
    }
    
    if (worstCase.npv < 0) {
      insights.push('🔴 Negative NPV possible in unfavorable conditions - evaluate project viability carefully');
    } else {
      insights.push('✓ Positive NPV maintained even in worst-case scenarios');
    }
    
    elements.sensitivityInsights.innerHTML = insights.map(insight => 
      `<div class="p-2 bg-gray-50 rounded text-sm">${insight}</div>`
    ).join('');
  }

  // Add event listeners for cash flow and sensitivity analysis
  function setupCashFlowListeners() {
    const cashFlowInputs = [
      elements.initialInvestmentInput,
      elements.workingCapitalInput,
      elements.loanAmountInput,
      elements.interestRateInput,
      elements.loanTermInput
    ];
    
    cashFlowInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', updateCashFlowAnalysis);
      }
    });
    
    if (elements.runSensitivityBtn) {
      console.log('Setting up sensitivity button listener');
      elements.runSensitivityBtn.addEventListener('click', runSensitivityAnalysis);
    } else {
      console.error('Sensitivity button not found');
    }
  }

  // Initialize new features
  function initNewFeatures() {
    setupCashFlowListeners();
    console.log('Cash Flow and Sensitivity Analysis features initialized');
  }

  // Make additional functions available globally
  window.runSensitivityAnalysis = runSensitivityAnalysis;
  window.testFunction = function() {
    console.log('Test function called successfully');
    alert('Test function works!');
  };

  init();
  
  // Set default navigation state
  setMainNav("market");
  initNewFeatures();
});
