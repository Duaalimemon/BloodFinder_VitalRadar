export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodInventory {
  [key: string]: number;
}

export interface BankProfile {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  ownerUid: string;
  inventory: BloodInventory;
  lat: number;
  lng: number;
  geohash: string;
  updatedAt?: any;
}

export interface DonorProfile {
  id: string;
  name: string;
  bloodType: BloodType;
  phone?: string;
  isAvailable: boolean;
  lat: number;
  lng: number;
  geohash: string;
  updatedAt?: any;
}

export interface EmergencyRequest {
  id: string;
  requesterUid: string;
  requesterName: string;
  bloodType: BloodType;
  urgencyLevel: 'Critical' | 'Urgent' | 'Stable';
  phone?: string;
  hospitalName?: string;
  patientName?: string;
  status: 'Pending' | 'Resolved' | 'Fulfilled' | 'Cancelled';
  lat: number;
  lng: number;
  geohash: string;
  createdAt: any;
}
