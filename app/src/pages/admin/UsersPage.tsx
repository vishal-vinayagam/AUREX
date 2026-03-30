/**
 * Admin Users Page - AUREX Civic Issue Reporting System
 * 
 * Manage system users and administrators.
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  User,
  Shield,
  MoreHorizontal,
  Mail,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock users data
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '9876543210', role: 'user', isActive: true, isVerified: true, createdAt: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211', role: 'admin', isActive: true, isVerified: true, createdAt: '2024-01-10' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', phone: '9876543212', role: 'user', isActive: false, isVerified: true, createdAt: '2024-02-01' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '9876543213', role: 'user', isActive: true, isVerified: false, createdAt: '2024-02-15' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', phone: '9876543214', role: 'superadmin', isActive: true, isVerified: true, createdAt: '2023-12-01' },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground">View and manage system users</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{mockUsers.length} users</Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: mockUsers.length, color: 'bg-blue-500' },
          { label: 'Admins', value: mockUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length, color: 'bg-purple-500' },
          { label: 'Active', value: mockUsers.filter(u => u.isActive).length, color: 'bg-green-500' },
          { label: 'Pending', value: mockUsers.filter(u => !u.isVerified).length, color: 'bg-yellow-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'} className="text-xs capitalize">
                        {user.role}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.isVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}