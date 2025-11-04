'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  TrendingDown as TrendingDownIcon,
  Search as SearchIcon,
  Recycling as RecyclingIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import { authClient } from '@/lib/auth/client';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Chart configurations for ApexCharts
const getIncidentLineChartOptions = () => ({
  chart: {
    type: 'line' as const,
    height: 300,
    toolbar: { show: false },
  },
  colors: ['#2196F3'],
  stroke: {
    curve: 'smooth' as const,
    width: 3,
  },
  markers: {
    size: 5,
    colors: ['#2196F3'],
    strokeColors: '#fff',
    strokeWidth: 2,
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  },
  yaxis: {
    title: {
      text: 'Incidents',
    },
    min: 100,
    max: 600,
  },
  grid: {
    strokeDashArray: 3,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.1,
      stops: [0, 90, 100],
    },
  },
});

const incidentLineData = [
  {
    name: 'Incidents',
    data: [1, 1.5, 1.8, 2.8, 2.5, 2.8, 3.2],
  },
];

// Helper to generate series and categories based on period selection
function generateIncidentSeriesAndCategories(
  periodType: 'week' | 'month' | 'year',
  periodNumber: number,
  year: number
) {
  if (periodType === 'week') {
    const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // deterministic pseudo-random values based on inputs (range: 100-600)
    const base = 150 + ((periodNumber % 10) * 30) + ((year % 5) * 20);
    const data = categories.map((_, i) => Math.round(base + Math.sin(i + periodNumber) * 80 + (i * 15)));
    return { series: [{ name: 'Incidents', data }], categories };
  }

  if (periodType === 'month') {
    // display by weeks in the selected month (4-5 weeks)
    const categories = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    const base = 200 + ((periodNumber % 12) * 25);
    const data = categories.map((_, i) => Math.round(base + (i * 40) + Math.sin(i) * 50));
    return { series: [{ name: 'Incidents', data }], categories };
  }

  // year -> show months
  const categories = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const base = 180 + ((year % 5) * 40);
  const data = categories.map((_, i) => Math.round(base + (i * 20) + Math.cos(i) * 60));
  return { series: [{ name: 'Incidents', data }], categories };
}

