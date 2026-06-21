import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAnalyzeEvent } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BrainCircuit, Loader2, ShieldAlert, Cpu, AlertCircle, ChevronRight } from "lucide-react";

const formSchema = z.object({
  eventType: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  crowdSize: z.coerce.number().min(1, "Required"),
  roadClosed: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function Analyze() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: "Political Rally",
      location: "Freedom Park",
      crowdSize: 10000,
      roadClosed: true,
    },
  });

  const analyzeEvent = useAnalyzeEvent();
  const [result, setResult] = useState<any>(null);

  const onSubmit = async (data: FormValues) => {
    setResult(null);
    analyzeEvent.mutate({ data }, {
      onSuccess: (res) => {
        setResult(res);
      }
    });
  };

  const isPending = analyzeEvent.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase mb-1">Strategic Analyzer</h2>
        <p className="text-sm text-muted-foreground font-mono">AI-driven tactical planning and threat assessment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 border-border bg-card/50 backdrop-blur-sm h-fit">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center">
              <BrainCircuit className="w-4 h-4 mr-2 text-primary" />
              Event Context
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
                      <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Classification</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-secondary/50 border-border font-mono h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Political Rally">Political Rally</SelectItem>
                          <SelectItem value="Religious Procession">Religious Procession</SelectItem>
                          <SelectItem value="Sports Match">Sports Match</SelectItem>
                          <SelectItem value="Major Accident">Major Accident</SelectItem>
                          <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Zone/Location</FormLabel>
                      <FormControl>
                        <Input className="bg-secondary/50 border-border font-mono h-10" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="crowdSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase text-muted-foreground">Estimated Entities</FormLabel>
                      <FormControl>
                        <Input type="number" className="bg-secondary/50 border-border font-mono h-10" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

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
                          Route Severed
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
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Intel...</>
                  ) : (
                    <><BrainCircuit className="mr-2 h-4 w-4" /> Synthesize Strategy</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-8">
          {(!result && !isPending) ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-border/50 rounded-sm bg-card/20 text-muted-foreground font-mono text-sm p-8 text-center">
              <Cpu className="w-12 h-12 mb-4 opacity-20" />
              <p>LLM reasoning engine idle.</p>
              <p className="opacity-50 mt-2">Submit event context to generate tactical playbook.</p>
            </div>
          ) : (
            <div className="space-y-6 relative">
              {isPending && <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center backdrop-blur-[2px]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}
              
              <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="bg-secondary/30 p-4 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center text-sm font-mono text-primary">
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    STRATEGIC OVERVIEW
                  </div>
                  {result?.source && (
                    <div className="text-xs font-mono text-muted-foreground">
                      MODEL: {result.source}
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <p className="font-mono text-sm leading-relaxed text-foreground/90">
                    {result?.analysis?.strategicOverview}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border bg-card/50 backdrop-blur-sm border-t-2 border-t-destructive">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-sm font-mono text-destructive uppercase tracking-wider flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Critical Anomalies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/50">
                      {result?.analysis?.criticalAnomalies?.map((item: string, i: number) => (
                        <li key={i} className="p-4 flex items-start text-sm font-mono text-foreground/80">
                          <span className="text-destructive font-bold mr-3 mt-0.5">{(i + 1).toString().padStart(2, '0')}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/50 backdrop-blur-sm border-t-2 border-t-primary">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-sm font-mono text-primary uppercase tracking-wider flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Tactical Playbook
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/50">
                      {result?.analysis?.tacticalPlan?.map((item: string, i: number) => (
                        <li key={i} className="p-4 flex items-start text-sm font-mono text-foreground/80 bg-primary/5 hover:bg-primary/10 transition-colors">
                          <span className="text-primary font-bold mr-3 mt-0.5">{(i + 1).toString().padStart(2, '0')}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border bg-card/50 backdrop-blur-sm bg-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <div className="text-xs font-mono text-accent uppercase tracking-widest mb-4 flex items-center">
                    <Cpu className="w-4 h-4 mr-2" />
                    Automated Signal Optimizations
                  </div>
                  <div className="font-mono text-sm leading-relaxed text-accent/90">
                    {result?.analysis?.signalOptimizations}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
