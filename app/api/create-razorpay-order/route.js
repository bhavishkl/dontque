import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request) {
  try {
    const { amount, currency, receipt, notes } = await request.json();

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials are not set');
      return NextResponse.json({ error: 'Razorpay credentials are not set' }, { status: 500 });
    }

    console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID.substring(0, 5) + '...');
    
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency || 'INR',
      receipt: receipt,
      notes: notes,
    };

    console.log('Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
}