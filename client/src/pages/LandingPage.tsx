import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Wallet, PieChart, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">
              InterestCalc
            </span>
          </div>
          <Button asChild>
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative isolate pt-14 lg:pt-24">
          <div className="py-24 sm:py-32 lg:pb-40">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold font-display tracking-tight text-foreground sm:text-6xl mb-6">
                  Track your loans and interest with <span className="text-primary">clarity</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground mb-10">
                  Manage personal loans, track compound interest, and keep a history of transactions with friends and family. Simple, transparent, and secure.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full" asChild>
                    <a href="/api/login">Get Started for Free</a>
                  </Button>
                </div>
              </div>
              
              <div className="mt-16 flow-root sm:mt-24">
                <div className="rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  {/* Abstract UI Representation */}
                  <div className="bg-card shadow-2xl rounded-xl border border-border p-8 min-h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                      <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg border border-border/50">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Track Loans</h3>
                        <p className="text-sm text-muted-foreground">Record money given and taken with custom terms.</p>
                      </div>
                      <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg border border-border/50">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                          <PieChart className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Calculate Interest</h3>
                        <p className="text-sm text-muted-foreground">Automatic simple or compound interest calculations.</p>
                      </div>
                      <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg border border-border/50">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Secure History</h3>
                        <p className="text-sm text-muted-foreground">Keep permanent records of all payments and settlements.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} InterestCalc. All rights reserved.</p>
      </footer>
    </div>
  );
}
