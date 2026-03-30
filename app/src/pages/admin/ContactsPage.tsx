/**
 * Admin Contacts Page - AUREX Civic Issue Reporting System
 * 
 * Manage emergency contacts and helplines.
 */

import React, { useEffect, useState } from 'react';
import { contactService } from '../../services/contactService';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Search,
  Phone,
  Edit2,
  Trash2,
  Star,
  MapPin
} from 'lucide-react';

interface Contact {
  _id: string;
  name: string;
  role?: string;
  category: string;
  description?: string;
  phoneNumbers: Array<{
    number: string;
    isTollFree: boolean;
  }>;
  isEmergency: boolean;
  isActive: boolean;
}

export default function AdminContactsPage() {
  const { success: showSuccess, error: showError } = useNotification();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // dialog/form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{id:string;name:string}>>([]);
  const [formState, setFormState] = useState<{
    name: string;
    category: string;
    role?: string;
    email?: string;
    description?: string;
    phone: string;
    isEmergency: boolean;
    isActive: boolean;
  }>({
    name: '',
    category: '',
    role: undefined,
    email: '',
    description: '',
    phone: '',
    isEmergency: false,
    isActive: true
  });

  useEffect(() => {
    fetchContacts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await contactService.getCategories();
      // response contains objects with id/name, keep as-is
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load contact categories', err);
    }
  };

  const fetchContacts = async () => {
    try {
      const data = await contactService.getContacts({ limit: 50 });
      setContacts(data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingContactId(null);
    setFormState({
      name: '',
      category: '',
      role: undefined,
      email: '',
      description: '',
      phone: '',
      isEmergency: false,
      isActive: true
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContactId(contact._id);
    setFormState({
      name: contact.name,
      category: contact.category,
      role: (contact as any).role || undefined,
      email: (contact as any).emails?.[0]?.email || '',
      description: contact.description || '',
      phone: contact.phoneNumbers[0]?.number || '',
      isEmergency: contact.isEmergency,
      isActive: contact.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await contactService.deleteContact(id);
      showSuccess('Contact deleted');
      fetchContacts();
    } catch (error) {
      showError('Failed to delete contact');
    }
  };

  const handleSave = async () => {
    // simple validation
    if (!formState.role || formState.role.trim() === '') {
      showError('Role/officer name is required');
      return;
    }

    const payload: any = {
      name: formState.name,
      category: formState.category,
      role: formState.role,
      description: formState.description,
      phoneNumbers: [{ number: formState.phone }],
      emails: formState.email ? [{ email: formState.email }] : [],
      isEmergency: formState.isEmergency,
      isActive: formState.isActive
    };

    try {
      if (editingContactId) {
        await contactService.updateContact(editingContactId, payload as any);
        showSuccess('Contact updated');
      } else {
        await contactService.createContact(payload as any);
        showSuccess('Contact added');
      }
      fetchContacts();
      setIsDialogOpen(false);
    } catch (err) {
      showError('Failed to save contact');
      console.error(err);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Contacts</h1>
          <p className="text-muted-foreground">Emergency contacts and helplines</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contacts List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredContacts.length > 0 ? (
            <div className="divide-y">
              {filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center justify-between p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      contact.isEmergency ? 'bg-red-100' : 'bg-muted'
                    }`}>
                      <Phone className={`w-5 h-5 ${contact.isEmergency ? 'text-red-600' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{contact.name}</p>
                        {contact.isEmergency && (
                          <Badge variant="destructive">Emergency</Badge>
                        )}
                        {!contact.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      {contact.role && (
                        <p className="text-xs text-muted-foreground">{contact.role}</p>
                      )}
                      <p className="text-xs text-muted-foreground capitalize">
                        {contact.category.replace('_', ' ')}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {contact.phoneNumbers.map((phone, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {phone.number}
                            {phone.isTollFree && ' (Toll-free)'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(contact)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDeleteId(contact._id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Phone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No contacts found</h3>
            </div>
          )}
      </CardContent>
      {/* dialog for add/edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent aria-describedby="contact-dialog-desc" className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContactId ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            <DialogDescription id="contact-dialog-desc">
              Provide details for the contact/helpline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Contact name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role / Officer Name</label>
              <Input
                value={formState.role || ''}
                onChange={(e) => setFormState((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="Primary contact role (required)"
                required
              />
              <p className="text-xs text-muted-foreground">
                This is the main field users will see when selecting whom to report to.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email (optional)</label>
              <Input
                type="email"
                value={formState.email || ''}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. officer@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Short description (optional)</label>
              <Input
                value={formState.description || ''}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="A note about this contact"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formState.category}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}
                disabled={!!editingContactId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formState.phone}
                onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Primary number"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formState.isEmergency}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({ ...prev, isEmergency: !!checked }))
                  }
                />
                <span className="text-sm">Emergency contact</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Mark this if the number is a 24/7 emergency hotline.
              </p>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formState.isActive}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({ ...prev, isActive: !!checked }))
                  }
                />
                <span className="text-sm">Active</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Uncheck to temporarily disable the contact from appearing.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{editingContactId ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* delete confirmation dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent aria-describedby="confirm-delete-desc">
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription id="confirm-delete-desc">
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (confirmDeleteId) {
                  await handleDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </Card>
    </div>
  );
}
