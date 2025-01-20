import { supabase } from '../lib/supabase';

export const completeOnboarding = async (formData) => {
  try {
    // Create the queue
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .insert({
        name: formData.business.name,
        description: formData.business.description,
        category: formData.business.category,
        location: formData.business.city,
        address: formData.business.address,
        contact_number: formData.business.phone,
        max_capacity: formData.queue.maxCapacity,
        opening_time: formData.queue.openingTime,
        closing_time: formData.queue.closingTime,
        service_start_time: formData.queue.serviceStartTime,
        est_time_to_serve: formData.queue.serviceTime,
        queue_type: formData.queue.queueType,
        operating_days: formData.queue.operatingDays,
        status: 'active'
      })
      .select()
      .single();

    if (queueError) throw queueError;

    // Add services
    if (formData.services.length > 0) {
      const { error: servicesError } = await supabase
        .from('queue_services')
        .insert(
          formData.services.map(service => ({
            queue_id: queueData.id,
            name: service.name,
            duration: service.duration,
            price: service.price,
            description: service.description
          }))
        );

      if (servicesError) throw servicesError;
    }

    // Add staff members
    if (formData.staff.length > 0) {
      const { error: staffError } = await supabase
        .from('queue_staff')
        .insert(
          formData.staff.map(staff => ({
            queue_id: queueData.id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            counter_number: staff.assignedCounter
          }))
        );

      if (staffError) throw staffError;
    }

    return {
      success: true,
      queueId: queueData.id
    };

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 