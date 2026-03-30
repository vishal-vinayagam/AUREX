/**
 * Contacts Page - AUREX Civic Issue Reporting System
 * 
 * Browse and search emergency contacts and helplines.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactService } from '../../services/contactService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Phone,
  MapPin,
  ChevronLeft,
  ExternalLink,
  Star
} from 'lucide-react';

interface Contact {
  _id: string;
  name: string;
  role?: string;
  category: string;
  description?: string;
  phoneNumbers: Array<{
    number: string;
    label: string;
    isTollFree: boolean;
    isAvailable24x7: boolean;
  }>;
  address?: {
    city?: string;
    state?: string;
  };
  isEmergency: boolean;
}

const categoryIcons: Record<string, string> = {
  emergency: '🚨',
  police: '👮',
  fire: '🔥',
  healthcare: '🏥',
  women_safety: '👩',
  child_safety: '👶',
  senior_citizen: '👴',
  disaster: '⚠️',
  transport: '🚌',
  legal: '⚖️',
  utilities: '💡',
  municipal: '🏛️',
  other: '📞',
};

export default function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contactsData, categoriesData] = await Promise.all([
        contactService.getContacts({ limit: 50 }),
        contactService.getCategories()
      ]);
      setContacts(contactsData.contacts);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Emergency Contacts</h1>
          <p className="text-muted-foreground">Important helplines and contacts</p>
        </div>
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

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Phone className="w-4 h-4" />
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <span>{categoryIcons[cat.id] || '📞'}</span>
            <span className="capitalize">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <Card key={contact._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      contact.isEmergency ? 'bg-red-100' : 'bg-muted'
                    }`}>
                      {categoryIcons[contact.category] || '📞'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{contact.name}</h3>
                        {contact.isEmergency && (
                          <Badge variant="destructive">Emergency</Badge>
                        )}
                      </div>
                      {contact.role && (
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                      )}
                      {contact.description && (
                        <p className="text-sm text-muted-foreground">{contact.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {contact.phoneNumbers.map((phone, idx) => (
                          <Badge
                            key={idx}
                            variant={phone.isTollFree ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleCall(phone.number)}
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            {phone.number}
                            {phone.isTollFree && ' (Toll-free)'}
                          </Badge>
                        ))}
                      </div>
                      {contact.address?.city && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {contact.address.city}
                          {contact.address.state && `, ${contact.address.state}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={contact.isEmergency ? 'destructive' : 'default'}
                    onClick={() => handleCall(contact.phoneNumbers[0]?.number)}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Phone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No contacts found</h3>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}