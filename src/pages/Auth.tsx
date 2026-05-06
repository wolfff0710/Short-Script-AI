import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { initiateWhopLogin } from "@/lib/whop";
import { useState } from "react";
import { toast } from "sonner";

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleWhopLogin = () => {
    setLoading(true);
    try {
      initiateWhopLogin();
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container max-w-md py-20">
        <div className="bg-gradient-card border border-border rounded-2xl p-8 shadow-card">
          <h1 className="text-2xl font-bold mb-2">Welcome</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with Whop to start generating scripts.
          </p>
          
          <Button 
            onClick={handleWhopLogin} 
            variant="hero" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Connecting..." : "Sign in with Whop"}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Free forever — unlimited scripts.
          </p>
        </div>
      </div>
    </div>
  );
}
