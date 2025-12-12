"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { Spinner } from "@/components/mgx/ui/spinner";
import { Table, TBody, Td, THead, Th, Tr } from "@/components/mgx/ui/table";
import { useMetrics } from "@/lib/mgx/hooks/useMetrics";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function MgxMetricsPage() {
  const { data, error, isLoading } = useMetrics();

  const series = data?.[0];
  const points = series?.points ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Metrics</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Placeholder chart powered by Recharts.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Series</CardTitle>
              <CardDescription>{series ? series.name : "—"}</CardDescription>
            </div>
            {isLoading ? <Spinner className="h-4 w-4" /> : null}
          </CardHeader>
          <CardContent className="pt-0">
            {error ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">
                Failed to load metrics.
              </p>
            ) : null}

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="ts" hide />
                  <YAxis width={40} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Uses the first series from <code>/metrics</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Raw points</CardTitle>
              <CardDescription>{points.length} points</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <THead>
                <Tr>
                  <Th>Timestamp</Th>
                  <Th>Value</Th>
                </Tr>
              </THead>
              <TBody>
                {points.slice(0, 10).map((p) => (
                  <Tr key={p.ts}>
                    <Td className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {new Date(p.ts).toLocaleTimeString()}
                    </Td>
                    <Td>{p.value.toFixed(2)}</Td>
                  </Tr>
                ))}
                {!isLoading && points.length === 0 ? (
                  <Tr>
                    <Td colSpan={2} className="py-10 text-center text-zinc-600 dark:text-zinc-400">
                      No metrics yet.
                    </Td>
                  </Tr>
                ) : null}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
