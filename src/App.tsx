import { useState, useEffect, useMemo } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Info, 
  AlertCircle, 
  RefreshCw,
  ShieldCheck,
  Zap,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch as ToggleSwitch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const EXAMPLE_WALLET = "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1";

function Calculator() {
  const [walletAddress, setWalletAddress] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [isToken2022, setIsToken2022] = useState(false);
  const [allowOffCurve, setAllowOffCurve] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Address has been copied to your clipboard.",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const result = useMemo(() => {
    if (!walletAddress || !mintAddress) return null;

    let ownerPubkey: PublicKey;
    let mintPubkey: PublicKey;
    let isOnCurve = true;

    try {
      ownerPubkey = new PublicKey(walletAddress);
      isOnCurve = PublicKey.isOnCurve(ownerPubkey.toBytes());
    } catch (e) {
      return { error: "Invalid owner wallet address.", type: "wallet" };
    }

    try {
      mintPubkey = new PublicKey(mintAddress);
    } catch (e) {
      return { error: "Invalid token mint address.", type: "mint" };
    }

    if (!isOnCurve && !allowOffCurve) {
      return { 
        error: "Owner address is off-curve (likely a PDA). You must allow off-curve addresses to calculate the ATA.", 
        type: "off-curve",
        isOnCurve: false 
      };
    }

    try {
      const ata = getAssociatedTokenAddressSync(
        mintPubkey,
        ownerPubkey,
        allowOffCurve,
        isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
      );
      
      return {
        ata: ata.toBase58(),
        isOnCurve,
        programId: isToken2022 ? TOKEN_2022_PROGRAM_ID.toBase58() : TOKEN_PROGRAM_ID.toBase58()
      };
    } catch (e: any) {
      return { error: e.message || "An error occurred while calculating the ATA.", type: "calculation" };
    }

  }, [walletAddress, mintAddress, isToken2022, allowOffCurve]);

  const fillExample = () => {
    setWalletAddress(EXAMPLE_WALLET);
    setMintAddress(USDC_MINT);
    setIsToken2022(false);
    setAllowOffCurve(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 bg-background selection:bg-primary/20">
      
      {/* Hero Section */}
      <div className="w-full max-w-5xl mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background z-0" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-0 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_80%)]" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 text-primary font-medium text-sm border border-primary/20 backdrop-blur-sm shadow-inner shadow-primary/10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
                Developer Utility
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Deterministic <br/>
                  <span className="text-foreground">ATA Calculator</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                  Instantly compute the Associated Token Address for any Solana wallet and token mint. Client-side, secure, and precise.
                </p>
              </div>
            </div>
            
            <div className="relative h-64 md:h-full min-h-[240px] rounded-xl overflow-hidden border border-border shadow-2xl shadow-black/50">
              <img 
                src="/hero-illustration.png" 
                alt="Abstract blockchain token visualization" 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both relative shadow-black/40">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <CardHeader className="pb-4 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold">Calculation Parameters</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={fillExample} className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border hover:border-primary/30 transition-all">
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> Fill USDC Example
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 relative z-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="wallet" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Owner Wallet Address
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">Required</span>
                  </Label>
                  <Input 
                    id="wallet" 
                    placeholder="e.g. 5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1" 
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="font-mono text-sm bg-background border-border focus-visible:ring-primary h-12 px-4 shadow-inner shadow-black/20"
                  />
                  {result?.error && result.type === "wallet" && (
                    <p className="text-sm text-destructive font-medium flex items-center animate-in fade-in zoom-in-95">
                      <AlertCircle className="w-4 h-4 mr-1.5" /> {result.error}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="mint" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Token Mint Address
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">Required</span>
                  </Label>
                  <Input 
                    id="mint" 
                    placeholder="e.g. EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" 
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    className="font-mono text-sm bg-background border-border focus-visible:ring-primary h-12 px-4 shadow-inner shadow-black/20"
                  />
                  {result?.error && result.type === "mint" && (
                    <p className="text-sm text-destructive font-medium flex items-center animate-in fade-in zoom-in-95">
                      <AlertCircle className="w-4 h-4 mr-1.5" /> {result.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-background/50 border border-border shadow-inner shadow-black/10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Advanced Options</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <ToggleSwitch 
                      id="token-program" 
                      checked={isToken2022}
                      onCheckedChange={setIsToken2022}
                      className="mt-0.5 data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="token-program" className="flex flex-col space-y-1.5 cursor-pointer">
                      <span className="font-medium text-foreground">Token-2022</span>
                      <span className="text-xs text-muted-foreground leading-relaxed">Toggle if the token mint uses the newer Token-2022 program.</span>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <ToggleSwitch 
                      id="off-curve" 
                      checked={allowOffCurve}
                      onCheckedChange={setAllowOffCurve}
                      className="mt-0.5 data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="off-curve" className="flex flex-col space-y-1.5 cursor-pointer">
                      <span className="font-medium text-foreground">Allow Off-Curve</span>
                      <span className="text-xs text-muted-foreground leading-relaxed">Required if the owner is a PDA rather than a standard keypair.</span>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Off-Curve Hint */}
          {result?.error && result.type === "off-curve" && (
            <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shadow-sm animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-base font-semibold">Off-curve address detected</AlertTitle>
              <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                <span className="opacity-90">This wallet appears to be a PDA (Program Derived Address). You must allow off-curve owners to compute the ATA.</span>
                <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground whitespace-nowrap shadow-sm font-medium" onClick={() => setAllowOffCurve(true)}>
                  Allow off-curve
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* General Calculation Error */}
          {result?.error && result.type === "calculation" && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 shadow-sm">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-base font-semibold">Calculation Error</AlertTitle>
              <AlertDescription className="mt-1 text-sm opacity-90">{result.error}</AlertDescription>
            </Alert>
          )}

          {/* Result Card */}
          {result?.ata && (
            <Card className="border-primary/50 bg-card shadow-lg shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both relative group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary z-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              
              <div className="bg-background/40 px-6 py-5 border-b border-border flex flex-wrap items-center justify-between gap-4 relative z-10 backdrop-blur-sm">
                <h3 className="font-semibold text-foreground flex items-center gap-2.5 text-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  Associated Token Address
                </h3>
                {!result.isOnCurve && (
                  <Badge variant="secondary" className="bg-background text-foreground border border-border shadow-sm text-xs font-medium px-2.5 py-1">
                    PDA (Off-curve)
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col gap-6">
                  
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                    <div className="flex items-center gap-3 bg-background border border-border rounded-lg p-4 relative shadow-sm shadow-black/20">
                      <div className="flex-1 font-mono text-base md:text-lg break-all text-foreground font-medium selection:bg-primary/20">
                        {result.ata}
                      </div>
                      <Button 
                        size="icon" 
                        onClick={() => handleCopy(result.ata)}
                        className={`shrink-0 h-10 w-10 transition-all ${copied ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.3)]'}`}
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="flex-1 sm:flex-none bg-background text-foreground hover:bg-secondary hover:border-primary/50 hover:text-primary transition-colors border border-border shadow-sm font-medium">
                      <a href={`https://explorer.solana.com/address/${result.ata}`} target="_blank" rel="noreferrer">
                        View on Explorer <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                      </a>
                    </Button>
                    <Button asChild className="flex-1 sm:flex-none bg-background text-foreground hover:bg-secondary hover:border-primary/50 hover:text-primary transition-colors border border-border shadow-sm font-medium">
                      <a href={`https://solscan.io/account/${result.ata}`} target="_blank" rel="noreferrer">
                        View on Solscan <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-background/30 border-t border-border px-6 py-3 text-xs text-muted-foreground flex justify-between items-center relative z-10 backdrop-blur-sm">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Program:
                </span>
                <span className="font-mono bg-background px-2 py-0.5 rounded border border-border shadow-inner shadow-black/10">{result.programId}</span>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-300 fill-mode-both">
          
          <Accordion type="single" collapsible className="w-full bg-card rounded-xl border border-border shadow-sm shadow-black/30 px-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <AccordionItem value="what-is-ata" className="border-none relative z-10">
              <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline py-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary border border-border">
                    <Info className="w-4 h-4" />
                  </div>
                  What is an ATA?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5 space-y-4">
                <p>On Solana, your main wallet address doesn't directly hold tokens like USDC or BONK. Instead, it holds them in dedicated "sub-accounts" called Associated Token Accounts.</p>
                <div className="bg-background/80 p-4 rounded-lg space-y-2 border border-border shadow-inner shadow-black/10">
                  <p><strong>Owner Wallet</strong> = Your main account</p>
                  <p><strong>Token Mint</strong> = The specific token</p>
                  <p><strong>ATA</strong> = The dedicated sub-account</p>
                </div>
                <p>This calculator deterministically computes the ATA for any wallet and token mint combination without needing to query the blockchain.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="bg-card rounded-xl border border-border shadow-sm shadow-black/30 p-5 space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground relative z-10">Features</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Client-side Only</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Calculations happen in your browser. No keys or addresses are ever sent to a server.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Token-2022 Ready</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Full support for the standard SPL Token program and the newer Token-2022 extensions.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Deterministic</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Calculates the expected address mathematically without needing a network RPC connection.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Calculator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