const getIncidentPieChartOptions = () => ({
  chart: {
    type: 'donut' as const,
    height: 300,
  },
  colors: ['#4FC3F7', '#26C6DA', '#FF7043', '#FFB74D'],
  labels: ['Low', 'Medium', 'High', 'Critical'],
  legend: {
    show: false,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '60%',
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
});

const incidentPieData = [40, 35, 15, 10];
const pieLabels = ['Low', 'Medium', 'High', 'Critical'];
const pieColors = ['#4FC3F7', '#26C6DA', '#FF7043', '#FFB74D'];

const getSafetyPerformanceChartOptions = (categories: string[]) => ({
  chart: {
    type: 'line' as const,
    height: 280,
    toolbar: { show: false },
  },
  colors: ['#4CAF50', '#F44336', '#FFC107'], // Green, Red, Yellow
  stroke: {
    curve: 'smooth' as const,
    width: 3,
  },
  markers: {
    size: 6,
    colors: ['#4CAF50', '#F44336', '#FFC107'],
    strokeColors: '#fff',
    strokeWidth: 2,
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: categories,
  },
  yaxis: {
    title: {
      text: 'Count',
    },
  },
  legend: {
    position: 'bottom' as const,
  },
  grid: {
    strokeDashArray: 3,
  },
});

const safetyPerformanceData = [
  {
    name: 'Current',
    data: [0.8, 1.5],
  },
  {
    name: 'Previous',
    data: [2.1, 0.6],
  },
];

const getHealthMetricsChartOptions = () => ({
  chart: {
    type: 'bar' as const,
    height: 250,
    toolbar: { show: false },
  },
  colors: ['#2196F3', '#26C6DA'],
  plotOptions: {
    bar: {
      horizontal: true,
      columnWidth: '60%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ['Medical Cases', 'Absenteeism Rate'],
  },
});

const healthMetricsData = [
  {
    name: 'Values',
    data: [65, 80],
  },
];

const getEnvironmentalMetricsChartOptions = (categories: string[]) => ({
  chart: {
    type: 'bar' as const,
    height: 250,
    toolbar: { show: false },
  },
  colors: ['#2196F3'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '70%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: categories,
  },
  yaxis: {
    title: {
      text: 'Total Inspections',
    },
  },
});

const environmentalMetricsData = [
  {
    name: 'Metrics',
    data: [150, 100],
  },
];

interface MetricCardProps {
  icon: React.ReactElement;
  title: string;
  value: string;
  subtitle?: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, subtitle, color }) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Box
            sx={{
              bgcolor: `${color}20`,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any, any>, {
              sx: { color, fontSize: 24 }
            }) : icon}
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function SHESummaryDashboard(): React.JSX.Element {
  const handlePrintReport = () => {
    window.print();
  };

  // Timeframe controls state - initialize with explicit values to prevent undefined
  const currentYear = new Date().getFullYear();
  const [periodType, setPeriodType] = React.useState<'week' | 'month' | 'year'>('week');
  const [periodNumber, setPeriodNumber] = React.useState<number>(1);
  const [year, setYear] = React.useState<number>(currentYear);
  
  // API data state
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [apiData, setApiData] = React.useState<any>(null);
  
  // Severity chart state - initialize with explicit default value to prevent undefined
  const [severityPeriod, setSeverityPeriod] = React.useState<'week' | 'month' | 'year'>('week');
  const [severityData, setSeverityData] = React.useState<any>(null);
  const [severityLoading, setSeverityLoading] = React.useState<boolean>(false);
  
  // Section names state for Safety Performance chart
  const [sectionNames, setSectionNames] = React.useState<string[]>(['LTIFR', 'TRIFR']);
  const [sectionsLoading, setSectionsLoading] = React.useState<boolean>(false);
  
  // Shaft inspection performance state
  const [inspectionPeriod, setInspectionPeriod] = React.useState<'week' | 'month' | 'year'>('week');
  const [inspectionData, setInspectionData] = React.useState<any[]>([]);
  const [inspectionLoading, setInspectionLoading] = React.useState<boolean>(false);

  // Environmental metrics state
  const [environmentalPeriod, setEnvironmentalPeriod] = React.useState<'week' | 'month' | 'year'>('year');
  const [environmentalData, setEnvironmentalData] = React.useState<any[]>([]);
  const [environmentalLoading, setEnvironmentalLoading] = React.useState<boolean>(false);

  // Handler for Apply button
  const handleApplyTimeframe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authClient.fetchIncidentCount(periodType, periodNumber, year);
      
      if (result.success && result.data) {
        setApiData(result.data);
      } else {
        setError(result.error || 'Failed to fetch incident data');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching incident count:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler for severity period change
  const handleSeverityPeriodChange = async (newPeriod: 'week' | 'month' | 'year') => {
    setSeverityPeriod(newPeriod);
    setSeverityLoading(true);
    
    try {
      const result = await authClient.fetchIncidentCountBySeverity(newPeriod);
      
      if (result.success && result.data) {
        setSeverityData(result.data);
      } else {
        console.error('Failed to fetch severity data:', result.error);
      }
    } catch (err) {
      console.error('Error fetching severity data:', err);
    } finally {
      setSeverityLoading(false);
    }
  };

  // Handler for inspection period change
  const handleInspectionPeriodChange = async (newPeriod: 'week' | 'month' | 'year') => {
    setInspectionPeriod(newPeriod);
    setInspectionLoading(true);
    
    try {
      const result = await authClient.fetchShaftInspectionCountsBySection(newPeriod);
      
      if (result.success && result.data) {
        setInspectionData(Array.isArray(result.data) ? result.data : []);
      } else {
        console.error('Failed to fetch inspection data:', result.error);
      }
    } catch (err) {
      console.error('Error fetching inspection data:', err);
    } finally {
      setInspectionLoading(false);
    }
  };

  // Handler for environmental period change
  const handleEnvironmentalPeriodChange = async (newPeriod: 'week' | 'month' | 'year') => {
    setEnvironmentalPeriod(newPeriod);
    setEnvironmentalLoading(true);
    
    try {
      const result = await authClient.fetchShaftInspectionCountsByType(newPeriod);
      
      if (result.success && result.data) {
        setEnvironmentalData(Array.isArray(result.data) ? result.data : []);
      } else {
        console.error('Failed to fetch environmental data:', result.error);
      }
    } catch (err) {
      console.error('Error fetching environmental data:', err);
    } finally {
      setEnvironmentalLoading(false);
    }
  };

  // Fetch initial severity data on mount
  React.useEffect(() => {
    const fetchInitialData = async () => {
      setSeverityLoading(true);
      try {
        const result = await authClient.fetchIncidentCountBySeverity('week');
        if (result.success && result.data) {
          setSeverityData(result.data);
        }
      } catch (err) {
        console.error('Error fetching initial severity data:', err);
      } finally {
        setSeverityLoading(false);
      }
    };
    
    fetchInitialData();
  }, []); // Only run on mount
  
  // Fetch approved sections for Safety Performance chart
  React.useEffect(() => {
    const fetchSections = async () => {
      setSectionsLoading(true);
      try {
        const sections = await authClient.fetchSectionsApproved();
        if (sections && sections.length > 0) {
          // Extract section names from the response
          const names = sections.map((section: any) => section.sectionName || section.name).filter(Boolean);
          if (names.length > 0) {
            setSectionNames(names);
          }
        }
      } catch (err) {
        console.error('Error fetching approved sections:', err);
      } finally {
        setSectionsLoading(false);
      }
    };
    
    fetchSections();
  }, []);
  
  // Fetch initial shaft inspection data
  React.useEffect(() => {
    const fetchInspectionData = async () => {
      setInspectionLoading(true);
      try {
        const result = await authClient.fetchShaftInspectionCountsBySection('week');
        if (result.success && result.data) {
          setInspectionData(Array.isArray(result.data) ? result.data : []);
        }
      } catch (err) {
        console.error('Error fetching initial inspection data:', err);
      } finally {
        setInspectionLoading(false);
      }
    };
    
    fetchInspectionData();
  }, []);

  // Fetch initial environmental data
  React.useEffect(() => {
    const fetchEnvironmentalData = async () => {
      setEnvironmentalLoading(true);
      try {
        const result = await authClient.fetchShaftInspectionCountsByType('year');
        if (result.success && result.data) {
          setEnvironmentalData(Array.isArray(result.data) ? result.data : []);
        }
      } catch (err) {
        console.error('Error fetching initial environmental data:', err);
      } finally {
        setEnvironmentalLoading(false);
      }
    };
    
    fetchEnvironmentalData();
  }, []);

  // Derived incident data based on selection
  const { series: incidentSeries, categories: incidentCategories } = React.useMemo(() => {
    // If we have API data, use it; otherwise use mock data
    if (apiData) {
      // Assuming API returns data in format: { categories: string[], data: number[] }
      // Adjust this based on your actual API response structure
      return {
        series: [{ name: 'Incidents', data: apiData.data || [] }],
        categories: apiData.categories || [],
      };
    }
    return generateIncidentSeriesAndCategories(periodType, periodNumber, year);
  }, [periodType, periodNumber, year, apiData]);

  // Derived severity data based on API response
  const severityChartData = React.useMemo(() => {
    if (severityData && severityData.severityCounts) {
      const counts = severityData.severityCounts;
      return [
        counts.Low || 0,
        counts.Medium || 0,
        counts.High || 0,
        counts.Critical || 0,
      ];
    }
    return incidentPieData; // fallback to mock data
  }, [severityData]);

  const incidentOptions = React.useMemo(() => ({
    ...getIncidentLineChartOptions(),
    xaxis: { categories: incidentCategories },
  }), [incidentCategories]);
  
  // Prepare inspection chart data
  const inspectionChartData = React.useMemo(() => {
    if (inspectionData && inspectionData.length > 0) {
      const sectionNames = inspectionData.map((item: any) => item.sectionName);
      const totalInspections = inspectionData.map((item: any) => item.totalInspections || 0);
      const remainingInspections = inspectionData.map((item: any) => item.remainingInspections || 0);
      const numberOfShafts = inspectionData.map((item: any) => item.numberOfShafts || 0);
      
      return {
        categories: sectionNames,
        series: [
          { name: 'Total Inspections', data: totalInspections },
          { name: 'Remaining Inspections', data: remainingInspections },
          { name: 'Number of Shafts', data: numberOfShafts },
        ],
        completionPercentages: inspectionData.map((item: any) => item.completionPercentage || 0),
      };
    }
    return {
      categories: ['No Data'],
      series: [
        { name: 'Total Inspections', data: [0] },
        { name: 'Remaining Inspections', data: [0] },
        { name: 'Number of Shafts', data: [0] },
      ],
      completionPercentages: [0],
    };
  }, [inspectionData]);

  // Prepare environmental chart data
  const environmentalChartData = React.useMemo(() => {
    if (environmentalData && environmentalData.length > 0) {
      const inspectionTypes = environmentalData.map((item: any) => item.inspectionType);
      const totalInspections = environmentalData.map((item: any) => item.totalInspections || 0);
      
      return {
        categories: inspectionTypes,
        series: [
          { name: 'Total Inspections', data: totalInspections },
        ],
        percentages: environmentalData.map((item: any) => item.percentageOfTotal || 0),
      };
    }
    return {
      categories: ['No Data'],
      series: [
        { name: 'Total Inspections', data: [0] },
      ],
      percentages: [0],
    };
  }, [environmentalData]);

  React.useEffect(() => {
    // Add print-specific styles to fit everything on one A4 page
    const printStyles = `
      @media print {
        @page {
          size: A4 landscape;
          margin: 0.3in;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          margin: 0;
          padding: 0;
        }
        
        /* Main container scaling to fit one page */
        body > div {
          transform: scale(0.75);
          transform-origin: top left;
          width: 133.33%;
        }
        
        /* Hide navigation and other UI elements */
        nav, header, footer, .no-print {
          display: none !important;
        }
        
        /* Ensure content fits on one page */
        .MuiBox-root {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Card styling for print */
        .MuiCard-root {
          box-shadow: none !important;
          border: 1px solid #ddd !important;
          page-break-inside: avoid;
          break-inside: avoid;
          margin-bottom: 8px !important;
        }
        
        .MuiCardContent-root {
          padding: 12px !important;
        }
        
        /* Chart sizing for print */
        .apexcharts-canvas {
          max-width: 100% !important;
          height: auto !important;
        }
        
        /* Typography adjustments */
        h4 {
          font-size: 18px !important;
          margin-bottom: 8px !important;
        }
        
        h6 {
          font-size: 12px !important;
          margin-bottom: 4px !important;
        }
        
        /* Reduce spacing for print */
        .MuiStack-root {
          gap: 8px !important;
        }
        
        /* Chip sizing */
        .MuiChip-root {
          font-size: 9px !important;
          height: 20px !important;
        }
        
        /* Ensure no page breaks */
        body {
          overflow: hidden;
        }
        
        /* Force single page */
        html, body {
          height: 100%;
          overflow: hidden;
        }
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
          SHE Summary Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrintReport}
          sx={{
            bgcolor: '#2196F3',
            '&:hover': {
              bgcolor: '#1976D2',
            },
            '@media print': {
              display: 'none',
            },
          }}
        >
          Print Report
        </Button>
      </Box>

      {/* Top Metrics Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <MetricCard
            icon={<CheckCircleIcon />}
            title="100 Days"
            value="Incident-Free"
            color="#4CAF50"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <MetricCard
            icon={<TrendingDownIcon />}
            title="LTIFR: 0.8"
            value=""
            color="#2196F3"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <MetricCard
            icon={<SearchIcon />}
            title="Inspections:"
            value="92% Completed"
            color="#FF9800"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <MetricCard
            icon={<RecyclingIcon />}
            title="Waste Recycled:"
            value="74%"
            color="#4CAF50"
          />
        </Box>
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {/* Incident Summary Line Chart */}
        <Box sx={{ flex: '1 1 500px', minWidth: '400px' }}>
          <Card sx={{ height: 400, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Incident Summary
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Select timeframe</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControl size="small" disabled={loading}>
                    <InputLabel id="period-type-label">Period</InputLabel>
                    <Select
                      labelId="period-type-label"
                      value={periodType}
                      label="Period"
                      onChange={(e) => setPeriodType(e.target.value as 'week' | 'month' | 'year')}
                      sx={{ minWidth: 100 }}
                    >
                      <MenuItem value="week">Week</MenuItem>
                      <MenuItem value="month">Month</MenuItem>
                      <MenuItem value="year">Year</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" disabled={loading}>
                    <InputLabel id="period-number-label">#</InputLabel>
                    <Select
                      labelId="period-number-label"
                      value={periodNumber}
                      label="#"
                      onChange={(e) => setPeriodNumber(Number(e.target.value))}
                      sx={{ minWidth: 80 }}
                    >
                      {[...Array(53)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {periodType === 'week' && (
                    <FormControl size="small" disabled={loading}>
                      <InputLabel id="year-label">Year</InputLabel>
                      <Select
                        labelId="year-label"
                        value={year}
                        label="Year"
                        onChange={(e) => setYear(Number(e.target.value))}
                        sx={{ minWidth: 110 }}
                      >
                        {Array.from({ length: 21 }).map((_, idx) => {
                          const y = currentYear - idx;
                          return <MenuItem key={y} value={y}>{y}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  )}

                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleApplyTimeframe}
                    disabled={loading}
                    sx={{
                      bgcolor: '#4CAF50',
                      '&:hover': {
                        bgcolor: '#45a049',
                      },
                      minWidth: '80px',
                    }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Apply'}
                  </Button>
                </Stack>
              </Stack>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Box sx={{ height: 300 }}>
                <Chart
                  options={incidentOptions}
                  series={incidentSeries}
                  type="line"
                  height={250}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Incident Pie Chart */}
        <Box sx={{ flex: '1 1 500px', minWidth: '400px' }}>
          <Card sx={{ height: 400, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Incident Severity Level
                </Typography>
                <FormControl size="small" disabled={severityLoading}>
                  <InputLabel id="severity-period-label">Period</InputLabel>
                  <Select
                    labelId="severity-period-label"
                    value={severityPeriod}
                    label="Period"
                    onChange={(e) => handleSeverityPeriodChange(e.target.value as 'week' | 'month' | 'year')}
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                    <MenuItem value="year">Year</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Box sx={{ height: 250, position: 'relative' }}>
                {severityLoading && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}>
                    <CircularProgress size={40} />
                  </Box>
                )}
                <Chart
                  options={getIncidentPieChartOptions()}
                  series={severityChartData}
                  type="donut"
                  height={250}
                />
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center" sx={{ mt: 2 }}>
                {pieLabels.map((label, index) => (
                  <Chip
                    key={index}
                    label={`${label}: ${severityChartData[index]}`}
                    sx={{
                      bgcolor: pieColors[index],
                      color: 'white',
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Second Charts Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {/* Safety Performance */}
        <Box sx={{ flex: '2 1 600px', minWidth: '400px' }}>
          <Card sx={{ height: 450, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Shaft Inspection Performance
                </Typography>
                <FormControl size="small" disabled={inspectionLoading}>
                  <InputLabel id="inspection-period-label">Period</InputLabel>
                  <Select
                    labelId="inspection-period-label"
                    value={inspectionPeriod}
                    label="Period"
                    onChange={(e) => handleInspectionPeriodChange(e.target.value as 'week' | 'month' | 'year')}
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                    <MenuItem value="year">Year</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              {inspectionLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ height: 280 }}>
                    <Chart
                      options={getSafetyPerformanceChartOptions(inspectionChartData.categories)}
                      series={inspectionChartData.series}
                      type="line"
                      height={280}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Completion Percentages:
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {inspectionChartData.categories.map((sectionName: string, index: number) => (
                        <Chip
                          key={index}
                          label={`${sectionName}: ${inspectionChartData.completionPercentages[index]?.toFixed(1) || 0}%`}
                          sx={{
                            bgcolor: '#2196F3',
                            color: 'white',
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Health Metrics */}
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ height: 450, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Penality Performance
              </Typography>
              <Box sx={{ height: 250 }}>
                <Chart
                  options={getHealthMetricsChartOptions()}
                  series={healthMetricsData}
                  type="bar"
                  height={250}
                />
              </Box>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Chip label="Medical Cases" sx={{ bgcolor: '#2196F3', color: 'white' }} />
                <Chip label="Absenteeism Rate" sx={{ bgcolor: '#26C6DA', color: 'white' }} />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Environmental Metrics */}
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ height: 350, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Environmental Metrics
                </Typography>
                <FormControl size="small" disabled={environmentalLoading}>
                  <InputLabel id="environmental-period-label">Period</InputLabel>
                  <Select
                    labelId="environmental-period-label"
                    value={environmentalPeriod}
                    label="Period"
                    onChange={(e) => handleEnvironmentalPeriodChange(e.target.value as 'week' | 'month' | 'year')}
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                    <MenuItem value="year">Year</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              {environmentalLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 250 }}>
                  <Chart
                    options={getEnvironmentalMetricsChartOptions(environmentalChartData.categories)}
                    series={environmentalChartData.series}
                    type="bar"
                    height={250}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}