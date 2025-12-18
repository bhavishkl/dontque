'use client';
import { Button, Input, Textarea, Accordion, AccordionItem } from '@nextui-org/react';
import { useSession } from '@/lib/mock-auth';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { LifeBuoy, Smartphone, Clock, User, Bell, MapPin } from 'lucide-react';

export default function SupportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  // For admin view
  const { data: tickets, mutate } = useSWR(
    session?.user?.role === 'admin' ? '/api/support' : null
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          message: formData.message.trim()
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }
      
      toast.success('Ticket submitted successfully!');
      setFormData({ subject: '', message: '' });
      
      // Refresh admin tickets list
      if (session?.user?.role === 'admin') {
        mutate('/api/support');
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (subject, message) => {
    setFormData({ subject, message });
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 50);
  };

  if (!session) return <div className="p-4">Please sign in to access support</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Support Center</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Common Questions & Solutions</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Quick Suggestions */}
          <div className="space-y-2">
            <p className="font-medium mb-2">Frequent Issues:</p>
            <Button 
              variant="flat" 
              className="w-full text-left justify-start"
              onPress={() => handleSuggestionClick(
                "Can't join queue",
                "I'm having trouble joining a queue using the short code..."
              )}
            >
              <Smartphone className="w-4 h-4 mr-2"/> Queue joining failed
            </Button>
            <Button 
              variant="flat" 
              className="w-full text-left justify-start"
              onPress={() => handleSuggestionClick(
                "Queue position not updating",
                "My position in the queue hasn't changed in..."
              )}
            >
              <Clock className="w-4 h-4 mr-2"/> Stuck queue position
            </Button>
            <Button 
              variant="flat" 
              className="w-full text-left justify-start"
              onPress={() => handleSuggestionClick(
                "Notification issues",
                "I didn't receive my turn notification for..."
              )}
            >
              <Bell className="w-4 h-4 mr-2"/> Missed notifications
            </Button>
          </div>

          {/* Category-based Help */}
          <div className="space-y-2">
            <p className="font-medium mb-2">Category Help:</p>
            <Button 
              variant="flat" 
              className="w-full text-left justify-start"
              onPress={() => handleSuggestionClick(
                "App crashes when scanning QR code",
                "The app consistently crashes when I try to scan a queue QR code..."
              )}
            >
              <LifeBuoy className="w-4 h-4 mr-2"/> QR Code Scanning Issue
            </Button>
            
            <Button 
              variant="flat" 
              className="w-full text-left justify-start"
              onPress={() => handleSuggestionClick(
                "GPS detection problems",
                "The app isn't detecting nearby queues in my area..."
              )}
            >
              <MapPin className="w-4 h-4 mr-2"/> Location Detection Failed
            </Button>

            <Button 
              variant="flat" 
              className="w-full text-left justify-start"
              onPress={() => handleSuggestionClick(
                "Multiple queue management",
                "I need help managing my position in multiple simultaneous queues..."
              )}
            >
              <Clock className="w-4 h-4 mr-2"/> Multi-Queue Assistance
            </Button>

            <Button 
              variant="flat" 
              className="w-full text-left justify-start"
              onPress={() => handleSuggestionClick(
                "Account verification issues",
                "I'm having trouble verifying my phone number/email..."
              )}
            >
              <User className="w-4 h-4 mr-2"/> Verification Problems
            </Button>

            <Button 
              variant="flat" 
              className="w-full text-left justify-start"
              onPress={() => handleSuggestionClick(
                "Payment failures",
                "My payment for priority queue access failed..."
              )}
            >
              <LifeBuoy className="w-4 h-4 mr-2"/> Payment Issues
            </Button>

            <Button 
              variant="flat" 
              className="w-full text-left justify-start"
              onPress={() => handleSuggestionClick(
                "Position transfer request",
                "How do I transfer my queue position to another device?..."
              )}
            >
              <MapPin className="w-4 h-4 mr-2"/> Transfer Queue Position
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-content1 rounded-lg">
          <p className="font-medium mb-2">Before submitting:</p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>Ensure app is updated to latest version</li>
            <li>Check internet connection stability</li>
            <li>Include queue short code if applicable</li>
            <li>Mention business name/location if queue-specific</li>
          </ul>
        </div>
      </div>

      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="space-y-4"
      >
        <Input
          label="Subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          isRequired
        />
        <Textarea
          label="Message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          minRows={4}
          isRequired
        />
        <Button 
          type="submit" 
          color="primary"
          isLoading={isSubmitting}
        >
          Submit Ticket
        </Button>
      </form>

      {session.user.role === 'admin' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">All Support Tickets</h2>
          <div className="space-y-4">
            {!tickets ? (
              <div className="p-4 text-center text-gray-500">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No tickets found</div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.ticket_id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600">{ticket.user_profile?.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{ticket.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}