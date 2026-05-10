import { useState, useRef, useEffect } from "react";
import axios from "axios";
import AuthPages from "./components/AuthPages";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Upload,
  BarChart3,
  PieChart,
  LineChart,
  LayoutDashboard,
  Settings,
  User,
  Loader2,
  Download,
  Search,
  Palette,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Send,
  X,
  Terminal,
  Clock,
  History,
  PlayCircle,
  LogOut,
  FileText,
  Cpu,
  Bell,
  HelpCircle,
  ChevronRight,
  Maximize2,
  Share2,
  Layers,
  Zap,
  ShieldCheck,
  Menu,
  Sliders,
  Eye,
  EyeOff,
  RotateCcw,
  Activity,
  Triangle,
  Star,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";

// High Contrast Chart Defaults
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.color = "#374151"; // Gray 700

if (ChartJS.defaults.plugins && ChartJS.defaults.plugins.tooltip) {
  ChartJS.defaults.plugins.tooltip.backgroundColor = "#111827";
  ChartJS.defaults.plugins.tooltip.padding = 12;
  ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
  ChartJS.defaults.plugins.tooltip.titleFont = { size: 12, weight: "bold" };
  ChartJS.defaults.plugins.tooltip.bodyFont = { size: 12 };
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

function App() {
  const [user, setUser] = useState(localStorage.getItem("username") || null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [isLoading, setIsLoading] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [history, setHistory] = useState([]);
  const [chartConfig, setChartConfig] = useState({
    type: "bar",
    showLegend: true,
    searchTerm: "",
    palette: "default",
  });
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "ai",
      text: "Intelligence pipeline ready. Ingest dataset for visibility analysis.",
    },
  ]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chartRef = useRef(null);
  const dashboardRef = useRef(null);

  useEffect(() => {
    if (user && activeTab === "history") fetchHistory();
  }, [activeTab, user]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get("/api/v1/analytics/history");
      setHistory(response.data);
    } catch (err) {
      if (err.response?.status === 403) handleLogout();
    }
  };

  const handleAuthSuccess = (data) => setUser(data.username);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    setRawData(null);
    setHistory([]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Source CSV required.");
      return;
    }
    setIsLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("fileinput", file);
    formData.append("graphtype", chartType);
    try {
      const response = await axios.post(
        "/api/v1/analytics/visualize",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      const result = response.data;
      setRawData(result.data);
      setInsights(result.insights.highlights || []);
      setChartConfig((prev) => ({ ...prev, type: result.type }));
      setActiveTab("dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Ingestion failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    setIsLoading(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: "#F9FAFB",
        scale: 2,
        useCORS: true,
        onclone: (_clonedDoc, clonedEl) => {
          // Strip oklch colors that html2canvas can't process
          const elements = clonedEl.getElementsByTagName("*");
          for (let i = 0; i < elements.length; i++) {
            try {
              const el = elements[i];
              const cs = window.getComputedStyle(el);
              if (cs.color && cs.color.includes("oklch")) {
                el.style.color = "#374151";
              }
              if (cs.backgroundColor && cs.backgroundColor.includes("oklch")) {
                el.style.backgroundColor = "#ffffff";
              }
              if (cs.borderColor && cs.borderColor.includes("oklch")) {
                el.style.borderColor = "#E5E7EB";
              }
            } catch (_) {}
          }
        },
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HYPERGRAPHER-INTEL-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadChart = () => {
    if (!chartRef.current) return;
    // react-chartjs-2 exposes the Chart.js instance via chartRef.current.chart
    const chartInstance = chartRef.current.chart || chartRef.current;
    try {
      const link = document.createElement("a");
      link.download = `HYPERGRAPHER-CHART-${Date.now()}.png`;
      link.href =
        typeof chartInstance.toBase64Image === "function"
          ? chartInstance.toBase64Image()
          : chartInstance.canvas?.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Chart download failed", err);
    }
  };

  const loadFromHistory = (item) => {
    const data = JSON.parse(item.chartData);
    const parsedInsights = JSON.parse(item.insights);
    setRawData(data);
    setInsights(
      parsedInsights.highlights ||
        (Array.isArray(parsedInsights) ? parsedInsights : []),
    );
    setChartConfig((prev) => ({ ...prev, type: item.chartType }));
    setFile({ name: item.fileName });
    setActiveTab("dashboard");
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    try {
      const response = await axios.post("/api/v1/analytics/chat", {
        message: userMsg,
      });
      const aiData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: aiData.message || "Processed." },
      ]);
      if (aiData.command) {
        if (aiData.command.includes("LINE"))
          setChartConfig((prev) => ({ ...prev, type: "line" }));
        else if (aiData.command.includes("BAR"))
          setChartConfig((prev) => ({ ...prev, type: "bar" }));
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sandbox mode active." },
      ]);
    }
  };

  /* ── Colour palettes ─────────────────────────────────────── */
  const PALETTES = {
    default: ["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD", "#818CF8", "#4F46E5"],
    ocean: ["#0EA5E9", "#06B6D4", "#14B8A6", "#10B981", "#22D3EE", "#38BDF8"],
    sunset: ["#F97316", "#EF4444", "#EC4899", "#A855F7", "#F59E0B", "#E11D48"],
    slate: ["#334155", "#475569", "#64748B", "#94A3B8", "#1E293B", "#CBD5E1"],
    forest: ["#166534", "#15803D", "#84CC16", "#D97706", "#4D7C0F", "#65A30D"],
  };

  const applyPaletteToDatasets = (datasets, isPieType) => {
    const colors = PALETTES[chartConfig.palette] || PALETTES.default;
    return datasets.map((ds, i) => {
      const base = colors[i % colors.length];
      // Convert hex to rgba helper
      const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      };
      if (isPieType) {
        // Pie/doughnut: each data point gets its own color slice
        const bgColors = ds.data.map((_, j) =>
          hexToRgba(colors[j % colors.length], 0.85),
        );
        const borderColors = ds.data.map((_, j) => colors[j % colors.length]);
        return {
          ...ds,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
        };
      }
      return {
        ...ds,
        backgroundColor: hexToRgba(base, 0.55),
        borderColor: base,
        borderWidth: 2,
        pointBackgroundColor: base,
        pointRadius: 4,
      };
    });
  };

  const getProcessedData = () => {
    if (!rawData) return null;
    const term = chartConfig.searchTerm.toLowerCase();
    const isPieType = ["pie", "doughnut", "polarArea"].includes(
      chartConfig.type,
    );
    const indices = [];
    const filteredLabels = rawData.labels.filter((label, idx) => {
      const match = !term || label.toString().toLowerCase().includes(term);
      if (match) indices.push(idx);
      return match;
    });
    const filteredDatasets = rawData.datasets.map((ds) => ({
      ...ds,
      data: indices.map((idx) => ds.data[idx] ?? 0),
    }));
    const coloredDatasets = applyPaletteToDatasets(filteredDatasets, isPieType);
    return { labels: filteredLabels, datasets: coloredDatasets };
  };

  const processedData = getProcessedData();

  if (!user) return <AuthPages onAuthSuccess={handleAuthSuccess} />;

  return (
    <div
      className={`app-shell ${isSidebarCollapsed ? "[--sb-w:var(--sb-c)]" : ""}`}
    >
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-gray-900/40 z-[60] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`sidebar-container overflow-hidden border-r border-white/5 fixed inset-y-0 left-0 z-[70] lg:relative transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"} ${isSidebarCollapsed ? "lg:[--sb-w:var(--sb-c)]" : "lg:w-[var(--sb-w)]"}`}
      >
        <div
          className={`h-16 flex items-center px-4 mb-4 ${
            isSidebarCollapsed && !isMobileMenuOpen
              ? "justify-center"
              : "justify-between"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={20} color="white" />
            </div>
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <span className="text-xl font-black text-white tracking-tighter truncate">
                Hypergrapher
              </span>
            )}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Workspace"
            active={activeTab === "dashboard"}
            onClick={() => {
              setActiveTab("dashboard");
              setIsMobileMenuOpen(false);
            }}
            collapsed={isSidebarCollapsed && !isMobileMenuOpen}
          />
          <NavItem
            icon={<Layers size={18} />}
            label="Ingestion"
            active={activeTab === "upload"}
            onClick={() => {
              setActiveTab("upload");
              setIsMobileMenuOpen(false);
            }}
            collapsed={isSidebarCollapsed && !isMobileMenuOpen}
          />
          <NavItem
            icon={<History size={18} />}
            label="Library"
            active={activeTab === "history"}
            onClick={() => {
              setActiveTab("history");
              setIsMobileMenuOpen(false);
            }}
            collapsed={isSidebarCollapsed && !isMobileMenuOpen}
          />
          <NavItem
            icon={<Palette size={18} />}
            label="Studio"
            active={activeTab === "customize"}
            onClick={() => {
              setActiveTab("customize");
              setIsMobileMenuOpen(false);
            }}
            collapsed={isSidebarCollapsed && !isMobileMenuOpen}
          />
          <div className="my-6 border-t border-white/5 mx-2" />
          <NavItem
            icon={<LogOut size={18} />}
            label="Sign Out"
            onClick={handleLogout}
            collapsed={isSidebarCollapsed && !isMobileMenuOpen}
          />
        </nav>

        {!isSidebarCollapsed && (
          <div className="mt-auto p-3 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase">
              {user[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Enterprise Tier
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* ─── MAIN WORKSPACE ─── */}
      <main className="flex flex-col overflow-hidden">
        <header className="top-bar">
          <div className="flex items-center gap-4">
            {/* Mobile: opens drawer */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            {/* Desktop: collapses / expands sidebar */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:inline-flex items-center justify-center p-2 -ml-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              {activeTab === "dashboard" ? "Workspace / Analytics" : activeTab}
            </h1>
            <div className="flex items-center text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              <ShieldCheck size={12} className="mr-1.5" /> SECURE_JWT_ENCRYPTED
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="Global search..."
                className="bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs w-72 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-gray-200 pl-5">
              <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all">
                <Bell size={18} />
              </button>
              <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all">
                <HelpCircle size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="main-content">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 max-w-[1440px] mx-auto"
                ref={dashboardRef}
              >
                {/* KPI ROW */}
                <div className="kpi-grid">
                  <KpiWidget
                    label="Active Source"
                    value={rawData ? file?.name || "Dataset" : "None"}
                    icon={<Layers className="text-indigo-600" />}
                    color="bg-indigo-50"
                  />
                  <KpiWidget
                    label="Total Entities"
                    value={processedData ? processedData.labels.length : "0"}
                    icon={<Zap className="text-amber-600" />}
                    color="bg-amber-50"
                  />
                  <KpiWidget
                    label="AI Insight Hits"
                    value={insights.length}
                    icon={<Cpu className="text-blue-600" />}
                    color="bg-blue-50"
                  />
                  <KpiWidget
                    label="Reliability"
                    value="99.9%"
                    icon={<ShieldCheck className="text-green-600" />}
                    color="bg-green-50"
                  />
                </div>

                {/* ANALYTICS WORKSPACE */}
                <div className="analytics-split items-start">
                  {/* CHART WIDGET */}
                  <div className="card-premium h-[620px] flex flex-col shadow-lg shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-gray-900 text-lg">
                          Intelligence Projection
                        </h2>
                        <div className="tx-label mt-1.5">
                          {chartConfig.type} Archetype // 2026_CORE
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {rawData && (
                          <button
                            onClick={exportPDF}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                          >
                            Generate Intel Report
                          </button>
                        )}
                        <button
                          onClick={downloadChart}
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => setIsFullscreen(true)}
                          className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                          title="Fullscreen view"
                        >
                          <Maximize2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 relative">
                      {!rawData ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
                            <Cpu size={36} className="text-gray-300" />
                          </div>
                          <p className="tx-label text-gray-400">
                            Awaiting Ingestion Pipeline
                          </p>
                        </div>
                      ) : (
                        <Chart
                          ref={chartRef}
                          type={chartConfig.type}
                          data={processedData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: chartConfig.showLegend,
                                position: "top",
                                align: "end",
                                labels: {
                                  boxWidth: 8,
                                  usePointStyle: true,
                                  padding: 20,
                                  font: {
                                    weight: "600",
                                    size: 11,
                                    family: "Inter",
                                  },
                                  color: "#374151",
                                },
                              },
                            },
                            scales:
                              chartConfig.type !== "pie" &&
                              chartConfig.type !== "doughnut" &&
                              chartConfig.type !== "radar" &&
                              chartConfig.type !== "polarArea"
                                ? {
                                    y: {
                                      grid: {
                                        borderDash: [6, 6],
                                        color: "#F3F4F6",
                                      },
                                      ticks: {
                                        font: { size: 10, weight: "500" },
                                        color: "#6B7280",
                                      },
                                    },
                                    x: {
                                      grid: { display: false },
                                      ticks: {
                                        font: { size: 10, weight: "500" },
                                        color: "#6B7280",
                                        maxRotation: 45,
                                        minRotation: 45,
                                      },
                                    },
                                  }
                                : {},
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* AI COPILOT WIDGET */}
                  <div className="ai-panel h-[620px] flex flex-col p-6 shadow-xl shadow-gray-200/40">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                      <h3 className="flex items-center text-gray-900 text-xs font-black tracking-widest uppercase">
                        <Sparkles
                          size={16}
                          className="mr-2.5 text-indigo-500"
                        />{" "}
                        Executive Summary
                      </h3>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scroll">
                      {insights.length > 0 ? (
                        insights.map((insight, idx) => (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={idx}
                            className="insight-card"
                          >
                            <p className="insight-text font-medium">
                              {insight.replace("AI_THINK: ", "")}
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center py-10">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                            <MessageSquare
                              size={28}
                              className="text-gray-300"
                            />
                          </div>
                          <p className="tx-label text-gray-400 text-center">
                            No Analysis Intelligence Detected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto mt-20"
              >
                <div className="card-premium p-14 text-center shadow-2xl shadow-indigo-500/5">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Upload size={32} className="text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-3">
                    Data Ingestion
                  </h2>
                  <p className="text-sm font-medium text-gray-500 mb-12 max-w-sm mx-auto">
                    Initialize your intelligence pipeline by uploading a CSV
                    dataset for automated analysis.
                  </p>

                  <form onSubmit={handleUpload}>
                    <label className="block border-2 border-dashed border-gray-200 rounded-3xl p-12 mb-10 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <p className="text-sm font-bold text-gray-700 group-hover:text-indigo-600">
                        {file ? file.name : "Click or drop CSV source..."}
                      </p>
                    </label>
                    <button
                      disabled={isLoading}
                      className="w-full py-5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black shadow-xl shadow-gray-900/10 transition-all"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin mx-auto" />
                      ) : (
                        "Start Intelligence Pipeline"
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                  <h2 className="text-2xl font-black text-gray-900">
                    Intelligence Library
                  </h2>
                  <button
                    onClick={fetchHistory}
                    className="tx-label text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Sync Archives
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {Array.isArray(history) &&
                    history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="card-premium group cursor-pointer hover:border-indigo-400 hover:translate-y-[-4px]"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            {item.chartType === "line" ? (
                              <LineChart size={22} />
                            ) : (
                              <BarChart3 size={22} />
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mb-2 truncate">
                          {item.fileName}
                        </h4>
                        <p className="tx-label text-indigo-500/80">
                          {item.chartType}
                        </p>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* ─────────── STUDIO TAB ─────────── */}
            {activeTab === "customize" && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Sliders size={18} className="text-indigo-600" />
                      </div>
                      Visualization Studio
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 ml-12">
                      Customize your chart appearance and data display in
                      real-time.
                    </p>
                  </div>
                  {rawData && (
                    <button
                      onClick={() =>
                        setChartConfig({
                          type: "bar",
                          showLegend: true,
                          searchTerm: "",
                          palette: "default",
                        })
                      }
                      className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      <RotateCcw size={13} /> Reset to Defaults
                    </button>
                  )}
                </div>

                {!rawData ? (
                  /* Empty state — no data loaded */
                  <div className="card-premium flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-6">
                      <Activity size={36} className="text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                      No Dataset Loaded
                    </h3>
                    <p className="text-sm text-gray-400 max-w-xs mb-8">
                      Upload a CSV from the Ingestion tab first, then return
                      here to customize your visualization.
                    </p>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                      Go to Ingestion →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── LEFT: Controls Column ── */}
                    <div className="lg:col-span-1 space-y-5">
                      {/* Chart Type Picker */}
                      <div className="card-premium">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                          Chart Type
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { type: "bar", icon: BarChart3, label: "Bar" },
                            { type: "line", icon: LineChart, label: "Line" },
                            { type: "pie", icon: PieChart, label: "Pie" },
                            {
                              type: "doughnut",
                              icon: Activity,
                              label: "Donut",
                            },
                            { type: "radar", icon: Star, label: "Radar" },
                            {
                              type: "polarArea",
                              icon: Triangle,
                              label: "Polar",
                            },
                          ].map(({ type, icon: Icon, label }) => (
                            <button
                              key={type}
                              onClick={() =>
                                setChartConfig((p) => ({ ...p, type }))
                              }
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                                chartConfig.type === type
                                  ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <Icon size={18} />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Colour Palette */}
                      <div className="card-premium">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                          Colour Palette
                        </h4>
                        <div className="space-y-2">
                          {[
                            {
                              id: "default",
                              name: "Indigo · Violet",
                              swatches: [
                                "#6366F1",
                                "#8B5CF6",
                                "#A78BFA",
                                "#C4B5FD",
                              ],
                            },
                            {
                              id: "ocean",
                              name: "Ocean Depths",
                              swatches: [
                                "#0EA5E9",
                                "#06B6D4",
                                "#14B8A6",
                                "#10B981",
                              ],
                            },
                            {
                              id: "sunset",
                              name: "Sunset Warm",
                              swatches: [
                                "#F97316",
                                "#EF4444",
                                "#EC4899",
                                "#A855F7",
                              ],
                            },
                            {
                              id: "slate",
                              name: "Enterprise Slate",
                              swatches: [
                                "#334155",
                                "#475569",
                                "#64748B",
                                "#94A3B8",
                              ],
                            },
                            {
                              id: "forest",
                              name: "Forest & Earth",
                              swatches: [
                                "#166534",
                                "#15803D",
                                "#84CC16",
                                "#D97706",
                              ],
                            },
                          ].map((p) => (
                            <button
                              key={p.id}
                              onClick={() =>
                                setChartConfig((prev) => ({
                                  ...prev,
                                  palette: p.id,
                                }))
                              }
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                chartConfig.palette === p.id
                                  ? "border-indigo-400 bg-indigo-50"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex gap-1">
                                {p.swatches.map((c) => (
                                  <div
                                    key={c}
                                    className="w-5 h-5 rounded-full"
                                    style={{ background: c }}
                                  />
                                ))}
                              </div>
                              <span
                                className={`text-xs font-semibold ${
                                  chartConfig.palette === p.id
                                    ? "text-indigo-700"
                                    : "text-gray-600"
                                }`}
                              >
                                {p.name}
                              </span>
                              {chartConfig.palette === p.id && (
                                <CheckCircle2
                                  size={14}
                                  className="text-indigo-500 ml-auto"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display Options */}
                      <div className="card-premium">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                          Display Options
                        </h4>
                        <div className="space-y-3">
                          {/* Legend toggle */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-700">
                                Show Legend
                              </p>
                              <p className="text-xs text-gray-400">
                                Dataset labels on chart
                              </p>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={chartConfig.showLegend}
                              aria-label="Toggle chart legend"
                              onClick={() =>
                                setChartConfig((p) => ({
                                  ...p,
                                  showLegend: !p.showLegend,
                                }))
                              }
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
                                chartConfig.showLegend
                                  ? "bg-indigo-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                                  chartConfig.showLegend
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                              Filter Data Labels
                            </label>
                            <div className="relative">
                              <Search
                                size={13}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />
                              <input
                                type="text"
                                placeholder="Search labels..."
                                value={chartConfig.searchTerm}
                                onChange={(e) =>
                                  setChartConfig((p) => ({
                                    ...p,
                                    searchTerm: e.target.value,
                                  }))
                                }
                                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 bg-gray-50 focus:bg-white transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── RIGHT: Live Preview ── */}
                    <div className="lg:col-span-2 space-y-5">
                      <div
                        className="card-premium flex flex-col"
                        style={{ minHeight: "420px" }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h4 className="text-sm font-black text-gray-900">
                              Live Preview
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Changes apply instantly to your workspace chart
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("dashboard");
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-all"
                          >
                            <Maximize2 size={12} /> Open in Workspace
                          </button>
                        </div>
                        <div className="flex-1 relative">
                          <Chart
                            ref={null}
                            type={chartConfig.type}
                            data={getProcessedData()}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              animation: { duration: 500 },
                              plugins: {
                                legend: {
                                  display: chartConfig.showLegend,
                                  position: "top",
                                  align: "end",
                                  labels: {
                                    boxWidth: 8,
                                    usePointStyle: true,
                                    padding: 16,
                                    font: { size: 11, weight: "600" },
                                    color: "#374151",
                                  },
                                },
                              },
                              scales: ![
                                "pie",
                                "doughnut",
                                "radar",
                                "polarArea",
                              ].includes(chartConfig.type)
                                ? {
                                    y: {
                                      grid: { color: "#F3F4F6" },
                                      ticks: {
                                        font: { size: 10 },
                                        color: "#6B7280",
                                      },
                                    },
                                    x: {
                                      grid: { display: false },
                                      ticks: {
                                        font: { size: 10 },
                                        color: "#6B7280",
                                        maxRotation: 45,
                                      },
                                    },
                                  }
                                : {},
                            }}
                          />
                        </div>
                      </div>

                      {/* Dataset summary card */}
                      <div className="card-premium">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                          Dataset Summary
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-indigo-50 rounded-xl">
                            <p className="text-2xl font-black text-indigo-700">
                              {getProcessedData()?.labels?.length ?? 0}
                            </p>
                            <p className="text-xs text-indigo-500 font-semibold mt-1">
                              Visible Points
                            </p>
                          </div>
                          <div className="text-center p-4 bg-amber-50 rounded-xl">
                            <p className="text-2xl font-black text-amber-700">
                              {getProcessedData()?.datasets?.length ?? 0}
                            </p>
                            <p className="text-xs text-amber-500 font-semibold mt-1">
                              Series
                            </p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-xl">
                            <p className="text-2xl font-black text-green-700">
                              {insights.length}
                            </p>
                            <p className="text-xs text-green-500 font-semibold mt-1">
                              AI Insights
                            </p>
                          </div>
                        </div>
                        {chartConfig.searchTerm && (
                          <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-xl">
                            <AlertCircle size={13} />
                            Filtering active — showing labels matching{" "}
                            <strong className="ml-1">
                              "{chartConfig.searchTerm}"
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI FAB */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-10 right-10 w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-50"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-32 right-10 w-[400px] bg-white border border-gray-200 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] flex flex-col z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center tx-label text-gray-900">
                  <Sparkles size={16} className="mr-2.5 text-indigo-500" />{" "}
                  Copilot Intelligence
                </div>
              </div>
              <div className="h-[440px] overflow-y-auto p-6 space-y-5 bg-white custom-scroll">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed ${msg.role === "user" ? "bg-gray-900 text-white shadow-lg shadow-gray-900/10" : "bg-gray-50 text-gray-700 border border-gray-200"}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleChatSubmit}
                className="p-6 border-t border-gray-200 flex items-center bg-white"
              >
                <input
                  type="text"
                  placeholder="Command intelligence..."
                  className="flex-1 bg-transparent text-sm outline-none font-semibold text-gray-900"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="text-indigo-600 hover:text-indigo-800 ml-4"
                >
                  <Send size={22} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══════ FULLSCREEN CHART MODAL ═══════ */}
      <AnimatePresence>
        {isFullscreen && rawData && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px",
              backdropFilter: "blur(8px)",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFullscreen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                padding: "32px",
                width: "100%",
                maxWidth: "1200px",
                height: "80vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              }}
            >
              {/* Modal header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                  flexShrink: 0,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    Intelligence Projection
                  </h2>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#6366F1",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginTop: "4px",
                    }}
                  >
                    {chartConfig.type} Archetype // Fullscreen Mode
                  </p>
                </div>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <button
                    onClick={downloadChart}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "12px",
                      border: "1.5px solid #E5E7EB",
                      background: "#fff",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#374151",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <Download size={14} /> Download PNG
                  </button>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#F3F4F6",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#374151",
                    }}
                    title="Close (ESC)"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* Full-size chart */}
              <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
                <Chart
                  type={chartConfig.type}
                  data={processedData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 400 },
                    plugins: {
                      legend: {
                        display: chartConfig.showLegend,
                        position: "top",
                        align: "end",
                        labels: {
                          boxWidth: 8,
                          usePointStyle: true,
                          padding: 20,
                          font: { weight: "600", size: 12, family: "Inter" },
                          color: "#374151",
                        },
                      },
                    },
                    scales: !["pie", "doughnut", "radar", "polarArea"].includes(
                      chartConfig.type,
                    )
                      ? {
                          y: {
                            grid: { color: "#F3F4F6" },
                            ticks: {
                              font: { size: 11, weight: "500" },
                              color: "#6B7280",
                            },
                          },
                          x: {
                            grid: { display: false },
                            ticks: {
                              font: { size: 11, weight: "500" },
                              color: "#6B7280",
                              maxRotation: 30,
                            },
                          },
                        }
                      : {},
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={`nav-pill ${active ? "active" : ""} ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : ""}
    >
      <span className={collapsed ? "" : "mr-1"}>{icon}</span>
      {!collapsed && <span>{label}</span>}
      {!collapsed && active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
      )}
    </button>
  );
}

function KpiWidget({ label, value, icon, color }) {
  return (
    <div className="kpi-card hover:border-gray-300 transition-all group">
      <div
        className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center group-hover:scale-105 transition-transform`}
      >
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="tx-label truncate mb-0.5">{label}</div>
        <div className="tx-val truncate">{value}</div>
      </div>
    </div>
  );
}

export default App;
