import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePredictImpact, usePredictCongestion } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, ArrowRight, Loader2, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formSchema = z.object({
  crowdSize: z.coerce.number().min(1, "Required"),
  duration: z.coerce.number().min(1, "Required"),
  roadClosed: z.boolean().default(false),
  sector: z.string().min(1, "Required"),
  eventType: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Predict() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crowdSize: 5000,
      duration: 120,
      roadClosed: false,
      sector: "MG Road",
      eventType: "Protest",
    },
  });

  const predictImpact = usePredictImpact();
  const predictCongestion = usePredictCongestion();

  const [impactData, setImpactData] = useState<any>(null);
  const [congestionData, setCongestionData] = useState<any>(null);

  const onSubmit = async (data: FormValues) => {
    setImpactData(null);
    setCongestionData(null);
    
    predictImpact.mutate({ data }, {
      onSuccess: (res) => {
        setImpactData(res);
      }
    });

    predictCongestion.mutate({ data }, {
      onSuccess: (res) => {
        setCongestionData(res);
      }
    });
  };

  const isPending = predictImpact.isPending || predictCongestion.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase mb-1">Impact Predictor</h2>
        <p className="text-sm text-muted-foreground font-mono">Run simulation models for planned or active events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-4 border-border bg-card/50 backdrop-blur-sm h-fit">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary" />
              Simulation Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-secondary/50 border-border font-mono h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Protest">Protest</SelectItem>
                          <SelectItem value="Concert">Concert</SelectItem>
                          <SelectItem value="VIP Movement">VIP Movement</SelectItem>
                          <SelectItem value="Accident">Accident</SelectItem>
                          <SelectItem value="Waterlogging">Waterlogging</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Sector / Location</FormLabel>
                      <FormControl>
                        <Input className="bg-secondary/50 border-border font-mono h-10" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="crowdSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Est. Crowd</FormLabel>
                        <FormControl>
                          <Input type="number" className="bg-secondary/50 border-border font-mono h-10" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Duration (m)</FormLabel>
                        <FormControl>
                          <Input type="number" className="bg-secondary/50 border-border font-mono h-10" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="roadClosed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-sm border border-border bg-secondary/30 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-primary data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-mono text-xs uppercase text-foreground">
                          Road Closure Required
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full font-mono uppercase tracking-wider h-12 bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                >
                  {isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Computing Model...</>
                  ) : (
                    <><BarChart2 className="mr-2 h-4 w-4" /> Run Simulation</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results Area */}
        <div className="lg:col-span-8 space-y-6">
          {(!impactData && !isPending) ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-border/50 rounded-sm bg-card/20 text-muted-foreground font-mono text-sm p-8 text-center">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>Awaiting simulation parameters.</p>
              <p className="opacity-50 mt-2">Enter data and run simulation to view impact analysis.</p>
            </div>
          ) : (
            <>
              {/* Impact Score Card */}
              <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden relative">
                {isPending && <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center backdrop-blur-[2px]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Impact Score</div>
                      <div className="relative flex items-center justify-center w-32 h-32 mb-2">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            className="stroke-secondary"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="100, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={impactData?.impactScore > 75 ? "stroke-destructive" : impactData?.impactScore > 50 ? "stroke-accent" : "stroke-primary"}
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${impactData?.impactScore || 0}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold font-mono">{impactData?.impactScore || 0}</span>
                        </div>
                      </div>
                      <div className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-sm border ${
                        impactData?.riskLevel === 'Critical' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                        impactData?.riskLevel === 'Heavy' ? 'bg-accent/20 text-accent border-accent/30' :
                        'bg-primary/20 text-primary border-primary/30'
                      }`}>
                        {impactData?.riskLevel || 'Unknown'}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col justify-center gap-6">
                      <div>
                        <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Avg Delay</div>
                        <div className="text-3xl font-mono text-foreground flex items-end">
                          {impactData?.avgDelayMinutes || 0} <span className="text-base text-muted-foreground ml-1 mb-1">min</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Queue Length</div>
                        <div className="text-3xl font-mono text-foreground flex items-end">
                          {impactData?.queueLengthVehicles || 0} <span className="text-base text-muted-foreground ml-1 mb-1">veh</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Model Confidence</div>
                        <div className="text-xl font-mono text-primary flex items-end">
                          {impactData?.confidence ? (impactData.confidence * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="text-xs font-mono text-muted-foreground uppercase mb-4 tracking-widest">Key Factors</div>
                      <ul className="space-y-3">
                        {impactData?.factors?.map((factor: string, i: number) => (
                          <li key={i} className="flex items-start text-sm font-mono text-foreground/80">
                            <ArrowRight className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Congestion Timeline Chart */}
              <Card className="border-border bg-card/50 backdrop-blur-sm relative overflow-hidden">
                {isPending && <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center backdrop-blur-[2px]" />}
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                    Congestion Timeline Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {congestionData?.timeline && (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={congestionData.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis 
                            dataKey="time" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false}
                            axisLine={false}
                            fontFamily="monospace"
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false}
                            axisLine={false}
                            fontFamily="monospace"
                            label={{ value: 'Delay (m)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'monospace' } }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px', fontFamily: 'monospace' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="delay" 
                            stroke="hsl(var(--accent))" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: 'hsl(var(--card))', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: 'hsl(var(--accent))' }}
                            name="Delay (m)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="queue" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: 'hsl(var(--card))', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                            name="Queue (veh)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
