"use client";

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useEffect, useRef } from "react";
import { auditChartBoxClass, auditSubheadingClass } from "./audit-layout";
import type { ParsedAuditReport } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
);

type Props = {
  report: ParsedAuditReport;
};

export function AuditCharts({ report }: Props) {
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const donutChart = useRef<ChartJS | null>(null);
  const barChart = useRef<ChartJS | null>(null);

  const { vulns, totalVulns, meta } = report;

  useEffect(() => {
    if (!donutRef.current || !barRef.current) return;

    donutChart.current?.destroy();
    barChart.current?.destroy();

    donutChart.current = new ChartJS(donutRef.current, {
      type: "doughnut",
      data: {
        labels: ["Critical", "High", "Moderate", "Low", "Info"],
        datasets: [
          {
            data: [vulns.critical, vulns.high, vulns.moderate, vulns.low, vulns.info],
            backgroundColor: ["#dc2626", "#ea580c", "#f59e0b", "#2563eb", "#64748b"],
            borderWidth: 2,
            borderColor: "#0a0a0a",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "#94a3b8", padding: 12, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed ?? 0;
                const pct = totalVulns > 0 ? ((val / totalVulns) * 100).toFixed(1) : "0";
                return `${ctx.label}: ${val} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    barChart.current = new ChartJS(barRef.current, {
      type: "bar",
      data: {
        labels: ["Production", "Development", "Optional", "Total"],
        datasets: [
          {
            label: "Dependencies",
            data: [
              meta.dependencies,
              meta.devDependencies,
              meta.optionalDependencies ?? 0,
              meta.totalDependencies ?? 0,
            ],
            backgroundColor: ["#16a34a", "#2563eb", "#f59e0b", "#64748b"],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#64748b" },
          },
          y: {
            grid: { display: false },
            ticks: { color: "#94a3b8" },
          },
        },
      },
    });

    return () => {
      donutChart.current?.destroy();
      barChart.current?.destroy();
    };
  }, [meta, totalVulns, vulns]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className={auditChartBoxClass}>
        <h4 className={auditSubheadingClass}>Severity Distribution</h4>
        <div className="mt-4 h-[280px] max-h-[280px]">
          <canvas ref={donutRef} />
        </div>
      </div>
      <div className={auditChartBoxClass}>
        <h4 className={auditSubheadingClass}>Dependency Breakdown</h4>
        <div className="mt-4 h-[280px] max-h-[280px]">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
}
