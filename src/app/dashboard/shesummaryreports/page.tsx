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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  TrendingDown as TrendingDownIcon,
  Search as SearchIcon,
  Recycling as RecyclingIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';

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

const getIncidentPieChartOptions = () => ({
  chart: {
    type: 'donut' as const,
    height: 300,
  },
  colors: ['#4FC3F7', '#26C6DA', '#FF7043', '#FFB74D'],
  labels: ['Near Misses', 'Minor', 'Major', 'Fatal'],
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
const pieLabels = ['Near Misses', 'Minor', 'Major', 'Fatal'];
const pieColors = ['#4FC3F7', '#26C6DA', '#FF7043', '#FFB74D'];

const getSafetyPerformanceChartOptions = () => ({
  chart: {
    type: 'bar' as const,
    height: 280,
    toolbar: { show: false },
  },
  colors: ['#2196F3', '#4CAF50'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '60%',
      endingShape: 'rounded' as const,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  xaxis: {
    categories: ['LTIFR', 'TRIFR'],
  },
  yaxis: {
    title: {
      text: 'Rate',
    },
  },
  fill: {
    opacity: 1,
  },
  legend: {
    position: 'bottom' as const,
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

const getEnvironmentalMetricsChartOptions = () => ({
  chart: {
    type: 'bar' as const,
    height: 250,
    toolbar: { show: false },
  },
  colors: ['#2196F3', '#4CAF50'],
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
    categories: ['Air Quality', 'Waste Management'],
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
              <Box sx={{ height: 300 }}>
                <Chart
                  options={getIncidentLineChartOptions()}
                  series={incidentLineData}
                  type="line"
                  height={300}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Incident Pie Chart */}
        <Box sx={{ flex: '1 1 500px', minWidth: '400px' }}>
          <Card sx={{ height: 400, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Incident Distribution
              </Typography>
              <Box sx={{ height: 250 }}>
                <Chart
                  options={getIncidentPieChartOptions()}
                  series={incidentPieData}
                  type="donut"
                  height={250}
                />
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center" sx={{ mt: 2 }}>
                {pieLabels.map((label, index) => (
                  <Chip
                    key={index}
                    label={label}
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
          <Card sx={{ height: 350, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Safety Performance
              </Typography>
              <Box sx={{ height: 280 }}>
                <Chart
                  options={getSafetyPerformanceChartOptions()}
                  series={safetyPerformanceData}
                  type="bar"
                  height={280}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Health Metrics */}
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ height: 350, borderRadius: 2, boxShadow: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Health Metrics
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
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Environmental Metrics
              </Typography>
              <Box sx={{ height: 250 }}>
                <Chart
                  options={getEnvironmentalMetricsChartOptions()}
                  series={environmentalMetricsData}
                  type="bar"
                  height={250}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}