import { isSupabaseConfigured } from '../../lib/supabase';
import * as real from './tracking';
import * as demo from './tracking.demo';

export const trackOrder = isSupabaseConfigured ? real.trackOrder : demo.trackOrder;
