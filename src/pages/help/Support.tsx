import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MessageSquare, Video, Book, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Support = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    category: "",
    subject: "",
    message: "",
  });

  const faqs = [
    {
      question: "How do I pair a child's device?",
      answer: "Go to the QR Scanner screen from your parent dashboard, then scan the QR code displayed on your child's device. Alternatively, you can manually enter the 15-digit pairing code.",
    },
    {
      question: "Can I monitor multiple devices?",
      answer: "Yes! You can pair and monitor multiple child devices from a single parent account. Each device will appear in your dashboard with its own controls and settings.",
    },
    {
      question: "How accurate is location tracking?",
      answer: "Location tracking uses GPS and is typically accurate to within 10-50 meters. Accuracy may vary based on signal strength and environmental factors.",
    },
    {
      question: "Can my child disable monitoring features?",
      answer: "Children can modify their permission settings, but you'll be immediately notified of any changes. Critical safety features require parent approval to disable.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes, all data is encrypted in transit and at rest. We use industry-standard security practices and never share your data with third parties.",
    },
    {
      question: "How do I unpair a device?",
      answer: "Go to Settings > Device Management, select the device you want to unpair, and choose 'Unpair Device'. Both parent and child will be notified.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Our support team will get back to you within 24 hours",
    });
    setContactForm({ category: "", subject: "", message: "" });
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout title="Help & Support">
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto flex-col gap-2 py-6">
            <Video className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Video Tutorials</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-6">
            <Book className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">User Guide</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-6">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Community</span>
          </Button>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No results found. Try different keywords or contact support.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Send us a message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={contactForm.category}
                  onValueChange={(value) =>
                    setContactForm({ ...contactForm, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="account">Account Problem</SelectItem>
                    <SelectItem value="pairing">Device Pairing</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Provide details about your issue..."
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="link" className="px-0 h-auto justify-start w-full">
              Troubleshooting Guide →
            </Button>
            <Button variant="link" className="px-0 h-auto justify-start w-full">
              Safety Tips for Parents →
            </Button>
            <Button variant="link" className="px-0 h-auto justify-start w-full">
              Privacy Best Practices →
            </Button>
            <Button variant="link" className="px-0 h-auto justify-start w-full">
              System Requirements →
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Support;
