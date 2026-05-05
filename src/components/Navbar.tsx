import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          ShortScripts <span className="text-gradient">AI</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition">Pricing</Link>
          {user ? (
            <>
              <Link to="/generator" className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:inline">Generator</Link>
              <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:inline">History</Link>
              <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/auth"><Button variant="hero" size="sm">Start Free</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
