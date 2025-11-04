'use client';
import React, { useState, useEffect } from 'react';


import type { User } from '@/types/user';
import { Customer } from '@/components/dashboard/customer/customers-table';

function generateToken(): string {
  const arr = new Uint8Array(12);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Test',
  lastName: 'Test',
  email: 'Test@commstack.co.uk',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
    /**
     * Create a new user
     */
    async createUser(userData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        idNumber: string;
        address: string;
        role: string;
        location: string;
        position: string;
        isActive: boolean;
        notes: string;
        startDate?: string;
        emergencyContactName?: string;
        emergencyContactPhone?: string;
        permissions?: Record<string, boolean>;
    }): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');

        try {
            // Map frontend fields to backend expected fields
            const requestData = {
                name: userData.firstName,
                surname: userData.lastName,
                password: Math.random().toString(36).slice(-10), // Generate random password
                idNumber: userData.idNumber,
                address: userData.address,
                cellNumber: userData.phone,
                email: userData.email,
                position: userData.position,
                role: userData.role,
                status: userData.isActive ? 'active' : 'inactive',
                notes: userData.notes,
                reason: '', // This field is empty as it wasn't specified in the frontend
                permissions: Object.entries(userData.permissions || {})
                    .filter(([_, hasPermission]) => hasPermission)
                    .map(([permission]) => ({ permission }))
            };

            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify(requestData),
                credentials: 'include',
            });

            if (!response.ok) {
                return { success: false, error: 'Authentication required' };
            }

            const data = await response.json();
            return { success: true, data, password: requestData.password };
        } catch (error) {
            console.error('Error creating user:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }

    /**
     * Fetch all incidents
     * GET http://localhost:1000/api/incident-management/all
     */
    async fetchIncidents(): Promise<any[]> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch('/api/incident-management/all', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching incidents:', error);
        return [];
      }
    }

    /**
     * Fetch incident details by ID
     * GET http://localhost:1000/api/incident-management/{id}
     */
    async fetchIncidentById(incidentId: string): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/incident-management/${incidentId}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          console.error('Failed to fetch incident details');
          return null;
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching incident details:', error);
        return null;
      }
    }

    /**
     * Fetch incident count by period
     * GET http://localhost:1000/api/incident-management/count?period={period}&value={value}&year={year}
     */
    async fetchIncidentCount(period: string, value: number, year: number): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/incident-management/count?period=${period}&value=${value}&year=${year}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          return { success: false, error: 'Failed to fetch incident count' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching incident count:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch incident count by severity
     * GET http://localhost:1000/api/incident-management/count-by-severity?period={period}
     */
    async fetchIncidentCountBySeverity(period: string): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/incident-management/count-by-severity?period=${period}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          return { success: false, error: 'Failed to fetch incident count by severity' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching incident count by severity:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch shaft inspection counts by section
     * GET http://localhost:1000/api/shaft-inspections/counts-by-section?period={period}
     */
    async fetchShaftInspectionCountsBySection(period: string): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/shaft-inspections/counts-by-section?period=${period}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          return { success: false, error: 'Failed to fetch shaft inspection counts by section' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching shaft inspection counts by section:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch shaft inspection counts by type
     * GET http://localhost:1000/api/shaft-inspections/counts-by-type?period={period}
     */
    async fetchShaftInspectionCountsByType(period: string): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/shaft-inspections/counts-by-type?period=${period}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          return { success: false, error: 'Failed to fetch shaft inspection counts by type' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching shaft inspection counts by type:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch contraventions statistics by status
     * GET http://localhost:1000/api/contraventions/stats/status?period={period}
     */
    async fetchContraventionsStatsByStatus(period: string): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/contraventions/stats/status?period=${period}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          return { success: false, error: 'Failed to fetch contraventions stats' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching contraventions stats:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Send a notification alert
     * POST /api/notifications
     */
    async sendNotification(payload: { title: string; type: string; message: string }): Promise<{ success: boolean; error?: string; data?: any }> {
      const token = localStorage.getItem('custom-auth-token');
      console.log('Token check in sendNotification:', token ? 'Token exists' : 'No token found');
      try {
        const requestBody = {
          title: payload.title,
          type: payload.type,
          message: payload.message,
        };
        console.log('Attempting to POST to /api/notifications with payload:', payload);
        console.log('Request body being sent:', requestBody);
        console.log('JSON stringified body:', JSON.stringify(requestBody));
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          body: JSON.stringify(requestBody),
          credentials: 'include',
        });
        console.log('Response status:', response.status, response.statusText);
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('Server error:', errorText);
          return { success: false, error: errorText || 'Request failed' };
        }
        const data = await response.json().catch(() => ({}));
        console.log('Notification sent successfully, response:', data);
        return { success: true, data };
      } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch all notifications
     * GET /api/notifications
     */
    async fetchNotifications(): Promise<{ success: boolean; data?: any[]; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch('/api/notifications', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch notifications' };
        }
        const data = await response.json();
        return { success: true, data: Array.isArray(data) ? data : [] };
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch notification by ID
     * GET /api/notifications/{id}
     */
    async fetchNotificationById(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch notification details' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching notification details:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch user permissions by email
     * GET /api/users/by-email?email={email}
     */
    async fetchUserPermissions(email: string): Promise<{ success: boolean; data?: { permissions: Array<{ permission: string }> }; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(`/api/users/by-email?email=${encodedEmail}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch user permissions' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch user details by email
     * GET /api/users/by-email?email={email}
     */
    async fetchUserByEmail(email: string): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(`/api/users/by-email?email=${encodedEmail}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch user details' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching user details:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch user details by ID
     * GET /api/users/{id}
     */
    async fetchUserById(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch user details' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching user details by ID:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Update current user's own details
     * PUT /api/users/me (for self-update)
     */
    async updateCurrentUser(userData: {
      name?: string;
      surname?: string;
      email?: string;
      cellNumber?: string;
      address?: string;
      position?: string;
      role?: string;
      permissions?: Array<{ permission: string }>;
      status?: string;
      notes?: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        console.log('Request headers:', {
          'Accept': '*/*',
          'Authorization': `Bearer ${token?.substring(0, 20) || 'null'}...`,
          'Content-Type': 'application/json',
        });
        
        const response = await fetch('/api/users/${userId}', {
          method: 'PUT',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
          credentials: 'include',
        });
        
        console.log('Response status:', response.status, response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (textError) {
            console.error('Failed to read error response:', textError);
            errorText = `HTTP ${response.status} ${response.statusText}`;
          }
          
          console.error(`PUT /api/users/me failed with status ${response.status}:`, errorText);
          
          // Provide more specific error messages based on status code
          let userFriendlyError = errorText;
          if (response.status === 404) {
            userFriendlyError = 'Update endpoint not found. Trying alternative method...';
          } else if (response.status === 401) {
            userFriendlyError = 'Authentication failed. Please sign in again.';
          } else if (response.status === 403) {
            userFriendlyError = 'Permission denied. You may not have rights to update user details.';
          } else if (response.status === 400) {
            userFriendlyError = 'Invalid data provided. Please check your input.';
          } else if (response.status >= 500) {
            userFriendlyError = 'Server error. Please try again later.';
          } else if (!errorText) {
            userFriendlyError = `Request failed with status ${response.status}`;
          }
          
          return { success: false, error: userFriendlyError };
        }
        
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse response JSON:', jsonError);
          data = { message: 'Update successful' };
        }
        
        console.log('PUT /api/users/me successful:', data);
        return { success: true, data };
      } catch (error) {
        console.error('Network or other error updating user details:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Network error occurred. Please check your connection.' 
        };
      }
    }

    /**
     * Update user details by ID (admin function)
     * PUT /api/users/{id}
     */
    async updateUser(userId: string, userData: {
      name?: string;
      surname?: string;
      email?: string;
      cellNumber?: string;
      address?: string;
      position?: string;
      role?: string;
      permissions?: Array<{ permission: string }>;
      status?: string;
      notes?: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        console.log(`Making PUT request to /api/users/${userId} with data:`, userData);
        console.log('Request headers:', {
          'Accept': '*/*',
          'Authorization': `Bearer ${token?.substring(0, 20) || 'null'}...`,
          'Content-Type': 'application/json',
        });
        
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
          credentials: 'include',
        });
        
        console.log('Response status:', response.status, response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
          } catch (textError) {
            console.error('Failed to read error response:', textError);
            errorText = `HTTP ${response.status} ${response.statusText}`;
          }
          
          console.error(`PUT /api/users/${userId} failed with status ${response.status}:`, errorText);
          
          // Provide more specific error messages based on status code
          let userFriendlyError = errorText;
          if (response.status === 404) {
            userFriendlyError = 'User not found. The user ID may be invalid.';
          } else if (response.status === 401) {
            userFriendlyError = 'Authentication failed. Please sign in again.';
          } else if (response.status === 403) {
            userFriendlyError = 'Permission denied. You may not have rights to update this user.';
          } else if (response.status === 400) {
            userFriendlyError = 'Invalid data provided. Please check your input.';
          } else if (response.status >= 500) {
            userFriendlyError = 'Server error. Please try again later.';
          } else if (!errorText) {
            userFriendlyError = `Request failed with status ${response.status}`;
          }
          
          return { success: false, error: userFriendlyError };
        }
        
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse response JSON:', jsonError);
          // If JSON parsing fails but request was successful, consider it a success
          data = { message: 'Update successful' };
        }
        
        console.log(`PUT /api/users/${userId} successful:`, data);
        return { success: true, data };
      } catch (error) {
        console.error('Network or other error updating user details:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Network error occurred. Please check your connection.' 
        };
      }
    }

    /**
     * Fetch monthly ore transport totals for a specific year
     * GET /api/ore-transports/monthly-totals?year={year}
     */
    async fetchMonthlyOreTotals(year: number): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/ore-transports/monthly-totals?year=${year}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch monthly ore totals' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching monthly ore totals:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch monthly gold sales data for a specific year
     * GET /api/ore-transports/monthly-gold-sales?year={year}
     */
    async fetchMonthlyGoldSales(year: number): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/ore-transports/monthly-gold-sales?year=${year}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch monthly gold sales data' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching monthly gold sales:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch shaft status counts (approved and suspended)
     * GET /api/shaft-assignments/status-counts
     */
    async fetchShaftStatusCounts(): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch('/api/shaft-assignments/status-counts', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch shaft status counts' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching shaft status counts:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch all shaft assignments
     * GET /api/shaft-assignments
     */
    async fetchAllShaftAssignments(): Promise<any[]> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch('/api/shaft-assignments', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
      if (!response.ok) {
        console.error('Failed to fetch shaft assignments:', response.status, response.statusText);
        return [];
      }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching all shaft assignments:', error);
        return [];
      }
    }

    /**
     * Fetch shaft assignment by shaft number
     * GET /api/shaft-assignments/by-shaft-number/{shaftNumber}
     */
    async fetchShaftAssignmentByShaftNumber(shaftNumber: string): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const encodedShaftNumber = encodeURIComponent(shaftNumber);
        const response = await fetch(`/api/shaft-assignments/by-shaft-number/${encodedShaftNumber}`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          console.error(`Failed to fetch shaft assignment for shaft number ${shaftNumber}:`, errorText);
          return { success: false, error: errorText || 'Failed to fetch shaft assignment' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error(`Error fetching shaft assignment for shaft number ${shaftNumber}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch approved security companies count
     * GET /api/security-companies/status/approved-count
     */
    async fetchApprovedSecurityCompaniesCount(): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch('/api/security-companies/status/approved-count', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch approved security companies count' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching approved security companies count:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Fetch approved miners count
     * GET /api/miners/approved-count
     */
    async fetchApprovedMinersCount(): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch('/api/miners/approved-count', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          return { success: false, error: errorText || 'Failed to fetch approved miners count' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching approved miners count:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Save section mapping (coordinates and metadata)
     * POST /api/sectionmapping
     */
    async saveSectionMapping(payload: {
      name: string;
      type: string;
      area: string;
      country: string;
      countryCoordinates: string;
      coordinates: Array<{
        type: string;
        points: Array<{ x: number; y: number }>
      }>;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch('/api/sectionmapping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
        if (!response.ok) {
          return { success: false, error: 'Authentication required' };
        }
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error saving section mapping:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Activate a section by ID
     * PUT /api/sections/{id}/activate
     */
    async activateSection(sectionId: string | number): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const safeId = encodeURIComponent(String(sectionId).trim());
        const response = await fetch(`/api/sections/${safeId}/activate`, {
          method: 'PUT',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          return { success: false, error: 'Authentication required' };
        }
        return { success: true };
      } catch (error) {
        console.error(`Error activating section with ID ${sectionId}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
      }
    }

    /**
     * Fetch approved production loans
     * GET /api/production-loan/approved
     */
    async fetchApprovedProductionLoans(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch('/api/production-loan/approved', {
                method: 'GET',
                headers: {
                    Accept: '*/*',
                    Authorization: `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : (data?.items ?? []);
        } catch (error) {
            console.error('Error fetching approved production loans:', error);
            return [];
        }
    }

    /**
     * Fetch only approved sections from the backend
     */
    async fetchSectionsApproved(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch('/api/sections/status/approved', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.sections || [];
        } catch (error) {
            console.error('Error fetching approved sections:', error);
            return [];
        }
    }
    /**
     * Fetch all sections from the backend
     */
    /**
     * Fetch all users from the backend
     */
   
    /**
     * Create a new contravention record
     * POST /api/contraventions
     */
    async createContravention(contraventionData: {
        mineid: string;
        contraventionOf: string[];
        raisedby: string;
        idOrNrNumber: string;
        address: string;
        occupation: string;
        holderOf: string;
        number: string;
        admitof: string;
        descriptionOfOffence: string;
        shaftnumber: string;
        offenceDate: string;
        signatureOfOffender: string;
        dateCharged: string;
        shaftStatus: string;
        inspectorOfMines: string;
        acceptedDate: string;
        status: string;
        remarks: string;
        fineAmount: number;
        finePaid: boolean;
        signed: string;
        sheManager: string;
        inspectorOfMiners: string;
        shaftid: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            console.log('Sending contravention data to API:', JSON.stringify(contraventionData));
            const response = await fetch('/api/contraventions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify(contraventionData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Request failed');
                console.error('Contravention creation failed:', errorText);
                return { success: false, error: errorText || 'Failed to create contravention' };
            }

            const data = await response.json();
            console.log('Contravention created successfully:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Error creating contravention:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }

    /**
     * Fetch all contraventions
     * GET /api/contraventions
     */
    async fetchContraventions(): Promise<{ success: boolean; data?: any[]; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch('/api/contraventions', {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Request failed');
                console.error('Failed to fetch contraventions:', errorText);
                return { success: false, error: errorText || 'Failed to fetch contraventions' };
            }

            const data = await response.json();
            console.log('Contraventions fetched successfully:', data);
            return { success: true, data: Array.isArray(data) ? data : [] };
        } catch (error) {
            console.error('Error fetching contraventions:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }

    /**
     * Fetch contravention details by ID
     * GET /api/contraventions/{id}
     */
    async fetchContraventionById(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch(`/api/contraventions/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Request failed');
                console.error('Failed to fetch contravention details:', errorText);
                return { success: false, error: errorText || 'Failed to fetch contravention details' };
            }

            const data = await response.json();
            console.log('Contravention details fetched successfully:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching contravention details:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }


    /**
     * Update shaft inspection by ID
     * PUT /api/shaft-inspections/{id}
     */
    async updateShaftInspection(inspectionId: string | number, inspectionData: {
        inspectorName: string;
        inspectionDate: string;
        status: string;
        inspectionType: string;
        hazardControlProgram: string;
        observations: string;
        pollutionStatus: string;
        correctiveActions: string;
        esapMaterials: string;
        complianceStatus: string;
        shaftNumbers: string;
        attachments: string[];
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            console.log('Updating shaft inspection:', inspectionId, JSON.stringify(inspectionData));
            const response = await fetch(`/api/shaft-inspections/${inspectionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify(inspectionData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Request failed');
                console.error('Shaft inspection update failed:', errorText);
                return { success: false, error: errorText || 'Failed to update shaft inspection' };
            }

            const data = await response.json();
            console.log('Shaft inspection updated successfully:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Error updating shaft inspection:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }

    /**
     * Create a new ore transport record
     */
    async createOre(oreData: {
        shaftNumbers: string;
        weight: string | number;
        numberOfBags: string | number;
        transportStatus: string;
        selectedTransportdriver?: string;
        selectedTransport?: string;
        originLocation?: string;
        destination?: string;
        notes?: string;
        transportReason?: string;
        processStatus?: string;
        location?: string;
        date?: string;
        time?: {
            hour: number;
            minute: number;
            second: number;
            nano: number;
        };
        tax: Array<{
            taxType: string;
            taxRate: number;
        }>;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
       

        try {
            // Format the data according to the API requirements
            // Format the data to match the backend model structure
            const requestData = {
                shaftNumbers: oreData.shaftNumbers, // Backend expects a string, not an array
                weight: Number(oreData.weight),
                numberOfBags: Number(oreData.numberOfBags),
                transportStatus: oreData.transportStatus,
                tax: oreData.tax,
                processStatus: oreData.processStatus || '',
                location: oreData.location || ''
                // Removed fields not in the backend model:
                // selectedTransportdriver, selectedTransport, transportReason, date, time
            };

            console.log('Sending request to API with data:', JSON.stringify(requestData));
            const response = await fetch('/api/ore-transports/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify(requestData),
                credentials: 'include',
            });

            if (!response.ok) {
                return { success: false, error: 'Authentication required' };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error creating ore transport record:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }

    /**
     * Create an incident record
     * POST http://localhost:1000/api/incident-management/create
     */
    async createIncident(payload: {
      incidentTitle: string;
      severityLevel: string;
      reportedBy: string;
      description: string;
      status?: string; // backend expects 'status'
      attachments: string[]; // base64 or URLs
      location: string;
      participants: Array<{ name: string; surname: string; nationalId: string; address: string }>
    }): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const requestData = {
          incidentTitle: payload.incidentTitle,
          severityLevel: payload.severityLevel,
          reportedBy: payload.reportedBy,
          description: payload.description,
          attachments: payload.attachments ?? [],
          location: payload.location,
          status: payload.status ?? 'OPEN',
          participants: payload.participants ?? []
        };

        console.log('Creating incident with data:', requestData);
        const response = await fetch('/api/incident-management/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          body: JSON.stringify(requestData),
          credentials: 'include',
        });

        console.log('Create incident response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          console.error('Create incident error:', errorText);
          return { success: false, error: errorText || 'Failed to create incident' };
        }
        const data = await response.json();
        console.log('Incident created successfully:', data);
        return { success: true, data };
      } catch (error) {
        console.error('Error creating incident record:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Resolve an incident by ID
     * PUT http://localhost:1000/api/incident-management/{id}/resolve?resolution={resolution}
     */
    async resolveIncident(incidentId: string, resolution: string): Promise<{ success: boolean; data?: any; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const encodedResolution = encodeURIComponent(resolution);
        const response = await fetch(`/api/incident-management/${incidentId}/resolve?resolution=${encodedResolution}`, {
          method: 'PUT',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });

        console.log('Resolve incident response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Request failed');
          console.error('Resolve incident error:', errorText);
          return { success: false, error: errorText || 'Failed to resolve incident' };
        }
        const data = await response.json().catch(() => ({}));
        console.log('Incident resolved successfully:', data);
        return { success: true, data };
      } catch (error) {
        console.error('Error resolving incident:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    }

    /**
     * Register a new security company
     * @param securityCompanyData The security company data to register
     * @returns A promise that resolves to the response data or error
     */
    async registerSecurityCompany(securityCompanyData: {
        companyName: string;
        registrationNumber: string;
        contactPhone: string;
        contactPersonName: string;
        contactEmail: string;
        siteAddress: string;
        serviceType: string;
        headOfficeAddress: string;
        numberOfWorks: string;
        startContractDate: string;
        endContractDate: string;
        emergencyContactPhone: string;
        emergencyContactName: string;
        locations: string[];
        validTaxClearance: string;
        companyLogo: string;
        getCertificateOfCooperation: string;
        operatingLicense: string;
        proofOfInsurance: string;
        siteRiskAssessmentReport: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');

        try {
            const response = await fetch('/api/security-companies/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify(securityCompanyData),
                credentials: 'include',
            });

            if (!response.ok) {
                return { success: false, error: 'Authentication required' };
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error registering security company:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }

    // registerDriver method is implemented elsewhere in the file
    
    // fetchDrivers method is implemented elsewhere in the file
    
    /**
     * Fetch driver details by ID
     */
    async fetchDriverById(driverId: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch(`/api/drivers/${driverId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                return { success: false, error: 'Authentication required' };
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching driver with ID ${driverId}:`, error);
            return null;
        }
    }
    async fetchMillById(driverId: string): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/mill-onboarding/${driverId}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              return { success: false, error: 'Authentication required' };
          }
          const data = await response.json();
          return data;
      } catch (error) {
          console.error(`Error fetching driver with ID ${driverId}:`, error);
          return null;
      }
  }

  /**
   * Approve a mill by ID
   * @param millId The ID of the mill to approve
   * @returns A promise that resolves to a success object or error
   */
  async approveMill(millId: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {

          const response = await fetch(`/api/mill-onboarding/${millId}/approve`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          
          if (!response.ok) {
              return { success: false, error: 'Authentication required' };
          }
          
          return { success: true };
      } catch (error) {
          console.error(`Error approving mill with ID ${millId}:`, error);
          return { 
              success: false, 
              error: error instanceof Error ? error.message : 'An unexpected error occurred' 
          };
      }
  }

  /**
   * Reject a mill by ID with reason
   * @param millId The ID of the mill to reject
   * @param reason The reason for rejection
   * @returns A promise that resolves to a success object or error
   */
  async rejectMill(millId: string, reason: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/mill-onboarding/${millId}/reject?reason=${encodeURIComponent(reason)}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          
          if (!response.ok) {
              return { success: false, error: 'Authentication required' };
          }
          
          return { success: true };
      } catch (error) {
          console.error(`Error rejecting mill with ID ${millId}:`, error);
          return { 
              success: false, 
              error: error instanceof Error ? error.message : 'An unexpected error occurred' 
          };
      }
  }

  /**
   * Push back a mill by ID with reason
   * @param millId The ID of the mill to push back
   * @param reason The reason for pushing back
   * @returns A promise that resolves to a success object or error
   */
  async pushbackMill(millId: string, reason: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/mill-onboarding/${millId}/pushback?reason=${encodeURIComponent(reason)}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          
          if (!response.ok) {
              return { success: false, error: 'Authentication required' };
          }
          
          return { success: true };
      } catch (error) {
          console.error(`Error pushing back mill with ID ${millId}:`, error);
          return { 
              success: false, 
              error: error instanceof Error ? error.message : 'An unexpected error occurred' 
          };
      }
  }
  
  /**
   * Fetch loans by shaft number
   * GET /api/shaft-assignments/by-shaft-number/{shaftNumber}/loans
   */
  async fetchLoansByShaftNumber(shaftNumber: string): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const safeShaft = encodeURIComponent(String(shaftNumber).trim());
          const url = `/api/shaft-assignments/by-shaft-number/${safeShaft}/loans`;
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              return { success: false, error: 'Authentication required' };
          }
          const data = await response.json();
          return data;
      } catch (error) {
          console.error(`Error fetching loans for shaft ${shaftNumber}:`, error);
          return [];
      }
  }

  /**
   * Fetch shaft assignments by miner ID
   * GET /api/shaft-assignments/by-miner/{minerId}
   */
  async fetchShaftAssignmentsByMiner(minerId: string | number): Promise<any[]> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const safeId = encodeURIComponent(String(minerId).trim());
          const url = `/api/shaft-assignments/by-miner/${safeId}`;
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              return [];
          }
          const data = await response.json();
          return Array.isArray(data) ? data : (data?.items ?? []);
      } catch (error) {
          console.error(`Error fetching shaft assignments for miner ${minerId}:`, error);
          return [];
      }
  }

  /**
   * Fetch shaft numbers by section name
   * GET /api/shaft-assignments/shaft-numbers/by-section/{sectionName}
   */
  async fetchShaftNumbersBySection(sectionName: string): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
          console.error('No token found in localStorage');
          return [];
      }
      try {
          const safeSection = encodeURIComponent(String(sectionName).trim());
          const url = `/api/shaft-assignments/shaft-numbers/by-section/${safeSection}`;
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              return { success: false, error: 'Authentication required' };
          }
          const data = await response.json();
          return data;
      } catch (error) {
          console.error(`Error fetching shaft numbers for section ${sectionName}:`, error);
          return [];
      }
  }

  /**
   * Approve a shaft loan by shaft assignment ID
   * PUT /api/shaft-assignments/{assignmentId}/loan/approve
   */
  async approveShaftLoan(assignmentId: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/shaft-assignments/${assignmentId}/loan/approve`, {
              method: 'PUT',
              headers: {
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              return { success: false, error: 'Authentication required' };
          }
          return { success: true };
      } catch (error) {
          console.error(`Error approving shaft loan for assignment ${assignmentId}:`, error);
          return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
      }
  }

  /**
   * Reject a shaft loan by shaft assignment ID, optional reason
   * PUT /api/shaft-assignments/{assignmentId}/loan/reject
   */
  async rejectShaftLoan(assignmentId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const url = new URL(`/api/shaft-assignments/${assignmentId}/loan/reject`, globalThis.location.origin);
          if (reason) url.searchParams.set('reason', reason);
          const response = await fetch(url.toString(), {
              method: 'PUT',
              headers: {
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              return { success: false, error: 'Authentication required' };
          }
          return { success: true };
      } catch (error) {
          console.error(`Error rejecting shaft loan for assignment ${assignmentId}:`, error);
          return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
      }
  }

  /**
   * Push back a shaft loan by shaft assignment ID, optional reason
   * PUT /api/shaft-assignments/{assignmentId}/loan/pushback
   */
  async pushBackShaftLoan(assignmentId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const url = new URL(`/api/shaft-assignments/${assignmentId}/loan/pushback`, globalThis.location.origin);
          if (reason) url.searchParams.set('reason', reason);
          const response = await fetch(url.toString(), {
              method: 'PUT',
              headers: {
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
      if (!response.ok) {
        return { success: false, error: 'Authentication required' };
      }
          return { success: true };
      } catch (error) {
          console.error(`Error pushing back shaft loan for assignment ${assignmentId}:`, error);
          return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
      }
  }

  /**
   * Pay a shaft loan by assignment ID and amount paid
   * PUT /api/shaft-assignments/{assignmentId}/loan/payment?amountPaid={amount}
   */
  async payShaftLoan(assignmentId: string | number, amountPaid: number): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const safeId = encodeURIComponent(String(assignmentId).trim());
          const url = new URL(`/api/shaft-assignments/${safeId}/loan/payment`, globalThis.location.origin);
          url.searchParams.set('amountPaid', String(amountPaid));
          const response = await fetch(url.toString(), {
              method: 'PUT',
              headers: {
                  Accept: '*/*',
                  Authorization: `Bearer ${token}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              return { success: false, error: 'Authentication required' };
          }
          return { success: true };
      } catch (error) {
          console.error(`Error paying shaft loan for assignment ${assignmentId}:`, error);
          return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
      }
  }

    async  fetchsecurityonboarding(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch('/api/security-companies/register', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.users || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    async fetchSecurityCompany(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch('/api/security-companies', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to fetch security companies:', response.status, response.statusText);
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.securityCompanies || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }
    // Transport cost actions (moved here from inside fetchSecurityCompany)
    /**
     * Approve a transport cost entry by ID
     */
    async approveTransportCost(id: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/transport-cost-onboarding/${id}/approve`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          return { success: false, error: 'Authentication required' };
        }
        return { success: true };
      } catch (error) {
        console.error(`Error approving transport cost with ID ${id}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
      }
    }

    /**
     * Reject a transport cost entry by ID with reason
     */
    async rejectTransportCost(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/transport-cost-onboarding/${id}/reject?reason=${encodeURIComponent(reason)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          console.error('Failed to reject transport cost:', response.status, response.statusText);
          return { success: false, error: 'Request failed' };
        }
        return { success: true };
      } catch (error) {
        console.error(`Error rejecting transport cost with ID ${id}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
      }
    }

    /**
     * Push back a transport cost entry by ID with reason
     */
    async pushbackTransportCost(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
        const response = await fetch(`/api/transport-cost-onboarding/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          console.error('Failed to pushback transport cost:', response.status, response.statusText);
          return { success: false, error: 'Request failed' };
        }
        return { success: true };
      } catch (error) {
        console.error(`Error pushing back transport cost with ID ${id}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
      }
    }
    /**
     * Fetch all ore transport data from the backend
     * @returns A promise that resolves to an array of ore transport records
     */
    async fetchOreTransportData(): Promise<any[]> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch('/api/ore-transports/allOre', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              console.error('Failed to fetch ore transport data:', response.status, response.statusText);
              return [];
          }
          const data = await response.json();
          return Array.isArray(data) ? data : data.users || [];
      } catch (error) {
          console.error('Error fetching ore transport data:', error);
          return [];
      }
  }

    /**
     * Fetch all refined ore to gold data from the backend
     * @returns A promise that resolves to an array of refined ore records
     */
    async fetchRefinedOreData(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        
        try {
            const response = await fetch('/api/ore-transports/security-dispatcher/received', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to fetch refined ore data:', response.status, response.statusText);
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.records || [];
        } catch (error) {
            console.error('Error fetching refined ore data:', error);
            return [];
        }
    }

  async fetchOretaxData(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
        const response = await fetch('/api/ore-transports/with-selected-transportdriver-changed', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token || ''}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        return Array.isArray(data) ? data : data.users || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}
async fetchOreDispatcher(): Promise<any[]> {
  const token = localStorage.getItem('custom-auth-token');
  try {
      const response = await fetch('/api/ore-transports/security-dispatcher/not-specified', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
      });
      if (!response.ok) {
          throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.users || [];
  } catch (error) {
      console.error('Error fetching users:', error);
      return [];
  }
}
async fetchOreRecieve(): Promise<any[]> {
  const token = localStorage.getItem('custom-auth-token');
  try {
      const response = await fetch('/api/ore-transports/security-dispatcher/received', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
      });
      if (!response.ok) {
          throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.users || [];
  } catch (error) {
      console.error('Error fetching users:', error);
      return [];
  }
}

async fetchOreRecieved(): Promise<any[]> {
  const token = localStorage.getItem('custom-auth-token');
  try {
      const response = await fetch('/api/ore-transports/security-dispatcher/dispatched', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
      });
      if (!response.ok) {
          throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.users || [];
  } catch (error) {
      console.error('Error fetching users:', error);
      return [];
  }
}
  async fetchtax(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
        const response = await fetch('/api/taxdidections', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token || ''}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to fetch tax data:', response.status, response.statusText);
            return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : data.taxes || [];
    } catch (error) {
        console.error('Error fetching tax data:', error);
        return [];
    }
  }

  async fetchTransportCost(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
        const response = await fetch('/api/transport-cost-onboarding', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token || ''}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to fetch transport cost data:', response.status, response.statusText);
            return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : (data.transportCosts || data.items || []);
    } catch (error) {
        console.error('Error fetching transport costs:', error);
        return [];
    }
  }
  
  /**
   * Fetch transport cost details by ID
   */
  async fetchTransportCostDetails(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    try {
        const response = await fetch(`/api/transport-cost-onboarding/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token || ''}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to fetch transport cost details:', response.status, response.statusText);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching transport cost with ID ${id}:`, error);
        return null;
    }
  }
  
  /**
   * Create a new transport cost entry
   */
  async createTransportCost(costData: {
    paymentMethod: string;
    amountOrGrams: number;
    reason: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
        console.error('No token found in localStorage');
        return { success: false, error: 'Authentication required' };
    }

    try {
        const response = await fetch('/api/transport-cost-onboarding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': `Bearer ${token || ''}`,
            },
            body: JSON.stringify(costData),
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Failed to create transport cost:', response.status, response.statusText);
            return { success: false, error: 'Request failed' };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error creating transport cost:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
    }
  }
  
  /**
   * Fetch only approved tax directions from the backend
   * @returns A promise that resolves to an array of approved tax directions
   */
  async fetchApprovedTaxDirections(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
        const response = await fetch('/api/taxdidections/approved', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': `Bearer ${token || ''}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to fetch approved tax directions:', response.status, response.statusText);
            return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : data.taxes || [];
    } catch (error) {
        console.error('Error fetching approved tax directions:', error);
        return [];
    }
  }
  
  async createTax(taxData: {
    taxType: string;
    taxRate: number;
    location: string;
    description: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
        console.error('No token found in localStorage');
        return { success: false, error: 'Authentication required' };
    }

    try {
        const response = await fetch('/api/taxdidections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Authorization': `Bearer ${token || ''}`,
            },
            body: JSON.stringify(taxData),
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Failed to create tax:', response.status, response.statusText);
            return { success: false, error: 'Request failed' };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error creating tax:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
    }
  }
  
  async fetchUsers(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token || ''}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        return Array.isArray(data) ? data : data.users || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
  }
    
    /**
     * Fetch production loan details by ID
     */
    async fetchProductionDetails(customerId: string): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/production-loan/${customerId}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              console.error('Failed to fetch production loan details:', response.status, response.statusText);
              return null;
          }
          const data = await response.json();
          return data;
      } catch (error) {
          console.error(`Error fetching production loan with ID ${customerId}:`, error);
          return null;
      }
  }

  /**
   * Fetch all production loans
   */
  async fetchProductionData(): Promise<any[]> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch('/api/production-loan/all', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              console.error('Failed to fetch production loan data:', response.status, response.statusText);
              return [];
          }
          const data = await response.json();
          return Array.isArray(data) ? data : [];
      } catch (error) {
          console.error('Error fetching production loans:', error);
          return [];
      }
  }

  /**
   * Create a new production loan
   */
  async createProductionLoan(loanData: any): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch('/api/production-loan/create', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
              body: JSON.stringify(loanData)
          });

          const data = await response.json();
          
          if (!response.ok) {
              console.error('Failed to create production loan:', response.status, response.statusText);
              return { success: false, error: 'Request failed' };
          }
          
          return { success: true, data };
      } catch (error) {
          console.error('Error creating production loan:', error);
          return { success: false, error: 'Failed to create production loan' };
      }
  }

  /**
   * Approve a production loan by ID
   * @param loanId The ID of the production loan to approve
   * @returns A promise that resolves to a success object or error
   */
  async approveProductionLoan(loanId: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/production-loan/${loanId}/approve`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          
          if (!response.ok) {
              console.error('Failed to approve production loan:', response.status, response.statusText);
              return { success: false, error: 'Request failed' };
          }
          
          return { success: true };
      } catch (error) {
          console.error(`Error approving production loan with ID ${loanId}:`, error);
          return { 
              success: false, 
              error: error instanceof Error ? error.message : 'An unexpected error occurred' 
          };
      }
  }

  /**
   * Reject a production loan by ID with reason
   * @param loanId The ID of the production loan to reject
   * @param reason The reason for rejection
   * @returns A promise that resolves to a success object or error
   */
  async rejectProductionLoan(loanId: string, reason: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/production-loan/${loanId}/reject?reason=${encodeURIComponent(reason)}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          
          if (!response.ok) {
              console.error('Failed to reject production loan:', response.status, response.statusText);
              return { success: false, error: 'Request failed' };
          }
          
          return { success: true };
      } catch (error) {
          console.error(`Error rejecting production loan with ID ${loanId}:`, error);
          return { 
              success: false, 
              error: error instanceof Error ? error.message : 'An unexpected error occurred' 
          };
      }
  }

  /**
   * Push back a production loan by ID with reason
   * @param loanId The ID of the production loan to push back
   * @param reason The reason for pushing back
   * @returns A promise that resolves to a success object or error
   */
  async pushbackProductionLoan(loanId: string, reason: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/production-loan/${loanId}/push-back?reason=${encodeURIComponent(reason)}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          
          if (!response.ok) {
              console.error('Failed to push back production loan:', response.status, response.statusText);
              return { success: false, error: 'Request failed' };
          }
          
          return { success: true };
      } catch (error) {
          console.error(`Error pushing back production loan with ID ${loanId}:`, error);
          return { 
              success: false, 
              error: error instanceof Error ? error.message : 'An unexpected error occurred' 
          };
      }
  }

    
    /**
     * Approve a user by ID
     */
    async approveUser(userId: string): Promise<{ success: boolean; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch(`/api/users/${userId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                console.error('Failed to approve user:', response.status, response.statusText);
                return { success: false, error: 'Request failed' };
            }
            
            return { success: true };
        } catch (error) {
            console.error(`Error approving user with ID ${userId}:`, error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'An unexpected error occurred' 
            };
        }
    }
    async approveTax(userId: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/taxdidections/${userId}/approve`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          
          if (!response.ok) {
              console.error('Failed to approve tax direction:', response.status, response.statusText);
              return { success: false, error: 'Request failed' };
          }
          
          return { success: true };
      } catch (error) {
          console.error(`Error approving user with ID ${userId}:`, error);
          return { 
              success: false, 
              error: error instanceof Error ? error.message : 'An unexpected error occurred' 
          };
      }
  }
  
  /**
   * Fetch activated mills from the backend
   * @returns A promise that resolves to an array of activated mills
   */
  async fetchActivatedMills(): Promise<any[]> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch('/api/mill-onboarding/activated', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': '*/*',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              console.error('Failed to fetch activated mills:', response.status, response.statusText);
              return [];
          }
          const data = await response.json();
          return Array.isArray(data) ? data : [];
      } catch (error) {
          console.error('Error fetching activated mills:', error);
          return [];
      }
  }
    /**
     * Reject a user by ID with reason
     */
    async rejectUser(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch(`/api/users/${userId}/reject?reason=${encodeURIComponent(reason)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                console.error('Failed to reject user:', response.status, response.statusText);
                return { success: false, error: 'Request failed' };
            }
            
            return { success: true };
        } catch (error) {
            console.error(`Error rejecting user with ID ${userId}:`, error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'An unexpected error occurred' 
            };
        }
    }

    async pushtax(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/taxdidections/${userId}/pushback?reason=${encodeURIComponent(reason)}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText || 'Failed to reject user');
          }
          
          return { success: true };
      } catch (error) {
          console.error(`Error rejecting user with ID ${userId}:`, error);
          return { 
              success: false, 
              error: error instanceof Error ? error.message : 'An unexpected error occurred' 
          };
      }
  }


    async rejectTax(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
      const token = localStorage.getItem('custom-auth-token');
      try {
          const response = await fetch(`/api/taxdidections/${userId}/reject?reason=${encodeURIComponent(reason)}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText || 'Failed to reject user');
          }
          
          return { success: true };
      } catch (error) {
          console.error(`Error rejecting user with ID ${userId}:`, error);
          return { 
              success: false, 
              error: error instanceof Error ? error.message : 'An unexpected error occurred' 
          };
      }
  }
    
    /**
     * Push back a user by ID with reason
     */
    async pushbackUser(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch(`/api/users/${userId}/pushback?reason=${encodeURIComponent(reason)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                console.error('Failed to pushback user:', response.status, response.statusText);
                return { success: false, error: 'Request failed' };
            }
            
            return { success: true };
        } catch (error) {
            console.error(`Error pushing back user with ID ${userId}:`, error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'An unexpected error occurred' 
            };
        }
    }

    /**
     * Register a new mill
     * @param millData The mill data to register
     * @returns A promise that resolves to the response data or error
     */
    async registerMill(millData: {
        millName: string;
        millLocation: string;
        millType: string;
        owner: string;
        idNumber: string;
        address: string;
        picture: string;
        status: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return { success: false, error: 'Authentication required' };
        }

        try {
            const response = await fetch('/api/mill-onboarding/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify(millData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to register mill');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error registering mill:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }


    /**
     * Reject a mill by ID with reason
     * @param millId The ID of the mill to reject
     * @param reason The reason for rejection
     * @returns A promise that resolves to a success object or error
     */

    /**
     * Push back a mill by ID with reason
     * @param millId The ID of the mill to push back
     * @param reason The reason for pushing back
     * @returns A promise that resolves to a success object or error
     */
  


    async fetchSections(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch('/api/sections', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to fetch sections:', response.status, response.statusText);
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.sections || [];
        } catch (error) {
            console.error('Error fetching sections:', error);
            return [];
        }
    }
    async fetchAllMiners(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        try {
            const response = await fetch('/api/sections/miners', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to fetch miners:', response.status, response.statusText);
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.miners || [];
        } catch (error) {
            console.error('Error fetching miners:', error);
            return [];
        }
    }
  
  /**
   * Fetch all drivers from the backend
   */
  async fetchapprovedshaft(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const response = await fetch('/api/shaft-assignments/approved', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Failed to fetch approved shaft assignments:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.drivers || [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  }

  async fetchDrivers(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const response = await fetch('/api/drivers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Failed to fetch drivers:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.drivers || [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  }
  async fetchMill(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const response = await fetch('/api/mill-onboarding/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Failed to fetch mills:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.drivers || [];
    } catch (error) {
      console.error('Error fetching mills:', error);
      return [];
    }
  }
  /**
   * Approve a driver by ID
   * @param driverId The ID of the driver to approve
   * @returns A promise that resolves to the response data or error
   */
  async approveDriver(driverId: string): Promise<{ success: boolean; error?: string }> {
  const token = localStorage.getItem('custom-auth-token');
  try {
    const response = await fetch(`/api/drivers/${driverId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      console.error('Failed to approve driver:', response.status, response.statusText);
      return { success: false, error: 'Request failed' };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error approving driver with ID ${driverId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Apply tax to an ore transport
 * @param oreId The ID of the ore transport to apply tax to
 * @returns A promise that resolves to the response data or error
 */
async applyTax(oreId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = localStorage.getItem('custom-auth-token');
  if (!token) {
    console.error('No token found in localStorage');
    return { success: false, error: 'Authentication required' };
  }
  try {
    const response = await fetch(`/api/ore-transports/${oreId}/apply-tax`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${token || ''}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to apply tax:', response.status, response.statusText);
      return { success: false, error: 'Request failed' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error applying tax to ore transport:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

  /**
   * Reject a driver by ID with reason
   * @param driverId The ID of the driver to reject
   * @param reason The reason for rejection
   * @returns A promise that resolves to the response data or error
   */
  async rejectDriver(driverId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    if (!reason.trim()) {
      return { success: false, error: 'Reason is required for rejection' };
    }
    
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required' };
    }
    try {
      const response = await fetch(`/api/drivers/${driverId}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Failed to reject driver:', response.status, response.statusText);
        return { success: false, error: 'Request failed' };
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error rejecting driver with ID ${driverId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Push back a driver by ID with reason
   * @param driverId The ID of the driver to push back
   * @param reason The reason for pushing back
   * @returns A promise that resolves to the response data or error
   */
  async pushbackDriver(driverId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    if (!reason.trim()) {
      return { success: false, error: 'Reason is required for pushback' };
    }
    
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required' };
    }
    try {
      const response = await fetch(`/api/drivers/${driverId}/pushback?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Failed to pushback driver:', response.status, response.statusText);
        return { success: false, error: 'Request failed' };
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error pushing back driver with ID ${driverId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

    /**
     * Fetch a company by its ID
     */
    async fetchCompanyById(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return null;
        }
        try {
            const response = await fetch(`/api/companies/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to fetch company by ID:', response.status, response.statusText);
                return null;
            }
            
            // Check if response has content before parsing JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                if (text.trim()) {
                    return JSON.parse(text);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching company details:', error);
            return null;
        }
    }
    
    /**
     * Set a miner for approval
     * @param id The ID of the miner to approve
     * @returns A promise that resolves to the response data or null on error
     */
    async setMinerForApproval(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return null;
        }
        try {
            const response = await fetch(`/api/miners/${id}/set_for_approval`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to set miner for approval:', response.status, response.statusText);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Error approving miner:', error);
            return null;
        }
    }

    async setCompanyMinerForApproval(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return null;
        }
        try {
            const response = await fetch(`/api/companies/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to set company miner for approval:', response.status, response.statusText);
                return null;
            }
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                return text; // Return plain text if not JSON
            }
        } catch (error) {
            console.error('Error approving miner:', error);
            return null;
        }
    }

    /**
     * Set a miner for rejection
     * @param id The ID of the miner to reject
     * @param reason The reason for rejection
     * @returns A promise that resolves to the response data or null on error
     */
    async setMinerForRejection(id: string, reason: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return null;
        }
        try {
            // Using the new API endpoint format with reason as a query parameter
            const response = await fetch(`/api/miners/${id}/reject?reason=${encodeURIComponent(reason)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to set miner for rejection:', response.status, response.statusText);
                return null;
            }
            return await response.text();
        } catch (error) {
            console.error('Error rejecting miner:', error);
            return null;
        }
    }
    async setCompanyMinerForRejection(id: string, reason: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return null;
        }
        try {
            // Using the new API endpoint format with reason as a query parameter
            const response = await fetch(`/api/companies/${id}/reject?reason=${encodeURIComponent(reason)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to set company miner for rejection:', response.status, response.statusText);
                return null;
            }
            return await response.text();
        } catch (error) {
            console.error('Error rejecting miner:', error);
            return null;
        }
    }

    /**
     * Set a miner for push back
     * @param id The ID of the miner to push back
     * @param reason The reason for pushing back
     * @returns A promise that resolves to the response data or null on error
     */
    async setMinerForPushBack(id: string, reason: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return null;
        }
        try {
            // Using the new API endpoint format with reason as a query parameter
            const response = await fetch(`/api/miners/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to set miner for pushback:', response.status, response.statusText);
                return null;
            }
            return await response.text();
        } catch (error) {
            console.error('Error pushing back miner:', error);
            return null;
        }
    }

    async setCompanyMinerForPushBack(id: string, reason: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return null;
        }
        try {
            // Using the new API endpoint format with reason as a query parameter
            const response = await fetch(`/api/companies/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to set company miner for pushback:', response.status, response.statusText);
                return null;
            }
            return await response.text();
        } catch (error) {
            console.error('Error pushing back miner:', error);
            return null;
        }
    }
    /**
     * Fetch approved companies for shaft assignment
     * GET /api/companies/status/approved
     */
    async fetchApprovedCompanies(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/companies/status/approved', {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to fetch approved companies');
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching approved companies:', error);
            return [];
        }
    }

    /**
     * Fetch companies from the endpoint /api/companies
     * Returns an array of companies or an empty array on error.
     */
    async fetchCompaniesFromEndpoint(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/companies', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }
            const text = await response.text();
            if (!text) {
                return [];
            }
            try {
                const data = JSON.parse(text);
                return Array.isArray(data) ? data : (data.companies || []);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                console.log('Raw response:', text);
                return [];
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            return [];
        }
    }

    async fetchCompaniesApproved(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/companies/status/approved', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }
            const text = await response.text();
            if (!text) {
                return [];
            }
            try {
                const data = JSON.parse(text);
                return Array.isArray(data) ? data : (data.companies || []);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                console.log('Raw response:', text);
                return [];
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            return [];
        }
    }
    async registerCompany(formData: any): Promise<{ error?: string; success?: boolean }> {
        try {
            const token = localStorage.getItem('custom-auth-token');
            if (!token) {
                throw new Error('Authentication required');
            }

            // Check if documents are directly in formData or in a nested documents object
            const documents = formData.documents || formData;
            
            const requestData = {
                companyName: formData.companyName,
                address: formData.address,
                cellNumber: formData.contactNumber,
                email: formData.email,
                companyLogo: documents.companyLogo,
                certificateOfCooperation: documents.certificateOfCooperation,
                cr14Copy: documents.cr14Document,
                miningCertificate: documents.miningCertificate,
                taxClearance: documents.taxClearance,
                passportPhoto: documents.passportPhotos, // Handle as a single string, not an array
                ownerName: formData.ownerName,
                ownerSurname: formData.ownerSurname,
                ownerAddress: formData.ownerAddress,
                ownerCellNumber: formData.ownerCellNumber,
                ownerIdNumber: formData.ownerIdNumber
            };

            console.log('Sending company registration data:', requestData);

            const response = await fetch('/api/companies/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' // Added Content-Type header
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            let data;
            const responseText = await response.text();
            
            try {
                // Try to parse as JSON
                data = JSON.parse(responseText);
            } catch {
                // If it's not valid JSON, use the raw text
                data = responseText;
            }

            if (!response.ok) {
                console.error('Failed to register company:', response.status, response.statusText);
                return { success: false, error: 'Request failed' };
            }

            return { 
                success: true 
            };
        } catch (error: any) {
            console.error('Error during company registration:', error);
            return { 
                error: 'Failed to register company. Please try again.',
                success: false 
            };
        }
    }
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

 async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string; token?: string }> {
  const { email, password } = params;

  try {
    const response = await fetch('/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    console.log('Login response:', data); // Debug: show full response

    if (!response.ok) {
      // Special handling for 401 Unauthorized
      if (response.status === 401) {
        return { error: 'Invalid email or password' };
      }
      // For other errors, use the API response message
      return { error: data.message || data.error || 'Authentication failed' };
    }

    // Assuming the API returns a token in the response
    const token = data.token || generateToken();
    
    localStorage.setItem('custom-auth-token', token);

    // Store user details from response
    if (data.user) {
      localStorage.setItem('custom-auth-user', JSON.stringify(data.user));
    } else {
      // If user object not in response, store available data
      const userData = {
        email: data.email || email,
        name: data.name || data.username || '',
        role: data.role || '',
        id: data.id || data.userId || '',
      };
      localStorage.setItem('custom-auth-user', JSON.stringify(userData));
    }

    return { token };
  } catch {
    // Try to parse the error message if it's from the API
   
    // If it's a network error or other issue
    return { error: 'Invalid email or password' };
  }
}
    async fetchCompanies(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/companies/getall', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }

            const text = await response.text();
            if (!text) {
                return [];
            }

            try {
                const data = JSON.parse(text);
                return Array.isArray(data) ? data : (data.companies || []);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                console.log('Raw response:', text);
                return [];
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            return [];
        }
    }
    async fetchCompanyDetails(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return null;
        }
        try {
            const response = await fetch(`/api/companies/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customer details');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching customer details:', error);
            return null;
        }
    }
    async fetchProductionloanDetails(id: string): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
          console.error('No token found in localStorage');
          return null;
      }
      try {
          const response = await fetch(`/api/production-loan/${id}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              throw new Error('Failed to fetch customer details');
          }
          return await response.json();
      } catch (error) {
          console.error('Error fetching customer details:', error);
          return null;
      }
  }
    async fetchOreDetails(id: string): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
          console.error('No token found in localStorage');
          return null;
      }
      try {
          const response = await fetch(`/api/ore-transports/${id}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              throw new Error('Failed to fetch customer details');
          }
          return await response.json();
      } catch (error) {
          console.error('Error fetching customer details:', error);
          return null;
      }
  }
  
  /**
   * Fetch approved shaft assignments
   * @returns A promise that resolves to the approved shaft assignments or null on error
   */
  async fetchApprovedShaftAssignments(): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
          console.error('No token found in localStorage');
          return null;
      }
      try {
          const response = await fetch('/api/shaft-assignments/approved', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              console.error('Failed to fetch approved shaft assignments:', response.status, response.statusText);
              return null;
          }
          return await response.json();
      } catch (error) {
          console.error('Error fetching approved shaft assignments:', error);
          return null;
      }
  }

  async fetchSecurityDetails(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
        console.error('No token found in localStorage');
        return null;
    }
    try {
        const response = await fetch(`/api/security-companies/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token || ''}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            console.error('Failed to fetch security details:', response.status, response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching customer details:', error);
        return null;
    }
}
  
    async fetchTaxDetails(id: string): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
          console.error('No token found in localStorage');
          return null;
      }
      try {
          const response = await fetch(`/api/taxdidections/${id}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token || ''}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              console.error('Failed to fetch tax details:', response.status, response.statusText);
              return null;
          }
          return await response.json();
      } catch (error) {
          console.error('Error fetching customer details:', error);
          return null;
      }
  }
  
    async fetchCustomerDetails(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return null;
        }
        try {
            const response = await fetch(`/api/miners/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to fetch customer details:', response.status, response.statusText);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching customer details:', error);
            return null;
        }
    }

    async fetchCustomers(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/miners/getall', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }
     async fetchSection(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/sections', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }
    
    /**
     * Fetch deactivated-pending sections from the backend
     */
    async fetchSectionDeactivatedPending(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/sections/status/deactivated-pending', {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch deactivated-pending sections');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.sections || [];
        } catch (error) {
            console.error('Error fetching deactivated-pending sections:', error);
            return [];
        }
    }

    async fetchSectionstatus(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/sections', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }
    async fetchShaftapproved(): Promise<Customer[]> {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
          console.error('No token found in localStorage');
          return [];
      }
      try {
          const response = await fetch('/api/shaft-assignments/approved', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  Authorization: `Bearer ${token}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              throw new Error('Failed to fetch customers');
          }
          const data = await response.json();
          
          return Array.isArray(data) ? data : data.customers || [];
      } catch (error) {
          console.error('Error fetching customers:', error);
          return [];
      }
  }

    async fetchShaftstatus(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/shaft-assignments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }

    /**
     * Fetch shaft assignment(s) by miner ID
     * GET /api/shaft-assignments/by-miner/{id}
     */


    /**
     * Update loan details for a shaft assignment by assignment ID.
     * PUT /api/shaft-assignments/{assignmentId}/update-loan-details?loanName=...&paymentMethod=...&amountOrGrams=...&purpose=...&status=...&reason=...
     */
    async updateShaftLoanDetails(
        assignmentId: string,
        payload: {
            loanName: string;
            paymentMethod: string;
            amountOrGrams: number;
            purpose: string;
            status: string;
            reason: string;
        }
    ): Promise<{ success: boolean; message?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return { success: false, message: 'Not authenticated' };
        }

        try {
            const qs = new URLSearchParams({
                loanName: payload.loanName,
                paymentMethod: payload.paymentMethod,
                amountOrGrams: String(payload.amountOrGrams),
                purpose: payload.purpose,
                status: payload.status,
                reason: payload.reason,
            });
            const url = `/api/shaft-assignments/${encodeURIComponent(assignmentId)}/update-loan-details?${qs.toString()}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                return { success: false, message: text || 'Failed to update shaft loan details' };
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating shaft loan details:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
     async fetchApprovedminer(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/miners/getapproved', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }
    
    async fetchPendingCustomers(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/miners/getall', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const text = await response.text();
      
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                return [];
            }
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }
       async fetchAllCompany(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            return [];
        }
        try {
            const response = await fetch('/api/companies', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const text = await response.text();
      
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                return [];
            }
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }

  /**
   * Create a new incident
   */


  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }
  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      console.log('[AuthClient]: No token found in localStorage');
      return { data: null };
    }

    // Get user details from localStorage
    try {
      const userStr = localStorage.getItem('custom-auth-user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        console.log('[AuthClient]: Found user data in localStorage:', userData);
        // Map to User type
        const mappedUser: User = {
          id: userData.id || '1',
          name: userData.name || '',
          avatar: userData.avatar || '/assets/avatar.png',
          email: userData.email || '',
        };
        return { data: mappedUser };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // If we have a token but no user data, return the default user
    console.log('[AuthClient]: Token exists but no user data, returning default user');
    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('custom-auth-user');
    return {};
  }

  async registerMiner(data: {
    name: string;
    surname: string;
    address: string;
    cell: string;
    nationId: string;
    position: string;
cooperativename: string;
    idPicture: string;  // Changed to string for base64
    teamMembers: Array<{
      name: string;
      surname: string;
      address: string;
      idNumber: string;
   
    }>;
  }): Promise<{ error?: string; success?: boolean }> {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Send JSON data with base64 image
      const response = await fetch('/api/miners/createminers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          surname: data.surname,
          address: data.address,
          cellNumber: data.cell,
          nationIdNumber: data.nationId,
          position: data.position,
          cooperativename: data.cooperativename,
          idPicture: data.idPicture,  // Send base64 image string
          teamMembers: data.teamMembers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register miner');
      }

      const result = await response.json();
      return { success: true };
    } catch (error) {
      console.error('Error registering miner:', error);
      return { error: error instanceof Error ? error.message : 'Failed to register miner' };
    }
  }

  /**
   * Create shaft assignment
   * @param shaftAssignmentData The shaft assignment data
   * @returns A promise that resolves to the response data or null on error
   */
  async createShaftAssignment(shaftAssignmentData: {
    sectionName: string;
    shaftNumbers: string;
    medicalFee: string;
    reason: string;
    status: string;
    regFee: string;
    startContractDate: string;
    endContractDate: string;
    latitude: number;
    longitude: number;
    minerId?: string;
  }): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      throw new Error('Authentication required. Please sign in first.');
    }
    const response = await fetch('/api/shaft-assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(shaftAssignmentData),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Failed with status ${response.status}`);
    }
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  

  /**
   * Create a new section
   * @param sectionData The section data
   * @returns A promise that resolves to the response data or throws an error
   */
  async createSection(sectionData: {
    sectionName: string;
    numberOfShaft: string;
    status: string;
    reason: string;
  }): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
 
    try {
      const response = await fetch('/api/sections/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(sectionData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to create section: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  }

  /**
   * Create a penalty record
   * @param penaltyData The penalty data
   * @returns A promise that resolves to the response data or throws an error
   */
  async createPenalty(penaltyData: {
    shaftNumber: string;
    section: string;
    penilatyFee: number;
    reportedBy: string;
    issue: string;
    remarks: string;
  }): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      const response = await fetch('/api/penalities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(penaltyData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to create penalty: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating penalty:', error);
      throw error;
    }
  }

  /**
   * Suspend shaft assignment for SHE (Safety, Health, Environment) violation
   * @param shaftAssignmentId The ID of the shaft assignment to suspend
   * @param reason The reason for suspension
   * @returns A promise that resolves to the response data or throws an error
   */
  async suspendShaftAssignmentForSHE(shaftAssignmentId: string | number, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      const encodedReason = encodeURIComponent(reason);
      const response = await fetch(`/api/shaft-assignments/${shaftAssignmentId}/suspend-for-she?reason=${encodedReason}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to suspend shaft assignment: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error suspending shaft assignment:', error);
      throw error;
    }
  }

  /**
   * Fetch all penalties
   * @returns A promise that resolves to the penalties data or empty array on error
   */
  async fetchPenalties(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return [];
    }
    try {
      const response = await fetch('/api/penalities', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Failed to fetch penalties:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching penalties:', error);
      return [];
    }
  }

  /**
   * Fetch penalty details by ID
   * @param penaltyId The ID of the penalty to fetch
   * @returns A promise that resolves to the penalty details or null on error
   */
  async fetchPenaltyById(penaltyId: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      const response = await fetch(`/api/penalities/${penaltyId}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        console.error('Failed to fetch penalty details');
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching penalty details:', error);
      return null;
    }
  }

  /**
   * Approve a section
   * @param id The ID of the section to approve
   * @returns A promise that resolves to the response data or null on error
   */
  async setShaftForApproval(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      const response = await fetch(`/api/shaft-assignments/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to approve section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error approving section:', error);
      return null;
    }
  }
  async setSectionForApproval(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      const response = await fetch(`/api/sections/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to approve section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error approving section:', error);
      return null;
    }
  }

  async approveVehicle(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      const response = await fetch(`/api/vehicles/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to approve section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error approving section:', error);
      return null;
    }
  }

  async setShaftAssignmentForApproval(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      const response = await fetch(`/api/sections/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to approve section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error approving section:', error);
      return null;
    }
  }

  /**
   * Reject a section
   * @param id The ID of the section to reject
   * @param reason The reason for rejection
   * @returns A promise that resolves to the response data or null on error
   */
  
  async setSectionForPushBack(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      const response = await fetch(`/api/sections/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to pushback section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error pushing back section:', error);
      return null;
    }
  }
  async setSectionForRejection(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
    try {
      const response = await fetch(`/api/sections/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to reject section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error rejecting section:', error);
      return null;
    }
  }
  async setShaftForRejection(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required' };
    }
    try {
      const response = await fetch(`/api/shaft-assignments/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to reject section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error rejecting section:', error);
      return null;
    }
  }

  /**
   * Push back a section
   * @param id The ID of the section to push back
   * @param reason The reason for pushing back
   * @returns A promise that resolves to the response data or null on error
   */
  async setShaftForPushBack(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required' };
    }
    try {
      const response = await fetch(`/api/shaft-assignments/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to push back section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error pushing back section:', error);
      return null;
    }
  }

  async rejectVehicle(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`/api/vehicles/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to push back section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error pushing back section:', error);
      return null;
    }
  }

  async pushBackVehicle(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`/api/vehicles/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to push back section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error pushing back section:', error);
      return null;
    }
  }

  /**
   * Import miners data to the backend
   * @param data The miners data to import
   * @returns A promise that resolves to the response data or null on error
   */
  async importMinersData(data: any[]): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch('/api/miners/import', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to import data: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error sending imported data:', error);
      return null;
    }
  }

  /**
   * Register a new driver
   * @param driverData The driver data to register
   * @returns A promise that resolves to the response data or error
   */
  async registerDriver(driverData: {
    firstName: string;
    lastName: string;
    idNumber: string;
    dateOfBirth: any; // dayjs.Dayjs | null
    licenseNumber: string;
    licenseClass: string;
    licenseExpiryDate: any; // dayjs.Dayjs | null
    yearsOfExperience: string;
    phoneNumber: string;
    emailAddress: string;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    licenseDocument: string | null; // Changed to string for base64
    idDocument: string | null; // Changed to string for base64
    additionalNotes: string;
  }): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Safely format dates if they exist and have format method
      const dateOfBirth = driverData.dateOfBirth && typeof driverData.dateOfBirth.format === 'function' 
        ? driverData.dateOfBirth.format('YYYY-MM-DD') 
        : null;
        
      const licenseExpiryDate = driverData.licenseExpiryDate && typeof driverData.licenseExpiryDate.format === 'function' 
        ? driverData.licenseExpiryDate.format('YYYY-MM-DD') 
        : null;
      
      // Create the request data with all fields including base64 document strings
      const requestData = {
        firstName: driverData.firstName,
        lastName: driverData.lastName,
        idNumber: driverData.idNumber,
        dateOfBirth: dateOfBirth,
        licenseNumber: driverData.licenseNumber,
        licenseClass: driverData.licenseClass,
        licenseExpiryDate: licenseExpiryDate,
        yearsOfExperience: Number.parseInt(driverData.yearsOfExperience) || 0,
        phoneNumber: driverData.phoneNumber,
        emailAddress: driverData.emailAddress,
        address: driverData.address,
        emergencyContactName: driverData.emergencyContactName,
        emergencyContactPhone: driverData.emergencyContactPhone,
        licenseDocument: driverData.licenseDocument, // Now a base64 string
        idDocument: driverData.idDocument, // Now a base64 string
        additionalNotes: driverData.additionalNotes
      };

      const response = await fetch('/api/drivers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `Failed to register driver: ${response.statusText}`;
        } catch {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Failed to register driver: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Clone the response before reading its body
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error registering driver:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Register a new vehicle
   * @param vehicleData The vehicle data to register
   * @returns A promise that resolves to the response data or error
   */
  async registerVehicle(vehicleData: {
    regNumber: string;
    vehicleType: string;
    make: string;
    model: string;
    year: string;
    assignedDriver: string;
    lastServiceDate: any; // dayjs.Dayjs | null
    ownerName: string;
    ownerAddress: string;
    ownerCellNumber: string;
    ownerIdNumber: string;
    idPicture: File | null;
    truckPicture: File | null;
    registrationBook: File | null;
  }): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Convert file objects to base64 strings
      const idPictureBase64 = vehicleData.idPicture ? await this.fileToBase64(vehicleData.idPicture) : null;
      const truckPictureBase64 = vehicleData.truckPicture ? await this.fileToBase64(vehicleData.truckPicture) : null;
      const registrationBookBase64 = vehicleData.registrationBook ? await this.fileToBase64(vehicleData.registrationBook) : null;
      
      // Safely format date if it exists and has format method
      const lastServiceDate = vehicleData.lastServiceDate && typeof vehicleData.lastServiceDate.format === 'function' 
        ? vehicleData.lastServiceDate.format('YYYY-MM-DD') 
        : null;
      
      // Map frontend fields to backend expected fields
      const requestData = {
        regNumber: vehicleData.regNumber,
        vehicleType: vehicleData.vehicleType,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        assignedDriver: vehicleData.assignedDriver,
        lastServiceDate: lastServiceDate,
        ownerName: vehicleData.ownerName,
        ownerAddress: vehicleData.ownerAddress,
        ownerCellNumber: vehicleData.ownerCellNumber,
        ownerIdNumber: vehicleData.ownerIdNumber,
        idPicture: idPictureBase64,
        truckPicture: truckPictureBase64,
        registrationBook: registrationBookBase64,
      };

      const response = await fetch('/api/vehicles/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `Failed to register vehicle: ${response.statusText}`;
        } catch {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Failed to register vehicle: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Clone the response before reading its body
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error registering vehicle:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Convert a File object to a base64 string
   * @param file The file to convert
   * @returns A promise that resolves to the base64 string
   */
  fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., 'data:image/jpeg;base64,') to get just the base64 string
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      });
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Get the authentication token from localStorage
   * @returns The authentication token or null if not found
   */
  getToken(): string | null {
    if (globalThis.window !== undefined) {
      return localStorage.getItem('custom-auth-token');
    }
    return null;
  }

  /**
   * Fetch all vehicles from the API
   * @returns A promise that resolves to the vehicles data
   */
  async fetchVehicles(): Promise<any[]> {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No authentication token found');
      }

      const response = await fetch('/api/vehicles', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching vehicles: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  async fetchApprovedVehicles(): Promise<any[]> {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No authentication token found');
      }

      const response = await fetch('/api/vehicles/status/approved', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching vehicles: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }
  /**
   * Fetch approved drivers from the API
   * @returns A promise that resolves to the approved drivers data
   */
  async fetchApprovedDrivers(): Promise<any[]> {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No authentication token found');
      }

      const response = await fetch('/api/drivers/status/approved', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching approved drivers: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching approved drivers:', error);
      throw error;
    }
  }
  
  /**
   * Fetch ore transport data
   * @returns A promise that resolves to the ore data
   */
  async fetchOre(): Promise<any[]> {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No authentication token found');
      }

      const response = await fetch('/api/ore-transports/allOre', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching approved drivers: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching approved drivers:', error);
      throw error;
    }
  }


    // This method is implemented above - removing duplicate implementation



  /**
   * Fetch vehicle details by ID
   * @param vehicleId The ID of the vehicle to fetch
   * @returns A promise that resolves to the vehicle details
   */
  async fetchVehicleById(vehicleId: string): Promise<any | null> {
    try {
      // Get token from localStorage directly to ensure we have the latest token
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        console.warn('No authentication token found in localStorage');
        throw new Error('Authentication token not found');
      }

      console.log('Using token for vehicle fetch:', token.slice(0, 10) + '...');

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      console.log('Vehicle fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Error fetching vehicle details: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching vehicle with ID ${vehicleId}:`, error);
      return null;
    }
  }

  /**
   * Approve a security company by ID
   * @param id The ID of the security company to approve
   * @returns A promise that resolves to the response data or error
   */
  async approveSecurityCompany(id: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch(`/api/security-companies/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to approve security company: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error approving security company:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Reject a security company by ID with reason
   * @param id The ID of the security company to reject
   * @param reason The reason for rejection
   * @returns A promise that resolves to the response data or error
   */
  async rejectSecurityCompany(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch(`/api/security-companies/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to reject security company: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error rejecting security company:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Push back a security company by ID with reason
   * @param id The ID of the security company to push back
   * @param reason The reason for pushing back
   * @returns A promise that resolves to the response data or error
   */
  async pushBackSecurityCompany(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      return fetch(`/api/security-companies/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      .then(response => {
        if (!response.ok) {
          return response.json().catch(() => ({}))
            .then(errorData => {
              throw new Error(errorData.message || `Failed to push back security company: ${response.status}`);
            });
        }
        return { success: true };
      });
    } catch (error) {
      console.error('Error pushing back security company:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Send a vehicle to maintenance
   * @param vehicleId The ID of the vehicle to send to maintenance
   * @returns A promise that resolves to the response data or error
   */
  async sendVehicleToMaintenance(vehicleId: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/maintainance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to send vehicle to maintenance: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending vehicle to maintenance:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Fetch vehicles by approved status
   * @returns A promise that resolves to the approved vehicles data
   */
  async fetchVehiclesByApprovedStatus(): Promise<any[]> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return [];
    }

    try {
      const response = await fetch('/api/vehicles/status/approved', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch approved vehicles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching approved vehicles by status:', error);
      return [];
    }
  }

  /**
   * Update ore transport fields
   * @param oreId The ID of the ore transport to update
   * @param fields The fields to update (selectedTransportdriver, transportStatus, selectedTransport, transportReason)
   * @returns A promise that resolves to the response data or error
   */
  async updateOreTransportFields(oreId: string, fields: {
    selectedTransportdriver: string;
    transportStatus: string;
    selectedTransport: string;
    transportReason: string;
    location:string
  }): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Construct the query string from the fields object
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(fields)) {
        queryParams.append(key, value);
      }

      const response = await fetch(`/api/ore-transports/${oreId}/fields?${queryParams.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update ore transport fields: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating ore transport fields:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Approve ore dispatch by security dispatcher
   * @param oreId The ID of the ore transport to approve for dispatch
   * @returns A promise that resolves to success status and optional error
   */
  async securityDispatchApprove(oreId: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }
    
    try {
      const response = await fetch(`/api/ore-transports/${oreId}/security-dispatcher/dispatched`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve dispatch: ${errorText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error approving ore dispatch:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  async securityRecievedApprove(oreId: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }
    
    try {
      const response = await fetch(`/api/ore-transports/${oreId}/security-dispatcher/received`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve dispatch: ${errorText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error approving ore received:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  /**
   * Assign a mill to an ore transport
   * @param oreId The ID of the ore transport
   * @param millId The ID of the mill
   * @param millName The name of the mill
   * @param millType The type of the mill
   * @param millLocation The location of the mill
   * @returns A promise that resolves to a success object or error
   */
  async assignMillToOre(
    oreId: string,
    millId: string,
    millName: string,
    millType: string,
    millLocation: string
  ): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }
    
    try {
      const response = await fetch(
        `/api/ore-transports/${oreId}/mills/unknown?millid=${millId}&millName=${encodeURIComponent(millName)}&millType=${encodeURIComponent(millType)}&location=${encodeURIComponent(millLocation)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to assign mill: ${errorText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning mill to ore:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * Collect sample for an ore transport
   * @param oreId The ID of the ore transport
   * @param sampleType The type of sample
   * @param sampleWeight The weight of the sample
   * @param status The status of the sample (e.g., "pending for results")
   * @returns A promise that resolves to success status and optional error
   */
  async collectSample(
    oreId: string,
    sampleType: string,
    sampleWeight: string,
    status: string
  ): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('sampleType', sampleType);
      queryParams.append('sampleWeight', sampleWeight);
      queryParams.append('status', status);
      // Some backends may still expect sampleSize; send an empty value to maintain compatibility
      if (!queryParams.has('sampleSize')) {
        queryParams.append('sampleSize', '');
      }
     
      
      const response = await fetch(
        `/api/ore-transports/${oreId}/collect-sample?${queryParams.toString()}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        const details = `status=${response.status} ${response.statusText}`;
        throw new Error(`Failed to collect sample: ${errorText || details}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error collecting sample for ore transport:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * Update sample results for an ore transport
   * @param oreId The ID of the ore transport
   * @param reason The reason for the sample result
   * @param result The result of the sample
   * @param status The status of the sample result (e.g., "Approved", "Rejected")
   * @returns A promise that resolves to success status and optional error
   */
  async updateSampleResults(
    oreId: string,
    reason: string,
    result: string,
    status: string
  ): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      globalThis.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }
    
    try {
      console.log('updateSampleResults - Input parameters:', { oreId, reason, result, status });
      
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || globalThis.location.origin).toString().replace(/\/$/, '');
      const safeId = encodeURIComponent(String(oreId).trim());
      const urlObj = new URL(`/api/ore-transports/${safeId}/update-sample-status-reason`, base);
      urlObj.searchParams.set('newReason', String(reason ?? ''));
      urlObj.searchParams.set('newResult', String(result ?? ''));
      urlObj.searchParams.set('newStatus', String(status ?? ''));

      const url = urlObj.toString();
      console.log('updateSampleResults - Request URL:', url);

      const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        }
      );
      
      console.log('updateSampleResults - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('updateSampleResults - Error response:', errorText);
        throw new Error(`Failed to update sample results: ${errorText}`);
      }
      const responseData = await response.text();
      console.log('updateSampleResults - Success response:', responseData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating sample results for ore transport:', error);
      return {  
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  /**
   * Create shaft assignment fee
   * POST /api/shaft-assignment-fees/create
   */
  async createShaftAssignmentFee(payload: { regFee: number; medicalFee: number }): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const response = await fetch('/api/shaft-assignment-fees/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to create shaft assignment fee' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      console.error('Error creating shaft assignment fee:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Get all shaft assignment fees
   * GET /api/shaft-assignment-fees/all
   */
  async fetchShaftAssignmentFees(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const response = await fetch('/api/shaft-assignment-fees/all', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to fetch shaft assignment fees' };
      }
      const data = await response.json().catch(() => []);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error fetching shaft assignment fees:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Update a shaft assignment fee by ID
   * PUT /api/shaft-assignment-fees/{id}
   */
  async updateShaftAssignmentFee(id: string | number, payload: { regFee: number; medicalFee: number }): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const response = await fetch(`/api/shaft-assignment-fees/${encodeURIComponent(String(id))}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to update shaft assignment fee' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating shaft assignment fee:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Delete a shaft assignment fee by ID
   * DELETE /api/shaft-assignment-fees/{id}?deletedBy={name}
   */
  async deleteShaftAssignmentFee(id: string | number, deletedBy: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const url = `/api/shaft-assignment-fees/${encodeURIComponent(String(id))}?deletedBy=${encodeURIComponent(deletedBy)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to delete shaft assignment fee' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting shaft assignment fee:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Fetch approved sections
   * GET /api/sections/status/approved
   */
  async fetchApprovedSections(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const response = await fetch('/api/sections/status/approved', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to fetch approved sections' };
      }
      const data = await response.json().catch(() => []);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error fetching approved sections:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Assign shaft assignment
   * PUT /api/shaft-assignments/assign/{shaftId}
   */
  async assignShaftAssignment(shaftId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const encodedShaftId = encodeURIComponent(shaftId);
      const response = await fetch(`/api/shaft-assignments/assign/${encodedShaftId}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to assign shaft' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      console.error('Error assigning shaft:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Update shaft number for a registered miner
   * PUT /api/shaft-assignments/regminer/update-shaftnumber/{customerId}?shaftNumber={shaftNumber}
   */
  async updateShaftNumberForRegMiner(customerId: string, shaftNumber: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const encodedCustomerId = encodeURIComponent(customerId);
      const encodedShaftNumber = encodeURIComponent(shaftNumber);
      const response = await fetch(`/api/shaft-assignments/regminer/update-shaftnumber/${encodedCustomerId}?shaftNumber=${encodedShaftNumber}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to update shaft number' };
      }
      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating shaft number for registered miner:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Fetch unassigned shafts by section name
   * GET /api/shaft-assignments/unassigned/by-section/{sectionName}
   */
  async fetchUnassignedShaftsBySection(sectionName: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const encodedSectionName = encodeURIComponent(sectionName);
      const response = await fetch(`/api/shaft-assignments/unassigned/by-section/${encodedSectionName}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to fetch unassigned shafts' };
      }
      const data = await response.json().catch(() => []);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error fetching unassigned shafts by section:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Update miner ID for a shaft assignment
   * PUT /api/shaft-assignments/{shaftId}/update-miner-id?newMinerId={newMinerId}
   */
  async updateShaftMinerId(shaftId: string, newMinerId: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const encodedShaftId = encodeURIComponent(shaftId);
      const encodedMinerId = encodeURIComponent(newMinerId);
      const response = await fetch(`/api/shaft-assignments/${encodedShaftId}/update-miner-id?newMinerId=${encodedMinerId}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to update shaft miner ID' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating shaft miner ID:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Assign a shaft to a miner
   * PUT /api/shaft-assignments/assign/{shaftId}
   */
  async assignShaftToMiner(shaftId: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const encodedShaftId = encodeURIComponent(shaftId);
      const response = await fetch(`/api/shaft-assignments/assign/${encodedShaftId}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to assign shaft to miner' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error assigning shaft to miner:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Update shaft number for a registered miner
   * PUT /api/shaft-assignments/regminer/update-shaftnumber/{minerId}?shaftNumber={shaftNumber}
   */
  async updateRegMinerShaftNumber(minerId: string, shaftNumber: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const encodedMinerId = encodeURIComponent(minerId);
      const encodedShaftNumber = encodeURIComponent(shaftNumber);
      const response = await fetch(`/api/shaft-assignments/regminer/update-shaftnumber/${encodedMinerId}?shaftNumber=${encodedShaftNumber}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to update registered miner shaft number' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating registered miner shaft number:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Update shaft number for a company
   * PUT /api/shaft-assignments/company/update-shaftnumber/{companyId}?shaftNumber={shaftNumber}
   */
  async updateCompanyShaftNumber(companyId: string, shaftNumber: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const encodedCompanyId = encodeURIComponent(companyId);
      const encodedShaftNumber = encodeURIComponent(shaftNumber);
      const response = await fetch(`/api/shaft-assignments/company/update-shaftnumber/${encodedCompanyId}?shaftNumber=${encodedShaftNumber}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to update company shaft number' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating company shaft number:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Fetch training by ID
   * GET /api/trainers/{id}
   */
  async fetchTrainingById(id: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    
    try {
      const response = await fetch(`http://localhost:1000/api/trainers/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to fetch training details' };
      }
      
      const data = await response.json().catch(() => null);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching training details:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Fetch all trainings
   * GET /api/trainers
   */
  async fetchTrainings(): Promise<{ success: boolean; error?: string; data?: any[] }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    
    try {
      const response = await fetch('http://localhost:1000/api/trainers', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to fetch trainings' };
      }
      
      const data = await response.json().catch(() => []);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching trainings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Delete a training by ID
   * DELETE /api/trainers/{id}
   */
  async deleteTraining(id: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    
    try {
      const response = await fetch(`http://localhost:1000/api/trainers/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to delete training' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting training:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Update a training by ID
   * PUT /api/trainers/{id}
   */
  async updateTraining(id: string, trainingData: {
    trainingType: string;
    trainerName: string;
    scheduleDate: string;
    location: string;
    materials: string[];
    safetyProtocols: string[];
    trainees: {
      name: string;
      employeeId: string;
      department: string;
      position: string;
      attended: boolean;
      feedback: string;
    }[];
    status: string;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.warn('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    
    try {
      const response = await fetch(`http://localhost:1000/api/trainers/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(trainingData),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to update training' };
      }
      
      const data = await response.json().catch(() => null);
      return { success: true, data };
    } catch (error) {
      console.error('Error updating training:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Create a new training
   * POST /api/trainers
   */
  async createTraining(trainingData: {
    trainingType: string;
    trainerName: string;
    scheduleDate: string;
    location: string;
    materials: string[];
    safetyProtocols: string[];
    trainees: Array<{
      name: string;
      employeeId: string;
      department: string;
      position: string;
      attended: boolean;
      feedback: string;
    }>;
    status: string;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    
    try {
      const response = await fetch('http://localhost:1000/api/trainers', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to create training' };
      }
      
      const data = await response.json().catch(() => null);
      return { success: true, data };
    } catch (error) {
      console.error('Error creating training:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Create a new shaft inspection
   * POST /api/shaft-inspections
   */
  async createShaftInspection(inspectionData: {
    inspectorName: string;

    inspectionDate: string;
    status: string;
    inspectionType: string;
    hazardControlProgram: string;
    observations: string;
    pollutionStatus: string;
    correctiveActions: string;
    esapMaterials: string;
    complianceStatus: string;
    shaftNumbers: string;
    attachments: string[];
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    
    try {
      console.log('Creating shaft inspection with data:', inspectionData);
      const response = await fetch('/api/shaft-inspections', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inspectionData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (textError) {
          console.error('Failed to read error response:', textError);
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        
        console.error(`POST /api/shaft-inspections failed with status ${response.status}:`, errorText);
        
        // Handle authentication errors by redirecting to sign-in
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication failed, redirecting to sign-in');
          // Removed redirect to /auth-sign-in per cleanup policy
          return { success: false, error: 'Authentication required. Redirecting to sign-in...' };
        }
        
        // Provide more specific error messages based on status code
        let userFriendlyError = errorText;
        if (response.status === 404) {
          userFriendlyError = 'Shaft inspection endpoint not found. Please check if the API is running.';
        } else if (response.status === 400) {
          userFriendlyError = 'Invalid data provided. Please check your input.';
        } else if (response.status >= 500) {
          userFriendlyError = 'Server error. Please try again later.';
        } else if (!errorText) {
          userFriendlyError = `Request failed with status ${response.status}`;
        }
        
        return { success: false, error: userFriendlyError };
      }
      
      const data = await response.json().catch(() => null);
      console.log('Shaft inspection created successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error creating shaft inspection:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Fetch all shaft inspections
   * GET /api/shaft-inspections
   */
  async fetchShaftInspections(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    
    if (!token) {
      console.error('No authentication token found');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    
    try {
      console.log('Fetching shaft inspections...');
      const response = await fetch('/api/shaft-inspections', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (textError) {
          console.error('Failed to read error response:', textError);
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        
        console.error(`GET /api/shaft-inspections failed with status ${response.status}:`, errorText);
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication failed');
          return { success: false, error: 'Authentication required. Please sign in again.' };
        }
        
        // Provide more specific error messages based on status code
        let userFriendlyError = errorText;
        if (response.status === 404) {
          userFriendlyError = 'Shaft inspections endpoint not found. Please check if the API is running.';
        } else if (response.status >= 500) {
          userFriendlyError = 'Server error. Please try again later.';
        } else if (!errorText) {
          userFriendlyError = `Request failed with status ${response.status}`;
        }
        
        return { success: false, error: userFriendlyError };
      }
      
      const data = await response.json();
      console.log('Shaft inspections fetched successfully:', data);
      
      // Ensure we return an array
      const inspections = Array.isArray(data) ? data : [];
      return { success: true, data: inspections };
    } catch (error) {
      console.error('Error fetching shaft inspections:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Fetch shaft inspection details by ID
   * GET /api/shaft-inspections/{id}
   */
  async fetchShaftInspectionById(inspectionId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    
    if (!token) {
      console.error('No authentication token found');
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    
    try {
      console.log('Fetching shaft inspection details for ID:', inspectionId);
      const response = await fetch(`/api/shaft-inspections/${inspectionId}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (textError) {
          console.error('Failed to read error response:', textError);
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        
        console.error(`GET /api/shaft-inspections/${inspectionId} failed with status ${response.status}:`, errorText);
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication failed');
          return { success: false, error: 'Authentication required. Please sign in again.' };
        }
        
        // Provide more specific error messages based on status code
        let userFriendlyError = errorText;
        if (response.status === 404) {
          userFriendlyError = 'Shaft inspection not found.';
        } else if (response.status >= 500) {
          userFriendlyError = 'Server error. Please try again later.';
        } else if (!errorText) {
          userFriendlyError = `Request failed with status ${response.status}`;
        }
        
        return { success: false, error: userFriendlyError };
      }
      
      const data = await response.json();
      console.log('Shaft inspection details fetched successfully:', data);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching shaft inspection details:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Mark a contravention fine as paid
   * PUT /api/contraventions/{id}/mark-fine-paid?amount={amount}
   */
  async markFinePaid(
    contraventionId: string,
    amount: number
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    
    try {
      const safeId = encodeURIComponent(contraventionId);
      const safeAmount = encodeURIComponent(amount.toString());
      
      const response = await fetch(`/api/contraventions/${safeId}/mark-fine-paid?amount=${safeAmount}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to mark fine as paid' };
      }

      const data = await response.json().catch(() => ({}));
      console.log('Fine marked as paid successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error marking fine as paid:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Suspend a shaft assignment for SHE with a given status
   * PUT /api/shaft-assignments/{id}/suspend-for-she?status={status}
   */
  async suspendShaftForSHE(
    shaftAssignmentId: string | number,
    status: string
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { success: false, error: 'Authentication required. Please sign in first.' };
    }
    try {
      const safeId = encodeURIComponent(String(shaftAssignmentId));
      const safeStatus = encodeURIComponent(status);
      const response = await fetch(`/api/shaft-assignments/${safeId}/suspend-for-she?status=${safeStatus}`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to update shaft assignment status' };
      }

      const data = await response.json().catch(() => ({}));
      return { success: true, data };
    } catch (error) {
      console.error('Error suspending shaft for SHE:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Fetch all companies for dropdown
   * GET /api/companies
   */
  async fetchAllCompanies(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const response = await fetch('/api/companies', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch companies:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  /**
   * Fetch all miners for dropdown
   * GET /api/miners
   */
  async fetchAllMinersForDropdown(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const response = await fetch('/api/miners', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch miners:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching miners:', error);
      return [];
    }
  }



  /**
   * Decrement miner shaft number
   * PUT /api/miners/{minerId}/decrement-shaftnumber
   */
  async decrementMinerShaftNumber(minerId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const safeMinerId = encodeURIComponent(String(minerId));
      const response = await fetch(`/api/miners/${safeMinerId}/decrement-shaftnumber`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Miner not found' };
        }
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to decrement miner shaft number' };
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text.trim()) {
          const data = JSON.parse(text);
          return { success: true, data };
        }
      }
      
      return { success: true, data: { message: 'Miner shaft number decremented successfully' } };
    } catch (error) {
      console.error('Error decrementing miner shaft number:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Decrement company shaft number
   * PUT /api/companies/{companyId}/decrement-shaftnumber
   */
  async decrementCompanyShaftNumber(companyId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const safeCompanyId = encodeURIComponent(String(companyId));
      const response = await fetch(`/api/companies/${safeCompanyId}/decrement-shaftnumber`, {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Company not found' };
        }
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to decrement company shaft number' };
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text.trim()) {
          const data = JSON.parse(text);
          return { success: true, data };
        }
      }
      
      return { success: true, data: { message: 'Company shaft number decremented successfully' } };
    } catch (error) {
      console.error('Error decrementing company shaft number:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  /**
   * Fetch miner details by ID
   * GET /api/miners/{id}
   */
  async fetchMinerById(minerId: string | number): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    try {
      const safeId = encodeURIComponent(String(minerId));
      const response = await fetch(`/api/miners/${safeId}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Miner not found' };
        }
        const errorText = await response.text().catch(() => 'Request failed');
        return { success: false, error: errorText || 'Failed to fetch miner details' };
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text.trim()) {
          const data = JSON.parse(text);
          return { success: true, data };
        }
      }
      
      return { success: false, error: 'Empty or invalid response' };
    } catch (error) {
      console.error('Error fetching miner details:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }


}
export const authClient = new AuthClient();
