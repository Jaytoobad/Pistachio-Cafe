import { isSupabaseConfigured } from '../../lib/supabase';
import * as real from './orders';
import * as demo from './orders.demo';

export function openPaystack(...args) {
  return isSupabaseConfigured ? real.openPaystack(...args) : demo.openPaystack(...args);
}

export async function createOrder(...args) {
  return isSupabaseConfigured ? real.createOrder(...args) : demo.createOrder(...args);
}

export async function verifyPayment(...args) {
  return isSupabaseConfigured ? real.verifyPayment(...args) : demo.verifyPayment(...args);
}

export function loadPaystackScript(...args) {
  return isSupabaseConfigured ? real.loadPaystackScript(...args) : Promise.resolve({});
}
