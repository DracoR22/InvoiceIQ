"use client";

import { cn } from "@/lib/utils";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded shadow p-2 border border-slate-200 bg-white">
        <p className="font-semibold text-base">{payload[0].payload.fullName}</p>
        <p className="intro">{payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function CategoryDistributionChart({
  data,
  categories,
}: {
  data: { category: string; percentage: number }[];
  categories: {
    value: string;
    label: string;
    textClass: string;
    borderClass: string;
    fillColorClass: string;
    bgColorClass: string;
  }[];
}) {
  const filteredCategories = categories.filter((c) =>
    data.find((d) => d.category === c.value)
  );

  return (
    <div className="w-full h-4/5 border border-slate-200 rounded-md flex justify-center items-center p-3">
      <ResponsiveContainer width={"50%"} height={"100%"}>
        <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Pie
            data={data}
            dataKey={"percentage"}
            nameKey={"category"}
            innerRadius={"55%"}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                className={cn(
                  filteredCategories[index % filteredCategories.length]
                    .fillColorClass
                )}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="w-1/2 flex flex-col justify-center space-y-1 items-center">
        {data.map((c, index) => (
          <div
            key={index}
            className="text-sm 2xl:text-lg space-x-2 flex items-center w-full"
          >
            <span
              className={cn(
                filteredCategories[index].bgColorClass,
                "inline-block w-2 h-2 rounded-full"
              )}
            ></span>
            <span className="text-slate-600">
              {filteredCategories[index].label}
            </span>
            <span className="font-semibold text-slate-800">
              {c.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}