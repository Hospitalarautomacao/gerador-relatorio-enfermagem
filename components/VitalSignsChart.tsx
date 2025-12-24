
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { SavedReport } from '../types';

Chart.register(...registerables, annotationPlugin);

interface VitalSignsChartProps {
  history: SavedReport[];
  isDarkMode: boolean;
}

type TimeRange = '7d' | '14d' | '30d';
type DatasetKey = 'systolic' | 'diastolic' | 'hr' | 'sat' | 'temp' | 'glycemia';

const VitalSignsChart: React.FC<VitalSignsChartProps> = ({ history, isDarkMode }) => {
  const chartContainer = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  
  // Initialize with localStorage or defaults
  const [visibleDatasets, setVisibleDatasets] = useState<Record<DatasetKey, boolean>>(() => {
      try {
          const saved = localStorage.getItem('vitalSignsChartConfig_v2');
          return saved ? JSON.parse(saved) : {
              systolic: true,
              diastolic: true,
              hr: true,
              sat: true,
              temp: false,
              glycemia: false
          };
      } catch {
          return {
              systolic: true,
              diastolic: true,
              hr: true,
              sat: true,
              temp: false,
              glycemia: false
          };
      }
  });

  // Persist changes
  useEffect(() => {
      localStorage.setItem('vitalSignsChartConfig_v2', JSON.stringify(visibleDatasets));
  }, [visibleDatasets]);

  const chartData = useMemo(() => {
    let filteredHistory = [...history].sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime());

    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    filteredHistory = filteredHistory.filter(r => new Date(r.savedAt) >= cutoff);

    const labels = filteredHistory.map(report => new Date(report.savedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }));
    
    // Helper to extract numbers
    const extract = (key: keyof SavedReport, subKey?: 'sys' | 'dia') => {
        return filteredHistory.map(r => {
            const val = r[key];
            if (!val) return null;
            if (key === 'bloodPressure' && typeof val === 'string') {
                const parts = val.split('/');
                return subKey === 'sys' ? parseInt(parts[0]) : parseInt(parts[1]);
            }
            if (key === 'temperature' && typeof val === 'string') return parseFloat(val.replace(',', '.'));
            return typeof val === 'string' ? parseFloat(val) : (val as unknown as number);
        });
    };

    return { 
        labels, 
        systolicData: extract('bloodPressure', 'sys'), 
        diastolicData: extract('bloodPressure', 'dia'), 
        heartRateData: extract('heartRate'), 
        saturationData: extract('saturation'), 
        tempData: extract('temperature'),
        glycemiaData: extract('glycemia')
    };
  }, [history, timeRange]);

  // Statistics Calculation
  const stats = useMemo(() => {
      const calc = (data: (number | null)[]) => {
          const valid = data.filter(n => n !== null) as number[];
          if (valid.length === 0) return { min: '-', max: '-', avg: '-' };
          const sum = valid.reduce((a, b) => a + b, 0);
          return {
              min: Math.min(...valid),
              max: Math.max(...valid),
              avg: (sum / valid.length).toFixed(1)
          };
      };
      return {
          sys: calc(chartData.systolicData),
          dia: calc(chartData.diastolicData),
          hr: calc(chartData.heartRateData)
      };
  }, [chartData]);

  useEffect(() => {
    if (!chartContainer.current) return;

    if (chartInstance.current) {
        chartInstance.current.destroy();
    }
    
    const textColor = isDarkMode ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 1)';
    const gridColor = isDarkMode ? 'rgba(71, 85, 105, 0.1)' : 'rgba(203, 213, 225, 0.4)';

    chartInstance.current = new Chart(chartContainer.current, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'PA Sistólica',
            data: chartData.systolicData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            yAxisID: 'y',
            tension: 0.3,
            hidden: !visibleDatasets.systolic,
          },
          {
            label: 'PA Diastólica',
            data: chartData.diastolicData,
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.5)',
            yAxisID: 'y',
            tension: 0.3,
            hidden: !visibleDatasets.diastolic,
          },
          {
            label: 'Freq. Cardíaca',
            data: chartData.heartRateData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            yAxisID: 'y',
            tension: 0.3,
            hidden: !visibleDatasets.hr,
          },
          {
            label: 'Temp (°C)',
            data: chartData.tempData,
            borderColor: 'rgb(234, 179, 8)',
            backgroundColor: 'rgba(234, 179, 8, 0.5)',
            yAxisID: 'yTemp', 
            tension: 0.3,
            hidden: !visibleDatasets.temp,
            borderDash: [5, 5],
          },
          {
            label: 'Sat O₂ (%)',
            data: chartData.saturationData,
            borderColor: 'rgb(22, 163, 74)',
            backgroundColor: 'rgba(22, 163, 74, 0.5)',
            yAxisID: 'y1',
            tension: 0.3,
            hidden: !visibleDatasets.sat,
          },
          {
            label: 'Glicemia',
            data: chartData.glycemiaData,
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.5)',
            yAxisID: 'yGly',
            tension: 0.3,
            hidden: !visibleDatasets.glycemia,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            annotation: {
                annotations: {
                    normalBpBox: {
                        type: 'box',
                        yMin: 60,
                        yMax: 120,
                        backgroundColor: 'rgba(34, 197, 94, 0.05)', // Very faint green
                        borderWidth: 0,
                        display: visibleDatasets.systolic || visibleDatasets.diastolic
                    },
                    limitLine: {
                        type: 'line',
                        yMin: 140,
                        yMax: 140,
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        borderWidth: 1,
                        borderDash: [2, 2],
                        label: { content: 'Limite PA', display: true, position: 'end', font: {size: 9} },
                        display: visibleDatasets.systolic
                    }
                }
            }
        },
        scales: {
          x: { ticks: { color: textColor, maxRotation: 45 }, grid: { color: gridColor } },
          y: {
            display: visibleDatasets.systolic || visibleDatasets.diastolic || visibleDatasets.hr,
            position: 'left',
            title: { display: true, text: 'PA / FC', color: textColor },
            grid: { color: gridColor },
          },
          yTemp: {
             display: visibleDatasets.temp,
             position: 'right',
             min: 34,
             max: 42,
             grid: { drawOnChartArea: false },
             ticks: { color: 'rgb(234, 179, 8)' }
          },
          y1: {
            display: visibleDatasets.sat,
            position: 'right',
            min: 80,
            max: 100,
            grid: { drawOnChartArea: false },
            ticks: { color: 'rgb(22, 163, 74)' }
          },
          yGly: {
              display: visibleDatasets.glycemia,
              position: 'right',
              min: 0,
              max: 400,
              grid: { drawOnChartArea: false },
              ticks: { color: 'rgb(168, 85, 247)' }
          }
        },
      },
    });

    return () => { chartInstance.current?.destroy(); };
  }, [chartData, isDarkMode, visibleDatasets]);

  const toggleDataset = (key: DatasetKey) => {
      setVisibleDatasets(prev => ({...prev, [key]: !prev[key]}));
  };

  const handleDownload = () => {
      const link = document.createElement('a');
      link.download = `grafico_tendencia_${new Date().toISOString().split('T')[0]}.png`;
      link.href = chartContainer.current?.toDataURL('image/png') || '';
      link.click();
  };
  
   if (history.length < 2) {
        return (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 border-dashed">
                <i className="fas fa-chart-line text-4xl text-slate-300 dark:text-slate-500 mb-3 block"></i>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Dados Insuficientes</p>
            </div>
        );
    }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
      
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-4">
         <div className="flex justify-between items-center flex-wrap gap-2">
             <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                 {(['7d', '14d', '30d'] as TimeRange[]).map(r => (
                     <button key={r} onClick={() => setTimeRange(r)} className={`px-4 py-1 text-xs font-bold rounded-md ${timeRange === r ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'}`}>{r}</button>
                 ))}
             </div>
             <button onClick={handleDownload} className="text-xs text-cyan-600 hover:text-cyan-800 font-bold flex items-center gap-1">
                 <i className="fas fa-download"></i> PNG
             </button>
         </div>

         {/* Filters */}
         <div className="flex flex-wrap gap-2">
            {[
                {k: 'systolic', l: 'PA Sis', c: 'bg-red-500'}, 
                {k: 'diastolic', l: 'PA Dia', c: 'bg-orange-500'}, 
                {k: 'hr', l: 'FC', c: 'bg-blue-500'},
                {k: 'sat', l: 'SatO2', c: 'bg-green-600'},
                {k: 'temp', l: 'Temp', c: 'bg-yellow-500'},
                {k: 'glycemia', l: 'Glicemia', c: 'bg-purple-500'}
            ].map((d) => (
                <button 
                    key={d.k}
                    onClick={() => toggleDataset(d.k as DatasetKey)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold text-white transition-all ${visibleDatasets[d.k as DatasetKey] ? d.c : 'bg-slate-300'}`}
                >
                    {d.l}
                </button>
            ))}
         </div>
         
         {/* Mini Stats */}
         <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2 rounded text-[10px] text-slate-600">
             <div><strong className="text-red-500">PA Sis:</strong> {stats.sys.avg} (Méd)</div>
             <div><strong className="text-orange-500">PA Dia:</strong> {stats.dia.avg} (Méd)</div>
             <div><strong className="text-blue-500">FC:</strong> {stats.hr.min}-{stats.hr.max}</div>
         </div>
      </div>

      <div className="relative h-72 w-full">
        <canvas ref={chartContainer} />
      </div>
    </div>
  );
};

export default VitalSignsChart;