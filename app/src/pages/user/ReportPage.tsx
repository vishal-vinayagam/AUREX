/**
 * Report Page - AUREX Civic Issue Reporting System
 * 
 * Form for submitting new civic issue reports.
 */

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { reportService } from '../../services/reportService';
import { communityService } from '../../services/communityService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  MapPin,
  AlertTriangle,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle
} from 'lucide-react';

const categories = [
  { id: 'roads', name: 'Roads & Potholes', icon: '🛣️' },
  { id: 'water_supply', name: 'Water Supply', icon: '💧' },
  { id: 'electricity', name: 'Electricity', icon: '⚡' },
  { id: 'sanitation', name: 'Sanitation', icon: '🧹' },
  { id: 'garbage', name: 'Garbage Collection', icon: '🗑️' },
  { id: 'streetlights', name: 'Street Lights', icon: '💡' },
  { id: 'public_transport', name: 'Public Transport', icon: '🚌' },
  { id: 'parks', name: 'Parks & Recreation', icon: '🌳' },
  { id: 'noise_pollution', name: 'Noise Pollution', icon: '🔊' },
  { id: 'air_pollution', name: 'Air Pollution', icon: '🌫️' },
  { id: 'illegal_construction', name: 'Illegal Construction', icon: '🚧' },
  { id: 'traffic', name: 'Traffic Issues', icon: '🚦' },
  { id: 'safety', name: 'Public Safety', icon: '🛡️' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'other', name: 'Other', icon: '📋' },
];

const priorities = [
  { id: 'low', name: 'Low', color: 'bg-green-100 text-green-800' },
  { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'high', name: 'High', color: 'bg-orange-100 text-orange-800' },
  { id: 'emergency', name: 'Emergency', color: 'bg-red-100 text-red-800' },
] as const;

type FieldType = 'text' | 'number' | 'select' | 'textarea' | 'time' | 'datetime';

interface CategoryField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
}

