/**
 * Emergency Page - AUREX Civic Issue Reporting System
 * 
 * Emergency contacts and SOS functionality.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { contactService } from '../../services/contactService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Phone,
  AlertTriangle,
  Shield,
  Flame,
  Ambulance,
  Siren,
  Users,
  Baby,
  User,
  Bus,
  Scale,
  PhoneCall,
  ExternalLink,
  MapPin
} from 'lucide-react';

interface EmergencyContact {
  _id: string;
  name: string;
  category: string;
  phoneNumbers: Array<{
    number: string;
    label: string;
    isTollFree: boolean;
  }>;
  isEmergency: boolean;
  description?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  emergency: Siren,
  police: Shield,
  fire: Flame,
  healthcare: Ambulance,
  women_safety: Users,
  child_safety: Baby,
  senior_citizen: User,
  disaster: AlertTriangle,
  transport: Bus,
  legal: Scale,
  cybercrime: Shield,
};

export default function EmergencyPage() {
  const { t } = useLanguage();
  const { success: showSuccess } = useNotification();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllQuick, setShowAllQuick] = useState(false);

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const contacts = await contactService.getEmergencyContacts(20);
      setEmergencyContacts(contacts);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
    showSuccess('Dialing emergency number...');
  };

  const extraContacts: EmergencyContact[] = [
    {
      _id: 'india-112',
      name: 'National Emergency Number',
      category: 'emergency',
      phoneNumbers: [{ number: '112', label: 'All emergencies', isTollFree: true }],
      isEmergency: true,
      description: 'Unified emergency number (India)'
    },
    {
      _id: 'india-100',
      name: 'Police Helpline',
      category: 'police',
      phoneNumbers: [{ number: '100', label: 'Police', isTollFree: true }],
      isEmergency: true
    },
    {
      _id: 'india-101',
      name: 'Fire Services',
      category: 'fire',
      phoneNumbers: [{ number: '101', label: 'Fire', isTollFree: true }],
      isEmergency: true
    },
    {
      _id: 'india-102',
      name: 'Ambulance',
      category: 'healthcare',
      phoneNumbers: [{ number: '102', label: 'Ambulance', isTollFree: true }],
      isEmergency: true
    },
    {
      _id: 'india-108',
      name: 'Emergency Response',
      category: 'disaster',
      phoneNumbers: [{ number: '108', label: 'Emergency', isTollFree: true }],
      isEmergency: true
    },
    {
      _id: 'india-1091',
      name: 'Women Helpline',
      category: 'women_safety',
      phoneNumbers: [{ number: '1091', label: 'Women safety', isTollFree: true }],
      isEmergency: true
    },
    {
      _id: 'india-181',
      name: 'Women Helpline (All India)',
      category: 'women_safety',
      phoneNumbers: [{ number: '181', label: 'Women helpline', isTollFree: true }],
      isEmergency: true
    },
    {
      _id: 'india-1098',
      name: 'Childline',
      category: 'child_safety',
      phoneNumbers: [{ number: '1098', label: 'Childline', isTollFree: true }],
      isEmergency: true
    },
    {
      _id: 'india-1930',
      name: 'Cyber Crime Helpline',
      category: 'cybercrime',
      phoneNumbers: [{ number: '1930', label: 'Cybercrime', isTollFree: true }],
      isEmergency: true
    },
    {
      _id: 'india-15100',
      name: 'National Legal Aid Helpline',
      category: 'legal',
      phoneNumbers: [{ number: '15100', label: 'Legal aid', isTollFree: true }],
      isEmergency: true,
      description: 'Government legal services helpline'
    }
  ];

  const allContacts = useMemo(() => {
    const map = new Map<string, EmergencyContact>();
    [...extraContacts, ...emergencyContacts].forEach((contact) => {
      map.set(contact._id, contact);
    });
    return Array.from(map.values());
  }, [emergencyContacts]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizePhone = (value: string) => value.replace(/\D/g, '');

  const filteredContacts = useMemo(() => {
    if (!normalizedQuery) return allContacts;
    const queryDigits = normalizePhone(normalizedQuery);
    return allContacts.filter((contact) => {
      const nameMatch = contact.name.toLowerCase().includes(normalizedQuery);
      const numberMatch = queryDigits
        ? contact.phoneNumbers.some((phone) => normalizePhone(phone.number).includes(queryDigits))
        : false;
      return nameMatch || numberMatch;
    });
  }, [allContacts, normalizedQuery]);

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return filteredContacts.slice(0, 6);
  }, [filteredContacts, normalizedQuery]);

  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.category]) {
      acc[contact.category] = [];
    }
    acc[contact.category].push(contact);
    return acc;
  }, {} as Record<string, EmergencyContact[]>);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-red-600">{t('emergency.title')}</h1>
        <p className="text-muted-foreground">For immediate assistance, call emergency services</p>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name or number"
          className="h-11"
        />
        {suggestions.length > 0 && (
          <div className="rounded-xl border border-border bg-card shadow-sm">
            {suggestions.map((contact) => (
              <button
                key={contact._id}
                onClick={() => handleCall(contact.phoneNumbers[0]?.number)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {contact.phoneNumbers[0]?.number}
                    {contact.phoneNumbers[0]?.label ? ` • ${contact.phoneNumbers[0]?.label}` : ''}
                  </p>
                </div>
                <Phone className="h-4 w-4 text-primary" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SOS Button */}
      <Card className="bg-red-500 border-red-600">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">{t('emergency.sos')}</h2>
          <p className="text-red-100 text-sm mb-4">
            Press the button below for immediate emergency assistance
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg px-8 py-6"
            onClick={() => handleCall('112')}
          >
            <PhoneCall className="w-6 h-6 mr-2" />
            CALL 112
          </Button>
          <p className="text-red-100 text-xs mt-3">
            India's unified emergency number
          </p>
        </CardContent>
      </Card>

      {/* Quick Emergency Numbers */}
      {(() => {
        const quickNumbers = [
          { number: '100', name: 'Police', icon: Shield, color: 'bg-blue-500' },
          { number: '101', name: 'Fire', icon: Flame, color: 'bg-orange-500' },
          { number: '102', name: 'Ambulance', icon: Ambulance, color: 'bg-green-500' },
          { number: '108', name: 'Disaster', icon: AlertTriangle, color: 'bg-red-500' },
          { number: '1091', name: 'Women', icon: Users, color: 'bg-pink-500' },
          { number: '1098', name: 'Childline', icon: Baby, color: 'bg-indigo-500' },
          { number: '181', name: 'Women Helpline', icon: Users, color: 'bg-rose-500' },
          { number: '1930', name: 'Cyber Crime', icon: Shield, color: 'bg-slate-600' },
          { number: '112', name: 'National Emergency', icon: Siren, color: 'bg-red-600' },
          { number: '102', name: 'Maternal Helpline', icon: Ambulance, color: 'bg-emerald-500' },
          { number: '1090', name: 'Women Safety', icon: Users, color: 'bg-fuchsia-500' },
          { number: '1097', name: 'AIDS Helpline', icon: PhoneCall, color: 'bg-sky-500' },
          { number: '1363', name: 'Tourist Helpline', icon: MapPin, color: 'bg-teal-500' },
          { number: '14567', name: 'Senior Citizen', icon: User, color: 'bg-amber-500' },
          { number: '15100', name: 'Legal Aid', icon: Scale, color: 'bg-zinc-600' },
          { number: '1906', name: 'Gas Leak', icon: Flame, color: 'bg-orange-600' },
          { number: '139', name: 'Railway Helpline', icon: Bus, color: 'bg-indigo-600' },
          { number: '1070', name: 'Disaster (NDRF)', icon: AlertTriangle, color: 'bg-rose-600' },
          { number: '1096', name: 'Poison Control', icon: AlertTriangle, color: 'bg-lime-600' },
          { number: '1077', name: 'Relief Commissioner', icon: Shield, color: 'bg-cyan-600' },
        ];

        const visibleNumbers = showAllQuick ? quickNumbers : quickNumbers.slice(0, 8);

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {visibleNumbers.map((item) => (
                <button
                  key={`${item.number}-${item.name}`}
                  onClick={() => handleCall(item.number)}
                  className="rounded-2xl border border-border bg-card px-4 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                >
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{item.number}</p>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAllQuick((prev) => !prev)}
                className="rounded-full"
              >
                {showAllQuick ? 'View less' : 'View more'}
              </Button>
            </div>
          </div>
        );
      })()}

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Safety Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Stay calm and assess the situation before calling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Provide clear location details to emergency responders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Follow instructions given by emergency personnel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Keep emergency numbers saved in your phone</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
