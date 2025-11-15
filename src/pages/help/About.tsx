import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Lock, Zap, Heart, ExternalLink } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "Family Safety",
      description: "Keep your family safe with comprehensive monitoring tools",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your data is encrypted and securely stored",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications about device activity",
    },
    {
      icon: Heart,
      title: "Built with Care",
      description: "Designed to strengthen family bonds",
    },
  ];

  return (
    <Layout title="About Mobiprotect">
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* App Header */}
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2">Mobiprotect</CardTitle>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary">Version 1.0.0</Badge>
                <Badge variant="outline">PWA</Badge>
              </div>
            </div>
            <CardDescription className="text-base">
              Comprehensive family digital safety and parental control solution
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>
              What makes Mobiprotect the best choice for your family
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg h-fit">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Build</span>
              <span className="text-sm font-medium">2025.01.001</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="text-sm font-medium">Progressive Web App</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium">January 2025</span>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Developer</CardTitle>
            <CardDescription>
              Created with love for families everywhere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Mobiprotect is developed by a team dedicated to helping families
                navigate the digital world safely. Our mission is to provide parents
                with the tools they need while respecting privacy and family values.
              </p>
              <Button variant="outline" className="w-full sm:w-auto">
                <Users className="h-4 w-4 mr-2" />
                Meet the Team
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Legal */}
        <Card>
          <CardHeader>
            <CardTitle>Legal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="link" className="px-0 h-auto justify-start">
              Terms of Service
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
            <Button variant="link" className="px-0 h-auto justify-start">
              Privacy Policy
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
            <Button variant="link" className="px-0 h-auto justify-start">
              Open Source Licenses
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Mobiprotect. All rights reserved.</p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