const categoryFieldConfig: Record<string, CategoryField[]> = {
  roads: [
    { key: 'problemType', label: 'Problem Type', type: 'select', options: ['Pothole', 'Road crack', 'Road sinking', 'Waterlogging'] },
    { key: 'roadName', label: 'Road Name', type: 'text', placeholder: 'Road name' },
    { key: 'landmark', label: 'Nearest Landmark', type: 'text', placeholder: 'Nearest landmark' },
    { key: 'damageSize', label: 'Damage Size', type: 'select', options: ['Small', 'Medium', 'Large'] },
    { key: 'accidentRisk', label: 'Accident Risk', type: 'select', options: ['Yes', 'No'] }
  ],
  water_supply: [
    { key: 'issueType', label: 'Issue Type', type: 'select', options: ['No water', 'Leakage', 'Dirty water', 'Low pressure'] },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 2 days' },
    { key: 'waterQuality', label: 'Water Quality', type: 'select', options: ['Clean', 'Muddy', 'Smelly'] }
  ],
  electricity: [
    { key: 'issueType', label: 'Issue Type', type: 'select', options: ['Power cut', 'Voltage issue', 'Transformer damage'] },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' },
    { key: 'poleNumber', label: 'Pole Number', type: 'text', placeholder: 'Pole number' },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 3 hours' },
    { key: 'dangerous', label: 'Dangerous?', type: 'select', options: ['Yes', 'No'] }
  ],
  sanitation: [
    { key: 'issueType', label: 'Issue Type', type: 'select', options: ['Drain blockage', 'Sewage overflow', 'Public toilet dirty'] },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' },
    { key: 'smellLevel', label: 'Smell Level', type: 'select', options: ['Low', 'Medium', 'Severe'] },
    { key: 'healthRisk', label: 'Health Risk', type: 'select', options: ['Yes', 'No'] }
  ],
  garbage: [
    { key: 'garbageType', label: 'Garbage Type', type: 'select', options: ['Household', 'Plastic', 'Medical', 'Dead animal'] },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' },
    { key: 'collectionDelayDays', label: 'Collection Delay (Days)', type: 'number', placeholder: 'Days' },
    { key: 'spreading', label: 'Spreading?', type: 'select', options: ['Yes', 'No'] }
  ],
  streetlights: [
    { key: 'poleNumber', label: 'Pole Number', type: 'text', placeholder: 'Pole number' },
    { key: 'lightCondition', label: 'Light Condition', type: 'select', options: ['Not working', 'Blinking', 'Broken'] },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' },
    { key: 'sinceWhen', label: 'Since When?', type: 'text', placeholder: 'e.g., 1 week' }
  ],
  public_transport: [
    { key: 'transportType', label: 'Transport Type', type: 'select', options: ['Bus', 'Train', 'Metro'] },
    { key: 'vehicleNumber', label: 'Vehicle Number', type: 'text', placeholder: 'Vehicle number' },
    { key: 'route', label: 'Route (From → To)', type: 'text', placeholder: 'From - To' },
    { key: 'stopName', label: 'Stop Name', type: 'text', placeholder: 'Stop name' },
    { key: 'incidentTime', label: 'Time of Incident', type: 'time' },
    { key: 'issueType', label: 'Issue Type', type: 'select', options: ['Did not stop', 'Overcrowded', 'Rash driving'] }
  ],
  parks: [
    { key: 'parkName', label: 'Park Name', type: 'text', placeholder: 'Park name' },
    { key: 'issueType', label: 'Issue Type', type: 'select', options: ['Damaged equipment', 'Dirty', 'No water', 'Lights not working'] },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' },
    { key: 'safetyConcern', label: 'Safety Concern', type: 'select', options: ['Yes', 'No'] }
  ],
  noise_pollution: [
    { key: 'noiseSource', label: 'Noise Source', type: 'select', options: ['Construction', 'Loudspeaker', 'Traffic', 'Industry'] },
    { key: 'timeOfDay', label: 'Time', type: 'select', options: ['Day', 'Night'] },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 2 hours' },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' }
  ],
  air_pollution: [
    { key: 'pollutionSource', label: 'Pollution Source', type: 'select', options: ['Factory smoke', 'Vehicle smoke', 'Burning waste'] },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' },
    { key: 'breathingDifficulty', label: 'Breathing Difficulty?', type: 'select', options: ['Yes', 'No'] }
  ],
  illegal_construction: [
    { key: 'constructionType', label: 'Construction Type', type: 'select', options: ['Building', 'Shop', 'Road encroachment'] },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'Location' },
    { key: 'blockingPublicPath', label: 'Blocking Public Path?', type: 'select', options: ['Yes', 'No'] },
    { key: 'sinceWhen', label: 'Since When?', type: 'text', placeholder: 'e.g., 3 months' }
  ],
  traffic: [
    { key: 'issueType', label: 'Issue Type', type: 'select', options: ['Signal not working', 'Traffic jam', 'No zebra crossing'] },
    { key: 'roadName', label: 'Road Name', type: 'text', placeholder: 'Road name' },
    { key: 'peakTime', label: 'Peak Time', type: 'text', placeholder: 'e.g., 6-8 PM' },
    { key: 'accidentRisk', label: 'Accident Risk', type: 'select', options: ['Yes', 'No'] }
  ],
  safety: [
    { key: 'issueType', label: 'Issue Type', type: 'select', options: ['Street harassment', 'Suspicious activity', 'Unsafe area'] },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'Location' },
    { key: 'time', label: 'Time', type: 'text', placeholder: 'e.g., 9:30 PM' },
    { key: 'emergencyLevel', label: 'Emergency Level', type: 'select', options: ['Low', 'Medium', 'High'] }
  ],
  healthcare: [
    { key: 'facilityName', label: 'Facility Name', type: 'text', placeholder: 'Facility name' },
    { key: 'issueType', label: 'Issue Type', type: 'select', options: ['No doctor', 'Dirty hospital', 'No medicine', 'Overcrowding'] },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' },
    { key: 'emergency', label: 'Emergency?', type: 'select', options: ['Yes', 'No'] }
  ],
  education: [
    { key: 'institutionName', label: 'Institution Name', type: 'text', placeholder: 'Institution name' },
    { key: 'issueType', label: 'Issue Type', type: 'select', options: ['Poor infrastructure', 'No teachers', 'Unsafe building'] },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' }
  ],
  other: [
    { key: 'customIssueType', label: 'Custom Issue Type', type: 'text', placeholder: 'Issue type' },
    { key: 'areaName', label: 'Area Name', type: 'text', placeholder: 'Area name' },
    { key: 'additionalDetails', label: 'Additional Details', type: 'textarea', placeholder: 'Additional details' }
  ]
};

