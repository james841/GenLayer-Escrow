"use client";
import { useState, useEffect } from "react";
import { client, CONTRACT_ADDRESS } from "@/lib/genlayer";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  History, 
  ShieldCheck, 
  Cpu, 
  FileCheck, 
  DollarSign, 
  User, 
  ArrowRight,
  RefreshCw,
  Clock,
  ExternalLink
} from "lucide-react";

type Step = "create" | "proof" | "evaluate" | "result";

interface Deal {
  id: string;
  buyer: string;
  seller: string;
  amount: string;
  conditions: string;
  status: string;
  verdict: string;
  created_at: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>("create");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [verdict, setVerdict] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentDealId, setCurrentDealId] = useState<string>("");
  const [form, setForm] = useState({
    buyer: "",
    seller: "",
    amount: "",
    conditions: "",
    proof: "",
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    const { data } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setDeals(data);
  }

  // ... (Logic remains identical to your original code for handleCreateDeal, handleSubmitProof, handleEvaluate)
  // [I am omitting the logic functions here to keep the code block focused on UI, but they integrate perfectly]

  async function handleCreateDeal() {
    setLoading(true);
    setStatus("Initiating smart contract...");
    try {
      const { data, error } = await supabase
        .from("deals")
        .insert({
          buyer: form.buyer,
          seller: form.seller,
          amount: form.amount,
          conditions: form.conditions,
          status: "pending",
        })
        .select().single();
      if (error) throw error;
      setCurrentDealId(data.id);
      await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "create_deal",
        args: [form.buyer, form.seller, form.amount, form.conditions],
        value: 0n,
      });
      setStatus("Deal anchored on GenLayer! ✅");
      setStep("proof");
      fetchDeals();
    } catch (e: any) { setStatus("Error: " + e.message); }
    setLoading(false);
  }

  async function handleSubmitProof() {
    setLoading(true);
    setStatus("Broadcasting proof to validators...");
    try {
      await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "submit_proof",
        args: [form.proof],
        value: 0n,
      });
      await supabase.from("deals").update({ proof: form.proof, status: "proof_submitted" }).eq("id", currentDealId);
      setStatus("Proof finalized! ✅");
      setStep("evaluate");
      fetchDeals();
    } catch (e: any) { setStatus("Error: " + e.message); }
    setLoading(false);
  }

  async function handleEvaluate() {
    setLoading(true);
    setStatus("AI Validators are debating... ⚖️");
    try {
      const { TransactionStatus } = await import("genlayer-js/types");
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "ai_evaluate",
        args: [],
        value: 0n,
      });
      setStatus("Waiting for consensus... ⏳");
      await client.waitForTransactionReceipt({
        hash: txHash,
        status: TransactionStatus.FINALIZED,
        retries: 60,
        interval: 3000,
      });
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_status",
        args: [],
      });
      const finalStatus = result as string;
      const finalVerdict = finalStatus === "completed" ? "YES" : "NO";
      await supabase.from("deals").update({ status: finalStatus, verdict: finalVerdict }).eq("id", currentDealId);
      setVerdict(finalStatus);
      setStep("result");
      setStatus("");
      fetchDeals();
    } catch (e: any) { setStatus("Error: " + e.message); }
    setLoading(false);
  }

  function resetForm() {
    setStep("create");
    setVerdict("");
    setCurrentDealId("");
    setStatus("");
    setForm({ buyer: "", seller: "", amount: "", conditions: "", proof: "" });
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    proof_submitted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    refunded: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <main className="min-h-screen bg-[#050508] text-slate-200 selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto p-4 md:p-10">
        
        {/* Header Section */}
        <header className="flex flex-col items-center text-center mb-16 relative">
          <div className="absolute top-0 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10 rounded-full" />
          <div className="flex items-center gap-3 mb-4 bg-slate-900/50 border border-slate-800 px-4 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">GenLayer Mainnet</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Escrow</span>
          </h1>
          <p className="text-slate-400 max-w-lg leading-relaxed font-medium">
            Next-gen trustless settlements using decentralized intelligent contracts and AI validators.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Action Hub (Step Container) */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2rem] p-8 md:p-10 shadow-2xl">
              
              {/* Modern Progress Bar */}
              <div className="relative flex justify-between mb-12">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-800 -translate-y-1/2 z-0" />
                {["create", "proof", "evaluate", "result"].map((s, i) => (
                  <div key={s} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${
                      step === s ? "bg-purple-600 border-purple-400 scale-110 shadow-purple-500/20" : 
                      (i < ["create", "proof", "evaluate", "result"].indexOf(step) ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-slate-950 border-slate-800 text-slate-600")
                    }`}>
                      {i === 0 && <Plus size={18} />}
                      {i === 1 && <FileCheck size={18} />}
                      {i === 2 && <Cpu size={18} />}
                      {i === 3 && <ShieldCheck size={18} />}
                    </div>
                    <span className={`text-[10px] uppercase font-black tracking-tighter mt-3 transition-colors ${step === s ? "text-purple-400" : "text-slate-600"}`}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>

              {/* Steps Rendering */}
              <div className="min-h-[380px]">
                {step === "create" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Create Escrow Deal</h2>
                      <p className="text-slate-400 text-sm">Define participants and contract conditions.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                          <input 
                            placeholder="Buyer ID" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            value={form.buyer}
                            onChange={(e) => setForm({ ...form, buyer: e.target.value })}
                          />
                        </div>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                          <input 
                            placeholder="Seller ID" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            value={form.seller}
                            onChange={(e) => setForm({ ...form, seller: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <input 
                          placeholder="Amount ($)" 
                          type="number"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        />
                      </div>
                      <textarea 
                        placeholder="Deal Conditions: Describe what the seller must deliver..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all h-32 resize-none"
                        value={form.conditions}
                        onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                      />
                    </div>
                    <button 
                      onClick={handleCreateDeal}
                      disabled={loading || !form.buyer || !form.amount}
                      className="w-full bg-purple-600 hover:bg-purple-500 active:scale-[0.98] disabled:opacity-30 text-white rounded-2xl py-5 font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-900/20"
                    >
                      {loading ? <RefreshCw className="animate-spin" size={20} /> : <>Create Contract <ArrowRight size={20}/></>}
                    </button>
                  </div>
                )}

                {/* Proof, Evaluate, and Result steps follow a similar high-polish design pattern */}
                {/* Simplified Proof Step */}
                {step === "proof" && (
                  <div className="space-y-6 animate-in fade-in zoom-in duration-500 text-center">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                      <FileCheck className="text-blue-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Delivery Submission</h2>
                    <p className="text-slate-400">Sellers: provide the evidence of completion (Links, hashes, or descriptions).</p>
                    <textarea 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 h-40"
                      placeholder="Enter proof details..."
                      value={form.proof}
                      onChange={(e) => setForm({ ...form, proof: e.target.value })}
                    />
                    <button 
                      onClick={handleSubmitProof}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-5 font-bold transition-all shadow-xl shadow-blue-900/20"
                    >
                      {loading ? <RefreshCw className="animate-spin mx-auto" /> : "Verify Delivery →"}
                    </button>
                  </div>
                )}

                {/* AI Evaluate Step */}
                {step === "evaluate" && (
                  <div className="space-y-8 animate-in fade-in duration-500 text-center py-6">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse" />
                      <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center relative border border-purple-500/50">
                        <Cpu className="text-purple-400 animate-bounce" size={40} />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Validator Protocol</h2>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                        GenLayer AI nodes will now verify your proof against the contract conditions.
                      </p>
                    </div>
                    <button 
                      onClick={handleEvaluate}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl py-5 font-bold hover:shadow-2xl hover:shadow-purple-500/30 transition-all"
                    >
                      {loading ? "Reaching Consensus..." : "Start AI Verification"}
                    </button>
                  </div>
                )}

                {/* Final Result Step */}
                {step === "result" && (
                  <div className="text-center space-y-8 animate-in zoom-in duration-500">
                    <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center border-4 ${verdict === "completed" ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]" : "bg-red-500/10 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]"}`}>
                      {verdict === "completed" ? <ShieldCheck size={64} className="text-emerald-500" /> : <Plus size={64} className="text-red-500 rotate-45" />}
                    </div>
                    <div>
                      <h2 className={`text-4xl font-black mb-2 ${verdict === "completed" ? "text-emerald-500" : "text-red-500"}`}>
                        {verdict === "completed" ? "Deal Finalized" : "Refund Issued"}
                      </h2>
                      <p className="text-slate-400 italic">&quot;The AI has reached a verdict.&quot;</p>
                    </div>
                    <button onClick={resetForm} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all">
                      New Escrow Contract
                    </button>
                  </div>
                )}
              </div>

              {/* High-tech Status Terminal */}
              {status && (
                <div className="mt-8 bg-black/40 border border-slate-800 rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-300">
                  <div className="p-1 bg-purple-500/20 rounded-md mt-0.5">
                    <Clock size={14} className="text-purple-400" />
                  </div>
                  <p className="text-xs font-mono text-purple-400 uppercase tracking-widest leading-relaxed">
                    {status}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar — History */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="text-slate-500" size={20} /> History
              </h2>
              <button 
                onClick={fetchDeals}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {deals.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                   <p className="text-slate-600 font-medium tracking-tight">No historic contracts found.</p>
                </div>
              ) : (
                deals.map((deal) => (
                  <div 
                    key={deal.id} 
                    className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-1 bg-slate-800 rounded text-slate-400">ID: {deal.id.slice(0, 4)}</span>
                        <ExternalLink size={14} className="text-slate-600 group-hover:text-purple-400" />
                      </div>
                      <span className="text-lg font-black text-white">
                        ${deal.amount}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-400">
                      <span className="text-slate-200">{deal.buyer}</span>
                      <ArrowRight size={10} />
                      <span className="text-slate-200">{deal.seller}</span>
                    </div>

                    <div className="flex items-center justify-between">
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${statusColors[deal.status]}`}>
                         {deal.status.replace("_", " ")}
                       </div>
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                         {new Date(deal.created_at).toLocaleDateString()}
                       </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}