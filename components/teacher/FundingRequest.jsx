import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import TeacherNav from '@/components/teacher/TeacherNav';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const FundingRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    purpose: '',
    amount: '',
    justification: '',
    comments: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('funding_requests').insert([
        {
          ...formData,
          teacher_id: user.id,
          status: 'pending',
        },
      ]);
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Funding request submitted successfully.',
      });
      setFormData({
        purpose: '',
        amount: '',
        justification: '',
        comments: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <TeacherNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Funding Request</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="purpose">Event/Purpose</Label>
              <Input id="purpose" name="purpose" type="text" value={formData.purpose} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="amount">Amount Requested ($)</Label>
              <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="justification">Justification</Label>
              <Textarea id="justification" name="justification" value={formData.justification} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea id="comments" name="comments" value={formData.comments} onChange={handleChange} />
            </div>
            <div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default FundingRequest;