export default function ReportPage() {
  const { t } = useLanguage();
  const { success: showSuccess, error: showError } = useNotification();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as typeof priorities[number]['id'],
    isEmergency: false,
    location: {
      coordinates: [0, 0] as [number, number],
      address: '',
    },
    incidentAt: '',
    media: [] as Array<{ url: string; type: 'image' | 'video'; publicId: string }>,
    isAnonymous: false,
    isPublic: true,
    postToCommunity: true,
    contactName: '',
    contactPhone: '',
    categoryDetails: {} as Record<string, string>
  });

  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; preview: string }>>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const stepConfig = [
    { number: 1, title: 'Basic Info', description: 'Title & Category' },
    { number: 2, title: 'Details', description: 'Category Details' },
    { number: 3, title: 'L & M', description: 'Where & Evidence' },
    { number: 4, title: 'Contact', description: 'Contact Info' }
  ];

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      files.forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          showError(`${file.name} is too large. Max size is 10MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
          setUploadedFiles((prev) => [...prev, { file, preview: ev.target?.result as string }]);
        };
        reader.readAsDataURL(file);
      });
    },
    [showError]
  );

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const getCurrentLocation = useCallback(() => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          location: { ...prev.location, coordinates: [longitude, latitude] },
        }));
        setIsGettingLocation(false);
        showSuccess('Location captured successfully');
      },
      () => {
        showError('Unable to get your location. Please enter manually.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [showError, showSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      showError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload selected files first to Cloudinary and get persistent URLs
      const uploadedMedia =
        uploadedFiles.length > 0
          ? await reportService.uploadReportFiles(uploadedFiles.map((item) => item.file))
          : [];

      const reportData = {
        ...formData,
        media: uploadedMedia,
        incidentAt: formData.incidentAt || undefined,
        categoryDetails: formData.categoryDetails || {}
      };

      const createdReport = await reportService.createReport(reportData);

      if (formData.postToCommunity) {
        const communityPriority =
          formData.priority === 'high' || formData.priority === 'emergency'
            ? 'high'
            : formData.priority === 'medium'
            ? 'medium'
            : 'normal';
        const communityCategory = formData.isEmergency ? 'emergency' : 'notice';
        await communityService.createPost({
          title: formData.title,
          category: communityCategory,
          description: formData.description,
          locationName: formData.location.address,
          eventDate: new Date().toISOString(),
          priority: communityPriority,
          allowComments: true,
          content: formData.description,
          media: uploadedMedia,
          relatedReportId: createdReport._id
        });
      }
      showSuccess(t('report.success'));
      navigate('/track');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } } | undefined;
      showError(error?.response?.data?.message ?? 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryDetailChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryDetails: {
        ...prev.categoryDetails,
        [key]: value
      }
    }));
  };

  const isCategoryDetailsComplete = () => {
    const fields = categoryFieldConfig[formData.category] || [];
    if (fields.length === 0) return true;
    return !fields.some((field) => {
      const value = formData.categoryDetails[field.key];
      return value === undefined || value === null || String(value).trim() === '';
    });
  };

  const renderCategoryField = (field: CategoryField) => {
    const value = formData.categoryDetails[field.key] ?? '';
    if (field.type === 'select') {
      return (
        <Select value={value} onValueChange={(val) => handleCategoryDetailChange(field.key, val)}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <Textarea
          value={value}
          placeholder={field.placeholder || field.label}
          onChange={(e) => handleCategoryDetailChange(field.key, e.target.value)}
          rows={3}
        />
      );
    }

    return (
      <Input
        type={field.type === 'number' ? 'number' : field.type === 'time' ? 'time' : 'text'}
        value={value}
        placeholder={field.placeholder || field.label}
        onChange={(e) => handleCategoryDetailChange(field.key, e.target.value)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t('report.title')}</h1>
            <p className="text-muted-foreground text-sm">Submit a civic issue (Step {step}/4)</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Progress Steps - Simple */}
        <div className="mb-8">
          <div className="flex justify-between items-center gap-1">
            {stepConfig.map((s) => (
              <div key={s.number} className="flex-1">
                <div
                  className={`h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                    step >= s.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s.number ? '✓' : s.number}
                </div>
                <p className="text-xs text-center mt-1 font-medium">{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Basic Information */}
          {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t('report.issueTitle')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Pothole on Main Street"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.title.length}/200
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('report.description')} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/5000
                </p>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label>
                  {t('report.category')} <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          category: cat.id,
                          categoryDetails: {}
                        })
                      }
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.category === cat.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{cat.icon}</span>
                      <span className="text-xs font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!formData.title || !formData.description || !formData.category}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

          {/* STEP 2: Category Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(categoryFieldConfig[formData.category] || []).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(categoryFieldConfig[formData.category] || []).map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label className="font-medium">
                          {field.label} <span className="text-red-500">*</span>
                        </Label>
                        {renderCategoryField(field)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="font-medium">Additional Details</Label>
                    <Textarea
                      value={formData.categoryDetails.additionalDetails || ''}
                      placeholder="Enter any additional details about the issue"
                      onChange={(e) =>
                        handleCategoryDetailChange('additionalDetails', e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => setStep(3)}
                    disabled={!isCategoryDetailsComplete()}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: Location & Media */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Location & Evidence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="space-y-2">
                  <Label>{t('report.location')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Capture Current Location
                      </>
                    )}
                  </Button>
                  {formData.location.coordinates[0] !== 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800 text-xs">
                      <p className="font-semibold text-green-900 dark:text-green-300">
                        ✓ Location Captured
                      </p>
                      <p className="text-green-700 dark:text-green-400">
                        Lat: {formData.location.coordinates[1].toFixed(6)}, Long:{' '}
                        {formData.location.coordinates[0].toFixed(6)}
                      </p>
                    </div>
                  )}
                  <Input
                    placeholder="Or enter address/landmark (optional)"
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, address: e.target.value },
                      })
                    }
                  />
                </div>

                {/* Date & Time */}
                <div className="space-y-2">
                  <Label>When did this happen?</Label>
                  <Input
                    type="datetime-local"
                    value={formData.incidentAt}
                    onChange={(e) => setFormData({ ...formData, incidentAt: e.target.value })}
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label>{t('report.priority')}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p.id })}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          formData.priority === p.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${p.color}`}>
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emergency Checkbox */}
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <Checkbox
                    id="emergency"
                    checked={formData.isEmergency}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isEmergency: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="emergency" className="font-medium text-red-900 dark:text-red-300 cursor-pointer">
                      This is an Emergency
                    </Label>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      Mark if immediate attention is required
                    </p>
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-2">
                  <Label>{t('report.media')}</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload photos/videos</p>
                    <p className="text-xs text-muted-foreground">Max 10MB per file</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Uploaded ({uploadedFiles.length})</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={file.preview}
                              alt={`Upload ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Community Post Option */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id="public"
                    checked={formData.postToCommunity}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isPublic: checked as boolean,
                        postToCommunity: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="public" className="cursor-pointer text-sm">
                    Share with Community
                  </Label>
                </div>

                {/* Navigation */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setStep(4)}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: Contact Information */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Respective Name (optional)</Label>
                    <Input
                      id="contactName"
                      placeholder="Full name"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number (optional)</Label>
                    <Input
                      id="contactPhone"
                      placeholder="10-digit phone number"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Anonymous Checkbox */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Checkbox
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isAnonymous: checked as boolean })
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="anonymous" className="cursor-pointer font-medium text-sm">
                      {t('report.anonymous')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Your info won't be visible to other users
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Report Summary</h3>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Title</p>
                      <p className="font-medium truncate">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{formData.category.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(3)}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('report.submit')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
