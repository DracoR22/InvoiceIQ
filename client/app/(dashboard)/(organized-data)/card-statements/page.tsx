import TopMainContent from "@/components/top-main-content";
import { DataTable } from "@/components/ui/data-table";
import { getCardStatementsData } from "@/lib/requests";
import { getMonthNames } from "@/lib/utils";
import { CardStatement, categories, columns } from "./columns";
import { MonthlyExpensesGraph } from "@/components/monthly-expenses-graph";
import { CategoryDistributionChart } from "@/components/pie-chart";
import { Statistics } from "@/components/statistics";

export default async function CardStatementsPage() {
  const data = await getCardStatementsData();
  const formattedAvgMonthlyExpenses = data?.avgMonthlyExpenses.map((m: any) => {
    const { shortName, longName } = getMonthNames(m.month);

    return {
      name: shortName,
      fullName: longName,
      value: m.average,
    };
  });
  return (
    <>
      <TopMainContent title="Card Statements" displayUploadButton />
      <div className="m-8 flex flex-col flex-grow  space-y-10 2xl:space-y-6">
        <div className="w-full h-72 2xl:h-[450px]">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 2xl:mb-3">
            Overview
          </h2>
          {!data ? (
            <div className="w-full h-full">
              <div className="h-64 2xl:h-72 w-full border border-dashed rounded-lg border-slate-200 flex flex-col items-center justify-center">
                <p className="text-lg mt-1 text-slate-400 text-center">
                  No data to display.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full grid grid-cols-8 gap-3">
              <div className="w-full h-full col-span-3">
                <h3 className="font-semibold text-slate-800 mb-1">
                  Average Monthly Expenses
                </h3>
                <div className="w-full h-4/5 border border-slate-200 rounded-md pr-3 pt-6 pb-2 2xl:pt-10 2xl:pb-4">
                  <MonthlyExpensesGraph data={formattedAvgMonthlyExpenses!} />
                </div>
              </div>
              <div className="w-full h-full col-span-3">
                <h3 className="font-semibold text-slate-800 mb-1">
                  Category Distribution
                </h3>
                <CategoryDistributionChart
                  data={data.categoryDistribution}
                  categories={categories}
                />
              </div>
              <div className="w-full h-4/5 col-span-2">
                <h3 className="font-semibold text-slate-800 mb-1">
                  Statistics
                </h3>
                <Statistics
                  first={{
                    title: "Highest Total Amount",
                    data: data.highestTotalAmount.total?.toFixed(2),
                  }}
                  second={{
                    title: "Most Expensive Category",
                    data: {
                      categories: categories,
                      category: data.mostExpensiveCategory.category,
                    },
                  }}
                  third={{
                    title: "Most Recurrent Issuer",
                    data: data.mostRecurrentTransaction.transaction,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <DataTable
          title="All Card Statements"
          pageSize={10}
          emptyMessage="No Card Statements extracted yet."
          filterColumn={{
            columnId: "issuerName",
            placeholder: "Filter by Issuer",
          }}
          columns={columns}
          categories={categories}
          data={data ? (data.cardStatements as CardStatement[]) : []}
        />
      </div>
    </>
  );
}