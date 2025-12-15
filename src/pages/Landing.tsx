/**
 * Landing.tsx
 * Main landing page with hero section and feature highlights.
 * Encourages users to connect wallet and explore the platform.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { Navbar } from '@/components/layout/Navbar';
import { WalletConnect } from '@/components/WalletConnect';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Shield,
  FileCheck,
  ArrowRightLeft,
  Receipt,
  ChevronRight,
  Blocks,
  Lock,
  Globe,
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { isConnected } = useWallet();

  // Main features of the platform
  const features = [
    {
      icon: FileCheck,
      title: 'Property Registration',
      description: 'Register land and property ownership securely on the blockchain with immutable records.',
    },
    {
      icon: ArrowRightLeft,
      title: 'Seamless Transfers',
      description: 'Transfer property ownership between parties with verified blockchain transactions.',
    },
    {
      icon: Receipt,
      title: 'Digital Receipts',
      description: 'Generate and download official receipts with transaction hashes for verification.',
    },
  ];

  // Benefits/highlights
  const highlights = [
    { icon: Blocks, label: 'Blockchain Secured' },
    { icon: Lock, label: 'Tamper Proof' },
    { icon: Globe, label: 'Accessible Anywhere' },
    { icon: Shield, label: 'Privacy Protected' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Blocks className="h-4 w-4" />
                Powered by Ethereum Sepolia
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
                Modern Estate
                <span className="block gradient-text">Registry Platform</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl">
                Secure, transparent, and efficient property registration and transfer 
                powered by blockchain technology. Your land records, immutably stored.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {isConnected ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="btn-gradient gap-2 px-8">
                      Go to Dashboard
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <WalletConnect variant="hero" />
                )}
                <Button variant="outline" size="lg" className="gap-2">
                  Learn More
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                {highlights.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative lg:h-[500px] animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative h-full flex items-center justify-center">
                <div className="glass-card rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-72 h-96 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-display font-semibold">Property Card</p>
                        <p className="text-xs text-muted-foreground">PROP-XYZ123</p>
                      </div>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="h-3 bg-secondary rounded-full w-3/4" />
                      <div className="h-3 bg-secondary rounded-full w-1/2" />
                      <div className="h-3 bg-secondary rounded-full w-2/3" />
                      <div className="h-20 bg-secondary/50 rounded-xl mt-4" />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-xs text-muted-foreground">Verified</span>
                      </div>
                      <Shield className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete solution for property registry management with blockchain-backed security.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="p-4 rounded-2xl bg-primary/10 w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect your MetaMask wallet to start registering and managing 
              your property records on the blockchain.
            </p>
            {isConnected ? (
              <Link to="/dashboard">
                <Button size="lg" className="btn-gradient gap-2 px-8">
                  Open Dashboard
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <WalletConnect variant="hero" />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold">EstateRegistry</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built on Ethereum Sepolia Testnet
          </p>
        </div>
      </footer>
    </div>
  );
};
