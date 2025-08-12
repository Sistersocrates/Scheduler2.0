import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SeminarCapacityManager = () => {
  const { toast } = useToast();
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [capacityUpdates, setCapacityUpdates] = useState({});

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seminars')
        .select('*')
        .order('title', { ascending: true });
      if (error) throw error;
      setSeminars(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch seminars.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCapacityChange = (seminarId, value) => {
    setCapacityUpdates((prev) => ({
      ...prev,
      [seminarId]: value,
    }));
  };

  const handleUpdateCapacity = async (seminarId) => {
    const newCapacity = capacityUpdates[seminarId];
    if (!newCapacity || isNaN(parseInt(newCapacity))) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid number for the capacity.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('seminars')
        .update({ capacity: parseInt(newCapacity) })
        .eq('id', seminarId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Seminar capacity updated successfully.',
      });
      // Refresh data
      fetchSeminars();
      // Clear the specific update from state
      setCapacityUpdates((prev) => {
        const newState = { ...prev };
        delete newState[seminarId];
        return newState;
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update capacity.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Manage Seminar Capacities</h2>
      {loading ? (
        <p>Loading seminars...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seminars.map((seminar) => (
                <tr key={seminar.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{seminar.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{seminar.teacher_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{seminar.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input
                      type="number"
                      className="w-24"
                      placeholder={seminar.capacity}
                      value={capacityUpdates[seminar.id] || ''}
                      onChange={(e) => handleCapacityChange(seminar.id, e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateCapacity(seminar.id)}
                      disabled={!capacityUpdates[seminar.id]}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default SeminarCapacityManager;
